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

/**
 * Representation of a task that cannot have its payload saved because it is
 * produced from operations that only provide a partial copy of the payload,
 * such as {@link TaskClient.listSummary} and {@link TaskClient.iterateSummary}.
 *
 * @typeParam T   - Type of the task's payload data. Can be any type, but the
 *                  data should be directly serializable to JSON. This type can
 *                  also be tailored to the data projected by the operation that
 *                  produced this task.
 *
 * @public
 */
export default class ReadonlyTaskImpl<T> implements ReadonlyTask<T> {
  static create<T>(
    client: CosmosDbClient,
    interceptor: InterceptorProcessor,
    document: ResolvedTaskDocument<T>
  ) {
    return new ReadonlyTaskImpl(
      new TaskData(client, document, false),
      interceptor
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

  get interval(): string | number | undefined {
    return this._data.interval;
  }

  private _data: TaskData<T>;

  private _interceptor: InterceptorProcessor;

  private constructor(data: TaskData<T>, interceptor: InterceptorProcessor) {
    this._data = data;
    this._interceptor = interceptor;
  }

  async enable(): Promise<void> {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Enable,
      this._data.ref,
      async () => this._data.patch(() => ({ enabled: true }))
    );
  }

  async disable(): Promise<void> {
    await this._interceptor.task(
      this,
      Interceptors.TaskOperation.Disable,
      this._data.ref,
      async () => this._data.patch(() => ({ enabled: false }))
    );
  }

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

  // tslint:disable-next-line:function-name
  [util.inspect.custom](depth: number, opts: any) {
    return this.toJSON();
  }
}

/**
 * Representation of a task that cannot have its payload saved because it is
 * produced from operations that only provide a partial copy of the payload,
 * such as {@link TaskClient.listSummary} and {@link TaskClient.iterateSummary}.
 *
 * @typeParam T   - Type of the task's payload data. Can be any type, but the
 *                  data should be directly serializable to JSON. This type can
 *                  also be tailored to the data projected by the operation that
 *                  produced this task.
 *
 * @public
 */
export interface ReadonlyTask<T> extends TaskBase<T> {
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
