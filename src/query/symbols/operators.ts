/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// Logical operators

/**
 * @public
 */
namespace OpSymbol {
  /**
   * @public
   */
  export const AND = Symbol('AND');

  /**
   * @public
   */
  export const OR = Symbol('OR');

  /**
   * @public
   */
  export const NOT = Symbol('NOT');

  // Mathematical operators

  /**
   * @public
   */
  export const ADD = Symbol('+');

  /**
   * @public
   */
  export const SUBTRACT = Symbol('-');

  /**
   * @public
   */
  export const MULTIPLY = Symbol('*');

  /**
   * @public
   */
  export const DIVIDE = Symbol('/');

  /**
   * @public
   */
  export const MODULO = Symbol('%');

  // Bitwise operators

  /**
   * @public
   */
  export const BITWISE_OR = Symbol('|');

  /**
   * @public
   */
  export const BITWISE_AND = Symbol('&');

  /**
   * @public
   */
  export const XOR = Symbol('^');

  /**
   * @public
   */
  export const LEFT_SHIFT = Symbol('<<');

  /**
   * @public
   */
  export const RIGHT_SHIFT = Symbol('>>');

  /**
   * @public
   */
  export const ZF_RIGHT_SHIFT = Symbol('>>>');

  // Comparison operators

  /**
   * @public
   */
  export const EQUAL = Symbol('=');

  /**
   * @public
   */
  export const NOT_EQUAL = Symbol('<>');

  /**
   * @public
   */
  export const GREATER_THAN = Symbol('>');

  /**
   * @public
   */
  export const GREATER_THAN_OR_EQUAL = Symbol('>=');

  /**
   * @public
   */
  export const LESS_THAN = Symbol('<');

  /**
   * @public
   */
  export const LESS_THAN_OR_EQUAL = Symbol('<=');

  /**
   * @public
   */
  export const COALESCE = Symbol('??');

  // String operators

  /**
   * @public
   */
  export const CONCATENATE = Symbol('||');

  // Ternary operators

  /**
   * @public
   */
  export const TERNARY = Symbol('?');

  // Miscellaneous operators

  /**
   * @public
   */
  export const IN = Symbol('IN');

  /**
   * @internal
   */
  export function getOp(
    sym: Exclude<OpSymbol, typeof OpSymbol.TERNARY>
  ): string {
    switch (sym) {
      // Logical operators
      case AND:
        return 'AND';
      case OR:
        return 'OR';
      case NOT:
        return 'NOT';

      // Mathematical operators
      case ADD:
        return '+';
      case SUBTRACT:
        return '-';
      case MULTIPLY:
        return '*';
      case DIVIDE:
        return '/';
      case MODULO:
        return '%';

      // Bitwise operators
      case BITWISE_OR:
        return '|';
      case BITWISE_AND:
        return '&';
      case XOR:
        return '^';
      case LEFT_SHIFT:
        return '<<';
      case RIGHT_SHIFT:
        return '>>';
      case ZF_RIGHT_SHIFT:
        return '>>>';

      // Comparison operators
      case EQUAL:
        return '=';
      case NOT_EQUAL:
        return '<>';
      case GREATER_THAN:
        return '>';
      case GREATER_THAN_OR_EQUAL:
        return '>=';
      case LESS_THAN:
        return '<';
      case LESS_THAN_OR_EQUAL:
        return '<=';
      case COALESCE:
        return '??';

      // String operators
      case CONCATENATE:
        return '||';

      // Miscellaneous operators
      case IN:
        return 'IN';
    }
  }
}

/**
 * @public
 */
type OpSymbol =
  | typeof OpSymbol.AND
  | typeof OpSymbol.OR
  | typeof OpSymbol.NOT
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
  | typeof OpSymbol.ZF_RIGHT_SHIFT
  | typeof OpSymbol.EQUAL
  | typeof OpSymbol.NOT_EQUAL
  | typeof OpSymbol.GREATER_THAN
  | typeof OpSymbol.GREATER_THAN_OR_EQUAL
  | typeof OpSymbol.LESS_THAN
  | typeof OpSymbol.LESS_THAN_OR_EQUAL
  | typeof OpSymbol.COALESCE
  | typeof OpSymbol.CONCATENATE
  | typeof OpSymbol.TERNARY
  | typeof OpSymbol.IN;

export default OpSymbol;
