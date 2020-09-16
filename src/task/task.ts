/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as util from 'util';

import { CosmosDbClient } from '../client';
import Interceptors, { InterceptorProcessor } from '../interceptor';

import TaskData from './data';
import { ResolvedTaskDocument } from './document';
import { SerializedTask, TaskBase, TaskStatus } from './types';

export default class TaskImpl<T> implements Task<T> {
  static create<T>(
    client: CosmosDbClient,
    interceptor: InterceptorProcessor,
    document: ResolvedTaskDocument<T>
  ) {
    return new TaskImpl(new TaskData(client, document), interceptor);
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

  get lastUpdatedTime(): Date {
    return this._data.lastUpdatedTime;
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

  get lastRunTime(): Date | undefined {
    return this._data.lastRunTime;
  }

  private _data: TaskData<T>;

  private _interceptor: InterceptorProcessor;

  private constructor(data: TaskData<T>, interceptor: InterceptorProcessor) {
    this._data = data;
    this._interceptor = interceptor;
  }

  async save(): Promise<void> {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Save,
      this._data.ref,
      async () => this._data.patchWithPayload()
    );
  }

  async enable(): Promise<void> {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Enable,
      this._data.ref,
      async () => this._data.patch(() => ({ enabled: true }))
    );
  }

  /**
   * Disable the task for processing. If the task is currently running, the
   * processor will be informed that the task has been disabled.
   *
   * @public
   */
  async disable(): Promise<void> {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Disable,
      this._data.ref,
      async () => this._data.patch(() => ({ enabled: false }))
    );
  }

  /**
   * Delete this task from the database. The operation is idempotent and will
   * succeed even if the task has already been deleted.
   *
   * @public
   */
  async delete(): Promise<void> {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Delete,
      this._data.ref,
      async () => this._data.delete()
    );
  }

  toJSON(): SerializedTask<T> {
    return this._data.toJSON();
  }

  // We cast as any so that types behave outside of this library
  [util.inspect.custom as any](depth: number, opts: any) {
    return this.toJSON();
  }
}

/**
 * General representation of a task. It is returned by many methods such as
 * TaskClient.create, {@link TaskClient.get} and {@link TaskClient.list}. You
 * should never need to create an instance of this class directly.
 *
 * @public
 */
export interface Task<T> extends TaskBase<T> {
  /**
   * User-defined payload holding information about the task.
   *
   * @public
   */
  payload: T;

  /**
   * Update the task in the database to match the information in this
   * instance. This can only be called once at a time to avoid race conditions
   * between different updates of the payload.
   *
   * @public
   */
  save(): Promise<void>;

  /**
   * Enable the task for processing.
   *
   * @public
   */
  enable(): Promise<void>;

  /**
   * Disable the task for processing. If the task is currently running, the
   * processor will be informed that the task has been disabled.
   *
   * @public
   */
  disable(): Promise<void>;

  /**
   * Delete this task from the database. The operation is idempotent and will
   * succeed even if the task has already been deleted.
   *
   * @public
   */
  delete(): Promise<void>;
}
