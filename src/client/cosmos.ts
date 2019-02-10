/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  Container,
  ContainerDefinition,
  CosmosClient,
  IHeaders,
  ItemResponse,
  Resource,
  SqlQuerySpec
} from '@azure/cosmos';
import { Response } from '@azure/cosmos/lib/src/request';

import {
  DEFAULT_DATABASE_THROUGHPUT,
  INTERNAL_RETRY_OPTIONS,
  RU_HEADER,
  SESSION_TOKEN_HEADER
} from '../constants';
import IronTaskError, { ErrorCode } from '../error';
import { AnnotatedResponse } from '../interceptor';
import { Omit } from '../types/internal';
import { TimeoutsOptions } from '../types/public';
import retry from '../utils/retry';

const ERROR_RU = Symbol('CosmosDB Error RU');

const retryableNetworkingErrors = ['ECONNREFUSED', 'EAI_AGAIN'];

export default class CosmosDbClient {
  private _client: Container;
  private _session?: string;
  private _retryOptions: TimeoutsOptions;

  static async create(
    account: string,
    database: string,
    collection: string,
    key: string,
    collectionOptions: Omit<ContainerDefinition, 'id'>,
    retryOptions: TimeoutsOptions = INTERNAL_RETRY_OPTIONS
  ) {
    try {
      const client = new CosmosClient({ endpoint: account, key });
      const { database: db } = await client.databases.createIfNotExists(
        {
          id: database
        },
        {
          offerThroughput: DEFAULT_DATABASE_THROUGHPUT
        }
      );
      const { container } = await db.containers.createIfNotExists({
        id: collection,
        ...collectionOptions
      });

      return new CosmosDbClient(container, retryOptions);
    } catch (err) {
      throw CosmosDbClient._translateError(err);
    }
  }

  static getErrorRU(err: any): number | undefined {
    if (err && typeof err[ERROR_RU] === 'number') {
      return err[ERROR_RU];
    }

    return undefined;
  }

  get containerRef(): string {
    return this._client.url;
  }

  constructor(container: Container, retryOptions: TimeoutsOptions) {
    this._client = container;
    this._retryOptions = retryOptions;
  }

  documentRef(partition: string, id: string): string {
    return this._client.item(id, partition).url;
  }

  async createItem<T>(document: T): Promise<AnnotatedResponse<T & Resource>> {
    return await this._wrap(async () =>
      this._client.items.create<T>(document, { sessionToken: this._session })
    );
  }

  async getItem<T>(
    id: string,
    partition: string
  ): Promise<AnnotatedResponse<(T & Resource) | undefined>> {
    return await this._wrap(async () => {
      try {
        return await this._client
          .item(id, partition)
          .read<T>({ sessionToken: this._session });
      } catch (err) {
        if (CosmosDbClient._isCosmosError(err, 404)) {
          return {
            headers: err.headers,
            body: undefined
          };
        }
        throw err;
      }
    });
  }

  async queryItemsArray<T>(
    query: SqlQuerySpec,
    crossPartition?: boolean
  ): Promise<AnnotatedResponse<T[]>> {
    return await this._wrap(async () =>
      this._client.items
        .query<T>(query, {
          sessionToken: this._session,
          enableCrossPartitionQuery: crossPartition
        })
        .toArray()
    );
  }

  async *queryItemsIterator<T>(
    query: SqlQuerySpec,
    crossPartition?: boolean
  ): AsyncIterable<AnnotatedResponse<T>> {
    const iterator = this._client.items
      .query<T>(query, {
        sessionToken: this._session,
        enableCrossPartitionQuery: crossPartition
      })
      .getAsyncIterator()
      [Symbol.asyncIterator]();

    const modifiedIterator: AsyncIterable<AnnotatedResponse<T>> = {
      [Symbol.asyncIterator]: () => ({
        next: async (): Promise<IteratorResult<AnnotatedResponse<T>>> => {
          try {
            const initialResult = await iterator.next();
            if (!initialResult.value) {
              // The spec allows the value to be omitted, but the
              // Typescript type does not. Force it to behave with
              // any.
              return initialResult as any;
            }
            return {
              value: this._transformResult(initialResult.value),
              done: initialResult.done
            };
          } catch (err) {
            throw this._transformError(err);
          }
        }
      })
    };

    for await (const result of modifiedIterator) {
      yield result;
    }
  }

  async deleteItem(
    id: string,
    partition: string
  ): Promise<AnnotatedResponse<void>> {
    return await this._wrap(async () => {
      try {
        return {
          ...(await this._client
            .item(id, partition)
            .delete({ sessionToken: this._session })),
          body: undefined
        };
      } catch (err) {
        if (CosmosDbClient._isCosmosError(err, 404)) {
          return {
            headers: err.headers,
            body: undefined
          };
        }
        throw err;
      }
    });
  }

  async replaceItem<T extends DocumentBase>(
    document: T,
    partition: string
  ): Promise<AnnotatedResponse<T>> {
    return await this._wrap(async () =>
      this._client.item(document.id, partition).replace<T>(document, {
        accessCondition: {
          type: 'IfMatch',
          condition: document._etag
        },
        sessionToken: this._session
      })
    );
  }

