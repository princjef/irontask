/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { p } from '../builder';

import serializeProjection from './projection';

describe('#serializeProjection', () => {
  it('returns a VALUE clause with an empty object when no projections are provided', () => {
    expect(serializeProjection([])).toBe('VALUE {  }');
  });

  it('handles simple shallow objects', () => {
    expect(serializeProjection([p.base('prop')])).toBe(
      'VALUE { "prop": c["prop"] }'
    );
  });

  it('merges multiple properties in the same object', () => {
    expect(serializeProjection([p.base('prop'), p.num('abc')])).toBe(
      'VALUE { "prop": c["prop"], "abc": c["abc"] }'
    );
  });

  it('ignores duplicate properties in the same object', () => {
    expect(
      serializeProjection([p.base('prop'), p.num('abc'), p.str('prop')])
    ).toBe('VALUE { "prop": c["prop"], "abc": c["abc"] }');
  });

  it('handles nested objects', () => {
    expect(serializeProjection([p.base('prop'), p.arr('abc', 'nested')])).toBe(
      'VALUE { "prop": c["prop"], "abc": { "nested": c["abc"]["nested"] } }'
    );
  });

  it('handles nested arrays', () => {
    expect(serializeProjection([p.base('prop'), p.obj('abc', 1)])).toBe(
      'VALUE { "prop": c["prop"], "abc": [c["abc"][1]] }'
    );
  });

  it('merges multiple array indices in the right order', () => {
    expect(serializeProjection([p.num('arr', 10), p.spatial('arr', 1)])).toBe(
      'VALUE { "arr": [c["arr"][1], c["arr"][10]] }'
    );
  });

  it('ignores subproperties of properties that are already being projected', () => {
    expect(serializeProjection([p.num('prop'), p.num('prop', 'sub')])).toBe(
      'VALUE { "prop": c["prop"] }'
    );
  });

  it('overrides subproperties if the parent property is also projected', () => {
    expect(serializeProjection([p.num('prop', 'sub'), p.num('prop')])).toBe(
      'VALUE { "prop": c["prop"] }'
    );
  });

  it('handles when _ts gets projected', () => {
    expect(serializeProjection([p.num('_ts')])).toBe(
      'VALUE { "_ts": c["_ts"] }'
    );
  });

  it('does not allow array properties on the top level', () => {
    expect(() => serializeProjection([p.base(0 as any)])).toThrow(TypeError);
  });

  it('does not allow projecting a subproperty as an object and an array', () => {
    expect(() =>
      serializeProjection([p.base('prop', 'obj'), p.base('prop', 1)])
    ).toThrow(TypeError);
  });

  it('does not allow projecting a subproperty as an object and an array (reverse)', () => {
    expect(() =>
      serializeProjection([p.base('prop', 1), p.base('prop', 'obj')])
    ).toThrow(TypeError);
  });

  it('does not allow property segments that are neither strings nor numbers', () => {
    expect(() => serializeProjection([p.base('prop', {} as any)])).toThrow(
      TypeError
    );
  });
});
