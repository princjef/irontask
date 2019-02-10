[Home](../index.md) &gt; [Listener](./listener.md)

# Interface Listener

Listener for processing tasks of a single type. It is generally created by calling [TaskClient.listen()](../classes/taskclient.md#listen-method)<!-- -->.

<b>Signature:</b>

```typescript
interface Listener<T> extends EventEmitter 
```

## Implements Interfaces

- <b>Listener</b>
    - EventEmitter

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [activeTaskCount](./listener.md#activeTaskCount-property) | `number` | Number indicating the total count of active tasks being processed by the listener. Useful if you want to check processor load or if the processor is idling. |
|  [running](./listener.md#running-property) | `boolean` | Boolean indicating whether the listener is actively running or not. |

## Methods

|  Method | Description |
|  --- | --- |
|  [destroy()](./listener.md#destroy-method) | Stop processing tasks from the listener AND terminate processing of any tasks that are currently in-flight by releasing them. Returns a promise which resolves once all tasks have been released. Unlike [Listener.start()](./listener.md#start-method) and [Listener.stop()](./listener.md#stop-method)<!-- -->, this is \_not\_ idempotent. Calls to destroy an already destroyed client will result in an error to avoid race conditions during shutdown. |
|  [on(event: 'polled', listener)](./listener.md#on-method) |  |
|  [on(event: 'pollingStuck', listener)](./listener.md#on-method-1) |  |
|  [on(event: 'finishedTask', listener)](./listener.md#on-method-2) |  |
|  [start()](./listener.md#start-method) | Start processing tasks from the listener. Useful if you want to pause and resume the task processing using some custom logic. Does nothing if the subsciprtion is already running. |
|  [stop()](./listener.md#stop-method) | Stop the listener from processing new tasks, but allow any currently running tasks to complete if desired. Does nothing if the subscription is already stopped. |

## Property Details

<a id="activeTaskCount-property"></a>

### activeTaskCount

Number indicating the total count of active tasks being processed by the listener. Useful if you want to check processor load or if the processor is idling.

<b>Signature:</b>

```typescript
readonly activeTaskCount: number;
```

<a id="running-property"></a>

### running

Boolean indicating whether the listener is actively running or not.

<b>Signature:</b>

```typescript
readonly running: boolean;
```

## Method Details

<a id="destroy-method"></a>

### destroy()

Stop processing tasks from the listener AND terminate processing of any tasks that are currently in-flight by releasing them. Returns a promise which resolves once all tasks have been released. Unlike [Listener.start()](./listener.md#start-method) and [Listener.stop()](./listener.md#stop-method)<!-- -->, this is \_not\_ idempotent. Calls to destroy an already destroyed client will result in an error to avoid race conditions during shutdown.

<b>Signature:</b>

```typescript
destroy(): Promise<void>;
```
<b>Returns:</b>

`Promise<void>`

<a id="on-method"></a>

### on(event: 'polled', listener)

<b>Signature:</b>

```typescript
on(event: 'polled', listener: () => void): this;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  event | `'polled'` |  |
|  listener | `() => void` |  |

<b>Returns:</b>

`this`

<a id="on-method-1"></a>

### on(event: 'pollingStuck', listener)

<b>Signature:</b>

```typescript
on(event: 'pollingStuck', listener: (err: any) => void): this;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  event | `'pollingStuck'` |  |
|  listener | `(err: any) => void` |  |

<b>Returns:</b>

`this`

<a id="on-method-2"></a>

### on(event: 'finishedTask', listener)

<b>Signature:</b>

```typescript
on(event: 'finishedTask', listener: (task: ActiveTask<T>) => void): this;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  event | `'finishedTask'` |  |
|  listener | `(task: ActiveTask<T>) => void` |  |

<b>Returns:</b>

`this`

<a id="start-method"></a>

### start()

Start processing tasks from the listener. Useful if you want to pause and resume the task processing using some custom logic. Does nothing if the subsciprtion is already running.

<b>Signature:</b>

```typescript
start(): void;
```
<b>Returns:</b>

`void`

<a id="stop-method"></a>

### stop()

Stop the listener from processing new tasks, but allow any currently running tasks to complete if desired. Does nothing if the subscription is already stopped.

<b>Signature:</b>

```typescript
stop(): void;
```
<b>Returns:</b>

`void`

