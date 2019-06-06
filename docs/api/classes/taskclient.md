[Home](../index.md) &gt; [TaskClient](./taskclient.md)

# Class TaskClient

The primary client for creating, updating, querying and processing tasks. It wraps an Azure Cosmos DB collection, which is used to store the tasks. It's recommended that you create one using the TaskClient.create method instead of using the constructor. This will set up the database, collection and necessary stored procedures for you.

The constructor for this class is marked as internal. Third-party code should not call the constructor directly or create subclasses that extend the `TaskClient` class.

<b>Signature:</b>

```typescript
class TaskClient 
```

## Static Methods

|  Method | Description |
|  --- | --- |
|  [create(account, database, collection, key, options)](./taskclient.md#create-method-static) | Initializes a task client using the provided account information, creating the specified database and collection if necessary. |

## Methods

|  Method | Description |
|  --- | --- |
|  [count(type, filter)](./taskclient.md#count-method) | Compute the number of tasks of the given type that currently exist, optionally filtered to a custom group of tasks within the type. |
|  [countAll(filter)](./taskclient.md#countAll-method) | Compute the number of tasks across all types that currently exist, optionally filtered to a custom group of tasks. |
|  [create(type, payload, options)](./taskclient.md#create-method) | Creates a task and saves it to the database. |
|  [delete(type, filter)](./taskclient.md#delete-method) | Deletes tasks of the provided type, optionally filtered to a custom group of tasks within the type. |
|  [deleteAll(filter)](./taskclient.md#deleteAll-method) | Deletes tasks across all types, optionally filtered to a custom group of tasks. |
|  [deleteOne(type, id)](./taskclient.md#deleteOne-method) | Delete the task from the database. The operation is idempotent and will succeed even if the task has already been deleted. |
|  [disable(type, filter)](./taskclient.md#disable-method) | Disables tasks of the provided type, optionally filtered to a custom group of tasks within the type. |
|  [disableAll(filter)](./taskclient.md#disableAll-method) | Disables tasks across all types, optionally filtered to a custom group of tasks. |
|  [enable(type, filter)](./taskclient.md#enable-method) | Enables tasks of the provided type, optionally filtered to a custom group of tasks within the type. |
|  [enableAll(filter)](./taskclient.md#enableAll-method) | Enables tasks across all types, optionally filtered to a custom group of tasks. |
|  [get(type, id)](./taskclient.md#get-method) | Retrieves the task of the given type with the provided id, if one exists. If the task is not found, undefined is returned. |
|  [iterate(type, options)](./taskclient.md#iterate-method) | Returns an async iterator for iterating over all tasks of the given type, optionally filtered/sorted using the provided options object. |
|  [iterateAll(options)](./taskclient.md#iterateAll-method) | Returns an async iterator for iterating over all tasks across all types, optionally filtered/sorted using the provided options object. |
|  [iterateAllSummary(options)](./taskclient.md#iterateAllSummary-method) | Returns an async iterator for iterating over all tasks across all types with the entire payload omitted by default. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory. |
|  [iterateSummary(type, options)](./taskclient.md#iterateSummary-method) | Returns an async iterator for iterating over all tasks of the given type with the entire payload omitted by default. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory. |
|  [list(type, options)](./taskclient.md#list-method) | Retrieves all tasks of the given type, paged using the provided list options. |
|  [listAll(options)](./taskclient.md#listAll-method) | Retrieves all tasks across all types of tasks, paged using the provided list options. |
|  [listAllSummary(options)](./taskclient.md#listAllSummary-method) | Retrieves all tasks across all types with the entire payload omitted by default. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory. |
|  [listen(type, handler, options)](./taskclient.md#listen-method) | Start listening for tasks of the provided type. |
|  [listPaged(type, options)](./taskclient.md#listPaged-method) | Retrieves a single page from the database for tasks of the given type, optionally starting from the provided continuation token. |
|  [listSummary(type, options)](./taskclient.md#listSummary-method) | Retrieves all tasks of the given type with the entire payload omitted by default. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory. |
|  [listSummaryPaged(type, options)](./taskclient.md#listSummaryPaged-method) | Retrieves a single page of tasks of the given type with the entire payload omitted by default, optionally starting from the provided continuation token. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory. |
|  [registerSprocs()](./taskclient.md#registerSprocs-method) | Ensures that the proper stored procedures are registered with Cosmos DB for the client to function. You should never have to call this directly. |
|  [type(type)](./taskclient.md#type-method) | Returns a client with all operations automatically scoped to the provided task type. This is useful if you have an area where you need to perform many related operations for a single task type and don't want to have to specify it each time. |

## Static Method Details

<a id="create-method-static"></a>

### create(account, database, collection, key, options)

Initializes a task client using the provided account information, creating the specified database and collection if necessary.

<b>Signature:</b>

```typescript
static create(account: string, database: string, collection: string, key: string, options?: TaskClientOptions): Promise<TaskClient>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  account | `string` | Azure Cosmos DB account url |
|  database | `string` | Azure Cosmos DB database name |
|  collection | `string` | Azure Cosmos DB collection/container name |
|  key | `string` | Azure Cosmos DB account key |
|  options | [TaskClientOptions](../interfaces/taskclientoptions.md) | Client creation options |

<b>Returns:</b>

`Promise<TaskClient>`

Promise containing the initialized client

## Method Details

<a id="count-method"></a>

### count(type, filter)

Compute the number of tasks of the given type that currently exist, optionally filtered to a custom group of tasks within the type.

<b>Signature:</b>

```typescript
count(type: string, filter?: QueryType.Bool): Promise<number>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  filter | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Query filter specifying which tasks within the provided type to include |

<b>Returns:</b>

`Promise<number>`

<a id="countAll-method"></a>

### countAll(filter)

Compute the number of tasks across all types that currently exist, optionally filtered to a custom group of tasks.

Performing operations across multiple types results in cross partition queries to Cosmos DB. This can cause a significant performance impact, especially when paging and/or sorting results. Use this API with care.

<b>Signature:</b>

```typescript
countAll(filter?: QueryType.Bool): Promise<number>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  filter | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Query filter specifying which tasks to include |

<b>Returns:</b>

`Promise<number>`

<a id="create-method"></a>

### create(type, payload, options)

Creates a task and saves it to the database.

<b>Signature:</b>

```typescript
create<T>(type: string, payload: T, options?: CreateTaskOptions): Promise<Task<T>>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  payload | `T` | Payload containing the data for the task |
|  options | [CreateTaskOptions](../interfaces/createtaskoptions.md) | Options to configure the newly created task |

<b>Returns:</b>

`Promise<Task<T>>`

<a id="delete-method"></a>

### delete(type, filter)

Deletes tasks of the provided type, optionally filtered to a custom group of tasks within the type.

<b>Signature:</b>

```typescript
delete(type: string, filter?: QueryType.Bool): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  filter | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Query filter specifying which tasks within the provided type to delete |

<b>Returns:</b>

`Promise<void>`

<a id="deleteAll-method"></a>

### deleteAll(filter)

Deletes tasks across all types, optionally filtered to a custom group of tasks.

<b>Signature:</b>

```typescript
deleteAll(filter?: QueryType.Bool): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  filter | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Query filter specifying which tasks to delete |

<b>Returns:</b>

`Promise<void>`

<a id="deleteOne-method"></a>

### deleteOne(type, id)

Delete the task from the database. The operation is idempotent and will succeed even if the task has already been deleted.

<b>Signature:</b>

```typescript
deleteOne(type: string, id: string): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  id | `string` | The task's id |

<b>Returns:</b>

`Promise<void>`

<a id="disable-method"></a>

### disable(type, filter)

Disables tasks of the provided type, optionally filtered to a custom group of tasks within the type.

<b>Signature:</b>

```typescript
disable(type: string, filter?: QueryType.Bool): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  filter | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Query filter specifying which tasks within the provided type to disable |

<b>Returns:</b>

`Promise<void>`

<a id="disableAll-method"></a>

### disableAll(filter)

Disables tasks across all types, optionally filtered to a custom group of tasks.

Performing operations across multiple types results in cross partition queries to Cosmos DB. This can cause a significant performance impact, especially when paging and/or sorting results. Use this API with care.

<b>Signature:</b>

```typescript
disableAll(filter?: QueryType.Bool): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  filter | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Query filter specifying which tasks to disable |

<b>Returns:</b>

`Promise<void>`

<a id="enable-method"></a>

### enable(type, filter)

Enables tasks of the provided type, optionally filtered to a custom group of tasks within the type.

<b>Signature:</b>

```typescript
enable(type: string, filter?: QueryType.Bool): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  filter | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Query filter specifying which tasks within the provided type to enable |

<b>Returns:</b>

`Promise<void>`

<a id="enableAll-method"></a>

### enableAll(filter)

Enables tasks across all types, optionally filtered to a custom group of tasks.

Performing operations across multiple types results in cross partition queries to Cosmos DB. This can cause a significant performance impact, especially when paging and/or sorting results. Use this API with care.

<b>Signature:</b>

```typescript
enableAll(filter?: QueryType.Bool): Promise<void>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  filter | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Query filter specifying which tasks to enable |

<b>Returns:</b>

`Promise<void>`

<a id="get-method"></a>

### get(type, id)

Retrieves the task of the given type with the provided id, if one exists. If the task is not found, undefined is returned.

<b>Signature:</b>

```typescript
get<T>(type: string, id: string): Promise<Task<T> | undefined>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  id | `string` | The task's id |

<b>Returns:</b>

`Promise<Task<T> | undefined>`

<a id="iterate-method"></a>

### iterate(type, options)

Returns an async iterator for iterating over all tasks of the given type, optionally filtered/sorted using the provided options object.

\_NOTE: Asynchronous iterators are a new feature of Javascript and are only available without a polyfill starting in Node.js 10. You can make use of async iterators in prior versions of Node.js by using TypeScript or Babel to downcompile the code for you: https://node.green/\#ES2018-features-Asynchronous-Iterators\_

<b>Signature:</b>

```typescript
iterate<T>(type: string, options?: IterateOptions): AsyncIterable<Task<T>>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  options | [IterateOptions](../interfaces/iterateoptions.md) | Options controlling which tasks to retrieve and the order in which to receive them |

<b>Returns:</b>

`AsyncIterable<Task<T>>`

<a id="iterateAll-method"></a>

### iterateAll(options)

Returns an async iterator for iterating over all tasks across all types, optionally filtered/sorted using the provided options object.

Performing operations across multiple types results in cross partition queries to Cosmos DB. This can cause a significant performance impact, especially when paging and/or sorting results. Use this API with care.

\_NOTE: Asynchronous iterators are a new feature of Javascript and are only available without a polyfill starting in Node.js 10. You can make use of async iterators in prior versions of Node.js by using TypeScript or Babel to downcompile the code for you: https://node.green/\#ES2018-features-Asynchronous-Iterators\_

<b>Signature:</b>

```typescript
iterateAll<T>(options?: IterateOptions): AsyncIterable<Task<T>>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  options | [IterateOptions](../interfaces/iterateoptions.md) | Options controlling which tasks to retrieve and the order in which to receive them |

<b>Returns:</b>

`AsyncIterable<Task<T>>`

<a id="iterateAllSummary-method"></a>

### iterateAllSummary(options)

Returns an async iterator for iterating over all tasks across all types with the entire payload omitted by default. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory.

Results are filtered and sorted using the provided options. You may also specify certain properties of the payload you want to see in the returned task through the options.

Performing operations across multiple types results in cross partition queries to Cosmos DB. This can cause a significant performance impact, especially when paging and/or sorting results. Use this API with care.

\_NOTE: Asynchronous iterators are a new feature of Javascript and are only available without a polyfill starting in Node.js 10. You can make use of async iterators in prior versions of Node.js by using TypeScript or Babel to downcompile the code for you: https://node.green/\#ES2018-features-Asynchronous-Iterators\_

<b>Signature:</b>

```typescript
iterateAllSummary<T>(options?: IterateSummaryOptions): AsyncIterable<ReadonlyTask<T>>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  options | [IterateSummaryOptions](../interfaces/iteratesummaryoptions.md) | Options controlling which tasks to retrieve and the order in which to receive them |

<b>Returns:</b>

`AsyncIterable<ReadonlyTask<T>>`

<a id="iterateSummary-method"></a>

### iterateSummary(type, options)

Returns an async iterator for iterating over all tasks of the given type with the entire payload omitted by default. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory.

Results are filtered and sorted using the provided options. You may also specify certain properties of the payload you want to see in the returned task through the options.

\_NOTE: Asynchronous iterators are a new feature of Javascript and are only available without a polyfill starting in Node.js 10. You can make use of async iterators in prior versions of Node.js by using TypeScript or Babel to downcompile the code for you: https://node.green/\#ES2018-features-Asynchronous-Iterators\_

<b>Signature:</b>

```typescript
iterateSummary<T>(type: string, options?: IterateSummaryOptions): AsyncIterable<ReadonlyTask<T>>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  options | [IterateSummaryOptions](../interfaces/iteratesummaryoptions.md) | Options controlling which tasks to retrieve and the order in which to receive them |

<b>Returns:</b>

`AsyncIterable<ReadonlyTask<T>>`

<a id="list-method"></a>

### list(type, options)

Retrieves all tasks of the given type, paged using the provided list options.

<b>Signature:</b>

```typescript
list<T>(type: string, options?: ListOptions): Promise<Task<T>[]>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  options | [ListOptions](../interfaces/listoptions.md) | Options controlling which tasks to retrieve |

<b>Returns:</b>

`Promise<Task<T>[]>`

<a id="listAll-method"></a>

### listAll(options)

Retrieves all tasks across all types of tasks, paged using the provided list options.

Performing operations across multiple types results in cross partition queries to Cosmos DB. This can cause a significant performance impact, especially when paging and/or sorting results. Use this API with care.

<b>Signature:</b>

```typescript
listAll<T>(options?: ListOptions): Promise<Task<T>[]>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  options | [ListOptions](../interfaces/listoptions.md) | Options controlling which tasks to retrieve |

<b>Returns:</b>

`Promise<Task<T>[]>`

<a id="listAllSummary-method"></a>

### listAllSummary(options)

Retrieves all tasks across all types with the entire payload omitted by default. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory.

Results are paged, filtered and sorted using the provided options. You may also specify certain properties of the payload you want to see in the returned task through the options.

Performing operations across multiple types results in cross partition queries to Cosmos DB. This can cause a significant performance impact, especially when paging and/or sorting results. Use this API with care.

<b>Signature:</b>

```typescript
listAllSummary<T>(options?: ListSummaryOptions): Promise<ReadonlyTask<T>[]>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  options | [ListSummaryOptions](../interfaces/listsummaryoptions.md) | Options controlling which tasks to retrieve |

<b>Returns:</b>

`Promise<ReadonlyTask<T>[]>`

<a id="listen-method"></a>

### listen(type, handler, options)

Start listening for tasks of the provided type.

<b>Signature:</b>

```typescript
listen<T>(type: string, handler: TaskHandler<T>, options?: ListenOptions): Listener<T>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  handler | `TaskHandler<T>` | Function to call with each task received for processing. May be synchronous or asynchronous |
|  options | [ListenOptions](../interfaces/listenoptions.md) | Options for configuring the listener |

<b>Returns:</b>

`Listener<T>`

<a id="listPaged-method"></a>

### listPaged(type, options)

Retrieves a single page from the database for tasks of the given type, optionally starting from the provided continuation token.

<b>Signature:</b>

```typescript
listPaged<T>(type: string, options?: ListPageOptions): Promise<ArrayWithContinuation<Task<T>>>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  options | [ListPageOptions](../interfaces/listpageoptions.md) | Options controlling which tasks to retrieve |

<b>Returns:</b>

`Promise<ArrayWithContinuation<Task<T>>>`

<a id="listSummary-method"></a>

### listSummary(type, options)

Retrieves all tasks of the given type with the entire payload omitted by default. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory.

Results are paged, filtered and sorted using the provided options. You may also specify certain properties of the payload you want to see in the returned task through the options.

<b>Signature:</b>

```typescript
listSummary<T>(type: string, options?: ListSummaryOptions): Promise<ReadonlyTask<T>[]>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  options | [ListSummaryOptions](../interfaces/listsummaryoptions.md) | Options controlling which tasks to retrieve |

<b>Returns:</b>

`Promise<ReadonlyTask<T>[]>`

<a id="listSummaryPaged-method"></a>

### listSummaryPaged(type, options)

Retrieves a single page of tasks of the given type with the entire payload omitted by default, optionally starting from the provided continuation token. This is primarily useful if you have tasks with a large amount of data in the payload that you don't need to see in the listed results and you want to save cost/memory.

Results are paged, filtered and sorted using the provided options. You may also specify certain properties of the payload you want to see in the returned task through the options.

<b>Signature:</b>

```typescript
listSummaryPaged<T>(type: string, options?: ListSummaryPageOptions): Promise<ArrayWithContinuation<ReadonlyTask<T>>>;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type |
|  options | [ListSummaryPageOptions](../interfaces/listsummarypageoptions.md) | Options controlling which tasks to retrieve |

<b>Returns:</b>

`Promise<ArrayWithContinuation<ReadonlyTask<T>>>`

<a id="registerSprocs-method"></a>

### registerSprocs()

Ensures that the proper stored procedures are registered with Cosmos DB for the client to function. You should never have to call this directly.

<b>Signature:</b>

```typescript
registerSprocs(): Promise<void>;
```
<b>Returns:</b>

`Promise<void>`

<a id="type-method"></a>

### type(type)

Returns a client with all operations automatically scoped to the provided task type. This is useful if you have an area where you need to perform many related operations for a single task type and don't want to have to specify it each time.

<b>Signature:</b>

```typescript
type(type: string): ScopedTaskClient;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  type | `string` | Task type to apply to all operations within the scoped client. |

<b>Returns:</b>

`ScopedTaskClient`

