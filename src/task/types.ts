/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Base data and functionality that is common to tasks created and used in any
 * context.
 *
 * @public
 */
export interface TaskBase<T> {
  /**
   * Unique identifier for the task
   *
   * @public
   */
  readonly id: string;

  /**
   * The type (grouping) for the task
   *
   * @public
   */
  readonly type: string;

  /**
   * Current status of the task
   *
   * @public
   */
  readonly status: TaskStatus;

  /**
   * Indicates whether the task is eligible for processing
   *
   * @public
   */
  readonly enabled: boolean;

  /**
   * Date representing the time when the task was first created
   *
   * @public
   */
  readonly createTime: Date;

  /**
   * Date representing the next time the task should be processed. Can be
   * earlier than the current time if the task is pending or currently running
   * and is undefined if the task is not running and has no future runs
   * scheduled.
   *
   * @public
   */
  readonly nextRunTime?: Date;

  /**
   * Date representing the last time the task was updated, either explicitly or
   * as a part of task processing.
   *
   * @public
   */
  readonly lastUpdatedTime: Date;

  /**
   * Metadata about the most recent completed/failed run of the task. If the
   * task has never completed or failed a run, this is undefined.
   *
   * @public
   */
  readonly lastRun?: {
    /**
     * Date representing when the last run began processing.
     *
     * @public
     */
    readonly startTime: Date;

    /**
     * Date representing when the last run finished processing.
     *
     * @public
     */
    readonly finishTime: Date;

    /**
     * Indicates whether or not the mast recent run succeeded or failed.
     *
     * @public
     */
    readonly succeeded: boolean;
  };

  /**
   * Date representing the time when the current run of the task began, if there
   * is a current run.
   *
   * @remarks
   *
   * It will be present for any task which has begun running but has not yet
   * finished for any reason, including because it was disabled while running.
   * It will only be defined if there is an uncompleted run of the task.
   *
   * @public
   */
  readonly currentRunStartTime?: Date;

  /**
   * Number of times the task has been delivered for processing. This number
   * only includes deliveries that are not currently running and resets after
   * each time the task completes or fails a run.
   *
   * @public
   */
  readonly deliveries: number;

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
  readonly attempts: number;

  /**
   * Number of times task processing has run to completion, regardless of
   * whether they ultimately succeeded or failed. This number only includes
   * previously completed runs. For one-time tasks, this will only ever be 0
   * or 1, but can be arbitrarily large for recurring tasks that have run many
   * times.
   *
   * @public
   */
  readonly runs: number;

  /**
   * User-defined payload holding information about the task.
   *
   * @public
   */
  readonly payload: T;

  /**
   * If defined, the schedule on which to run the task. If it is a number, it
   * represents the number of milliseconds between each run of the task. If it
   * is a string, it is a cron string indicating the schedule on which to run.
   *
   * @public
   */
  readonly interval?: string | number;

  /**
   * If defined, the schedule task will end at this time.
   *
   * @public
   */
  readonly endTime?: Date;

  /**
   * Convert the task to a serialization-friendly format
   *
   * @public
   */
  toJSON(): SerializedTask<T>;
}

/**
 * Representation of a task converted to a plain JSON object. Created by {@link
 * TaskBase.toJSON} and derivatives.
 *
 * @public
 */
export interface SerializedTask<T> {
  /**
   * Unique identifier for the task
   *
   * @public
   */
  id: string;

  /**
   * The type (grouping) for the task
   *
   * @public
   */
  type: string;

  /**
   * Current status of the task
   *
   * @public
   */
  status: TaskStatus;

  /**
   * Indicates whether the task is eligible for processing
   *
   * @public
   */
  enabled: boolean;

  /**
   * ISO date string representing the time when the task was first created
   *
   * @public
   */
  createTime: string;

  /**
   * ISO date string representing the next time the task should be processed.
   * Can be earlier than the current time if the task is pending or currently
   * running and is undefined if the task is not running and has no future
   * runs scheduled.
   *
   * @public
   */
  nextRunTime?: string;

  /**
   * ISO date string representing the last time the task was updated, either
   * explicitly or as a part of task processing.
   *
   * @public
   */
  lastUpdatedTime: string;

  /**
   * Metadata about the most recent completed/failed run of the task. If the
   * task has never completed or failed a run, this is undefined.
   *
   * @public
   */
  lastRun?: {
    /**
     * ISO date string representing when the last run began processing.
     *
     * @public
     */
    startTime: string;

    /**
     * ISO date string representing when the last run finished processing.
     *
     * @public
     */
    finishTime: string;

    /**
     * Indicates whether or not the most recent run succeeded or failed.
     *
     * @public
     */
    succeeded: boolean;
  };

  /**
   * ISO date string representing the time when the current run of the task
   * began, if there is a current run.
   *
   * @remarks
   *
   * It will be present for any task which has begun running but has not yet
   * finished for any reason, including because it was disabled while running.
   * It will only be defined if there is an uncompleted run of the task.
   *
   * @public
   */
  currentRunStartTime?: string;

  /**
   * Number of times the task has been delivered for processing. This number
   * only includes deliveries that are not currently running and resets after
   * each time the task completes or fails a run.
   *
   * @public
   */
  deliveries: number;

