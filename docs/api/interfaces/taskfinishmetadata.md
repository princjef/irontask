[Home](../index.md) &gt; [TaskFinishMetadata](./taskfinishmetadata.md)

# Interface TaskFinishMetadata

Information about the result of processing an [ActiveTask](./activetask.md) and any metadata provided as part of finishing.

<b>Signature:</b>

```typescript
interface TaskFinishMetadata 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [delayMs](./taskfinishmetadata.md#delayMs-property) | `number` | The amount of time to wait before redelivery of the task. This may be provided by the user, as in the case of [ActiveTask.complete()](./activetask.md#complete-method) or [ActiveTask.defer()](./activetask.md#defer-method) or may be automatically computed from existing retry options, as in [ActiveTask.retry()](./activetask.md#retry-method)<!-- -->. |
|  [error](./taskfinishmetadata.md#error-property) | `any` | The error that precipitated the finish, if any. This is provided by the user for finishes such as [ActiveTask.fail()](./activetask.md#fail-method) and [ActiveTask.retry()](./activetask.md#retry-method)<!-- -->. |
|  [result](./taskfinishmetadata.md#result-property) | [ProcessingResult](../enums/processingresult.md) | The type of finish that occurred for processing the task. Each possible result represents either one of the finishing functions in [ActiveTask](./activetask.md) or a background issue such as a lock being lost. |

## Property Details

<a id="delayMs-property"></a>

### delayMs

The amount of time to wait before redelivery of the task. This may be provided by the user, as in the case of [ActiveTask.complete()](./activetask.md#complete-method) or [ActiveTask.defer()](./activetask.md#defer-method) or may be automatically computed from existing retry options, as in [ActiveTask.retry()](./activetask.md#retry-method)<!-- -->.

<b>Signature:</b>

```typescript
delayMs?: number;
```

<a id="error-property"></a>

### error

The error that precipitated the finish, if any. This is provided by the user for finishes such as [ActiveTask.fail()](./activetask.md#fail-method) and [ActiveTask.retry()](./activetask.md#retry-method)<!-- -->.

<b>Signature:</b>

```typescript
error?: any;
```

<a id="result-property"></a>

### result

The type of finish that occurred for processing the task. Each possible result represents either one of the finishing functions in [ActiveTask](./activetask.md) or a background issue such as a lock being lost.

<b>Signature:</b>

```typescript
result: ProcessingResult;
```
