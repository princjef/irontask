/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import ActiveTaskImpl, { ActiveTask } from './active';
import t from './properties';
import ReadonlyTaskImpl, { ReadonlyTask } from './readonly';
import TaskImpl, { Task } from './task';

export {
  t,
  TaskImpl,
  Task,
  ActiveTaskImpl,
  ActiveTask,
  ReadonlyTaskImpl,
  ReadonlyTask
};
export * from './document';
export * from './types';
export { summaryProjection, typeFilter } from './query';