  async createSproc(
    id: string,
    body: (...args: any[]) => void
  ): Promise<AnnotatedResponse<any>> {
    return await this._wrap(async () =>
      this._client.storedProcedures.create({ id, body })
    );
  }

  async replaceSproc(
    id: string,
    body: (...args: any[]) => void
  ): Promise<AnnotatedResponse<any>> {
    return await this._wrap(async () =>
      this._client.storedProcedure(id).replace({ id, body })
    );
  }

  async executeSproc<T>(
    id: string,
    partition: string,
    ...params: string[]
  ): Promise<AnnotatedResponse<T>> {
    return await this._wrap(async () =>
      this._client
        .storedProcedure(id)
        .execute<T>(params, { partitionKey: partition })
    );
  }

  private async _wrap<T>(
    operation: () => Promise<Res<T>>
  ): Promise<AnnotatedResponse<T>> {
    return await retry(
      async () => {
        try {
          return this._transformResult(await operation());
        } catch (err) {
          throw this._transformError(err);
        }
      },
      CosmosDbClient._shouldRetry,
      this._retryOptions
    );
  }

  private _transformResult<T>(response: Res<T>): AnnotatedResponse<T> {
    this._updateSession(response.headers);

    return {
      ruConsumption: CosmosDbClient._getRu(response.headers),
      result:
        'result' in response
          ? response.result!
          : (response as ItemResponse<T>).body!
    };
  }

  private _transformError(error: any): any {
    // Cosmos DB errors contain the response headers for the underlying
    // request. We pull them off so we can get RU and session information.
    const headers = error && error.headers;

    this._updateSession(headers);

    return CosmosDbClient._translateError(
      error,
      CosmosDbClient._getRu(headers)
    );
  }

  private _updateSession(headers: IHeaders | undefined) {
    // Cosmos DB session tokens are maintained per collection and change
    // with each update to the database. Since the entire client is scoped
    // to a single collection, we simply pull the most recent session token
    // we've seen and use it for subsequent requests. This allows us to
    // support collections configured with session consistency while still
    // maintaining reasonable linearizability guarantees within scenarios.
    if (headers && headers[SESSION_TOKEN_HEADER]) {
      this._session = headers[SESSION_TOKEN_HEADER];
    }
  }

  private static _translateError(err: any, ruConsumption?: number) {
    let code: ErrorCode | undefined;
    switch (err && err.code) {
      case 400:
        code = ErrorCode.DATABASE_INVALID_REQUEST;
        break;
      case 401:
        code = ErrorCode.DATABASE_INVALID_CREDENTIALS;
        break;
      case 403:
        code = ErrorCode.DATABASE_OPERATION_FORBIDDEN;
        break;
      case 404:
        code = ErrorCode.DATABASE_RESOURCE_NOT_FOUND;
        break;
      case 408:
        code = ErrorCode.DATABASE_SPROC_TIMED_OUT;
        break;
      case 409:
        code = ErrorCode.DATABASE_RESOURCE_ALREADY_EXISTS;
        break;
      case 412:
        code = ErrorCode.DATABASE_RESOURCE_CONCURRENCY_VIOLATION;
        break;
      case 413:
        code = ErrorCode.TASK_TOO_LARGE;
        break;
      case 429:
        code = ErrorCode.DATABASE_THROUGHPUT_EXCEEDED;
        break;
      case 449:
        code = ErrorCode.DATABASE_TRANSIENT_WRITE_FAILURE;
        break;
      case 500:
        code = ErrorCode.DATABASE_INTERNAL_ERROR;
        break;
      case 503:
        code = ErrorCode.DATABASE_UNAVAILABLE;
        break;
      case 'ENOTFOUND':
        code = ErrorCode.DATABASE_ACCOUNT_NOT_FOUND;
        break;
    }

    if (code) {
      const error = new IronTaskError(code, err);
      error[ERROR_RU] = ruConsumption;
      return error;
    }
    return err;
  }

  private static _getRu(headers: IHeaders | undefined): number | undefined {
    return headers && headers[RU_HEADER]
      ? Number(headers[RU_HEADER])
      : undefined;
  }

  private static _isCosmosError(err: any, ...codes: number[]) {
    return err && codes.includes(err.code);
  }

  private static _shouldRetry(err: any): boolean {
    return (
      IronTaskError.is(
        err,
        ErrorCode.DATABASE_TRANSIENT_WRITE_FAILURE,
        ErrorCode.DATABASE_UNAVAILABLE,
        ErrorCode.DATABASE_ACCOUNT_NOT_FOUND
      ) ||
      (err && retryableNetworkingErrors.includes(err.code))
    );
  }
}

export interface DocumentBase {
  id: string;
  _etag: string;
}

type Res<T> =
  | Pick<ItemResponse<T>, 'headers' | 'body'>
  | Pick<Response<T>, 'headers' | 'result'>;
