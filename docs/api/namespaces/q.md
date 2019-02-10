[Home](../index.md) &gt; [q](./q.md)

# Namespace q

Query expressions for creating Cosmos DB filters in operations such as [TaskClient.list()](../classes/taskclient.md#list-method)<!-- -->, [TaskClient.listSummary()](../classes/taskclient.md#listSummary-method)<!-- -->, [TaskClient.iterate()](../classes/taskclient.md#iterate-method) and [TaskClient.iterateSummary()](../classes/taskclient.md#iterateSummary-method)<!-- -->.

<b>Signature:</b>

```typescript
namespace q 
```

## Variables

|  Variable | Description |
|  --- | --- |
|  [abs](./q/variables/abs.md) | Absolute value |
|  [acos](./q/variables/acos.md) | Arccosine trigonometric function |
|  [add](./q/variables/add.md) | Add the two numbers |
|  [and](./q/variables/and.md) | Boolean AND of two or more subexpressions |
|  [arrayConcat](./q/variables/arrayconcat.md) | Concatenate all of the provided arrays together. Requires at least two arrays to concat. |
|  [arrayContains](./q/variables/arraycontains.md) | Check whether the array contains the item specified. If partial is true, then the item is matched if it is a valid portion of one of the values, rather than having to be the full value. |
|  [arrayLength](./q/variables/arraylength.md) | Compute the number of elements in the array |
|  [arraySlice](./q/variables/arrayslice.md) | Return a subset of the array starting from the provided index and optionally with the provided maximum length |
|  [asin](./q/variables/asin.md) | Arcsine trigonometric function |
|  [atan](./q/variables/atan.md) | Arctangent trigonometric function |
|  [atn2](./q/variables/atn2.md) | Principal value of the arctangent of the second argument divided by the first |
|  [bitwiseAnd](./q/variables/bitwiseand.md) | Take the bitwise AND of the two numbers |
|  [bitwiseOr](./q/variables/bitwiseor.md) | Take the bitwise OR of the two numbers |
|  [ceiling](./q/variables/ceiling.md) | Round up to the nearest integer. |
|  [coalesce](./q/variables/coalesce.md) | Return the first value if defined, or the second value if the first value if the first value is undefined |
|  [concat](./q/variables/concat.md) | Concatenate two or more strings together into a single string |
|  [contains](./q/variables/contains.md) | Check if the first string contains the second |
|  [cos](./q/variables/cos.md) | Cosine trigonometric function |
|  [cot](./q/variables/cot.md) | Cotangent trigonometric function |
|  [degrees](./q/variables/degrees.md) | Convert radians to degrees |
|  [divide](./q/variables/divide.md) | Divide the first number by the second |
|  [endsWith](./q/variables/endswith.md) | Check if the first string ends with the second string |
|  [equal](./q/variables/equal.md) | Check whether the two values are equivalent |
|  [exp](./q/variables/exp.md) | Take the exponential |
|  [floor](./q/variables/floor.md) | Round down to the nearest integer |
|  [greaterThan](./q/variables/greaterthan.md) | Check whether the first number is greater than the second |
|  [greaterThanOrEqual](./q/variables/greaterthanorequal.md) | Check whether the first number is greater than or equal to the second |
|  [indexOf](./q/variables/indexof.md) | Returns the starting position of the second string within the first string, or -1 if it is not found |
|  [inOp](./q/variables/inop.md) | Check if the value is equal to one of the array of candidates in the second argument |
|  [isArray](./q/variables/isarray.md) | Returns true if the value is an array |
|  [isBool](./q/variables/isbool.md) | Returns true if the value is a boolean |
|  [isDefined](./q/variables/isdefined.md) | Returns true if the value is defined |
|  [isNull](./q/variables/isnull.md) | Returns true if the value is null |
|  [isNumber](./q/variables/isnumber.md) | Returns true if the value is a number |
|  [isObject](./q/variables/isobject.md) | Returns true if the value is an object |
|  [isPrimitive](./q/variables/isprimitive.md) | Returns true if the value is a primitive value (string, number, boolean or null) |
|  [isString](./q/variables/isstring.md) | Returns true if the value is a string |
|  [left](./q/variables/left.md) | Returns the left portion of the string up to the number of charaters specified |
|  [leftShift](./q/variables/leftshift.md) | Shift the bits of the number to the left by the given amount |
|  [length](./q/variables/length.md) | Returns the length of the string |
|  [lessThan](./q/variables/lessthan.md) | Check whether the first number is less than the second |
|  [lessThanOrEqual](./q/variables/lessthanorequal.md) | Check whether the first number is less than or equal to the second |
|  [log](./q/variables/log.md) | Take the natural logarithm, or the logarithm with the optional provided base. |
|  [log10](./q/variables/log10.md) | Take the base 10 logarithm |
|  [lower](./q/variables/lower.md) | Convert the string to lower case |
|  [ltrim](./q/variables/ltrim.md) | Trim whitespace from the left side of the string |
|  [modulo](./q/variables/modulo.md) | Compute the modulus of dividing the first number by the second |
|  [multiply](./q/variables/multiply.md) | Multiply the two numbers |
|  [not](./q/variables/not.md) | Boolean negation of the subexpression |
|  [notEqual](./q/variables/notequal.md) | Check whether the two values are not equivalent |
|  [or](./q/variables/or.md) | Boolean OR of two or more subexpressions |
|  [pi](./q/variables/pi.md) | The constant pi (3.14159...) |
|  [power](./q/variables/power.md) | Raise the expression to the given exponent. |
|  [radians](./q/variables/radians.md) | Convert degrees to radians |
|  [replace](./q/variables/replace.md) | Replace instances of the search string with the replacement string in the input string |
|  [replicate](./q/variables/replicate.md) | Repeat the string the provided number of times |
|  [reverse](./q/variables/reverse.md) | Reverse the characters of the string |
|  [right](./q/variables/right.md) | Return the right portion of the string up to the number of characters provided |
|  [rightShift](./q/variables/rightshift.md) | Shift the bits of the number to the right by the given amount |
|  [round](./q/variables/round.md) | Round to the nearest integer |
|  [rtrim](./q/variables/rtrim.md) | Trim whitespace from the right side of the string |
|  [sign](./q/variables/sign.md) | Returns 1, 0 or -1 depending on whether the sign of the value is positive, zero or negative, respectively. |
|  [sin](./q/variables/sin.md) | Sine trigonometric function |
|  [sqrt](./q/variables/sqrt.md) | Take the square root |
|  [square](./q/variables/square.md) | Raise the value to the 2nd power |
|  [startsWith](./q/variables/startswith.md) | Check whether the first string starts with the second |
|  [stDistance](./q/variables/stdistance.md) | Returns the distance between two GeoJSON points, polygons or linestrings |
|  [stIntersects](./q/variables/stintersects.md) | Check whether the two GeoJSON points, polyhons, or linestrings intersect one another |
|  [stIsValid](./q/variables/stisvalid.md) | Check whether the value is a valid GeoJSON point, polygon or linestring |
|  [stIsValidDetailed](./q/variables/stisvaliddetailed.md) | Check whether the value is a valid GeoJSON point, polygon or linestring, returning an object with a `valid` boolean indicating whether the value is valid and a `reason` property with a string describing the error if it was not valid. |
|  [stWithin](./q/variables/stwithin.md) | Check whether the first GeoJSON point polygon or linestring is inside of the GeoJSON point, polygon or linestring in the second argument |
|  [substring](./q/variables/substring.md) | Return the portion of the string from the start potition up to the length provided |
|  [subtract](./q/variables/subtract.md) | Subtract the second number from the first |
|  [tan](./q/variables/tan.md) | Tangent trigonometric function |
|  [ternary](./q/variables/ternary.md) | If the condition is true, return the second argument. If it is false, return the third. |
|  [toString](./q/variables/tostring.md) | Convert the value to a string |
|  [trim](./q/variables/trim.md) | Trim whitespace from both ends of the string |
|  [trunc](./q/variables/trunc.md) | Truncate the decimal portion of the value |
|  [upper](./q/variables/upper.md) | Convert the string to upper case |
|  [xor](./q/variables/xor.md) | Take the bitwise exclusive or of the two numbers |
|  [zeroFillRightShift](./q/variables/zerofillrightshift.md) | Shift the bits of the number to the right by the given amount, filling the new leftmost bits with zeros |

