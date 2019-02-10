[Home](../../../index.md) &gt; [Interceptors](../../interceptors.md) &gt; [TaskRequestContext](./taskrequestcontext.md)

# Interface Interceptors.TaskRequestContext

<b>Signature:</b>

```typescript
interface TaskRequestContext 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [operation](./taskrequestcontext.md#operation-property) | [TaskOperation](../enums/taskoperation.md) |  |
|  [ref](./taskrequestcontext.md#ref-property) | `string` |  |
|  [ruConsumption](./taskrequestcontext.md#ruConsumption-property) | `number` |  |
|  [task](./taskrequestcontext.md#task-property) | `Task<any> \| ActiveTask<any> \| ReadonlyTask<any>` |  |

## Property Details

<a id="operation-property"></a>

### operation

<b>Signature:</b>

```typescript
operation: TaskOperation;
```

<a id="ref-property"></a>

### ref

<b>Signature:</b>

```typescript
ref: string;
```

<a id="ruConsumption-property"></a>

### ruConsumption

<b>Signature:</b>

```typescript
ruConsumption?: number;
```

<a id="task-property"></a>

### task

<b>Signature:</b>

```typescript
task: Task<any> | ActiveTask<any> | ReadonlyTask<any>;
```
