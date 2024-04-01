/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Return the next run time for a task. Returns undefined if the schedule end time has been reached
 *
 * @param nextRunTime Next scheduled run of the task
 * @param lastRunTime User defined schedule end time
 */
export default function isValidNextRun(
  nextRunTime: number,
  lastRunTime?: Date
): number | undefined {
  // If schedule for the task has completed we do not want to schedule next run
  if (lastRunTime && lastRunTime.getTime() <= nextRunTime) {
    return undefined;
  }
  return nextRunTime;
}
