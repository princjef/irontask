[Home](../index.md) &gt; [IronTaskError](./irontaskerror.md)

# Class IronTaskError

Generic error class that is thrown for any internal library errors.

<b>Signature:</b>

```typescript
class IronTaskError extends Error 
```

## Class Hierarchy

- Error
    - <b>IronTaskError</b>

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [code](./irontaskerror.md#code-property) | [ErrorCode](../enums/errorcode.md) | Unique, stable code for checking what type of error was thrown. |
|  [name](./irontaskerror.md#name-property) | `'IronTaskError'` | Static name for identifying that a task is of this type. This can be used as an alternative to performing an `instanceof` check. |
|  [parentError](./irontaskerror.md#parentError-property) | `any` | If present, the underlying error that caused this error to be triggered. This can be used to retrieve additional metadata about the error. |

## Static Methods

|  Method | Description |
|  --- | --- |
|  [is(error, codes)](./irontaskerror.md#is-method-static) | Checks the provided error to see if it is a valid IronTaskError and has one of the provided codes. If no codes are provided, it will just check whether the error is an IronTaskError. |

## Property Details

<a id="code-property"></a>

### code

Unique, stable code for checking what type of error was thrown.

<b>Signature:</b>

```typescript
readonly code: ErrorCode;
```

<a id="name-property"></a>

### name

Static name for identifying that a task is of this type. This can be used as an alternative to performing an `instanceof` check.

<b>Signature:</b>

```typescript
readonly name: 'IronTaskError';
```

<a id="parentError-property"></a>

### parentError

If present, the underlying error that caused this error to be triggered. This can be used to retrieve additional metadata about the error.

<b>Signature:</b>

```typescript
parentError?: any;
```

## Static Method Details

<a id="is-method-static"></a>

### is(error, codes)

Checks the provided error to see if it is a valid IronTaskError and has one of the provided codes. If no codes are provided, it will just check whether the error is an IronTaskError.

<b>Signature:</b>

```typescript
static is(error: any, ...codes: ErrorCode[]): error is IronTaskError;
```

#### Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  error | `any` | Arbitrary error to verify |
|  codes | `ErrorCode[]` | List of error codes to check for. If the error does not have one of the codes, this will return false. If there are no error codes provided, the function will only check whether this is a valid IronTaskError. |

<b>Returns:</b>

`error is IronTaskError`

