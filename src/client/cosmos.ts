/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
  CosmosDBManagementClient,
  SqlContainerCreateUpdateParameters,
  SqlContainerResource,
  SqlDatabaseCreateUpdateParameters
} from '@azure/arm-cosmosdb';
import {
  ConnectionPolicy,
  Container,
  ContainerDefinition,
  CosmosClient,
  CosmosHeaders,
  FeedResponse,
  ItemDefinition,
  Resource,
  ResourceResponse,
  Response,
  SqlQuerySpec
} from '@azure/cosmos';
import { TokenCredential } from '@azure/identity';
import * as url from 'url';

import {
  CONTINUATION_HEADER,
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

// TODO: look into reducing request timeout
const connectionPolicy: ConnectionPolicy = {
  retryOptions: {
    maxRetryAttemptCount: 0,
    fixedRetryIntervalInMilliseconds: 1000, // Just to make types happy
    maxWaitTimeInSeconds: 1000 // Just to make types happy
  }
};

// SprocClient defines the operations to perform on sprocs by a data plane or control plane cosmos client.
interface SprocClient {
  createSproc(id: string, body: (...args: any[]) => void): Promise<any>;
  replaceSproc(id: string, body: (...args: any[]) => void): Promise<any>;
}

// DataPlaneSprocClient implements the SprocClient using the cosmos data plane SDK.
// Note that this client cannot be used with a managed identity and the control plane client must be used instead.
class DataPlaneSprocClient {
  private _client: Container;

  constructor(client: Container) {
    this._client = client;
  }

  async createSproc(id: string, body: (...args: any[]) => void) {
    return this._client.scripts.storedProcedures.create({ id, body });
  }

  async replaceSproc(id: string, body: (...args: any[]) => void) {
    return this._client.scripts.storedProcedure(id).replace({ id, body });
  }
}

// ManagementOptions define the parameters necessary to create the control plane operation client.
export interface ManagementOptions {
  storageCredentials: TokenCredential; // credentials to perform management operations against the cosmos account.
  subscriptionId: string; // the subscription id.
  resourceGroupName: string; // the resource group name holding the cosmosDB account.
  accountName: string; // the cosmosDB account.
  databaseName: string; // the database within the cosmosDB account.
  containerName: string; // the container within the database.
}

// ControlPlaneOperationClient is a wrapper around an arm client catered to control plane / management operations.
// It is to be used with a managed identity, and implements the functionality specified by SprocClient.
class ControlPlaneOperationClient {
  private readonly _management: CosmosDBManagementClient;
  private readonly _options: ManagementOptions;

  constructor(options: ManagementOptions) {
    this._management = new CosmosDBManagementClient(
      options.storageCredentials,
      options.subscriptionId
    );
    this._options = options;
  }

  async createDatabaseIfNotExists(params: SqlDatabaseCreateUpdateParameters) {
    // try {
    //   return await this._management.sqlResources.getSqlDatabase(
    //     this._options.resourceGroupName,
    //     this._options.accountName,
    //     this._options.databaseName
    //   );
    // } catch (err) {
    //   return this._management.sqlResources
    //     .beginCreateUpdateSqlDatabase(
    //       this._options.resourceGroupName,
    //       this._options.accountName,
    //       this._options.databaseName,
    //       params
    //     )
    //     .then(async poller => poller.pollUntilDone());
    // }

    return this._management.sqlResources
      .beginCreateUpdateSqlDatabase(
        this._options.resourceGroupName,
        this._options.accountName,
        this._options.databaseName,
        params
      )
      .then(async poller => poller.pollUntilDone());
  }

  async createContainerIfNotExists(params: SqlContainerCreateUpdateParameters) {
    // try {
    //   return await this._management.sqlResources.getSqlContainer(
    //     this._options.resourceGroupName,
    //     this._options.accountName,
    //     this._options.databaseName,
    //     this._options.containerName
    //   );
    // } catch (err) {
    //   return this._management.sqlResources
    //     .beginCreateUpdateSqlContainer(
    //       this._options.resourceGroupName,
    //       this._options.accountName,
    //       this._options.databaseName,
    //       this._options.containerName,
    //       params
    //     )
    //     .then(async poller => poller.pollUntilDone());
    // }

    return this._management.sqlResources
      .beginCreateUpdateSqlContainer(
        this._options.resourceGroupName,
        this._options.accountName,
        this._options.databaseName,
        this._options.containerName,
        params
      )
      .then(async poller => poller.pollUntilDone());
  }

  async createSproc(id: string, body: (...args: any[]) => void) {
    return this.createOrUpdate(id, body.toString());
  }

  async replaceSproc(id: string, body: (...args: any[]) => void) {
    return this.createOrUpdate(id, body.toString());
  }

  async createOrUpdate(id: string, body: string) {
    return this._management.sqlResources
      .beginCreateUpdateSqlStoredProcedure(
        this._options.resourceGroupName,
        this._options.accountName,
        this._options.databaseName,
        this._options.containerName,
        id,
        {
          options: {},
          resource: {
            id,
            body
          }
        }
      )
      .then(async poller => poller.pollUntilDone());
  }
}

export default class CosmosDbClient {
  private _endpoint: string;
  private _client: Container;
  private _session?: string;
  private _retryOptions: TimeoutsOptions;
  private _sprocClient: SprocClient;

  static async createFromCredential(
    subscriptionId: string,
    resourceGroupName: string,
    accountEndpoint: string,
    account: string,
    database: string,
    collection: string,
    aadCredentials: TokenCredential,
    collectionOptions: Omit<SqlContainerResource, 'id'>,
    retryOptions: TimeoutsOptions = INTERNAL_RETRY_OPTIONS
  ) {
    try {
      const client = new CosmosClient({
        endpoint: accountEndpoint,
        connectionPolicy,
        consistencyLevel: 'Session',
        aadCredentials
      });

      const managementClient = new ControlPlaneOperationClient({
        storageCredentials: aadCredentials,
        subscriptionId,
        resourceGroupName,
        accountName: account,
        databaseName: database,
        containerName: collection
      });

      await managementClient.createDatabaseIfNotExists({
        resource: {
          id: database
        }
      });

      await managementClient.createContainerIfNotExists({
        resource: {
          id: collection,
          ...collectionOptions
        }
      });

      return new CosmosDbClient(
        accountEndpoint,
        client.database(database).container(collection),
        retryOptions,
        managementClient
      );
    } catch (err) {
      throw CosmosDbClient._translateError(err);
    }
  }

  static async createFromKey(
    account: string,
    database: string,
    collection: string,
    key: string,
    collectionOptions: Omit<ContainerDefinition, 'id'>,
    retryOptions: TimeoutsOptions = INTERNAL_RETRY_OPTIONS
  ) {
    try {
      const client = new CosmosClient({
        endpoint: account,
        connectionPolicy,
        consistencyLevel: 'Session',
        key
      });

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

      return new CosmosDbClient(
        account,
        container,
        retryOptions,
        new DataPlaneSprocClient(container)
      );
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
    return url.resolve(this._endpoint, this._client.url);
  }

  constructor(
    endpoint: string,
    container: Container,
    retryOptions: TimeoutsOptions,
    sprocClient: SprocClient
  ) {
    this._endpoint = endpoint;
    this._client = container;
    this._retryOptions = retryOptions;
    this._sprocClient = sprocClient;
  }

  documentRef(partition: string, id: string): string {
    return url.resolve(this._endpoint, this._client.item(id, partition).url);
  }

  async createItem<T extends ItemDefinition>(
    document: T
  ): Promise<AnnotatedResponse<T & Resource>> {
    return await this._wrap(async () =>
      this._client.items.create<T>(document, { sessionToken: this._session })
    );
  }

  async getItem<T extends ItemDefinition>(
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
            headers: (err as any).headers,
            body: undefined
          };
        }
        throw err;
      }
    });
  }

  async queryItemsArray<T>(
    query: SqlQuerySpec
  ): Promise<AnnotatedResponse<T[]>> {
    return await this._wrap(
      async () =>
        (this._client.items
          .query<T>(query, {
            sessionToken: this._session
          })
          .fetchAll() as unknown) as FeedResponse<T> & {
          headers: CosmosHeaders;
        }
    );
  }

  async queryItemsPage<T>(
    query: SqlQuerySpec,
    options: {
      continuation?: string;
      pageSize?: number;
    }
  ) {
    return await this._wrap(
      async () =>
        (this._client.items
          .query<T>(query, {
            sessionToken: this._session,
            continuation: options.continuation,
            maxItemCount: options.pageSize
          })
          .fetchNext() as unknown) as FeedResponse<T> & {
          headers: CosmosHeaders;
        }
    );
  }

  async *queryItemsIterator<T>(
    query: SqlQuerySpec
  ): AsyncIterable<AnnotatedResponse<T>> {
    const iterator = this._client.items
      .query<T>(query, {
        sessionToken: this._session
      })
      .getAsyncIterator()
      [Symbol.asyncIterator]();

    const modifiedIterator: AsyncIterable<AnnotatedResponse<T[]>> = {
      [Symbol.asyncIterator]: () => ({
        next: async (): Promise<IteratorResult<AnnotatedResponse<T[]>>> => {
          try {
            const initialResult = await iterator.next();
            if (!initialResult.value) {
              // The spec allows the value to be omitted, but the
              // Typescript type does not. Force it to behave with
              // any.
              return initialResult as any;
            }
            return {
              value: this._transformResult<T>(initialResult.value),
              done: initialResult.done || false
            };
          } catch (err) {
            throw this._transformError(err);
          }
        }
      })
    };

    for await (const result of modifiedIterator) {
      for (const [i, entry] of result.result.entries()) {
        // Return the original result with the original RU consumption for the
        // first entry, undefined for the rest.
        yield {
          ruConsumption: i === 0 ? result.ruConsumption : undefined,
          result: entry
        };
      }
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
          result: undefined
        };
      } catch (err) {
        if (CosmosDbClient._isCosmosError(err, 404)) {
          return {
            headers: (err as any).headers,
            result: undefined
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

  async executeSproc<T>(
    id: string,
    partition: string,
    ...params: string[]
  ): Promise<AnnotatedResponse<T>> {
    return await this._wrap(async () =>
      this._client.scripts.storedProcedure(id).execute<T>(partition, params)
    );
  }

  async createSproc(
    id: string,
    body: (...args: any[]) => void
  ): Promise<AnnotatedResponse<any>> {
    return this._wrap(async () => this._sprocClient.createSproc(id, body));
  }

  async replaceSproc(
    id: string,
    body: (...args: any[]) => void
  ): Promise<AnnotatedResponse<any>> {
    return await this._wrap(async () =>
      this._sprocClient.replaceSproc(id, body)
    );
  }

  private async _wrap<T>(
    operation: () => Promise<ListRes<T>>
  ): Promise<AnnotatedResponse<T[]>>;
  private async _wrap<T>(
    operation: () => Promise<ItemRes<T>>
  ): Promise<AnnotatedResponse<T>>;
  private async _wrap<T>(
    operation: () => Promise<Res<T>>
  ): Promise<AnnotatedResponse<T> | AnnotatedResponse<T[]>> {
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

  private _transformResult<T>(response: ListRes<T>): AnnotatedResponse<T[]>;
  private _transformResult<T>(response: ItemRes<T>): AnnotatedResponse<T>;
  private _transformResult<T>(
    response: Res<T>
  ): AnnotatedResponse<T> | AnnotatedResponse<T[]> {
    this._updateSession(response.headers);

    let result: T | T[];
    if ('resource' in response) {
      result = (response as Pick<ResourceResponse<T>, 'resource'>).resource!;
    } else if ('resources' in response) {
      result = (response as Pick<FeedResponse<T>, 'resources'>).resources;
    } else {
      result = (response as Pick<Response<T>, 'result'>).result!;
    }

    return {
      ruConsumption: CosmosDbClient._getRu(response.headers),
      continuation: CosmosDbClient._getContinuation(response.headers),
      result
    } as AnnotatedResponse<T> | AnnotatedResponse<T[]>;
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

  private _updateSession(headers: CosmosHeaders | undefined) {
    // Cosmos DB session tokens are maintained per collection and change
    // with each update to the database. Since the entire client is scoped
    // to a single collection, we simply pull the most recent session token
    // we've seen and use it for subsequent requests. This allows us to
    // support collections configured with session consistency while still
    // maintaining reasonable linearizability guarantees within scenarios.
    if (headers && headers[SESSION_TOKEN_HEADER]) {
      this._session = headers[SESSION_TOKEN_HEADER] as string;
    }
  }

  private static _translateError(err: any, ruConsumption?: number) {
    // We scrub the error first for sensitive information
    const scrubbedError = CosmosDbClient._scrubError(err);

    // console.error(err);

    let code: ErrorCode | undefined;
    switch (scrubbedError && scrubbedError.code) {
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
      const error = new IronTaskError(code, scrubbedError);
      error[ERROR_RU] = ruConsumption;
      return error;
    }

    return scrubbedError;
  }

  private static _scrubError(err: any): any {
    // Sometimes authorization headers can be exposed via cosmos SDK errors. We
    // scrub this out to avoid it propagating downstream to users and getting
    // logged into external systems.
    if (err && err.requestHeaders && err.requestHeaders.authorization) {
      delete err.requestHeaders.authorization;
    }

    return err;
  }

  private static _getRu(
    headers: CosmosHeaders | undefined
  ): number | undefined {
    return headers && headers[RU_HEADER]
      ? Number(headers[RU_HEADER])
      : undefined;
  }

  private static _getContinuation(
    headers: CosmosHeaders | undefined
  ): string | undefined {
    return headers && headers[CONTINUATION_HEADER];
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

type ListRes<T> = Pick<FeedResponse<T>, 'resources'> & {
  headers: CosmosHeaders;
};

type ItemRes<T> =
  | Pick<ResourceResponse<T>, 'headers' | 'resource'>
  | Pick<Response<T>, 'headers' | 'result'>;

type Res<T> = ListRes<T> | ItemRes<T>;
