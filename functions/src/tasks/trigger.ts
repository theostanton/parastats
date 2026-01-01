import {TaskBody, TaskName, failed, Either, success} from "@parastats/common";

const {CloudTasksClient} = require('@google-cloud/tasks').v2;

function getQueueId(taskName: TaskName): string | null {
    switch (taskName) {
        case "FetchAllActivities":
            return process.env.QUEUE_ID_FETCH_ACTIVITIES!!
        case "UpdateDescription":
            return process.env.QUEUE_ID_WING_ACTIVITY!!
        case "UpdateSingleActivity":
            // Use wing_activity queue for now; dedicated queue will be added in infrastructure update
            return process.env.QUEUE_ID_WING_ACTIVITY!!
        default:
            return null
    }

}

export default async function (task: TaskBody): Promise<Either<void>> {
    const client = new CloudTasksClient({})

    try {
        const queueId = getQueueId(task.name as TaskName);
        if (!queueId) {
            return failed(`No queue id found for =${task.name}`)
        }
        const response = await client.createTask({
            parent: queueId,
            task: {
                httpRequest: {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    url: process.env.TASKS_URL,
                    httpMethod: "POST",
                    body: Buffer.from(JSON.stringify(task)).toString('base64')
                }
            }
        })
        console.log(`Triggered task=${task} response=${JSON.stringify(response)}`)
        return success(undefined)
    } catch (err) {
        console.log(err)
        return failed(`Failed to create task body=${task} err=${err}`)
    }
}