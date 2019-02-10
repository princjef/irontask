[Home](../index.md) &gt; [ProcessingState](./processingstate.md)

# Enum ProcessingState

Representation of the current status of processing an [ActiveTask](../interfaces/activetask.md)<!-- -->.

<b>Signature:</b>

```typescript
enum ProcessingState 
```

## Enumeration Members

|  Member | Value | Description |
|  --- | --- | --- |
|  Active | `0` | The handler is currently processing the task. |
|  Finished | `2` | The handler has finished processing the task. |
|  Finishing | `1` | The handler is currently trying to finish processing of the task. |
|  LockLost | `3` | The handler lost its lock on the task while processing. |

