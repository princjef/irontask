/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { p, q, QueryType } from '../query';

import { TaskStatus } from './types';

/**
 * Expressions representing various properties of a task useful for filtering
 * or projection expressions in operations like {@link TaskClient.list}, {@link
 * TaskClient.listSummary}, {@link TaskClient.iterate}, {@link
 * TaskClient.iterateSummary} and more.
 *
 * @public
 */
namespace t {
  /**
   * Unique identifier for the task
   *
   * @public
   */
  export const id: QueryType.StringProperty = p.str('id');

  /**
   * The type (grouping) for the task
   *
   * @public
   */
  export const type: QueryType.StringProperty = p.str('config', 'type');

  /**
   * Indicates whether the task is eligible for processing
   *
   * @public
   */
  export const enabled: QueryType.BooleanProperty = p.bool('config', 'enabled');

  /**
   * Unix ms epoch representing the time when the task was first created
   *
   * @public
   */
  export const createTime: QueryType.NumericProperty = p.num(
    'config',
    'createTime'
  );

  /**
   * Unix ms epoch representing the next time the task should be processed.
   * Can be earlier than the current time if the task is pending or currently
   * running and is undefined if the task is not running and has no future
   * runs scheduled.
   *
   * @public
   */
  export const nextRunTime: QueryType.NumericProperty = p.num(
    'config',
    'nextRunTime'
  );

  /**
   * Metadata about the most recent completed/failed run of the task. If the
   * task has neither failed a run, this is undefined.
   *
   * @public
   */
  export const lastRun: QueryType.ObjectProperty = p.obj('config', 'lastRun');

  /**
   * Unix ms epoch representing when the most recent run began processing. If
   * the task has neither completed nor failed a run, this is undefined.
   *
   * @public
   */
  export const lastRunStartTime: QueryType.NumericProperty = p.num(
    'config',
    'lastRun',
    'startTime'
  );

  /**
   * Unix ms epoch representing when the last run finished processing. If the
   * task has neither completed nor failed a run, this is undefined.
   *
   * @public
   */
  export const lastRunFinishTime: QueryType.NumericProperty = p.num(
    'config',
    'lastRun',
    'finishTime'
  );

  /**
   * Boolean indicating whether or not the most recent run succeeded or
   * failed. If the task has neither completed nor failed a run, this is
   * undefined.
   *
   * @public
   */
  export const lastRunSucceeded: QueryType.BooleanProperty = p.bool(
    'config',
    'lastRun',
    'succeeded'
  );

  /**
   * Number of times the task has been delivered for processing. This number
   * only includes deliveries that are not currently running and resets after
   * each time the task completes or fails a run.
   *
   * @public
   */
  export const deliveries: QueryType.NumericProperty = p.num(
    'config',
    'deliveries'
  );

  /**
   * Number of times task processing has been attempted unsuccessfully. This
   * number only includes attempts that are not currently running and resets
   * after each time the task completes or fails a run. It is similar to
   * deliveries but only increments for results that indicate some sort of
   * failure. These include calling {@link ActiveTask.retry} and when the
   * task's lock expires.
   *
   * @public
   */
  export const attempts: QueryType.NumericProperty = p.num(
    'config',
    'attempts'
  );

  /**
   * Number of times task processing has run to completion, regardless of
   * whether they ultimately succeeded or failed. This number only includes
   * previously completed runs. For one-time tasks, this will only ever be 0
   * or 1, but can be arbitrarily large for recurring tasks that have run many
   * times.
   *
   * @public
   */
  export const runs: QueryType.NumericProperty = p.num('config', 'runs');

  /**
   * If defined, the schedule on which to run the task. If it is a number, it
   * represents the number of milliseconds between each run of the task. If it
   * is a string, it is a cron string indicating the schedule on which to run.
   *
   * @public
   */
  export const interval: QueryType.Property = p.base('config', 'interval');

  /**
   * User-defined payload holding information about the task. If called with
   * no arguments, it points to the entire payload. However, you can also
   * reference portions of the payload by providing arguments to the function.
   * Each argument represents a property name or array index that, when
   * combined, form a path to a property in the payload.
   *
   * @example Retrieve the full payload
   *
   * ```ts
   * t.payload()
   * ```
   *
   * @example Retrieve payload.prop[2]
   *
   * ```ts
   * t.payload('prop', 2)
   * ```
   *
   * @public
   */
  export const payload = (...path: (string | number)[]): QueryType.Property =>
    p.base('payload', ...path);

  const lockedUntilTime: QueryType.NumericProperty = p.num(
    'config',
    'lockedUntilTime'
  );

  /**
   * Status is a derived property. It does not behave as a property because it
   * is computed dynamically, but this helper can be used to determine whether
   * the status belongs to each of the possible states.
   *
   * @param status  - Status to check the task for
   *
   * @public
   */
  export const hasStatus = (status: TaskStatus): QueryType.Bool => {
    const now = Date.now();

    switch (status) {
      case TaskStatus.Scheduled:
        // Enabled AND we haven't reached the nextRunTime
        return q.and(enabled, q.greaterThan(nextRunTime, now));
      case TaskStatus.Pending:
        return q.and(
          // The job is enabled
          enabled,
          // We have passed the next run time
          q.lessThanOrEqual(nextRunTime, now),
          // But there is no active lock
          q.lessThan(lockedUntilTime, now)
        );
      case TaskStatus.Running:
        return q.and(
          // The job is enabled
          enabled,
          // We have passed the next run time
          q.lessThanOrEqual(nextRunTime, now),
          // And there is an active lock
          q.greaterThanOrEqual(lockedUntilTime, now)
        );
      case TaskStatus.Completed:
        return q.and(
          // We don't have a next run
          q.not(q.isDefined(nextRunTime)),
          // And the last run succeeded (also implies there was a last run)
          lastRunSucceeded
        );
      case TaskStatus.Failed:
        return q.and(
          // We don't have a next run
          q.not(q.isDefined(nextRunTime)),
          // And either we don't have a last run, or the last run didn't succeed
          q.or(q.not(q.isDefined(lastRun)), q.not(lastRunSucceeded))
        );
      case TaskStatus.Disabling:
        return q.and(
          // The job is disabled
          q.not(enabled),
          // There is a next run
          q.isDefined(nextRunTime),
          // The next run has passed
          q.lessThanOrEqual(nextRunTime, now),
          // And there is an active lock
          q.greaterThanOrEqual(lockedUntilTime, now)
        );
      case TaskStatus.Disabled:
        return q.and(
          // The job is disabled
          q.not(enabled),
          // There is a next run
          q.isDefined(nextRunTime),
          q.or(
            // Either we haven't reached the next run time
            q.greaterThan(nextRunTime, now),
            // Or there is no active lock
            q.lessThan(lockedUntilTime, now)
          )
        );
    }
  };
}

export default t;
