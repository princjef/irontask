/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CosmosDbClient, Listener, TaskClient } from '../client';
import IronTaskError, { ErrorCode } from '../error';
import { ActiveTask, ProcessingResult, ReadonlyTask, Task } from '../task';

import Interceptors from './schema';

/**
 * @public
 */
export default class InterceptorProcessor {
  private _interceptors: Interceptors;

  constructor(interceptors: Interceptors) {
    this._interceptors = interceptors;
  }

  async client<T>(
    client: TaskClient,
    operation: Interceptors.TaskClientOperation,
    ref: string,
    type: string | undefined,
    handler: () => Promise<AnnotatedResponse<T>>
  ): Promise<T> {
    if (!this._interceptors.client) {
      const { result } = await handler();
      return result;
    }

    const context: Interceptors.TaskClientRequestContext = {
      client,
      operation,
      ref,
      type
    };

    let result: T;
    let called = false;
    await this._interceptors.client(context, async () => {
      try {
        if (called) {
          throw new IronTaskError(
            ErrorCode.INTERCEPTOR_NEXT_FUNCTION_ALREADY_CALLED
          );
        }
        called = true;
        const response = await handler();
        context.ruConsumption = response.ruConsumption;
        result = response.result;
        return response.result;
      } catch (err) {
        context.ruConsumption = CosmosDbClient.getErrorRU(err);
        throw err;
      }
    });

    return result!;
  }

  async task<T>(
    task: Task<any> | ActiveTask<any> | ReadonlyTask<any>,
    operation: Interceptors.TaskOperation,
    ref: string,
    handler: () => Promise<AnnotatedResponse<T>>
  ): Promise<T> {
    if (!this._interceptors.task) {
      const { result } = await handler();
      return result;
    }

    const context: Interceptors.TaskRequestContext = {
      task,
      operation,
      ref
    };

    let result: T;
    let called = false;
    await this._interceptors.task(context, async () => {
      try {
        if (called) {
          throw new IronTaskError(
            ErrorCode.INTERCEPTOR_NEXT_FUNCTION_ALREADY_CALLED
          );
        }
        called = true;
        const response = await handler();
        context.ruConsumption = response.ruConsumption;
        result = response.result;
        return response.result;
      } catch (err) {
        context.ruConsumption = CosmosDbClient.getErrorRU(err);
        throw err;
      }
    });

    return result!;
  }

  async processing(
    listener: Listener<any>,
    task: ActiveTask<any>,
    ref: string,
    handler: () => Promise<{
      result: ProcessingResult;
      error?: any;
      delayMs?: number;
    }>
  ): Promise<void> {
    if (!this._interceptors.processing) {
      await handler();
      return;
    }

    const context: Interceptors.ProcessingContext = {
      listener,
      task,
      ref
    };

    try {
      let called = false;
      await this._interceptors.processing(context, async () => {
        if (called) {
          throw new IronTaskError(
            ErrorCode.INTERCEPTOR_NEXT_FUNCTION_ALREADY_CALLED
          );
        }
        called = true;
        const response = await handler();
        context.error = response.error;
        context.delayMs = response.delayMs;
        return response.result;
      });
    } catch {
      // Errors here can only be thrown by the user code, so we swallow
      // them if they happen.
    }
  }
}

export interface AnnotatedResponse<T> {
  ruConsumption?: number;
  continuation?: string;
  result: T;
}
