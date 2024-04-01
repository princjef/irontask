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

import { INTERNAL_RETRY_OPTIONS } from '../constants';

import retry from './retry';

describe('#retry', () => {
  it('runs the function once if the operation succeeds', async () => {
    const mock = jest.fn(async () => 123);

    expect(await retry(mock)).toBe(123);
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(0, false);
  });

  it('runs the function for the INTERNAL_RETRIES default if it fails', async () => {
    jest.spyOn(global, 'setTimeout').mockImplementation(fn => {
      fn();
      return Math.floor(Math.random() * 1000) as any;
    });

    const error = new Error('RETRY_FAIL');
    const mock = jest.fn(async () => {
      throw error;
    });

    try {
      await retry(mock);
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toEqual(error);
      expect(mock).toHaveBeenCalledTimes(INTERNAL_RETRY_OPTIONS.retries + 1);
      for (let i = 0; i < INTERNAL_RETRY_OPTIONS.retries; i += 1) {
        expect(mock).toHaveBeenCalledWith(i, false);
      }

      // Last try
      expect(mock).toHaveBeenCalledWith(INTERNAL_RETRY_OPTIONS.retries, true);
    }
  });

  it('only retries if the check function returns true when provided', async () => {
    jest.spyOn(global, 'setTimeout').mockImplementation(fn => {
      fn();
      return Math.floor(Math.random() * 1000) as any;
    });

    const mock = jest
      .fn(async () => {
        throw new Error('should not be called');
      })
      .mockImplementationOnce(async () => {
        throw new Error('retryable');
      })
      .mockImplementationOnce(async () => {
        throw new Error('not retryable');
      });

    try {
      await retry(mock, err => err.message === 'retryable');
      throw new Error('should have thrown');
    } catch (err) {
      expect((err as any).message).toEqual('not retryable');
      expect(mock).toHaveBeenCalledTimes(2);
    }
  });

  it('allows custom retry options', async () => {
    jest.spyOn(global, 'setTimeout').mockImplementation(fn => {
      fn();
      return Math.floor(Math.random() * 1000) as any;
    });

    const error = new Error('RETRY_FAIL');
    const mock = jest.fn(async () => {
      throw error;
    });

    try {
      await retry(mock, undefined, {
        factor: 2,
        maxTimeout: 123450,
        minTimeout: 123,
        randomize: false,
        retries: 3
      });
      throw new Error('should have thrown');
    } catch (err) {
      expect(err).toEqual(error);
      expect(mock).toHaveBeenCalledTimes(4);
      for (let i = 0; i < 3; i += 1) {
        expect(mock).toHaveBeenCalledWith(i, false);
      }

      // Last try
      expect(mock).toHaveBeenCalledWith(3, true);
    }
  });
});
