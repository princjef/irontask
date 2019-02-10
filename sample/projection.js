const { TaskClient, t } = require('..');

require('util').inspect.defaultOptions.depth = 10;

const account = process.argv[2];
const database = process.argv[3];
const collection = process.argv[4];
const key = process.argv[5];

async function main() {
    const baseClient = await TaskClient.create(account, database, collection, key);

    // Scoped client to make call patterns easier. this is optional
    const client = baseClient.type('projected-task');

    console.log('Created client');

    // Create a few tasks with some different parameters
    const task1 = await client.create({
        hello: 'world',
        additional: {
            nested: 'data'
        },
        array: [
            'as',
            'well'
        ]
    });

    const task2 = await client.create({
        hello: 'cosmos',
        additional: {
            other: 'data'
        },
        array: [
            { inner: 123 },
            { inner: 345 }
        ]
    });

    console.log('\nCreated the following tasks:');
    console.log(task1);
    console.log(task2);

    await delay(1000);

    console.log('\nFetching all tasks:');
    console.log(await client.list());

    await delay(1000);

    console.log('\nFetching task summaries:');
    console.log(await client.listSummary());

    await delay(1000);

    console.log('\nFetching task summaries, project additional, array:');
    console.log(await client.listSummary({
        project: [
            t.payload('additional'),
            t.payload('array')
        ]
    }));

    await delay(1000);

    console.log('\nFetching task summaries, project nested, array index:');
    console.log(await client.listSummary({
        project: [
            t.payload('additional', 'nested'),
            t.payload('array', 1)
        ]
    }));

    console.log('\nDeleting all tasks');
    await client.delete();
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

