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

import { TimeoutsOptions } from './types/public';

export const FUZZ_MS = 500;

// 5 tries spanning about 1 minute
export const LISTEN_RETRY_TIMEOUTS = Object.freeze(
  timeouts({
    minTimeout: 500,
    maxTimeout: Infinity,
    factor: 4.5,
    retries: 4,
    randomize: false
  })
);

export const INTERNAL_RETRY_OPTIONS: Required<TimeoutsOptions> = {
  minTimeout: 100,
  maxTimeout: Infinity,
  factor: 3,
  retries: 4,
  randomize: false
};

export const DEFAULT_RETRY_OPTIONS: Required<TimeoutsOptions> = {
  minTimeout: 1000,
  maxTimeout: Infinity,
  factor: 3.5,
  retries: 4,
  randomize: false
};

/**
 * Configuration to disable retries in {@link ListenOptions.retries}.
 *
 * @public
 */
export const NO_RETRY: Required<TimeoutsOptions> = {
  minTimeout: 0,
  maxTimeout: 0,
  factor: 0,
  retries: 0,
  randomize: false
};

export const REFRESH_INTERVAL = 5000;
export const LOCK_RATIO = 2 / 3;
export const DEFAULT_DATABASE_THROUGHPUT = 1000;
export const DEFAULT_PAGE_SIZE = 25;

export const RU_HEADER = 'x-ms-request-charge';
export const SESSION_TOKEN_HEADER = 'x-ms-session-token';
export const CONTINUATION_HEADER = 'x-ms-continuation';
