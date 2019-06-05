/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EventEmitter } from 'events';

import * as jsonpatch from 'json-merge-patch';
import cloneDeep = require('lodash.clonedeep');
import Queue from 'p-queue';

import { CosmosDbClient } from '../client';
import IronTaskError, { ErrorCode } from '../error';
import { AnnotatedResponse } from '../interceptor';
import retry from '../utils/retry';

import { ResolvedTaskDocument } from './document';
import taskStatus, { isFinished } from './status';
import { SerializedTask, TaskBase, TaskStatus } from './types';

declare interface TaskData<T> {
  on(event: 'updated', listener: () => void): this;
}

class TaskData<T> extends EventEmitter implements TaskBase<T> {
  get id(): string {
    return this.document.id;
  }

  get type(): string {
    return this.document.config.type;
  }

  get status(): TaskStatus {
    return taskStatus(this.document.config, this.timestamp());
  }

  get enabled(): boolean {
    return this.document.config.enabled;
  }

  get createTime(): Date {
    return new Date(this.document.config.createTime);
  }

  get nextRunTime(): Date | undefined {
    return this.document.config.nextRunTime !== undefined
      ? new Date(this.document.config.nextRunTime)
      : undefined;
  }

  get lastRun():
    | { startTime: Date; finishTime: Date; succeeded: boolean }
    | undefined {
    if (!this.document.config.lastRun) {
      return undefined;
    }

    return {
      startTime: new Date(this.document.config.lastRun.startTime),
      finishTime: new Date(this.document.config.lastRun.finishTime),
      succeeded: this.document.config.lastRun.succeeded
    };
  }

  get currentRunStartTime(): Date | undefined {
    return this.document.config.currentRunStartTime !== undefined
      ? new Date(this.document.config.currentRunStartTime)
      : undefined;
  }

  get deliveries(): number {
    return this.document.config.deliveries;
  }

  get attempts(): number {
    return this.document.config.attempts;
  }

  get runs(): number {
    return this.document.config.runs;
  }

  get payload(): T {
    return this.document.payload;
  }

  set payload(payload: T) {
    this.document.payload = payload;
  }

  get interval(): string | number | undefined {
    return this.document.config.interval;
  }

  get document(): ResolvedTaskDocument<T> {
    return this._document;
  }

  get ref(): string {
    return this._client.documentRef(this.type, this.id);
  }

  /**
   * Cosmos DB client
   */
  private _client: CosmosDbClient;

  /**
   * Internally editable version of the document which represents the user's
   * desired document state.
   */
  private _document: ResolvedTaskDocument<T>;

  /**
   * A copy of the payload from the server which does not get modified by
   * user changes. This allows us to efficiently perform payload updates
   * without having to refetch the document or accidentally save changes the
   * user made.
   */
  private _serverPayload?: T;

  /**
   * Equivalent to the server payload, but it only reflects the payload at the
   * last time the user updated the payload (or from initial load). This is
   * used to compute the patch to apply to the payload using a consistent base
   * rather than a server payload that has potentially changed from what the
   * user is working with.
   */
  private _referencePayload: T;

  /**
   * Concurrency control mechanism to prevent us from trying to run multiple
   * updates to the same task at the same time. This will force them to
   * sequentialize, while still letting ligh priority requests (like lock
   * renewals) through in a timely manner.
   */
  private _updateQueue: Queue = new Queue({ concurrency: 1 });

  /**
   * We block multiple concurrent updates to the payload because it causes
   * weird behavior with how patches get applied to the user payload.
   * Generally speaking, users should either be modifying the payload OR
   * saving it at any point in time, not both simultaneously.
   */
  private _updatingPayload: boolean = false;

  /**
   * The highest unix ms time we have seen while working with this task. We
   * use this to make sure that negative clock skew (i.e. our clock skews to
   * an earlier time) does not mess up our understanding of processing this
   * task.
   */
  private _latestTime: number = Date.now();

  constructor(
    client: CosmosDbClient,
    document: ResolvedTaskDocument<T>,
    isComplete: boolean = true
  ) {
    super();

    this._client = client;
    this._document = this._normalizeDocument(document);

    // The server and reference payloads cannot be the same as the main
    // document payload because the user can update it at any time. However,
    // we don't need to keep separate clones of the payload for each because
    // the inner contents of both are immutable.
    this._referencePayload = cloneDeep(this._document.payload);
    if (isComplete) {
      // We only set the  initially if the document is complete because we
      // don't want to overwrite the document on the server with
      // incomplete data.
      this._serverPayload = this._referencePayload;
    }
  }

