[Home](../index.md) &gt; [Interceptors](./interceptors.md)

# Interface Interceptors

Set of functions provided for intercepting various types of operations. Each Interceptor that is provided will be invoked for each operation of the relevant type.

<b>Signature:</b>

```typescript
interface Interceptors 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [client](./interceptors.md#client-property) | [Interceptors.ClientRequestInterceptor](../namespaces/interceptors/types/clientrequestinterceptor.md) | Interceptor for all task client operations. |
|  [processing](./interceptors.md#processing-property) | [Interceptors.ProcessingInterceptor](../namespaces/interceptors/types/processinginterceptor.md) | Interceptor for each time a task is processed via [TaskClient.listen()](../classes/taskclient.md#listen-method)<!-- -->. |
|  [task](./interceptors.md#task-property) | [Interceptors.TaskRequestInterceptor](../namespaces/interceptors/types/taskrequestinterceptor.md) | Interceptor for all individual task operations. |

## Property Details

<a id="client-property"></a>

### client

Interceptor for all task client operations.

<b>Signature:</b>

```typescript
client?: Interceptors.ClientRequestInterceptor;
```

<a id="processing-property"></a>

### processing

Interceptor for each time a task is processed via [TaskClient.listen()](../classes/taskclient.md#listen-method)<!-- -->.

<b>Signature:</b>

```typescript
processing?: Interceptors.ProcessingInterceptor;
```

<a id="task-property"></a>

### task

Interceptor for all individual task operations.

<b>Signature:</b>

```typescript
task?: Interceptors.TaskRequestInterceptor;
```
