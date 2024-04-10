/*!
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CosmosClient } from '@azure/cosmos';
import { AzureCliCredential, ChainedTokenCredential } from '@azure/identity';
import * as url from 'url';
import { v4 as uuid } from 'uuid';

import { TaskClient, TaskClientOptions } from '..';

export default async function initialize(options?: TaskClientOptions) {
  const account = process.env.COSMOS_ACCOUNT;
  if (!account) {
    throw new Error(
      'Missing account. Make sure you have set the COSMOS_ACCOUNT environment variable'
    );
  }

  const database = process.env.COSMOS_DATABASE;
  if (!database) {
    throw new Error(
      'Missing database. Make sure you have set the COSMOS_DATABASE environment variable'
    );
  }

  const key = process.env.COSMOS_KEY;
  if (!key) {
    throw new Error(
      'Missing key. Make sure you have set the COSMOS_KEY environment variable'
    );
  }

  const useAadAuth = process.env.USE_AAD_AUTH;
  if (!key) {
    throw new Error(
      'Missing key. Make sure you have set the USE_AAD_AUTH environment variable'
    );
  }

  // Dynamic collection for testing
  const collection = `irontask-${uuid()}`;

  let client: TaskClient;
  if (useAadAuth) {
    client = await TaskClient.createFromCredential(
      account,
      database,
      collection,
      new ChainedTokenCredential(new AzureCliCredential()),
      options
    );
  } else {
    client = await TaskClient.createFromKey(
      account,
      database,
      collection,
      key,
      options
    );
  }

  return {
    client,
    // This is a shortcut to let us get custom clients without having to
    // reinitialize everything. It is NOT a supported use case and may break
    // at any time. Don't pull private properties off of the client in
    // production code.
    getClient: (options?: TaskClientOptions) =>
      new (TaskClient as any)((client as any)._client, options),
    containerRef: url.resolve(account, `/dbs/${database}/colls/${collection}`),
    cleanup: async () => {
      const client = new CosmosClient({ endpoint: account, key });
      await client
        .database(database)
        .container(collection)
        .delete();
    }
  };
}
