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

const ERROR_MESSAGE: { [K in ErrorCode]: string } = {
  [ErrorCode.DATABASE_ACCOUNT_NOT_FOUND]:
    'The database account DNS could not be located (ENOTFOUND).',
  [ErrorCode.DATABASE_RESOURCE_CONCURRENCY_VIOLATION]:
    'The resource has changed since it was last requested. Re-fetch it before trying to update it again.',
  [ErrorCode.DATABASE_INTERNAL_ERROR]:
    'The database service encountered an internal error processing the request',
  [ErrorCode.DATABASE_INVALID_CREDENTIALS]:
    'The provided database credentials are invalid.',
  [ErrorCode.DATABASE_INVALID_REQUEST]:
    'The request made to the database is invalid.',
  [ErrorCode.DATABASE_OPERATION_FORBIDDEN]:
    'The requested operation cannot be performed due to exceeded quota or expired credentials.',
  [ErrorCode.DATABASE_RESOURCE_ALREADY_EXISTS]:
    'Cannot create because a resource with the same id already exists on the database.',
  [ErrorCode.DATABASE_RESOURCE_NOT_FOUND]:
    'The requested database resource was not found.',
  [ErrorCode.DATABASE_SPROC_TIMED_OUT]:
    'The stored procedure did not finish executing in the allotted time.',
  [ErrorCode.DATABASE_THROUGHPUT_EXCEEDED]:
    'The provisioned database throughput has been exceeded.',
  [ErrorCode.DATABASE_TRANSIENT_WRITE_FAILURE]:
    'The database encountered a transient failure while writing data. It is safe to retry the operation.',
  [ErrorCode.DATABASE_UNAVAILABLE]:
    'The database service is currently unavailable.',
  [ErrorCode.INTERCEPTOR_NEXT_FUNCTION_ALREADY_CALLED]:
    'The next function for this interceptor has already been called. Next functions may only be called once.',
  [ErrorCode.INVALID_CRON_STRING_INTERVAL]:
    'The provided cron string interval is invalid.',
  [ErrorCode.LISTENER_DESTROYED]:
    'Cannot destroy a listener that is already destroyed.',
  [ErrorCode.PROCESSING_ALREADY_FINISHED]:
    'Task processing has already finished.',
  [ErrorCode.PROCESSING_FINISH_IN_PROGRESS]:
    'Finishing is already in progress. Cannot finish again.',
  [ErrorCode.PROCESSING_LOCK_LOST]: 'Task lock has been lost.',
  [ErrorCode.TASK_ALREADY_SAVING_PAYLOAD]:
    'Task payload is already being saved. Multiple concurrent payload saves are not allowed.',
  [ErrorCode.TASK_TOO_LARGE]:
    'Cannot save the task because it is too big. Tasks must take less than 2MB of storage space.'
};

export default ERROR_MESSAGE;
