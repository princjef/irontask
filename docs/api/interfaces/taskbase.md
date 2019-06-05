[Home](../index.md) &gt; [TaskBase](./taskbase.md)

# Interface TaskBase

Base data and functionality that is common to tasks created and used in any context.

<b>Signature:</b>

```typescript
interface TaskBase<T> 
```

## Implemented By

- <b>TaskBase</b>
    - [ActiveTask](./activetask.md)
    - [ReadonlyTask](./readonlytask.md)
    - [Task](./task.md)

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [attempts](./taskbase.md#attempts-property) | `number` | Number of times task processing has been attempted unsuccessfully. This number only includes attempts that are not currently running and resets after each time the task completes or fails a run. It is similar to deliveries but only increments for results that indicate some sort of failure. These include calling [ActiveTask.retry()](./activetask.md#retry-method) and when the task's lock expires. |
|  [createTime](./taskbase.md#createTime-property) | `Date` | Date representing the time when the task was first created |
|  [currentRunStartTime](./taskbase.md#currentRunStartTime-property) | `Date` | Date representing the time when the current run of the task began, if there is a current run. |
|  [deliveries](./taskbase.md#deliveries-property) | `number` | Number of times the task has been delivered for processing. This number only includes deliveries that are not currently running and resets after each time the task completes or fails a run. |
|  [enabled](./taskbase.md#enabled-property) | `boolean` | Indicates whether the task is eligible for processing |
|  [id](./taskbase.md#id-property) | `string` | Unique identifier for the task |
|  [interval](./taskbase.md#interval-property) | `string \| number` | If defined, the schedule on which to run the task. If it is a number, it represents the number of milliseconds between each run of the task. If it is a string, it is a cron string indicating the schedule on which to run. |
|  [lastRun](./taskbase.md#lastRun-property) | <pre>{&#010;    readonly startTime: Date;&#010;    readonly finishTime: Date;&#010;    readonly succeeded: boolean;&#010;}</pre> | Metadata about the most recent completed/failed run of the task. If the task has never completed or failed a run, this is undefined. |
|  [lastUpdatedTime](./taskbase.md#lastUpdatedTime-property) | `Date` | Date representing the last time the task was updated, either explicitly or as a part of task processing. |
|  [nextRunTime](./taskbase.md#nextRunTime-property) | `Date` | Date representing the next time the task should be processed. Can be earlier than the current time if the task is pending or currently running and is undefined if the task is not running and has no future runs scheduled. |
|  [payload](./taskbase.md#payload-property) | `T` | User-defined payload holding information about the task. |
|  [runs](./taskbase.md#runs-property) | `number` | Number of times task processing has run to completion, regardless of whether they ultimately succeeded or failed. This number only includes previously completed runs. For one-time tasks, this will only ever be 0 or 1, but can be arbitrarily large for recurring tasks that have run many times. |
|  [status](./taskbase.md#status-property) | [TaskStatus](../enums/taskstatus.md) | Current status of the task |
|  [type](./taskbase.md#type-property) | `string` | The type (grouping) for the task |

## Methods

|  Method | Description |
|  --- | --- |
|  [toJSON()](./taskbase.md#toJSON-method) | Convert the task to a serialization-friendly format |

## Property Details

<a id="attempts-property"></a>

### attempts

Number of times task processing has been attempted unsuccessfully. This number only includes attempts that are not currently running and resets after each time the task completes or fails a run. It is similar to deliveries but only increments for results that indicate some sort of failure. These include calling [ActiveTask.retry()](./activetask.md#retry-method) and when the task's lock expires.

<b>Signature:</b>

```typescript
readonly attempts: number;
```

<a id="createTime-property"></a>

### createTime

Date representing the time when the task was first created

<b>Signature:</b>

```typescript
readonly createTime: Date;
```

<a id="currentRunStartTime-property"></a>

### currentRunStartTime

Date representing the time when the current run of the task began, if there is a current run.

It will be present for any task which has begun running but has not yet finished for any reason, including because it was disabled while running. It will only be defined if there is an uncompleted run of the task.

<b>Signature:</b>

```typescript
readonly currentRunStartTime?: Date;
```

<a id="deliveries-property"></a>

### deliveries

Number of times the task has been delivered for processing. This number only includes deliveries that are not currently running and resets after each time the task completes or fails a run.

<b>Signature:</b>

```typescript
readonly deliveries: number;
```

<a id="enabled-property"></a>

### enabled

Indicates whether the task is eligible for processing

<b>Signature:</b>

```typescript
readonly enabled: boolean;
```

<a id="id-property"></a>

### id

Unique identifier for the task

<b>Signature:</b>

```typescript
readonly id: string;
```

<a id="interval-property"></a>

### interval

If defined, the schedule on which to run the task. If it is a number, it represents the number of milliseconds between each run of the task. If it is a string, it is a cron string indicating the schedule on which to run.

<b>Signature:</b>

```typescript
readonly interval?: string | number;
```

<a id="lastRun-property"></a>

### lastRun

Metadata about the most recent completed/failed run of the task. If the task has never completed or failed a run, this is undefined.

<b>Signature:</b>

```typescript
readonly lastRun?: {
        readonly startTime: Date;
        readonly finishTime: Date;
        readonly succeeded: boolean;
    };
```

<a id="lastUpdatedTime-property"></a>

### lastUpdatedTime

Date representing the last time the task was updated, either explicitly or as a part of task processing.

<b>Signature:</b>

```typescript
readonly lastUpdatedTime: Date;
```

<a id="nextRunTime-property"></a>

### nextRunTime

Date representing the next time the task should be processed. Can be earlier than the current time if the task is pending or currently running and is undefined if the task is not running and has no future runs scheduled.

<b>Signature:</b>

```typescript
readonly nextRunTime?: Date;
```

<a id="payload-property"></a>

### payload

User-defined payload holding information about the task.

<b>Signature:</b>

```typescript
readonly payload: T;
```

<a id="runs-property"></a>

### runs

Number of times task processing has run to completion, regardless of whether they ultimately succeeded or failed. This number only includes previously completed runs. For one-time tasks, this will only ever be 0 or 1, but can be arbitrarily large for recurring tasks that have run many times.

<b>Signature:</b>

```typescript
readonly runs: number;
```

<a id="status-property"></a>

### status

Current status of the task

<b>Signature:</b>

```typescript
readonly status: TaskStatus;
```

<a id="type-property"></a>

### type

The type (grouping) for the task

<b>Signature:</b>

```typescript
readonly type: string;
```

## Method Details

<a id="toJSON-method"></a>

### toJSON()

Convert the task to a serialization-friendly format

<b>Signature:</b>

```typescript
toJSON(): SerializedTask<T>;
```
<b>Returns:</b>

`SerializedTask<T>`

