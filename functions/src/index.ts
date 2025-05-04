import {Request, Response} from "express";
import {handleCode} from "./webhooks/handleCode";
import {handleChallenge} from "./webhooks/handleChallenge";
import {TaskBody, taskHandlers} from "./tasks/model";

// noinspection JSUnusedGlobalSymbols
export async function webhooksHandler(req: Request, res: Response): Promise<void> {
    console.log("Received webhook body=", req.body);

    if (req.query['code']) {
        await handleCode(req, res)
    } else if (req.query['hub.mode'] == 'subscribe') {
        await handleChallenge(req, res);
    } else {
        res.status(200).send({status: "OK", hello: "world"});
    }
}

// noinspection JSUnusedGlobalSymbols
export async function tasksHandler(req: Request, res: Response): Promise<void> {
    console.log("Received task body=", JSON.stringify(req.body));

    const task: TaskBody = req.body;

    if (!task.name) {
        res.status(400).send(`No task name provided in body=${JSON.stringify(req.body)}`);
        return
    }

    if (!taskHandlers.hasOwnProperty(task.name)) {
        res.status(400).send(`No task handler for ${task.name}`);
        return
    }
    const taskHandler = taskHandlers[task.name];
    const result = await taskHandler(task)

    if (result.success) {
        console.log(`${task.name} succeeded for body=${JSON.stringify(task)}`);
        res.status(200).send({status: "OK", task: task.name});
    } else {
        console.log(`${task.name} failed. Message=${result.message}`);
        res.status(500).send({status: "Failed", task: task.name, message: result.message});
    }

}

