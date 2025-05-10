import {Request, Response} from "express";
import webhooksHandler from "./webhooks";
import tasksHandler from "./tasks";
import {app} from "./api";

// noinspection JSUnusedGlobalSymbols
export async function webhooks(req: Request, res: Response): Promise<void> {
    await webhooksHandler(req, res);
}

// noinspection JSUnusedGlobalSymbols
export async function tasks(req: Request, res: Response): Promise<void> {
    await tasksHandler(req, res);
}


// noinspection JSUnusedGlobalSymbols
// export async function api(req: Request, res: Response): Promise<void> {
//     await apiHandler(req, res);
// }

exports.api = app

