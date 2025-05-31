import express, {Request, Response} from "express";
import {verifyJwt} from "../jwt";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import {getSelf} from "./getSelf";
import {getFlights} from "./getFlights";
import {getFlight} from "./getFlight";
import {generateToken} from "./generateToken";
import {getTakeOff} from "./getTakeOff";

export default async function handler(req: Request, res: Response): Promise<void> {
    console.log("Received api body=", JSON.stringify(req.body));
    const verifyResult = await verifyJwt(req, res)
    if (!verifyResult.success) {
        console.log("Verification failed: ", JSON.stringify(verifyResult.error));
        return
    }
    const user = verifyResult.value

    res.status(200).send({"status": "OK", "hello": user.first_name});
}


const jsonParser = bodyParser.json({})

const app = express();
app.use('/token/', generateToken);
app.use(jsonParser)
app.use('/takeoffs/:id', getTakeOff);
app.use('/landings/:id', getTakeOff);
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

app.use('/flights', getFlights);
app.use('/flights/:id', getFlight);
app.use(getSelf);

export {app};