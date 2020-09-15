/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as cron from 'cron-parser';

import IronTaskError, { ErrorCode } from '../error';

/**
 * Computes the unix ms epoch when the task should be run next from the interval,
 * if one is provided. If no time is returned, the task should not be run again.
 *
 * @param interval      Number of milliseconds between runs or cron string.
 * @param previousStart If there was a previous run, the time when that run
 *                      started.
 */
export default function computeNextRun(
  interval?: string | number,
  previousStart?: number
): number | undefined {
  // Cron strings are treated the same way regardless of whether this is a
  // first run or not. We just compute the next valid time and use it.
  if (typeof interval === 'string') {
    try {
      return cron
        .parseExpression(interval, { currentDate: previousStart || Date.now() })
        .next()
        .getTime();
    } catch (e) {
      throw new IronTaskError(ErrorCode.INVALID_CRON_STRING_INTERVAL, e);
    }
  }

  // For non-cron strings, the first run is always the current time by default
  if (!previousStart) {
    return Date.now();
  }

  // If there is an interval and this is not the first run, just compute the
  // next run by adding the interval to the current time.
  if (interval) {
    return previousStart + interval;
  }

  // If we get here, it is not the first run and there is no interval, so we
  // have no more runs to do.
  return undefined;
}
