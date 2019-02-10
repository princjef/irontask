/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as util from 'util';

import TaskClient, { q, t, TaskStatus } from '..';

import initialize from './harness';

describe('ReadonlyTask', () => {
  let client: TaskClient;
  let cleanup: () => Promise<void>;

  beforeAll(async () => {
    const harness = await initialize();
    client = harness.client;
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

  describe('#enable', async () => {
    const type = 'enable-task';

    afterAll(async () => {
      await client.delete(type);
    });

    it('enables the task if it was disabled', async () => {
      // Create a disabled task and fetch a summary
      const { id } = await client.create(type, {}, { enabled: false });
      const [task] = await client.listSummary<any>(type, {
        filter: q.equal(t.id, id)
      });
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
      const { id } = await client.create(type, {}, { enabled: true });
      const [task] = await client.listSummary<any>(type, {
        filter: q.equal(t.id, id)
      });
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
      const { id } = await client.create(
        type,
        { hello: 'world', another: 'prop' },
        { enabled: false }
      );
      const [task] = await client.listSummary<any>(type, {
        filter: q.equal(t.id, id),
        project: [t.payload('another')]
      });
      expect(task.status).toBe(TaskStatus.Disabled);

      // Grab a copy and update the payload on the server
      const taskCopy = await client.get<any>(type, task.id);
      taskCopy!.payload = { hello: 'cosmos' };
      await taskCopy!.save();

      // Enable the task
      await task.enable();
      expect(task.status).toBe(TaskStatus.Pending);
      expect(task.enabled).toBe(true);
      expect(task.payload).toEqual({ another: 'prop' });

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
      const { id } = await client.create(type, {}, { enabled: true });
      const [task] = await client.listSummary<any>(type, {
        filter: q.equal(t.id, id)
      });
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
      const { id } = await client.create(type, {}, { enabled: false });
      const [task] = await client.listSummary<any>(type, {
        filter: q.equal(t.id, id)
      });
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
      const { id } = await client.create(
        type,
        { hello: 'world', another: 'prop' },
        { enabled: true }
      );
      const [task] = await client.listSummary<any>(type, {
        filter: q.equal(t.id, id),
        project: [t.payload('another')]
      });
      expect(task.status).toBe(TaskStatus.Pending);

      // Grab a copy and update the payload on the server
      const taskCopy = await client.get<any>(type, task.id);
      taskCopy!.payload = { hello: 'cosmos' };
      await taskCopy!.save();

      // Disable the task
      await task.disable();
      expect(task.status).toBe(TaskStatus.Disabled);
      expect(task.enabled).toBe(false);
      expect(task.payload).toEqual({ another: 'prop' });

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
      const { id } = await client.create(type, {});
      const [task] = await client.listSummary<any>(type, {
        filter: q.equal(t.id, id)
      });

      // Run the delete
      await task.delete();

      // Check the task on the server. It should be gone
      const serverTask = await client.get<any>(type, task.id);
      expect(serverTask).toBeUndefined();
    });

    it('succeeds if the task has already been deleted', async () => {
      const { id } = await client.create(type, {});
      const [task] = await client.listSummary<any>(type, {
        filter: q.equal(t.id, id)
      });

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
      const { id } = await client.create(type, {});
      const [task] = await client.listSummary<any>(type, {
        filter: q.equal(t.id, id)
      });

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
      const { id } = await client.create(type, {});
      const [task] = await client.listSummary<any>(type, {
        filter: q.equal(t.id, id)
      });

      expect(task[util.inspect.custom]()).toEqual(task.toJSON());
    });
  });
});
