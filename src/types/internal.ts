/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export type RecursiveRequired<T> = {
  [K in keyof T]-?: RecursiveRequired<T[K]>;
};
