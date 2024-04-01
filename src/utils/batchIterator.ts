/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// Async iterator polyfill for Node <10
if (!Symbol.asyncIterator) {
  (Symbol as any).asyncIterator = Symbol.for('Symbol.asyncIterator');
}

/**
 * Groups entries from a single result iterator into batches of the specified
 * size, yielding them in groups instead of individually.
 *
 * @param iterator Source iterator that returns resuls one at a time
 * @param batchSize Maximum number of results to include in a single batch
 */
export default async function* batchIterator<T>(
  iterator: AsyncIterable<T>,
  batchSize: number
): AsyncIterable<T[]> {
  let batch: T[] = [];
  for await (const item of iterator) {
    batch.push(item);

    if (batch.length >= batchSize) {
      yield batch;
      batch = [];
    }
  }

  if (batch.length > 0) {
    yield batch;
  }
}
