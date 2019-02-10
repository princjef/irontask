[Home](../index.md) &gt; [IterateOptions](./iterateoptions.md)

# Interface IterateOptions

Options controlling iterator-based operations.

<b>Signature:</b>

```typescript
interface IterateOptions 
```

## Implemented By

- <b>IterateOptions</b>
    - [IterateSummaryOptions](./iteratesummaryoptions.md)
    - [ListOptions](./listoptions.md)
        - [ListSummaryOptions](./listsummaryoptions.md)

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [filter](./iterateoptions.md#filter-property) | [QueryType.Bool](../namespaces/querytype/types/bool.md) | Optional filter to apply on the returned tasks. If none is specified, all tasks of the given type will be returned. |
|  [sortExpression](./iterateoptions.md#sortExpression-property) | [QueryType.Num](../namespaces/querytype/types/num.md) | Optional sort expression to use for ordering the results returned by the database. The expression should be a numeric property. |
|  [sortOrder](./iterateoptions.md#sortOrder-property) | `'ASC' \| 'DESC'` | Optional ordering to use for sorting against the expression. |

## Property Details

<a id="filter-property"></a>

### filter

Optional filter to apply on the returned tasks. If none is specified, all tasks of the given type will be returned.

<b>Signature:</b>

```typescript
filter?: QueryType.Bool;
```

#### Example

Filter to only recurring tasks

```ts
{
  filter: q.isDefined(t.interval)
}

```

<a id="sortExpression-property"></a>

### sortExpression

Optional sort expression to use for ordering the results returned by the database. The expression should be a numeric property.

<b>Signature:</b>

```typescript
sortExpression?: QueryType.Num;
```
<b>Default Value:</b>

undefined (no sort)

#### Example

Sort by the time the last run ended

```ts
{
  sortExpression: t.lastRunFinishTime
}

```

<a id="sortOrder-property"></a>

### sortOrder

Optional ordering to use for sorting against the expression.

<b>Signature:</b>

```typescript
sortOrder?: 'ASC' | 'DESC';
```
<b>Default Value:</b>

'ASC'

