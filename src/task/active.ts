/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EventEmitter } from 'events';
import * as util from 'util';

import { createTimeout } from 'retry';
import * as uuid from 'uuid/v4';

import { CosmosDbClient, ListenOptions } from '../client';
import { LOCK_RATIO } from '../constants';
import IronTaskError, { ErrorCode } from '../error';
import Interceptors, {
  AnnotatedResponse,
  InterceptorProcessor
} from '../interceptor';
import { RecursiveRequired } from '../types/internal';
import computeNextRun from '../utils/computeNextRun';

import TaskData, { TaskPatch } from './data';
import { ResolvedTaskDocument } from './document';
import {
  ProcessingResult,
  ProcessingState,
  SerializedActiveTask,
  TaskBase,
  TaskFinishMetadata,
  TaskStatus
} from './types';

export default class ActiveTaskImpl<T> extends EventEmitter
  implements ActiveTask<T> {
  static create<T>(
    client: CosmosDbClient,
    interceptor: InterceptorProcessor,
    document: ResolvedTaskDocument<T>,
    options: RecursiveRequired<ListenOptions>
  ) {
    return new ActiveTaskImpl(
      new TaskData(client, document),
      interceptor,
      options
    );
  }

  get id(): string {
    return this._data.id;
  }

  get type(): string {
    return this._data.type;
  }

  get status(): TaskStatus {
    return this._data.status;
  }

  get enabled(): boolean {
    return this._data.enabled;
  }

  get createTime(): Date {
    return this._data.createTime;
  }

  get nextRunTime(): Date | undefined {
    return this._data.nextRunTime;
  }

  get lastRun():
    | { startTime: Date; finishTime: Date; succeeded: boolean }
    | undefined {
    return this._data.lastRun;
  }

  get currentRunStartTime(): Date | undefined {
    return this._data.currentRunStartTime;
  }

  get deliveries(): number {
    return this._data.deliveries;
  }

  get attempts(): number {
    return this._data.attempts;
  }

  get runs(): number {
    return this._data.runs;
  }

  get payload(): T {
    return this._data.payload;
  }

  set payload(payload: T) {
    this._data.payload = payload;
  }

  get interval(): string | number | undefined {
    return this._data.interval;
  }

  get locked(): boolean {
    return (
      (this._data.document.config.lockToken === this._lockToken ||
        this._data.document.config.lockToken === this._nextLockToken) &&
      this._data.timestamp() < this._data.document.config.lockedUntilTime
    );
  }

  get processingState(): ProcessingState {
    return this._internalProcessingState;
  }

  /**
   * Underlying data controller.
   */
  private _data: TaskData<T>;

  /**
   * Request interceptor.
   */
  private _interceptor: InterceptorProcessor;

  /**
   * Resolved listener options.
   */
  private _options: RecursiveRequired<ListenOptions>;

  /**
   * The maximum amount of time in milliseconds to run the task.
   */
  private get _maxExecutionTimeMs(): number {
    return this._data.document.config.maxExecutionTimeMs !== undefined
      ? this._data.document.config.maxExecutionTimeMs
      : this._options.maxExecutionTimeMs;
  }

  /**
   * Indicates whether the lock can/should be renewed.
   */
  private get _canRenewLock(): boolean {
    return (
      this.locked &&
      (this._maxExecutionTimeMs === 0 ||
        this._data.document.config.lockedUntilTime <
          this._processingStart + this._maxExecutionTimeMs) &&
      this.processingState !== ProcessingState.Finished &&
      this.processingState !== ProcessingState.LockLost
    );
  }

  /**
   * The time when processing began.
   */
  private _processingStart: number;

  /**
   * Internal processing state. DO NOT USE DIRECTLY.
   */
  private _internalProcessingState: ProcessingState = ProcessingState.Active;

  /**
   * Setter for updating the processing state, which also notifies clients
   * of any changes.
   */
  private set _processingState(state: ProcessingState) {
    if (state !== this._internalProcessingState) {
      this._internalProcessingState = state;
      this.emit('stateChanged', this._internalProcessingState);
    }
  }

  // Various processing timers
  private _pollTimer?: NodeJS.Timer;
  private _lockTimer?: NodeJS.Timer;
  private _lockExpirationTimer?: NodeJS.Timer;

  /**
   * The current lock token for the processor.
   */
  private _lockToken: string;

  /**
   * The lock token we're trying to acquire next (if any).
   */
  private _nextLockToken?: string;

  /**
   * Whether the task was enabled from the start.
   */
  private _enabled: boolean;

  private constructor(
    data: TaskData<T>,
    interceptor: InterceptorProcessor,
    options: RecursiveRequired<ListenOptions>
  ) {
    super();

    // We save some data off to the side so we know when it was changed by
    // someone else.
    this._lockToken = data.document.config.lockToken!;
    this._enabled = data.document.config.enabled;

    this._data = data;
    this._interceptor = interceptor;
    this._options = options;
    this._processingStart = this._data.timestamp();

    this._schedulePoll();
    this._scheduleRenewLock();
    this._scheduleLockExpiration();

    this._data.on('updated', this._onDataUpdated);
  }

  async save(): Promise<void> {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Save,
      this._data.ref,
      async () =>
        this._data.patchWithPayload(() => {
          this._assertProcessing();
          return {};
        })
    );
  }

  async delete(): Promise<void> {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Delete,
      this._data.ref,
      async () =>
        this._finish(ProcessingResult.Delete, async () =>
          this._data.delete(() => this._assertProcessing())
        )
    );
  }

  async complete(
    nextRunDelayMs?: number,
    savePayload?: boolean
  ): Promise<void> {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Complete,
      this._data.ref,
      async () =>
        this._acknowledge(
          ProcessingResult.Complete,
          {
            ...this._finishPatches.completeRun(true),
            ...this._finishPatches.scheduleNextRun(
              nextRunDelayMs !== undefined
                ? this._data.timestamp() + nextRunDelayMs
                : computeNextRun(this.interval, this._processingStart)
            )
          },
          savePayload,
          { delayMs: nextRunDelayMs }
        )
    );
  }

  async fail(
    err?: any,
    nextRunDelayMs?: number,
    savePayload?: boolean
  ): Promise<void> {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Fail,
      this._data.ref,
      async () =>
        this._acknowledge(
          ProcessingResult.Fail,
          {
            ...this._finishPatches.completeRun(false),
            ...this._finishPatches.scheduleNextRun(
              nextRunDelayMs !== undefined
                ? nextRunDelayMs + this._data.timestamp()
                : computeNextRun(this.interval, this._processingStart)
            )
          },
          savePayload,
          { delayMs: nextRunDelayMs, error: err }
        )
    );
  }

  async retry(
    err?: any,
    delayMs?: number,
    savePayload?: boolean
  ): Promise<void> {
    // If we've exceeded the maximum number of attempts, fail.
    if (this.attempts >= this._options.retries.retries) {
      return await this.fail(err, undefined, savePayload);
    }

    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Retry,
      this._data.ref,
      async () => {
        const resolvedDelayMs =
          delayMs !== undefined
            ? delayMs
            : createTimeout(this.attempts, this._options.retries);

        return await this._acknowledge(
          ProcessingResult.Retry,
          {
            ...this._finishPatches.scheduleNextRun(
              this._data.timestamp() + resolvedDelayMs
            ),
            ...this._finishPatches.consumeDelivery(),
            ...this._finishPatches.consumeAttempt()
          },
          savePayload,
          { delayMs: resolvedDelayMs, error: err }
        );
      }
    );
  }

  async defer(delayMs: number, savePayload?: boolean): Promise<void> {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Defer,
      this._data.ref,
      async () =>
        this._acknowledge(
          ProcessingResult.Defer,
          {
            ...this._finishPatches.scheduleNextRun(
              this._data.timestamp() + delayMs
            ),
            ...this._finishPatches.consumeDelivery()
          },
          savePayload,
          { delayMs }
        )
    );
  }

  async release(savePayload?: boolean): Promise<void> {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Release,
      this._data.ref,
      async () =>
        this._acknowledge(
          ProcessingResult.Release,
          {
            ...this._finishPatches.consumeDelivery()
          },
          savePayload
        )
    );
  }

  forceRelease(err?: any): void {
    this._markFinished(ProcessingResult.ForceRelease, undefined, err);
    this._cleanup();
  }

  /**
   * Acknowledge the task and finish processing using the given changes.
   *
   * @param result      - The processing result if the acknowledge succeeds
   * @param changes     - The patch to make to the task configuration
   * @param savePayload - Whether or not to save the payload (default: true)
   * @param logMeta     - Optional metadata for logging purposes
   */
  private async _acknowledge(
    result: ProcessingResult,
    changes: TaskPatch,
    savePayload?: boolean,
    logMeta: LogMeta = {}
  ) {
    // Add base changes to make for all types of finishes
    const resolvedChanges = {
      ...changes,
      lockedUntilTime: 0,
      lockToken: undefined
    };

    return this._finish(
      result,
      async () =>
        savePayload || savePayload === undefined
          ? this._data.patchWithPayload(() => {
              this._assertProcessing();
              return resolvedChanges;
            })
          : this._data.patch(() => {
              this._assertProcessing();
              return resolvedChanges;
            }),
      logMeta
    );
  }

  /**
   * Run the given operation to finish processing (and log the processing).
   *
   * @param result      - The processing result if the finish succeeds
   * @param finisher    - The operation to run when actually finishing the
   *                      task
   * @param logMeta     - Optional metadata for logging purposes
   */
  private async _finish(
    result: ProcessingResult,
    finisher: () => Promise<AnnotatedResponse<void>>,
    logMeta: LogMeta = {}
  ): Promise<AnnotatedResponse<void>> {
    this._assertProcessing();
    this._assertNotFinishing();

    this._processingState = ProcessingState.Finishing;

    try {
      const response = await finisher();

      // If the call succeeded, we're finished
      if (this.processingState === ProcessingState.Finishing) {
        this._processingState = ProcessingState.Finished;
      }

      this._markFinished(result, logMeta.delayMs, logMeta.error);

      this._cleanup();

      return response;
    } catch (e) {
      // If we're still finishing and the call failed, set it back to
      // active
      if (this.processingState === ProcessingState.Finishing) {
        this._processingState = ProcessingState.Active;
      }
      throw e;
    }
  }

  /**
   * Notify consumers that the task is finished processing.
   *
   * @param result  - The processing result
   * @param delayMs - Optional delay before reprocessing
   * @param error   - Optional error from processing
   */
  private _markFinished(
    result: ProcessingResult,
    delayMs?: number,
    error?: any
  ) {
    this.emit('finished', { result, error, delayMs });
  }

  private _finishPatches = {
    completeRun: (succeeded: boolean): TaskPatch => ({
      runs: this.runs + 1,
      attempts: 0,
      deliveries: 0,
      lastRun: {
        startTime: this.currentRunStartTime
          ? this.currentRunStartTime.getTime()
          : this._processingStart,
        finishTime: this._data.timestamp(),
        succeeded
      },
      currentRunStartTime: undefined
    }),
    scheduleNextRun: (nextRunTime: number | undefined): TaskPatch => ({
      nextRunTime
    }),
    consumeAttempt: (): TaskPatch => ({
      attempts: this.attempts + 1
    }),
    consumeDelivery: (): TaskPatch => ({
      deliveries: this.deliveries + 1
    })
  };

  /**
   * Schedule the next poll attempt.
   */
  private _schedulePoll() {
    // Make sure we don't start stacking timers
    if (this._pollTimer) {
      clearTimeout(this._pollTimer);
      this._pollTimer = undefined;
    }

    // We only poll if the task is still enabled, since the only thing we're
    // looking for is whether the task is disabled. We also must have a
    // positive refresh interval (an interval of 0 disables the feature)
    if (this.enabled && this._options.refreshIntervalMs > 0) {
      this._pollTimer = setTimeout(this._poll, this._options.refreshIntervalMs);
    }
  }

  /**
   * Schedule the next lock renewal.
   */
  private _scheduleRenewLock() {
    // Make sure we don't start stacking timers
    if (this._lockTimer) {
      clearTimeout(this._lockTimer);
      this._lockTimer = undefined;
    }

    // We only schedule the lock renewal if we can actually still renew the
    // lock for this task.
    if (this._canRenewLock) {
      // Amount of time before lock expiration to renew
      const gracePeriod = this._options.lockDurationMs * (1 - LOCK_RATIO);

      // Time when we should start renewing the lock
      const deadline = this._data.document.config.lockedUntilTime - gracePeriod;

      // Amount of time to wait, computed as time when we want to start
      // minus the current time.
      const delayMs = Math.max(deadline - this._data.timestamp(), 0);

      this._lockTimer = setTimeout(this._renewLock, delayMs);
    }
  }

  /**
   * Set up the timer that indicates that the lock is expired.
   */
  private _scheduleLockExpiration() {
    // Make sure we don't start stacking timers
    if (this._lockExpirationTimer) {
      clearTimeout(this._lockExpirationTimer);
      this._lockExpirationTimer = undefined;
    }

    if (
      this.processingState === ProcessingState.Active ||
      this.processingState === ProcessingState.Finishing
    ) {
      this._lockExpirationTimer = setTimeout(
        this._checkLock,
        Math.max(
          this._data.document.config.lockedUntilTime - this._data.timestamp(),
          0
        )
      );
    }
  }

  /**
   * Attempt to renew the lock on the task
   */
  private _renewLock = async () => {
    const lockToken = uuid();
    this._nextLockToken = lockToken;

    // Continually attempt to renew the lock as long as we are still able to
    // renew the lock.
    while (this._canRenewLock) {
      const cancel = Symbol('CANCEL');

      try {
        await this._interceptor.task(
          this,
          Interceptors.TaskOperation.RenewLock,
          this._data.ref,
          async () =>
            this._data.patch(() => {
              if (!this._canRenewLock) {
                throw cancel;
              }

              return {
                lockedUntilTime:
                  this._data.timestamp() + this._options.lockDurationMs,
                lockToken
              };
            }, true)
        );

        // Once we have renewed the lock, store the new lock token so we
        // can be sure we own the lock.
        this._lockToken = lockToken;
        this.emit('lockRenewed');
      } catch (err) {
        // We break out of our loop for cancelled operations
        // TODO: will the error be in the log?
        if (err === cancel) {
          return;
        }

        // Swallow other errors
      } finally {
        // Clear out the next lock token tracker if appropriate
        // regardless of the outcome
        if (this._nextLockToken === lockToken) {
          this._nextLockToken = undefined;
        }
      }
    }
  };

  /**
   * Poll the database for updates to this task. This is used to keep etag
   * versions in sync and handle task disabling.
   */
  private _poll = async () => {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Refresh,
      this._data.ref,
      async () => this._data.sync()
    );
  };

  /**
   * Signal that the lock was lost, or schedule a future check if necessary
   */
  private _checkLock = () => {
    if (
      !this.locked &&
      (this.processingState === ProcessingState.Active ||
        this.processingState === ProcessingState.Finishing)
    ) {
      // If we're not locked any more, signal that we lost the lock
      this._processingState = ProcessingState.LockLost;
      this._markFinished(ProcessingResult.LockLost);
      this.emit('lockLost');
      this._cleanup();
    } else {
      // If we still have a lock, schedule when we need to check that the
      // lock has expired
      this._scheduleLockExpiration();
    }
  };

  /**
   * Check whether the task has been disabled
   */
  private _checkDisabled() {
    if (this._enabled && !this.enabled) {
      this.emit('disabled');
      this._enabled = false;
    }
  }

  /**
   * Event handler for verifying task state whenever a server update happens
   */
  private _onDataUpdated = () => {
    // We bump the checks onto the next loop so that any processes that
    // follow directly from the update can go first.

    setTimeout(() => {
      // Someone else may have locked our task
      this._checkLock();

      // A user mayu have disabled this task
      this._checkDisabled();
    });
  };

  /**
   * Clean up any timers, listeners, etc. that are active during task
   * processing.
   */
  private _cleanup() {
    if (
      this.processingState === ProcessingState.Active ||
      this.processingState === ProcessingState.Finishing
    ) {
      this._processingState = ProcessingState.Finished;
    }

    this.emit('inactive');

    // Clear out any timers that are running
    if (this._pollTimer) {
      clearTimeout(this._pollTimer);
      this._pollTimer = undefined;
    }

    if (this._lockTimer) {
      clearTimeout(this._lockTimer);
      this._lockTimer = undefined;
    }

    if (this._lockExpirationTimer) {
      clearTimeout(this._lockExpirationTimer);
      this._lockExpirationTimer = undefined;
    }

    // Dispose of our underlying data
    this._data.dispose();

    // Remove anything listening to our events as nothing else will be
    // firing after this point
    this.removeAllListeners();
  }

  /**
   * Verify that the task is not finished processing
   */
  private _assertProcessing() {
    switch (this.processingState) {
      case ProcessingState.Finished:
        throw new IronTaskError(ErrorCode.PROCESSING_ALREADY_FINISHED);
      case ProcessingState.LockLost:
        throw new IronTaskError(ErrorCode.PROCESSING_LOCK_LOST);
    }
  }

  /**
   * Verify that the task is not currently finishing
   */
  private _assertNotFinishing() {
    if (this.processingState === ProcessingState.Finishing) {
      throw new IronTaskError(ErrorCode.PROCESSING_FINISH_IN_PROGRESS);
    }
  }

  toJSON(): SerializedActiveTask<T> {
    return {
      ...this._data.toJSON(),
      locked: this.locked
    };
  }

  // tslint:disable-next-line:function-name
  [util.inspect.custom](depth: number, opts: any) {
    return this.toJSON();
  }
}

