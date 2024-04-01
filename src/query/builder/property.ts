/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { PropSymbol } from '../symbols';
import Type from '../types';

namespace p {
  export const base = (
    prop: string,
    ...nested: (string | number)[]
  ): Type.Property => [PropSymbol.ANY, prop, nested];
  export const num = (
    prop: string,
    ...nested: (string | number)[]
  ): Type.NumericProperty => [PropSymbol.NUMERIC, prop, nested];
  export const bool = (
    prop: string,
    ...nested: (string | number)[]
  ): Type.BooleanProperty => [PropSymbol.BOOLEAN, prop, nested];
  export const str = (
    prop: string,
    ...nested: (string | number)[]
  ): Type.StringProperty => [PropSymbol.STRING, prop, nested];
  export const arr = (
    prop: string,
    ...nested: (string | number)[]
  ): Type.ArrayProperty => [PropSymbol.ARRAY, prop, nested];
  export const spatial = (
    prop: string,
    ...nested: (string | number)[]
  ): Type.SpatialProperty => [PropSymbol.SPATIAL, prop, nested];
  export const obj = (
    prop: string,
    ...nested: (string | number)[]
  ): Type.ObjectProperty => [PropSymbol.OBJECT, prop, nested];
}

export default p;
