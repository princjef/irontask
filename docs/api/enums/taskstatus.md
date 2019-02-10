[Home](../index.md) &gt; [TaskStatus](./taskstatus.md)

# Enum TaskStatus

Enumeration of different representations of the current processing status of a task.

<b>Signature:</b>

```typescript
enum TaskStatus 
```

## Enumeration Members

|  Member | Value | Description |
|  --- | --- | --- |
|  Completed | `"completed"` | The task completed its most recent run successfully and has no future runs scheduled. |
|  Disabled | `"disabled"` | The task has been disabled and is not running. The task will not run again unless it is re-enabled. |
|  Disabling | `"disabling"` | The task has been disabled, but a processor is still running the task from a previous run. |
|  Failed | `"failed"` | The task failed its most recent run and has no future runs scheduled. |
|  Pending | `"pending"` | The task is not currently running and its next scheduled run time has already passed. |
|  Running | `"running"` | The task is currently being processed. |
|  Scheduled | `"scheduled"` | The task is not currently running but is scheduled to run at a future time. |

