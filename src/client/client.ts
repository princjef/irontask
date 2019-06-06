/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { SqlQuerySpec } from '@azure/cosmos';
import uuid from 'uuid/v4';

import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_RETRY_OPTIONS,
  INTERNAL_RETRY_OPTIONS,
  REFRESH_INTERVAL
} from '../constants';
import IronTaskError, { ErrorCode } from '../error';
import Interceptors, {
  AnnotatedResponse,
  InterceptorProcessor
} from '../interceptor';
import { buildQuery, QueryType } from '../query';
import * as sprocs from '../sproc';
import {
  ReadonlyTask,
  ReadonlyTaskImpl,
  ResolvedTaskDocument,
  summaryProjection,
  Task,
  TaskDocument,
  TaskImpl,
  typeFilter
} from '../task';
import { Omit, RecursiveRequired } from '../types/internal';
import batchIterator from '../utils/batchIterator';
import computeNextRun from '../utils/computeNextRun';

import CosmosDbClient from './cosmos';
import ListenerImpl, { Listener } from './listener';
import ScopedTaskClient from './scoped';
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
  TaskClientOptions,
  TaskHandler
} from './types';

// Async iterator polyfill for Node <10
if (!Symbol.asyncIterator) {
  (Symbol as any).asyncIterator = Symbol.for('Symbol.asyncIterator');
}

/**
 * The primary client for creating, updating, querying and processing tasks. It
 * wraps an Azure Cosmos DB collection, which is used to store the tasks. It's
 * recommended that you create one using the TaskClient.create method instead of
 * using the constructor. This will set up the database, collection and
 * necessary stored procedures for you.
 *
 * @public
 */
export default class TaskClient {
  /**
   * Initializes a task client using the provided account information,
   * creating the specified database and collection if necessary.
   *
   * @param account     - Azure Cosmos DB account url
   * @param database    - Azure Cosmos DB database name
   * @param collection  - Azure Cosmos DB collection/container name
   * @param key         - Azure Cosmos DB account key
   * @param options     - Client creation options
   *
   * @returns Promise containing the initialized client
   *
   * @public
   */
  static async create(
    account: string,
    database: string,
    collection: string,
    key: string,
    options?: TaskClientOptions
  ) {
    const cosmosClient = await CosmosDbClient.create(
      account,
      database,
      collection,
      key,
      {
        partitionKey: {
          kind: 'Hash',
          paths: ['/config/type']
        },
        defaultTtl: -1
      }
    );
    const taskClient = new TaskClient(cosmosClient, options);
    await taskClient.registerSprocs();
    return taskClient;
  }

  private _client: CosmosDbClient;
  private _options: Required<TaskClientOptions>;
  private _interceptor: InterceptorProcessor;

  /**
   * Create a client using a pre-initialized Azure Cosmos DB client. Usage of
   * this API is only recommended for advanced users. Most users should use
   * the TaskClient.create method instead.
   *
   * @param cosmosClient    - Client created from a {@link
   *                          @azure/cosmos#Container} that is scoped to the
   *                          collection/container that the tasks client
   *                          should use.
   * @param options         - Client creation options
   *
   * @internal
   */
  private constructor(
    cosmosClient: CosmosDbClient,
    options?: TaskClientOptions
  ) {
    this._client = cosmosClient;
    this._options = {
      lockDurationMs: 30000,
      maxExecutionTimeMs: 30 * 60 * 1000,
      pollIntervalMs: 5000,
      maxUpdateParallelism: 10,
      interceptors: {},
      retries: INTERNAL_RETRY_OPTIONS,
      ...options
    };
    this._interceptor = new InterceptorProcessor(this._options.interceptors);
  }

  /**
   * Returns a client with all operations automatically scoped to the provided
   * task type. This is useful if you have an area where you need to perform
   * many related operations for a single task type and don't want to have to
   * specify it each time.
   *
   * @param type    - Task type to apply to all operations within the scoped
   *                  client.
   *
   * @public
   */
  type(type: string): ScopedTaskClient {
    return new ScopedTaskClient(this, type);
  }

