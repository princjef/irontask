[Home](../../../index.md) &gt; [t](../../t.md) &gt; [nextRunTime](./nextruntime.md)

# Variable t.nextRunTime

Unix ms epoch representing the next time the task should be processed. Can be earlier than the current time if the task is pending or currently running and is undefined if the task is not running and has no future runs scheduled.

<b>Signature:</b>

```typescript
nextRunTime: QueryType.NumericProperty
```
