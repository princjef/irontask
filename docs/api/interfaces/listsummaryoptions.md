[Home](../index.md) &gt; [ListSummaryOptions](./listsummaryoptions.md)

# Interface ListSummaryOptions

Options controlling listing task summaries.

<b>Signature:</b>

```typescript
interface ListSummaryOptions extends ListOptions, ProjectOptions 
```

## Implements Interfaces

- <b>ListSummaryOptions</b>
    - [ListOptions](./listoptions.md)
        - [IterateOptions](./iterateoptions.md)
    - [ProjectOptions](./projectoptions.md)

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [filter](./iterateoptions.md#filter-property) | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Optional filter to apply on the returned tasks. If none is specified, all tasks of the given type will be returned.<br><br><i>Inherited from [IterateOptions.filter](./iterateoptions.md#filter-property)</i> |
|  [project](./projectoptions.md#project-property) | `QueryType.AnyProperty[]` | Optional list of properties within the payload to retrieve from the database. The structure of the payload returned will match the structure of the overall data, but will only contain the specified properties.<br><br><i>Inherited from [ProjectOptions.project](./projectoptions.md#project-property)</i> |
|  [skip](./listoptions.md#skip-property) | `number` | Number of tasks to skip in the result set.<br><br><i>Inherited from [ListOptions.skip](./listoptions.md#skip-property)</i> |
|  [sortExpression](./iterateoptions.md#sortExpression-property) | [QueryType.Num](../namespaces/querytype/types/num.md) | Optional sort expression to use for ordering the results returned by the database. The expression should be a numeric property.<br><br><i>Inherited from [IterateOptions.sortExpression](./iterateoptions.md#sortExpression-property)</i> |
|  [sortOrder](./iterateoptions.md#sortOrder-property) | `'ASC' \| 'DESC'` | Optional ordering to use for sorting against the expression.<br><br><i>Inherited from [IterateOptions.sortOrder](./iterateoptions.md#sortOrder-property)</i> |
|  [top](./listoptions.md#top-property) | `number` | Number of tasks to return from the result set.<br><br><i>Inherited from [ListOptions.top](./listoptions.md#top-property)</i> |

