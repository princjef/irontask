/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TaskClient } from './client';
import IronTaskError from './error';
import Interceptors from './interceptor';

export default TaskClient;
export { IronTaskError, Interceptors };

export {
  TaskClientOptions,
  CreateTaskOptions,
  IterateOptions,
  IterateSummaryOptions,
  ListOptions,
  ListSummaryOptions,
  ListenOptions,
  ProjectOptions,
  ScopedTaskClient as ScopedClient,
  TaskHandler,
  Listener,
  TaskClient
} from './client';
export { NO_RETRY } from './constants';
export { q, QueryType, FnSymbol, OpSymbol, PropSymbol } from './query';
export { ErrorCode } from './error';
export {
  t,
  ActiveTask,
  ReadonlyTask,
  Task,
  TaskBase,
  SerializedActiveTask,
  SerializedTask,
  ProcessingResult,
  TaskStatus,
  ProcessingState,
  TaskFinishMetadata
} from './task';
export * from './types/public';