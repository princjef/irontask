/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* !
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { FnSymbol, OpSymbol } from '../symbols';
import Type from '../types';

/**
 * Query expressions for creating Cosmos DB filters in operations such as {@link
 * TaskClient.list}, {@link TaskClient.listSummary}, {@link TaskClient.iterate}
 * and {@link TaskClient.iterateSummary}.
 *
 * @public
 */
namespace q {
  /**
   * Absolute value
   *
   * @public
   */
  export const abs = (num: Type.Num): Type.UnaryMathFn => [FnSymbol.ABS, num];

  /**
   * Arccosine trigonometric function
   *
   * @public
   */
  export const acos = (num: Type.Num): Type.UnaryMathFn => [FnSymbol.ACOS, num];

  /**
   * Arcsine trigonometric function
   *
   * @public
   */
  export const asin = (num: Type.Num): Type.UnaryMathFn => [FnSymbol.ASIN, num];

  /**
   * Arctangent trigonometric function
   *
   * @public
   */
  export const atan = (num: Type.Num): Type.UnaryMathFn => [FnSymbol.ATAN, num];

  /**
   * Principal value of the arctangent of the second argument divided by the
   * first
   *
   * @public
   */
  export const atn2 = (num1: Type.Num, num2: Type.Num): Type.BinaryMathFn => [
    FnSymbol.ATN2,
    num1,
    num2
  ];

  /**
   * Round up to the nearest integer.
   *
   * @public
   */
  export const ceiling = (num: Type.Num): Type.UnaryMathFn => [
    FnSymbol.CEILING,
    num
  ];

  /**
   * Cosine trigonometric function
   *
   * @public
   */
  export const cos = (num: Type.Num): Type.UnaryMathFn => [FnSymbol.COS, num];

  /**
   * Cotangent trigonometric function
   *
   * @public
   */
  export const cot = (num: Type.Num): Type.UnaryMathFn => [FnSymbol.COT, num];

  /**
   * Convert radians to degrees
   *
   * @public
   */
  export const degrees = (num: Type.Num): Type.UnaryMathFn => [
    FnSymbol.DEGREES,
    num
  ];

  /**
   * Take the exponential
   *
   * @public
   */
  export const exp = (num: Type.Num): Type.UnaryMathFn => [FnSymbol.EXP, num];

  /**
   * Round down to the nearest integer
   *
   * @public
   */
  export const floor = (num: Type.Num): Type.UnaryMathFn => [
    FnSymbol.FLOOR,
    num
  ];

  /**
   * Take the natural logarithm, or the logarithm with the optional provided
   * base.
   *
   * @public
   */
  export const log = (num: Type.Num, base?: Type.Num): Type.LogMathFn => [
    FnSymbol.LOG,
    num,
    base
  ];

  /**
   * Take the base 10 logarithm
   *
   * @public
   */
  export const log10 = (num: Type.Num): Type.UnaryMathFn => [
    FnSymbol.LOG10,
    num
  ];

  /**
   * The constant pi (3.14159...)
   *
   * @public
   */
  export const pi = (): Type.EmptyMathFn => [FnSymbol.PI];

  /**
   * Raise the expression to the given exponent.
   *
   * @public
   */
  export const power = (
    expr: Type.Num,
    exponent: Type.Num
  ): Type.BinaryMathFn => [FnSymbol.POWER, expr, exponent];

  /**
   * Convert degrees to radians
   *
   * @public
   */
  export const radians = (num: Type.Num): Type.UnaryMathFn => [
    FnSymbol.RADIANS,
    num
  ];

  /**
   * Round to the nearest integer
   *
   * @public
   */
  export const round = (num: Type.Num): Type.UnaryMathFn => [
    FnSymbol.ROUND,
    num
  ];

  /**
   * Sine trigonometric function
   *
   * @public
   */
  export const sin = (num: Type.Num): Type.UnaryMathFn => [FnSymbol.SIN, num];

