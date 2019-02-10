/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { FUZZ_MS } from '../constants';

import fuzz from './fuzz';

describe('#fuzz', () => {
  it('has a lower bound of the input time / 2', () => {
    jest.spyOn(Math, 'random').mockImplementation(() => 0);
    expect(fuzz(500)).toBe(-250);
  });

  it('has an upper bound of the input time / 2', () => {
    jest.spyOn(Math, 'random').mockImplementation(() => 1);
    expect(fuzz(1000)).toBe(500);
  });

  it('defaults to the FUZZ_MS constant', () => {
    jest.spyOn(Math, 'random').mockImplementation(() => 1);
    expect(fuzz()).toBe(FUZZ_MS / 2);
  });
});