interface LogMeta {
  delayMs?: number;
  error?: any;
  nextRunTime?: Date;
}

/**
 * Representation of a task that is currently being processed by a {@link
 * Listener}. It provides the ability to see information and update values of
 * the task like when working with a {@link Task}, but also has additional
 * functionality specific to processing, such as completing, retrying, etc.
 *
 * @typeParam T   - Type of the task's payload data. Can be any type, but the
 *                  data should be directly serializable to JSON.
 *
 * @public
 */
export interface ActiveTask<T> extends TaskBase<T>, EventEmitter {
  /**
   * User-defined payload holding information about the task.
   *
   * @public
   */
  payload: T;

  /**
   * Indicates whether the current processor has a valid lock on the task. If
   * this becomes false, the handler will no longer be allowed to update or
   * finish the task processing to avoid race conditions with other
   * processors.
   *
   * @public
   */
  readonly locked: boolean;

  /**
   * The current state of processing for this task.
   *
   * @public
   */
  readonly processingState: ProcessingState;

  /**
   * Update the task in the database to match the information in this
   * instance. This can only be called once at a time to avoid race conditions
   * between different updates of the payload.
   *
   * @public
   */
  save(): Promise<void>;

  /**
   * Delete this task from the database. The operation is idempotent and will
   * succeed even if the task has already been deleted. It also implicitly
   * completes the task.
   *
   * @public
   */
  delete(): Promise<void>;