  /**
   * Take the square root
   *
   * @public
   */
  export const sqrt = (num: Type.Num): Type.UnaryMathFn => [FnSymbol.SQRT, num];

  /**
   * Raise the value to the 2nd power
   *
   * @public
   */
  export const square = (num: Type.Num): Type.UnaryMathFn => [
    FnSymbol.SQUARE,
    num
  ];

  /**
   * Returns 1, 0 or -1 depending on whether the sign of the value is
   * positive, zero or negative, respectively.
   *
   * @public
   */
  export const sign = (num: Type.Num): Type.UnaryMathFn => [FnSymbol.SIGN, num];

  /**
   * Tangent trigonometric function
   *
   * @public
   */
  export const tan = (num: Type.Num): Type.UnaryMathFn => [FnSymbol.TAN, num];

  /**
   * Truncate the decimal portion of the value
   *
   * @public
   */
  export const trunc = (num: Type.Num): Type.UnaryMathFn => [
    FnSymbol.TRUNC,
    num
  ];

  /**
   * Returns true if the value is an array
   *
   * @public
   */
  export const isArray = (val: Type.Any): Type.TypeCheckFn => [
    FnSymbol.IS_ARRAY,
    val
  ];

  /**
   * Returns true if the value is a boolean
   *
   * @public
   */
  export const isBool = (val: Type.Any): Type.TypeCheckFn => [
    FnSymbol.IS_BOOL,
    val
  ];

  /**
   * Returns true if the value is defined
   *
   * @public
   */
  export const isDefined = (val: Type.Any): Type.TypeCheckFn => [
    FnSymbol.IS_DEFINED,
    val
  ];

  /**
   * Returns true if the value is null
   *
   * @public
   */
  export const isNull = (val: Type.Any): Type.TypeCheckFn => [
    FnSymbol.IS_NULL,
    val
  ];

  /**
   * Returns true if the value is a number
   *
   * @public
   */
  export const isNumber = (val: Type.Any): Type.TypeCheckFn => [
    FnSymbol.IS_NUMBER,
    val
  ];

  /**
   * Returns true if the value is an object
   *
   * @public
   */
  export const isObject = (val: Type.Any): Type.TypeCheckFn => [
    FnSymbol.IS_OBJECT,
    val
  ];

  /**
   * Returns true if the value is a primitive value (string, number, boolean
   * or null)
   *
   * @public
   */
  export const isPrimitive = (val: Type.Any): Type.TypeCheckFn => [
    FnSymbol.IS_PRIMITIVE,
    val
  ];

  /**
   * Returns true if the value is a string
   *
   * @public
   */
  export const isString = (val: Type.Any): Type.TypeCheckFn => [
    FnSymbol.IS_STRING,
    val
  ];

  /**
   * Check if the first string contains the second
   *
   * @public
   */
  export const contains = (
    str1: Type.Str,
    str2: Type.Str
  ): Type.BinaryStrFnBool => [FnSymbol.CONTAINS, str1, str2];

  /**
   * Check if the first string ends with the second string
   *
   * @public
   */
  export const endsWith = (
    str1: Type.Str,
    str2: Type.Str
  ): Type.BinaryStrFnBool => [FnSymbol.ENDSWITH, str1, str2];

  /**
   * Returns the starting position of the second string within the first
   * string, or -1 if it is not found
   *
   * @public
   */
  export const indexOf = (
    str1: Type.Str,
    str2: Type.Str
  ): Type.BinaryStrFnNum => [FnSymbol.INDEX_OF, str1, str2];

  /**
   * Returns the left portion of the string up to the number of charaters
   * specified
   *
   * @public
   */
  export const left = (
    str: Type.Str,
    num: Type.Num
  ): Type.BinaryStrNumFnStr => [FnSymbol.LEFT, str, num];

  /**
   * Returns the length of the string
   *
   * @public
   */
  export const length = (str: Type.Str): Type.UnaryStrFnNum => [
    FnSymbol.LENGTH,
    str
  ];

