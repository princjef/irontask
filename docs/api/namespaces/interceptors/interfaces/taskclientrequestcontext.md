[Home](../../../index.md) &gt; [Interceptors](../../interceptors.md) &gt; [TaskClientRequestContext](./taskclientrequestcontext.md)

# Interface Interceptors.TaskClientRequestContext

Context provided to the client interceptor for each request.

<b>Signature:</b>

```typescript
interface TaskClientRequestContext 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [client](./taskclientrequestcontext.md#client-property) | [TaskClient](../../../classes/taskclient.md) | Client against which the request is being made |
|  [operation](./taskclientrequestcontext.md#operation-property) | [TaskClientOperation](../enums/taskclientoperation.md) | The operation that is being performed |
|  [ref](./taskclientrequestcontext.md#ref-property) | `string` | Reference to the database entity that the operation is running against. This will typically either be the url of a single Cosmos DB document or the url of the container/collection. |
|  [ruConsumption](./taskclientrequestcontext.md#ruConsumption-property) | `number` | The Cosmos DB Request Units consumed by the operation (if any) |
|  [type](./taskclientrequestcontext.md#type-property) | `string` | The type of task(s) that the request is scoped to (if any) |

## Property Details

<a id="client-property"></a>

### client

Client against which the request is being made

<b>Signature:</b>

```typescript
client: TaskClient;
```

<a id="operation-property"></a>

### operation

The operation that is being performed

<b>Signature:</b>

```typescript
operation: TaskClientOperation;
```

<a id="ref-property"></a>

### ref

Reference to the database entity that the operation is running against. This will typically either be the url of a single Cosmos DB document or the url of the container/collection.

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

<a id="type-property"></a>

### type

The type of task(s) that the request is scoped to (if any)

<b>Signature:</b>

```typescript
type?: string;
```
