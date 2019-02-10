const { TaskClient } = require('..');

require('util').inspect.defaultOptions.depth = 10;

const account = process.argv[2];
const database = process.argv[3];
const collection = process.argv[4];
const key = process.argv[5];

async function main() {
    const client = await TaskClient.create(account, database, collection, key, {
        // We speed up our polling so it's easier to see the repeated delivery
        // with such a tight window.
        pollIntervalMs: 1000
    });
    console.log('Created client');

    // Create a task that runs on every 5th second of each minute
    const task = await client.create('recurring-task', { counter: 1 }, {
        interval: '*/5 * * * * *'
    });

    console.log(`Created task with id ${task.id}:`);
    console.log(task);

    // Start listening for the task
    const listener = client.listen('recurring-task', async task => {
        const run = task.payload.counter;
        console.log(`Received task with id ${task.id} for processing: run ${run}`);

        // Increment our counter
        task.payload.counter++;

        if (task.payload.counter <= 5) {
            // Complete the task for the first 5 runs
            await task.complete();
            console.log(`Finished processing task run ${run}`);
        } else {
            // Delete the task after the 5th run so our test doesn't run forever
            await task.delete();
            console.log('Deleted task after 5 runs');
            
            // We're not listening for anything else, so we can stop the
            // listener
            listener.stop();
        }
    });
}

process.on('unhandledRejection', err => {
    console.log(err);
    process.exit(1);
})

main().catch(err => {
    console.log(err);
    process.exit(1);
});