  /**
   * Convert the string to lower case
   *
   * @public
   */
  export const lower = (str: Type.Str): Type.UnaryStrFnStr => [
    FnSymbol.LOWER,
    str
  ];

  /**
   * Trim whitespace from the left side of the string
   *
   * @public
   */
  export const ltrim = (str: Type.Str): Type.UnaryStrFnStr => [
    FnSymbol.LTRIM,
    str
  ];

  /**
   * Replace instances of the search string with the replacement string in the
   * input string
   *
   * @public
   */
  export const replace = (
    str: Type.Str,
    search: Type.Str,
    replace: Type.Str
  ): Type.TernaryStrFnStr => [FnSymbol.REPLACE, str, search, replace];

  /**
   * Repeat the string the provided number of times
   *
   * @public
   */
  export const replicate = (
    str: Type.Str,
    num: Type.Num
  ): Type.BinaryStrNumFnStr => [FnSymbol.REPLICATE, str, num];

  /**
   * Reverse the characters of the string
   *
   * @public
   */
  export const reverse = (str: Type.Str): Type.UnaryStrFnStr => [
    FnSymbol.REVERSE,
    str
  ];

  /**
   * Return the right portion of the string up to the number of characters
   * provided
   *
   * @public
   */
  export const right = (
    str: Type.Str,
    num: Type.Num
  ): Type.BinaryStrNumFnStr => [FnSymbol.RIGHT, str, num];

  /**
   * Trim whitespace from the right side of the string
   *
   * @public
   */
  export const rtrim = (str: Type.Str): Type.UnaryStrFnStr => [
    FnSymbol.RTRIM,
    str
  ];

  /**
   * Check whether the first string starts with the second
   *
   * @public
   */
  export const startsWith = (
    str1: Type.Str,
    str2: Type.Str
  ): Type.BinaryStrFnBool => [FnSymbol.STARTSWITH, str1, str2];

  /**
   * Return the portion of the string from the start potition up to the length
   * provided
   *
   * @public
   */
  export const substring = (
    str: Type.Str,
    start: Type.Num,
    length: Type.Num
  ): Type.Substring => [FnSymbol.SUBSTRING, str, start, length];

  /**
   * Convert the value to a string
   *
   * @public
   */
  export const toString = (val: Type.Any): Type.ToString => [
    FnSymbol.TO_STRING,
    val
  ];

  /**
   * Trim whitespace from both ends of the string
   *
   * @public
   */
  export const trim = (str: Type.Str): Type.UnaryStrFnStr => [
    FnSymbol.TRIM,
    str
  ];

  /**
   * Convert the string to upper case
   *
   * @public
   */
  export const upper = (str: Type.Str): Type.UnaryStrFnStr => [
    FnSymbol.UPPER,
    str
  ];

  /**
   * Concatenate all of the provided arrays together. Requires at least two
   * arrays to concat.
   *
   * @public
   */
  export const arrayConcat = (
    array1: Type.Arr,
    array2: Type.Arr,
    ...more: Type.Arr[]
  ): Type.ArrayConcat => [FnSymbol.ARRAY_CONCAT, array1, array2, more];

  /**
   * Check whether the array contains the item specified. If partial is
   * true, then the item is matched if it is a valid portion of one of the
   * values, rather than having to be the full value.
   *
   * @public
   */
  export const arrayContains = (
    array: Type.Arr,
    item: Type.Any,
    partial?: Type.Bool
  ): Type.ArrayContains => [FnSymbol.ARRAY_CONTAINS, array, item, partial];

  /**
   * Compute the number of elements in the array
   *
   * @public
   */
  export const arrayLength = (array: Type.Arr): Type.ArrayLength => [
    FnSymbol.ARRAY_LENGTH,
    array
  ];

