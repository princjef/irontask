# irontask

[![Build Status](https://dev.azure.com/princjef/github-ci/_apis/build/status/princjef.irontask?branchName=master)](https://dev.azure.com/princjef/github-ci/_build/latest?definitionId=7&branchName=master)
[![Code Coverage](https://img.shields.io/azure-devops/coverage/princjef/github-ci/7.svg)](https://dev.azure.com/princjef/github-ci/_build/latest?definitionId=7&branchName=master&view=codecoverage-tab)
[![npm version](https://img.shields.io/npm/v/irontask.svg)](https://npmjs.org/package/irontask)

Persistent, queryable task scheduling for Node.js using Azure Cosmos DB.

## Key Features

- Fully persistent tasks backed by a global scale database with a 99.99% SLA
- Full querying capability against any task data, no manual indexing required
- Support for one-time or recurring tasks with numeric or cron intervals
- Built-in support for retrying, deferring and disabling running tasks
- Safe distribution of task processing between multiple clients with concurrency
  control
- Configurable automatic cleanup of finished tasks (if desired)
- Effortless logging of all operations through built-in instrumentation hooks

## Getting Started

### Prerequisites

- Node.js 8 or higher
- An [Azure Cosmos DB][] database to store your tasks.

  > Want to try out Azure Cosmos DB without creating an Azure subscription? You
  > can install the [Azure Cosmos DB Emulator][] to try things out locally for
  > free.

### Installation

You can install the latest version using npm:

```
npm install irontask
```

or yarn:

```
yarn add irontask
```

### Basic Usage

Now that you have the client installed, you can import it and start creating and
listening to tasks.

Let's start with the relatively small code sample below:

```js
const { TaskClient } = require('irontask');
const util = require('util');

async function main() {
  // Set up the client
  const client = await TaskClient.createFromKey(
    'https://your-cosmos-account.documents.azure.com:443/',
    'your-cosmos-database',
    'your-cosmos-collection', // Will be created if it doesn't exist
    'base64-encoded key'
  );

  /*
   *  // Alternatively initialize the client with a managed identity.
   *  const client = await TaskClient.createFromCredential(
   *    'https://your-cosmos-account.documents.azure.com:443/',
   *    'your-cosmos-database',
   *    'your-cosmos-collection', // Will be created if it doesn't exist
   *    new ChainedTokenCredential(...) // From @azure/identity library.
   *  );
   */

  // Create a task that runs once
  const task = await client.create('sample-task', { hello: 'world' });

  console.log(`Created task with id {task.id}`);
  console.log(task);

  // Start listening for tasks of our task's type
  const listener = client.listen('sample-task', async task => {
    console.log(`Received task with id ${task.id} for processing`);

    // Update some information
    task.payload.hello = 'irontask';

    console.log(`Finished processing task with id ${task.id}`);
  });

  // Once we no longer want to listen for tasks, shut down the listener so our
  // process can exit
  await util.promisify(setTimeout)(2000);
  listener.stop();

  // See what the task looks like after processing
  const updatedTask = await client.get('sample-task', task.id);
  console.log('Updated task after processing:');
  console.log(updatedTask);
}

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

main();
```

Let's break down what's going on in here:

#### Step 1: Create the client

Before we get going, we need a client to work with.

```js
const client = await TaskClient.createFromKey(
  'https://your-cosmos-account.documents.azure.com:443/',
  'your-cosmos-database', // Will be created if it doesn't exist
  'your-cosmos-collection', // Will be created if it doesn't exist
  'base64-encoded key'
);
```

We import the `TaskClient` class from the irontask package and then call
`create` against it. This takes the information for our Azure Cosmos DB and gets
everything set up so that we can start working with tasks in it.

> Unsure how to find your account information? You can access this information
> in the Azure Portal as described in [this guide][azure cosmos db credentials].

While you need to have the account and database set up in advance, we recommend
that you do _not_ pre-create the collection. The client will set the collection
up for you with the proper partitioning scheme to ensure that the client
functions properly.

> Creating the collection yourself? Make sure that you set a partition key of
> `/config/type` in the collection upon creation. If you don't, the client will
> not function properly.

#### Step 2: Create a Task

Now that we have a client, we can start creating some tasks!

```js
// Create a task that runs once
const task = await client.create('sample-task', { hello: 'world' });
```

Here we use the `create()` method of the client we got in step 1 to make our
first task. Every task must have a type (in our case, the type is `sample-task`)
when it is created. All operations we perform will run on a certain task type,
so choose your type wisely. Typically, the type will represent a grouping of
tasks with similar data and processing setups, though you can choose to organize
them however you want.

In addition to the type, each task can provide a JSON-serializable payload to
hold information about the task. You can update this data at any time, and it is
common to update this information as you're processing a task to keep track of
your progress and any changes that you have made. For this task, our payload is
the object `{ hello: 'world' }`.

There are several options that we can provide on task creation to customize the
behavior and scheduling of the task, but for this task we just go with the
defaults, which will cause a unique task id to be generated for us and will
schedule the task to be processed now.

#### Step 3: Processing Tasks

We now have a task, but we need to say how we want to process it. We do this
using a listener.

```js
// Start listening for tasks of our task's type
const listener = client.listen('sample-task', async task => {
  console.log(`Received task with id ${task.id} for processing`);

  // Update some information
  task.payload.hello = 'irontask';

  console.log(`Finished processing task with id ${task.id}`);
});
```

Once a task of a certain type has been scheduled, we can process it by setting
up a listener using the `listen()` method of our client. This creates a listener
that goes and finds pending tasks for us to process.

As with the `create()` method, we have to provide the type of task that we want
this listener to process. We also provide a handler function that will be called
with each task that is received for processing. Within this function, we can
perform whatever operations (synchronous or asynchronous) that we want for the
task, and then return from the handler when we're finished processing. In this
example, we just update the data in the payload from `{ hello: 'world' }` to
`{ hello: 'irontask' }`. When we return from the handler, the task is completed
and the changes we made to the task are automatically saved.

What if your handler encounters an issue and throws an exception? The listener
captures the exception for you and schedules the task for another run using an
exponential backoff. If the task keeps failing, the listener will eventually
mark it as failed and stop redelivering it.

> Don't want retries? Want to tweak how many retries or how long to wait? Don't
> worry, you can customize all of these behaviors and do even more things, like
> deferring or deleting tasks while processing.

#### Step 3a: Stopping the Listener

In most cases, you will probably want to keep your listener running for the life
of your application. However, in this basic example, we only have one task we
want to process before we quit, so we stop the listener after some time to stop
it from asking for more tasks to process. We do this by calling `stop()` on the
listener.

```js
listener.stop();
```

#### Step 4: Getting the Updated Task

Now that we've finished processing the task, let's see what changed.

```js
// See what the task looks like after processing
const updatedTask = await client.get('sample-task', task.id);
```

Just as we can create and update tasks, we can also retrieve them. The simplest
form of this is the `get()` method, which retrieves the task with the type and
id we used when creating the task.

Fetching this updated task after processing will show a few changes:

- The task's `status` has changed from 'pending' to 'completed'
- The `payload` has been updated with the change we made while processing
- The `runs` property changes from 0 to 1 to reflect that we have processed the
  task once.

## Samples

### Creating a Task

#### Recurring Task - Numeric Interval

Creates a task running once every two minutes, with the first run scheduled for
the time the task is created.

```ts
const task = await client.create(
  'task-type',
  { task: 'payload' },
  {
    interval: 120000 // Run once every 2 minutes
  }
);
```

#### Recurring Task - Cron Interval

Creates a task running every 5th minute of every hour (e.g. 12:00, 12:05, 12:10,
etc.) and schedules the first run for the next matching time. For example, if it
is currently 12:02, the first run will be at 12:05.

```ts
const task = await client.create(
  'task-type',
  { task: 'payload' },
  {
    interval: '*/5 * * * *'
  }
);
```

#### Custom First Run Time

Schedules the first run (in this case the only run) of the task for five minutes
from now.

```ts
const date = new Date();
date.setMinutes(date.getMinutes() + 5);

const task = await client.create(
  'task-type',
  { task: 'payload' },
  {
    scheduledTime: date
  }
);
```

#### Disabled

Setting `enabled` to false prevents the task from being processed after being
created.

```ts
const task = await client.create(
  'task-type',
  { task: 'payload' },
  {
    enabled: false
  }
);
```

#### Custom ID

Sets the id to a custom value that is used later to retrieve the task.

```ts
const id = 'custom-id'; // This has to be unique

const task = await client.create(
  'task-type',
  { task: 'payload' },
  {
    id: id
  }
);

task.id === id; // returns true
```

### Retrieving a Task

Use the task's type and id to get it.

```ts
const task = await client.get('task-type', 'task-id');
```

### Listing Tasks

#### Within a Type

You can list tasks of a given type using the task type:

```ts
const tasks = await client.list('task-type');
```

This can also be accessed via an async iterator:

```ts
for await (const task of client.iterate('task-type')) {
  // Do something with each task
}
```

#### Across all Types

> NOTE: Listing across all types can be expensive if you have many types and/or
> jobs. Use with care.

You can list tasks across all types:

```ts
const tasks = await client.listAll();
```

Or iterate over them with an async iterator:

```ts
for await (const task of client.iterateAll()) {
  // Do something with each task
}
```

#### With Payload Excluded

You can omit all or part of the job payload from the result within a type:

```ts
const tasks = await client.listSummary('task-type');
```

Or across all types:

```ts
const tasks = await client.listAllSummary();
```

Iteration is also supported within a type:

```ts
for await (const task of client.iterateSummary('task-type')) {
  // Do something with each task
}
```

Or across all types:

```ts
for await (const task of client.iterateAllSummary()) {
  // Do something with each task
}
```

## Contributing

See [CONTRIBUTING.md][contributing] for full contribution guidelines.

[azure cosmos db]: https://azure.microsoft.com/services/cosmos-db/
[azure cosmos db emulator]:
  https://docs.microsoft.com/azure/cosmos-db/local-emulator
[azure cosmos db credentials]:
  https://docs.microsoft.com/en-us/azure/cosmos-db/create-sql-api-nodejs#update-your-connection-string
[contributing]: ./CONTRIBUTING.md