  /**
   * Creates a task and saves it to the database.
   *
   * @param type    - Task type
   * @param payload - Payload containing the data for the task
   * @param options - Options to configure the newly created task
   *
   * @public
   */
  async create<T>(
    type: string,
    payload: T,
    options?: CreateTaskOptions
  ): Promise<Task<T>> {
    const id = uuid();

    return this._interceptor.client(
      this,
      Interceptors.TaskClientOperation.Create,
      this._client.documentRef(type, id),
      type,
      async () => {
        const definedOptions: CreateTaskOptions = options || {};

        const now = Date.now();

        const task: NewTaskDocument<T> = {
          id,
          config: {
            type,
            enabled:
              definedOptions.enabled !== undefined
                ? definedOptions.enabled
                : true,
            createTime: now,
            lockedUntilTime: 0,
            nextRunTime:
              definedOptions.scheduledTime !== undefined
                ? definedOptions.scheduledTime.getTime()
                : computeNextRun(definedOptions.interval),
            deliveries: 0,
            attempts: 0,
            runs: 0,
            interval: definedOptions.interval,
            ttlMs: definedOptions.ttlMs,
            maxExecutionTimeMs: definedOptions.maxExecutionTimeMs
          },
          payload
        };

        const response = await this._client.createItem<NewTaskDocument<T>>(
          task
        );
        return {
          ...response,
          result: TaskImpl.create(
            this._client,
            this._interceptor,
            response.result
          )
        };
      }
    );
  }

  /**
   * Retrieves the task of the given type with the provided id, if one exists.
   * If the task is not found, undefined is returned.
   *
   * @param type    - Task type
   * @param id      - The task's id
   *
   * @public
   */
  async get<T>(type: string, id: string): Promise<Task<T> | undefined> {
    return this._interceptor.client(
      this,
      Interceptors.TaskClientOperation.Get,
      this._client.documentRef(type, id),
      type,
      async () => {
        const response = await this._client.getItem<TaskDocument<T>>(id, type);
        return {
          ...response,
          result: response.result
            ? TaskImpl.create(this._client, this._interceptor, response.result)
            : undefined
        };
      }
    );
  }

  /**
   * Retrieves all tasks of the given type, paged using the provided list
   * options.
   *
   * @param type    - Task type
   * @param options - Options controlling which tasks to retrieve
   *
   * @public
   */
  async list<T>(type: string, options: ListOptions = {}): Promise<Task<T>[]> {
    const skip = options.skip || 0;
    const top = options.top || DEFAULT_PAGE_SIZE;

    // TODO: no skip support yet in Cosmos DB so we have to do the skip
    // client side for now.
    const query = buildQuery({
      limit: skip + top,
      filter: typeFilter(type, options.filter),
      sort: options.sortExpression,
      sortOrder: options.sortOrder
    });

    return this._interceptor.client(
      this,
      Interceptors.TaskClientOperation.List,
      this._client.containerRef,
      type,
      async () => {
        const response = await this._client.queryItemsArray<
          ResolvedTaskDocument<T>
        >(query);
        return {
          ...response,
          result: response.result
            .slice(skip)
            .map(doc => TaskImpl.create(this._client, this._interceptor, doc))
        };
      }
    );
  }

  /**
   * Retrieves a single page from the database for tasks of the given type,
   * optionally starting from the provided continuation token.
   *
   * @param type    - Task type
   * @param options - Options controlling which tasks to retrieve
   *
   * @public
   */
  async listPaged<T>(
    type: string,
    options: ListPageOptions = {}
  ): Promise<ArrayWithContinuation<Task<T>>> {
    const query = buildQuery({
      filter: typeFilter(type, options.filter),
      sort: options.sortExpression,
      sortOrder: options.sortOrder
    });

    return this._interceptor.client(
      this,
      Interceptors.TaskClientOperation.ListPaged,
      this._client.containerRef,
      type,
      async () => {
        const response = await this._client.queryItemsPage<
          ResolvedTaskDocument<T>
        >(query, {
          continuation: options.continuation,
          pageSize: options.pageSize || DEFAULT_PAGE_SIZE
        });
        return {
          ...response,
          result: this._addContinuation(
            response.result.map(doc =>
              TaskImpl.create(this._client, this._interceptor, doc)
            ),
            response.continuation!
          )
        };
      }
    );
  }

