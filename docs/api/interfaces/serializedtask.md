[Home](../index.md) &gt; [SerializedTask](./serializedtask.md)

# Interface SerializedTask

Representation of a task converted to a plain JSON object. Created by [TaskBase.toJSON()](./taskbase.md#toJSON-method) and derivatives.

<b>Signature:</b>

```typescript
interface SerializedTask<T> 
```

## Implemented By

- <b>SerializedTask</b>
    - [SerializedActiveTask](./serializedactivetask.md)

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [attempts](./serializedtask.md#attempts-property) | `number` | Number of times task processing has been attempted unsuccessfully. This number only includes attempts that are not currently running and resets after each time the task completes or fails a run. It is similar to deliveries but only increments for results that indicate some sort of failure. These include calling `retry()` on the task and when the task's lock expires. |
|  [createTime](./serializedtask.md#createTime-property) | `string` | ISO date string representing the time when the task was first created |
|  [currentRunStartTime](./serializedtask.md#currentRunStartTime-property) | `string` | ISO date string representing the time when the current run of the task began, if there is a current run. |
|  [deliveries](./serializedtask.md#deliveries-property) | `number` | Number of times the task has been delivered for processing. This number only includes deliveries that are not currently running and resets after each time the task completes or fails a run. |
|  [enabled](./serializedtask.md#enabled-property) | `boolean` | Indicates whether the task is eligible for processing |
|  [id](./serializedtask.md#id-property) | `string` | Unique identifier for the task |
|  [interval](./serializedtask.md#interval-property) | `string \| number` | If defined, the schedule on which to run the task. If it is a number, it represents the number of milliseconds between each run of the task. If it is a string, it is a cron string indicating the schedule on which to run. |
|  [lastRun](./serializedtask.md#lastRun-property) | <pre>{&#010;    startTime: string;&#010;    finishTime: string;&#010;    succeeded: boolean;&#010;}</pre> | Metadata about the most recent completed/failed run of the task. If the task has never completed or failed a run, this is undefined. |
|  [nextRunTime](./serializedtask.md#nextRunTime-property) | `string` | ISO date string representing the next time the task should be processed. Can be earlier than the current time if the task is pending or currently running and is undefined if the task is not running and has no future runs scheduled. |
|  [payload](./serializedtask.md#payload-property) | `T` | User-defined payload holding information about the task. |
|  [runs](./serializedtask.md#runs-property) | `number` | Number of times task processing has run to completion, regardless of whether they ultimately succeeded or failed. This number only includes previously completed runs. For one-time tasks, this will only ever be 0 or 1, but can be arbitrarily large for recurring tasks that have run many times. |
|  [status](./serializedtask.md#status-property) | [TaskStatus](../enums/taskstatus.md) | Current status of the task |
|  [type](./serializedtask.md#type-property) | `string` | The type (grouping) for the task |

## Property Details

<a id="attempts-property"></a>

### attempts

Number of times task processing has been attempted unsuccessfully. This number only includes attempts that are not currently running and resets after each time the task completes or fails a run. It is similar to deliveries but only increments for results that indicate some sort of failure. These include calling `retry()` on the task and when the task's lock expires.

<b>Signature:</b>

```typescript
attempts: number;
```

<a id="createTime-property"></a>

### createTime

ISO date string representing the time when the task was first created

<b>Signature:</b>

```typescript
createTime: string;
```

<a id="currentRunStartTime-property"></a>

### currentRunStartTime

ISO date string representing the time when the current run of the task began, if there is a current run.

It will be present for any task which has begun running but has not yet finished for any reason, including because it was disabled while running. It will only be defined if there is an uncompleted run of the task.

<b>Signature:</b>

```typescript
currentRunStartTime?: string;
```

<a id="deliveries-property"></a>

### deliveries

Number of times the task has been delivered for processing. This number only includes deliveries that are not currently running and resets after each time the task completes or fails a run.

<b>Signature:</b>

```typescript
deliveries: number;
```

<a id="enabled-property"></a>

### enabled

Indicates whether the task is eligible for processing

<b>Signature:</b>

```typescript
enabled: boolean;
```

<a id="id-property"></a>

### id

Unique identifier for the task

<b>Signature:</b>

```typescript
id: string;
```

<a id="interval-property"></a>

### interval

If defined, the schedule on which to run the task. If it is a number, it represents the number of milliseconds between each run of the task. If it is a string, it is a cron string indicating the schedule on which to run.

<b>Signature:</b>

```typescript
interval?: string | number;
```

<a id="lastRun-property"></a>

### lastRun

Metadata about the most recent completed/failed run of the task. If the task has never completed or failed a run, this is undefined.

<b>Signature:</b>

```typescript
lastRun?: {
        startTime: string;
        finishTime: string;
        succeeded: boolean;
    };
```

<a id="nextRunTime-property"></a>

### nextRunTime

ISO date string representing the next time the task should be processed. Can be earlier than the current time if the task is pending or currently running and is undefined if the task is not running and has no future runs scheduled.

<b>Signature:</b>

```typescript
nextRunTime?: string;
```

<a id="payload-property"></a>

### payload

User-defined payload holding information about the task.

<b>Signature:</b>

```typescript
payload: T;
```

<a id="runs-property"></a>

### runs

Number of times task processing has run to completion, regardless of whether they ultimately succeeded or failed. This number only includes previously completed runs. For one-time tasks, this will only ever be 0 or 1, but can be arbitrarily large for recurring tasks that have run many times.

<b>Signature:</b>

```typescript
runs: number;
```

<a id="status-property"></a>

### status

Current status of the task

<b>Signature:</b>

```typescript
status: TaskStatus;
```

<a id="type-property"></a>

### type

The type (grouping) for the task

<b>Signature:</b>

```typescript
type: string;
```
