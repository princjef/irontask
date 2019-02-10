[Home](../../../index.md) &gt; [t](../../t.md) &gt; [attempts](./attempts.md)

# Variable t.attempts

Number of times task processing has been attempted unsuccessfully. This number only includes attempts that are not currently running and resets after each time the task completes or fails a run. It is similar to deliveries but only increments for results that indicate some sort of failure. These include calling [ActiveTask.retry()](../../../interfaces/activetask.md#retry-method) and when the task's lock expires.

<b>Signature:</b>

```typescript
attempts: QueryType.NumericProperty
```
