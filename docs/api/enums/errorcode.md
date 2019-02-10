[Home](../index.md) &gt; [ErrorCode](./errorcode.md)

# Enum ErrorCode

List of all error codes that may be present in an [IronTaskError](../classes/irontaskerror.md)<!-- -->.

<b>Signature:</b>

```typescript
enum ErrorCode 
```

## Enumeration Members

|  Member | Value | Description |
|  --- | --- | --- |
|  DATABASE\_ACCOUNT\_NOT\_FOUND | `"ERR_DATABASE_ACCOUNT_NOT_FOUND"` | The database account DNS could not be located (ENOTFOUND) |
|  DATABASE\_INTERNAL\_ERROR | `"ERR_DATABASE_INTERNAL_ERROR"` | The database encountered an internal error (500) |
|  DATABASE\_INVALID\_CREDENTIALS | `"ERR_DATABASE_INVALID_CREDENTIALS"` | The provided database credentials are invalid (401) |
|  DATABASE\_INVALID\_REQUEST | `"ERR_DATABASE_INVALID_REQUEST"` | The request made to the database is invalid (400) |
|  DATABASE\_OPERATION\_FORBIDDEN | `"ERR_DATABASE_OPERATION_FORBIDDEN"` | The requested operation cannot be performed due to exceeded quota or expired credentials (403) |
|  DATABASE\_RESOURCE\_ALREADY\_EXISTS | `"ERR_DATABASE_RESOURCE_ALREADY_EXISTS"` | A resource with the same id already exists on the database (409) |
|  DATABASE\_RESOURCE\_CONCURRENCY\_VIOLATION | `"ERR_DATABASE_RESOURCE_CONCURRENCY_VIOLATION"` | The resource has changed since it was last requested. Try refetching and update it again (412) |
|  DATABASE\_RESOURCE\_NOT\_FOUND | `"ERR_DATABASE_RESOURCE_NOT_FOUND"` | The requested resource does not exist (404) |
|  DATABASE\_SPROC\_TIMED\_OUT | `"ERR_DATABASE_SPROC_TIMED_OUT"` | The stored procedure did not finish in the allotted time (408) |
|  DATABASE\_THROUGHPUT\_EXCEEDED | `"ERR_DATABASE_THROUGHPUT_EXCEEDED"` | The database throughput has been exceeded (429) |
|  DATABASE\_TRANSIENT\_WRITE\_FAILURE | `"ERR_DATABASE_TRANSIENT_WRITE_FAILURE"` | The database encountered a transient error while writing data (449) |
|  DATABASE\_UNAVAILABLE | `"ERR_DATABASE_UNAVAILABLE"` | The underlying database service is not currently available (503). |
|  INTERCEPTOR\_NEXT\_FUNCTION\_ALREADY\_CALLED | `"ERR_INTERCEPTOR_NEXT_FUNCTION_ALREADY_CALLED"` | The next function on an interceptor was called more than one time. |
|  LISTENER\_DESTROYED | `"ERR_LISTENER_DESTROYED"` | The listener has been destroyed and cannot be used any more. |
|  PROCESSING\_ALREADY\_FINISHED | `"ERR_PROCESSING_ALREADY_FINISHED"` | The operation cannot be performed because task processing has already finished. |
|  PROCESSING\_FINISH\_IN\_PROGRESS | `"ERR_PROCESSING_FINISH_IN_PROGRESS"` | The operation cannot be performed because task processing is currently being finished. |
|  PROCESSING\_LOCK\_LOST | `"ERR_PROCESSING_LOCK_LOST"` | The lock was lost while processing the task. |
|  TASK\_ALREADY\_SAVING\_PAYLOAD | `"ERR_TASK_ALREADY_SAVING_PAYLOAD"` | The task payload is already being saved and cannot be saved again. |
|  TASK\_TOO\_LARGE | `"ERR_TASK_TOO_LARGE"` | The task exceeded the maximum size of 2MB (413) |

