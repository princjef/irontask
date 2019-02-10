[Home](../../../index.md) &gt; [t](../../t.md) &gt; [runs](./runs.md)

# Variable t.runs

Number of times task processing has run to completion, regardless of whether they ultimately succeeded or failed. This number only includes previously completed runs. For one-time tasks, this will only ever be 0 or 1, but can be arbitrarily large for recurring tasks that have run many times.

<b>Signature:</b>

```typescript
runs: QueryType.NumericProperty
```
