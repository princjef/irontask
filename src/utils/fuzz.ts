/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { FUZZ_MS } from '../constants';

export default function fuzz(fuzzMs: number = FUZZ_MS) {
  return Math.random() * fuzzMs - fuzzMs / 2;
}
