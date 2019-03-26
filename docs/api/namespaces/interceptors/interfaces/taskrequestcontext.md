[Home](../../../index.md) &gt; [Interceptors](../../interceptors.md) &gt; [TaskRequestContext](./taskrequestcontext.md)

# Interface Interceptors.TaskRequestContext

Context provided to the task interceptor for each request.

<b>Signature:</b>

```typescript
interface TaskRequestContext 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [operation](./taskrequestcontext.md#operation-property) | [TaskOperation](../enums/taskoperation.md) | The operation that is being performed |
|  [ref](./taskrequestcontext.md#ref-property) | `string` | Reference to the database entity that the operation is running against. This will typically either be the url of a single Cosmos DB document. |
|  [ruConsumption](./taskrequestcontext.md#ruConsumption-property) | `number` | The Cosmos DB Request Units consumed by the operation (if any) |
|  [task](./taskrequestcontext.md#task-property) | `Task<any> \| ActiveTask<any> \| ReadonlyTask<any>` | Task against which the request is being made |

## Property Details

<a id="operation-property"></a>

### operation

The operation that is being performed

<b>Signature:</b>

```typescript
operation: TaskOperation;
```

<a id="ref-property"></a>

### ref

Reference to the database entity that the operation is running against. This will typically either be the url of a single Cosmos DB document.

<b>Signature:</b>

```typescript
ref: string;
```

<a id="ruConsumption-property"></a>

### ruConsumption

The Cosmos DB Request Units consumed by the operation (if any)

<b>Signature:</b>

```typescript
ruConsumption?: number;
```

<a id="task-property"></a>

### task

Task against which the request is being made

<b>Signature:</b>

```typescript
task: Task<any> | ActiveTask<any> | ReadonlyTask<any>;
```
