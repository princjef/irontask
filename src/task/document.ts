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

import { Resource } from '@azure/cosmos';

export interface TaskDocument<T> {
  /**
   * The document identity
   */
  id: string;

  /**
   * Internal Cosmos DB etag. Used to guarantee document integrity
   */
  _etag: string;

  /**
   * The number of milliseconds until this task will be deleted. This is only
   * set if the task has a `ttlMs` configured and it has completed or failed
   * with no future runs scheduled.
   */
  ttl?: number;

  config: {
    /**
     * Task type. Also serves as the partition key
     */
    type: string;

    /**
     * Indicates whether the task is eligible for processing.
     */
    enabled: boolean;

    /**
     * Unix ms epoch representing when the task was created
     */
    createTime: number;

    /**
     * Unix ms epoch representing the expiration time of the most recent lock
     */
    lockedUntilTime: number;

    /**
     * Unix ms epoch representing the start time of the next run of the task
     */
    nextRunTime?: number;

    lastRun?: {
      /**
       * Unix ms epoch representing the start time of the most recent run of
       * the task
       */
      startTime: number;

      /**
       * Unix ms epoch representing the end time of the most recent run of the
       * task
       */
      finishTime: number;

      /**
       * Boolean indicating whether the most recent run of the task succeeded
       * or failed.
       */
      succeeded: boolean;
    };

    /**
     * Unix ms epoch representing the time that the current run began, if the
     * task has begun running without finishing/failing.
     */
    currentRunStartTime?: number;

    /**
     * Opaque string corresponding to the client that has the current lock on
     * the task
     */
    lockToken?: string;

    /**
     * The number of times within the current run that the task has been
     * delivered to a client for processing.
     */
    deliveries: number;

    /**
     * The number of times within the current run that the task has been
     * delivered but failed to be processed for one reason or another.
     */
    attempts: number;

    /**
     * The total number of finished runs that have been executed for this task.
     */
    runs: number;

    /**
     * Interval between successive runs of the task, represented either as a
     * number of milliseconds between runs, or a cron string indicating the
     * schedule to run on.
     */
    interval?: string | number;

    /**
     * If defined, the task will not schedule any runs past this time.
     */
    lastRunTime?: number;

    /**
     * Amount of time in milliseconds to hold the task in completed or failed
     * state (with no future runs scheduled) before deleting.
     */
    ttlMs?: number;

    /**
     * Maximum amount of time in milliseconds to allow a single execution of a
     * task to run before considering the attempt failed due to a timeout.
     */
    maxExecutionTimeMs?: number;
  };

  /**
   * User-defined payload containing relevant information for the task. This
   * may be updated by the user at any point in time, but may not be updated
   * while the task is being processed from outside of the processor itself.
   */
  payload: T;
}

export interface ResolvedTaskDocument<T> extends TaskDocument<T>, Resource {}
