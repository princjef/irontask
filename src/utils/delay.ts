/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Creates a promise which resolves after the specified amount of time.
 *
 * @param delayMs Amount of time to wait in milliseconds
 */
export default async function delay(delayMs: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, delayMs));
}
