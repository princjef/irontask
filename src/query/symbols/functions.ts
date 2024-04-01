/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// Mathematical functions

/**
 * @public
 */
// tslint:disable:naming-convention
namespace FnSymbol {
  /**
   * @public
   */
  export const ABS = Symbol('ABS');

  /**
   * @public
   */
  export const ACOS = Symbol('ACOS');

  /**
   * @public
   */
  export const ASIN = Symbol('ASIN');

  /**
   * @public
   */
  export const ATAN = Symbol('ATAN');

  /**
   * @public
   */
  export const ATN2 = Symbol('ATN2');

  /**
   * @public
   */
  export const CEILING = Symbol('CEILING');

  /**
   * @public
   */
  export const COS = Symbol('COS');

  /**
   * @public
   */
  export const COT = Symbol('COT');

  /**
   * @public
   */
  export const DEGREES = Symbol('DEGREES');

  /**
   * @public
   */
  export const EXP = Symbol('EXP');

  /**
   * @public
   */
  export const FLOOR = Symbol('FLOOR');

  /**
   * @public
   */
  export const LOG = Symbol('LOG');

  /**
   * @public
   */
  export const LOG10 = Symbol('LOG10');

  /**
   * @public
   */
  export const PI = Symbol('PI');

  /**
   * @public
   */
  export const POWER = Symbol('POWER');

  /**
   * @public
   */
  export const RADIANS = Symbol('RADIANS');

  /**
   * @public
   */
  export const ROUND = Symbol('ROUND');

  /**
   * @public
   */
  export const SIN = Symbol('SIN');

  /**
   * @public
   */
  export const SQRT = Symbol('SQRT');

  /**
   * @public
   */
  export const SQUARE = Symbol('SQUARE');

  /**
   * @public
   */
  export const SIGN = Symbol('SIGN');

  /**
   * @public
   */
  export const TAN = Symbol('TAN');

  /**
   * @public
   */
  export const TRUNC = Symbol('TRUNC');

  // Type-checking functions

  /**
   * @public
   */
  export const IS_ARRAY = Symbol('IS_ARRAY');

  /**
   * @public
   */
  export const IS_BOOL = Symbol('IS_BOOL');

  /**
   * @public
   */
  export const IS_DEFINED = Symbol('IS_DEFINED');

  /**
   * @public
   */
  export const IS_NULL = Symbol('IS_NULL');

  /**
   * @public
   */
  export const IS_NUMBER = Symbol('IS_NUMBER');

  /**
   * @public
   */
  export const IS_OBJECT = Symbol('IS_OBJECT');

  /**
   * @public
   */
  export const IS_PRIMITIVE = Symbol('IS_PRIMITIVE');

  /**
   * @public
   */
  export const IS_STRING = Symbol('IS_STRING');

  /**
   * @public
   */
  // String functions

  /**
   * @public
   */
  export const CONTAINS = Symbol('CONTAINS');

  /**
   * @public
   */
  export const ENDSWITH = Symbol('ENDSWITH');

  /**
   * @public
   */
  export const INDEX_OF = Symbol('INDEX_OF');

  /**
   * @public
   */
  export const LEFT = Symbol('LEFT');

  /**
   * @public
   */
  export const LENGTH = Symbol('LENGTH');

  /**
   * @public
   */
  export const LOWER = Symbol('LOWER');

  /**
   * @public
   */
  export const LTRIM = Symbol('LTRIM');

  /**
   * @public
   */
  export const REPLACE = Symbol('REPLACE');

  /**
   * @public
   */
  export const REPLICATE = Symbol('REPLICATE');

  /**
   * @public
   */
  export const REVERSE = Symbol('REVERSE');

  /**
   * @public
   */
  export const RIGHT = Symbol('RIGHT');

  /**
   * @public
   */
  export const RTRIM = Symbol('RTRIM');

  /**
   * @public
   */
  export const STARTSWITH = Symbol('STARTSWITH');

  /**
   * @public
   */
  export const SUBSTRING = Symbol('SUBSTRING');

  /**
   * @public
   */
  export const TO_STRING = Symbol('ToString');

  /**
   * @public
   */
  export const TRIM = Symbol('TRIM');

  /**
   * @public
   */
  export const UPPER = Symbol('UPPER');

  // Array functions

  /**
   * @public
   */
  export const ARRAY_CONCAT = Symbol('ARRAY_CONCAT');

  /**
   * @public
   */
  export const ARRAY_CONTAINS = Symbol('ARRAY_CONTAINS');

  /**
   * @public
   */
  export const ARRAY_LENGTH = Symbol('ARRAY_LENGTH');

  /**
   * @public
   */
  export const ARRAY_SLICE = Symbol('ARRAY_SLICE');

  // Spatial functions

  /**
   * @public
   */
  export const ST_DISTANCE = Symbol('ST_DISTANCE');

  /**
   * @public
   */
  export const ST_WITHIN = Symbol('ST_WITHIN');

  /**
   * @public
   */
  export const ST_INTERSECTS = Symbol('ST_INTERSECTS');

  /**
   * @public
   */
  export const ST_ISVALID = Symbol('ST_ISVALID');

  /**
   * @public
   */
  export const ST_ISVALIDDETAILED = Symbol('ST_ISVALIDDETAILED');

