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

import { SqlParameter, SqlQuerySpec } from '@azure/cosmos';

import { FnSymbol, OpSymbol, PropSymbol } from '../symbols';
import Type from '../types';

/**
 * Convert a query expression into a query fragment.
 *
 * @param expression    The expression to serialize
 * @param paramIndex    Next available index to use for parameters (default: 0)
 */
export default function serializeExpression(
  expression: Type.Any,
  paramIndex: number = 0,
  isProjection: boolean = false
): Required<SqlQuerySpec> {
  if (isCustom(expression)) {
    // This is one of our custom expressions. Process it
    switch (expression[0]) {
      case PropSymbol.ANY:
      case PropSymbol.NUMERIC:
      case PropSymbol.BOOLEAN:
      case PropSymbol.STRING:
      case PropSymbol.SPATIAL:
      case PropSymbol.OBJECT:
      case PropSymbol.ARRAY:
        return serializers.property(expression, paramIndex, isProjection);

      case OpSymbol.AND:
      case OpSymbol.OR:
        return serializers.binaryLogical(expression, paramIndex, isProjection);

      case OpSymbol.NOT:
        return serializers.unaryLogical(expression, paramIndex, isProjection);

      case OpSymbol.ADD:
      case OpSymbol.SUBTRACT:
      case OpSymbol.MULTIPLY:
      case OpSymbol.DIVIDE:
      case OpSymbol.MODULO:
      case OpSymbol.BITWISE_AND:
      case OpSymbol.BITWISE_OR:
      case OpSymbol.XOR:
      case OpSymbol.LEFT_SHIFT:
      case OpSymbol.RIGHT_SHIFT:
      case OpSymbol.ZF_RIGHT_SHIFT:
      case OpSymbol.EQUAL:
      case OpSymbol.NOT_EQUAL:
      case OpSymbol.GREATER_THAN:
      case OpSymbol.GREATER_THAN_OR_EQUAL:
      case OpSymbol.LESS_THAN:
      case OpSymbol.LESS_THAN_OR_EQUAL:
      case OpSymbol.COALESCE:
        return serializers.binaryOperator(expression, paramIndex, isProjection);

      case OpSymbol.CONCATENATE:
        return serializers.concat(expression, paramIndex, isProjection);

      case OpSymbol.TERNARY:
        return serializers.ternaryOperator(
          expression,
          paramIndex,
          isProjection
        );

      case OpSymbol.IN:
        return serializers.inOp(expression, paramIndex, isProjection);

      case FnSymbol.PI:
        return serializers.pi(expression, paramIndex, isProjection);

      case FnSymbol.ABS:
      case FnSymbol.ACOS:
      case FnSymbol.ASIN:
      case FnSymbol.ATAN:
      case FnSymbol.CEILING:
      case FnSymbol.COS:
      case FnSymbol.COT:
      case FnSymbol.DEGREES:
      case FnSymbol.EXP:
      case FnSymbol.FLOOR:
      case FnSymbol.LOG10:
      case FnSymbol.RADIANS:
      case FnSymbol.ROUND:
      case FnSymbol.SIN:
      case FnSymbol.SQRT:
      case FnSymbol.SQUARE:
      case FnSymbol.SIGN:
      case FnSymbol.TAN:
      case FnSymbol.TRUNC:
      case FnSymbol.IS_ARRAY:
      case FnSymbol.IS_BOOL:
      case FnSymbol.IS_DEFINED:
      case FnSymbol.IS_NULL:
      case FnSymbol.IS_NUMBER:
      case FnSymbol.IS_OBJECT:
      case FnSymbol.IS_PRIMITIVE:
      case FnSymbol.IS_STRING:
      case FnSymbol.LENGTH:
      case FnSymbol.LOWER:
      case FnSymbol.LTRIM:
      case FnSymbol.REVERSE:
      case FnSymbol.RTRIM:
      case FnSymbol.TRIM:
      case FnSymbol.UPPER:
      case FnSymbol.TO_STRING:
      case FnSymbol.ARRAY_LENGTH:
      case FnSymbol.ST_ISVALID:
      case FnSymbol.ST_ISVALIDDETAILED:
        return serializers.unaryFn(expression, paramIndex, isProjection);

      case FnSymbol.ATN2:
      case FnSymbol.LOG:
      case FnSymbol.POWER:
      case FnSymbol.CONTAINS:
      case FnSymbol.ENDSWITH:
      case FnSymbol.STARTSWITH:
      case FnSymbol.INDEX_OF:
      case FnSymbol.LEFT:
      case FnSymbol.REPLICATE:
      case FnSymbol.RIGHT:
      case FnSymbol.ST_DISTANCE:
      case FnSymbol.ST_WITHIN:
      case FnSymbol.ST_INTERSECTS:
        return serializers.binaryFn(expression, paramIndex, isProjection);

      case FnSymbol.REPLACE:
      case FnSymbol.SUBSTRING:
      case FnSymbol.ARRAY_CONTAINS:
      case FnSymbol.ARRAY_SLICE:
        return serializers.ternaryFn(expression, paramIndex, isProjection);

      case FnSymbol.ARRAY_CONCAT:
        return serializers.arrayConcat(expression, paramIndex, isProjection);

      default:
        throw new TypeError('Unrecognized Cosmos DB SQL query builder');
    }
  }
  {
    // This means we have a value rather than a SQL expression. Simply throw
    // the value in the next available param
    const param = `@p${paramIndex}`;

    return {
      query: param,
      parameters: [
        {
          name: param,
          // TODO: The Cosmos DB docs and runtime behavior suggest that
          // all JSON types are allowed, but the library only lists
          // primitive types in its Typescript declarations:
          //
          //   https://github.com/Azure/azure-cosmos-js/issues/233
          //
          value: expression as any
        }
      ]
    };
  }
}

