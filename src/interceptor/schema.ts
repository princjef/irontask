/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Listener, TaskClient } from '../client';
import { ActiveTask, ProcessingResult, ReadonlyTask, Task } from '../task';

/**
 * @public
 */
namespace Interceptors {
  export type ClientRequestInterceptor = (
    context: TaskClientRequestContext,
    next: RequestNext
  ) => Promise<void>;

  export type TaskRequestInterceptor = (
    context: TaskRequestContext,
    next: RequestNext
  ) => Promise<void>;

  export type ProcessingInterceptor = (
    context: ProcessingContext,
    next: ProcessingNext
  ) => Promise<void>;

  export interface TaskClientRequestContext {
    client: TaskClient;
    operation: TaskClientOperation;
    ref: string;
    type?: string;
    ruConsumption?: number;
  }

  export interface TaskRequestContext {
    task: Task<any> | ActiveTask<any> | ReadonlyTask<any>;
    operation: TaskOperation;
    ref: string;
    ruConsumption?: number;
  }

  export interface ProcessingContext {
    listener: Listener<any>;
    task: ActiveTask<any>;
    ref: string;
    error?: any;
    delayMs?: number;
  }

  export type RequestNext = () => Promise<any>;
  export type ProcessingNext = () => Promise<ProcessingResult>;

  export enum TaskClientOperation {
    Create = 'create',
    Get = 'get',
    List = 'list',
    ListSummary = 'listSummary',
    Iterate = 'iterate',
    IterateSummary = 'iterateSummary',
    Disable = 'disable',
    Enable = 'enable',
    Delete = 'delete',
    DeleteOne = 'deleteOne',
    LockTasks = 'lockTasks',
    RegisterSprocs = 'registerSprocs'
  }

  export enum TaskOperation {
    Refresh = 'refresh',
    Enable = 'enable',
    Disable = 'disable',
    Save = 'save',
    RenewLock = 'renewLock',
    Complete = 'complete',
    Retry = 'retry',
    Fail = 'fail',
    Defer = 'defer',
    Release = 'release',
    Delete = 'delete'
  }
}

/**
 * @public
 */
interface Interceptors {
  client?: Interceptors.ClientRequestInterceptor;
  task?: Interceptors.TaskRequestInterceptor;
  processing?: Interceptors.ProcessingInterceptor;
}

export default Interceptors;
