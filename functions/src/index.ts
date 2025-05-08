import {Request, Response} from "express";
import webhooks from "./webhooks";
import tasks from "./tasks";

// noinspection JSUnusedGlobalSymbols
export async function webhooksHandler(req: Request, res: Response): Promise<void> {
    await webhooks(req, res);
}

// noinspection JSUnusedGlobalSymbols
export async function tasksHandler(req: Request, res: Response): Promise<void> {
    await tasks(req, res);
}

