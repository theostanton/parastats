import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import handler from "./index";

const app = express();
const jsonParser = bodyParser.json()

if (!process.env.WEBHOOKS_PORT) {
    throw new Error('WEBHOOKS_PORT environment variable is required');
}
const PORT = process.env.WEBHOOKS_PORT

app.get('/', jsonParser, async (req: Request, res: Response) => {
    await handler(req, res);
});

app.listen(PORT, () => {
    console.log(`Webhooks is running on port ${PORT}`);
});