[Home](../index.md) &gt; [ScopedClient](./scopedclient.md)

# Class ScopedClient

Version of [TaskClient](./taskclient.md) that has all of its operations automatically scoped to a single task type.

<b>Signature:</b>

```typescript
class ScopedTaskClient 
```

## Methods

|  Method | Description |
|  --- | --- |
|  [count(filter)](./scopedclient.md#count-method) | Compute the number of tasks of the given type that currently exist, optionally filtered to a custom group of tasks within the type. |
|  [create(payload, options)](./scopedclient.md#create-method) | Creates a task and saves it to the database. |
|  [delete(filter)](./scopedclient.md#delete-method) | Deletes tasks of the scoped type, optionally filtered to a custom group of tasks within the type. |
|  [deleteOne(id)](./scopedclient.md#deleteOne-method) | Delete the task from the database. The operation is idempotent and will succeed even if the task has already been deleted. |
|  [disable(filter)](./scopedclient.md#disable-method) | Disables tasks of the scoped type, optionally filtered to a custom group of tasks within the type. |
|  [enable(filter)](./scopedclient.md#enable-method) | Enables tasks of the scoped type, optionally filtered to a custom group of tasks within the type. |
|  [get(id)](./scopedclient.md#get-method) | Retrieves the task of the given type with the provided id, if one exists. If the task is not found, undefined is returned. |
|  [iterate(options)](./scopedclient.md#iterate-method) | Returns an async iterator for iterating over all tasks of the given type, optionally filtered/sorted using the provided options object. |
|  [iterateSummary(options)](./scopedclient.md#iterateSummary-method) | Returns an async iterator for iterating over all tasks of the given type with the entire payload omitted by default. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory. |
|  [list(options)](./scopedclient.md#list-method) | Retrieves all tasks of the given type, paged using the provided list options. |
|  [listen(handler, options)](./scopedclient.md#listen-method) | Start listening for tasks of the scoped type. |
|  [listSummary(options)](./scopedclient.md#listSummary-method) | Retrieves a all tasks of the given type with the entire payload omitted by default. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory. |

## Method Details

<a id="count-method"></a>

### count(filter)

Compute the number of tasks of the given type that currently exist, optionally filtered to a custom group of tasks within the type.

<b>Signature:</b>

```typescript
count(filter?: QueryType.Bool): Promise<number>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  filter | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Query filter specifying which tasks within the provided type to include |

<b>Returns:</b>

`Promise<number>`

<a id="create-method"></a>

### create(payload, options)

Creates a task and saves it to the database.

<b>Signature:</b>

```typescript
create<T>(payload: T, options?: CreateTaskOptions): Promise<Task<T>>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  payload | `T` | Payload containing the data for the task |
|  options | [CreateTaskOptions](../interfaces/createtaskoptions.md) | Options to configure the newly created task |

<b>Returns:</b>

`Promise<Task<T>>`

<a id="delete-method"></a>

### delete(filter)

Deletes tasks of the scoped type, optionally filtered to a custom group of tasks within the type.

<b>Signature:</b>

```typescript
delete(filter?: QueryType.Bool): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  filter | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Query filter specifying which tasks within the scoped type to delete |

<b>Returns:</b>

`Promise<void>`

<a id="deleteOne-method"></a>

### deleteOne(id)

Delete the task from the database. The operation is idempotent and will succeed even if the task has already been deleted.

<b>Signature:</b>

```typescript
deleteOne(id: string): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  id | `string` | The task's id |

<b>Returns:</b>

`Promise<void>`

<a id="disable-method"></a>

### disable(filter)

Disables tasks of the scoped type, optionally filtered to a custom group of tasks within the type.

<b>Signature:</b>

```typescript
disable(filter?: QueryType.Bool): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  filter | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Query filter specifying which tasks within the scoped type to disable |

<b>Returns:</b>

`Promise<void>`

<a id="enable-method"></a>

### enable(filter)

Enables tasks of the scoped type, optionally filtered to a custom group of tasks within the type.

<b>Signature:</b>

```typescript
enable(filter?: QueryType.Bool): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  filter | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Query filter specifying which tasks within the scoped type to enable |

<b>Returns:</b>

`Promise<void>`

<a id="get-method"></a>

### get(id)

Retrieves the task of the given type with the provided id, if one exists. If the task is not found, undefined is returned.

<b>Signature:</b>

```typescript
get<T>(id: string): Promise<Task<T> | undefined>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  id | `string` | The task's id |

<b>Returns:</b>

`Promise<Task<T> | undefined>`

<a id="iterate-method"></a>

### iterate(options)

Returns an async iterator for iterating over all tasks of the given type, optionally filtered/sorted using the provided options object.

\_NOTE: Asynchronous iterators are a new feature of Javascript and are only available without a polyfill starting in Node.js 10. You can make use of async iterators in prior versions of Node.js by using TypeScript or Babel to downcompile the code for you: https://node.green/\#ES2018-features-Asynchronous-Iterators\_

<b>Signature:</b>

```typescript
iterate<T>(options?: IterateOptions): AsyncIterable<Task<T>>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  options | [IterateOptions](../interfaces/iterateoptions.md) | Options controlling which tasks to retrieve and the order in which to receive them |

<b>Returns:</b>

`AsyncIterable<Task<T>>`

<a id="iterateSummary-method"></a>

### iterateSummary(options)

Returns an async iterator for iterating over all tasks of the given type with the entire payload omitted by default. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory.

Results are filtered and sorted using the provided options. You may also specify certain properties of the payload you want to see in the returned task through the options.

\_NOTE: Asynchronous iterators are a new feature of Javascript and are only available without a polyfill starting in Node.js 10. You can make use of async iterators in prior versions of Node.js by using TypeScript or Babel to downcompile the code for you: https://node.green/\#ES2018-features-Asynchronous-Iterators\_

<b>Signature:</b>

```typescript
iterateSummary<T>(options?: IterateSummaryOptions): AsyncIterable<ReadonlyTask<T>>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  options | [IterateSummaryOptions](../interfaces/iteratesummaryoptions.md) | Options controlling which tasks to retrieve and the order in which to receive them |

<b>Returns:</b>

`AsyncIterable<ReadonlyTask<T>>`

<a id="list-method"></a>

### list(options)

Retrieves all tasks of the given type, paged using the provided list options.

<b>Signature:</b>

```typescript
list<T>(options?: ListOptions): Promise<Task<T>[]>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  options | [ListOptions](../interfaces/listoptions.md) | Options controlling which tasks to retrieve |

<b>Returns:</b>

`Promise<Task<T>[]>`

<a id="listen-method"></a>

### listen(handler, options)

Start listening for tasks of the scoped type.

<b>Signature:</b>

```typescript
listen<T>(handler: TaskHandler<T>, options?: ListenOptions): Listener<T>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  handler | `TaskHandler<T>` | Function to call with each task received for processing. May be synchronous or asynchronous |
|  options | [ListenOptions](../interfaces/listenoptions.md) | Options for configuring the listener |

<b>Returns:</b>

`Listener<T>`

<a id="listSummary-method"></a>

### listSummary(options)

Retrieves a all tasks of the given type with the entire payload omitted by default. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory.

Results are paged, filtered and sorted using the provided options. You may also specify certain properties of the payload you want to see in the returned task through the options.

<b>Signature:</b>

```typescript
listSummary<T>(options?: ListSummaryOptions): Promise<ReadonlyTask<T>[]>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  options | [ListSummaryOptions](../interfaces/listsummaryoptions.md) | Options controlling which tasks to retrieve |

<b>Returns:</b>

`Promise<ReadonlyTask<T>[]>`

