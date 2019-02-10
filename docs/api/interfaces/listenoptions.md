[Home](../index.md) &gt; [ListenOptions](./listenoptions.md)

# Interface ListenOptions

Options configuring the behavior of a listener.

<b>Signature:</b>

```typescript
interface ListenOptions 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [lockDurationMs](./listenoptions.md#lockDurationMs-property) | `number` | Default lifetime when locking a task. Setting this to a smaller number reduces wait time if a client crashes before a task is redelivered to a different client, but costs more as the lock must be renewed more frequently. May be overridden for individual task types. |
|  [maxActiveTasks](./listenoptions.md#maxActiveTasks-property) | `number` | The maximum number of tasks to process at the same time within this listener. |
|  [maxExecutionTimeMs](./listenoptions.md#maxExecutionTimeMs-property) | `number` | Default duration to continue to renew the lock while processing a task before considering processing to be hung and releasing the lock. Overrides the same option on the client and may be overridden by specific tasks. A value of 0 indicates no limit. |
|  [pollIntervalMs](./listenoptions.md#pollIntervalMs-property) | `number` | Interval to poll at when listening for new tasks. This represents the maximum amount of time between individual attempts to retrieve tasks. The client will only wait to retrieve tasks if it did not find any tasks to run and has the ability to run more tasks than it currently is. |
|  [refreshIntervalMs](./listenoptions.md#refreshIntervalMs-property) | `number` | Interval to refresh the task data when checking for changes like whether the task has been disabled. Set to 0 to disable this functionality. |
|  [retries](./listenoptions.md#retries-property) | [TimeoutsOptions](./timeoutsoptions.md) | Optional configuration that allows the task to be retried with an exponential backoff. Configuration options are those from the `retry` library. |

## Property Details

<a id="lockDurationMs-property"></a>

### lockDurationMs

Default lifetime when locking a task. Setting this to a smaller number reduces wait time if a client crashes before a task is redelivered to a different client, but costs more as the lock must be renewed more frequently. May be overridden for individual task types.

<b>Signature:</b>

```typescript
lockDurationMs?: number;
```

<a id="maxActiveTasks-property"></a>

### maxActiveTasks

The maximum number of tasks to process at the same time within this listener.

<b>Signature:</b>

```typescript
maxActiveTasks?: number;
```
<b>Default Value:</b>

100

<a id="maxExecutionTimeMs-property"></a>

### maxExecutionTimeMs

Default duration to continue to renew the lock while processing a task before considering processing to be hung and releasing the lock. Overrides the same option on the client and may be overridden by specific tasks. A value of 0 indicates no limit.

<b>Signature:</b>

```typescript
maxExecutionTimeMs?: number;
```

<a id="pollIntervalMs-property"></a>

### pollIntervalMs

Interval to poll at when listening for new tasks. This represents the maximum amount of time between individual attempts to retrieve tasks. The client will only wait to retrieve tasks if it did not find any tasks to run and has the ability to run more tasks than it currently is.

<b>Signature:</b>

```typescript
pollIntervalMs?: number;
```

<a id="refreshIntervalMs-property"></a>

### refreshIntervalMs

Interval to refresh the task data when checking for changes like whether the task has been disabled. Set to 0 to disable this functionality.

<b>Signature:</b>

```typescript
refreshIntervalMs?: number;
```
<b>Default Value:</b>

5000

<a id="retries-property"></a>

### retries

Optional configuration that allows the task to be retried with an exponential backoff. Configuration options are those from the `retry` library.

<b>Signature:</b>

```typescript
retries?: TimeoutsOptions;
```
