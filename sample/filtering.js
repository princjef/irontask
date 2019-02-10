const { TaskClient, t, q } = require('..');

require('util').inspect.defaultOptions.depth = 10;

const account = process.argv[2];
const database = process.argv[3];
const collection = process.argv[4];
const key = process.argv[5];

async function main() {
    const baseClient = await TaskClient.create(account, database, collection, key);

    // Scoped client to make call patterns easier. this is optional
    const client = baseClient.type('filtered-task');

    console.log('Created client');

    // Create a few tasks with some different parameters
    const task1 = await client.create({ hello: 'world' });
    const task2 = await client.create({ hello: 'cosmos', nested: { num: 3 } });
    const task3 = await client.create({ hello: 'world', nested: { num: 2 } });

    console.log('\nCreated the following tasks:');
    console.log(task1);
    console.log(task2);
    console.log(task3);

    await delay(1000);

    console.log('\nFetching all tasks:');
    console.log(await client.list());

    await delay(1000);

    console.log('\nFetching hello world tasks:');
    console.log(await client.list({
        filter: q.equal(t.payload('hello'), 'world')
    }));

    await delay(1000);

    console.log('\nFetching nested num tasks (sort ascending by nested num):');
    console.log(await client.list({
        filter: q.isDefined(t.payload('nested', 'num')),
        sort: {
            expression: t.payload('nested', 'num'),
            order: 'ASC'
        }
    }));

    await delay(1000);

    console.log('\nFetching enabled hello cosmos with nested num over 2:');
    console.log(await client.list({
        filter: q.and(
            t.enabled,
            q.equal(t.payload('hello'), 'cosmos'),
            q.greaterThanOrEqual(t.payload('nested', 'num'), 3)
        )
    }));

    console.log('\nDeleting all tasks');
    for (const task of [task1, task2, task3]) {
        await task.delete();
    }
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
