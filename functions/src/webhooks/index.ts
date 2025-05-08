import {Request, Response} from "express";
import {handleCode} from "./handleCode";
import {handleChallenge} from "./handleChallenge";

export default async function handler(req: Request, res: Response): Promise<void> {
    console.log("Received webhook body=", req.body);
    
    if (req.query['code']) {
        await handleCode(req, res)
    } else if (req.query['hub.mode'] == 'subscribe') {
        await handleChallenge(req, res);
    } else {
        res.status(200).send({status: "OK", hello: "world"});
    }
}