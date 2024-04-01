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

import ErrorCode from './codes';
import ERROR_MESSAGE from './messages';

/**
 * Generic error class that is thrown for any internal library errors.
 *
 * @public
 */
export default class IronTaskError extends Error {
  /**
   * Checks the provided error to see if it is a valid IronTaskError and has
   * one of the provided codes. If no codes are provided, it will just check
   * whether the error is an IronTaskError.
   *
   * @param error   - Arbitrary error to verify
   * @param codes   - List of error codes to check for. If the error does not
   *                  have one of the codes, this will return false. If there
   *                  are no error codes provided, the function will only
   *                  check whether this is a valid IronTaskError.
   *
   * @public
   */
  static is(error: any, ...codes: ErrorCode[]): error is IronTaskError {
    if (!(error instanceof IronTaskError)) {
      return false;
    }

    if (codes.length > 0 && !codes.includes(error.code)) {
      return false;
    }

    return true;
  }

  /**
   * Static name for identifying that a task is of this type. This can be used
   * as an alternative to performing an `instanceof` check.
   *
   * @public
   */
  readonly name: 'IronTaskError' = 'IronTaskError';

  /**
   * Unique, stable code for checking what type of error was thrown.
   *
   * @public
   */
  readonly code: ErrorCode;

  /**
   * If present, the underlying error that caused this error to be triggered.
   * This can be used to retrieve additional metadata about the error.
   *
   * @public
   */
  parentError?: any;

  /**
   * @public
   */
  constructor(code: ErrorCode, parentError?: any) {
    super(ERROR_MESSAGE[code]);

    this.code = code;
    this.parentError = parentError;
  }
}
