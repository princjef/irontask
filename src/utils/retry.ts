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

import { timeouts } from 'retry';

import { INTERNAL_RETRY_OPTIONS } from '../constants';
import { TimeoutsOptions } from '../types/public';

import delay from './delay';

/**
 * Attempt a promise-based operation with retries built in.
 *
 * @param operation     Operation to retry. It is passed the zero-indexed
 *                      attempt number and whether this is the last try.
 * @param shouldRetry   Function that takes the error that was thrown and
 *                      determines whether it should be retried. Defaults to
 *                      always retry.
 * @param options       Configuration options for attempts and timeouts from the
 *                      `retry` library.
 */
export default async function retry<T>(
  operation: (attempt: number, lastTry: boolean) => Promise<T>,
  shouldRetry: (err: any) => boolean = () => true,
  options: TimeoutsOptions = INTERNAL_RETRY_OPTIONS
): Promise<T> {
  const delays = timeouts(options);
  for (const [index, timeout] of delays.entries()) {
    try {
      // Attempt the operation
      return await operation(index, false);
    } catch (err) {
      if (shouldRetry(err)) {
        // Wait the appropriate time before the next attempt if we
        // should retry
        await delay(timeout);
      } else {
        // If we shouldn't retry, throw the error we received
        throw err;
      }
    }
  }

  // Last try
  return operation(delays.length, true);
}

export interface Attempt {
  startTime: Date;
  endTime: Date;
  durationMs: number;
  error?: any;
}