namespace serializers {
  export function property(
    expr: Type.AnyProperty,
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    const [, first, rest] = expr;
    const propsStr = [first, ...rest]
      .map((prop, index) => {
        if (index === 0 && typeof prop !== 'string') {
          throw new TypeError(
            'Cosmos DB property paths must begin with a string'
          );
        }

        if (typeof prop !== 'string' && typeof prop !== 'number') {
          throw new TypeError(
            'Cosmos DB property names must be strings or numbers'
          );
        }

        // We just JSON.stringify() the property once to get the string
        // form for numbers or the quoted string for strings
        return `[${JSON.stringify(prop)}]`;
      })
      .join('');

    // _ts is a special snowflake that we have to deal with because its time is
    // represented in seconds, not milliseconds. As a result, if we find that
    // the property is _ts, we multiply it by 1000 for use in expressions, but
    // not projections.
    if (!isProjection && propsStr === '["_ts"]') {
      return {
        query: `(c${propsStr} * 1000)`,
        parameters: []
      };
    }

    return {
      query: `c${propsStr}`,
      parameters: []
    };
  }

  export function binaryLogical(
    expr: Type.BinaryLogical,
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    const [sym, expressions] = expr;
    return op(sym, expressions, paramIndex, isProjection);
  }

  export function unaryLogical(
    expr: Type.UnaryLogical,
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    const [, expression] = expr;
    let runningParamIndex = paramIndex;
    const { query, parameters } = serializeExpression(
      expression as Type.Any,
      runningParamIndex,
      isProjection
    );
    runningParamIndex += parameters.length;
    return {
      query: `(${OpSymbol.getOp(expr[0])} ${query})`,
      parameters
    };
  }

  export function binaryOperator(
    expr: Type.Arithmetic | Type.Equality | Type.Comparison | Type.Coalesce,
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    const [sym, left, right] = expr;
    return op(sym, [left, right], paramIndex, isProjection);
  }

  export function ternaryOperator(
    expr: Type.Ternary,
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    const [, test, first, second] = expr;
    let runningParamIndex = paramIndex;

    const { query: testQuery, parameters: testParams } = serializeExpression(
      test,
      runningParamIndex,
      isProjection
    );
    runningParamIndex += testParams.length;

    const { query: firstQuery, parameters: firstParams } = serializeExpression(
      first,
      runningParamIndex,
      isProjection
    );
    runningParamIndex += firstParams.length;

    const {
      query: secondQuery,
      parameters: secondParams
    } = serializeExpression(second, runningParamIndex, isProjection);
    runningParamIndex += secondParams.length;

    return {
      query: `(${testQuery} ? ${firstQuery} : ${secondQuery})`,
      parameters: [...testParams, ...firstParams, ...secondParams]
    };
  }