  /**
   * Number of times task processing has been attempted unsuccessfully. This
   * number only includes attempts that are not currently running and resets
   * after each time the task completes or fails a run. It is similar to
   * deliveries but only increments for results that indicate some sort of
   * failure. These include calling `retry()` on the task and when the task's
   * lock expires.
   *
   * @public
   */
  attempts: number;

  /**
   * Number of times task processing has run to completion, regardless of
   * whether they ultimately succeeded or failed. This number only includes
   * previously completed runs. For one-time tasks, this will only ever be 0
   * or 1, but can be arbitrarily large for recurring tasks that have run many
   * times.
   *
   * @public
   */
  runs: number;

  /**
   * User-defined payload holding information about the task.
   *
   * @public
   */
  payload: T;

  /**
   * If defined, the schedule on which to run the task. If it is a number, it
   * represents the number of milliseconds between each run of the task. If it
   * is a string, it is a cron string indicating the schedule on which to run.
   *
   * @public
   */
  interval?: string | number;

  /**
   * If defined, the schedule task will end at this time.
   *
   * @public
   */
  readonly endTime?: Date;
}

/**
 * Representation of a task that is currently being processed converted to a
 * plain JSON object. Created by {@link ActiveTask.toJSON}.
 *
 * @public
 */
export interface SerializedActiveTask<T> extends SerializedTask<T> {
  /**
   * Indicates whether the current processor has a valid lock on the task. If
   * this becomes false, the handler will no longer be allowed to update or
   * finish the task processing to avoid race conditions with other
   * processors.
   *
   * @public
   */
  locked: boolean;
}

/**
 * Enumeration of all of the possible outcomes when processing a task.
 *
 * @public
 */
export enum ProcessingResult {
  /**
   * Processing finished successfully
   *
   * @public
   */
  Complete = 'complete',

  /**
   * Processing failed permanently or retried too many times
   *
   * @public
   */
  Fail = 'fail',

  /**
   * Processing failed but should be attempted again
   *
   * @public
   */
  Retry = 'retry',

  /**
   * Processing should be continued at a later time. Not considered a failure
   *
   * @public
   */
  Defer = 'defer',

  /**
   * Processing stopped without finishing. Generally used to finish disabling
   * a task or when destroying a listener.
   *
   * @public
   */
  Release = 'release',

  /**
   * Processing was stopped without informing the database. Generally used
   * when there is an issue communicating with the database when trying to
   * finish processing.
   *
   * @public
   */
  ForceRelease = 'forceRelease',

  /**
   * Processing stopped because the handler lost its lock on the task.
   *
   * @public
   */
  LockLost = 'lockLost',

  /**
   * The task was deleted by the processor.
   *
   * @public
   */
  Delete = 'delete'
}

/**
 * Enumeration of different representations of the current processing status of
 * a task.
 *
 * @public
 */
export enum TaskStatus {
  /**
   * The task is not currently running but is scheduled to run at a future
   * time.
   *
   * @public
   */
  Scheduled = 'scheduled',

  /**
   * The task is not currently running and its next scheduled run time has
   * already passed.
   *
   * @public
   */
  Pending = 'pending',

  /**
   * The task is currently being processed.
   *
   * @public
   */
  Running = 'running',

  /**
   * The task completed its most recent run successfully and has no future
   * runs scheduled.
   *
   * @public
   */
  Completed = 'completed',

  /**
   * The task failed its most recent run and has no future runs scheduled.
   *
   * @public
   */
  Failed = 'failed',

  /**
   * The task has been disabled, but a processor is still running the task
   * from a previous run.
   *
   * @public
   */
  Disabling = 'disabling',

  /**
   * The task has been disabled and is not running. The task will not run
   * again unless it is re-enabled.
   *
   * @public
   */
  Disabled = 'disabled'
}

/**
 * Representation of the current status of processing an {@link ActiveTask}.
 *
 * @public
 */
export enum ProcessingState {
  /**
   * The handler is currently processing the task.
   *
   * @public
   */
  Active,

  /**
   * The handler is currently trying to finish processing of the task.
   *
   * @public
   */
  Finishing,

  /**
   * The handler has finished processing the task.
   *
   * @public
   */
  Finished,

  /**
   * The handler lost its lock on the task while processing.
   *
   * @public
   */
  LockLost
}

/**
 * Information about the result of processing an {@link ActiveTask} and any
 * metadata provided as part of finishing.
 *
 * @public
 */
export interface TaskFinishMetadata {
  /**
   * The type of finish that occurred for processing the task. Each possible
   * result represents either one of the finishing functions in {@link
   * ActiveTask} or a background issue such as a lock being lost.
   *
   * @public
   */
  result: ProcessingResult;

  /**
   * The error that precipitated the finish, if any. This is provided by the
   * user for finishes such as {@link ActiveTask.fail} and {@link
   * ActiveTask.retry}.
   *
   * @public
   */
  error?: any;

  /**
   * The amount of time to wait before redelivery of the task. This may be
   * provided by the user, as in the case of {@link ActiveTask.complete} or
   * {@link ActiveTask.defer} or may be automatically computed from existing
   * retry options, as in {@link ActiveTask.retry}.
   *
   * @public
   */
  delayMs?: number;
}