  /**
   * Return a subset of the array starting from the provided index and
   * optionally with the provided maximum length
   *
   * @public
   */
  export const arraySlice = (
    array: Type.Arr,
    start: Type.Num,
    length?: Type.Num
  ): Type.ArraySlice => [FnSymbol.ARRAY_SLICE, array, start, length];

  /**
   * Returns the distance between two GeoJSON points, polygons or linestrings
   *
   * @public
   */
  export const stDistance = (
    spatial1: Type.Spatial,
    spatial2: Type.Spatial
  ): Type.StDistance => [FnSymbol.ST_DISTANCE, spatial1, spatial2];

  /**
   * Check whether the first GeoJSON point polygon or linestring is inside of
   * the GeoJSON point, polygon or linestring in the second argument
   *
   * @public
   */
  export const stWithin = (
    inner: Type.Spatial,
    outer: Type.Spatial
  ): Type.BinarySpatialFnBool => [FnSymbol.ST_WITHIN, inner, outer];

  /**
   * Check whether the two GeoJSON points, polyhons, or linestrings intersect
   * one another
   *
   * @public
   */
  export const stIntersects = (
    spatial1: Type.Spatial,
    spatial2: Type.Spatial
  ): Type.BinarySpatialFnBool => [FnSymbol.ST_INTERSECTS, spatial1, spatial2];

  /**
   * Check whether the value is a valid GeoJSON point, polygon or linestring
   *
   * @public
   */
  export const stIsValid = (spatial: Type.Spatial): Type.StIsValid => [
    FnSymbol.ST_ISVALID,
    spatial
  ];

  /**
   * Check whether the value is a valid GeoJSON point, polygon or linestring,
   * returning an object with a `valid` boolean indicating whether the value
   * is valid and a `reason` property with a string describing the error if it
   * was not valid.
   *
   * @public
   */
  export const stIsValidDetailed = (
    spatial: Type.Spatial
  ): Type.StIsValidDetailed => [FnSymbol.ST_ISVALIDDETAILED, spatial];

  /**
   * Boolean AND of two or more subexpressions
   *
   * @public
   */
  export const and = (...expressions: Type.Bool[]): Type.BinaryLogical => [
    OpSymbol.AND,
    expressions
  ];

  /**
   * Boolean OR of two or more subexpressions
   *
   * @public
   */
  export const or = (...expressions: Type.Bool[]): Type.BinaryLogical => [
    OpSymbol.OR,
    expressions
  ];

  /**
   * Boolean negation of the subexpression
   *
   * @public
   */
  export const not = (expression: Type.Bool): Type.UnaryLogical => [
    OpSymbol.NOT,
    expression
  ];

  /**
   * Add the two numbers
   *
   * @public
   */
  export const add = (left: Type.Num, right: Type.Num): Type.Arithmetic => [
    OpSymbol.ADD,
    left,
    right
  ];

  /**
   * Subtract the second number from the first
   *
   * @public
   */
  export const subtract = (
    left: Type.Num,
    right: Type.Num
  ): Type.Arithmetic => [OpSymbol.SUBTRACT, left, right];

  /**
   * Multiply the two numbers
   *
   * @public
   */
  export const multiply = (
    left: Type.Num,
    right: Type.Num
  ): Type.Arithmetic => [OpSymbol.MULTIPLY, left, right];

  /**
   * Divide the first number by the second
   *
   * @public
   */
  export const divide = (left: Type.Num, right: Type.Num): Type.Arithmetic => [
    OpSymbol.DIVIDE,
    left,
    right
  ];

  /**
   * Compute the modulus of dividing the first number by the second
   *
   * @public
   */
  export const modulo = (left: Type.Num, right: Type.Num): Type.Arithmetic => [
    OpSymbol.MODULO,
    left,
    right
  ];

  /**
   * Take the bitwise OR of the two numbers
   *
   * @public
   */
  export const bitwiseOr = (
    left: Type.Num,
    right: Type.Num
  ): Type.Arithmetic => [OpSymbol.BITWISE_OR, left, right];

