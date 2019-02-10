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
    const task = await client.create('disable-task', { hello: 'world' });

    console.log(`Created task with id ${task.id}:`);
    console.log(task);

    // Start listening for the task
    const listener = client.listen('disable-task', async task => {
        console.log(`Received task with id ${task.id} for processing`);
        console.log('Waiting for task to be disabled');

        await new Promise(resolve => task.once('disabled', resolve));

        console.log(`Received disabled signal in listener. Current status: ${task.status}`);

        // Complete the task
        await task.release();
        console.log(`Released task with id ${task.id} because it was disabled`);
    });

    await delay(1000);

    await task.disable();
    console.log(`Disabled task from client`);

    // Once we no longer want to listen for tasks, shut down the listener so our
    // process can exit
    await delay(10000);
    listener.stop();

    // See what the task looks like after processing
    const updatedTask = await client.get('disable-task', task.id);
    console.log(`Updated task status from client: ${updatedTask.status}`);

    await client.delete('disable-task');
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