  /**
   * @internal
   */
  export function getName(sym: FnSymbol): string {
    switch (sym) {
      case ABS:
        return 'ABS';
      case ACOS:
        return 'ACOS';
      case ASIN:
        return 'ASIN';
      case ATAN:
        return 'ATAN';
      case ATN2:
        return 'ATN2';
      case CEILING:
        return 'CEILING';
      case COS:
        return 'COS';
      case COT:
        return 'COT';
      case DEGREES:
        return 'DEGREES';
      case EXP:
        return 'EXP';
      case FLOOR:
        return 'FLOOR';
      case LOG:
        return 'LOG';
      case LOG10:
        return 'LOG10';
      case PI:
        return 'PI';
      case POWER:
        return 'POWER';
      case RADIANS:
        return 'RADIANS';
      case ROUND:
        return 'ROUND';
      case SIN:
        return 'SIN';
      case SQRT:
        return 'SQRT';
      case SQUARE:
        return 'SQUARE';
      case SIGN:
        return 'SIGN';
      case TAN:
        return 'TAN';
      case TRUNC:
        return 'TRUNC';

      // Type-checking functions
      case IS_ARRAY:
        return 'IS_ARRAY';
      case IS_BOOL:
        return 'IS_BOOL';
      case IS_DEFINED:
        return 'IS_DEFINED';
      case IS_NULL:
        return 'IS_NULL';
      case IS_NUMBER:
        return 'IS_NUMBER';
      case IS_OBJECT:
        return 'IS_OBJECT';
      case IS_PRIMITIVE:
        return 'IS_PRIMITIVE';
      case IS_STRING:
        return 'IS_STRING';

      // String functions
      case CONTAINS:
        return 'CONTAINS';
      case ENDSWITH:
        return 'ENDSWITH';
      case INDEX_OF:
        return 'INDEX_OF';
      case LEFT:
        return 'LEFT';
      case LENGTH:
        return 'LENGTH';
      case LOWER:
        return 'LOWER';
      case LTRIM:
        return 'LTRIM';
      case REPLACE:
        return 'REPLACE';
      case REPLICATE:
        return 'REPLICATE';
      case REVERSE:
        return 'REVERSE';
      case RIGHT:
        return 'RIGHT';
      case RTRIM:
        return 'RTRIM';
      case STARTSWITH:
        return 'STARTSWITH';
      case SUBSTRING:
        return 'SUBSTRING';
      case TO_STRING:
        return 'ToString';
      case TRIM:
        return 'TRIM';
      case UPPER:
        return 'UPPER';

      // Array functions
      case ARRAY_CONCAT:
        return 'ARRAY_CONCAT';
      case ARRAY_CONTAINS:
        return 'ARRAY_CONTAINS';
      case ARRAY_LENGTH:
        return 'ARRAY_LENGTH';
      case ARRAY_SLICE:
        return 'ARRAY_SLICE';

      // Spatial functions
      case ST_DISTANCE:
        return 'ST_DISTANCE';
      case ST_WITHIN:
        return 'ST_WITHIN';
      case ST_INTERSECTS:
        return 'ST_INTERSECTS';
      case ST_ISVALID:
        return 'ST_ISVALID';
      case ST_ISVALIDDETAILED:
        return 'ST_ISVALIDDETAILED';
    }
  }
}

/**
 * @public
 */
type FnSymbol =
  | typeof FnSymbol.ABS
  | typeof FnSymbol.ACOS
  | typeof FnSymbol.ASIN
  | typeof FnSymbol.ATAN
  | typeof FnSymbol.ATN2
  | typeof FnSymbol.CEILING
  | typeof FnSymbol.COS
  | typeof FnSymbol.COT
  | typeof FnSymbol.DEGREES
  | typeof FnSymbol.EXP
  | typeof FnSymbol.FLOOR
  | typeof FnSymbol.LOG
  | typeof FnSymbol.LOG10
  | typeof FnSymbol.PI
  | typeof FnSymbol.POWER
  | typeof FnSymbol.RADIANS
  | typeof FnSymbol.ROUND
  | typeof FnSymbol.SIN
  | typeof FnSymbol.SQRT
  | typeof FnSymbol.SQUARE
  | typeof FnSymbol.SIGN
  | typeof FnSymbol.TAN
  | typeof FnSymbol.TRUNC
  | typeof FnSymbol.IS_ARRAY
  | typeof FnSymbol.IS_BOOL
  | typeof FnSymbol.IS_DEFINED
  | typeof FnSymbol.IS_NULL
  | typeof FnSymbol.IS_NUMBER
  | typeof FnSymbol.IS_OBJECT
  | typeof FnSymbol.IS_PRIMITIVE
  | typeof FnSymbol.IS_STRING
  | typeof FnSymbol.CONTAINS
  | typeof FnSymbol.ENDSWITH
  | typeof FnSymbol.INDEX_OF
  | typeof FnSymbol.LEFT
  | typeof FnSymbol.LENGTH
  | typeof FnSymbol.LOWER
  | typeof FnSymbol.LTRIM
  | typeof FnSymbol.REPLACE
  | typeof FnSymbol.REPLICATE
  | typeof FnSymbol.REVERSE
  | typeof FnSymbol.RIGHT
  | typeof FnSymbol.RTRIM
  | typeof FnSymbol.STARTSWITH
  | typeof FnSymbol.SUBSTRING
  | typeof FnSymbol.TO_STRING
  | typeof FnSymbol.TRIM
  | typeof FnSymbol.UPPER
  | typeof FnSymbol.ARRAY_CONCAT
  | typeof FnSymbol.ARRAY_CONTAINS
  | typeof FnSymbol.ARRAY_LENGTH
  | typeof FnSymbol.ARRAY_SLICE
  | typeof FnSymbol.ST_DISTANCE
  | typeof FnSymbol.ST_WITHIN
  | typeof FnSymbol.ST_INTERSECTS
  | typeof FnSymbol.ST_ISVALID
  | typeof FnSymbol.ST_ISVALIDDETAILED;

export default FnSymbol;
