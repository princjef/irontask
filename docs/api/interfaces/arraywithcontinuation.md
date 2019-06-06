[Home](../index.md) &gt; [ArrayWithContinuation](./arraywithcontinuation.md)

# Interface ArrayWithContinuation

Array of results including a continuation token property.

<b>Signature:</b>

```typescript
interface ArrayWithContinuation<T> extends Array<T> 
```

## Implements Interfaces

- <b>ArrayWithContinuation</b>
    - Array

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [continuation](./arraywithcontinuation.md#continuation-property) | `string` | If present, a continuation token that can be provided in the [ListPageOptions.continuation](./listpageoptions.md#continuation-property) option to retrieve more results. If not present, there are no more results. |

## Property Details

<a id="continuation-property"></a>

### continuation

If present, a continuation token that can be provided in the [ListPageOptions.continuation](./listpageoptions.md#continuation-property) option to retrieve more results. If not present, there are no more results.

<b>Signature:</b>

```typescript
continuation?: string;
```
