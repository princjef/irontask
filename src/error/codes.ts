/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * List of all error codes that may be present in an {@link IronTaskError}.
 *
 * @public
 */
enum ErrorCode {
  /**
   * The database account DNS could not be located (ENOTFOUND)
   *
   * @public
   */
  DATABASE_ACCOUNT_NOT_FOUND = 'ERR_DATABASE_ACCOUNT_NOT_FOUND',

  /**
   * The resource has changed since it was last requested. Try refetching and update it again (412)
   *
   * @public
   */
  DATABASE_RESOURCE_CONCURRENCY_VIOLATION = 'ERR_DATABASE_RESOURCE_CONCURRENCY_VIOLATION',

  /**
   * The database encountered an internal error (500)
   *
   * @public
   */
  DATABASE_INTERNAL_ERROR = 'ERR_DATABASE_INTERNAL_ERROR',

  /**
   * The provided database credentials are invalid (401)
   *
   * @public
   */
  DATABASE_INVALID_CREDENTIALS = 'ERR_DATABASE_INVALID_CREDENTIALS',

  /**
   * The request made to the database is invalid (400)
   *
   * @public
   */
  DATABASE_INVALID_REQUEST = 'ERR_DATABASE_INVALID_REQUEST',

  /**
   * The requested operation cannot be performed due to exceeded quota or expired credentials (403)
   *
   * @public
   */
  DATABASE_OPERATION_FORBIDDEN = 'ERR_DATABASE_OPERATION_FORBIDDEN',

  /**
   * A resource with the same id already exists on the database (409)
   *
   * @public
   */
  DATABASE_RESOURCE_ALREADY_EXISTS = 'ERR_DATABASE_RESOURCE_ALREADY_EXISTS',

  /**
   * The requested resource does not exist (404)
   *
   * @public
   */
  DATABASE_RESOURCE_NOT_FOUND = 'ERR_DATABASE_RESOURCE_NOT_FOUND',

  /**
   * The stored procedure did not finish in the allotted time (408)
   *
   * @public
   */
  DATABASE_SPROC_TIMED_OUT = 'ERR_DATABASE_SPROC_TIMED_OUT',

  /**
   * The database throughput has been exceeded (429)
   *
   * @public
   */
  DATABASE_THROUGHPUT_EXCEEDED = 'ERR_DATABASE_THROUGHPUT_EXCEEDED',

  /**
   * The database encountered a transient error while writing data (449)
   *
   * @public
   */
  DATABASE_TRANSIENT_WRITE_FAILURE = 'ERR_DATABASE_TRANSIENT_WRITE_FAILURE',

  /**
   * The underlying database service is not currently available (503).
   *
   * @public
   */
  DATABASE_UNAVAILABLE = 'ERR_DATABASE_UNAVAILABLE',

  /**
   * The next function on an interceptor was called more than one time.
   *
   * @public
   */
  INTERCEPTOR_NEXT_FUNCTION_ALREADY_CALLED = 'ERR_INTERCEPTOR_NEXT_FUNCTION_ALREADY_CALLED',

  /**
   * The listener has been destroyed and cannot be used any more.
   *
   * @public
   */
  LISTENER_DESTROYED = 'ERR_LISTENER_DESTROYED',

  /**
   * The operation cannot be performed because task processing has already
   * finished.
   *
   * @public
   */
  PROCESSING_ALREADY_FINISHED = 'ERR_PROCESSING_ALREADY_FINISHED',

  /**
   * The operation cannot be performed because task processing is currently
   * being finished.
   *
   * @public
   */
  PROCESSING_FINISH_IN_PROGRESS = 'ERR_PROCESSING_FINISH_IN_PROGRESS',

  /**
   * The lock was lost while processing the task.
   *
   * @public
   */
  PROCESSING_LOCK_LOST = 'ERR_PROCESSING_LOCK_LOST',

  /**
   * The task payload is already being saved and cannot be saved again.
   *
   * @public
   */
  TASK_ALREADY_SAVING_PAYLOAD = 'ERR_TASK_ALREADY_SAVING_PAYLOAD',

  /**
   * The task exceeded the maximum size of 2MB (413)
   *
   * @public
   */
  TASK_TOO_LARGE = 'ERR_TASK_TOO_LARGE'
}

export default ErrorCode;
