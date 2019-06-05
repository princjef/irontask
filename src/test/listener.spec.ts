/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as util from 'util';

import moment = require('moment');

import TaskClient, {
  ErrorCode,
  Interceptors,
  IronTaskError,
  Listener,
  NO_RETRY,
  ProcessingResult,
  Task,
  TaskClientOptions,
  TaskStatus
} from '..';

import initialize from './harness';

describe('Listener', () => {
  let client: TaskClient;
  let getClient: (options?: TaskClientOptions) => TaskClient;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const harness = await initialize({
      // We set a very aggressive poll interval so we can get through
      // tests quickly
      pollIntervalMs: 250
    });
    client = harness.client;
    getClient = harness.getClient;
    cleanup = harness.cleanup;

    // Avoid negative clock skew
    let highestTime = Date.now();
    const originalDateNow = Date.now;
    jest.spyOn(Date, 'now').mockImplementation(() => {
      highestTime = Math.max(originalDateNow(), highestTime);
      return highestTime;
    });
  }, 30000);

  afterAll(async () => {
    await cleanup();
  });

  it('receives and completes a pending task automatically on return', async () => {
    const scoped = client.type('listen-simple');

    const createdTask = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(task => {
      expect(task.id).toBe(createdTask.id);
      expect(task.type).toBe(createdTask.type);
      expect(task.status).toBe(TaskStatus.Running);
      expect(task.enabled).toBe(createdTask.enabled);
      expect(task.createTime).toEqual(createdTask.createTime);
      expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
      expect(task.lastUpdatedTime.getTime()).toBeGreaterThanOrEqual(
        createdTask.lastUpdatedTime.getTime()
      );
      expect(task.lastRun).toEqual(createdTask.lastRun);
      expect(task.currentRunStartTime).toEqual(expect.any(Date));
      expect(task.deliveries).toBe(createdTask.deliveries);
      expect(task.attempts).toBe(createdTask.attempts);
      expect(task.runs).toBe(createdTask.runs);
      expect(task.payload).toEqual(createdTask.payload);
      expect(task.interval).toBe(createdTask.interval);
      expect(task.locked).toBe(true);

      task.payload = { updated: 'data' };

      task.once('finished', result =>
        expect(result.result).toBe(ProcessingResult.Complete)
      );
    });

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(createdTask.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.lastUpdatedTime.getTime()).toBeGreaterThanOrEqual(
      createdTask.lastUpdatedTime.getTime()
    );
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
  });

  it('allows the task to be updated while processing', async () => {
    const scoped = client.type('listen-simple');

    const createdTask = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      task.payload = { updated: 'data' };
      await task.save();

      const updatedTask = await scoped.get<any>(task.id);
      expect(updatedTask).toBeDefined();
      expect(updatedTask!.payload).toEqual({ updated: 'data' });
    });

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(createdTask.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
  });

  it('renews the lock before it expires', async () => {
    const scoped = client.type('listen-renewLock');

    const task = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(
      async task => {
        await new Promise<void>(resolve => task.once('lockRenewed', resolve));
        task.payload = { updated: 'data' };
      },
      {
        lockDurationMs: 2500
      }
    );

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
  });

  it('renews the lock multiple times if necessary', async () => {
    const scoped = client.type('listen-renewLock');

    const task = await scoped.create({ initial: 'data' });

    const lockRenewedSpy = jest.fn();

    const listener = scoped.listen<any>(
      async task => {
        task.on('lockRenewed', lockRenewedSpy);
        task.payload = { updated: 'data' };
        await new Promise<void>(resolve => setTimeout(resolve, 2000));
        task.removeListener('lockRenewed', lockRenewedSpy);
      },
      {
        lockDurationMs: 1200
      }
    );

    await waitForProcessing(listener);

    // The lock should have been renewed twice, no more, no less
    expect(lockRenewedSpy).toHaveBeenCalledTimes(2);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
  });

  it('retries if the handler throws', async () => {
    const scoped = client.type('listen-throw');

    const task = await scoped.create({ initial: 'data' });

    let deliveryCount = 0;
    let startTime: Date | undefined;
    const listener = scoped.listen<any>(task => {
      if (deliveryCount === 0) {
        startTime = task.currentRunStartTime;
      } else {
        // Start time should not change between attempts/deliveries of a single
        // run
        expect(task.currentRunStartTime).toEqual(startTime);
      }

      deliveryCount += 1;
      task.payload = { updated: 'data' };

      // Throw up on the first attempt
      if (task.attempts === 0) {
        throw new Error('failed');
      }
    });

    await waitForProcessing(listener, 2);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
    expect(deliveryCount).toEqual(2);
  });

  it('can be explicitly completed', async () => {
    const scoped = client.type('listen-complete');

    const task = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      task.payload = { updated: 'data' };

      await task.complete();
    });

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
  });

  it('can be completed with an overridden next run time', async () => {
    const scoped = client.type('listen-completeDelay');

    const task = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      task.payload = { updated: 'data' };

      if (task.runs === 0) {
        await task.complete(500);
      } else {
        await task.complete();
      }
    });

    await waitForProcessing(listener, 2);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
    expect(afterTask!.runs).toBe(2);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
  });

  it('can be explicitly retried', async () => {
    const scoped = client.type('listen-retry');

    const task = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      if (task.deliveries === 0) {
        task.payload = { updated: 'data' };
        await task.retry(new Error('retrying'));
      }
    });

    await waitForProcessing(listener, 2);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
  });

  it('can be passed a custom delay on retry', async () => {
    const scoped = client.type('listen-retryCustomDelay');

    const task = await scoped.create({ initial: 'data' });

    let startTime: Date | undefined;

    const listener = scoped.listen<any>(async task => {
      startTime = task.currentRunStartTime;
      task.payload = { updated: 'data' };
      await task.retry(new Error('retrying'), 30000);
    });

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Scheduled);
    expect(afterTask!.nextRunTime).toBeDefined();
    expect(afterTask!.nextRunTime!.getTime()).toBeGreaterThan(
      moment()
        .add(25, 'seconds')
        .valueOf()
    );
    expect(afterTask!.payload).toEqual({ updated: 'data' });
    expect(afterTask!.runs).toBe(0);
    expect(afterTask!.attempts).toBe(1);
    expect(afterTask!.deliveries).toBe(1);
    expect(afterTask!.lastRun).toBeUndefined();
    expect(afterTask!.currentRunStartTime).toBeDefined();
    expect(afterTask!.currentRunStartTime).toEqual(startTime);
  });

  it('can be explicitly failed for permanent errors', async () => {
    const scoped = client.type('listen-fail');

    const task = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      task.payload = { updated: 'data' };
      await task.fail(new Error('failing'));
    });

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Failed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(false);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
  });

  it('can be deferred to be redelivered without consuming retries', async () => {
    const scoped = client.type('listen-defer');

    const task = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      // Defer should not increment attempts
      expect(task.attempts).toBe(0);

      if (task.deliveries === 0) {
        task.payload = { updated: 'data' };
        await task.defer(1000);
      }
    });

    await waitForProcessing(listener, 2);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
  });

  it('can be released to be redelivered immediately without consuming retries (used for disable)', async () => {
    const scoped = client.type('listen-release');

    const task = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      // Release should not increment attempts
      expect(task.attempts).toBe(0);

      if (task.deliveries === 0) {
        task.payload = { updated: 'data' };
        await task.release();
      }
    });

    await waitForProcessing(listener, 2);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
  });

  it('can be deleted while processing', async () => {
    const scoped = client.type('listen-delete');

    const task = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      await task.delete();
    });

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeUndefined();
  });

  it('can be force released to stop processing without informing the database (use as last resort)', async () => {
    const scoped = client.type('listen-forceRelease');

    const task = await scoped.create({ initial: 'data' });

    let startTime: Date | undefined;

    const listener = scoped.listen<any>(task => {
      startTime = task.currentRunStartTime;
      task.payload = { updated: 'data' };
      task.forceRelease();
    });

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    // The status is still running because the server still thinks the
    // listener has a lock on the task. This is because we never told the
    // server we were done.
    expect(afterTask!.status).toBe(TaskStatus.Running);
    expect(afterTask!.nextRunTime).toEqual(task.nextRunTime);
    expect(afterTask!.payload).toEqual({ initial: 'data' });
    expect(afterTask!.runs).toBe(0);
    expect(afterTask!.lastRun).not.toBeDefined();
    expect(afterTask!.currentRunStartTime).toEqual(startTime);
  });

  it('does not retry if the NO_RETRY constant is provided', async () => {
    const scoped = client.type('listen-throw');

    const task = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(
      async task => {
        task.payload = { updated: 'data' };
        throw new Error('failed');
      },
      { retries: NO_RETRY }
    );

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Failed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    // Throwing should not cause a save
    expect(afterTask!.payload).toEqual({ initial: 'data' });
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(false);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
  });

  it('does not allow multiple finishing calls to be made concurrently', async () => {
    const scoped = client.type('listen-concurrent');

    const task = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      task.payload = { updated: 'data' };

      // We start the completion and grab the promise so we can start
      // another completion concurrently. DO NOT do this in real code.
      const completePromise = task.complete();

      try {
        await task.retry(new Error('boom'));
      } catch (err) {
        expect(
          IronTaskError.is(err, ErrorCode.PROCESSING_FINISH_IN_PROGRESS)
        ).toBe(true);
      }

      await completePromise;
    });

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
  });

  it('does not allow multiple finishing calls to be made consecutively if already finished', async () => {
    const scoped = client.type('listen-alreadyFinished');

    const task = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      task.payload = { updated: 'data' };

      await task.complete();

      try {
        await task.fail(new Error('boom'));
        throw new Error('should have thrown');
      } catch (err) {
        expect(
          IronTaskError.is(err, ErrorCode.PROCESSING_ALREADY_FINISHED)
        ).toBe(true);
      }
    });

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
  });

  it('does not allow finishing calls to be made if the lock was already lost', async () => {
    const scoped = client.type('listen-lockLost');

    const task = await scoped.create(
      { initial: 'data' },
      {
        // We only let the task run for 1 second to guarantee a lock lost
        // error within the test time
        maxExecutionTimeMs: 1000
      }
    );

    let startTime: Date | undefined;

    const listener = scoped.listen<any>(
      async task => {
        startTime = task.currentRunStartTime;
        task.payload = { updated: 'data' };

        // We tell the listener to stop once we've received the task. This
        // prevents the listener from being able to receive any future
        // deliveries of tasks (including future deliveries of this one).
        listener.stop();

        // Wait for the lock to be lost, then try to complete
        await new Promise<void>(resolve => task.once('lockLost', resolve));

        try {
          await task.complete();
          throw new Error('should have thrown');
        } catch (err) {
          expect(IronTaskError.is(err, ErrorCode.PROCESSING_LOCK_LOST)).toBe(
            true
          );
        }
      },
      {
        lockDurationMs: 1500,
        maxActiveTasks: 1
      }
    );

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Pending);
    expect(afterTask!.nextRunTime).toBeDefined();
    expect(afterTask!.payload).toEqual({ initial: 'data' });
    expect(afterTask!.runs).toBe(0);
    expect(afterTask!.deliveries).toBe(1);
    expect(afterTask!.attempts).toBe(1);
    expect(afterTask!.lastRun).toBeUndefined();
    expect(afterTask!.currentRunStartTime).toEqual(startTime);
  });

  it('is notified if the currently running task is disabled', async () => {
    const scoped = client.type('listen-disable');

    const createdTask = await scoped.create({ initial: 'data' });

    let startTime: Date | undefined;

    const listener = scoped.listen<any>(
      async task => {
        startTime = task.currentRunStartTime;

        task.payload = { updated: 'data' };

        // We disable the created task now so we know the signal won't
        // propagate until after we start listening to it
        await createdTask.disable();
        expect(createdTask.status).toBe(TaskStatus.Disabling);

        // Wait until we're informed that the task is disabled
        await new Promise<void>(resolve => task.once('disabled', resolve));

        // Explicitly release the task so that it doesn't get autoamtically
        // completed
        await task.release();
      },
      {
        // Set a very aggressive refresh interval to get through things
        // faster
        refreshIntervalMs: 250
      }
    );

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(createdTask.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.nextRunTime).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Disabled);
    expect(afterTask!.payload).toEqual({ updated: 'data' });
    expect(afterTask!.runs).toBe(0);
    expect(afterTask!.deliveries).toBe(1);
    expect(afterTask!.attempts).toBe(0);
    expect(afterTask!.lastRun).toBeUndefined();
    expect(afterTask!.currentRunStartTime).toEqual(startTime);
  });

  it('does nothing if forceRelease is called after task processing finishes', async () => {
    const scoped = client.type('listen-lateForceRelease');

    const task = await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      task.payload = { updated: 'data' };

      await task.complete();

      // Does nothing. all data reflects the state from completing the task
      task.forceRelease();
    });

    await waitForProcessing(listener);

    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.nextRunTime).toBeUndefined();
    expect(afterTask!.payload).toEqual({ updated: 'data' });
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.lastRun).toBeDefined();
    expect(afterTask!.lastRun!.succeeded).toBe(true);
    expect(afterTask!.currentRunStartTime).toBeUndefined();
  });

  it('can be serialized with toJSON()', async () => {
    const scoped = client.type('listen-toJSON');

    await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      expect(task.toJSON()).toEqual({
        id: task.id,
        type: task.type,
        status: TaskStatus.Running,
        enabled: true,
        createTime: task.createTime,
        nextRunTime: task.nextRunTime!.toISOString(),
        lastUpdatedTime: task.lastUpdatedTime.toISOString(),
        lastRun: undefined,
        currentRunStartTime: undefined,
        deliveries: 0,
        attempts: 0,
        runs: 0,
        payload: { initial: 'data' },
        interval: undefined,
        locked: true
      });
    });

    await waitForProcessing(listener);
  });

  it('can be serialized via util inspect (console.log)', async () => {
    const scoped = client.type('listen-utilInspect');

    await scoped.create({ initial: 'data' });

    const listener = scoped.listen<any>(async task => {
      expect(task[util.inspect.custom]()).toEqual(task.toJSON());
    });

    await waitForProcessing(listener);
  });

  it('limits the number of active tasks to the concurrency specified', async () => {
    const scoped = client.type('listen-concurrency');

    for (let i = 0; i < 12; i += 1) {
      await scoped.create({ index: i });
    }

    const listener = scoped.listen<any>(
      async task => {
        expect(listener.activeTaskCount).toBeLessThanOrEqual(5);
        // Give some time for more tasks to be picked up to make sure we're
        // not pulling back more than we should
        await new Promise<void>(resolve => setTimeout(resolve, 250));
        expect(listener.activeTaskCount).toBeLessThanOrEqual(5);
      },
      {
        maxActiveTasks: 5
      }
    );

    expect(listener.running).toBe(true);

    await waitForProcessing(listener, 12);

    expect(listener.running).toBe(false);

    for await (const task of scoped.iterate()) {
      expect(task.status).toBe(TaskStatus.Completed);
    }
  });

  it('marks appropriate tasks for automatic cleanup', async () => {
    const scoped = client.type('listen-cleanup');

    const initialTask = await scoped.create(
      { initial: 'data' },
      { ttlMs: 1000 }
    );

    const listener = scoped.listen<any>(async task => {});

    await waitForProcessing(listener);

    // The task should exist immediately after processing finishes
    const afterProcessingTask = await scoped.get<any>(initialTask.id);
    expect(afterProcessingTask).toBeDefined();
    expect(afterProcessingTask!.status).toBe(TaskStatus.Completed);

    // Wait a little bit, now the task is gone
    await new Promise<void>(resolve => setTimeout(resolve, 2000));
    const deletedTask = await scoped.get<any>(initialTask.id);
    expect(deletedTask).toBeUndefined();
  });

  it('keeps the automatic cleanup time up to date as the task is saved', async () => {
    const scoped = client.type('listen-cleanupUpdate');

    const initialTask = await scoped.create(
      { initial: 'data' },
      { ttlMs: 5000 }
    );

    const listener = scoped.listen<any>(async task => {});

    await waitForProcessing(listener);

    // The task should exist immediately after processing finishes
    const afterProcessingTask = await scoped.get<any>(initialTask.id);
    expect(afterProcessingTask).toBeDefined();
    expect(afterProcessingTask!.status).toBe(TaskStatus.Completed);

    // Wait a little bit and update the task
    await new Promise<void>(resolve => setTimeout(resolve, 3500));
    const updateTask = await scoped.get<any>(initialTask.id);
    expect(updateTask).toBeDefined();
    updateTask!.payload = { postCompletion: 'update' };
    await updateTask!.save();

    // Wait until the original ttl has passed but not long enough for the
    // full ttl to elapse after the update. The task should be gone.
    await new Promise<void>(resolve => setTimeout(resolve, 2500));
    const deletedTask = await scoped.get<any>(initialTask.id);
    expect(deletedTask).toBeUndefined();
  }, 10000);

  it('lets currently running tasks finish when stopping', async () => {
    const scoped = client.type('listen-stop');

    const task1 = await scoped.create({ index: 1 });
    const task2 = await scoped.create({ index: 2 });

    const listener = scoped.listen<any>(
      async task => {
        // Stop the listener as soon as we start running the task
        listener.stop();

        await task.complete();
      },
      {
        maxActiveTasks: 1
      }
    );

    await waitForProcessing(listener, 1, false);

    // After the first processing run, we should have one task that fully
    // completed and one task that never ran
    expect(listener.running).toBe(false);
    const middleTask1 = await scoped.get<any>(task1.id);
    expect(middleTask1).toBeDefined();
    expect(middleTask1!.status).toBe(TaskStatus.Completed);
    const middleTask2 = await scoped.get<any>(task2.id);
    expect(middleTask2).toBeDefined();
    expect(middleTask2!.status).toBe(TaskStatus.Pending);

    // Now we restart the listener to let it process the second task
    listener.start();
    expect(listener.running).toBe(true);

    await waitForProcessing(listener);

    // After the second processing run, everything should be complete
    expect(listener.running).toBe(false);
    const afterTask1 = await scoped.get<any>(task1.id);
    expect(afterTask1).toBeDefined();
    expect(afterTask1!.status).toBe(TaskStatus.Completed);
    const afterTask2 = await scoped.get<any>(task2.id);
    expect(afterTask2).toBeDefined();
    expect(afterTask2!.status).toBe(TaskStatus.Completed);
  });

  it('automatically releases all active tasks when destroying', async () => {
    const scoped = client.type('listen-destroy');

    const task = await scoped.create({ index: 1 });

    const listener = scoped.listen<any>(async task => {
      // Destroy the listener as soon as we start running the task
      await listener.destroy();

      try {
        await task.complete();
        throw new Error('should have thrown');
      } catch (err) {
        expect(
          IronTaskError.is(err, ErrorCode.PROCESSING_ALREADY_FINISHED)
        ).toBe(true);
      }
    });

    await waitForProcessing(listener, 1, false);

    // The task should be released
    expect(listener.running).toBe(false);
    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Pending);
    expect(afterTask!.runs).toBe(0);
    expect(afterTask!.attempts).toBe(0);
    expect(afterTask!.deliveries).toBe(1);
  });

  it('lets tasks that are currently finishing finish before releasing them when destroying', async () => {
    const scoped = client.type('listen-destroyAfter');

    const task = await scoped.create({ index: 1 });

    const listener = scoped.listen<any>(async task => {
      // Start completing before destroying but don't finish it
      const completePromise = task.complete();

      // Destroy the listener as soon as we start completing
      await Promise.all([completePromise, listener.destroy()]);
    });

    await waitForProcessing(listener, 1, false);

    // The task should be completed
    const afterTask = await scoped.get<any>(task.id);
    expect(afterTask).toBeDefined();
    expect(afterTask!.status).toBe(TaskStatus.Completed);
    expect(afterTask!.runs).toBe(1);
    expect(afterTask!.attempts).toBe(0);
    expect(afterTask!.deliveries).toBe(0);
  });

  it('does not allow an already destroyed client to be destroyed again (avoids race conditions)', async () => {
    const scoped = client.type('listen-doubleDestroy');

    const listener = scoped.listen<any>(() => {});

    const destroyPromise = listener.destroy();

    try {
      await listener.destroy();
      throw new Error('should have thrown');
    } catch (err) {
      expect(IronTaskError.is(err, ErrorCode.LISTENER_DESTROYED)).toBe(true);
    }

    await destroyPromise;
  });

  describe('interceptors', () => {
    it('captures information about the request', async () => {
      const type = 'listen-simpleInterceptor';
      let createdTask: Task<any>;

      const processingInterceptor = jest.fn((async (ctx, next) => {
        expect(ctx.task.id).toBe(createdTask.id);
        expect(ctx.task.type).toBe(type);
        const result = await next();
        expect(result).toBe(ProcessingResult.Complete);
      }) as Interceptors.ProcessingInterceptor);

      const localClient = getClient({
        interceptors: {
          processing: processingInterceptor
        }
      });

      const scoped = localClient.type(type);

      createdTask = await scoped.create({ initial: 'data' });

      const listener = scoped.listen<any>(task => {
        expect(task.id).toBe(createdTask.id);
        expect(task.type).toBe(createdTask.type);
        expect(task.status).toBe(TaskStatus.Running);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastUpdatedTime.getTime()).toBeGreaterThanOrEqual(
          createdTask.lastUpdatedTime.getTime()
        );
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.currentRunStartTime).toEqual(expect.any(Date));
        expect(task.deliveries).toBe(createdTask.deliveries);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.payload).toEqual(createdTask.payload);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.locked).toBe(true);

        task.payload = { updated: 'data' };

        task.once('finished', result =>
          expect(result.result).toBe(ProcessingResult.Complete)
        );
      });

      await waitForProcessing(listener);

      const afterTask = await scoped.get<any>(createdTask.id);
      expect(afterTask).toBeDefined();
      expect(afterTask!.status).toBe(TaskStatus.Completed);
      expect(afterTask!.nextRunTime).toBeUndefined();
      expect(afterTask!.runs).toBe(1);
      expect(afterTask!.lastRun).toBeDefined();
      expect(afterTask!.lastRun!.succeeded).toBe(true);
      expect(afterTask!.currentRunStartTime).toBeUndefined();
      expect(afterTask!.payload).toEqual({ updated: 'data' });

      expect(processingInterceptor).toHaveBeenCalledTimes(1);
    });

    it('reports processing errors', async () => {
      const type = 'listen-retryInterceptor';
      const error = new Error('something went wrong');
      let createdTask: Task<any>;

      const processingInterceptor = jest.fn((async (ctx, next) => {
        expect(ctx.task.id).toBe(createdTask.id);
        expect(ctx.task.type).toBe(type);
        const result = await next();
        expect(result).toBe(ProcessingResult.Retry);
        expect(ctx.error).toBe(error);
        expect(ctx.delayMs).toBe(500);
      }) as Interceptors.ProcessingInterceptor);

      const localClient = getClient({
        interceptors: {
          processing: processingInterceptor
        }
      });

      const scoped = localClient.type(type);

      createdTask = await scoped.create({ initial: 'data' });

      const listener = scoped.listen<any>(async task => {
        await task.retry(new Error('something went wrong'), 500);
      });

      await waitForProcessing(listener);

      expect(processingInterceptor).toHaveBeenCalledTimes(1);
    });

    it('throws if it tries to call next multiple times', async () => {
      const type = 'listen-interceptorDuplicate';
      let createdTask: Task<any>;

      const processingInterceptor = jest.fn((async (ctx, next) => {
        expect(ctx.task.id).toBe(createdTask.id);
        expect(ctx.task.type).toBe(type);
        await next();
        try {
          await next();
          fail('should have thrown');
        } catch (err) {
          expect(
            IronTaskError.is(
              err,
              ErrorCode.INTERCEPTOR_NEXT_FUNCTION_ALREADY_CALLED
            )
          ).toBe(true);
          throw err;
        }
      }) as Interceptors.ProcessingInterceptor);

      const localClient = getClient({
        interceptors: {
          processing: processingInterceptor
        }
      });

      const scoped = localClient.type(type);

      createdTask = await scoped.create({ initial: 'data' });

      const listener = scoped.listen<any>(async task => {});

      await waitForProcessing(listener);

      expect(processingInterceptor).toHaveBeenCalledTimes(1);
    });
  });
});

/**
 * Wait for the provided listener to process the number of tasks provided.
 * Defaults to waiting for one task processing.
 *
 * @param listener          Listener to wait for
 * @param count             Number of received tasks to wait for (includes
 *                          retries, reruns)
 * @param destroyOnFinish   If true, destroys the listener once processing
 *                          finished for the specified count.
 */
async function waitForProcessing(
  listener: Listener<any>,
  count: number = 1,
  destroyOnFinish: boolean = true
) {
  await new Promise<void>(resolve => {
    let runningCount = count;
    const handler = () => {
      // Keep counting down until we exhaust the count
      runningCount -= 1;
      if (runningCount <= 0) {
        listener.removeListener('finishedTask', handler);
        resolve();
      }
    };

    listener.on('finishedTask', handler);
  });

  if (destroyOnFinish) {
    await listener.destroy();
  }
}
