/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { FnSymbol, OpSymbol, PropSymbol } from './symbols';

/**
 * Various types representing expressions that are used and returned by
 * expressions in the {@link q} namespace. You will most likely not need to use
 * these types directly in your code.
 *
 * @public
 */
namespace QueryType {
  /**
   * @public
   */
  export interface Property extends Array<any> {
    0: typeof PropSymbol.ANY;
    1: string;
    2: (string | number)[];
  }

  /**
   * @public
   */
  export interface NumericProperty extends Array<any> {
    0: typeof PropSymbol.NUMERIC;
    1: string;
    2: (string | number)[];
  }

  /**
   * @public
   */
  export interface BooleanProperty extends Array<any> {
    0: typeof PropSymbol.BOOLEAN;
    1: string;
    2: (string | number)[];
  }

  /**
   * @public
   */
  export interface StringProperty extends Array<any> {
    0: typeof PropSymbol.STRING;
    1: string;
    2: (string | number)[];
  }

  /**
   * @public
   */
  export interface SpatialProperty extends Array<any> {
    0: typeof PropSymbol.SPATIAL;
    1: string;
    2: (string | number)[];
  }

  /**
   * @public
   */
  export interface ArrayProperty extends Array<any> {
    0: typeof PropSymbol.ARRAY;
    1: string;
    2: (string | number)[];
  }

  /**
   * @public
   */
  export interface ObjectProperty extends Array<any> {
    0: typeof PropSymbol.OBJECT;
    1: string;
    2: (string | number)[];
  }

  /**
   * @public
   */
  export interface BinaryLogical extends Array<any> {
    0: typeof OpSymbol.AND | typeof OpSymbol.OR;
    1: Bool[];
  }

  /**
   * @public
   */
  export interface UnaryLogical extends Array<any> {
    0: typeof OpSymbol.NOT;
    1: Bool;
  }

  /**
   * @public
   */
  export interface Arithmetic extends Array<any> {
    0:
      | typeof OpSymbol.ADD
      | typeof OpSymbol.SUBTRACT
      | typeof OpSymbol.MULTIPLY
      | typeof OpSymbol.DIVIDE
      | typeof OpSymbol.MODULO
      | typeof OpSymbol.BITWISE_OR
      | typeof OpSymbol.BITWISE_AND
      | typeof OpSymbol.XOR
      | typeof OpSymbol.LEFT_SHIFT
      | typeof OpSymbol.RIGHT_SHIFT
      | typeof OpSymbol.ZF_RIGHT_SHIFT;
    1: Num;
    2: Num;
  }

  /**
   * @public
   */
  export interface Equality extends Array<any> {
    0: typeof OpSymbol.EQUAL | typeof OpSymbol.NOT_EQUAL;
    1: Any;
    2: Any;
  }

  /**
   * @public
   */
  export interface Comparison extends Array<any> {
    0:
      | typeof OpSymbol.GREATER_THAN
      | typeof OpSymbol.GREATER_THAN_OR_EQUAL
      | typeof OpSymbol.LESS_THAN
      | typeof OpSymbol.LESS_THAN_OR_EQUAL;
    1: Num;
    2: Num;
  }

  /**
   * @public
   */
  export interface Coalesce extends Array<any> {
    0: typeof OpSymbol.COALESCE;
    1: Any;
    2: Any;
  }

  /**
   * @public
   */
  export interface Ternary extends Array<any> {
    0: typeof OpSymbol.TERNARY;
    1: Bool;
    2: Any;
    3: Any;
  }

  /**
   * @public
   */
  export interface Concat extends Array<any> {
    0: typeof OpSymbol.CONCATENATE;
    1: Str;
    2: Str;
    3: Str[];
  }

  /**
   * @public
   */
  export interface In extends Array<any> {
    0: typeof OpSymbol.IN;
    1: Any;
    2: Any[];
  }

  /**
   * @public
   */
  export interface EmptyMathFn extends Array<any> {
    0: typeof FnSymbol.PI;
  }

