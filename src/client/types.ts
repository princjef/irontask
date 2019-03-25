/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import Interceptors from '../interceptor';
import { QueryType } from '../query';
import { ActiveTask } from '../task';
import { TimeoutsOptions } from '../types/public';

/**
 * Options for configuring the behavior of the {@link TaskClient}.
 *
 * @public
 */
export interface TaskClientOptions {
  /**
   * Interval to poll at when listening for new tasks. This represents the
   * maximum amount of time between individual attempts to retrieve tasks. The
   * client will only wait to retrieve tasks if it did not find any tasks to
   * run and has the ability to run more tasks than it currently is.
   *
   * @defaultValue 5000
   *
   * @public
   */
  pollIntervalMs?: number;

  /**
   * Default lifetime when locking a task. Setting this to a smaller number
   * reduces wait time if a client crashes before a task is redelivered to a
   * different client, but costs more as the lock must be renewed more
   * frequently. May be overridden for individual task types.
   *
   * @defaultValue 30000
   *
   * @public
   */
  lockDurationMs?: number;

  /**
   * Default duration to continue to renew the lock while processing a task
   * before considering processing to be hung and releasing the lock. May be
   * overridden for individual task types/tasks.
   *
   * @defaultValue 1800000 (30 minutes)
   *
   * @public
   */
  maxExecutionTimeMs?: number;

  /**
   * Maximum number of updates to perform at a time when performing bulk
   * updates or deletes.
   *
   * @defaultValue 10
   *
   * @public
   */
  maxUpdateParallelism?: number;

  /**
   * Optional object that can intercept asynchronous requests and task
   * processing. It takes optional interceptor functions for different types
   * of operations.
   *
   * @public
   */
  interceptors?: Interceptors;

  /**
   * Optional object to configure retries of database operations. This policy
   * only applies to operations that can be safely retried in all cases (such
   * as a service unavailable error or certain networking errors). By default,
   * the operation will be tried up to 5 times with an exponential backoff
   * between tries totaling about 4 seconds of waiting time. To disable
   * retries altogether, pass the {@link NO_RETRY} constant.
   *
   * @public
   */
  retries?: TimeoutsOptions;
}

/**
 * Options for configuring a task created through the {@link TaskClient}.
 *
 * @public
 */
export interface CreateTaskOptions {
  /**
   * Set to false if you don't want the task to be available for processing
   * when it's created.
   *
   * @defaultValue true
   *
   * @public
   */
  enabled?: boolean;

  /**
   * Optional interval on which the task should run. It can either be set to a
   * number, in which case it is a number of milliseconds between each run, or
   * it can be set to a string, in which case is it a cron string (up to
   * 1 second resolution) indicating when the task should be run.
   *
   * Task executions will not stack up (i.e. a task will only actively execute
   * once at a time), so it is not guaranteed that you will have a task
   * execute at exactly the configured interval. For instance, if your task
   * takes 90 seconds to process but is scheduled to run once a minute, it
   * will only run once every 90 seconds.
   *
   * @example Run on the 5th minute of every hour
   *
   * ```ts
   * {
   *   interval: '5 * * * *'
   * }
   * ```
   *
   * @example Run every 5 minutes
   *
   * ```ts
   * {
   *   interval: 300000
   * }
   * ```
   *
   * @public
   */
  interval?: string | number;

  /**
   * The scheduled time to run the task (or to run the first execution of the
   * task in the case of recurring tasks). If not specified, it defaults to
   * the creation time of the task unless a cron string is specified for the
   * {@link CreateTaskOptions.interval}, in which case it is set to the first
   * matching time in the cron schedule after the task creation time.
   *
   * @public
   */
  scheduledTime?: Date;

  /**
   * If specified, the amount of time in milliseconds to retain a completed or
   * failed task with no more scheduled executions before deleting.
   *
   * @public
   */
  ttlMs?: number;

  /**
   * If specified, the duration to renew the lock while processing this task
   * before considering processing to be hung and releasing the lock.
   * Overrides the corresponding options on the client and task type levels.
   * A value of 0 indicates no limit.
   *
   * @defaultValue client value (30 minutes)
   *
   * @public
   */
  maxExecutionTimeMs?: number;
}

