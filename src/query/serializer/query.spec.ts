/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { SqlQuerySpec } from '@azure/cosmos';

import { p, q } from '../builder';

import buildQuery from './query';

describe('#buildQuery', () => {
  it('returns an unfiltered expression by default', () => {
    expect(normalize(buildQuery({}))).toEqual({
      query: 'SELECT * FROM c',
      parameters: []
    });
  });

  it('limit', () => {
    expect(
      normalize(
        buildQuery({
          limit: 10
        })
      )
    ).toEqual({
      query: 'SELECT TOP @limit * FROM c',
      parameters: [
        {
          name: '@limit',
          value: 10
        }
      ]
    });
  });

  it('projection', () => {
    expect(
      normalize(
        buildQuery({
          projection: [p.base('a'), p.base('b')]
        })
      )
    ).toEqual({
      query: 'SELECT VALUE { "a": c["a"], "b": c["b"] } FROM c',
      parameters: []
    });
  });

  it('filter', () => {
    expect(
      normalize(
        buildQuery({
          filter: q.and(
            q.equal(p.base('a'), 1),
            q.greaterThan(p.base('b'), 123)
          )
        })
      )
    ).toEqual({
      query: 'SELECT * FROM c WHERE ((c["a"] = @p0) AND (c["b"] > @p1))',
      parameters: [
        {
          name: '@p0',
          value: 1
        },
        {
          name: '@p1',
          value: 123
        }
      ]
    });
  });

  it('sort', () => {
    expect(
      normalize(
        buildQuery({
          sort: q.indexOf(p.base('a'), 'abc')
        })
      )
    ).toEqual({
      query: 'SELECT * FROM c ORDER BY INDEX_OF(c["a"], @p0) ASC',
      parameters: [
        {
          name: '@p0',
          value: 'abc'
        }
      ]
    });
  });

  it('sort with order', () => {
    expect(
      normalize(
        buildQuery({
          sort: q.indexOf(p.base('a'), 'abc'),
          sortOrder: 'DESC'
        })
      )
    ).toEqual({
      query: 'SELECT * FROM c ORDER BY INDEX_OF(c["a"], @p0) DESC',
      parameters: [
        {
          name: '@p0',
          value: 'abc'
        }
      ]
    });
  });

  it('sort with _ts', () => {
    expect(
      normalize(
        buildQuery({
          sort: p.num('_ts')
        })
      )
    ).toEqual({
      query: 'SELECT * FROM c ORDER BY c["_ts"] ASC',
      parameters: []
    });
  });

  it('everything', () => {
    expect(
      normalize(
        buildQuery({
          limit: 10,
          projection: [p.base('a'), p.base('b')],
          filter: q.and(
            q.equal(p.base('a'), 1),
            q.greaterThan(p.base('b'), 123)
          ),
          sort: q.indexOf(p.base('a'), 'abc'),
          sortOrder: 'DESC'
        })
      )
    ).toEqual(
      normalize({
        query: `SELECT TOP @limit VALUE { "a": c["a"], "b": c["b"] }
                FROM c
                WHERE ((c["a"] = @p0) AND (c["b"] > @p1))
                ORDER BY INDEX_OF(c["a"], @p2) DESC`,
        parameters: [
          {
            name: '@limit',
            value: 10
          },
          {
            name: '@p0',
            value: 1
          },
          {
            name: '@p1',
            value: 123
          },
          {
            name: '@p2',
            value: 'abc'
          }
        ]
      })
    );
  });
});

function normalize(query: Required<SqlQuerySpec>): Required<SqlQuerySpec> {
  return {
    query: query.query.replace(/\s+/g, ' ').trim(),
    parameters: query.parameters
  };
}
