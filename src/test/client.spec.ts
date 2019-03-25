/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import moment = require('moment');

import TaskClient, {
  ErrorCode,
  Interceptors,
  IronTaskError,
  q,
  t,
  Task,
  TaskClientOptions,
  TaskStatus
} from '..';

import initialize from './harness';

describe('Client', () => {
  let client: TaskClient;
  let getClient: (options: TaskClientOptions) => TaskClient;
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

  describe('#create', () => {
    const type = 'create-task';

    afterAll(async () => {
      await client.delete(type);
    });

    it('creates a one-time task scheduled for now by default', async () => {
      const task = await client.create(type, { hello: 'world' });

      expect(task.id).toEqual(expect.any(String));
      expect(task.type).toBe(type);
      expect(task.enabled).toBe(true);
      expect(task.status).toBe(TaskStatus.Pending);
      expect(task.createTime.getTime()).toBeLessThanOrEqual(Date.now());
      expect(task.nextRunTime).toBeDefined();
      expect(task.nextRunTime!.getTime()).toBeLessThanOrEqual(Date.now());
      expect(task.lastRun).toBeUndefined();
      expect(task.interval).toBeUndefined();
      expect(task.runs).toBe(0);
      expect(task.attempts).toBe(0);
      expect(task.deliveries).toBe(0);
      expect(task.payload).toEqual({ hello: 'world' });
    });

    it('allows the task to be scheduled for a custom time', async () => {
      const startTime = moment()
        .add(5, 'minutes')
        .toDate();

      const task = await client.create(
        type,
        { hello: 'world' },
        {
          scheduledTime: startTime
        }
      );

      expect(task.status).toBe(TaskStatus.Scheduled);
      expect(task.nextRunTime).toBeDefined();
      expect(task.nextRunTime!.getTime()).toEqual(startTime.getTime());
    });

    it('supports repeating tasks with a numeric interval, setting the first run to the current time', async () => {
      const task = await client.create(
        type,
        { hello: 'world' },
        {
          interval: 60000
        }
      );

      expect(task.status).toBe(TaskStatus.Pending);
      expect(task.nextRunTime).toBeDefined();
      expect(task.nextRunTime!.getTime()).toBeLessThanOrEqual(Date.now());
      expect(task.interval).toBe(60000);
    });

    it('supports repeating tasks with a cron string interval', async () => {
      // Set the interval to the nth minute of each hour, where n is 5
      // minutes from now (this avoids annoying checks based on how long
      // the create itself takes)
      const now = moment();
      const scheduledMin = (now.minutes() + 5) % 60;
      const interval = `${scheduledMin} * * * *`;

      const task = await client.create(
        type,
        { hello: 'world' },
        {
          interval
        }
      );

      // Get the time aligned to the current minute and add 5 minutes to
      // it to get the next execution of the cron string.
      const firstRunTime = now.startOf('minute').add(5, 'minutes');

      expect(task.status).toBe(TaskStatus.Scheduled);
      expect(task.nextRunTime).toBeDefined();
      expect(task.nextRunTime!.getTime()).toBe(firstRunTime.valueOf());
      expect(task.interval).toBe(interval);
    });

    it('supports repeating tasks paired with a custom first run time', async () => {
      const startTime = moment()
        .add(5, 'minutes')
        .toDate();

      const task = await client.create(
        type,
        { hello: 'world' },
        {
          interval: 60000,
          scheduledTime: startTime
        }
      );

      expect(task.status).toBe(TaskStatus.Scheduled);
      expect(task.nextRunTime).toBeDefined();
      expect(task.nextRunTime!.getTime()).toBe(startTime.getTime());
      expect(task.interval).toBe(60000);
    });

    it('supports tasks that are disabled by default', async () => {
      const task = await client.create(
        type,
        { hello: 'world' },
        {
          enabled: false
        }
      );

      expect(task.status).toBe(TaskStatus.Disabled);
      expect(task.enabled).toBe(false);
      expect(task.nextRunTime).toBeDefined();
      expect(task.nextRunTime!.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('works with a scoped client', async () => {
      const task = await client.type(type).create({ hello: 'world' });

      expect(task.id).toEqual(expect.any(String));
      expect(task.type).toBe(type);
      expect(task.enabled).toBe(true);
      expect(task.status).toBe(TaskStatus.Pending);
      expect(task.createTime.getTime()).toBeLessThanOrEqual(Date.now());
      expect(task.nextRunTime).toBeDefined();
      expect(task.nextRunTime!.getTime()).toBeLessThanOrEqual(Date.now());
      expect(task.lastRun).toBeUndefined();
      expect(task.interval).toBeUndefined();
      expect(task.runs).toBe(0);
      expect(task.attempts).toBe(0);
      expect(task.deliveries).toBe(0);
      expect(task.payload).toEqual({ hello: 'world' });
    });
  });

  describe('#get', () => {
    const type = 'get-task';
    let createdTask: Task<any>;

    beforeAll(async () => {
      createdTask = await client.create(type, { hello: 'world' });
    });

    afterAll(async () => {
      await client.delete(type);
    });

    it('returns the requested task with all of the same data returned upon creation', async () => {
      const task = await client.get<any>(type, createdTask.id);

      expect(task).toBeDefined();
      expect(task!.id).toBe(createdTask.id);
      expect(task!.type).toBe(createdTask.type);
      expect(task!.enabled).toBe(createdTask.enabled);
      expect(task!.status).toBe(createdTask.status);
      expect(task!.createTime).toEqual(createdTask.createTime);
      expect(task!.nextRunTime).toEqual(createdTask.nextRunTime);
      expect(task!.lastRun).toEqual(createdTask.lastRun);
      expect(task!.interval).toBe(createdTask.interval);
      expect(task!.runs).toBe(createdTask.runs);
      expect(task!.attempts).toBe(createdTask.attempts);
      expect(task!.deliveries).toBe(createdTask.deliveries);
      expect(task!.payload).toEqual(createdTask.payload);
    });

    it('returns undefined if the task is not found', async () => {
      const task = await client.get<any>(type, 'nonexistant-id');

      expect(task).toBeUndefined();
    });

    it('works with a scoped client', async () => {
      const task = await client.type(type).get<any>(createdTask.id);

      expect(task).toBeDefined();
      expect(task!.id).toBe(createdTask.id);
      expect(task!.type).toBe(createdTask.type);
      expect(task!.enabled).toBe(createdTask.enabled);
      expect(task!.status).toBe(createdTask.status);
      expect(task!.createTime).toEqual(createdTask.createTime);
      expect(task!.nextRunTime).toEqual(createdTask.nextRunTime);
      expect(task!.lastRun).toEqual(createdTask.lastRun);
      expect(task!.interval).toBe(createdTask.interval);
      expect(task!.runs).toBe(createdTask.runs);
      expect(task!.attempts).toBe(createdTask.attempts);
      expect(task!.deliveries).toBe(createdTask.deliveries);
      expect(task!.payload).toEqual(createdTask.payload);
    });
  });

  describe('#list', () => {
    const type = 'list-task';
    const createdTasks: Task<any>[] = [];

    beforeAll(async () => {
      const startTime = Date.now();

      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 3, group: 'a' },
          {
            scheduledTime: moment(startTime)
              .add(15, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 2, group: 'b' },
          {
            scheduledTime: moment(startTime)
              .subtract(1, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 1, group: 'a' },
          {
            scheduledTime: moment(startTime)
              .add(20, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 0, group: 'b' },
          {
            scheduledTime: moment(startTime)
              .add(12, 'minutes')
              .toDate()
          }
        )
      );
    });

    afterAll(async () => {
      await client.delete(type);
    });

    it('returns results in no particular order by default', async () => {
      const tasks = await client.list<any>(type);

      expect(tasks.length).toBe(createdTasks.length);
    });

    it('allows the sort to be overridden', async () => {
      const tasks = await client.list<any>(type, {
        sortExpression: t.createTime
      });

      expect(tasks.length).toBe(createdTasks.length);
      for (const [index, task] of tasks.entries()) {
        const createdTask = createdTasks[index];

        expect(task.id).toBe(createdTasks[index].id);
        expect(task.type).toBe(createdTask.type);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.status).toBe(createdTask.status);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.deliveries).toBe(createdTask.deliveries);
        expect(task.payload).toEqual(createdTasks[index].payload);
      }
    });

    it('allows sorting by other fields and in descending order', async () => {
      const tasks = await client.list<any>(type, {
        sortExpression: t.nextRunTime,
        sortOrder: 'DESC'
      });

      expect(tasks.length).toBe(createdTasks.length);

      // We sorted in descending order based on the scheduled time above,
      // so it should be from the highest scheduled time to the lowest
      expect(tasks[0].id).toBe(createdTasks[2].id);
      expect(tasks[1].id).toBe(createdTasks[0].id);
      expect(tasks[2].id).toBe(createdTasks[3].id);
      expect(tasks[3].id).toBe(createdTasks[1].id);
    });

    it('allows sorting by fields in the payload', async () => {
      const tasks = await client.list<any>(type, {
        sortExpression: t.payload('reverseIndex'),
        sortOrder: 'ASC'
      });

      expect(tasks.length).toBe(createdTasks.length);

      // We sorted in ascending order by a field that is the opposite of
      // our index, so the order should be reversed
      expect(tasks[0].id).toBe(createdTasks[3].id);
      expect(tasks[1].id).toBe(createdTasks[2].id);
      expect(tasks[2].id).toBe(createdTasks[1].id);
      expect(tasks[3].id).toBe(createdTasks[0].id);
    });

    it('allows filtering by any data in the task', async () => {
      const tasks = await client.list<any>(type, {
        sortExpression: t.createTime,
        filter: q.equal(t.payload('group'), 'a')
      });

      expect(tasks.length).toBe(2);

      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[1].id).toBe(createdTasks[2].id);
    });

    it('allows filtering by state', async () => {
      const tasks = await client.list<any>(type, {
        sortExpression: t.createTime,
        filter: t.hasStatus(TaskStatus.Scheduled)
      });

      expect(tasks.length).toBe(3);

      // We have one task that is scheduled for a time in the past, so we
      // won't get that one back (it's in pending state)
      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[1].id).toBe(createdTasks[2].id);
      expect(tasks[2].id).toBe(createdTasks[3].id);
    });

    it('can be adjusted to return a smaller page', async () => {
      const tasks = await client.list<any>(type, {
        sortExpression: t.createTime,
        skip: 0,
        top: 2
      });

      expect(tasks.length).toBe(2);

      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[1].id).toBe(createdTasks[1].id);
    });

    it('can fetch later pages (WARNING: this is inefficient right now)', async () => {
      const tasks = await client.list<any>(type, {
        sortExpression: t.createTime,
        skip: 2,
        top: 2
      });

      expect(tasks.length).toBe(2);

      expect(tasks[0].id).toBe(createdTasks[2].id);
      expect(tasks[1].id).toBe(createdTasks[3].id);
    });

    it('works with a scoped client', async () => {
      const tasks = await client.type(type).list<any>({
        sortExpression: t.createTime
      });

      expect(tasks.length).toBe(createdTasks.length);
      for (const [index, task] of tasks.entries()) {
        const createdTask = createdTasks[index];

        expect(task.id).toBe(createdTasks[index].id);
        expect(task.type).toBe(createdTask.type);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.status).toBe(createdTask.status);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.deliveries).toBe(createdTask.deliveries);
        expect(task.payload).toEqual(createdTasks[index].payload);
      }
    });
  });

  describe('#listAll', () => {
    const types = ['list-all-task-1', 'list-all-task-2'];
    const createdTasks: Task<any>[] = [];

    beforeAll(async () => {
      const startTime = Date.now();

      createdTasks.push(
        await client.create(
          types[0],
          { reverseIndex: 3, group: 'a' },
          {
            scheduledTime: moment(startTime)
              .add(15, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          types[1],
          { reverseIndex: 2, group: 'b' },
          {
            scheduledTime: moment(startTime)
              .subtract(1, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          types[0],
          { reverseIndex: 1, group: 'a' },
          {
            scheduledTime: moment(startTime)
              .add(20, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          types[1],
          { reverseIndex: 0, group: 'b' },
          {
            scheduledTime: moment(startTime)
              .add(12, 'minutes')
              .toDate()
          }
        )
      );
    });

    afterAll(async () => {
      await client.deleteAll();
    });

    it('returns results in no particular order by default', async () => {
      const tasks = await client.listAll<any>();

      expect(tasks.length).toBe(createdTasks.length);
      for (const type of types) {
        expect(tasks.filter(task => task.type === type).length).toBe(
          createdTasks.filter(task => task.type === type).length
        );
      }
    });

    it('allows the sort to be overridden', async () => {
      const tasks = await client.listAll<any>({
        sortExpression: t.createTime
      });

      expect(tasks.length).toBe(createdTasks.length);
      for (const [index, task] of tasks.entries()) {
        const createdTask = createdTasks[index];

        expect(task.id).toBe(createdTasks[index].id);
        expect(task.type).toBe(createdTask.type);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.status).toBe(createdTask.status);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.deliveries).toBe(createdTask.deliveries);
        expect(task.payload).toEqual(createdTasks[index].payload);
      }
    });

    it('allows sorting by other fields and in descending order', async () => {
      const tasks = await client.listAll<any>({
        sortExpression: t.nextRunTime,
        sortOrder: 'DESC'
      });

      expect(tasks.length).toBe(createdTasks.length);

      // We sorted in descending order based on the scheduled time above,
      // so it should be from the highest scheduled time to the lowest
      expect(tasks[0].id).toBe(createdTasks[2].id);
      expect(tasks[1].id).toBe(createdTasks[0].id);
      expect(tasks[2].id).toBe(createdTasks[3].id);
      expect(tasks[3].id).toBe(createdTasks[1].id);
    });

    it('allows sorting by fields in the payload', async () => {
      const tasks = await client.listAll<any>({
        sortExpression: t.payload('reverseIndex'),
        sortOrder: 'ASC'
      });

      expect(tasks.length).toBe(createdTasks.length);

      // We sorted in ascending order by a field that is the opposite of
      // our index, so the order should be reversed
      expect(tasks[0].id).toBe(createdTasks[3].id);
      expect(tasks[1].id).toBe(createdTasks[2].id);
      expect(tasks[2].id).toBe(createdTasks[1].id);
      expect(tasks[3].id).toBe(createdTasks[0].id);
    });

    it('allows filtering by any data in the task', async () => {
      const tasks = await client.listAll<any>({
        sortExpression: t.createTime,
        filter: q.equal(t.payload('group'), 'a')
      });

      expect(tasks.length).toBe(2);

      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[1].id).toBe(createdTasks[2].id);
    });

    it('allows filtering by state', async () => {
      const tasks = await client.listAll<any>({
        filter: t.hasStatus(TaskStatus.Scheduled)
      });

      expect(tasks.length).toBe(3);

      // We have one task that is scheduled for a time in the past, so we
      // won't get that one back (it's in pending state)
      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[1].id).toBe(createdTasks[2].id);
      expect(tasks[2].id).toBe(createdTasks[3].id);
    });

    it('can be adjusted to return a smaller page', async () => {
      const tasks = await client.listAll<any>({
        sortExpression: t.createTime,
        skip: 0,
        top: 2
      });

      expect(tasks.length).toBe(2);

      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[1].id).toBe(createdTasks[1].id);
    });

    it('can fetch later pages (WARNING: this is inefficient right now)', async () => {
      const tasks = await client.listAll<any>({
        sortExpression: t.createTime,
        skip: 2,
        top: 2
      });

      expect(tasks.length).toBe(2);

      expect(tasks[0].id).toBe(createdTasks[2].id);
      expect(tasks[1].id).toBe(createdTasks[3].id);
    });
  });

  describe('#listSummary', () => {
    const type = 'listSummary-task';
    const createdTasks: Task<any>[] = [];

    beforeAll(async () => {
      const startTime = Date.now();

      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 3, group: 'a', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .add(15, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 2, group: 'b', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .subtract(1, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 1, group: 'a', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .add(20, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 0, group: 'b', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .add(12, 'minutes')
              .toDate()
          }
        )
      );
    });

    afterAll(async () => {
      await client.delete(type);
    });

    it('returns tasks in no particular order by default', async () => {
      const tasks = await client.listSummary<any>(type);

      expect(tasks.length).toBe(createdTasks.length);
    });

    it('allows the sort expression to be overridden', async () => {
      const tasks = await client.listSummary<any>(type, {
        sortExpression: t.createTime
      });

      expect(tasks.length).toBe(createdTasks.length);
      for (const [index, task] of tasks.entries()) {
        const createdTask = createdTasks[index];

        expect(task.id).toBe(createdTasks[index].id);
        expect(task.type).toBe(createdTask.type);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.status).toBe(createdTask.status);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.deliveries).toBe(createdTask.deliveries);

        expect(task.payload).toBeUndefined();
      }
    });

    it('allows sorting by other fields and in descending order', async () => {
      const tasks = await client.listSummary<any>(type, {
        sortExpression: t.nextRunTime,
        sortOrder: 'DESC'
      });

      expect(tasks.length).toBe(createdTasks.length);

      // We sorted in descending order based on the scheduled time above,
      // so it should be from the highest scheduled time to the lowest
      expect(tasks[0].id).toBe(createdTasks[2].id);
      expect(tasks[1].id).toBe(createdTasks[0].id);
      expect(tasks[2].id).toBe(createdTasks[3].id);
      expect(tasks[3].id).toBe(createdTasks[1].id);
    });

    it('allows sorting by fields in the payload', async () => {
      const tasks = await client.listSummary<any>(type, {
        sortExpression: t.payload('reverseIndex'),
        sortOrder: 'ASC'
      });

      expect(tasks.length).toBe(createdTasks.length);

      // We sorted in ascending order by a field that is the opposite of
      // our index, so the order should be reversed
      expect(tasks[0].id).toBe(createdTasks[3].id);
      expect(tasks[1].id).toBe(createdTasks[2].id);
      expect(tasks[2].id).toBe(createdTasks[1].id);
      expect(tasks[3].id).toBe(createdTasks[0].id);
    });

    it('allows filtering by any data in the task', async () => {
      const tasks = await client.listSummary<any>(type, {
        sortExpression: t.createTime,
        filter: q.equal(t.payload('group'), 'a')
      });

      expect(tasks.length).toBe(2);

      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[1].id).toBe(createdTasks[2].id);
    });

    it('allows filtering by state', async () => {
      const tasks = await client.listSummary<any>(type, {
        sortExpression: t.createTime,
        filter: t.hasStatus(TaskStatus.Scheduled)
      });

      expect(tasks.length).toBe(3);

      // We have one task that is scheduled for a time in the past, so we
      // won't get that one back (it's in pending state)
      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[1].id).toBe(createdTasks[2].id);
      expect(tasks[2].id).toBe(createdTasks[3].id);
    });

    it('can be adjusted to return a smaller page', async () => {
      const tasks = await client.listSummary<any>(type, {
        sortExpression: t.createTime,
        skip: 0,
        top: 2
      });

      expect(tasks.length).toBe(2);

      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[1].id).toBe(createdTasks[1].id);
    });

    it('can fetch later pages (WARNING: this is inefficient right now)', async () => {
      const tasks = await client.listSummary<any>(type, {
        sortExpression: t.createTime,
        skip: 2,
        top: 2
      });

      expect(tasks.length).toBe(2);

      expect(tasks[0].id).toBe(createdTasks[2].id);
      expect(tasks[1].id).toBe(createdTasks[3].id);
    });

    it('can return selected data from the payload', async () => {
      const tasks = await client.listSummary<any>(type, {
        sortExpression: t.createTime,
        project: [t.payload('group'), t.payload('arr', 1)]
      });

      expect(tasks.length).toBe(createdTasks.length);

      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[0].payload).toEqual({ group: 'a', arr: ['second'] });

      expect(tasks[1].id).toBe(createdTasks[1].id);
      expect(tasks[1].payload).toEqual({ group: 'b', arr: ['second'] });

      expect(tasks[2].id).toBe(createdTasks[2].id);
      expect(tasks[2].payload).toEqual({ group: 'a', arr: ['second'] });

      expect(tasks[3].id).toBe(createdTasks[3].id);
      expect(tasks[3].payload).toEqual({ group: 'b', arr: ['second'] });
    });

    it('does not allow projecting data outside of the payload', async () => {
      try {
        await client.listSummary<any>(type, {
          sortExpression: t.createTime,
          project: [[t.payload()[0], 'invalid', []]]
        });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
      }
    });

    it('works with a scoped client', async () => {
      const tasks = await client.type(type).listSummary<any>({
        sortExpression: t.createTime
      });

      expect(tasks.length).toBe(createdTasks.length);
      for (const [index, task] of tasks.entries()) {
        const createdTask = createdTasks[index];

        expect(task.id).toBe(createdTasks[index].id);
        expect(task.type).toBe(createdTask.type);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.status).toBe(createdTask.status);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.deliveries).toBe(createdTask.deliveries);

        expect(task.payload).toBeUndefined();
      }
    });
  });

  describe('#listAllSummary', () => {
    const types = ['listAllSummary-task-1', 'listAllSummary-task-2'];
    const createdTasks: Task<any>[] = [];

    beforeAll(async () => {
      const startTime = Date.now();

      createdTasks.push(
        await client.create(
          types[0],
          { reverseIndex: 3, group: 'a', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .add(15, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          types[1],
          { reverseIndex: 2, group: 'b', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .subtract(1, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          types[0],
          { reverseIndex: 1, group: 'a', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .add(20, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          types[1],
          { reverseIndex: 0, group: 'b', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .add(12, 'minutes')
              .toDate()
          }
        )
      );
    });

    afterAll(async () => {
      await client.deleteAll();
    });

    it('returns tasks in no particular order by default', async () => {
      const tasks = await client.listAllSummary<any>();

      expect(tasks.length).toBe(createdTasks.length);

      for (const type of types) {
        expect(tasks.filter(task => task.type === type).length).toBe(
          createdTasks.filter(task => task.type === type).length
        );
      }
    });

    it('allows the sort expression to be overridden', async () => {
      const tasks = await client.listAllSummary<any>({
        sortExpression: t.createTime
      });

      expect(tasks.length).toBe(createdTasks.length);
      for (const [index, task] of tasks.entries()) {
        const createdTask = createdTasks[index];

        expect(task.id).toBe(createdTasks[index].id);
        expect(task.type).toBe(createdTask.type);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.status).toBe(createdTask.status);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.deliveries).toBe(createdTask.deliveries);

        expect(task.payload).toBeUndefined();
      }
    });

    it('allows sorting by other fields and in descending order', async () => {
      const tasks = await client.listAllSummary<any>({
        sortExpression: t.nextRunTime,
        sortOrder: 'DESC'
      });

      expect(tasks.length).toBe(createdTasks.length);

      // We sorted in descending order based on the scheduled time above,
      // so it should be from the highest scheduled time to the lowest
      expect(tasks[0].id).toBe(createdTasks[2].id);
      expect(tasks[1].id).toBe(createdTasks[0].id);
      expect(tasks[2].id).toBe(createdTasks[3].id);
      expect(tasks[3].id).toBe(createdTasks[1].id);
    });

    it('allows sorting by fields in the payload', async () => {
      const tasks = await client.listAllSummary<any>({
        sortExpression: t.payload('reverseIndex'),
        sortOrder: 'ASC'
      });

      expect(tasks.length).toBe(createdTasks.length);

      // We sorted in ascending order by a field that is the opposite of
      // our index, so the order should be reversed
      expect(tasks[0].id).toBe(createdTasks[3].id);
      expect(tasks[1].id).toBe(createdTasks[2].id);
      expect(tasks[2].id).toBe(createdTasks[1].id);
      expect(tasks[3].id).toBe(createdTasks[0].id);
    });

    it('allows filtering by any data in the task', async () => {
      const tasks = await client.listAllSummary<any>({
        sortExpression: t.createTime,
        filter: q.equal(t.payload('group'), 'a')
      });

      expect(tasks.length).toBe(2);

      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[1].id).toBe(createdTasks[2].id);
    });

    it('allows filtering by state', async () => {
      const tasks = await client.listAllSummary<any>({
        sortExpression: t.createTime,
        filter: t.hasStatus(TaskStatus.Scheduled)
      });

      expect(tasks.length).toBe(3);

      // We have one task that is scheduled for a time in the past, so we
      // won't get that one back (it's in pending state)
      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[1].id).toBe(createdTasks[2].id);
      expect(tasks[2].id).toBe(createdTasks[3].id);
    });

    it('can be adjusted to return a smaller page', async () => {
      const tasks = await client.listAllSummary<any>({
        sortExpression: t.createTime,
        skip: 0,
        top: 2
      });

      expect(tasks.length).toBe(2);

      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[1].id).toBe(createdTasks[1].id);
    });

    it('can fetch later pages (WARNING: this is inefficient right now)', async () => {
      const tasks = await client.listAllSummary<any>({
        sortExpression: t.createTime,
        skip: 2,
        top: 2
      });

      expect(tasks.length).toBe(2);

      expect(tasks[0].id).toBe(createdTasks[2].id);
      expect(tasks[1].id).toBe(createdTasks[3].id);
    });

    it('can return selected data from the payload', async () => {
      const tasks = await client.listAllSummary<any>({
        sortExpression: t.createTime,
        project: [t.payload('group'), t.payload('arr', 1)]
      });

      expect(tasks.length).toBe(createdTasks.length);

      expect(tasks[0].id).toBe(createdTasks[0].id);
      expect(tasks[0].payload).toEqual({ group: 'a', arr: ['second'] });

      expect(tasks[1].id).toBe(createdTasks[1].id);
      expect(tasks[1].payload).toEqual({ group: 'b', arr: ['second'] });

      expect(tasks[2].id).toBe(createdTasks[2].id);
      expect(tasks[2].payload).toEqual({ group: 'a', arr: ['second'] });

      expect(tasks[3].id).toBe(createdTasks[3].id);
      expect(tasks[3].payload).toEqual({ group: 'b', arr: ['second'] });
    });

    it('does not allow projecting data outside of the payload', async () => {
      try {
        await client.listAllSummary<any>({
          sortExpression: t.createTime,
          project: [[t.payload()[0], 'invalid', []]]
        });
        throw new Error('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
      }
    });
  });

  describe('#iterate', () => {
    const type = 'iterate-task';
    const createdTasks: Task<any>[] = [];

    beforeAll(async () => {
      const startTime = Date.now();

      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 3, group: 'a' },
          {
            scheduledTime: moment(startTime)
              .add(15, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 2, group: 'b' },
          {
            scheduledTime: moment(startTime)
              .subtract(1, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 1, group: 'a' },
          {
            scheduledTime: moment(startTime)
              .add(20, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 0, group: 'b' },
          {
            scheduledTime: moment(startTime)
              .add(12, 'minutes')
              .toDate()
          }
        )
      );
    });

    afterAll(async () => {
      await client.delete(type);
    });

    it('returns results in no particular order by default', async () => {
      const iterator = client.iterate<any>(type);

      let index = 0;
      for await (const _ of iterator) {
        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows the sort expression to be overridden', async () => {
      const iterator = client.iterate<any>(type, {
        sortExpression: t.createTime
      });

      let index = 0;
      for await (const task of iterator) {
        const createdTask = createdTasks[index];

        expect(task.id).toBe(createdTask.id);
        expect(task.type).toBe(createdTask.type);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.status).toBe(createdTask.status);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.deliveries).toBe(createdTask.deliveries);
        expect(task.payload).toEqual(createdTask.payload);

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows sorting by other fields and in descending order', async () => {
      const iterator = await client.iterate<any>(type, {
        sortExpression: t.nextRunTime,
        sortOrder: 'DESC'
      });

      // We sorted in descending order based on the scheduled time above,
      // so it should be from the highest scheduled time to the lowest
      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[2].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[0].id);
            break;
          case 2:
            expect(task.id).toBe(createdTasks[3].id);
            break;
          case 3:
            expect(task.id).toBe(createdTasks[1].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows sorting by fields in the payload', async () => {
      const iterator = await client.iterate<any>(type, {
        sortExpression: t.payload('reverseIndex'),
        sortOrder: 'ASC'
      });

      // We sorted in ascending order by a field that is the opposite of
      // our index, so the order should be reversed
      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[3].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[2].id);
            break;
          case 2:
            expect(task.id).toBe(createdTasks[1].id);
            break;
          case 3:
            expect(task.id).toBe(createdTasks[0].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows filtering by any data in the task', async () => {
      const iterator = await client.iterate<any>(type, {
        sortExpression: t.createTime,
        filter: q.equal(t.payload('group'), 'a')
      });

      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[0].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[2].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(2);
    });

    it('allows filtering by state', async () => {
      const iterator = await client.iterate<any>(type, {
        sortExpression: t.createTime,
        filter: t.hasStatus(TaskStatus.Scheduled)
      });

      // We have one task that is scheduled for a time in the past, so we
      // won't get that one back (it's in pending state)
      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[0].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[2].id);
            break;
          case 2:
            expect(task.id).toBe(createdTasks[3].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(3);
    });

    it('works with a scoped client', async () => {
      const iterator = await client.type(type).iterate<any>({
        sortExpression: t.createTime
      });

      let index = 0;
      for await (const task of iterator) {
        const createdTask = createdTasks[index];

        expect(task.id).toBe(createdTask.id);
        expect(task.type).toBe(createdTask.type);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.status).toBe(createdTask.status);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.deliveries).toBe(createdTask.deliveries);
        expect(task.payload).toEqual(createdTask.payload);

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });
  });

  describe('#iterateAll', () => {
    const types = ['iterateAll-task-1', 'iterateAll-task-2'];
    const createdTasks: Task<any>[] = [];

    beforeAll(async () => {
      const startTime = Date.now();

      createdTasks.push(
        await client.create(
          types[0],
          { reverseIndex: 3, group: 'a' },
          {
            scheduledTime: moment(startTime)
              .add(15, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          types[1],
          { reverseIndex: 2, group: 'b' },
          {
            scheduledTime: moment(startTime)
              .subtract(1, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          types[0],
          { reverseIndex: 1, group: 'a' },
          {
            scheduledTime: moment(startTime)
              .add(20, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          types[1],
          { reverseIndex: 0, group: 'b' },
          {
            scheduledTime: moment(startTime)
              .add(12, 'minutes')
              .toDate()
          }
        )
      );
    });

    afterAll(async () => {
      await client.deleteAll();
    });

    it('returns results in no particular order by default', async () => {
      const iterator = client.iterateAll<any>();

      const tasks = [];
      for await (const task of iterator) {
        tasks.push(task);
      }

      expect(tasks.length).toBe(createdTasks.length);
      for (const type of types) {
        expect(tasks.filter(task => task.type === type).length).toBe(
          createdTasks.filter(task => task.type === type).length
        );
      }
    });

    it('allows the sort expression to be overridden', async () => {
      const iterator = client.iterateAll<any>({
        sortExpression: t.createTime
      });

      let index = 0;
      for await (const task of iterator) {
        const createdTask = createdTasks[index];

        expect(task.id).toBe(createdTask.id);
        expect(task.type).toBe(createdTask.type);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.status).toBe(createdTask.status);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.deliveries).toBe(createdTask.deliveries);
        expect(task.payload).toEqual(createdTask.payload);

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows sorting by other fields and in descending order', async () => {
      const iterator = await client.iterateAll<any>({
        sortExpression: t.nextRunTime,
        sortOrder: 'DESC'
      });

      // We sorted in descending order based on the scheduled time above,
      // so it should be from the highest scheduled time to the lowest
      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[2].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[0].id);
            break;
          case 2:
            expect(task.id).toBe(createdTasks[3].id);
            break;
          case 3:
            expect(task.id).toBe(createdTasks[1].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows sorting by fields in the payload', async () => {
      const iterator = await client.iterateAll<any>({
        sortExpression: t.payload('reverseIndex'),
        sortOrder: 'ASC'
      });

      // We sorted in ascending order by a field that is the opposite of
      // our index, so the order should be reversed
      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[3].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[2].id);
            break;
          case 2:
            expect(task.id).toBe(createdTasks[1].id);
            break;
          case 3:
            expect(task.id).toBe(createdTasks[0].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows filtering by any data in the task', async () => {
      const iterator = await client.iterateAll<any>({
        sortExpression: t.createTime,
        filter: q.equal(t.payload('group'), 'a')
      });

      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[0].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[2].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(2);
    });

    it('allows filtering by state', async () => {
      const iterator = await client.iterateAll<any>({
        sortExpression: t.createTime,
        filter: t.hasStatus(TaskStatus.Scheduled)
      });

      // We have one task that is scheduled for a time in the past, so we
      // won't get that one back (it's in pending state)
      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[0].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[2].id);
            break;
          case 2:
            expect(task.id).toBe(createdTasks[3].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(3);
    });
  });

  describe('#iterateSummary', () => {
    const type = 'iterateSummary-task';
    const createdTasks: Task<any>[] = [];

    beforeAll(async () => {
      const startTime = Date.now();

      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 3, group: 'a', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .add(15, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 2, group: 'b', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .subtract(1, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 1, group: 'a', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .add(20, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          type,
          { reverseIndex: 0, group: 'b', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .add(12, 'minutes')
              .toDate()
          }
        )
      );
    });

    afterAll(async () => {
      await client.delete(type);
    });

    it('returns results in no particular order by default', async () => {
      const iterator = client.iterateSummary<any>(type);

      let index = 0;
      for await (const _ of iterator) {
        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows the sort expression to be overridden', async () => {
      const iterator = client.iterateSummary<any>(type, {
        sortExpression: t.createTime
      });

      let index = 0;
      for await (const task of iterator) {
        const createdTask = createdTasks[index];

        expect(task.id).toBe(createdTask.id);
        expect(task.type).toBe(createdTask.type);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.status).toBe(createdTask.status);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.deliveries).toBe(createdTask.deliveries);
        expect(task.payload).toBeUndefined();

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows sorting by other fields and in descending order', async () => {
      const iterator = await client.iterateSummary<any>(type, {
        sortExpression: t.nextRunTime,
        sortOrder: 'DESC'
      });

      // We sorted in descending order based on the scheduled time above,
      // so it should be from the highest scheduled time to the lowest
      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[2].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[0].id);
            break;
          case 2:
            expect(task.id).toBe(createdTasks[3].id);
            break;
          case 3:
            expect(task.id).toBe(createdTasks[1].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows sorting by fields in the payload', async () => {
      const iterator = await client.iterateSummary<any>(type, {
        sortExpression: t.payload('reverseIndex'),
        sortOrder: 'ASC'
      });

      // We sorted in ascending order by a field that is the opposite of
      // our index, so the order should be reversed
      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[3].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[2].id);
            break;
          case 2:
            expect(task.id).toBe(createdTasks[1].id);
            break;
          case 3:
            expect(task.id).toBe(createdTasks[0].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows filtering by any data in the task', async () => {
      const iterator = await client.iterateSummary<any>(type, {
        sortExpression: t.createTime,
        filter: q.equal(t.payload('group'), 'a')
      });

      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[0].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[2].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(2);
    });

    it('allows filtering by state', async () => {
      const iterator = await client.iterateSummary<any>(type, {
        sortExpression: t.createTime,
        filter: t.hasStatus(TaskStatus.Scheduled)
      });

      // We have one task that is scheduled for a time in the past, so we
      // won't get that one back (it's in pending state)
      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[0].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[2].id);
            break;
          case 2:
            expect(task.id).toBe(createdTasks[3].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(3);
    });

    it('can return selected data from the payload', async () => {
      const iterator = await client.iterateSummary<any>(type, {
        sortExpression: t.createTime,
        project: [t.payload('group'), t.payload('arr', 1)]
      });

      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[0].id);
            expect(task.payload).toEqual({ group: 'a', arr: ['second'] });
            break;
          case 1:
            expect(task.id).toBe(createdTasks[1].id);
            expect(task.payload).toEqual({ group: 'b', arr: ['second'] });
            break;
          case 2:
            expect(task.id).toBe(createdTasks[2].id);
            expect(task.payload).toEqual({ group: 'a', arr: ['second'] });
            break;
          case 3:
            expect(task.id).toBe(createdTasks[3].id);
            expect(task.payload).toEqual({ group: 'b', arr: ['second'] });
            break;
        }

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('works with a scoped client', async () => {
      const iterator = await client.type(type).iterateSummary<any>({
        sortExpression: t.createTime
      });

      let index = 0;
      for await (const task of iterator) {
        const createdTask = createdTasks[index];

        expect(task.id).toBe(createdTask.id);
        expect(task.type).toBe(createdTask.type);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.status).toBe(createdTask.status);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.deliveries).toBe(createdTask.deliveries);
        expect(task.payload).toBeUndefined();

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });
  });

  describe('#iterateAllSummary', () => {
    const types = ['iterateAllSummary-task-1', 'iterateAllSummary-task-2'];
    const createdTasks: Task<any>[] = [];

    beforeAll(async () => {
      const startTime = Date.now();

      createdTasks.push(
        await client.create(
          types[0],
          { reverseIndex: 3, group: 'a', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .add(15, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          types[1],
          { reverseIndex: 2, group: 'b', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .subtract(1, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          types[0],
          { reverseIndex: 1, group: 'a', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .add(20, 'minutes')
              .toDate()
          }
        )
      );
      createdTasks.push(
        await client.create(
          types[1],
          { reverseIndex: 0, group: 'b', arr: ['first', 'second'] },
          {
            scheduledTime: moment(startTime)
              .add(12, 'minutes')
              .toDate()
          }
        )
      );
    });

    afterAll(async () => {
      await client.deleteAll();
    });

    it('returns tasks in no particular order by default', async () => {
      const iterator = client.iterateAllSummary<any>();

      const tasks = [];
      for await (const task of iterator) {
        tasks.push(task);
      }

      expect(tasks.length).toBe(createdTasks.length);
      for (const type of types) {
        expect(tasks.filter(task => task.type === type).length).toBe(
          createdTasks.filter(task => task.type === type).length
        );
      }
    });

    it('allows the sort expression to be overridden', async () => {
      const iterator = client.iterateAllSummary<any>({
        sortExpression: t.createTime
      });

      let index = 0;
      for await (const task of iterator) {
        const createdTask = createdTasks[index];

        expect(task.id).toBe(createdTask.id);
        expect(task.type).toBe(createdTask.type);
        expect(task.enabled).toBe(createdTask.enabled);
        expect(task.status).toBe(createdTask.status);
        expect(task.createTime).toEqual(createdTask.createTime);
        expect(task.nextRunTime).toEqual(createdTask.nextRunTime);
        expect(task.lastRun).toEqual(createdTask.lastRun);
        expect(task.interval).toBe(createdTask.interval);
        expect(task.runs).toBe(createdTask.runs);
        expect(task.attempts).toBe(createdTask.attempts);
        expect(task.deliveries).toBe(createdTask.deliveries);
        expect(task.payload).toBeUndefined();

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows sorting by other fields and in descending order', async () => {
      const iterator = await client.iterateAllSummary<any>({
        sortExpression: t.nextRunTime,
        sortOrder: 'DESC'
      });

      // We sorted in descending order based on the scheduled time above,
      // so it should be from the highest scheduled time to the lowest
      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[2].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[0].id);
            break;
          case 2:
            expect(task.id).toBe(createdTasks[3].id);
            break;
          case 3:
            expect(task.id).toBe(createdTasks[1].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows sorting by fields in the payload', async () => {
      const iterator = await client.iterateAllSummary<any>({
        sortExpression: t.payload('reverseIndex'),
        sortOrder: 'ASC'
      });

      // We sorted in ascending order by a field that is the opposite of
      // our index, so the order should be reversed
      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[3].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[2].id);
            break;
          case 2:
            expect(task.id).toBe(createdTasks[1].id);
            break;
          case 3:
            expect(task.id).toBe(createdTasks[0].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });

    it('allows filtering by any data in the task', async () => {
      const iterator = await client.iterateAllSummary<any>({
        sortExpression: t.createTime,
        filter: q.equal(t.payload('group'), 'a')
      });

      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[0].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[2].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(2);
    });

    it('allows filtering by state', async () => {
      const iterator = await client.iterateAllSummary<any>({
        sortExpression: t.createTime,
        filter: t.hasStatus(TaskStatus.Scheduled)
      });

      // We have one task that is scheduled for a time in the past, so we
      // won't get that one back (it's in pending state)
      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[0].id);
            break;
          case 1:
            expect(task.id).toBe(createdTasks[2].id);
            break;
          case 2:
            expect(task.id).toBe(createdTasks[3].id);
            break;
        }

        index += 1;
      }

      expect(index).toBe(3);
    });

    it('can return selected data from the payload', async () => {
      const iterator = await client.iterateAllSummary<any>({
        sortExpression: t.createTime,
        project: [t.payload('group'), t.payload('arr', 1)]
      });

      let index = 0;
      for await (const task of iterator) {
        switch (index) {
          case 0:
            expect(task.id).toBe(createdTasks[0].id);
            expect(task.payload).toEqual({ group: 'a', arr: ['second'] });
            break;
          case 1:
            expect(task.id).toBe(createdTasks[1].id);
            expect(task.payload).toEqual({ group: 'b', arr: ['second'] });
            break;
          case 2:
            expect(task.id).toBe(createdTasks[2].id);
            expect(task.payload).toEqual({ group: 'a', arr: ['second'] });
            break;
          case 3:
            expect(task.id).toBe(createdTasks[3].id);
            expect(task.payload).toEqual({ group: 'b', arr: ['second'] });
            break;
        }

        index += 1;
      }

      expect(index).toBe(createdTasks.length);
    });
  });

  describe('#disable', () => {
    const type = 'disable-task';

    afterEach(async () => {
      await client.delete(type);
    });

    it('disables all tasks of the type', async () => {
      const tasks = await Promise.all([
        client.create(type, {}),
        client.create(type, {}),
        client.create(type, {})
      ]);

      await client.disable(type);

      const afterTasks = await client.list<any>(type);

      expect(afterTasks.length).toBe(tasks.length);
      for (const task of afterTasks) {
        expect(task.status).toBe(TaskStatus.Disabled);
        expect(task.enabled).toBe(false);
      }
    });

    it('can be filtered to certain tasks', async () => {
      const tasks = await Promise.all([
        client.create(type, { group: 'a' }),
        client.create(type, { group: 'b' }),
        client.create(type, { group: 'a' })
      ]);

      await client.disable(type, q.equal(t.payload('group'), 'a'));

      const afterTasks = await client.list<any>(type);

      expect(afterTasks.length).toBe(tasks.length);
      for (const task of afterTasks) {
        if (task.id === tasks[0].id || task.id === tasks[2].id) {
          expect(task.status).toBe(TaskStatus.Disabled);
          expect(task.enabled).toBe(false);
        } else {
          expect(task.status).toBe(TaskStatus.Pending);
          expect(task.enabled).toBe(true);
        }
      }
    });

    it('works with a scoped client', async () => {
      const scoped = client.type(type);

      const tasks = await Promise.all([
        scoped.create({}, {}),
        scoped.create({}, {}),
        scoped.create({}, {})
      ]);

      await scoped.disable();

      const afterTasks = await scoped.list<any>();

      expect(afterTasks.length).toBe(tasks.length);
      for (const task of afterTasks) {
        expect(task.status).toBe(TaskStatus.Disabled);
        expect(task.enabled).toBe(false);
      }
    });
  });

  describe('#disableAll', () => {
    const types = ['disableAll-task-0', 'disableAll-task-1'];

    afterEach(async () => {
      await client.deleteAll();
    });

    it('disables all tasks of the type', async () => {
      const tasks = await Promise.all([
        client.create(types[0], {}),
        client.create(types[1], {}),
        client.create(types[0], {})
      ]);

      await client.disableAll();

      const afterTasks = await client.listAll<any>();

      expect(afterTasks.length).toBe(tasks.length);
      for (const task of afterTasks) {
        expect(task.status).toBe(TaskStatus.Disabled);
        expect(task.enabled).toBe(false);
      }
    });

    it('can be filtered to certain tasks', async () => {
      const tasks = await Promise.all([
        client.create(types[0], { group: 'a' }),
        client.create(types[0], { group: 'b' }),
        client.create(types[1], { group: 'a' })
      ]);

      await client.disableAll(q.equal(t.payload('group'), 'a'));

      const afterTasks = await client.listAll<any>();

      expect(afterTasks.length).toBe(tasks.length);
      for (const task of afterTasks) {
        if (task.id === tasks[0].id || task.id === tasks[2].id) {
          expect(task.status).toBe(TaskStatus.Disabled);
          expect(task.enabled).toBe(false);
        } else {
          expect(task.status).toBe(TaskStatus.Pending);
          expect(task.enabled).toBe(true);
        }
      }
    });
  });

  describe('#enable', () => {
    const type = 'enable-task';

    afterEach(async () => {
      await client.delete(type);
    });

    it('enables all tasks of the type', async () => {
      const tasks = await Promise.all([
        client.create(type, {}, { enabled: false }),
        client.create(type, {}, { enabled: false }),
        client.create(type, {}, { enabled: false })
      ]);

      await client.enable(type);

      const afterTasks = await client.list<any>(type);

      expect(afterTasks.length).toBe(tasks.length);
      for (const task of afterTasks) {
        expect(task.status).toBe(TaskStatus.Pending);
        expect(task.enabled).toBe(true);
      }
    });

    it('can be filtered to certain tasks', async () => {
      const tasks = await Promise.all([
        client.create(type, { group: 'a' }, { enabled: false }),
        client.create(type, { group: 'b' }, { enabled: false }),
        client.create(type, { group: 'a' }, { enabled: false })
      ]);

      await client.enable(type, q.equal(t.payload('group'), 'a'));

      const afterTasks = await client.list<any>(type);

      expect(afterTasks.length).toBe(tasks.length);
      for (const task of afterTasks) {
        if (task.id === tasks[0].id || task.id === tasks[2].id) {
          expect(task.status).toBe(TaskStatus.Pending);
          expect(task.enabled).toBe(true);
        } else {
          expect(task.status).toBe(TaskStatus.Disabled);
          expect(task.enabled).toBe(false);
        }
      }
    });

    it('works with a scoped client', async () => {
      const scoped = client.type(type);

      const tasks = await Promise.all([
        scoped.create({}, { enabled: false }),
        scoped.create({}, { enabled: false }),
        scoped.create({}, { enabled: false })
      ]);

      await scoped.enable();

      const afterTasks = await scoped.list<any>();

      expect(afterTasks.length).toBe(tasks.length);
      for (const task of afterTasks) {
        expect(task.status).toBe(TaskStatus.Pending);
        expect(task.enabled).toBe(true);
      }
    });
  });

  describe('#enableAll', () => {
    const types = ['enableAll-task-1', 'enableAll-task-2'];

    afterEach(async () => {
      await client.deleteAll();
    });

    it('enables all tasks of the type', async () => {
      const tasks = await Promise.all([
        client.create(types[0], {}, { enabled: false }),
        client.create(types[1], {}, { enabled: false }),
        client.create(types[0], {}, { enabled: false })
      ]);

      await client.enableAll();

      const afterTasks = await client.listAll<any>();

      expect(afterTasks.length).toBe(tasks.length);
      for (const task of afterTasks) {
        expect(task.status).toBe(TaskStatus.Pending);
        expect(task.enabled).toBe(true);
      }
    });

    it('can be filtered to certain tasks', async () => {
      const tasks = await Promise.all([
        client.create(types[0], { group: 'a' }, { enabled: false }),
        client.create(types[0], { group: 'b' }, { enabled: false }),
        client.create(types[1], { group: 'a' }, { enabled: false })
      ]);

      await client.enableAll(q.equal(t.payload('group'), 'a'));

      const afterTasks = await client.listAll<any>();

      expect(afterTasks.length).toBe(tasks.length);
      for (const task of afterTasks) {
        if (task.id === tasks[0].id || task.id === tasks[2].id) {
          expect(task.status).toBe(TaskStatus.Pending);
          expect(task.enabled).toBe(true);
        } else {
          expect(task.status).toBe(TaskStatus.Disabled);
          expect(task.enabled).toBe(false);
        }
      }
    });
  });

  describe('#delete', () => {
    const type = 'delete-task';

    afterEach(async () => {
      await client.delete(type);
    });

    it('deletes all tasks of the type', async () => {
      await Promise.all([
        client.create(type, {}),
        client.create(type, {}),
        client.create(type, {})
      ]);

      await client.delete(type);

      const afterTasks = await client.list<any>(type);

      expect(afterTasks.length).toBe(0);
    });

    it('can be filtered to certain tasks', async () => {
      const tasks = await Promise.all([
        client.create(type, { group: 'a' }),
        client.create(type, { group: 'b' }),
        client.create(type, { group: 'a' })
      ]);

      await client.delete(type, q.equal(t.payload('group'), 'a'));

      const afterTasks = await client.list<any>(type);

      expect(afterTasks.length).toBe(1);
      expect(afterTasks[0].id).toBe(tasks[1].id);
    });

    it('works with a scoped client', async () => {
      const scoped = client.type(type);

      await Promise.all([
        scoped.create({}),
        scoped.create({}),
        scoped.create({})
      ]);

      await scoped.delete();

      const afterTasks = await scoped.list<any>();

      expect(afterTasks.length).toBe(0);
    });
  });

  describe('#deleteAll', () => {
    const types = ['deleteAll-task-1', 'deleteAll-task-2'];

    afterEach(async () => {
      await client.deleteAll();
    });

    it('deletes all tasks', async () => {
      await Promise.all([
        client.create(types[0], {}),
        client.create(types[1], {}),
        client.create(types[0], {})
      ]);

      await client.deleteAll();

      const afterTasks = await client.listAll<any>();

      expect(afterTasks.length).toBe(0);
    });

    it('can be filtered to certain tasks', async () => {
      const tasks = await Promise.all([
        client.create(types[0], { group: 'a' }),
        client.create(types[0], { group: 'b' }),
        client.create(types[1], { group: 'a' })
      ]);

      await client.deleteAll(q.equal(t.payload('group'), 'a'));

      const afterTasks = await client.listAll<any>();

      expect(afterTasks.length).toBe(1);
      expect(afterTasks[0].id).toBe(tasks[1].id);
    });
  });

  describe('#deleteOne', () => {
    const type = 'deleteOne-task';

    afterEach(async () => {
      await client.delete(type);
    });

    it('deletes the provided task', async () => {
      const tasks = await Promise.all([
        client.create(type, {}),
        client.create(type, {}),
        client.create(type, {})
      ]);

      await client.deleteOne(type, tasks[1].id);

      const afterTasks = await client.list<any>(type);

      expect(afterTasks.length).toBe(tasks.length - 1);
      for (const task of afterTasks) {
        expect(task.id).not.toEqual(tasks[1].id);
      }
    });

    it('succeeds but does nothing if the task does not exist', async () => {
      const tasks = await Promise.all([
        client.create(type, {}),
        client.create(type, {}),
        client.create(type, {})
      ]);

      await client.deleteOne(type, 'nonexistant');

      const afterTasks = await client.list<any>(type);
      expect(afterTasks.length).toBe(tasks.length);
    });

    it('works with a scoped client', async () => {
      const scoped = client.type(type);

      const tasks = await Promise.all([
        scoped.create({}),
        scoped.create({}),
        scoped.create({})
      ]);

      await scoped.deleteOne(tasks[1].id);

      const afterTasks = await scoped.list<any>();

      expect(afterTasks.length).toBe(tasks.length - 1);
      for (const task of afterTasks) {
        expect(task.id).not.toEqual(tasks[1].id);
      }
    });
  });

  describe('interceptors', () => {
    const type = 'interceptors-task';

    afterAll(async () => {
      await client.delete(type);
    });

    it('captures information about the request', async () => {
      const clientInterceptor = jest.fn((async (ctx, next) => {
        expect(ctx.operation).toBe(Interceptors.TaskClientOperation.Create);
        expect(ctx.ruConsumption).toBeUndefined();
        await next();
        expect(ctx.ruConsumption).toBeGreaterThan(0);
      }) as Interceptors.ClientRequestInterceptor);

      const localClient = getClient({
        interceptors: {
          client: clientInterceptor
        }
      });

      const task = await localClient.create(type, { hello: 'world' });

      expect(task.id).toEqual(expect.any(String));
      expect(task.type).toBe(type);
      expect(task.enabled).toBe(true);
      expect(task.status).toBe(TaskStatus.Pending);
      expect(task.createTime.getTime()).toBeLessThanOrEqual(Date.now());
      expect(task.nextRunTime).toBeDefined();
      expect(task.nextRunTime!.getTime()).toBeLessThanOrEqual(Date.now());
      expect(task.lastRun).toBeUndefined();
      expect(task.interval).toBeUndefined();
      expect(task.runs).toBe(0);
      expect(task.attempts).toBe(0);
      expect(task.deliveries).toBe(0);
      expect(task.payload).toEqual({ hello: 'world' });

      expect(clientInterceptor).toHaveBeenCalledTimes(1);
    });

    it('captures request errors', async () => {
      const clientInterceptor = jest.fn((async (ctx, next) => {
        expect(ctx.operation).toBe(Interceptors.TaskClientOperation.Create);
        try {
          await next();
          fail('should have thrown');
        } catch (err) {
          expect(
            IronTaskError.is(err, ErrorCode.INVALID_CRON_STRING_INTERVAL)
          ).toBe(true);
          throw err;
        }
      }) as Interceptors.ClientRequestInterceptor);

      const localClient = getClient({
        interceptors: {
          client: clientInterceptor
        }
      });

      try {
        await localClient.create(
          type,
          {},
          {
            interval: '0 0 31 2 0'
          }
        );
        fail('should have thrown');
      } catch (err) {
        expect(
          IronTaskError.is(err, ErrorCode.INVALID_CRON_STRING_INTERVAL)
        ).toBe(true);
      }

      expect(clientInterceptor).toHaveBeenCalledTimes(1);
    });

    it('throws if it tries to call next multiple times', async () => {
      const clientInterceptor = jest.fn((async (ctx, next) => {
        expect(ctx.operation).toBe(Interceptors.TaskClientOperation.Create);
        expect(ctx.ruConsumption).toBeUndefined();
        await next();
        await next();
      }) as Interceptors.ClientRequestInterceptor);

      const localClient = getClient({
        interceptors: {
          client: clientInterceptor
        }
      });

      try {
        await localClient.create(type, {});
        fail('should have thrown');
      } catch (err) {
        expect(
          IronTaskError.is(
            err,
            ErrorCode.INTERCEPTOR_NEXT_FUNCTION_ALREADY_CALLED
          )
        ).toBe(true);
      }

      expect(clientInterceptor).toHaveBeenCalledTimes(1);
    });
  });
});
