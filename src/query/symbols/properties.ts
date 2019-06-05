/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// Generic property

/**
 * @public
 */
// tslint:disable:naming-convention
namespace PropSymbol {
  /**
   * @public
   */
  export const ANY = Symbol('property');

  /**
   * @public
   */
  export const NUMERIC = Symbol('numeric-property');

  /**
   * @public
   */
  export const BOOLEAN = Symbol('boolean-property');

  /**
   * @public
   */
  export const STRING = Symbol('string-property');

  /**
   * @public
   */
  export const SPATIAL = Symbol('spatial-property');

  /**
   * @public
   */
  export const OBJECT = Symbol('object-property');

  /**
   * @public
   */
  export const ARRAY = Symbol('array-property');
}

/**
 * @public
 */
type PropSymbol =
  | typeof PropSymbol.ANY
  | typeof PropSymbol.NUMERIC
  | typeof PropSymbol.BOOLEAN
  | typeof PropSymbol.STRING
  | typeof PropSymbol.STRING
  | typeof PropSymbol.SPATIAL
  | typeof PropSymbol.OBJECT
  | typeof PropSymbol.ARRAY;

export default PropSymbol;
