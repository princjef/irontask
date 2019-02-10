[Home](../../../index.md) &gt; [QueryType](../../querytype.md) &gt; [BinarySpatialFnBool](./binaryspatialfnbool.md)

# Interface QueryType.BinarySpatialFnBool


<b>Signature:</b>

```typescript
interface BinarySpatialFnBool extends Array<any> 
```

## Implements Interfaces

- <b>QueryType.BinarySpatialFnBool</b>
    - Array

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [0](./binaryspatialfnbool.md#0-property) | `typeof FnSymbol.ST_WITHIN \| typeof FnSymbol.ST_INTERSECTS` |  |
|  [1](./binaryspatialfnbool.md#1-property) | [Spatial](../types/spatial.md) |  |
|  [2](./binaryspatialfnbool.md#2-property) | [Spatial](../types/spatial.md) |  |

## Property Details

<a id="0-property"></a>

### 0

<b>Signature:</b>

```typescript
0: typeof FnSymbol.ST_WITHIN | typeof FnSymbol.ST_INTERSECTS;
```

<a id="1-property"></a>

### 1

<b>Signature:</b>

```typescript
1: Spatial;
```

<a id="2-property"></a>

### 2

<b>Signature:</b>

```typescript
2: Spatial;
```
