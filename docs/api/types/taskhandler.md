[Home](../index.md) &gt; [TaskHandler](./taskhandler.md)

# Type TaskHandler

Handler for processing received tasks

<b>Signature:</b>

```typescript
type TaskHandler<T> = (task: ActiveTask<T>) => void | Promise<void>;
```
