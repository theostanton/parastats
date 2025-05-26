"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const model_1 = require("./model");
async function handler(req, res) {
    console.log("Received task body=", JSON.stringify(req.body));
    const task = req.body;
    if (!task.name) {
        const errorMessage = `No task name provided in body=${JSON.stringify(req.body)}`;
        console.error(errorMessage);
        res.status(400).send(errorMessage);
        return;
    }
    if (!model_1.taskHandlers.hasOwnProperty(task.name)) {
        const errorMessage = `No task handler for ${task.name}`;
        console.error(errorMessage);
        res.status(400).send(errorMessage);
        return;
    }
    const taskHandler = model_1.taskHandlers[task.name];
    const result = await taskHandler(task);
    if (result.success) {
        console.log(`${task.name} succeeded for body=${JSON.stringify(task)}`);
        res.status(200).send({ status: "OK", task: task.name });
    }
    else {
        console.error(`${task.name} failed. Message=${result.message}`);
        res.status(500).send({ status: "Failed", task: task.name, message: result.message });
    }
}