  /**
   * Indicate that the task processing finished successfully. This will also
   * implicitly save the current state of the task by default.
   *
   * This function is called implicitly if the task handler returns without
   * calling any of the finishing functions.
   *
   * @param nextRunDelayMs  - Optional amount of time to wait before executing
   *                          another run of the task. Setting this overrides
   *                          the time of the next run that is determined by
   *                          the task {@link TaskBase.interval | interval}
   *                          and can be used to trigger another run of a task
   *                          that would not otherwise have any runs.
   * @param savePayload     - If true, saves the payload of the task while
   *                          finishing, preventing the processor from having
   *                          to make an extra call to the database to save
   *                          the final payload. Defaults to true.
   *
   * @public
   */
  complete(nextRunDelayMs?: number, savePayload?: boolean): Promise<void>;

  /**
   * Indicate that the task suffered an irrecoverable failure and should not
   * be attempted again. This does _not_ prevent future runs from executing in
   * the case of recurring tasks. This will also implicitly save the current
   * state of the task by default.
   *
   * @param err             - The error associated with the failure. Useful
   *                          for error reporting/logging.
   * @param nextRunDelayMs  - Optional amount of time to wait before executing
   *                          another run of the task. Setting this overrides
   *                          the time of the next run that is determined by
   *                          the task {@link TaskBase.interval | interval}
   *                          and can be used to trigger another run of a task
   *                          that would not otherwise have any runs.
   * @param savePayload     - If true, saves the payload of the task while
   *                          finishing, preventing the processor from having
   *                          to make an extra call to the database to save
   *                          the final payload. Defaults to true.
   *
   * @public
   */
  fail(
    err?: any,
    nextRunDelayMs?: number,
    savePayload?: boolean
  ): Promise<void>;

