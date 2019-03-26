[Home](../../../index.md) &gt; [Interceptors](../../interceptors.md) &gt; [TaskRequestInterceptor](./taskrequestinterceptor.md)

# Type Interceptors.TaskRequestInterceptor

Interceptor function for handling task-level requests.

<b>Signature:</b>

```typescript
type TaskRequestInterceptor = (context: TaskRequestContext, next: RequestNext) => Promise<void>;
```
