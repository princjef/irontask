/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Listener, TaskClient } from '../client';
import { ActiveTask, ProcessingResult, ReadonlyTask, Task } from '../task';

/**
 * Interfaces and helper types for the interceptor capability set.
 *
 * @public
 */
namespace Interceptors {
  /**
   * Interceptor function for handling client-level requests.
   *
   * @param context - Metadata about the intercepted request
   * @param next    - Function to call that will run the intercepted request
   */
  export type ClientRequestInterceptor = (
    context: TaskClientRequestContext,
    next: RequestNext
  ) => Promise<void>;

  /**
   * Interceptor function for handling task-level requests.
   *
   * @param context - Metadata about the intercepted request
   * @param next    - Function to call that will run the intercepted request
   */
  export type TaskRequestInterceptor = (
    context: TaskRequestContext,
    next: RequestNext
  ) => Promise<void>;

  /**
   * Interceptor function for handling processing requests.
   *
   * @param context - Metadata about the intercepted processing request
   * @param next    - Function to call that will run the intercepted request
   */
  export type ProcessingInterceptor = (
    context: ProcessingContext,
    next: ProcessingNext
  ) => Promise<void>;

  /**
   * Context provided to the client interceptor for each request.
   */
  export interface TaskClientRequestContext {
    /**
     * Client against which the request is being made
     */
    client: TaskClient;

    /**
     * The operation that is being performed
     */
    operation: TaskClientOperation;

    /**
     * Reference to the database entity that the operation is running against.
     * This will typically either be the url of a single Cosmos DB document or
     * the url of the container/collection.
     */
    ref: string;

    /**
     * The type of task(s) that the request is scoped to (if any)
     */
    type?: string;

    /**
     * The Cosmos DB Request Units consumed by the operation (if any)
     */
    ruConsumption?: number;
  }

  /**
   * Context provided to the task interceptor for each request.
   */
  export interface TaskRequestContext {
    /**
     * Task against which the request is being made
     */
    task: Task<any> | ActiveTask<any> | ReadonlyTask<any>;

    /**
     * The operation that is being performed
     */
    operation: TaskOperation;

    /**
     * Reference to the database entity that the operation is running against.
     * This will typically either be the url of a single Cosmos DB document.
     */
    ref: string;

    /**
     * The Cosmos DB Request Units consumed by the operation (if any)
     */
    ruConsumption?: number;
  }

  /**
   * Context provided to the processing interceptor for each request.
   */
  export interface ProcessingContext {
    /**
     * Listener that received the task for processing
     */
    listener: Listener<any>;

    /**
     * The task that was received for processing
     */
    task: ActiveTask<any>;

    /**
     * Reference to the database entity that the operation is running against.
     * This will typically either be the url of a single Cosmos DB document.
     */
    ref: string;

    /**
     * The error that was thrown or provided to finishing functions such as
     * {@link ActiveTask.retry} or {@link ActiveTask.fail}.
     */
    error?: any;

    /**
     * The delay that was provided before the next attempt of the job. Will pass
     * either the computed delay based on calling {@link ActiveTask.retry} or
     * the provided delays for {@link ActiveTask.complete} of {@link
     * ActiveTask.defer}.
     */
    delayMs?: number;
  }

  /**
   * Next function provided for any request interceptors.
   */
  export type RequestNext = () => Promise<any>;

  /**
   * Next function provided for any processing interceptors.
   */
  export type ProcessingNext = () => Promise<ProcessingResult>;

  /**
   * Enumeration of operations that can be triggered via the client interceptor.
   */
  export enum TaskClientOperation {
    Create = 'create',
    Get = 'get',
    List = 'list',
    ListPaged = 'listPaged',
    ListSummary = 'listSummary',
    ListSummaryPaged = 'listSummaryPaged',
    ListAll = 'listAll',
    ListAllSummary = 'listAllSummary',
    Iterate = 'iterate',
    IterateSummary = 'iterateSummary',
    IterateAll = 'iterateAll',
    IterateAllSummary = 'iterateAllSummary',
    Count = 'count',
    CountAll = 'countAll',
    Disable = 'disable',
    DisableAll = 'disableAll',
    Enable = 'enable',
    EnableAll = 'enableAll',
    Delete = 'delete',
    DeleteAll = 'deleteAll',
    DeleteOne = 'deleteOne',
    LockTasks = 'lockTasks',
    RegisterSprocs = 'registerSprocs'
  }

  /**
   * Enumeration of operations that can be triggered via the task interceptor.
   */
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
 * Set of functions provided for intercepting various types of operations. Each
 * Interceptor that is provided will be invoked for each operation of the
 * relevant type.
 *
 * @public
 */
interface Interceptors {
  /**
   * Interceptor for all task client operations.
   */
  client?: Interceptors.ClientRequestInterceptor;

  /**
   * Interceptor for all individual task operations.
   */
  task?: Interceptors.TaskRequestInterceptor;

  /**
   * Interceptor for each time a task is processed via {@link
   * TaskClient.listen}.
   */
  processing?: Interceptors.ProcessingInterceptor;
}

export default Interceptors;