  /**
   * @public
   */
  export interface UnaryMathFn extends Array<any> {
    0:
      | typeof FnSymbol.ABS
      | typeof FnSymbol.ACOS
      | typeof FnSymbol.ASIN
      | typeof FnSymbol.ATAN
      | typeof FnSymbol.CEILING
      | typeof FnSymbol.COS
      | typeof FnSymbol.COT
      | typeof FnSymbol.DEGREES
      | typeof FnSymbol.EXP
      | typeof FnSymbol.FLOOR
      | typeof FnSymbol.LOG10
      | typeof FnSymbol.RADIANS
      | typeof FnSymbol.ROUND
      | typeof FnSymbol.SIN
      | typeof FnSymbol.SQRT
      | typeof FnSymbol.SQUARE
      | typeof FnSymbol.SIGN
      | typeof FnSymbol.TAN
      | typeof FnSymbol.TRUNC;
    1: Num;
  }

  /**
   * @public
   */
  export interface BinaryMathFn extends Array<any> {
    0: typeof FnSymbol.ATN2 | typeof FnSymbol.POWER;
    1: Num;
    2: Num;
  }

  /**
   * @public
   */
  export interface LogMathFn extends Array<any> {
    0: typeof FnSymbol.LOG;
    1: Num;
    2?: Num;
  }

  /**
   * @public
   */
  export interface TypeCheckFn extends Array<any> {
    0:
      | typeof FnSymbol.IS_ARRAY
      | typeof FnSymbol.IS_BOOL
      | typeof FnSymbol.IS_DEFINED
      | typeof FnSymbol.IS_NULL
      | typeof FnSymbol.IS_NUMBER
      | typeof FnSymbol.IS_OBJECT
      | typeof FnSymbol.IS_PRIMITIVE
      | typeof FnSymbol.IS_STRING;
    1: Any;
  }

  /**
   * @public
   */
  export interface BinaryStrFnBool extends Array<any> {
    0:
      | typeof FnSymbol.CONTAINS
      | typeof FnSymbol.ENDSWITH
      | typeof FnSymbol.STARTSWITH;
    1: Str;
    2: Str;
  }

  /**
   * @public
   */
  export interface UnaryStrFnNum extends Array<any> {
    0: typeof FnSymbol.LENGTH;
    1: Str;
  }

  /**
   * @public
   */
  export interface BinaryStrFnNum extends Array<any> {
    0: typeof FnSymbol.INDEX_OF;
    1: Str;
    2: Str;
  }

  /**
   * @public
   */
  export interface UnaryStrFnStr extends Array<any> {
    0:
      | typeof FnSymbol.LOWER
      | typeof FnSymbol.LTRIM
      | typeof FnSymbol.REVERSE
      | typeof FnSymbol.RTRIM
      | typeof FnSymbol.TRIM
      | typeof FnSymbol.UPPER;
    1: Str;
  }

  /**
   * @public
   */
  export interface BinaryStrNumFnStr extends Array<any> {
    0: typeof FnSymbol.LEFT | typeof FnSymbol.REPLICATE | typeof FnSymbol.RIGHT;
    1: Str;
    2: Num;
  }

  /**
   * @public
   */
  export interface TernaryStrFnStr extends Array<any> {
    0: typeof FnSymbol.REPLACE;
    1: Str;
    2: Str;
    3: Str;
  }

  /**
   * @public
   */
  export interface Substring extends Array<any> {
    0: typeof FnSymbol.SUBSTRING;
    1: Str;
    2: Num;
    3: Num;
  }

  /**
   * @public
   */
  export interface ToString extends Array<any> {
    0: typeof FnSymbol.TO_STRING;
    1: Any;
  }

  /**
   * @public
   */
  export interface ArrayConcat extends Array<any> {
    0: typeof FnSymbol.ARRAY_CONCAT;
    1: Arr;
    2: Arr;
    3: Arr[];
  }

  /**
   * @public
   */
  export interface ArrayContains extends Array<any> {
    0: typeof FnSymbol.ARRAY_CONTAINS;
    1: Arr;
    2: Any;
    3?: Bool;
  }

  /**
   * @public
   */
  export interface ArrayLength extends Array<any> {
    0: typeof FnSymbol.ARRAY_LENGTH;
    1: Arr;
  }

