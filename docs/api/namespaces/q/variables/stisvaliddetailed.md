[Home](../../../index.md) &gt; [q](../../q.md) &gt; [stIsValidDetailed](./stisvaliddetailed.md)

# Variable q.stIsValidDetailed

Check whether the value is a valid GeoJSON point, polygon or linestring, returning an object with a `valid` boolean indicating whether the value is valid and a `reason` property with a string describing the error if it was not valid.

<b>Signature:</b>

```typescript
stIsValidDetailed: (spatial: Type.Spatial) => Type.StIsValidDetailed
```
