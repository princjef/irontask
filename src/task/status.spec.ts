/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import moment = require('moment');
import { v4 as uuid } from 'uuid';

import taskStatus, { isFinished } from './status';
import { TaskStatus } from './types';

describe('#taskStatus', () => {
  it('returns complete if the task is not enabled and is finished with its run', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: false,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: undefined,
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Completed);
  });

  it('returns failed if the task is not enabled and is finished with its last run, which failed', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: false,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: undefined,
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: false
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Failed);
  });

  it('returns disabled if the task is not enabled and has not yet run', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: false,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: moment()
            .add(1, 'minutes')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Disabled);
  });

  it('returns disabled if the task is not enabled and is waiting to run', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: false,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: moment()
            .subtract(5, 'seconds')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Disabled);
  });

  it('returns disabled if the task is not enabled and the current run is expired', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: false,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: moment()
            .subtract(10, 'seconds')
            .valueOf(),
          nextRunTime: moment()
            .subtract(1, 'minutes')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Disabled);
  });

  it('returns disabling if the task is not enabled and is currently running', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: false,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: moment()
            .add(1, 'minutes')
            .valueOf(),
          nextRunTime: moment()
            .subtract(30, 'seconds')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: uuid(),
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Disabling);
  });

  it('returns completed if the task is enabled and is finished with its run', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: true,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: undefined,
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Completed);
  });

  it('returns failed if the task is enabled and has no past or future runs', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: true,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: undefined,
          lastRun: undefined,
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Failed);
  });

  it('returns failed if the task is enabled and is finished with its last run, which failed', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: true,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: undefined,
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: false
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Failed);
  });

  it('returns scheduled if the task is enabled and has not yet run', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: true,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: moment()
            .add(1, 'minutes')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Scheduled);
  });

  it('returns pending if the task is not enabled and should be running but is not', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: true,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: moment()
            .subtract(5, 'seconds')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Pending);
  });

  it('returns pending if the task is enabled and the current run has had its lock expire', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: true,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: moment()
            .subtract(10, 'seconds')
            .valueOf(),
          nextRunTime: moment()
            .subtract(1, 'minutes')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Pending);
  });

  it('returns running if the task is enabled and has an active lock', () => {
    expect(
      taskStatus(
        {
          type: 'any-task',
          enabled: true,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: moment()
            .add(1, 'minutes')
            .valueOf(),
          nextRunTime: moment()
            .subtract(30, 'seconds')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: uuid(),
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(TaskStatus.Running);
  });
});

describe('#isFinished', () => {
  it('returns true if the task is completed', () => {
    expect(
      isFinished(
        {
          type: 'any-task',
          enabled: true,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: undefined,
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(true);
  });

  it('returns true if the task is failed', () => {
    expect(
      isFinished(
        {
          type: 'any-task',
          enabled: true,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: undefined,
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: false
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(true);
  });

  it('returns false if the task is scheduled', () => {
    expect(
      isFinished(
        {
          type: 'any-task',
          enabled: true,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: moment()
            .add(1, 'minutes')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(false);
  });

  it('returns false if the task is pending', () => {
    expect(
      isFinished(
        {
          type: 'any-task',
          enabled: true,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: moment()
            .subtract(5, 'seconds')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(false);
  });

  it('returns false if the task is running', () => {
    expect(
      isFinished(
        {
          type: 'any-task',
          enabled: true,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: moment()
            .add(1, 'minutes')
            .valueOf(),
          nextRunTime: moment()
            .subtract(30, 'seconds')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: uuid(),
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(false);
  });

  it('returns true if the task is not enabled and completed', () => {
    expect(
      isFinished(
        {
          type: 'any-task',
          enabled: false,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: undefined,
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(true);
  });

  it('returns false if the task is disabled', () => {
    expect(
      isFinished(
        {
          type: 'any-task',
          enabled: false,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: 0,
          nextRunTime: moment()
            .add(1, 'days')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: undefined,
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(false);
  });

  it('returns false if the task is disabling', () => {
    expect(
      isFinished(
        {
          type: 'any-task',
          enabled: false,
          createTime: moment()
            .subtract(1, 'days')
            .valueOf(),
          lockedUntilTime: moment()
            .add(1, 'minutes')
            .valueOf(),
          nextRunTime: moment()
            .subtract(30, 'seconds')
            .valueOf(),
          lastRun: {
            startTime: moment()
              .subtract(1, 'days')
              .valueOf(),
            finishTime: moment()
              .subtract(0.99, 'days')
              .valueOf(),
            succeeded: true
          },
          lockToken: uuid(),
          deliveries: 0,
          attempts: 0,
          runs: 1
        },
        Date.now()
      )
    ).toBe(false);
  });
});
