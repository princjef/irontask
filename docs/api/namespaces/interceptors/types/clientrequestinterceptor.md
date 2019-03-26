[Home](../../../index.md) &gt; [Interceptors](../../interceptors.md) &gt; [ClientRequestInterceptor](./clientrequestinterceptor.md)

# Type Interceptors.ClientRequestInterceptor

Interceptor function for handling client-level requests.

<b>Signature:</b>

```typescript
type ClientRequestInterceptor = (context: TaskClientRequestContext, next: RequestNext) => Promise<void>;
```