  /**
   * Take the bitwise AND of the two numbers
   *
   * @public
   */
  export const bitwiseAnd = (
    left: Type.Num,
    right: Type.Num
  ): Type.Arithmetic => [OpSymbol.BITWISE_AND, left, right];

  /**
   * Take the bitwise exclusive or of the two numbers
   *
   * @public
   */
  export const xor = (left: Type.Num, right: Type.Num): Type.Arithmetic => [
    OpSymbol.XOR,
    left,
    right
  ];

  /**
   * Shift the bits of the number to the left by the given amount
   *
   * @public
   */
  export const leftShift = (
    left: Type.Num,
    right: Type.Num
  ): Type.Arithmetic => [OpSymbol.LEFT_SHIFT, left, right];

  /**
   * Shift the bits of the number to the right by the given amount
   *
   * @public
   */
  export const rightShift = (
    left: Type.Num,
    right: Type.Num
  ): Type.Arithmetic => [OpSymbol.RIGHT_SHIFT, left, right];

  /**
   * Shift the bits of the number to the right by the given amount, filling
   * the new leftmost bits with zeros
   *
   * @public
   */
  export const zeroFillRightShift = (
    left: Type.Num,
    right: Type.Num
  ): Type.Arithmetic => [OpSymbol.ZF_RIGHT_SHIFT, left, right];

  /**
   * Check whether the two values are equivalent
   *
   * @public
   */

  export const equal = (left: Type.Any, right: Type.Any): Type.Equality => [
    OpSymbol.EQUAL,
    left,
    right
  ];

  /**
   * Check whether the two values are not equivalent
   *
   * @public
   */
  export const notEqual = (left: Type.Any, right: Type.Any): Type.Equality => [
    OpSymbol.NOT_EQUAL,
    left,
    right
  ];

  /**
   * Check whether the first number is greater than the second
   *
   * @public
   */
  export const greaterThan = (
    left: Type.Num,
    right: Type.Num
  ): Type.Comparison => [OpSymbol.GREATER_THAN, left, right];

  /**
   * Check whether the first number is greater than or equal to the second
   *
   * @public
   */
  export const greaterThanOrEqual = (
    left: Type.Num,
    right: Type.Num
  ): Type.Comparison => [OpSymbol.GREATER_THAN_OR_EQUAL, left, right];

  /**
   * Check whether the first number is less than the second
   *
   * @public
   */
  export const lessThan = (
    left: Type.Num,
    right: Type.Num
  ): Type.Comparison => [OpSymbol.LESS_THAN, left, right];

  /**
   * Check whether the first number is less than or equal to the second
   *
   * @public
   */
  export const lessThanOrEqual = (
    left: Type.Num,
    right: Type.Num
  ): Type.Comparison => [OpSymbol.LESS_THAN_OR_EQUAL, left, right];

  /**
   * Return the first value if defined, or the second value if the first value
   * if the first value is undefined
   *
   * @public
   */
  export const coalesce = (
    first: Type.Any,
    second: Type.Any
  ): Type.Coalesce => [OpSymbol.COALESCE, first, second];

  /**
   * Concatenate two or more strings together into a single string
   *
   * @public
   */
  export const concat = (
    left: Type.Str,
    right: Type.Str,
    ...more: Type.Str[]
  ): Type.Concat => [OpSymbol.CONCATENATE, left, right, more];

  /**
   * If the condition is true, return the second argument. If it is false,
   * return the third.
   *
   * @public
   */
  export const ternary = (
    condition: Type.Bool,
    ifTrue: Type.Any,
    ifFalse: Type.Any
  ): Type.Ternary => [OpSymbol.TERNARY, condition, ifTrue, ifFalse];

  /**
   * Check if the value is equal to one of the array of candidates in the
   * second argument
   *
   * @public
   */
  export const inOp = (value: Type.Any, candidates: Type.Any[]): Type.In => [
    OpSymbol.IN,
    value,
    candidates
  ];
}

export default q;