  /**
   * Retrieves all tasks across all types of tasks, paged using the provided
   * list options.
   *
   * @remarks
   *
   * Performing operations across multiple types results in cross partition
   * queries to Cosmos DB. This can cause a significant performance impact,
   * especially when paging and/or sorting results. Use this API with care.
   *
   * @param options - Options controlling which tasks to retrieve
   *
   * @public
   */
  async listAll<T>(options: ListOptions = {}): Promise<Task<T>[]> {
    const skip = options.skip || 0;
    const top = options.top || DEFAULT_PAGE_SIZE;

    // TODO: no skip support yet in Cosmos DB so we have to do the skip
    // client side for now.
    const query = buildQuery({
      limit: skip + top,
      filter: options.filter,
      sort: options.sortExpression,
      sortOrder: options.sortOrder
    });

    return this._interceptor.client(
      this,
      Interceptors.TaskClientOperation.ListAll,
      this._client.containerRef,
      undefined,
      async () => {
        const response = await this._client.queryItemsArray<
          ResolvedTaskDocument<T>
        >(query, true);
        return {
          ...response,
          result: response.result
            .slice(skip)
            .map(doc => TaskImpl.create(this._client, this._interceptor, doc))
        };
      }
    );
  }

  /**
   * Retrieves all tasks of the given type with the entire payload omitted by
   * default. This is primarily useful if you have tasks with a large amount
   * of data in the payload that you don't need to see in the listed results
   * and you want to save cost/memory.
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
  async listSummary<T>(
    type: string,
    options: ListSummaryOptions = {}
  ): Promise<ReadonlyTask<T>[]> {
    const skip = options.skip || 0;
    const top = options.top || DEFAULT_PAGE_SIZE;

    // TODO: no skip support yet in Cosmos DB so we have to do the skip
    // client side for now.
    const query = buildQuery({
      limit: skip + top,
      projection: summaryProjection(options.project),
      filter: typeFilter(type, options.filter),
      sort: options.sortExpression,
      sortOrder: options.sortOrder
    });

    return this._interceptor.client(
      this,
      Interceptors.TaskClientOperation.ListSummary,
      this._client.containerRef,
      type,
      async () => {
        const response = await this._client.queryItemsArray<
          ResolvedTaskDocument<T>
        >(query);
        return {
          ...response,
          result: response.result
            .slice(skip)
            .map(doc =>
              ReadonlyTaskImpl.create(this._client, this._interceptor, doc)
            )
        };
      }
    );
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
    type: string,
    options: ListSummaryPageOptions = {}
  ): Promise<ArrayWithContinuation<ReadonlyTask<T>>> {
    const query = buildQuery({
      projection: summaryProjection(options.project),
      filter: typeFilter(type, options.filter),
      sort: options.sortExpression,
      sortOrder: options.sortOrder
    });

    return this._interceptor.client(
      this,
      Interceptors.TaskClientOperation.ListSummaryPaged,
      this._client.containerRef,
      type,
      async () => {
        const response = await this._client.queryItemsPage<
          ResolvedTaskDocument<T>
        >(query, {
          continuation: options.continuation,
          pageSize: options.pageSize || DEFAULT_PAGE_SIZE
        });
        return {
          ...response,
          result: this._addContinuation(
            response.result.map(doc =>
              ReadonlyTaskImpl.create(this._client, this._interceptor, doc)
            ),
            response.continuation
          )
        };
      }
    );
  }

  /**
   * Retrieves all tasks across all types with the entire payload omitted by
   * default. This is primarily useful if you have tasks with a large amount
   * of data in the payload that you don't need to see in the listed results
   * and you want to save cost/memory.
   *
   * @remarks
   *
   * Results are paged, filtered and sorted using the provided options. You
   * may also specify certain properties of the payload you want to see in the
   * returned task through the options.
   *
   * Performing operations across multiple types results in cross partition
   * queries to Cosmos DB. This can cause a significant performance impact,
   * especially when paging and/or sorting results. Use this API with care.
   *
   * @param options - Options controlling which tasks to retrieve
   *
   * @public
   */
  async listAllSummary<T>(
    options: ListSummaryOptions = {}
  ): Promise<ReadonlyTask<T>[]> {
    const skip = options.skip || 0;
    const top = options.top || DEFAULT_PAGE_SIZE;

    // TODO: no skip support yet in Cosmos DB so we have to do the skip
    // client side for now.
    const query = buildQuery({
      limit: skip + top,
      projection: summaryProjection(options.project),
      filter: options.filter,
      sort: options.sortExpression,
      sortOrder: options.sortOrder
    });

    return this._interceptor.client(
      this,
      Interceptors.TaskClientOperation.ListAllSummary,
      this._client.containerRef,
      undefined,
      async () => {
        const response = await this._client.queryItemsArray<
          ResolvedTaskDocument<T>
        >(query, true);
        return {
          ...response,
          result: response.result
            .slice(skip)
            .map(doc =>
              ReadonlyTaskImpl.create(this._client, this._interceptor, doc)
            )
        };
      }
    );
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
   * @param type    - Task type
   * @param options - Options controlling which tasks to retrieve and the
   *                  order in which to receive them
   *
   * @public
   */
  async *iterate<T>(
    type: string,
    options: IterateOptions = {}
  ): AsyncIterable<Task<T>> {
    const query = buildQuery({
      filter: typeFilter(type, options.filter),
      sort: options.sortExpression,
      sortOrder: options.sortOrder
    });

    const iterator = this._client.queryItemsIterator<ResolvedTaskDocument<T>>(
      query
    );

    const mappedIterator = this._iterate(
      Interceptors.TaskClientOperation.Iterate,
      type,
      iterator,
      doc => TaskImpl.create(this._client, this._interceptor, doc)
    );

    for await (const task of mappedIterator) {
      yield task;
    }
  }

  /**
   * Returns an async iterator for iterating over all tasks across all types,
   * optionally filtered/sorted using the provided options object.
   *
   * @remarks
   *
   * Performing operations across multiple types results in cross partition
   * queries to Cosmos DB. This can cause a significant performance impact,
   * especially when paging and/or sorting results. Use this API with care.
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
  async *iterateAll<T>(options: IterateOptions = {}): AsyncIterable<Task<T>> {
    const query = buildQuery({
      filter: options.filter,
      sort: options.sortExpression,
      sortOrder: options.sortOrder
    });

    const iterator = this._client.queryItemsIterator<ResolvedTaskDocument<T>>(
      query,
      true
    );

    const mappedIterator = this._iterate(
      Interceptors.TaskClientOperation.IterateAll,
      undefined,
      iterator,
      doc => TaskImpl.create(this._client, this._interceptor, doc)
    );

    for await (const task of mappedIterator) {
      yield task;
    }
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
   * @param type    - Task type
   * @param options - Options controlling which tasks to retrieve and the
   *                  order in which to receive them
   * @public
   */
  async *iterateSummary<T>(
    type: string,
    options: IterateSummaryOptions = {}
  ): AsyncIterable<ReadonlyTask<T>> {
    const query = buildQuery({
      projection: summaryProjection(options.project),
      filter: typeFilter(type, options.filter),
      sort: options.sortExpression,
      sortOrder: options.sortOrder
    });

    const iterator = this._client.queryItemsIterator<ResolvedTaskDocument<T>>(
      query
    );

    const mappedIterator = this._iterate(
      Interceptors.TaskClientOperation.IterateSummary,
      type,
      iterator,
      doc => ReadonlyTaskImpl.create(this._client, this._interceptor, doc)
    );

    for await (const task of mappedIterator) {
      yield task;
    }
  }

  /**
   * Returns an async iterator for iterating over all tasks across all types
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
   * Performing operations across multiple types results in cross partition
   * queries to Cosmos DB. This can cause a significant performance impact,
   * especially when paging and/or sorting results. Use this API with care.
   *
   * _NOTE: Asynchronous iterators are a new feature of Javascript and are
   * only available without a polyfill starting in Node.js 10. You can make
   * use of async iterators in prior versions of Node.js by using TypeScript
   * or Babel to downcompile the code for you:
   * https://node.green/#ES2018-features-Asynchronous-Iterators_
   *
   * @param type    - Task type
   * @param options - Options controlling which tasks to retrieve and the
   *                  order in which to receive them
   * @public
   */
  async *iterateAllSummary<T>(
    options: IterateSummaryOptions = {}
  ): AsyncIterable<ReadonlyTask<T>> {
    const query = buildQuery({
      projection: summaryProjection(options.project),
      filter: options.filter,
      sort: options.sortExpression,
      sortOrder: options.sortOrder
    });

    const iterator = this._client.queryItemsIterator<ResolvedTaskDocument<T>>(
      query,
      true
    );

    const mappedIterator = this._iterate(
      Interceptors.TaskClientOperation.IterateAllSummary,
      undefined,
      iterator,
      doc => ReadonlyTaskImpl.create(this._client, this._interceptor, doc)
    );

    for await (const task of mappedIterator) {
      yield task;
    }
  }

  /**
   * Compute the number of tasks of the given type that currently exist,
   * optionally filtered to a custom group of tasks within the type.
   *
   * @param type    - Task type
   * @param filter  - Query filter specifying which tasks within the provided
   *                  type to include
   */
  async count(type: string, filter?: QueryType.Bool): Promise<number> {
    const query = buildQuery({
      filter: typeFilter(type, filter),
      rawProjection: 'VALUE COUNT(1)'
    });

    return this._interceptor.client(
      this,
      Interceptors.TaskClientOperation.Count,
      this._client.containerRef,
      type,
      async () => {
        const response = await this._client.queryItemsArray<number>(query);
        return {
          ...response,
          result: response.result[0]
        };
      }
    );
  }

  /**
   * Compute the number of tasks across all types that currently exist,
   * optionally filtered to a custom group of tasks.
   *
   * @remarks
   *
   * Performing operations across multiple types results in cross partition
   * queries to Cosmos DB. This can cause a significant performance impact,
   * especially when paging and/or sorting results. Use this API with care.
   *
   * @param filter  - Query filter specifying which tasks to include
   */
  async countAll(filter?: QueryType.Bool): Promise<number> {
    const query = buildQuery({
      filter,
      rawProjection: 'VALUE COUNT(1)'
    });

    return this._interceptor.client(
      this,
      Interceptors.TaskClientOperation.Count,
      this._client.containerRef,
      undefined,
      async () => {
        const response = await this._client.queryItemsArray<number>(
          query,
          true
        );
        return {
          ...response,
          result: response.result[0]
        };
      }
    );
  }

  /**
   * Disables tasks of the provided type, optionally filtered to a custom group
   * of tasks within the type.
   *
   * @param type    - Task type
   * @param filter  - Query filter specifying which tasks within the provided
   *                  type to disable
   *
   * @public
   */
  async disable(type: string, filter?: QueryType.Bool): Promise<void> {
    await this._bulkUpdate(
      Interceptors.TaskClientOperation.Disable,
      Interceptors.TaskOperation.Disable,
      type,
      buildQuery({ filter: typeFilter(type, filter) }),
      async task => task.disable()
    );
  }

  /**
   * Disables tasks across all types, optionally filtered to a custom group of
   * tasks.
   *
   * @remarks
   *
   * Performing operations across multiple types results in cross partition
   * queries to Cosmos DB. This can cause a significant performance impact,
   * especially when paging and/or sorting results. Use this API with care.
   *
   * @param filter  - Query filter specifying which tasks to disable
   *
   * @public
   */
  async disableAll(filter?: QueryType.Bool): Promise<void> {
    await this._bulkUpdate(
      Interceptors.TaskClientOperation.DisableAll,
      Interceptors.TaskOperation.Disable,
      undefined,
      buildQuery({ filter }),
      async task => task.disable()
    );
  }

  /**
   * Enables tasks of the provided type, optionally filtered to a custom group
   * of tasks within the type.
   *
   * @param type    - Task type
   * @param filter  - Query filter specifying which tasks within the provided
   *                  type to enable
   *
   * @public
   */
  async enable(type: string, filter?: QueryType.Bool): Promise<void> {
    await this._bulkUpdate(
      Interceptors.TaskClientOperation.Enable,
      Interceptors.TaskOperation.Enable,
      type,
      buildQuery({ filter: typeFilter(type, filter) }),
      async task => task.enable()
    );
  }

  /**
   * Enables tasks across all types, optionally filtered to a custom group
   * of tasks.
   *
   * @remarks
   *
   * Performing operations across multiple types results in cross partition
   * queries to Cosmos DB. This can cause a significant performance impact,
   * especially when paging and/or sorting results. Use this API with care.
   *
   * @param filter  - Query filter specifying which tasks to enable
   *
   * @public
   */
  async enableAll(filter?: QueryType.Bool): Promise<void> {
    await this._bulkUpdate(
      Interceptors.TaskClientOperation.EnableAll,
      Interceptors.TaskOperation.Enable,
      undefined,
      buildQuery({ filter }),
      async task => task.enable()
    );
  }

  /**
   * Delete the task from the database. The operation is idempotent and will
   * succeed even if the task has already been deleted.
   *
   * @param type    - Task type
   * @param id      - The task's id
   *
   * @public
   */
  async deleteOne(type: string, id: string): Promise<void> {
    await this._interceptor.client(
      this,
      Interceptors.TaskClientOperation.DeleteOne,
      this._client.documentRef(type, id),
      type,
      async () => this._client.deleteItem(id, type)
    );
  }

  /**
   * Deletes tasks of the provided type, optionally filtered to a custom group
   * of tasks within the type.
   *
   * @param type    - Task type
   * @param filter  - Query filter specifying which tasks within the provided
   *                  type to delete
   *
   * @public
   */
  async delete(type: string, filter?: QueryType.Bool): Promise<void> {
    await this._bulkUpdate(
      Interceptors.TaskClientOperation.Delete,
      Interceptors.TaskOperation.Delete,
      type,
      buildQuery({ filter: typeFilter(type, filter) }),
      async task => task.delete()
    );
  }

  /**
   * Deletes tasks across all types, optionally filtered to a custom group
   * of tasks.
   *
   * @param filter  - Query filter specifying which tasks to delete
   *
   * @public
   */
  async deleteAll(filter?: QueryType.Bool): Promise<void> {
    await this._bulkUpdate(
      Interceptors.TaskClientOperation.DeleteAll,
      Interceptors.TaskOperation.Delete,
      undefined,
      buildQuery({ filter }),
      async task => task.delete()
    );
  }

  /**
   * Start listening for tasks of the provided type.
   *
   * @param type    - Task type
   * @param handler - Function to call with each task received for processing.
   *                  May be synchronous or asynchronous
   * @param options - Options for configuring the listener
   *
   * @public
   */
  listen<T>(
    type: string,
    handler: TaskHandler<T>,
    options?: ListenOptions
  ): Listener<T> {
    const opts: RecursiveRequired<ListenOptions> = {
      maxActiveTasks: 100,
      lockDurationMs: this._options.lockDurationMs,
      pollIntervalMs: this._options.pollIntervalMs,
      maxExecutionTimeMs: this._options.maxExecutionTimeMs,
      refreshIntervalMs: REFRESH_INTERVAL,
      ...options,
      retries: {
        ...DEFAULT_RETRY_OPTIONS,
        ...(options || {}).retries
      }
    };

    return new ListenerImpl<T>(
      this,
      this._client,
      this._interceptor,
      type,
      handler,
      opts
    );
  }

  /**
   * Ensures that the proper stored procedures are registered with Cosmos DB
   * for the client to function. You should never have to call this directly.
   *
   * @public
   */
  async registerSprocs(): Promise<void> {
    await this._interceptor.client(
      this,
      Interceptors.TaskClientOperation.RegisterSprocs,
      this._client.containerRef,
      undefined,
      async () => {
        let ruConsumption = 0;

        await Array.from(Object.values(sprocs)).map(async ({ id, fn }) => {
          try {
            const result = await this._client.replaceSproc(id, fn);
            ruConsumption += result.ruConsumption || 0;
          } catch (err) {
            // 404 means we need to create it
            if (IronTaskError.is(err, ErrorCode.DATABASE_RESOURCE_NOT_FOUND)) {
              try {
                const result = await this._client.createSproc(id, fn);
                ruConsumption += result.ruConsumption || 0;
              } catch (err) {
                // 409s are okay at this point. Just means we
                // were in a race with something else
                if (
                  IronTaskError.is(
                    err,
                    ErrorCode.DATABASE_RESOURCE_ALREADY_EXISTS
                  )
                ) {
                  return;
                }

                throw err;
              }
            } else {
              throw err;
            }
          }
        });

        return {
          ruConsumption,
          result: undefined
        };
      }
    );
  }

  private async _bulkUpdate(
    operation: Interceptors.TaskClientOperation,
    taskOperation: Interceptors.TaskOperation,
    type: string | undefined,
    query: Required<SqlQuerySpec>,
    op: (task: Task<any>) => Promise<any>
  ): Promise<void> {
    // TODO: do we want to return the count out?
    await this._interceptor.client(
      this,
      operation,
      this._client.containerRef,
      type,
      async () => {
        let taskCount = 0;
        let ruConsumption = 0;

        // We rig a custom interceptor that we use to build up our own
        // macro data for reporting to the end user. They should not
        // have to know/care that we are creating task instances and
        // running the operation on them.
        const interceptor = new InterceptorProcessor({
          async task(context, next) {
            // Allow all operations to execute
            await next();

            // We only care about our own operation
            if (context.operation === taskOperation) {
              ruConsumption += context.ruConsumption || 0;
            }
          }
        });

        const iterator = await this._client.queryItemsIterator<
          ResolvedTaskDocument<any>
        >(query, type === undefined);

        for await (const results of batchIterator(
          iterator,
          this._options.maxUpdateParallelism
        )) {
          for (const result of results) {
            taskCount += 1;
            ruConsumption += result.ruConsumption || 0;
          }

          await Promise.all(
            results
              .map(({ result }) =>
                TaskImpl.create(this._client, interceptor, result)
              )
              .map(async task => op(task))
          );
        }

        return {
          ruConsumption,
          result: taskCount
        };
      }
    );
  }

  private _iterate<T, S>(
    operation: Interceptors.TaskClientOperation,
    type: string | undefined,
    iterator: AsyncIterable<AnnotatedResponse<T>>,
    map: (value: T) => S
  ): AsyncIterable<S> {
    const rawIterator = iterator[Symbol.asyncIterator]();

    return {
      [Symbol.asyncIterator]: () => ({
        next: async () => {
          let value: S | undefined;
          let done: boolean = false;
          await this._interceptor.client(
            this,
            operation,
            this._client.containerRef,
            type,
            async () => {
              const result = await rawIterator.next();
              done = result.done;
              if (!result.value) {
                return {
                  result: undefined,
                  ruConsumption: undefined
                };
              }
              value = map(result.value.result);
              return {
                result: value,
                ruConsumption: result.value.ruConsumption
              };
            }
          );

          return {
            value: value!,
            done
          };
        }
      })
    };
  }

  private _addContinuation<T>(
    list: T[],
    continuation: string | undefined
  ): ArrayWithContinuation<T> {
    const result: ArrayWithContinuation<T> = list as any;
    result.continuation = continuation;
    return result;
  }
}

type NewTaskDocument<T> = Omit<TaskDocument<T>, '_etag'>;
