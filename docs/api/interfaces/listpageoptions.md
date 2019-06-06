[Home](../index.md) &gt; [ListPageOptions](./listpageoptions.md)

# Interface ListPageOptions

Options controlling listing tasks with continuation tokens.

<b>Signature:</b>

```typescript
interface ListPageOptions extends IterateOptions 
```

## Implements Interfaces

- <b>ListPageOptions</b>
    - [IterateOptions](./iterateoptions.md)

## Implemented By

- <b>ListPageOptions</b>
    - [ListSummaryPageOptions](./listsummarypageoptions.md)

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [continuation](./listpageoptions.md#continuation-property) | `string` | Continuation token indicating where to start from. |
|  [filter](./iterateoptions.md#filter-property) | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Optional filter to apply on the returned tasks. If none is specified, all tasks of the given type will be returned.<br><br><i>Inherited from [IterateOptions.filter](./iterateoptions.md#filter-property)</i> |
|  [pageSize](./listpageoptions.md#pageSize-property) | `number` | Number of tasks to return from the result set. |
|  [sortExpression](./iterateoptions.md#sortExpression-property) | [QueryType.Num](../namespaces/querytype/types/num.md) | Optional sort expression to use for ordering the results returned by the database. The expression should be a numeric property.<br><br><i>Inherited from [IterateOptions.sortExpression](./iterateoptions.md#sortExpression-property)</i> |
|  [sortOrder](./iterateoptions.md#sortOrder-property) | `'ASC' \| 'DESC'` | Optional ordering to use for sorting against the expression.<br><br><i>Inherited from [IterateOptions.sortOrder](./iterateoptions.md#sortOrder-property)</i> |

## Property Details

<a id="continuation-property"></a>

### continuation

Continuation token indicating where to start from.

<b>Signature:</b>

```typescript
continuation?: string;
```

<a id="pageSize-property"></a>

### pageSize

Number of tasks to return from the result set.

<b>Signature:</b>

```typescript
pageSize?: number;
```
<b>Default Value:</b>

25

