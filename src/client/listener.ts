/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { EventEmitter } from 'events';

import * as uuid from 'uuid/v4';

import { LISTEN_RETRY_TIMEOUTS } from '../constants';
import IronTaskError, { ErrorCode } from '../error';
import Interceptors, { InterceptorProcessor } from '../interceptor';
import { lock } from '../sproc';
import {
  ActiveTask,
  ActiveTaskImpl,
  ProcessingResult,
  ProcessingState,
  ResolvedTaskDocument,
  TaskFinishMetadata
} from '../task';
import { RecursiveRequired } from '../types/internal';
import fuzz from '../utils/fuzz';

import TaskClient from './client';
import CosmosDbClient from './cosmos';
import { ListenOptions, TaskHandler } from './types';

export default class ListenerImpl<T> extends EventEmitter
  implements Listener<T> {
  get activeTaskCount(): number {
    return this._activeTasks.size;
  }

  get running(): boolean {
    return this._running;
  }

  /**
   * Number of additional tasks that can be processed right now on top of our
   * current load.
   */
  private get _capacity(): number {
    return this._options.maxActiveTasks - this._activeTasks.size;
  }

  /**
   * Task client.
   */
  private _taskClient: TaskClient;

  /**
   * Cosmos DB client.
   */
  private _client: CosmosDbClient;

  /**
   * Interceptor for passing into tasks.
   */
  private _interceptor: InterceptorProcessor;

  /**
   * Handler provided by the user for processing tasks.
   */
  private _handler: (task: ActiveTask<T>) => void | Promise<void>;

  /**
   * Type of tasks to listen for
   */
  private _type: string;

  /**
   * Options for configuring the listener provided by the user.
   */
  private _options: RecursiveRequired<ListenOptions>;

  /**
   * Map of tasks that are actively being processed by their task ids
   */
  private _activeTasks: Map<string, ActiveTask<T>> = new Map();

  /**
   * If true, indicates that the task processor will continue to pick up new
   * tasks for processing as they become available.
   */
  private _running: boolean = true;

  /**
   * True if we're actively looking for new tasks to process.
   */
  private _polling: boolean = false;

  /**
   * The number of consecutive times that we have failed to poll for new tasks
   */
  private _consecutivePollFailures: number = 0;

  /**
   * If true, the listener is torn down and can no longer be used.
   */
  private _destroyed: boolean = false;

  /**
   * This will be defined if there is a timer set to attempt to fetch more
   * tasks in the future. Also doubles as the timer ref to cancel if
   * necessary.
   */
  private _pollTimer?: NodeJS.Timer;

  constructor(
    taskClient: TaskClient,
    client: CosmosDbClient,
    interceptor: InterceptorProcessor,
    type: string,
    handler: TaskHandler<T>,
    options: RecursiveRequired<ListenOptions>
  ) {
    super();

    this._taskClient = taskClient;
    this._client = client;
    this._interceptor = interceptor;
    this._type = type;
    this._handler = handler;
    this._options = options;

    // Start polling immediately with a small fuzzy factor built in. This
    // helps spread out calls from competing clients when they all start up
    // at the same time (which happens reasonably often due to common
    // startup behaviors).
    this._schedulePoll(0);
  }

  start(): void {
    if (!this._running) {
      // Set running to true to allow polling to run and then kick it off.
      this._running = true;
      this._pollNow();
    }
  }

  stop(): void {
    // Setting running to false will prevent future polls from running. We
    // just have to clear any existing timers.
    this._running = false;
    this._clearPoll();
  }

  async destroy(): Promise<void> {
    if (this._destroyed) {
      throw new IronTaskError(ErrorCode.LISTENER_DESTROYED);
    }

    // Step 1: stop to prevent additional polling
    this.stop();
    this._destroyed = true;

    // Step 2: allow any current poll calls to complete if necessary
    if (this._polling) {
      // Wait on the `polled` event, which indicates the current poll is
      // done.
      await new Promise<void>(resolve => this.once('polled', resolve));
    }

    // Step 3: take all active tasks and release them (current saves will be
    // allowed to complete)
    await this._releaseAllTasks();
  }

  /**
   * Main polling loop. Attempts to lock tasks and passes them off to the
   * handler for processing, scheduling the next poll depending on the tasks
   * returned and available capacity.
   */
  private _poll = async () => {
    try {
      // If the listener isn't running, don't poll.
      if (!this._running) {
        return;
      }

      // Start polling
      this._polling = true;

      // If there is no capacity, don't poll
      if (this._capacity <= 0) {
        return;
      }

      // Step 1: Fetch available tasks
      const { tasks, hasMore } = await this._lockTasks(this._capacity);

      // Step 2: Start the handler for each of the tasks we locked and
      // mark this cycle as successful
      for (const task of tasks) {
        this._handle(task).catch(() => {});
      }

      this._consecutivePollFailures = 0;

      // Step 3: Decide when to run the next cycle of the loop
      if (hasMore) {
        // If the locking process reported more available tasks to lock.
        // Try to lock them immediately.
        await this._poll();
      } else {
        // If there are no more tasks available to lock, wait for the
        // poll interval before trying again to avoid spamming the
        // database when there's nothing for us to do.
        this._schedulePoll(this._options.pollIntervalMs);
      }
    } catch (err) {
      // If something went wrong during polling, we wait a bit and try
      // again later.
      this._schedulePoll(
        LISTEN_RETRY_TIMEOUTS[
          this._consecutivePollFailures % LISTEN_RETRY_TIMEOUTS.length
        ]
      );

      // If we've failed enough times in a row to loop back around our
      // retries, emit an event informing the user that polling is not
      // working.
      if (
        this._consecutivePollFailures > 0 &&
        this._consecutivePollFailures % LISTEN_RETRY_TIMEOUTS.length === 0
      ) {
        this.emit('pollingStuck', err);
      }

      // Increment the failure count
      this._consecutivePollFailures += 1;
    } finally {
      // Once we get to the end of the loop, there's nothing else
      // running so we mark it accordingly. We only run this if we haven't
      // already marked the polling as finished so that we don't get extra
      // firings of the `polled` event.
      if (this._polling) {
        this.emit('polled');
        this._polling = false;
      }
    }
  };

  /**
   * Attempts to lock up to the specified number of tasks in the database,
   * returning the tasks it was able to lock along with a flag indicating
   * whether they may be more tasks on the server available to lock.
   *
   * @param maxCount  Maximum number of tasks we're willing to lock in this
   *                  call
   */
  private async _lockTasks(
    maxCount: number
  ): Promise<{ tasks: ActiveTask<T>[]; hasMore: boolean }> {
    return this._interceptor.client(
      this._taskClient,
      Interceptors.TaskClientOperation.LockTasks,
      this._client.containerRef,
      this._type,
      async () => {
        const response = await this._client.executeSproc<{
          tasks: ResolvedTaskDocument<T>[];
          hasMore: boolean;
        }>(
          lock.id,
          this._type,
          String(this._options.lockDurationMs),
          String(maxCount),
          uuid()
        );

        return {
          ...response,
          result: {
            tasks: response.result.tasks.map(doc =>
              ActiveTaskImpl.create(
                this._client,
                this._interceptor,
                doc,
                this._options
              )
            ),
            hasMore: response.result.hasMore
          }
        };
      }
    );
  }

  /**
   * Handler for listening to a task.
   *
   * @param task Task instance to process
   */
  private async _handle(task: ActiveTask<T>): Promise<void> {
    // Add the task to the list of actively processed tasks.
    this._activeTasks.set(task.id, task);

    try {
      await this._interceptor.processing(
        this,
        task,
        this._client.documentRef(task.type, task.id),
        async () => {
          let finishMeta: TaskFinishMetadata = {
            result: ProcessingResult.ForceRelease
          };

          // We use the finished event to pull out the processing result.
          // No matter how things finish, we will receive this event prior
          // to finishing this handler.
          task.once('finished', meta => (finishMeta = meta));

          try {
            try {
              // We let the two possible ways for task processing to
              // finish race each other
              await Promise.race([
                // The task is finished/expired/deleted
                new Promise<void>(resolve => task.once('inactive', resolve)),
                // The handler returns
                Promise.resolve(this._handler(task))
              ]);

              await this._finish(task, async () => task.complete());
            } catch (err) {
              // We explicitly tell the task to not save the payload
              // on throw because we don't want to accidentally save
              // inconsistent data if the handler fails in an
              // intermediate state.
              await this._finish(task, async () =>
                task.retry(err, undefined, false)
              );
            }
          } catch (err) {
            // We swallow all errors at this point and force release the task so
            // it doesn't try to keep running.
            task.forceRelease(err);
            // TODO: instrument?
          } finally {
            // Once the task is finished (success or failure), we remove it from
            // the active tasks list.
            this._activeTasks.delete(task.id);
            this.emit('finishedTask', task);
          }

          return finishMeta;
        }
      );
    } finally {
      // We run the next iteration of the polling loop outside of the processing
      // function to keep its operations separate from any handling/wrapping as
      // part of a processing interceptor
      this._pollNow();
    }
  }

  /**
   * Schedules a future attempt to poll for tasks to lock, ensuring that there
   * are no other tasks going on. The provided delay is adjusted by a small
   * fuzzy factor to help avoid undue races between clients.
   *
   * @param delayMs   Amount of time to wait in milliseconds before the next
   *                  polling attempt.
   */
  private _schedulePoll(delayMs: number) {
    // Only schedule a poll if we're still running
    if (this._running) {
      // If we already have a poll timer, clear it out first
      this._clearPoll();

      // Add a fuzzy factor to the scheduled time
      this._pollTimer = setTimeout(this._poll, Math.abs(delayMs + fuzz()));
    }
  }

  /**
   * Checks and executes the poll if it isn't already running. Used when there
   * is a trigger that indicates that we may have more capacity to process new
   * tasks.
   */
  private _pollNow() {
    // If we're actively polling, there's nothing to trigger. Once the
    // current poll finishes, it will figure out whether it's worth polling
    // again.
    if (this._polling) {
      return;
    }

    // Clear the timer so we don't get a stacking of polls
    this._clearPoll();

    // Run the poll now
    this._poll().catch(() => {});
  }

  /**
   * Clear out the current poll timer, if one is present
   */
  private _clearPoll() {
    if (this._pollTimer) {
      clearTimeout(this._pollTimer);
      this._pollTimer = undefined;
    }
  }

  /**
   * Forcefully release all tasks from processing. This is only used when
   * destroying the listener.
   */
  private async _releaseAllTasks() {
    await Promise.all(
      Array.from(this._activeTasks).map(async ([id, task]) => {
        try {
          // We explicitly tell the release not to save the latest payload
          // so that we don't accidentally save an inconsistent payload
          // because the processor is in an intermediate state.
          await this._finish(task, async () => task.release(false));
        } catch (err) {
          // Dump the task from the list manually
          task.forceRelease(err);
          // TODO: instrument?
        } finally {
          // Clear from the active tasks list
          this._activeTasks.delete(id);
        }
      })
    );
  }

  /**
   * Run the completion function on the task, waiting for it to enter an
   * appropriate state if needed. If it is already finished, then do nothing.
   *
   * @param task   The task to wait for
   */
  private async _finish(task: ActiveTask<any>, finisher: () => Promise<void>) {
    // If the task was already finishing, we don't want to try to finish it
    // now. We wait for it to change back to active or to one of the finish
    // states before trying to finish it
    if (task.processingState === ProcessingState.Finishing) {
      await new Promise<void>(resolve => task.once('stateChanged', resolve));
    }

    if (task.processingState === ProcessingState.Active) {
      await finisher();
    }
  }
}

