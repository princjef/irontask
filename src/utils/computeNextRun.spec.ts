/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import moment = require('moment');

import computeNextRun from './computeNextRun';

describe('#computeNextRun', () => {
  it('sets the time to now for the first run of a one-time task', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    expect(computeNextRun()).toBe(now);
  });

  it('sets the time to undefined for a finished schedule', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    const lastRunTime = new Date(now + 1000);
    const previous = now - 100;
    expect(computeNextRun(10000, previous, lastRunTime)).toBe(undefined);
  });

  it('sets the time to undefined for a finished cron schedule', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    const minuteStart = moment(now).startOf('minute');
    const minutesIn = minuteStart.minutes() % 5;

    const lastRunTime = minuteStart.add(5 - minutesIn, 'minutes').toDate();
    const previous = now - 100;
    expect(computeNextRun('*/10 * * * *', previous, lastRunTime)).toBe(
      undefined
    );
  });

  it('sets the time to now for the first run of a task with a numeric interval', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    expect(computeNextRun(5000)).toBe(now);
  });

  it('sets the time to the next matching value for the first run of a task with a cron interval', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    const minuteStart = moment(now).startOf('minute');
    const minutesIn = minuteStart.minutes() % 5;

    const nextRun = minuteStart.add(5 - minutesIn, 'minutes').valueOf();

    // Every 5 minutes
    expect(computeNextRun('*/5 * * * *')).toBe(nextRun);
  });

  it('sets the time to undefined for a follow up run of a one-time task', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    const previous = now - 1230000;

    expect(computeNextRun(undefined, previous)).toBe(undefined);
  });

  it('sets the time to previous time + interval for the follow up of a task with a numeric interval', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    const previous = now - 1230000;

    expect(computeNextRun(5000, previous)).toBe(previous + 5000);
  });

  it('sets the time to the next matching value for a follow up run of a task with a cron interval', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    const previous = now - 1230000;

    const minuteStart = moment(previous).startOf('minute');
    const minutesIn = minuteStart.minutes() % 12;

    const nextRun = minuteStart.add(12 - minutesIn, 'minutes').valueOf();

    // Every 5 minutes
    expect(computeNextRun('*/12 * * * *', previous)).toBe(nextRun);
  });

  it('sets the time to the last day of the month', () => {
    const now = Date.now();
    jest.spyOn(Date, 'now').mockImplementation(() => now);

    const lastDayOfMonth = moment()
      .endOf('month')
      .date();
    const nextRuntime = computeNextRun('10 20 L * *');

    expect(nextRuntime).toBeDefined();
    expect(new Date(nextRuntime!).getDate()).toBe(lastDayOfMonth);
  });
});
