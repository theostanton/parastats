import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import handler from "./index";

const app = express();
const jsonParser = bodyParser.json()

if (!process.env.PORT) {
    throw new Error('PORT environment variable is required');
}
const PORT = process.env.PORT

app.get('/', jsonParser, async (req: Request, res: Response) => {
    await handler(req, res);
});

app.listen(PORT, () => {
    console.log(`Tasks is running on port ${PORT}`);
});