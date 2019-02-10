[Home](../index.md) &gt; [TaskClientOptions](./taskclientoptions.md)

# Interface TaskClientOptions

Options for configuring the behavior of the [TaskClient](../classes/taskclient.md)<!-- -->.

<b>Signature:</b>

```typescript
interface TaskClientOptions 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [interceptors](./taskclientoptions.md#interceptors-property) | [Interceptors](./interceptors.md) | Optional object that can intercept asynchronous requests and task processing. It takes optional interceptor functions for different types of operations. |
|  [lockDurationMs](./taskclientoptions.md#lockDurationMs-property) | `number` | Default lifetime when locking a task. Setting this to a smaller number reduces wait time if a client crashes before a task is redelivered to a different client, but costs more as the lock must be renewed more frequently. May be overridden for individual task types. |
|  [maxExecutionTimeMs](./taskclientoptions.md#maxExecutionTimeMs-property) | `number` | Default duration to continue to renew the lock while processing a task before considering processing to be hung and releasing the lock. May be overridden for individual task types/tasks. |
|  [maxUpdateParallelism](./taskclientoptions.md#maxUpdateParallelism-property) | `number` | Maximum number of updates to perform at a time when performing bulk updates or deletes. |
|  [pollIntervalMs](./taskclientoptions.md#pollIntervalMs-property) | `number` | Interval to poll at when listening for new tasks. This represents the maximum amount of time between individual attempts to retrieve tasks. The client will only wait to retrieve tasks if it did not find any tasks to run and has the ability to run more tasks than it currently is. |
|  [retries](./taskclientoptions.md#retries-property) | [TimeoutsOptions](./timeoutsoptions.md) | Optional object to configure retries of database operations. This policy only applies to operations that can be safely retried in all cases (such as a service unavailable error or certain networking errors). By default, the operation will be tried up to 5 times with an exponential backoff between tries totaling about 4 seconds of waiting time. To disable retries altogether, pass the [NO\_RETRY](../variables/no_retry.md) constant. |

## Property Details

<a id="interceptors-property"></a>

### interceptors

Optional object that can intercept asynchronous requests and task processing. It takes optional interceptor functions for different types of operations.

<b>Signature:</b>

```typescript
interceptors?: Interceptors;
```

<a id="lockDurationMs-property"></a>

### lockDurationMs

Default lifetime when locking a task. Setting this to a smaller number reduces wait time if a client crashes before a task is redelivered to a different client, but costs more as the lock must be renewed more frequently. May be overridden for individual task types.

<b>Signature:</b>

```typescript
lockDurationMs?: number;
```
<b>Default Value:</b>

30000

<a id="maxExecutionTimeMs-property"></a>

### maxExecutionTimeMs

Default duration to continue to renew the lock while processing a task before considering processing to be hung and releasing the lock. May be overridden for individual task types/tasks.

<b>Signature:</b>

```typescript
maxExecutionTimeMs?: number;
```
<b>Default Value:</b>

1800000 (30 minutes)

<a id="maxUpdateParallelism-property"></a>

### maxUpdateParallelism

Maximum number of updates to perform at a time when performing bulk updates or deletes.

<b>Signature:</b>

```typescript
maxUpdateParallelism?: number;
```
<b>Default Value:</b>

10

<a id="pollIntervalMs-property"></a>

### pollIntervalMs

Interval to poll at when listening for new tasks. This represents the maximum amount of time between individual attempts to retrieve tasks. The client will only wait to retrieve tasks if it did not find any tasks to run and has the ability to run more tasks than it currently is.

<b>Signature:</b>

```typescript
pollIntervalMs?: number;
```
<b>Default Value:</b>

5000

<a id="retries-property"></a>

### retries

Optional object to configure retries of database operations. This policy only applies to operations that can be safely retried in all cases (such as a service unavailable error or certain networking errors). By default, the operation will be tried up to 5 times with an exponential backoff between tries totaling about 4 seconds of waiting time. To disable retries altogether, pass the [NO\_RETRY](../variables/no_retry.md) constant.

<b>Signature:</b>

```typescript
retries?: TimeoutsOptions;
```
