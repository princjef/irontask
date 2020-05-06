/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { SqlQuerySpec } from '@azure/cosmos';

import Type from '../types';

import serializeExpression from './expression';
import serializeProjection from './projection';

/**
 * Build a Cosmos DB SQL query from the following options. Defaults to selecting
 * all data from every document in the collection with no sort.
 *
 * @param config Object representation of the query to build
 */
export default function build(config: {
  offset?: number;
  limit?: number;
  rawProjection?: string;
  projection?: Type.AnyProperty[];
  filter?: Type.Bool;
  sort?: Type.Num;
  sortOrder?: 'ASC' | 'DESC';
}): Required<SqlQuerySpec> {
  let paramIndex = 0;

  const paging =
    config.offset !== undefined && config.limit !== undefined
      ? ({
          query: 'OFFSET @offset LIMIT @limit',
          parameters: [
            {
              name: '@offset',
              value: config.offset
            },
            {
              name: '@limit',
              value: config.limit
            }
          ]
        } as Required<SqlQuerySpec>)
      : undefined;

  const projection = config.rawProjection
    ? config.rawProjection
    : config.projection !== undefined
    ? serializeProjection(config.projection)
    : '*';

  const filter =
    config.filter !== undefined
      ? serializeExpression(config.filter, paramIndex)
      : undefined;

  if (filter) {
    paramIndex += filter.parameters.length;
  }

  const sort =
    config.sort !== undefined
      ? // Due to the fact that sort fields must be raw projections for now, we
        // mark the expression as a projection.
        // TODO: update this if Cosmos DB ever supports expressions in order by
        serializeExpression(config.sort, paramIndex, true)
      : undefined;

  return {
    query: `SELECT ${projection}
            FROM c
            ${filter ? `WHERE ${filter.query}` : ''}
            ${
              sort
                ? `ORDER BY ${sort.query} ${
                    config.sortOrder === 'DESC' ? 'DESC' : 'ASC'
                  }`
                : ''
            }
            ${paging ? paging.query : ''}`,
    parameters: [
      ...(filter ? filter.parameters : []),
      ...(sort ? sort.parameters : []),
      ...(paging ? paging.parameters : [])
    ]
  };
}