/**
 * Listener for processing tasks of a single type. It is generally created by
 * calling {@link TaskClient.listen}.
 *
 * @public
 */
export interface Listener<T> extends EventEmitter {
  /**
   * Number indicating the total count of active tasks being processed by the
   * listener. Useful if you want to check processor load or if the processor
   * is idling.
   *
   * @public
   */
  readonly activeTaskCount: number;

  /**
   * Boolean indicating whether the listener is actively running or not.
   *
   * @public
   */
  readonly running: boolean;

  /**
   * Start processing tasks from the listener. Useful if you want to pause and
   * resume the task processing using some custom logic. Does nothing if the
   * subsciprtion is already running.
   *
   * @public
   */
  start(): void;

  /**
   * Stop the listener from processing new tasks, but allow any currently
   * running tasks to complete if desired. Does nothing if the subscription is
   * already stopped.
   *
   * @public
   */
  stop(): void;

  /**
   * Stop processing tasks from the listener AND terminate processing of any
   * tasks that are currently in-flight by releasing them. Returns a promise
   * which resolves once all tasks have been released. Unlike {@link
   * Listener.start} and {@link Listener.stop}, this is _not_ idempotent.
   * Calls to destroy an already destroyed client will result in an error to
   * avoid race conditions during shutdown.
   *
   * @public
   */
  destroy(): Promise<void>;

  on(event: 'polled', listener: () => void): this;
  on(event: 'pollingStuck', listener: (err: any) => void): this;
  on(event: 'finishedTask', listener: (task: ActiveTask<T>) => void): this;
}
