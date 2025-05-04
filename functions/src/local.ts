import express, {json, Request, Response} from 'express';
import bodyParser from 'body-parser';
import {tasksHandler, webhooksHandler} from "./index";
import {config} from "dotenv"
config()

const app = express();
const jsonParser = bodyParser.json()
const PORT = process.env.PORT || 3000;


app.post('/tasks', jsonParser, async (req: Request, res: Response) => {
    await tasksHandler(req, res);
});

app.post('/webhooks', jsonParser, async (req: Request, res: Response) => {
    await webhooksHandler(req, res);
});

app.get('/', async (req: Request, res: Response) => {
    res.status(200).send('OK')
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});