  export function inOp(
    expr: Type.In,
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    const [, value, candidates] = expr;
    let runningParamIndex = paramIndex;

    const { query: valueQuery, parameters: valueParams } = serializeExpression(
      value,
      runningParamIndex,
      isProjection
    );
    runningParamIndex += valueParams.length;

    const { subqueries, parameters } = candidates
      .filter(expr => expr !== undefined)
      .map(expr => {
        const result = serializeExpression(
          expr,
          runningParamIndex,
          isProjection
        );
        runningParamIndex += result.parameters.length;
        return result;
      })
      .reduce(mergeSubqueries, { subqueries: [], parameters: [] });

    return {
      query: `(${valueQuery} ${OpSymbol.getOp(expr[0])} (${subqueries.join(
        ', '
      )}))`,
      parameters: [...valueParams, ...parameters]
    };
  }

  export function concat(
    expr: Type.Concat,
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    const [, first, second, rest] = expr;
    return op(expr[0], [first, second, ...rest], paramIndex, isProjection);
  }

  export function pi(
    expr: Type.EmptyMathFn,
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    return fn(expr[0], [], paramIndex, isProjection);
  }

  export function unaryFn(
    expr:
      | Type.UnaryMathFn
      | Type.TypeCheckFn
      | Type.UnaryStrFnNum
      | Type.UnaryStrFnStr
      | Type.ToString
      | Type.ArrayLength
      | Type.StIsValid
      | Type.StIsValidDetailed,
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    const [sym, expression] = expr;
    return fn(sym, [expression], paramIndex, isProjection);
  }

  export function binaryFn(
    expression:
      | Type.BinaryMathFn
      | Type.BinaryStrFnBool
      | Type.BinaryStrFnNum
      | Type.BinaryStrNumFnStr
      | Type.StDistance
      | Type.BinarySpatialFnBool
      | Type.LogMathFn,
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    const [sym, first, second] = expression;
    return fn(sym, [first, second], paramIndex, isProjection);
  }

  export function ternaryFn(
    expression:
      | Type.TernaryStrFnStr
      | Type.Substring
      | Type.ArrayContains
      | Type.ArraySlice,
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    const [sym, first, second, third] = expression;
    return fn(sym, [first, second, third], paramIndex, isProjection);
  }

  export function arrayConcat(
    expression: Type.ArrayConcat,
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    const [, first, second, rest] = expression;
    return fn(
      expression[0],
      [first, second, ...rest],
      paramIndex,
      isProjection
    );
  }

  function op(
    sym: Exclude<OpSymbol, typeof OpSymbol.TERNARY>,
    expressions: Type.Any[],
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    let runningParamIndex = paramIndex;
    const { subqueries, parameters } = expressions
      .filter(expr => expr !== undefined)
      .map(expr => {
        const result = serializeExpression(
          expr,
          runningParamIndex,
          isProjection
        );
        runningParamIndex += result.parameters.length;
        return result;
      })
      .reduce(mergeSubqueries, { subqueries: [], parameters: [] });
    return {
      query: `(${subqueries.join(` ${OpSymbol.getOp(sym)} `)})`,
      parameters
    };
  }

  function fn(
    sym: FnSymbol,
    expressions: (Type.Any | undefined)[],
    paramIndex: number,
    isProjection: boolean
  ): Required<SqlQuerySpec> {
    let runningParamIndex = paramIndex;
    const { subqueries, parameters } = expressions
      .filter(expr => expr !== undefined)
      .map(expr => {
        const result = serializeExpression(expr as Type.Any, runningParamIndex);
        runningParamIndex += result.parameters.length;
        return result;
      })
      .reduce(mergeSubqueries, { subqueries: [], parameters: [] });
    return {
      query: `${FnSymbol.getName(sym)}(${subqueries.join(', ')})`,
      parameters
    };
  }
}

function isCustom(expression: Type.Any): expression is Type.Custom {
  return (
    Array.isArray(expression) &&
    expression.length >= 1 &&
    typeof expression[0] === 'symbol'
  );
}

function mergeSubqueries(
  acc: MergedQueries,
  val: Required<SqlQuerySpec>
): MergedQueries {
  return {
    subqueries: [...acc.subqueries, val.query],
    parameters: [...acc.parameters, ...val.parameters]
  };
}

interface MergedQueries {
  subqueries: string[];
  parameters: SqlParameter[];
}
