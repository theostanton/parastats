"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const model_1 = require("../model/model");
const { CloudTasksClient } = require('@google-cloud/tasks').v2;
function getQueueId(taskName) {
    switch (taskName) {
        case "FetchAllActivities":
            return process.env.QUEUE_ID_FETCH_ACTIVITIES;
        case "WingActivity":
            return process.env.QUEUE_ID_WING_ACTIVITY;
        default:
            return null;
    }
}
async function default_1(task) {
    const client = new CloudTasksClient({});
    try {
        const queueId = getQueueId(task.name);
        if (!queueId) {
            return (0, model_1.failed)(`No queue id found for =${task.name}`);
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
        });
        console.log(`Triggered task=${task} response=${JSON.stringify(response)}`);
        return (0, model_1.success)(undefined);
    }
    catch (err) {
        console.log(err);
        return (0, model_1.failed)(`Failed to create task body=${task} err=${err}`);
    }
}
