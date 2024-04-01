/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { p, q, QueryType } from '../query';

import t from './properties';

const BASE_PROJECTION = [
  t.id,
  p.str('_etag'),
  p.num('ttl'),
  p.obj('config'),
  p.num('_ts')
];

/**
 * Computes the overall projection for a task summary, given the projections for
 * the payload within the task.
 *
 * @param projections Property projections to include from the payload
 */
export function summaryProjection(
  projections?: QueryType.AnyProperty[]
): QueryType.AnyProperty[] {
  // If there is no projection specified
  if (!projections) {
    return BASE_PROJECTION;
  }

  for (const projection of projections) {
    if (projection[1] !== t.payload()[1]) {
      throw new TypeError(
        'Only properties inside of the payload can be projected'
      );
    }
  }

  return [...BASE_PROJECTION, ...projections];
}

/**
 * Produces a filter for tasks of the given type, with optional additional
 * filters applied.
 *
 * @param type The task's type
 * @param filter Optional additional filter to apply to the task
 */
export function typeFilter(type: string, filter?: QueryType.Bool) {
  return filter !== undefined
    ? q.and(q.equal(t.type, type), filter)
    : q.equal(t.type, type);
}
