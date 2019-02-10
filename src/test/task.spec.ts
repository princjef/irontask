/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as util from 'util';

import * as uuid from 'uuid/v4';

import TaskClient, {
  ErrorCode,
  Interceptors,
  IronTaskError,
  TaskClientOptions,
  TaskStatus
} from '..';

import initialize from './harness';

describe('Task', () => {
  let client: TaskClient;
  let getClient: (options?: TaskClientOptions) => TaskClient;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const harness = await initialize();
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

  describe('#save', () => {
    const type = 'task-save';

    afterAll(async () => {
      await client.delete(type);
    });

    it('updates the task payload with any changes made', async () => {
      const task = await client.create(type, {
        first: 'property',
        second: 123,
        arr: [true, false]
      });

      task.payload.first = 'updated';
      await task.save();

      expect(task.payload).toEqual({
        first: 'updated',
        second: 123,
        arr: [true, false]
      });

      const serverTask = await client.get<any>(type, task.id);

      expect(serverTask).toBeDefined();
      expect(serverTask!.payload).toEqual(task.payload);
    });

    it('only changes information we updated and does not modify our payload with updates from the server', async () => {
      const task = await client.create(type, {
        first: 'property',
        second: 123,
        arr: [true, false]
      });

      // We update some other task data on the server to make sure the
      // update touches the right data
      const taskCopy = await client.get<any>(type, task.id);
      taskCopy!.payload = {
        first: 'serverUpdated',
        second: false,
        arr: ['now', 'strings'],
        additional: 'prop'
      };
      await taskCopy!.save();

      // Now we update the task we were working with
      task.payload.first = 'updated';
      await task.save();

      // The payload should include our change but ignore changes made on the
      // server
      expect(task.payload).toEqual({
        first: 'updated',
        second: 123,
        arr: [true, false]
      });

      // Refetching data from the server should include changes from both edits
      // applied in the order that they were made
      const serverTask = await client.get<any>(type, task.id);
      expect(serverTask).toBeDefined();
      expect(serverTask!.payload).toEqual({
        first: 'updated',
        second: false,
        arr: ['now', 'strings'],
        additional: 'prop'
      });
    });

    it('does not allow multiple saves to be performed concurrently', async () => {
      const task = await client.create(type, {
        first: 'property',
        second: 123,
        arr: [true, false]
      });

      // First update
      task.payload.first = 'updated';
      const firstSavePromise = task.save();

      // Without waiting for the first save to complete, we make another
      // change and expect it to fail. DO NOT do this in your actual code!
      task.payload.second = 456;
      try {
        await task.save();
        throw new Error('should have thrown');
      } catch (err) {
        expect(
          IronTaskError.is(err, ErrorCode.TASK_ALREADY_SAVING_PAYLOAD)
        ).toBe(true);
      }

      // We now wait for our original save to go through. The second
      // update should not have impacted our original update.
      await firstSavePromise;

      // The payload should include all of the changes we made (including the
      // one we failed to save)
      expect(task.payload).toEqual({
        first: 'updated',
        second: 456,
        arr: [true, false]
      });

      // Refetching data from the server should reflect only the successful save
      const serverTask = await client.get<any>(type, task.id);
      expect(serverTask).toBeDefined();
      expect(serverTask!.payload).toEqual({
        first: 'updated',
        second: 123,
        arr: [true, false]
      });
    });
  });

  describe('#enable', async () => {
    const type = 'enable-task';

    afterAll(async () => {
      await client.delete(type);
    });

    it('enables the task if it was disabled', async () => {
      // Create a disabled task
      const task = await client.create(type, {}, { enabled: false });
      expect(task.status).toBe(TaskStatus.Disabled);

      // Enable the task
      await task.enable();
      expect(task.status).toBe(TaskStatus.Pending);

      // Check the task on the server. It should be enabled too
      const serverTask = await client.get<any>(type, task.id);
      expect(serverTask).toBeDefined();
      expect(serverTask!.status).toBe(TaskStatus.Pending);
      expect(serverTask!.enabled).toBe(true);
    });

    it('does nothing for tasks that are already enabled', async () => {
      // Create an enabled task
      const task = await client.create(type, {}, { enabled: true });
      expect(task.status).toBe(TaskStatus.Pending);

      // Enable the task
      await task.enable();
      expect(task.status).toBe(TaskStatus.Pending);

      // Check the task on the server. It should be enabled too
      const serverTask = await client.get<any>(type, task.id);
      expect(serverTask).toBeDefined();
      expect(serverTask!.status).toBe(TaskStatus.Pending);
      expect(serverTask!.enabled).toBe(true);
    });

    it('does not modify the task payload', async () => {
      // Create a disabled task
      const task = await client.create(
        type,
        { hello: 'world' },
        { enabled: false }
      );
      expect(task.status).toBe(TaskStatus.Disabled);

      // Grab a copy and update the payload on the server
      const taskCopy = await client.get<any>(type, task.id);
      taskCopy!.payload = { hello: 'cosmos' };
      await taskCopy!.save();

      // Enable the task
      await task.enable();
      expect(task.status).toBe(TaskStatus.Pending);
      expect(task.enabled).toBe(true);
      expect(task.payload).toEqual({ hello: 'world' });

      // Check the task on the server. It should be enabled too
      const serverTask = await client.get<any>(type, task.id);
      expect(serverTask).toBeDefined();
      expect(serverTask!.status).toBe(TaskStatus.Pending);
      expect(serverTask!.enabled).toBe(true);
      expect(serverTask!.payload).toEqual({ hello: 'cosmos' });
    });
  });

  describe('#disable', async () => {
    const type = 'disable-task';

    afterAll(async () => {
      await client.delete(type);
    });

    it('disables the task if it was disabled', async () => {
      // Create an enabled task
      const task = await client.create(type, {}, { enabled: true });
      expect(task.status).toBe(TaskStatus.Pending);

      // Disable the task
      await task.disable();
      expect(task.status).toBe(TaskStatus.Disabled);

      // Check the task on the server. It should be disabled too
      const serverTask = await client.get<any>(type, task.id);
      expect(serverTask).toBeDefined();
      expect(serverTask!.status).toBe(TaskStatus.Disabled);
      expect(serverTask!.enabled).toBe(false);
    });

    it('does nothing for tasks that are already disabled', async () => {
      // Create a disabled task
      const task = await client.create(type, {}, { enabled: false });
      expect(task.status).toBe(TaskStatus.Disabled);

      // Disable the task
      await task.disable();
      expect(task.status).toBe(TaskStatus.Disabled);

      // Check the task on the server. It should be disabled too
      const serverTask = await client.get<any>(type, task.id);
      expect(serverTask).toBeDefined();
      expect(serverTask!.status).toBe(TaskStatus.Disabled);
      expect(serverTask!.enabled).toBe(false);
    });

    it('does not modify the task payload', async () => {
      // Create an enabled task
      const task = await client.create(
        type,
        { hello: 'world' },
        { enabled: true }
      );
      expect(task.status).toBe(TaskStatus.Pending);

      // Grab a copy and update the payload on the server
      const taskCopy = await client.get<any>(type, task.id);
      taskCopy!.payload = { hello: 'cosmos' };
      await taskCopy!.save();

      // Disable the task
      await task.disable();
      expect(task.status).toBe(TaskStatus.Disabled);
      expect(task.enabled).toBe(false);
      expect(task.payload).toEqual({ hello: 'world' });

      // Check the task on the server. It should be disabled too
      const serverTask = await client.get<any>(type, task.id);
      expect(serverTask).toBeDefined();
      expect(serverTask!.status).toBe(TaskStatus.Disabled);
      expect(serverTask!.enabled).toBe(false);
      expect(serverTask!.payload).toEqual({ hello: 'cosmos' });
    });
  });

  describe('#delete', async () => {
    const type = 'delete-task';

    afterAll(async () => {
      await client.delete(type);
    });

    it('removes the task from the database', async () => {
      const task = await client.create(type, {});

      // Run the delete
      await task.delete();

      // Check the task on the server. It should be gone
      const serverTask = await client.get<any>(type, task.id);
      expect(serverTask).toBeUndefined();
    });

    it('succeeds if the task has already been deleted', async () => {
      const task = await client.create(type, {});

      // We delete the task out of band of the one we are working with
      await client.deleteOne(type, task.id);

      // Run the delete
      await task.delete();

      // Check the task on the server. It should be gone
      const serverTask = await client.get<any>(type, task.id);
      expect(serverTask).toBeUndefined();
    });
  });

  describe('#toJSON', async () => {
    const type = 'toJson-task';

    afterAll(async () => {
      await client.delete(type);
    });

    it('prints a JSON representation of the task', async () => {
      const task = await client.create<any>(type, { some: 'data' });

      const serialized = task.toJSON();

      expect(serialized.id).toBe(task.id);
      expect(serialized.type).toBe(task.type);
      expect(serialized.status).toBe(task.status);
      expect(serialized.enabled).toBe(task.enabled);
      expect(serialized.createTime).toBe(task.createTime.toISOString());
      expect(serialized.nextRunTime).toBe(task.nextRunTime!.toISOString());
      expect(serialized.lastRun).toBeUndefined();
      expect(serialized.deliveries).toBe(task.deliveries);
      expect(serialized.attempts).toBe(task.attempts);
      expect(serialized.runs).toBe(task.runs);
      expect(serialized.payload).toEqual(task.payload);
      expect(serialized.interval).toBe(task.interval);
    });
  });

  describe('util inspect', async () => {
    const type = 'utilInspect-task';

    afterAll(async () => {
      await client.delete(type);
    });

    it('returns the JSON representation of the task', async () => {
      const task = await client.create(type, {});

      expect(task[util.inspect.custom]()).toEqual(task.toJSON());
    });
  });

  describe('interceptors', () => {
    const type = 'interceptors-task';

    afterAll(async () => {
      await client.delete(type);
    });

    it('captures information about the request', async () => {
      const taskId = uuid();

      const taskInterceptor = jest.fn((async (ctx, next) => {
        expect(ctx.operation).toBe(Interceptors.TaskOperation.Save);
        expect(ctx.task.id).toBe(taskId);
        expect(ctx.task.type).toBe(type);
        expect(ctx.ruConsumption).toBeUndefined();
        await next();
        expect(ctx.ruConsumption).toBeGreaterThan(0);
      }) as Interceptors.TaskRequestInterceptor);

      const localClient = getClient({
        interceptors: {
          task: taskInterceptor
        }
      });

      const task = await localClient.create(
        type,
        {
          first: 'property',
          second: 123,
          arr: [true, false]
        },
        { id: taskId }
      );

      task.payload.first = 'updated';
      await task.save();

      expect(task.payload).toEqual({
        first: 'updated',
        second: 123,
        arr: [true, false]
      });

      expect(taskInterceptor).toHaveBeenCalledTimes(1);
    });

    it('captures request errors', async () => {
      const taskId = uuid();

      const taskInterceptor = jest.fn((async (ctx, next) => {
        expect(ctx.operation).toBe(Interceptors.TaskOperation.Save);
        expect(ctx.task.id).toBe(taskId);
        expect(ctx.task.type).toBe(type);
        expect(ctx.ruConsumption).toBeUndefined();
        try {
          await next();
          fail('should have thrown');
        } catch (err) {
          expect(ctx.ruConsumption).toBeGreaterThan(0);
          expect(
            IronTaskError.is(err, ErrorCode.DATABASE_RESOURCE_NOT_FOUND)
          ).toBe(true);
          throw err;
        }
      }) as Interceptors.TaskRequestInterceptor);

      const localClient = getClient({
        interceptors: {
          task: taskInterceptor
        }
      });

      const task = await localClient.create(
        type,
        {
          first: 'property',
          second: 123,
          arr: [true, false]
        },
        { id: taskId }
      );

      task.payload.first = 'updated';

      // We delete from the main client so that we'll get an error
      await client.deleteOne(type, taskId);

      try {
        await task.save();
        fail('should have thrown');
      } catch (err) {
        expect(
          IronTaskError.is(err, ErrorCode.DATABASE_RESOURCE_NOT_FOUND)
        ).toBe(true);
      }

      expect(taskInterceptor).toHaveBeenCalledTimes(1);
    });

    it('throws if it tries to call next multiple times', async () => {
      const taskInterceptor = jest.fn((async (ctx, next) => {
        expect(ctx.operation).toBe(Interceptors.TaskOperation.Save);
        expect(ctx.task.type).toBe(type);
        expect(ctx.ruConsumption).toBeUndefined();
        await next();
        await next();
      }) as Interceptors.TaskRequestInterceptor);

      const localClient = getClient({
        interceptors: {
          task: taskInterceptor
        }
      });

      const task = await localClient.create(type, {});

      try {
        await task.save();
        fail('should have thrown');
      } catch (err) {
        expect(
          IronTaskError.is(
            err,
            ErrorCode.INTERCEPTOR_NEXT_FUNCTION_ALREADY_CALLED
          )
        ).toBe(true);
      }

      expect(taskInterceptor).toHaveBeenCalledTimes(1);
    });
  });
});
