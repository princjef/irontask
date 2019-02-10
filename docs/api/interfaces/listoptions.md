[Home](../index.md) &gt; [ListOptions](./listoptions.md)

# Interface ListOptions

Options controlling listing tasks.

<b>Signature:</b>

```typescript
interface ListOptions extends IterateOptions 
```

## Implements Interfaces

- <b>ListOptions</b>
    - [IterateOptions](./iterateoptions.md)

## Implemented By

- <b>ListOptions</b>
    - [ListSummaryOptions](./listsummaryoptions.md)

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [filter](./iterateoptions.md#filter-property) | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Optional filter to apply on the returned tasks. If none is specified, all tasks of the given type will be returned.<br><br><i>Inherited from [IterateOptions.filter](./iterateoptions.md#filter-property)</i> |
|  [skip](./listoptions.md#skip-property) | `number` | Number of tasks to skip in the result set. |
|  [sortExpression](./iterateoptions.md#sortExpression-property) | [QueryType.Num](../namespaces/querytype/types/num.md) | Optional sort expression to use for ordering the results returned by the database. The expression should be a numeric property.<br><br><i>Inherited from [IterateOptions.sortExpression](./iterateoptions.md#sortExpression-property)</i> |
|  [sortOrder](./iterateoptions.md#sortOrder-property) | `'ASC' \| 'DESC'` | Optional ordering to use for sorting against the expression.<br><br><i>Inherited from [IterateOptions.sortOrder](./iterateoptions.md#sortOrder-property)</i> |
|  [top](./listoptions.md#top-property) | `number` | Number of tasks to return from the result set. |

## Property Details

<a id="skip-property"></a>

### skip

Number of tasks to skip in the result set.

<b>Signature:</b>

```typescript
skip?: number;
```
<b>Default Value:</b>

0

<a id="top-property"></a>

### top

Number of tasks to return from the result set.

<b>Signature:</b>

```typescript
top?: number;
```
<b>Default Value:</b>

25

