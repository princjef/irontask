/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import Type from '../types';

import buildExpression from './expression';

/**
 * Convert a list of properties into a Cosmos DB SELECT projection expression.
 *
 * @param properties List of property expressions to serialize
 */
export default function serializeProjection(
  properties: Type.AnyProperty[]
): string {
  let projection: Projection = {
    type: 'object',
    entries: new Map()
  };

  for (const property of properties) {
    projection = addProperty(
      [property[1], ...property[2]],
      buildExpression(property).query,
      projection
    );
  }

  return `VALUE ${serialize(projection)}`;
}

function addProperty(
  path: (string | number)[],
  expression: string,
  current?: Projection
): Projection {
  // Leaf projections include anything that might be present beneath them, so
  // if we already have a leaf projection, we're not going to end up replacing
  // it with anything different
  if (current && current.type === 'leaf') {
    return current;
  }

  // If there is nothing left, we have a leaf (regardless of the previous
  // type)
  if (path.length === 0) {
    return { type: 'leaf', expression };
  }

  // Otherwise, we can pull apart the pieces of the path and process the first
  // one
  const [prop, ...subPath] = path;

  // Array element
  if (typeof prop === 'number') {
    // If we get projections that assert different types for the same path,
    // the projection is invalid.
    if (current && current.type !== 'array') {
      throw new TypeError(
        'Cannot project object and array properties from the same path'
      );
    }

    const projection: ArrayProjection = current || {
      type: 'array',
      entries: new Map()
    };

    const currentEntry = projection.entries.get(prop);
    projection.entries.set(
      prop,
      addProperty(subPath, expression, currentEntry)
    );
    return projection;
  }

  // Object property
  if (typeof prop === 'string') {
    // If we get projections that assert different types for the same path,
    // the projection is invalid.
    if (current && current.type !== 'object') {
      throw new TypeError(
        'Cannot project object and array properties from the same path'
      );
    }

    const projection: ObjectProjection = current || {
      type: 'object',
      entries: new Map()
    };

    const currentEntry = projection.entries.get(prop);
    projection.entries.set(
      prop,
      addProperty(subPath, expression, currentEntry)
    );
    return projection;
  }

  // The property type was invalid
  throw new TypeError(`Invalid JSON property type: ${typeof prop}`);
}

function serialize(projection: Projection): string {
  switch (projection.type) {
    case 'leaf':
      return projection.expression;
    case 'object':
      const properties = Array.from(projection.entries.entries())
        .map(([key, value]) => `${JSON.stringify(key)}: ${serialize(value)}`)
        .join(', ');
      return `{ ${properties} }`;
    case 'array':
      const entries = Array.from(projection.entries.entries())
        .sort(([indexA], [indexB]) => indexA - indexB)
        .map(([, value]) => serialize(value))
        .join(', ');
      return `[${entries}]`;
  }
}

type Projection = LeafProjection | ArrayProjection | ObjectProjection;

interface LeafProjection {
  type: 'leaf';
  expression: string;
}

interface ArrayProjection {
  type: 'array';
  entries: Map<number, Projection>;
}

interface ObjectProjection {
  type: 'object';
  entries: Map<string, Projection>;
}
