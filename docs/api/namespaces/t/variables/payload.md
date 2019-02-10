[Home](../../../index.md) &gt; [t](../../t.md) &gt; [payload](./payload.md)

# Variable t.payload

User-defined payload holding information about the task. If called with no arguments, it points to the entire payload. However, you can also reference portions of the payload by providing arguments to the function. Each argument represents a property name or array index that, when combined, form a path to a property in the payload.

<b>Signature:</b>

```typescript
payload: (...path: (string | number)[]) => QueryType.Property
```

## Example 1

Retrieve the full payload

```ts
t.payload()

```

## Example 2

Retrieve payload.prop\[2\]

```ts
t.payload('prop', 2)

```

