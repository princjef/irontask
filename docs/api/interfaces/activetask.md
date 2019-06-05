[Home](../index.md) &gt; [ActiveTask](./activetask.md)

# Interface ActiveTask

Representation of a task that is currently being processed by a [Listener](./listener.md)<!-- -->. It provides the ability to see information and update values of the task like when working with a [Task](./task.md)<!-- -->, but also has additional functionality specific to processing, such as completing, retrying, etc.

<b>Signature:</b>

```typescript
interface ActiveTask<T> extends TaskBase<T>, EventEmitter 
```

## Implements Interfaces

- <b>ActiveTask</b>
    - [TaskBase](./taskbase.md)
    - EventEmitter

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [attempts](./taskbase.md#attempts-property) | `number` | Number of times task processing has been attempted unsuccessfully. This number only includes attempts that are not currently running and resets after each time the task completes or fails a run. It is similar to deliveries but only increments for results that indicate some sort of failure. These include calling [ActiveTask.retry()](./activetask.md#retry-method) and when the task's lock expires.<br><br><i>Inherited from [TaskBase.attempts](./taskbase.md#attempts-property)</i> |
|  [createTime](./taskbase.md#createTime-property) | `Date` | Date representing the time when the task was first created<br><br><i>Inherited from [TaskBase.createTime](./taskbase.md#createTime-property)</i> |
|  [currentRunStartTime](./taskbase.md#currentRunStartTime-property) | `Date` | Date representing the time when the current run of the task began, if there is a current run.<br><br><i>Inherited from [TaskBase.currentRunStartTime](./taskbase.md#currentRunStartTime-property)</i> |
|  [deliveries](./taskbase.md#deliveries-property) | `number` | Number of times the task has been delivered for processing. This number only includes deliveries that are not currently running and resets after each time the task completes or fails a run.<br><br><i>Inherited from [TaskBase.deliveries](./taskbase.md#deliveries-property)</i> |
|  [enabled](./taskbase.md#enabled-property) | `boolean` | Indicates whether the task is eligible for processing<br><br><i>Inherited from [TaskBase.enabled](./taskbase.md#enabled-property)</i> |
|  [id](./taskbase.md#id-property) | `string` | Unique identifier for the task<br><br><i>Inherited from [TaskBase.id](./taskbase.md#id-property)</i> |
|  [interval](./taskbase.md#interval-property) | `string \| number` | If defined, the schedule on which to run the task. If it is a number, it represents the number of milliseconds between each run of the task. If it is a string, it is a cron string indicating the schedule on which to run.<br><br><i>Inherited from [TaskBase.interval](./taskbase.md#interval-property)</i> |
|  [lastRun](./taskbase.md#lastRun-property) | <pre>{&#010;    readonly startTime: Date;&#010;    readonly finishTime: Date;&#010;    readonly succeeded: boolean;&#010;}</pre> | Metadata about the most recent completed/failed run of the task. If the task has never completed or failed a run, this is undefined.<br><br><i>Inherited from [TaskBase.lastRun](./taskbase.md#lastRun-property)</i> |
|  [lastUpdatedTime](./taskbase.md#lastUpdatedTime-property) | `Date` | Date representing the last time the task was updated, either explicitly or as a part of task processing.<br><br><i>Inherited from [TaskBase.lastUpdatedTime](./taskbase.md#lastUpdatedTime-property)</i> |
|  [locked](./activetask.md#locked-property) | `boolean` | Indicates whether the current processor has a valid lock on the task. If this becomes false, the handler will no longer be allowed to update or finish the task processing to avoid race conditions with other processors. |
|  [nextRunTime](./taskbase.md#nextRunTime-property) | `Date` | Date representing the next time the task should be processed. Can be earlier than the current time if the task is pending or currently running and is undefined if the task is not running and has no future runs scheduled.<br><br><i>Inherited from [TaskBase.nextRunTime](./taskbase.md#nextRunTime-property)</i> |
|  [payload](./activetask.md#payload-property) | `T` | User-defined payload holding information about the task.<br><br><i>Overrides [TaskBase.payload](./taskbase.md#payload-property)</i> |
|  [processingState](./activetask.md#processingState-property) | [ProcessingState](../enums/processingstate.md) | The current state of processing for this task. |
|  [runs](./taskbase.md#runs-property) | `number` | Number of times task processing has run to completion, regardless of whether they ultimately succeeded or failed. This number only includes previously completed runs. For one-time tasks, this will only ever be 0 or 1, but can be arbitrarily large for recurring tasks that have run many times.<br><br><i>Inherited from [TaskBase.runs](./taskbase.md#runs-property)</i> |
|  [status](./taskbase.md#status-property) | [TaskStatus](../enums/taskstatus.md) | Current status of the task<br><br><i>Inherited from [TaskBase.status](./taskbase.md#status-property)</i> |
|  [type](./taskbase.md#type-property) | `string` | The type (grouping) for the task<br><br><i>Inherited from [TaskBase.type](./taskbase.md#type-property)</i> |

## Methods

|  Method | Description |
|  --- | --- |
|  [complete(nextRunDelayMs, savePayload)](./activetask.md#complete-method) | Indicate that the task processing finished successfully. This will also implicitly save the current state of the task by default.<br><br>This function is called implicitly if the task handler returns without calling any of the finishing functions. |
|  [defer(delayMs, savePayload)](./activetask.md#defer-method) | Indicate that the task is not done for processing and should be picked up for processing at a later time. This is distinct from `retry()` in that it does not indicate any failure and can be called an unlimited number of times on a single run of a task without causing it to fail eventually. Additionally, the delay before reprocessing must be specified. This will also implicitly save the current state of the task by default. |
|  [delete()](./activetask.md#delete-method) | Delete this task from the database. The operation is idempotent and will succeed even if the task has already been deleted. It also implicitly completes the task. |
|  [fail(err, nextRunDelayMs, savePayload)](./activetask.md#fail-method) | Indicate that the task suffered an irrecoverable failure and should not be attempted again. This does \_not\_ prevent future runs from executing in the case of recurring tasks. This will also implicitly save the current state of the task by default. |
|  [forceRelease(err)](./activetask.md#forceRelease-method) | Stop processing of the task without informing the database that you have stopped processing the task. This should be used as an absolute last resort for releasing a task from processing as it doesn't allow any other processors to pick up the task until the current lock expires. |
|  [on(event: 'finished', listener)](./activetask.md#on-method-1) |  |
|  [on(event: 'lockRenewed' \| 'lockLost' \| 'disabled' \| 'inactive', listener)](./activetask.md#on-method-2) |  |
|  [on(event: 'stateChanged', listener)](./activetask.md#on-method) |  |
|  [release(savePayload)](./activetask.md#release-method) | Indicate that the task is not done processing but should not continue to be processed by this processor. This is typically used to indicate that task processing should be suspended after having been disabled. This will also implicitly save the current state of the task by default. |
|  [retry(err, delayMs, savePayload)](./activetask.md#retry-method) | Indicate that the task encountered an error that may be retried. If the configured retry limit has been reached, this is equivalent to calling `fail()`<!-- -->. After the specified delay (or a backoff computed from the configured retry options), the current run of the task will be reprocessed. This will also implicitly save the current state of the task by default.<br><br>This function is called implicitly if the task handler throws an exception (though it will not save the latest payload to avoid creating inconsistent states by accident) |
|  [save()](./activetask.md#save-method) | Update the task in the database to match the information in this instance. This can only be called once at a time to avoid race conditions between different updates of the payload. |
|  [toJSON()](./activetask.md#toJSON-method) | Convert the task to a serialization-friendly format<br><br><i>Overrides [TaskBase.toJSON()](./taskbase.md#toJSON-method)</i> |

## Property Details

<a id="locked-property"></a>

### locked

Indicates whether the current processor has a valid lock on the task. If this becomes false, the handler will no longer be allowed to update or finish the task processing to avoid race conditions with other processors.

<b>Signature:</b>

```typescript
readonly locked: boolean;
```

<a id="payload-property"></a>

### payload

User-defined payload holding information about the task.

<i>Overrides [TaskBase.payload](./taskbase.md#payload-property)</i>

<b>Signature:</b>

```typescript
payload: T;
```

<a id="processingState-property"></a>

### processingState

The current state of processing for this task.

<b>Signature:</b>

```typescript
readonly processingState: ProcessingState;
```

## Method Details

<a id="complete-method"></a>

### complete(nextRunDelayMs, savePayload)

Indicate that the task processing finished successfully. This will also implicitly save the current state of the task by default.

This function is called implicitly if the task handler returns without calling any of the finishing functions.

<b>Signature:</b>

```typescript
complete(nextRunDelayMs?: number, savePayload?: boolean): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  nextRunDelayMs | `number` | Optional amount of time to wait before executing another run of the task. Setting this overrides the time of the next run that is determined by the task [interval](./taskbase.md#interval-property) and can be used to trigger another run of a task that would not otherwise have any runs. |
|  savePayload | `boolean` | If true, saves the payload of the task while finishing, preventing the processor from having to make an extra call to the database to save the final payload. Defaults to true. |

<b>Returns:</b>

`Promise<void>`

<a id="defer-method"></a>

### defer(delayMs, savePayload)

Indicate that the task is not done for processing and should be picked up for processing at a later time. This is distinct from `retry()` in that it does not indicate any failure and can be called an unlimited number of times on a single run of a task without causing it to fail eventually. Additionally, the delay before reprocessing must be specified. This will also implicitly save the current state of the task by default.

<b>Signature:</b>

```typescript
defer(delayMs: number, savePayload?: boolean): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  delayMs | `number` | The amount of time to wait in milliseconds before attempting re-processing of the task. |
|  savePayload | `boolean` | If true, saves the payload of the task while finishing, preventing the processor from having to make an extra call to the database to save the final payload. Defaults to true. |

<b>Returns:</b>

`Promise<void>`

<a id="delete-method"></a>

### delete()

Delete this task from the database. The operation is idempotent and will succeed even if the task has already been deleted. It also implicitly completes the task.

<b>Signature:</b>

```typescript
delete(): Promise<void>;
```
<b>Returns:</b>

`Promise<void>`

<a id="fail-method"></a>

### fail(err, nextRunDelayMs, savePayload)

Indicate that the task suffered an irrecoverable failure and should not be attempted again. This does \_not\_ prevent future runs from executing in the case of recurring tasks. This will also implicitly save the current state of the task by default.

<b>Signature:</b>

```typescript
fail(err?: any, nextRunDelayMs?: number, savePayload?: boolean): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  err | `any` | The error associated with the failure. Useful for error reporting/logging. |
|  nextRunDelayMs | `number` | Optional amount of time to wait before executing another run of the task. Setting this overrides the time of the next run that is determined by the task [interval](./taskbase.md#interval-property) and can be used to trigger another run of a task that would not otherwise have any runs. |
|  savePayload | `boolean` | If true, saves the payload of the task while finishing, preventing the processor from having to make an extra call to the database to save the final payload. Defaults to true. |

<b>Returns:</b>

`Promise<void>`

<a id="forceRelease-method"></a>

### forceRelease(err)

Stop processing of the task without informing the database that you have stopped processing the task. This should be used as an absolute last resort for releasing a task from processing as it doesn't allow any other processors to pick up the task until the current lock expires.

<b>Signature:</b>

```typescript
forceRelease(err?: any): void;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  err | `any` | The error associated with the failure. Useful for error reporting/logging. |

<b>Returns:</b>

`void`

<a id="on-method-1"></a>

### on(event: 'finished', listener)

<b>Signature:</b>

```typescript
on(event: 'finished', listener: (result: TaskFinishMetadata) => void): this;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  event | `'finished'` |  |
|  listener | `(result: TaskFinishMetadata) => void` |  |

<b>Returns:</b>

`this`

<a id="on-method-2"></a>

### on(event: 'lockRenewed' \| 'lockLost' \| 'disabled' \| 'inactive', listener)

<b>Signature:</b>

```typescript
on(event: 'lockRenewed' | 'lockLost' | 'disabled' | 'inactive', listener: () => void): this;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  event | `'lockRenewed' \| 'lockLost' \| 'disabled' \| 'inactive'` |  |
|  listener | `() => void` |  |

<b>Returns:</b>

`this`

<a id="on-method"></a>

### on(event: 'stateChanged', listener)

<b>Signature:</b>

```typescript
on(event: 'stateChanged', listener: (state: ProcessingState) => void): this;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  event | `'stateChanged'` |  |
|  listener | `(state: ProcessingState) => void` |  |

<b>Returns:</b>

`this`

<a id="release-method"></a>

### release(savePayload)

Indicate that the task is not done processing but should not continue to be processed by this processor. This is typically used to indicate that task processing should be suspended after having been disabled. This will also implicitly save the current state of the task by default.

<b>Signature:</b>

```typescript
release(savePayload?: boolean): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  savePayload | `boolean` | If true, saves the payload of the task while finishing, preventing the processor from having to make an extra call to the database to save the final payload. Defaults to true. |

<b>Returns:</b>

`Promise<void>`

<a id="retry-method"></a>

### retry(err, delayMs, savePayload)

Indicate that the task encountered an error that may be retried. If the configured retry limit has been reached, this is equivalent to calling `fail()`<!-- -->. After the specified delay (or a backoff computed from the configured retry options), the current run of the task will be reprocessed. This will also implicitly save the current state of the task by default.

This function is called implicitly if the task handler throws an exception (though it will not save the latest payload to avoid creating inconsistent states by accident)

<b>Signature:</b>

```typescript
retry(err?: any, delayMs?: number, savePayload?: boolean): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  err | `any` | The error associated with the failure. Useful for error reporting/logging. |
|  delayMs | `number` | Optional amount of time to wait in milliseconds before attempting re-processing of the task. If not specified, uses the retry options from the client to compute a delay. |
|  savePayload | `boolean` | If true, saves the payload of the task while finishing, preventing the processor from having to make an extra call to the database to save the final payload. Defaults to true. |

<b>Returns:</b>

`Promise<void>`

<a id="save-method"></a>

### save()

Update the task in the database to match the information in this instance. This can only be called once at a time to avoid race conditions between different updates of the payload.

<b>Signature:</b>

```typescript
save(): Promise<void>;
```
<b>Returns:</b>

`Promise<void>`

<a id="toJSON-method"></a>

### toJSON()

Convert the task to a serialization-friendly format

<i>Overrides [TaskBase.toJSON()](./taskbase.md#toJSON-method)</i>

<b>Signature:</b>

```typescript
toJSON(): SerializedActiveTask<T>;
```
<b>Returns:</b>

`SerializedActiveTask<T>`