  /**
   * Indicate that the task encountered an error that may be retried. If the
   * configured retry limit has been reached, this is equivalent to calling
   * `fail()`. After the specified delay (or a backoff computed from
   * the configured retry options), the current run of the task will be
   * reprocessed. This will also implicitly save the current state of the
   * task by default.
   *
   * This function is called implicitly if the task handler throws an
   * exception (though it will not save the latest payload to avoid
   * creating inconsistent states by accident)
   *
   * @param err         - The error associated with the failure. Useful for
   *                      error reporting/logging.
   * @param delayMs     - Optional amount of time to wait in milliseconds
   *                      before attempting re-processing of the task. If not
   *                      specified, uses the retry options from the client to
   *                      compute a delay.
   * @param savePayload - If true, saves the payload of the task while
   *                      finishing, preventing the processor from having to
   *                      make an extra call to the database to save the final
   *                      payload. Defaults to true.
   *
   * @public
   */
  retry(err?: any, delayMs?: number, savePayload?: boolean): Promise<void>;

  /**
   * Indicate that the task is not done for processing and should be picked up
   * for processing at a later time. This is distinct from `retry()` in that
   * it does not indicate any failure and can be called an unlimited number of
   * times on a single run of a task without causing it to fail eventually.
   * Additionally, the delay before reprocessing must be specified. This will
   * also implicitly save the current state of the task by default.
   *
   * @param delayMs     - The amount of time to wait in milliseconds before
   *                      attempting re-processing of the task.
   * @param savePayload - If true, saves the payload of the task while
   *                      finishing, preventing the processor from having to
   *                      make an extra call to the database to save the final
   *                      payload. Defaults to true.
   *
   * @public
   */
  defer(delayMs: number, savePayload?: boolean): Promise<void>;

