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

import { QueryType } from '../query';
import { ReadonlyTask, Task } from '../task';

import TaskClient from './client';
import { Listener } from './listener';
import {
  ArrayWithContinuation,
  CreateTaskOptions,
  IterateOptions,
  IterateSummaryOptions,
  ListenOptions,
  ListOptions,
  ListPageOptions,
  ListSummaryOptions,
  ListSummaryPageOptions,
  TaskHandler
} from './types';

/**
 * Version of {@link TaskClient} that has all of its operations automatically
 * scoped to a single task type.
 *
 * @public
 */
export default class ScopedTaskClient {
  private _client: TaskClient;
  private _type: string;

  /**
   * @internal
   */
  constructor(client: TaskClient, type: string) {
    this._client = client;
    this._type = type;
  }

  /**
   * Creates a task and saves it to the database.
   *
   * @param payload - Payload containing the data for the task
   * @param options - Options to configure the newly created task
   *
   * @public
   */
  async create<T>(payload: T, options?: CreateTaskOptions): Promise<Task<T>> {
    return this._client.create(this._type, payload, options);
  }

  /**
   * Retrieves the task of the given type with the provided id, if one exists.
   * If the task is not found, undefined is returned.
   *
   * @param id  - The task's id
   *
   * @public
   */
  async get<T>(id: string): Promise<Task<T> | undefined> {
    return this._client.get(this._type, id);
  }

  /**
   * Retrieves all tasks of the given type, paged using the provided list
   * options.
   *
   * @param options - Options controlling which tasks to retrieve
   *
   * @public
   */
  async list<T>(options: ListOptions = {}): Promise<Task<T>[]> {
    return this._client.list(this._type, options);
  }

  /**
   * Retrieves a single page from the database for tasks of the given type,
   * optionally starting from the provided continuation token.
   *
   * @param options - Options controlling which tasks to retrieve
   *
   * @public
   */
  async listPaged<T>(
    options: ListPageOptions = {}
  ): Promise<ArrayWithContinuation<Task<T>>> {
    return this._client.listPaged(this._type, options);
  }

  /**
   * Retrieves a all tasks of the given type with the entire payload omitted
   * by default. This is primarily useful if you have tasks with a large
   * amount of data in the payload that you don't need to see in the listed
   * results and you want to save cost/memory.
   *
   * @remarks
   *
   * Results are paged, filtered and sorted using the provided options. You
   * may also specify certain properties of the payload you want to see in the
   * returned task through the options.
   *
   * @param options - Options controlling which tasks to retrieve
   *
   * @public
   */
  async listSummary<T>(
    options: ListSummaryOptions = {}
  ): Promise<ReadonlyTask<T>[]> {
    return this._client.listSummary(this._type, options);
  }

  /**
   * Retrieves a single page of tasks of the given type with the entire payload
   * omitted by default, optionally starting from the provided continuation
   * token. This is primarily useful if you have tasks with a large amount of
   * data in the payload that you don't need to see in the listed results and
   * you want to save cost/memory.
   *
   * @remarks
   *
   * Results are paged, filtered and sorted using the provided options. You
   * may also specify certain properties of the payload you want to see in the
   * returned task through the options.
   *
   * @param type    - Task type
   * @param options - Options controlling which tasks to retrieve
   *
   * @public
   */
  async listSummaryPaged<T>(
    options: ListSummaryPageOptions = {}
  ): Promise<ArrayWithContinuation<ReadonlyTask<T>>> {
    return this._client.listSummaryPaged(this._type, options);
  }

  /**
   * Returns an async iterator for iterating over all tasks of the given type,
   * optionally filtered/sorted using the provided options object.
   *
   * @remarks
   *
   * _NOTE: Asynchronous iterators are a new feature of Javascript and are
   * only available without a polyfill starting in Node.js 10. You can make
   * use of async iterators in prior versions of Node.js by using TypeScript
   * or Babel to downcompile the code for you:
   * https://node.green/#ES2018-features-Asynchronous-Iterators_
   *
   * @param options - Options controlling which tasks to retrieve and the
   *                  order in which to receive them
   *
   * @public
   */
  async *iterate<T>(options: IterateOptions = {}): AsyncIterable<Task<T>> {
    yield* this._client.iterate(this._type, options);
  }

  /**
   * Returns an async iterator for iterating over all tasks of the given type
   * with the entire payload omitted by default. This is primarily useful if
   * you have tasks with a large amount of data in the payload that you don't
   * need to see in the listed results and you want to save cost/memory.
   *
   * @remarks
   *
   * Results are filtered and sorted using the provided options. You may also
   * specify certain properties of the payload you want to see in the returned
   * task through the options.
   *
   * _NOTE: Asynchronous iterators are a new feature of Javascript and are
   * only available without a polyfill starting in Node.js 10. You can make
   * use of async iterators in prior versions of Node.js by using TypeScript
   * or Babel to downcompile the code for you:
   * https://node.green/#ES2018-features-Asynchronous-Iterators_
   *
   * @param options - Options controlling which tasks to retrieve and the
   *                  order in which to receive them
   *
   * @public
   */
  async *iterateSummary<T>(
    options: IterateSummaryOptions = {}
  ): AsyncIterable<ReadonlyTask<T>> {
    yield* this._client.iterateSummary(this._type, options);
  }

  /**
   * Compute the number of tasks of the given type that currently exist,
   * optionally filtered to a custom group of tasks within the type.
   *
   * @param filter  - Query filter specifying which tasks within the provided
   *                  type to include
   */
  async count(filter?: QueryType.Bool): Promise<number> {
    return this._client.count(this._type, filter);
  }

  /**
   * Disables tasks of the scoped type, optionally filtered to a custom
   * group of tasks within the type.
   *
   * @param filter  - Query filter specifying which tasks within the scoped
   *                  type to disable
   *
   * @public
   */
  async disable(filter?: QueryType.Bool): Promise<void> {
    return this._client.disable(this._type, filter);
  }

  /**
   * Enables tasks of the scoped type, optionally filtered to a custom group
   * of tasks within the type.
   *
   * @param filter  - Query filter specifying which tasks within the scoped
   *                  type to enable
   *
   * @public
   */
  async enable(filter?: QueryType.Bool): Promise<void> {
    return this._client.enable(this._type, filter);
  }

  /**
   * Delete the task from the database. The operation is idempotent and will
   * succeed even if the task has already been deleted.
   *
   * @param id  - The task's id
   *
   * @public
   */
  async deleteOne(id: string): Promise<void> {
    return this._client.deleteOne(this._type, id);
  }

  /**
   * Deletes tasks of the scoped type, optionally filtered to a custom group
   * of tasks within the type.
   *
   * @param filter  - Query filter specifying which tasks within the scoped
   *                  type to delete
   *
   * @public
   */
  async delete(filter?: QueryType.Bool): Promise<void> {
    return this._client.delete(this._type, filter);
  }

  /**
   * Start listening for tasks of the scoped type.
   *
   * @param handler - Function to call with each task received for processing.
   *                  May be synchronous or asynchronous
   * @param options - Options for configuring the listener
   *
   * @public
   */
  listen<T>(handler: TaskHandler<T>, options?: ListenOptions): Listener<T> {
    return this._client.listen(this._type, handler, options);
  }
}
