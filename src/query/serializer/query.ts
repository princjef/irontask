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
  limit?: number;
  rawProjection?: string;
  projection?: Type.AnyProperty[];
  filter?: Type.Bool;
  sort?: Type.Num;
  sortOrder?: 'ASC' | 'DESC';
}): Required<SqlQuerySpec> {
  let paramIndex = 0;

  const limit =
    config.limit !== undefined
      ? ({
          query: 'TOP @limit',
          parameters: [
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
      ? serializeExpression(config.sort, paramIndex)
      : undefined;

  return {
    query: `SELECT ${limit ? limit.query : ''} ${projection}
            FROM c
            ${filter ? `WHERE ${filter.query}` : ''}
            ${
              sort
                ? `ORDER BY ${sort.query} ${
                    config.sortOrder === 'DESC' ? 'DESC' : 'ASC'
                  }`
                : ''
            }`,
    parameters: [
      ...(limit ? limit.parameters : []),
      ...(filter ? filter.parameters : []),
      ...(sort ? sort.parameters : [])
    ]
  };
}
