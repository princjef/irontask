/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import batchIterator from './batchIterator';

describe('#batchIterator', () => {
  it('chunks results in the specified group size', async () => {
    let batches = 0;
    const batchSize = 5;
    const count = 15;

    for await (const batch of batchIterator(iter(count), batchSize)) {
      expect(batch.length).toBe(5);
      expect(batch).toEqual(
        Array(batchSize)
          .fill(null)
          .map((_, i) => batchSize * batches + i)
      );
      batches += 1;
    }

    expect(batches).toBe(3);
  });

  it('creates a smaller batch at the end if there is a remainder', async () => {
    let batches = 0;
    const batchSize = 5;
    const count = 17;

    for await (const batch of batchIterator(iter(count), batchSize)) {
      if (batches === 3) {
        expect(batch.length).toBe(2);
      } else {
        expect(batch.length).toBe(5);
      }
      batches += 1;
    }

    expect(batches).toBe(4);
  });

  it('creates a single batch if the batch size is bigger than the entire list', async () => {
    let batches = 0;
    const batchSize = 50;
    const count = 12;

    for await (const batch of batchIterator(iter(count), batchSize)) {
      expect(batch.length).toBe(12);
      batches += 1;
    }

    expect(batches).toBe(1);
  });

  it('groups into batches of 1 if the batch size is too small', async () => {
    let batches = 0;
    const batchSize = -123;
    const count = 12;

    for await (const batch of batchIterator(iter(count), batchSize)) {
      expect(batch.length).toBe(1);
      batches += 1;
    }

    expect(batches).toBe(12);
  });
});

async function* iter(count: number): AsyncIterable<number> {
  for (let i = 0; i < count; i += 1) {
    yield i;
  }
}