  /**
   * Indicate that the task is not done processing but should not continue to
   * be processed by this processor. This is typically used to indicate that
   * task processing should be suspended after having been disabled. This will
   * also implicitly save the current state of the task by default.
   *
   * @param savePayload - If true, saves the payload of the task while
   *                      finishing, preventing the processor from having to
   *                      make an extra call to the database to save the final
   *                      payload. Defaults to true.
   *
   * @public
   */
  release(savePayload?: boolean): Promise<void>;

  /**
   * Stop processing of the task without informing the database that you have
   * stopped processing the task. This should be used as an absolute last
   * resort for releasing a task from processing as it doesn't allow any other
   * processors to pick up the task until the current lock expires.
   *
   * @param err     - The error associated with the failure. Useful for error
   *                  reporting/logging.
   *
   * @public
   */
  forceRelease(err?: any): void;

  /**
   * Convert the task to a serialization-friendly format
   *
   * @public
   */
  toJSON(): SerializedActiveTask<T>;

  on(event: 'stateChanged', listener: (state: ProcessingState) => void): this;
  on(event: 'finished', listener: (result: TaskFinishMetadata) => void): this;
  on(
    event: 'lockRenewed' | 'lockLost' | 'disabled' | 'inactive',
    listener: () => void
  ): this;
}
