const { TaskClient } = require('..');

require('util').inspect.defaultOptions.depth = 10;

const account = process.argv[2];
const database = process.argv[3];
const collection = process.argv[4];
const key = process.argv[5];

async function main() {
    const client = await TaskClient.create(account, database, collection, key);
    console.log('Created client');

    // Create a task that runs once
    const task = await client.create('sample-task', { hello: 'world' });

    console.log(`Created task with id ${task.id}:`);
    console.log(task);

    // Start listening for the task
    const listener = client.listen('sample-task', async task => {
        console.log(`Received task with id ${task.id} for processing`);

        // Update some information
        task.payload.hello = 'cosmos';

        // Complete the task
        await task.complete();
        console.log(`Finished processing task with id ${task.id}`);
    });

    // Once we no longer want to listen for tasks, shut down the listener so our
    // process can exit
    await delay(7000);
    listener.stop();

    // See what the task looks like after processing
    const updatedTask = await client.get('sample-task', task.id);
    console.log('Updated task:');
    console.log(updatedTask);
}

process.on('unhandledRejection', err => {
    console.log(err);
    process.exit(1);
})

main().catch(err => {
    console.log(err);
    process.exit(1);
});

function delay(delayMs) {
    return new Promise(resolve => setTimeout(resolve, delayMs));
}