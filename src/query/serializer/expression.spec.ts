/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { p, q } from '../builder';
import Type from '../types';

import serializeExpression from './expression';

describe('#serializeExpression', () => {
  describe('operators', () => {
    testSimpleQuery(
      'AND - 2 operands',
      q.and(p.base('a'), p.base('b')),
      '(c["a"] AND c["b"])'
    );

    testSimpleQuery(
      'AND - 3+ operands',
      q.and(p.base('a'), p.base('b'), p.base('c')),
      '(c["a"] AND c["b"] AND c["c"])'
    );

    testSimpleQuery(
      'OR - 2 operands',
      q.or(p.base('a'), p.base('b')),
      '(c["a"] OR c["b"])'
    );

    testSimpleQuery(
      'OR - 3+ operands',
      q.or(p.base('a'), p.base('b'), p.base('c')),
      '(c["a"] OR c["b"] OR c["c"])'
    );

    testSimpleQuery('NOT', q.not(p.base('a')), '(NOT c["a"])');

    testSimpleQuery('+', q.add(p.base('a'), p.base('b')), '(c["a"] + c["b"])');
    testSimpleQuery(
      '-',
      q.subtract(p.base('a'), p.base('b')),
      '(c["a"] - c["b"])'
    );
    testSimpleQuery(
      '*',
      q.multiply(p.base('a'), p.base('b')),
      '(c["a"] * c["b"])'
    );
    testSimpleQuery(
      '/',
      q.divide(p.base('a'), p.base('b')),
      '(c["a"] / c["b"])'
    );
    testSimpleQuery(
      '%',
      q.modulo(p.base('a'), p.base('b')),
      '(c["a"] % c["b"])'
    );

    testSimpleQuery(
      '&',
      q.bitwiseAnd(p.base('a'), p.base('b')),
      '(c["a"] & c["b"])'
    );
    testSimpleQuery(
      '|',
      q.bitwiseOr(p.base('a'), p.base('b')),
      '(c["a"] | c["b"])'
    );
    testSimpleQuery('^', q.xor(p.base('a'), p.base('b')), '(c["a"] ^ c["b"])');
    testSimpleQuery(
      '<<',
      q.leftShift(p.base('a'), p.base('b')),
      '(c["a"] << c["b"])'
    );
    testSimpleQuery(
      '>>',
      q.rightShift(p.base('a'), p.base('b')),
      '(c["a"] >> c["b"])'
    );
    testSimpleQuery(
      '>>>',
      q.zeroFillRightShift(p.base('a'), p.base('b')),
      '(c["a"] >>> c["b"])'
    );

    testSimpleQuery(
      '=',
      q.equal(p.base('a'), p.base('b')),
      '(c["a"] = c["b"])'
    );
    testSimpleQuery(
      '<>',
      q.notEqual(p.base('a'), p.base('b')),
      '(c["a"] <> c["b"])'
    );

    testSimpleQuery(
      '>',
      q.greaterThan(p.base('a'), p.base('b')),
      '(c["a"] > c["b"])'
    );
    testSimpleQuery(
      '>=',
      q.greaterThanOrEqual(p.base('a'), p.base('b')),
      '(c["a"] >= c["b"])'
    );
    testSimpleQuery(
      '<',
      q.lessThan(p.base('a'), p.base('b')),
      '(c["a"] < c["b"])'
    );
    testSimpleQuery(
      '<=',
      q.lessThanOrEqual(p.base('a'), p.base('b')),
      '(c["a"] <= c["b"])'
    );

    testSimpleQuery(
      'coalesce (??)',
      q.coalesce(p.base('a'), p.base('b')),
      '(c["a"] ?? c["b"])'
    );
    testSimpleQuery(
      'concat (||)',
      q.concat(p.base('a'), p.base('b')),
      '(c["a"] || c["b"])'
    );

    testSimpleQuery(
      'ternary (?:)',
      q.ternary(p.base('a'), p.base('b'), p.base('c')),
      '(c["a"] ? c["b"] : c["c"])'
    );

    testSimpleQuery(
      'IN',
      q.inOp(p.base('a'), [p.base('b'), p.base('c')]),
      '(c["a"] IN (c["b"], c["c"]))'
    );
  });

  describe('functions', () => {
    testSimpleQuery('ABS', q.abs(p.base('a')), 'ABS(c["a"])');
    testSimpleQuery('ACOS', q.acos(p.base('a')), 'ACOS(c["a"])');
    testSimpleQuery('ASIN', q.asin(p.base('a')), 'ASIN(c["a"])');
    testSimpleQuery('ATAN', q.atan(p.base('a')), 'ATAN(c["a"])');
    testSimpleQuery(
      'ATN2',
      q.atn2(p.base('a'), p.base('b')),
      'ATN2(c["a"], c["b"])'
    );
    testSimpleQuery('CEILING', q.ceiling(p.base('a')), 'CEILING(c["a"])');
    testSimpleQuery('COS', q.cos(p.base('a')), 'COS(c["a"])');
    testSimpleQuery('COT', q.cot(p.base('a')), 'COT(c["a"])');
    testSimpleQuery('DEGREES', q.degrees(p.base('a')), 'DEGREES(c["a"])');
    testSimpleQuery('EXP', q.exp(p.base('a')), 'EXP(c["a"])');
    testSimpleQuery('FLOOR', q.floor(p.base('a')), 'FLOOR(c["a"])');
    testSimpleQuery('LOG', q.log(p.base('a')), 'LOG(c["a"])');
    testSimpleQuery(
      'LOG - with base',
      q.log(p.base('a'), p.base('b')),
      'LOG(c["a"], c["b"])'
    );
    testSimpleQuery('LOG10', q.log10(p.base('a')), 'LOG10(c["a"])');
    testSimpleQuery('PI', q.pi(), 'PI()');
    testSimpleQuery(
      'POWER',
      q.power(p.base('a'), p.base('b')),
      'POWER(c["a"], c["b"])'
    );
    testSimpleQuery('RADIANS', q.radians(p.base('a')), 'RADIANS(c["a"])');
    testSimpleQuery('ROUND', q.round(p.base('a')), 'ROUND(c["a"])');
    testSimpleQuery('SIN', q.sin(p.base('a')), 'SIN(c["a"])');
    testSimpleQuery('SQRT', q.sqrt(p.base('a')), 'SQRT(c["a"])');
    testSimpleQuery('SQUARE', q.square(p.base('a')), 'SQUARE(c["a"])');
    testSimpleQuery('SIGN', q.sign(p.base('a')), 'SIGN(c["a"])');
    testSimpleQuery('TAN', q.tan(p.base('a')), 'TAN(c["a"])');
    testSimpleQuery('TRUNC', q.trunc(p.base('a')), 'TRUNC(c["a"])');

    testSimpleQuery('IS_ARRAY', q.isArray(p.base('a')), 'IS_ARRAY(c["a"])');
    testSimpleQuery('IS_BOOL', q.isBool(p.base('a')), 'IS_BOOL(c["a"])');
    testSimpleQuery(
      'IS_DEFINED',
      q.isDefined(p.base('a')),
      'IS_DEFINED(c["a"])'
    );
    testSimpleQuery('IS_NULL', q.isNull(p.base('a')), 'IS_NULL(c["a"])');
    testSimpleQuery('IS_NUMBER', q.isNumber(p.base('a')), 'IS_NUMBER(c["a"])');
    testSimpleQuery('IS_OBJECT', q.isObject(p.base('a')), 'IS_OBJECT(c["a"])');
    testSimpleQuery(
      'IS_PRIMITIVE',
      q.isPrimitive(p.base('a')),
      'IS_PRIMITIVE(c["a"])'
    );
    testSimpleQuery('IS_STRING', q.isString(p.base('a')), 'IS_STRING(c["a"])');

    testSimpleQuery(
      'CONTAINS',
      q.contains(p.base('a'), p.base('b')),
      'CONTAINS(c["a"], c["b"])'
    );
    testSimpleQuery(
      'ENDSWITH',
      q.endsWith(p.base('a'), p.base('b')),
      'ENDSWITH(c["a"], c["b"])'
    );
    testSimpleQuery(
      'INDEX_OF',
      q.indexOf(p.base('a'), p.base('b')),
      'INDEX_OF(c["a"], c["b"])'
    );
    testSimpleQuery(
      'LEFT',
      q.left(p.base('a'), p.base('b')),
      'LEFT(c["a"], c["b"])'
    );
    testSimpleQuery('LENGTH', q.length(p.base('a')), 'LENGTH(c["a"])');
    testSimpleQuery('LOWER', q.lower(p.base('a')), 'LOWER(c["a"])');
    testSimpleQuery('LTRIM', q.ltrim(p.base('a')), 'LTRIM(c["a"])');
    testSimpleQuery(
      'REPLACE',
      q.replace(p.base('a'), p.base('b'), p.base('c')),
      'REPLACE(c["a"], c["b"], c["c"])'
    );
    testSimpleQuery(
      'REPLICATE',
      q.replicate(p.base('a'), p.base('b')),
      'REPLICATE(c["a"], c["b"])'
    );
    testSimpleQuery('REVERSE', q.reverse(p.base('a')), 'REVERSE(c["a"])');
    testSimpleQuery(
      'RIGHT',
      q.right(p.base('a'), p.base('b')),
      'RIGHT(c["a"], c["b"])'
    );
    testSimpleQuery('RTRIM', q.rtrim(p.base('a')), 'RTRIM(c["a"])');
    testSimpleQuery(
      'STARTSWITH',
      q.startsWith(p.base('a'), p.base('b')),
      'STARTSWITH(c["a"], c["b"])'
    );
    testSimpleQuery(
      'SUBSTRING',
      q.substring(p.base('a'), p.base('b'), p.base('c')),
      'SUBSTRING(c["a"], c["b"], c["c"])'
    );
    testSimpleQuery('ToString', q.toString(p.base('a')), 'ToString(c["a"])');
    testSimpleQuery('TRIM', q.trim(p.base('a')), 'TRIM(c["a"])');
    testSimpleQuery('UPPER', q.upper(p.base('a')), 'UPPER(c["a"])');

    testSimpleQuery(
      'ARRAY_CONCAT',
      q.arrayConcat(p.base('a'), p.base('b')),
      'ARRAY_CONCAT(c["a"], c["b"])'
    );
    testSimpleQuery(
      'ARRAY_CONCAT - additional',
      q.arrayConcat(p.base('a'), p.base('b'), p.base('c'), p.base('d')),
      'ARRAY_CONCAT(c["a"], c["b"], c["c"], c["d"])'
    );
    testSimpleQuery(
      'ARRAY_CONTAINS',
      q.arrayContains(p.base('a'), p.base('b')),
      'ARRAY_CONTAINS(c["a"], c["b"])'
    );
    testSimpleQuery(
      'ARRAY_CONTAINS - partial flag',
      q.arrayContains(p.base('a'), p.base('b'), p.base('c')),
      'ARRAY_CONTAINS(c["a"], c["b"], c["c"])'
    );
    testSimpleQuery(
      'ARRAY_LENGTH',
      q.arrayLength(p.base('a')),
      'ARRAY_LENGTH(c["a"])'
    );
    testSimpleQuery(
      'ARRAY_SLICE',
      q.arraySlice(p.base('a'), p.base('b')),
      'ARRAY_SLICE(c["a"], c["b"])'
    );
    testSimpleQuery(
      'ARRAY_SLICE - with length',
      q.arraySlice(p.base('a'), p.base('b'), p.base('c')),
      'ARRAY_SLICE(c["a"], c["b"], c["c"])'
    );

    testSimpleQuery(
      'ST_DISTANCE',
      q.stDistance(p.base('a'), p.base('b')),
      'ST_DISTANCE(c["a"], c["b"])'
    );
    testSimpleQuery(
      'ST_WITHIN',
      q.stWithin(p.base('a'), p.base('b')),
      'ST_WITHIN(c["a"], c["b"])'
    );
    testSimpleQuery(
      'ST_INTERSECTS',
      q.stIntersects(p.base('a'), p.base('b')),
      'ST_INTERSECTS(c["a"], c["b"])'
    );
    testSimpleQuery(
      'ST_ISVALID',
      q.stIsValid(p.base('a')),
      'ST_ISVALID(c["a"])'
    );
    testSimpleQuery(
      'ST_ISVALIDDETAILED',
      q.stIsValidDetailed(p.base('a')),
      'ST_ISVALIDDETAILED(c["a"])'
    );
  });

  describe('properties', () => {
    testSimpleQuery('base', p.base('a'), 'c["a"]');
    testSimpleQuery('number', p.num('a'), 'c["a"]');
    testSimpleQuery('string', p.str('a'), 'c["a"]');
    testSimpleQuery('boolean', p.bool('a'), 'c["a"]');
    testSimpleQuery('array', p.arr('a'), 'c["a"]');
    testSimpleQuery('object', p.obj('a'), 'c["a"]');
    testSimpleQuery('spatial', p.spatial('a'), 'c["a"]');

    testSimpleQuery(
      'nested strings',
      p.base('a', 'b', 'c'),
      'c["a"]["b"]["c"]'
    );
    testSimpleQuery(
      'mix of strings and numbers',
      p.base('a', 1, 'c'),
      'c["a"][1]["c"]'
    );

    it('throws if the path is empty', () => {
      expect(() => serializeExpression((p.base as any)())).toThrow(TypeError);
    });

    it('throws if the first segment is not a string', () => {
      expect(() => serializeExpression(p.base(1 as any))).toThrow(TypeError);
    });

    it('throws if any segment is neither a string nor a number', () => {
      expect(() => serializeExpression(p.base('a', {} as any))).toThrow(
        TypeError
      );
    });
  });

  describe('constants', () => {
    it('number', () => {
      expect(serializeExpression(123)).toEqual({
        query: '@p0',
        parameters: [
          {
            name: '@p0',
            value: 123
          }
        ]
      });
    });

    it('string', () => {
      expect(serializeExpression('abc')).toEqual({
        query: '@p0',
        parameters: [
          {
            name: '@p0',
            value: 'abc'
          }
        ]
      });
    });

    it('boolean', () => {
      expect(serializeExpression(false)).toEqual({
        query: '@p0',
        parameters: [
          {
            name: '@p0',
            value: false
          }
        ]
      });
    });

    it('object', () => {
      expect(serializeExpression({ property: 'value' })).toEqual({
        query: '@p0',
        parameters: [
          {
            name: '@p0',
            value: { property: 'value' }
          }
        ]
      });
    });

    it('array', () => {
      expect(serializeExpression(['first', 'second'])).toEqual({
        query: '@p0',
        parameters: [
          {
            name: '@p0',
            value: ['first', 'second']
          }
        ]
      });
    });

    it('null', () => {
      expect(serializeExpression(null)).toEqual({
        query: '@p0',
        parameters: [
          {
            name: '@p0',
            value: null
          }
        ]
      });
    });
  });

  it('handles nested operators with params', () => {
    expect(
      serializeExpression(
        q.and(q.equal(p.num('num'), 123), q.inOp(p.str('str'), ['abc', 'def']))
      )
    ).toEqual({
      query: '((c["num"] = @p0) AND (c["str"] IN (@p1, @p2)))',
      parameters: [
        {
          name: '@p0',
          value: 123
        },
        {
          name: '@p1',
          value: 'abc'
        },
        {
          name: '@p2',
          value: 'def'
        }
      ]
    });
  });

  it('handles nested functions with params', () => {
    expect(
      serializeExpression(q.startsWith(q.substring(p.str('str'), 1, 2), 'abc'))
    ).toEqual({
      query: 'STARTSWITH(SUBSTRING(c["str"], @p0, @p1), @p2)',
      parameters: [
        {
          name: '@p0',
          value: 1
        },
        {
          name: '@p1',
          value: 2
        },
        {
          name: '@p2',
          value: 'abc'
        }
      ]
    });
  });

  it('throws for unrecognized expressions', () => {
    expect(() => serializeExpression([Symbol('unknown')] as any)).toThrow(
      TypeError
    );
  });
});

function testSimpleQuery(name: string, expression: Type.Any, query: string) {
  it(name, () => {
    expect(serializeExpression(expression)).toEqual({
      query,
      parameters: []
    });
  });
}
