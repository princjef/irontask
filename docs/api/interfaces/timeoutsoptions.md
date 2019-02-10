[Home](../index.md) &gt; [TimeoutsOptions](./timeoutsoptions.md)

# Interface TimeoutsOptions

Options for configuring retries for an operation. Copied from `@types/retry` to avoid requiring the type in the package.

<b>Signature:</b>

```typescript
interface TimeoutsOptions 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [factor](./timeoutsoptions.md#factor-property) | `number` | The exponential factor to use. |
|  [maxTimeout](./timeoutsoptions.md#maxTimeout-property) | `number` | The maximum number of milliseconds between two retries. |
|  [minTimeout](./timeoutsoptions.md#minTimeout-property) | `number` | The number of milliseconds before starting the first retry. |
|  [randomize](./timeoutsoptions.md#randomize-property) | `boolean` | Randomizes the timeouts by multiplying a factor between 1-2. |
|  [retries](./timeoutsoptions.md#retries-property) | `number` | The maximum amount of times to retry the operation. |

## Property Details

<a id="factor-property"></a>

### factor

The exponential factor to use.

<b>Signature:</b>

```typescript
factor?: number;
```
<b>Default Value:</b>

2

<a id="maxTimeout-property"></a>

### maxTimeout

The maximum number of milliseconds between two retries.

<b>Signature:</b>

```typescript
maxTimeout?: number;
```
<b>Default Value:</b>

Infinity

<a id="minTimeout-property"></a>

### minTimeout

The number of milliseconds before starting the first retry.

<b>Signature:</b>

```typescript
minTimeout?: number;
```
<b>Default Value:</b>

1000

<a id="randomize-property"></a>

### randomize

Randomizes the timeouts by multiplying a factor between 1-2.

<b>Signature:</b>

```typescript
randomize?: boolean;
```
<b>Default Value:</b>

false

<a id="retries-property"></a>

### retries

The maximum amount of times to retry the operation.

<b>Signature:</b>

```typescript
retries?: number;
```
<b>Default Value:</b>

10

