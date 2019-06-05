[Home](../index.md) &gt; [SerializedActiveTask](./serializedactivetask.md)

# Interface SerializedActiveTask

Representation of a task that is currently being processed converted to a plain JSON object. Created by [ActiveTask.toJSON()](./activetask.md#toJSON-method)<!-- -->.

<b>Signature:</b>

```typescript
interface SerializedActiveTask<T> extends SerializedTask<T> 
```

## Implements Interfaces

- <b>SerializedActiveTask</b>
    - [SerializedTask](./serializedtask.md)

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [attempts](./serializedtask.md#attempts-property) | `number` | Number of times task processing has been attempted unsuccessfully. This number only includes attempts that are not currently running and resets after each time the task completes or fails a run. It is similar to deliveries but only increments for results that indicate some sort of failure. These include calling `retry()` on the task and when the task's lock expires.<br><br><i>Inherited from [SerializedTask.attempts](./serializedtask.md#attempts-property)</i> |
|  [createTime](./serializedtask.md#createTime-property) | `string` | ISO date string representing the time when the task was first created<br><br><i>Inherited from [SerializedTask.createTime](./serializedtask.md#createTime-property)</i> |
|  [currentRunStartTime](./serializedtask.md#currentRunStartTime-property) | `string` | ISO date string representing the time when the current run of the task began, if there is a current run.<br><br><i>Inherited from [SerializedTask.currentRunStartTime](./serializedtask.md#currentRunStartTime-property)</i> |
|  [deliveries](./serializedtask.md#deliveries-property) | `number` | Number of times the task has been delivered for processing. This number only includes deliveries that are not currently running and resets after each time the task completes or fails a run.<br><br><i>Inherited from [SerializedTask.deliveries](./serializedtask.md#deliveries-property)</i> |
|  [enabled](./serializedtask.md#enabled-property) | `boolean` | Indicates whether the task is eligible for processing<br><br><i>Inherited from [SerializedTask.enabled](./serializedtask.md#enabled-property)</i> |
|  [id](./serializedtask.md#id-property) | `string` | Unique identifier for the task<br><br><i>Inherited from [SerializedTask.id](./serializedtask.md#id-property)</i> |
|  [interval](./serializedtask.md#interval-property) | `string \| number` | If defined, the schedule on which to run the task. If it is a number, it represents the number of milliseconds between each run of the task. If it is a string, it is a cron string indicating the schedule on which to run.<br><br><i>Inherited from [SerializedTask.interval](./serializedtask.md#interval-property)</i> |
|  [lastRun](./serializedtask.md#lastRun-property) | <pre>{&#010;    startTime: string;&#010;    finishTime: string;&#010;    succeeded: boolean;&#010;}</pre> | Metadata about the most recent completed/failed run of the task. If the task has never completed or failed a run, this is undefined.<br><br><i>Inherited from [SerializedTask.lastRun](./serializedtask.md#lastRun-property)</i> |
|  [lastUpdatedTime](./serializedtask.md#lastUpdatedTime-property) | `string` | ISO date string representing the last time the task was updated, either explicitly or as a part of task processing.<br><br><i>Inherited from [SerializedTask.lastUpdatedTime](./serializedtask.md#lastUpdatedTime-property)</i> |
|  [locked](./serializedactivetask.md#locked-property) | `boolean` | Indicates whether the current processor has a valid lock on the task. If this becomes false, the handler will no longer be allowed to update or finish the task processing to avoid race conditions with other processors. |
|  [nextRunTime](./serializedtask.md#nextRunTime-property) | `string` | ISO date string representing the next time the task should be processed. Can be earlier than the current time if the task is pending or currently running and is undefined if the task is not running and has no future runs scheduled.<br><br><i>Inherited from [SerializedTask.nextRunTime](./serializedtask.md#nextRunTime-property)</i> |
|  [payload](./serializedtask.md#payload-property) | `T` | User-defined payload holding information about the task.<br><br><i>Inherited from [SerializedTask.payload](./serializedtask.md#payload-property)</i> |
|  [runs](./serializedtask.md#runs-property) | `number` | Number of times task processing has run to completion, regardless of whether they ultimately succeeded or failed. This number only includes previously completed runs. For one-time tasks, this will only ever be 0 or 1, but can be arbitrarily large for recurring tasks that have run many times.<br><br><i>Inherited from [SerializedTask.runs](./serializedtask.md#runs-property)</i> |
|  [status](./serializedtask.md#status-property) | [TaskStatus](../enums/taskstatus.md) | Current status of the task<br><br><i>Inherited from [SerializedTask.status](./serializedtask.md#status-property)</i> |
|  [type](./serializedtask.md#type-property) | `string` | The type (grouping) for the task<br><br><i>Inherited from [SerializedTask.type](./serializedtask.md#type-property)</i> |

## Property Details

<a id="locked-property"></a>

### locked

Indicates whether the current processor has a valid lock on the task. If this becomes false, the handler will no longer be allowed to update or finish the task processing to avoid race conditions with other processors.

<b>Signature:</b>

```typescript
locked: boolean;
```
