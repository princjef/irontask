[Home](./index.md)

# irontask

## Classes

|  Class | Description |
|  --- | --- |
|  [IronTaskError](./classes/irontaskerror.md) | Generic error class that is thrown for any internal library errors. |
|  [ScopedClient](./classes/scopedclient.md) | Version of [TaskClient](./classes/taskclient.md) that has all of its operations automatically scoped to a single task type. |
|  [TaskClient](./classes/taskclient.md) | The primary client for creating, updating, querying and processing tasks. It wraps an Azure Cosmos DB collection, which is used to store the tasks. It's recommended that you create one using the TaskClient.create method instead of using the constructor. This will set up the database, collection and necessary stored procedures for you. |

## Enumerations

|  Enumeration | Description |
|  --- | --- |
|  [ErrorCode](./enums/errorcode.md) | List of all error codes that may be present in an [IronTaskError](./classes/irontaskerror.md)<!-- -->. |
|  [ProcessingResult](./enums/processingresult.md) | Enumeration of all of the possible outcomes when processing a task. |
|  [ProcessingState](./enums/processingstate.md) | Representation of the current status of processing an [ActiveTask](./interfaces/activetask.md)<!-- -->. |
|  [TaskStatus](./enums/taskstatus.md) | Enumeration of different representations of the current processing status of a task. |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [ActiveTask](./interfaces/activetask.md) | Representation of a task that is currently being processed by a [Listener](./interfaces/listener.md)<!-- -->. It provides the ability to see information and update values of the task like when working with a [Task](./interfaces/task.md)<!-- -->, but also has additional functionality specific to processing, such as completing, retrying, etc. |
|  [CreateTaskOptions](./interfaces/createtaskoptions.md) | Options for configuring a task created through the [TaskClient](./classes/taskclient.md)<!-- -->. |
|  [Interceptors](./interfaces/interceptors.md) | Set of functions provided for intercepting various types of operations. Each Interceptor that is provided will be invoked for each operation of the relevant type. |
|  [IterateOptions](./interfaces/iterateoptions.md) | Options controlling iterator-based operations. |
|  [IterateSummaryOptions](./interfaces/iteratesummaryoptions.md) | Options controlling iterator-based operations on task summaries. |
|  [Listener](./interfaces/listener.md) | Listener for processing tasks of a single type. It is generally created by calling [TaskClient.listen()](./classes/taskclient.md#listen-method)<!-- -->. |
|  [ListenOptions](./interfaces/listenoptions.md) | Options configuring the behavior of a listener. |
|  [ListOptions](./interfaces/listoptions.md) | Options controlling listing tasks. |
|  [ListSummaryOptions](./interfaces/listsummaryoptions.md) | Options controlling listing task summaries. |
|  [ProjectOptions](./interfaces/projectoptions.md) | Options for projecting data from tasks when working with summaries. |
|  [ReadonlyTask](./interfaces/readonlytask.md) | Representation of a task that cannot have its payload saved because it is produced from operations that only provide a partial copy of the payload, such as [TaskClient.listSummary()](./classes/taskclient.md#listSummary-method) and [TaskClient.iterateSummary()](./classes/taskclient.md#iterateSummary-method)<!-- -->. |
|  [SerializedActiveTask](./interfaces/serializedactivetask.md) | Representation of a task that is currently being processed converted to a plain JSON object. Created by [ActiveTask.toJSON()](./interfaces/activetask.md#toJSON-method)<!-- -->. |
|  [SerializedTask](./interfaces/serializedtask.md) | Representation of a task converted to a plain JSON object. Created by [TaskBase.toJSON()](./interfaces/taskbase.md#toJSON-method) and derivatives. |
|  [Task](./interfaces/task.md) | General representation of a task. It is returned by many methods such as TaskClient.create, [TaskClient.get()](./classes/taskclient.md#get-method) and [TaskClient.list()](./classes/taskclient.md#list-method)<!-- -->. You should never need to create an instance of this class directly. |
|  [TaskBase](./interfaces/taskbase.md) | Base data and functionality that is common to tasks created and used in any context. |
|  [TaskClientOptions](./interfaces/taskclientoptions.md) | Options for configuring the behavior of the [TaskClient](./classes/taskclient.md)<!-- -->. |
|  [TaskFinishMetadata](./interfaces/taskfinishmetadata.md) | Information about the result of processing an [ActiveTask](./interfaces/activetask.md) and any metadata provided as part of finishing. |
|  [TimeoutsOptions](./interfaces/timeoutsoptions.md) | Options for configuring retries for an operation. Copied from `@types/retry` to avoid requiring the type in the package. |

## Namespaces

|  Namespace | Description |
|  --- | --- |
|  [FnSymbol](./namespaces/fnsymbol.md) |  |
|  [Interceptors](./namespaces/interceptors.md) | Interfaces and helper types for the interceptor capability set. |
|  [OpSymbol](./namespaces/opsymbol.md) |  |
|  [PropSymbol](./namespaces/propsymbol.md) |  |
|  [q](./namespaces/q.md) | Query expressions for creating Cosmos DB filters in operations such as [TaskClient.list()](./classes/taskclient.md#list-method)<!-- -->, [TaskClient.listSummary()](./classes/taskclient.md#listSummary-method)<!-- -->, [TaskClient.iterate()](./classes/taskclient.md#iterate-method) and [TaskClient.iterateSummary()](./classes/taskclient.md#iterateSummary-method)<!-- -->. |
|  [QueryType](./namespaces/querytype.md) | Various types representing expressions that are used and returned by expressions in the [q](./namespaces/q.md) namespace. You will most likely not need to use these types directly in your code. |
|  [t](./namespaces/t.md) | Expressions representing various properties of a task useful for filtering or projection expressions in operations like [TaskClient.list()](./classes/taskclient.md#list-method)<!-- -->, [TaskClient.listSummary()](./classes/taskclient.md#listSummary-method)<!-- -->, [TaskClient.iterate()](./classes/taskclient.md#iterate-method)<!-- -->, [TaskClient.iterateSummary()](./classes/taskclient.md#iterateSummary-method) and more. |

## Variables

|  Variable | Description |
|  --- | --- |
|  [NO\_RETRY](./variables/no_retry.md) | Configuration to disable retries in [ListenOptions.retries](./interfaces/listenoptions.md#retries-property)<!-- -->. |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [FnSymbol](./types/fnsymbol.md) |  |
|  [OpSymbol](./types/opsymbol.md) |  |
|  [PropSymbol](./types/propsymbol.md) |  |
|  [TaskHandler](./types/taskhandler.md) | Handler for processing received tasks |

