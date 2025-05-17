import express, {Request, Response} from "express";
import {verifyJwt} from "../jwt";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import {getSelf} from "./getSelf";
import {getActivities} from "./getActivities";
import {getActivity} from "./getActivity";
import {generateToken} from "./generateToken";

export default async function handler(req: Request, res: Response): Promise<void> {
    console.log("Received api body=", JSON.stringify(req.body));
    const verifyResult = await verifyJwt(req, res)
    if (!verifyResult.success) {
        console.log("Verification failed: ", JSON.stringify(verifyResult.error));
        return
    }
    const user = verifyResult.value

    // const database = await getDatabase();
    // const result = await database.query<UserRow>("SELECT * FROM users")
    // const users = [...result];

    res.status(200).send({"status": "OK", "hello": user.first_name});
}


const jsonParser = bodyParser.json({})

const app = express();
app.use('/token/', generateToken);
app.use(cookieParser())
app.use(async (req, res, next) => {
    console.log(`verifying req.cookies.sid=${req.cookies.sid}`)
    const userResult = await verifyJwt(req, res);
    if (userResult.success) {
        console.log(`Verified user=${JSON.stringify(userResult.value)}`);
        next()
    } else {
        console.log(`Auth failed error=${userResult.error}`)
    }
});

app.use(jsonParser)
app.use('/activities', getActivities);
app.use('/activities/:id', getActivity);
app.use(getSelf);

export {app};