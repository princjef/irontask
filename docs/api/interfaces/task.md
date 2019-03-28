[Home](../index.md) &gt; [Task](./task.md)

# Interface Task

General representation of a task. It is returned by many methods such as , [TaskClient.get()](../classes/taskclient.md#get-method) and [TaskClient.list()](../classes/taskclient.md#list-method)<!-- -->. You should never need to create an instance of this class directly.

<b>Signature:</b>

```typescript
interface Task<T> extends TaskBase<T> 
```

## Implements Interfaces

- <b>Task</b>
    - [TaskBase](./taskbase.md)

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
|  [nextRunTime](./taskbase.md#nextRunTime-property) | `Date` | Date representing the next time the task should be processed. Can be earlier than the current time if the task is pending or currently running and is undefined if the task is not running and has no future runs scheduled.<br><br><i>Inherited from [TaskBase.nextRunTime](./taskbase.md#nextRunTime-property)</i> |
|  [payload](./task.md#payload-property) | `T` | User-defined payload holding information about the task.<br><br><i>Overrides [TaskBase.payload](./taskbase.md#payload-property)</i> |
|  [runs](./taskbase.md#runs-property) | `number` | Number of times task processing has run to completion, regardless of whether they ultimately succeeded or failed. This number only includes previously completed runs. For one-time tasks, this will only ever be 0 or 1, but can be arbitrarily large for recurring tasks that have run many times.<br><br><i>Inherited from [TaskBase.runs](./taskbase.md#runs-property)</i> |
|  [status](./taskbase.md#status-property) | [TaskStatus](../enums/taskstatus.md) | Current status of the task<br><br><i>Inherited from [TaskBase.status](./taskbase.md#status-property)</i> |
|  [type](./taskbase.md#type-property) | `string` | The type (grouping) for the task<br><br><i>Inherited from [TaskBase.type](./taskbase.md#type-property)</i> |

## Methods

|  Method | Description |
|  --- | --- |
|  [delete()](./task.md#delete-method) | Delete this task from the database. The operation is idempotent and will succeed even if the task has already been deleted. |
|  [disable()](./task.md#disable-method) | Disable the task for processing. If the task is currently running, the processor will be informed that the task has been disabled. |
|  [enable()](./task.md#enable-method) | Enable the task for processing. |
|  [save()](./task.md#save-method) | Update the task in the database to match the information in this instance. This can only be called once at a time to avoid race conditions between different updates of the payload. |
|  [toJSON()](./taskbase.md#toJSON-method) | Convert the task to a serialization-friendly format<br><br><i>Inherited from [TaskBase.toJSON()](./taskbase.md#toJSON-method)</i> |

## Property Details

<a id="payload-property"></a>

### payload

User-defined payload holding information about the task.

<i>Overrides [TaskBase.payload](./taskbase.md#payload-property)</i>

<b>Signature:</b>

```typescript
payload: T;
```

## Method Details

<a id="delete-method"></a>

### delete()

Delete this task from the database. The operation is idempotent and will succeed even if the task has already been deleted.

<b>Signature:</b>

```typescript
delete(): Promise<void>;
```
<b>Returns:</b>

`Promise<void>`

<a id="disable-method"></a>

### disable()

Disable the task for processing. If the task is currently running, the processor will be informed that the task has been disabled.

<b>Signature:</b>

```typescript
disable(): Promise<void>;
```
<b>Returns:</b>

`Promise<void>`

<a id="enable-method"></a>

### enable()

Enable the task for processing.

<b>Signature:</b>

```typescript
enable(): Promise<void>;
```
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

