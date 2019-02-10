const { TaskClient } = require('..');

require('util').inspect.defaultOptions.depth = 10;

const taskCount = 10000;
const listenerCount = 10;
const pollIntervalMs = 1000;
const maxActiveTasks = 25;
const createParallelism = 25;

const account = process.argv[2];
const database = process.argv[3];
const collection = process.argv[4];
const key = process.argv[5];

async function main() {
    const client = await TaskClient.create(
        account,
        database,
        collection,
        key
    );

    console.log('Clearing old tasks');

    const tasks = await client.list('stress-task', { top: 100000 });
    const groupedTasks = [];
    for (let i = 0; i < tasks.length / 100; i++) {
        const start = i * 100;
        groupedTasks.push(tasks.slice(start, start + 100));
    }

    for (const group of groupedTasks) {
        await Promise.all(group.map(task => client.delete(task.type, task.id)));
    }

    console.log('Cleared old tasks, creating tasks');

    const startTime = Date.now();
    let receivedCount = 0;
    let failCount = 0;

    for (let i = 0; i < listenerCount; i++) {
        client.listen('stress-task', async task => {
            try {
                // Force an extra save in the middle
                task.payload.some = 'updated task';
                await task.save();

                // Finish processing
                task.payload.some = 'doubly updated task';
                await task.complete();
            } catch (e) {
                console.log(e.message);
                console.log(task.payload);
                failCount++;
            } finally {
                if (++receivedCount >= taskCount) {
                    const elapsed = Date.now() - startTime;
                    console.log(`Finished processing in ${elapsed}ms, ${failCount} failures, ${1000 * receivedCount / elapsed} RPS`);
                    process.exit();
                }
            }
        }, {
            maxActiveTasks,
            pollIntervalMs
        });
    }

    setInterval(() => {
        const elapsed = Date.now() - startTime;
        console.log(`Elapsed: ${elapsed}, Total: ${receivedCount}, Fail: ${failCount}, RPS: ${1000 * receivedCount / elapsed}`)
    }, 1000);

    let tasksToCreate = taskCount;
    await Promise.all(Array(createParallelism).fill(null).map(createTask));

    async function createTask() {
        if (tasksToCreate-- <= 0) {
            return;
        }

        await client.create('stress-task', {
            some: 'task',
            data: [
                'in',
                'an',
                'array'
            ]
        });

        await createTask();
    }

    console.log('Created tasks');
}

process.on('unhandledRejection', err => {
    console.log(err);
    process.exit(1);
});

main().catch(err => {
    console.log(err);
    process.exit(1);
});