/**
 * Options controlling iterator-based operations.
 *
 * @public
 */
export interface IterateOptions {
  /**
   * Optional filter to apply on the returned tasks. If none is specified, all
   * tasks of the given type will be returned.
   *
   * @example Filter to only recurring tasks
   *
   * ```ts
   * {
   *   filter: q.isDefined(t.interval)
   * }
   * ```
   *
   * @public
   */
  filter?: QueryType.Bool;

  /**
   * Optional sort expression to use for ordering the results returned by the
   * database. The expression should be a numeric property.
   *
   * @defaultValue undefined (no sort)
   *
   * @example Sort by the time the last run ended
   *
   * ```ts
   * {
   *   sortExpression: t.lastRunFinishTime
   * }
   * ```
   *
   * @public
   */
  sortExpression?: QueryType.Num;

  /**
   * Optional ordering to use for sorting against the expression.
   *
   * @defaultValue 'ASC'
   *
   * @public
   */
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Options for projecting data from tasks when working with summaries.
 *
 * @public
 */
export interface ProjectOptions {
  /**
   * Optional list of properties within the payload to retrieve from the
   * database. The structure of the payload returned will match the structure
   * of the overall data, but will only contain the specified properties.
   *
   * @example Project properties `a` and `c[0]` from the payload
   *
   * ```ts
   * {
   *   project: [
   *     t.payload('a'),
   *     t.payload('c', 0)
   *   ]
   * }
   * ```
   *
   * @public
   */
  project?: QueryType.AnyProperty[];
}

/**
 * Options controlling iterator-based operations on task summaries.
 *
 * @public
 */
export interface IterateSummaryOptions extends IterateOptions, ProjectOptions {}

/**
 * Options controlling listing tasks.
 *
 * @public
 */
export interface ListOptions extends IterateOptions {
  /**
   * Number of tasks to skip in the result set.
   *
   * @defaultValue 0
   *
   * @public
   */
  skip?: number;

  /**
   * Number of tasks to return from the result set.
   *
   * @defaultValue 25
   *
   * @public
   */
  top?: number;
}

/**
 * Options controlling listing task summaries.
 *
 * @public
 */
export interface ListSummaryOptions extends ListOptions, ProjectOptions {}

/**
 * Options configuring the behavior of a listener.
 *
 * @public
 */
export interface ListenOptions {
  /**
   * The maximum number of tasks to process at the same time within this
   * listener.
   *
   * @defaultValue 100
   *
   * @public
   */
  maxActiveTasks?: number;

  /**
   * Interval to poll at when listening for new tasks. This represents the
   * maximum amount of time between individual attempts to retrieve tasks. The
   * client will only wait to retrieve tasks if it did not find any tasks to
   * run and has the ability to run more tasks than it currently is.
   *
   * @public
   */
  pollIntervalMs?: number;

  /**
   * Default lifetime when locking a task. Setting this to a smaller number
   * reduces wait time if a client crashes before a task is redelivered to a
   * different client, but costs more as the lock must be renewed more
   * frequently. May be overridden for individual task types.
   *
   * @public
   */
  lockDurationMs?: number;

  /**
   * Default duration to continue to renew the lock while processing a task
   * before considering processing to be hung and releasing the lock.
   * Overrides the same option on the client and may be overridden by specific
   * tasks. A value of 0 indicates no limit.
   *
   * @public
   */
  maxExecutionTimeMs?: number;

  /**
   * Interval to refresh the task data when checking for changes like whether
   * the task has been disabled. Set to 0 to disable this functionality.
   *
   * @defaultValue 5000
   *
   * @public
   */
  refreshIntervalMs?: number;

  /**
   * Optional configuration that allows the task to be retried with an
   * exponential backoff. Configuration options are those from the `retry`
   * library.
   *
   * @public
   */
  retries?: TimeoutsOptions;
}

/**
 * Handler for processing received tasks
 *
 * @public
 */
export type TaskHandler<T> = (task: ActiveTask<T>) => void | Promise<void>;
