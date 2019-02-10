/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TaskDocument } from './document';
import { TaskStatus } from './types';

/**
 * Computes the current status of a task from the task document information.
 *
 * @param config    The configuration portion of the task document
 * @param now       The current unix ms time to use for computing task state
 */
export default function taskStatus(
  config: TaskDocument<any>['config'],
  now: number
): TaskStatus {
  const status = enabledTaskStatus(config, now);

  // Terminal states (Completed, Failed) override disabled
  if (
    config.enabled ||
    status === TaskStatus.Completed ||
    status === TaskStatus.Failed
  ) {
    return status;
  }

  // If the task is running and it's disabled, it's disabling
  if (status === TaskStatus.Running) {
    return TaskStatus.Disabling;
  }

  // If the task is disabled and not running, it's fully disabled
  return TaskStatus.Disabled;
}

/**
 * Returns true if the task is in a terminal state.
 *
 * @param config    The configuration portion of the task document
 * @param now       The current unix ms time to use for computing task state
 */
export function isFinished(
  config: TaskDocument<any>['config'],
  now: number
): boolean {
  const status = taskStatus(config, now);
  return status === TaskStatus.Completed || status === TaskStatus.Failed;
}

/**
 * Computes the current state of a task from the task document, excluding
 * disabled states.
 *
 * @param config    The configuration portion of the task document
 */
function enabledTaskStatus(
  config: TaskDocument<any>['config'],
  now: number
): TaskStatus {
  if (config.nextRunTime === undefined) {
    if (config.lastRun && config.lastRun.succeeded) {
      // No next run and a successful last run means we completed
      return TaskStatus.Completed;
    }
    // No next run and a failed last run means we failed
    return TaskStatus.Failed;
  }

  if (config.lockedUntilTime > now) {
    // We have a valid lock on the task. Set it to running
    return TaskStatus.Running;
  }
  if (config.nextRunTime < now) {
    // If we have reached the next run time and we don't have a lock, task
    // processing is pending
    return TaskStatus.Pending;
  }
  // If we haven't yet reached the next run time and we don't have a lock,
  // the task is scheduled
  return TaskStatus.Scheduled;
}
