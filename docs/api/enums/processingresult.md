[Home](../index.md) &gt; [ProcessingResult](./processingresult.md)

# Enum ProcessingResult

Enumeration of all of the possible outcomes when processing a task.

<b>Signature:</b>

```typescript
enum ProcessingResult 
```

## Enumeration Members

|  Member | Value | Description |
|  --- | --- | --- |
|  Complete | `"complete"` | Processing finished successfully |
|  Defer | `"defer"` | Processing should be continued at a later time. Not considered a failure |
|  Delete | `"delete"` | The task was deleted by the processor. |
|  Fail | `"fail"` | Processing failed permanently or retried too many times |
|  ForceRelease | `"forceRelease"` | Processing was stopped without informing the database. Generally used when there is an issue communicating with the database when trying to finish processing. |
|  LockLost | `"lockLost"` | Processing stopped because the handler lost its lock on the task. |
|  Release | `"release"` | Processing stopped without finishing. Generally used to finish disabling a task or when destroying a listener. |
|  Retry | `"retry"` | Processing failed but should be attempted again |