  /**
   * Get the current unix ms time for this task. We use this instead of the
   * built in Date.now(), because the latter is not a monotonic clock and can
   * move backwards, which messes with state computations.
   */
  timestamp(): number {
    this._latestTime = Math.max(this._latestTime, Date.now());
    return this._latestTime;
  }

  /**
   * Saves the current payload as well as any other changes specified.
   *
   * @param changes       Function producing a partial change set to update
   *                      the task data. All data but the payload may be set.
   *                      The function is called for each attempt to patch the
   *                      task with the current task state. If you want to
   *                      cancel the operation due to the current document
   *                      state, simply throw an error and it will get passed
   *                      back to you.
   * @param highPriority  Optional boolean which will schedule this above
   *                      other requests that are pending.
   */
  async patchWithPayload(
    changes: (doc: ResolvedTaskDocument<T>) => TaskPatch = () => ({}),
    highPriority?: boolean
  ) {
    // Don't do the save if the payload is already being updated
    if (this._updatingPayload) {
      throw new IronTaskError(ErrorCode.TASK_ALREADY_SAVING_PAYLOAD);
    }

    try {
      this._updatingPayload = true;

      // We take the patch to apply from the payload at the beginning of
      // the operation because that's the state from which the payload
      // changes were intended (even if additional changes come in later).
      const payloadPatch = jsonpatch.generate(
        this._referencePayload,
        this.payload
      );
      return await this._patchInternal(changes, highPriority, payloadPatch);
    } finally {
      this._updatingPayload = false;
    }
  }

  /**
   * Applies a specific patch update to the task for system-controlled data.
   *
   * @param changes       Function producing a partial change set to update
   *                      the task data. All data but the payload may be set.
   *                      The function is called for each attempt to patch the
   *                      task with the current task state. If you want to
   *                      cancel the operation due to the current document
   *                      state, simply throw an error and it will get passed
   *                      back to you.
   * @param highPriority  Optional boolean which will schedule this above
   *                      other requests that are pending.
   */
  async patch(
    changes: (doc: ResolvedTaskDocument<T>) => TaskPatch,
    highPriority?: boolean
  ) {
    return this._patchInternal(changes, highPriority);
  }

  private async _patchInternal(
    changes: (doc: ResolvedTaskDocument<T>) => TaskPatch,
    highPriority?: boolean,
    payloadPatch?: any
  ): Promise<AnnotatedResponse<void>> {
    let ruConsumption = 0;

    // If the payload is being patched, we take a copy of it to use as the
    // reference payload for the next patch we do
    const nextReferencePayload = payloadPatch
      ? cloneDeep(this.payload)
      : undefined;

    await this._updateQueue.add(
      async () =>
        retry(
          async attempt => {
            // If the previous attempt failed, or we don't have the full
            // document, resync the document. After this point, we can
            // be sure that the server payload is populated
            if (attempt > 0 || !this._serverPayload) {
              await this.sync();
            }

            const payload = payloadPatch
              ? // We apply the payload patch to a clone of the server
                // payload to protect against corrupting the payload in
                // case of failure and to maintain the immutability of
                // the server payload overall.
                (jsonpatch.apply(
                  cloneDeep(this._serverPayload!),
                  payloadPatch
                ) as T)
              : // The document includes the user's payload, but we
                // don't want to use that because it could have
                // unintentional changes, so we take the server's copy.
                this._serverPayload!;

            const doc: ResolvedTaskDocument<T> = this._preProcessChange({
              ...this.document,
              config: {
                ...this.document.config,
                ...changes(this.document)
              },
              payload
            });

            const result = await this._client.replaceItem<
              ResolvedTaskDocument<T>
            >(doc, this.type);
            ruConsumption += result.ruConsumption || 0;

            // Update the document (promote the payload if we updated
            // it)
            this._updateDocument(result.result, nextReferencePayload);
          },
          err =>
            IronTaskError.is(
              err,
              ErrorCode.DATABASE_RESOURCE_CONCURRENCY_VIOLATION
            )
        ),
      { priority: highPriority ? 1 : 0 }
    );

    return {
      ruConsumption,
      result: undefined
    };
  }

  /**
   * Refetch the task from the database and update any data we can as
   * appropriate.
   */
  async sync(): Promise<
    AnnotatedResponse<ResolvedTaskDocument<T> | undefined>
  > {
    // TODO: do we want to fetch really large payloads every time? (payload
    // tag)
    const result = await this._client.getItem<ResolvedTaskDocument<T>>(
      this.id,
      this.type
    );

    // TODO: mark deleted if gone? (consistency problems?)
    if (result.result) {
      this._updateDocument(result.result);
    }

    return result;
  }

