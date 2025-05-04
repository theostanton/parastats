import {expect, test} from "vitest";

const {CloudTasksClient} = require('@google-cloud/tasks').v2;

test('Test create task', async () => {

    const queueId = process.env.QUEUE_ID
    expect(queueId).toBeTruthy()
    const tasksUrl = process.env.TASKS_URL
    expect(tasksUrl).toBeTruthy()

    const client = new CloudTasksClient({})

    const response = await client.createTask({
        parent: queueId,
        task: {
            httpRequest: {
                headers: {
                    "Content-Type": "application/json"
                },
                url: tasksUrl,
                httpMethod: "POST",
                body: Buffer.from(JSON.stringify({"test": "Body"})).toString('base64')
            }
        }
    })

    console.log("Created task=", JSON.stringify(response, null, 4));
    expect(response).toBeTruthy()
})