/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ResolvedTaskDocument } from '../task';

declare function getContext(): any;

export function lock(
  lockDuration: string,
  maxCount: string,
  lockToken: string
) {
  const lockDurationMs = Number(lockDuration);
  const maxCountNum = Number(maxCount);

  const context = getContext();
  const container = context.getCollection();
  const self = container.getSelfLink();
  const response = context.getResponse();

  const now = Date.now();

  container.queryDocuments(
    self,
    {
      query: `SELECT TOP @count *
            FROM c
            WHERE c.config.enabled = true AND
                  c.config.nextRunTime < @now AND
                  c.config.lockedUntilTime < @now
            ORDER BY c.config.nextRunTime ASC`,
      parameters: [
        {
          name: '@count',
          value: maxCountNum
        },
        {
          name: '@now',
          value: now
        }
      ]
    },
    {},
    (err: any, tasks: ResolvedTaskDocument<any>[]) => {
      if (err) {
        return context.abort(err);
      }

      tryLockTasks(tasks);
    }
  );

  function tryLockTasks(tasks: ResolvedTaskDocument<any>[]) {
    if (tasks.length === 0) {
      return response.setBody({ tasks, hasMore: false });
    }

    let completedCount = 0;
    const results: (ResolvedTaskDocument<any> | undefined)[] = [];

    for (let i = 0; i < tasks.length; i += 1) {
      results.push(undefined);
      // We have to pass through the index and pull it back out of the cb
      // because the number is not passed to the closure correctly in
      // Cosmos DB sprocs.
      tryLockTask(tasks, i, (err, task, index) => {
        // Populate the task if we were able to lock it
        if (!err) {
          results[index] = task;
        }

        completedCount += 1;
        if (completedCount >= tasks.length) {
          const lockedTasks = results.filter(
            result => result
          ) as ResolvedTaskDocument<any>[];
          // There may be more available if we couldn't lock some that
          // we found or we returned everything they asked for
          const hasMore =
            lockedTasks.length < tasks.length || tasks.length === maxCountNum;

          return response.setBody({ tasks: lockedTasks, hasMore });
        }
      });
    }
  }

  function tryLockTask(
    tasks: ResolvedTaskDocument<any>[],
    index: number,
    cb: (
      err: any,
      task: ResolvedTaskDocument<any> | undefined,
      index: number
    ) => any
  ) {
    const task = tasks[index];

    const now = Date.now();

    // If the lock expired without us being able to release the task from
    // processing explicitly, we need to increment the attempt/delivery
    // counters for that delivery as if it had been finished.
    if (task.config.lockToken) {
      task.config.attempts += 1;
      task.config.deliveries += 1;
    }

    task.config.lockedUntilTime = now + lockDurationMs;
    task.config.lockToken = lockToken;

    // If the task does not already have a current start time set, set one now
    if (!task.config.currentRunStartTime) {
      task.config.currentRunStartTime = now;
    }

    const accepted = container.replaceDocument(
      task._self,
      task,
      { etag: task._etag },
      (err: any, updatedTask: ResolvedTaskDocument<any> | undefined) =>
        cb(err, Object.assign({}, task, updatedTask), index)
    );

    if (!accepted) {
      cb(new Error('not accepted'), undefined, index);
    }
  }
}

const def = {
  id: 'lock-v1',
  fn: lock
};

export default def;
