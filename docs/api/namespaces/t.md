[Home](../index.md) &gt; [t](./t.md)

# Namespace t

Expressions representing various properties of a task useful for filtering or projection expressions in operations like [TaskClient.list()](../classes/taskclient.md#list-method)<!-- -->, [TaskClient.listSummary()](../classes/taskclient.md#listSummary-method)<!-- -->, [TaskClient.iterate()](../classes/taskclient.md#iterate-method)<!-- -->, [TaskClient.iterateSummary()](../classes/taskclient.md#iterateSummary-method) and more.

<b>Signature:</b>

```typescript
namespace t 
```

## Variables

|  Variable | Description |
|  --- | --- |
|  [attempts](./t/variables/attempts.md) | Number of times task processing has been attempted unsuccessfully. This number only includes attempts that are not currently running and resets after each time the task completes or fails a run. It is similar to deliveries but only increments for results that indicate some sort of failure. These include calling [ActiveTask.retry()](../interfaces/activetask.md#retry-method) and when the task's lock expires. |
|  [createTime](./t/variables/createtime.md) | Unix ms epoch representing the time when the task was first created |
|  [deliveries](./t/variables/deliveries.md) | Number of times the task has been delivered for processing. This number only includes deliveries that are not currently running and resets after each time the task completes or fails a run. |
|  [enabled](./t/variables/enabled.md) | Indicates whether the task is eligible for processing |
|  [hasStatus](./t/variables/hasstatus.md) | Status is a derived property. It does not behave as a property because it is computed dynamically, but this helper can be used to determine whether the status belongs to each of the possible states. |
|  [id](./t/variables/id.md) | Unique identifier for the task |
|  [interval](./t/variables/interval.md) | If defined, the schedule on which to run the task. If it is a number, it represents the number of milliseconds between each run of the task. If it is a string, it is a cron string indicating the schedule on which to run. |
|  [lastRun](./t/variables/lastrun.md) | Metadata about the most recent completed/failed run of the task. If the task has neither failed a run, this is undefined. |
|  [lastRunFinishTime](./t/variables/lastrunfinishtime.md) | Unix ms epoch representing when the last run finished processing. If the task has neither completed nor failed a run, this is undefined. |
|  [lastRunStartTime](./t/variables/lastrunstarttime.md) | Unix ms epoch representing when the most recent run began processing. If the task has neither completed nor failed a run, this is undefined. |
|  [lastRunSucceeded](./t/variables/lastrunsucceeded.md) | Boolean indicating whether or not the most recent run succeeded or failed. If the task has neither completed nor failed a run, this is undefined. |
|  [lastUpdatedTime](./t/variables/lastupdatedtime.md) | Unix ms epoch representing the last time the task was updated, either explicitly or as part of processing. |
|  [nextRunTime](./t/variables/nextruntime.md) | Unix ms epoch representing the next time the task should be processed. Can be earlier than the current time if the task is pending or currently running and is undefined if the task is not running and has no future runs scheduled. |
|  [payload](./t/variables/payload.md) | User-defined payload holding information about the task. If called with no arguments, it points to the entire payload. However, you can also reference portions of the payload by providing arguments to the function. Each argument represents a property name or array index that, when combined, form a path to a property in the payload. |
|  [runs](./t/variables/runs.md) | Number of times task processing has run to completion, regardless of whether they ultimately succeeded or failed. This number only includes previously completed runs. For one-time tasks, this will only ever be 0 or 1, but can be arbitrarily large for recurring tasks that have run many times. |
|  [type](./t/variables/type.md) | The type (grouping) for the task |

