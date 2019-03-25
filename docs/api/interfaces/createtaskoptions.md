[Home](../index.md) &gt; [CreateTaskOptions](./createtaskoptions.md)

# Interface CreateTaskOptions

Options for configuring a task created through the [TaskClient](../classes/taskclient.md)<!-- -->.

<b>Signature:</b>

```typescript
interface CreateTaskOptions 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [enabled](./createtaskoptions.md#enabled-property) | `boolean` | Set to false if you don't want the task to be available for processing when it's created. |
|  [interval](./createtaskoptions.md#interval-property) | `string \| number` | Optional interval on which the task should run. It can either be set to a number, in which case it is a number of milliseconds between each run, or it can be set to a string, in which case is it a cron string (up to 1 second resolution) indicating when the task should be run.<br><br>Task executions will not stack up (i.e. a task will only actively execute once at a time), so it is not guaranteed that you will have a task execute at exactly the configured interval. For instance, if your task takes 90 seconds to process but is scheduled to run once a minute, it will only run once every 90 seconds. |
|  [maxExecutionTimeMs](./createtaskoptions.md#maxExecutionTimeMs-property) | `number` | If specified, the duration to renew the lock while processing this task before considering processing to be hung and releasing the lock. Overrides the corresponding options on the client and task type levels. A value of 0 indicates no limit. |
|  [scheduledTime](./createtaskoptions.md#scheduledTime-property) | `Date` | The scheduled time to run the task (or to run the first execution of the task in the case of recurring tasks). If not specified, it defaults to the creation time of the task unless a cron string is specified for the [CreateTaskOptions.interval](./createtaskoptions.md#interval-property)<!-- -->, in which case it is set to the first matching time in the cron schedule after the task creation time. |
|  [ttlMs](./createtaskoptions.md#ttlMs-property) | `number` | If specified, the amount of time in milliseconds to retain a completed or failed task with no more scheduled executions before deleting. |

## Property Details

<a id="enabled-property"></a>

### enabled

Set to false if you don't want the task to be available for processing when it's created.

<b>Signature:</b>

```typescript
enabled?: boolean;
```
<b>Default Value:</b>

true

<a id="interval-property"></a>

### interval

Optional interval on which the task should run. It can either be set to a number, in which case it is a number of milliseconds between each run, or it can be set to a string, in which case is it a cron string (up to 1 second resolution) indicating when the task should be run.

Task executions will not stack up (i.e. a task will only actively execute once at a time), so it is not guaranteed that you will have a task execute at exactly the configured interval. For instance, if your task takes 90 seconds to process but is scheduled to run once a minute, it will only run once every 90 seconds.

<b>Signature:</b>

```typescript
interval?: string | number;
```

#### Example 1

Run on the 5th minute of every hour

```ts
{
  interval: '5 * * * *'
}

```

#### Example 2

Run every 5 minutes

```ts
{
  interval: 300000
}

```

<a id="maxExecutionTimeMs-property"></a>

### maxExecutionTimeMs

If specified, the duration to renew the lock while processing this task before considering processing to be hung and releasing the lock. Overrides the corresponding options on the client and task type levels. A value of 0 indicates no limit.

<b>Signature:</b>

```typescript
maxExecutionTimeMs?: number;
```
<b>Default Value:</b>

client value (30 minutes)

<a id="scheduledTime-property"></a>

### scheduledTime

The scheduled time to run the task (or to run the first execution of the task in the case of recurring tasks). If not specified, it defaults to the creation time of the task unless a cron string is specified for the [CreateTaskOptions.interval](./createtaskoptions.md#interval-property)<!-- -->, in which case it is set to the first matching time in the cron schedule after the task creation time.

<b>Signature:</b>

```typescript
scheduledTime?: Date;
```

<a id="ttlMs-property"></a>

### ttlMs

If specified, the amount of time in milliseconds to retain a completed or failed task with no more scheduled executions before deleting.

<b>Signature:</b>

```typescript
ttlMs?: number;
```
