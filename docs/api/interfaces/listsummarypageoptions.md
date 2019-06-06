[Home](../index.md) &gt; [ListSummaryPageOptions](./listsummarypageoptions.md)

# Interface ListSummaryPageOptions

Options controlling listing task summaries with continuation tokens.

<b>Signature:</b>

```typescript
interface ListSummaryPageOptions extends ListPageOptions, ProjectOptions 
```

## Implements Interfaces

- <b>ListSummaryPageOptions</b>
    - [ListPageOptions](./listpageoptions.md)
        - [IterateOptions](./iterateoptions.md)
    - [ProjectOptions](./projectoptions.md)

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [continuation](./listpageoptions.md#continuation-property) | `string` | Continuation token indicating where to start from.<br><br><i>Inherited from [ListPageOptions.continuation](./listpageoptions.md#continuation-property)</i> |
|  [filter](./iterateoptions.md#filter-property) | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Optional filter to apply on the returned tasks. If none is specified, all tasks of the given type will be returned.<br><br><i>Inherited from [IterateOptions.filter](./iterateoptions.md#filter-property)</i> |
|  [pageSize](./listpageoptions.md#pageSize-property) | `number` | Number of tasks to return from the result set.<br><br><i>Inherited from [ListPageOptions.pageSize](./listpageoptions.md#pageSize-property)</i> |
|  [project](./projectoptions.md#project-property) | `QueryType.AnyProperty[]` | Optional list of properties within the payload to retrieve from the database. The structure of the payload returned will match the structure of the overall data, but will only contain the specified properties.<br><br><i>Inherited from [ProjectOptions.project](./projectoptions.md#project-property)</i> |
|  [sortExpression](./iterateoptions.md#sortExpression-property) | [QueryType.Num](../namespaces/querytype/types/num.md) | Optional sort expression to use for ordering the results returned by the database. The expression should be a numeric property.<br><br><i>Inherited from [IterateOptions.sortExpression](./iterateoptions.md#sortExpression-property)</i> |
|  [sortOrder](./iterateoptions.md#sortOrder-property) | `'ASC' \| 'DESC'` | Optional ordering to use for sorting against the expression.<br><br><i>Inherited from [IterateOptions.sortOrder](./iterateoptions.md#sortOrder-property)</i> |

