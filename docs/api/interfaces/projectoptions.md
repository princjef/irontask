[Home](../index.md) &gt; [ProjectOptions](./projectoptions.md)

# Interface ProjectOptions

Options for projecting data from tasks when working with summaries.

<b>Signature:</b>

```typescript
interface ProjectOptions 
```

## Implemented By

- <b>ProjectOptions</b>
    - [IterateSummaryOptions](./iteratesummaryoptions.md)
    - [ListSummaryOptions](./listsummaryoptions.md)

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [project](./projectoptions.md#project-property) | `QueryType.AnyProperty[]` | Optional list of properties within the payload to retrieve from the database. The structure of the payload returned will match the structure of the overall data, but will only contain the specified properties. |

## Property Details

<a id="project-property"></a>

### project

Optional list of properties within the payload to retrieve from the database. The structure of the payload returned will match the structure of the overall data, but will only contain the specified properties.

<b>Signature:</b>

```typescript
project?: QueryType.AnyProperty[];
```

#### Example

Project properties `a` and `c[0]` from the payload

```ts
{
  project: [
    t.payload('a'),
    t.payload('c', 0)
  ]
}

```

