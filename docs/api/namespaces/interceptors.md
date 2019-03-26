[Home](../index.md) &gt; [Interceptors](./interceptors.md)

# Namespace Interceptors

Interfaces and helper types for the interceptor capability set.

<b>Signature:</b>

```typescript
namespace Interceptors 
```

## Enumerations

|  Enumeration | Description |
|  --- | --- |
|  [TaskClientOperation](./interceptors/enums/taskclientoperation.md) | Enumeration of operations that can be triggered via the client interceptor. |
|  [TaskOperation](./interceptors/enums/taskoperation.md) | Enumeration of operations that can be triggered via the task interceptor. |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [ProcessingContext](./interceptors/interfaces/processingcontext.md) | Context provided to the processing interceptor for each request. |
|  [TaskClientRequestContext](./interceptors/interfaces/taskclientrequestcontext.md) | Context provided to the client interceptor for each request. |
|  [TaskRequestContext](./interceptors/interfaces/taskrequestcontext.md) | Context provided to the task interceptor for each request. |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [ClientRequestInterceptor](./interceptors/types/clientrequestinterceptor.md) | Interceptor function for handling client-level requests. |
|  [ProcessingInterceptor](./interceptors/types/processinginterceptor.md) | Interceptor function for handling processing requests. |
|  [ProcessingNext](./interceptors/types/processingnext.md) | Next function provided for any processing interceptors. |
|  [RequestNext](./interceptors/types/requestnext.md) | Next function provided for any request interceptors. |
|  [TaskRequestInterceptor](./interceptors/types/taskrequestinterceptor.md) | Interceptor function for handling task-level requests. |