  /**
   * Delete the task from the database.
   */
  async delete(checkDelete: (doc: ResolvedTaskDocument<T>) => void = () => {}) {
    return this._updateQueue.add(async () => {
      checkDelete(this.document);
      return this._client.deleteItem(this.id, this.type);
    });
  }

  toJSON(): SerializedTask<T> {
    return {
      id: this.id,
      type: this.type,
      status: this.status,
      enabled: this.enabled,
      createTime: this.createTime.toISOString(),
      nextRunTime: this.nextRunTime && this.nextRunTime.toISOString(),
      lastRun: this.lastRun
        ? {
            startTime: this.lastRun.startTime.toISOString(),
            finishTime: this.lastRun.finishTime.toISOString(),
            succeeded: this.lastRun.succeeded
          }
        : undefined,
      currentRunStartTime:
        this.currentRunStartTime && this.currentRunStartTime.toISOString(),
      deliveries: this.deliveries,
      attempts: this.attempts,
      runs: this.runs,
      payload: this.payload,
      interval: this.interval
    };
  }

  /**
   * Handle an update to the server document.
   *
   * @param doc                   The new server document.
   * @param nextReferencePayload  If provided, updates the value of the
   *                              reference payload to match it so that future
   *                              payload changes will be computed against it.
   *                              This payload should be an independent copy of
   *                              the payload that is not subject to accidental
   *                              modification by the user or the system.
   */
  private _updateDocument(
    doc: ResolvedTaskDocument<T>,
    nextReferencePayload?: T
  ) {
    // Fix up any inconsistent document state
    const normalizedDoc = this._normalizeDocument(doc);

    // We mark the payload as changed if appropriate so we know of any
    // potential conflicts on save.
    this._serverPayload = normalizedDoc.payload;

    for (const [key, value] of Object.entries(normalizedDoc)) {
      if (key !== 'payload') {
        this._document[key] = value;
      }
    }

    // Update the reference payload to the value provided if present
    if (nextReferencePayload) {
      this._referencePayload = nextReferencePayload;
    }

    // Emit an event so clients know that the document was updated.
    this.emit('updated');
  }

  /**
   * Apply some tweaks to the document depending on the current state. For
   * example, set or clear the ttl as appropriate.
   */
  private _preProcessChange(
    doc: ResolvedTaskDocument<T>
  ): ResolvedTaskDocument<T> {
    // If the document has a ttl configured, make sure it's valid
    const finished = isFinished(doc.config, this.timestamp());

    if (doc.config.ttlMs !== undefined && finished) {
      if (doc.ttl === undefined) {
        // Set the ttl if a ttlMs is set, the task is finished, and we
        // don't have a ttl set already. TTL is defined in seconds in
        // Cosmos DB, so we round to the nearest second and make sure
        // it's a positive number.
        return {
          ...doc,
          ttl: Math.max(Math.round(doc.config.ttlMs / 1000), 1)
        };
      }
      {
        // If a ttl was previously set, update it based on the time that
        // this document is being saved. TTL in Cosmos DB is computed
        // from the last time the document was saved, but we want it to
        // be computed from the time the task was finished, so we have
        // to tweak the ttl value to keep the cleanup time consistent
        const deletionTime = (doc._ts + doc.ttl) * 1000;
        const newTtl = deletionTime - this.timestamp();
        return {
          ...doc,
          ttl: Math.max(Math.round(newTtl / 1000), 1)
        };
      }
    }
    if (
      (doc.config.ttlMs === undefined || !finished) &&
      doc.ttl !== undefined
    ) {
      // Clear the ttl if the ttl config is gone or the task is not
      // finished but we already have a ttl set
      return {
        ...doc,
        ttl: undefined
      };
    }

    return doc;
  }

  /**
   * There are some scenarios (such as when a lock is lost), where some
   * document information is not updated correctly. We fix it up here so that
   * all information is represented properly, even if it's not that way on the
   * database.
   */
  private _normalizeDocument(
    doc: ResolvedTaskDocument<T>
  ): ResolvedTaskDocument<T> {
    // If there is a lock on the task but it expired, increment the attempt
    // and delivery counts to reflect the fact that there is an additional
    // failed run
    if (doc.config.lockToken && doc.config.lockedUntilTime < this.timestamp()) {
      doc.config.deliveries += 1;
      doc.config.attempts += 1;
    }

    return doc;
  }

  /**
   * Clear out any listeners and in-progress operations
   */
  dispose() {
    this.removeAllListeners();
    this._updateQueue.clear();
  }
}

export type TaskPatch = Partial<ResolvedTaskDocument<any>['config']>;

export default TaskData;
