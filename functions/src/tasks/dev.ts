import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import handler from "./index";

import {config} from "dotenv"

config()

const app = express();
const jsonParser = bodyParser.json()

if (!process.env.TASKS_PORT) {
    throw new Error('TASKS_PORT environment variable is required');
}
const port = process.env.TASKS_PORT

app.post('/', jsonParser, async (req: Request, res: Response) => {
    await handler(req, res);
});

app.listen(port, () => {
    console.log(`Tasks is running on port ${port}`);
});