  /**
   * @public
   */
  export interface ArraySlice extends Array<any> {
    0: typeof FnSymbol.ARRAY_SLICE;
    1: Arr;
    2: Num;
    3?: Num;
  }

  /**
   * @public
   */
  export interface StDistance extends Array<any> {
    0: typeof FnSymbol.ST_DISTANCE;
    1: Spatial;
    2: Spatial;
  }

  /**
   * @public
   */
  export interface BinarySpatialFnBool extends Array<any> {
    0: typeof FnSymbol.ST_WITHIN | typeof FnSymbol.ST_INTERSECTS;
    1: Spatial;
    2: Spatial;
  }

  /**
   * @public
   */
  export interface StIsValid extends Array<any> {
    0: typeof FnSymbol.ST_ISVALID;
    1: Spatial;
  }

  /**
   * @public
   */
  export interface StIsValidDetailed extends Array<any> {
    0: typeof FnSymbol.ST_ISVALIDDETAILED;
    1: Spatial;
  }

  /**
   * @public
   */
  export type AnyProperty =
    | Property
    | NumericProperty
    | BooleanProperty
    | StringProperty
    | ArrayProperty
    | SpatialProperty
    | ObjectProperty;

  /**
   * @public
   */
  export type Polymorphic = Property | Coalesce | Ternary;

  /**
   * @public
   */
  export type Bool =
    | BinaryLogical
    | UnaryLogical
    | Equality
    | Comparison
    | TypeCheckFn
    | BinaryStrFnBool
    | ArrayContains
    | BinarySpatialFnBool
    | StIsValid
    | In
    | Polymorphic
    | BooleanProperty
    | boolean;

  /**
   * @public
   */
  export type Num =
    | Arithmetic
    | EmptyMathFn
    | UnaryMathFn
    | BinaryMathFn
    | LogMathFn
    | UnaryStrFnNum
    | BinaryStrFnNum
    | ArrayLength
    | StDistance
    | Polymorphic
    | NumericProperty
    | number;

  /**
   * @public
   */
  export type Str =
    | Concat
    | UnaryStrFnStr
    | BinaryStrNumFnStr
    | TernaryStrFnStr
    | Substring
    | ToString
    | Polymorphic
    | StringProperty
    | string;

  /**
   * @public
   */
  export type Arr =
    | ArrayConcat
    | ArraySlice
    | Polymorphic
    | ArrayProperty
    | JSONArray;

  /**
   * @public
   */
  export type Spatial = Polymorphic | SpatialProperty | JSONObject;

  /**
   * @public
   */
  export type Obj =
    | Spatial
    | StIsValidDetailed
    | Polymorphic
    | ObjectProperty
    | JSONObject;

  /**
   * @public
   */
  export type Any =
    | Bool
    | Num
    | Str
    | Arr
    | Spatial
    | Obj
    | Polymorphic
    | JSONValue;

  /**
   * @public
   */
  export type Custom =
    | Property
    | NumericProperty
    | BooleanProperty
    | StringProperty
    | SpatialProperty
    | ArrayProperty
    | ObjectProperty
    | BinaryLogical
    | UnaryLogical
    | Arithmetic
    | Equality
    | Comparison
    | Coalesce
    | Ternary
    | Concat
    | EmptyMathFn
    | UnaryMathFn
    | BinaryMathFn
    | LogMathFn
    | TypeCheckFn
    | BinaryStrFnBool
    | UnaryStrFnNum
    | BinaryStrFnNum
    | UnaryStrFnStr
    | BinaryStrNumFnStr
    | TernaryStrFnStr
    | Substring
    | ToString
    | ArrayConcat
    | ArrayContains
    | ArrayLength
    | ArraySlice
    | StDistance
    | BinarySpatialFnBool
    | StIsValid
    | StIsValidDetailed
    | In;

  /**
   * @public
   */
  export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONObject
    | JSONArray;

  /**
   * @public
   */
  export interface JSONObject {
    [x: string]: JSONValue;
  }

  /**
   * @public
   */
  export interface JSONArray extends Array<JSONValue> {}
}

export default QueryType;
