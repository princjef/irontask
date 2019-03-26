[Home](../../../index.md) &gt; [Interceptors](../../interceptors.md) &gt; [ProcessingContext](./processingcontext.md)

# Interface Interceptors.ProcessingContext

Context provided to the processing interceptor for each request.

<b>Signature:</b>

```typescript
interface ProcessingContext 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [delayMs](./processingcontext.md#delayMs-property) | `number` | The delay that was provided before the next attempt of the job. Will pass either the computed delay based on calling [ActiveTask.retry()](../../../interfaces/activetask.md#retry-method) or the provided delays for [ActiveTask.complete()](../../../interfaces/activetask.md#complete-method) of [ActiveTask.defer()](../../../interfaces/activetask.md#defer-method)<!-- -->. |
|  [error](./processingcontext.md#error-property) | `any` | The error that was thrown or provided to finishing functions such as [ActiveTask.retry()](../../../interfaces/activetask.md#retry-method) or [ActiveTask.fail()](../../../interfaces/activetask.md#fail-method)<!-- -->. |
|  [listener](./processingcontext.md#listener-property) | `Listener<any>` | Listener that received the task for processing |
|  [ref](./processingcontext.md#ref-property) | `string` | Reference to the database entity that the operation is running against. This will typically either be the url of a single Cosmos DB document. |
|  [task](./processingcontext.md#task-property) | `ActiveTask<any>` | The task that was received for processing |

## Property Details

<a id="delayMs-property"></a>

### delayMs

The delay that was provided before the next attempt of the job. Will pass either the computed delay based on calling [ActiveTask.retry()](../../../interfaces/activetask.md#retry-method) or the provided delays for [ActiveTask.complete()](../../../interfaces/activetask.md#complete-method) of [ActiveTask.defer()](../../../interfaces/activetask.md#defer-method)<!-- -->.

<b>Signature:</b>

```typescript
delayMs?: number;
```

<a id="error-property"></a>

### error

The error that was thrown or provided to finishing functions such as [ActiveTask.retry()](../../../interfaces/activetask.md#retry-method) or [ActiveTask.fail()](../../../interfaces/activetask.md#fail-method)<!-- -->.

<b>Signature:</b>

```typescript
error?: any;
```

<a id="listener-property"></a>

### listener

Listener that received the task for processing

<b>Signature:</b>

```typescript
listener: Listener<any>;
```

<a id="ref-property"></a>

### ref

Reference to the database entity that the operation is running against. This will typically either be the url of a single Cosmos DB document.

<b>Signature:</b>

```typescript
ref: string;
```

<a id="task-property"></a>

### task

The task that was received for processing

<b>Signature:</b>

```typescript
task: ActiveTask<any>;
```
