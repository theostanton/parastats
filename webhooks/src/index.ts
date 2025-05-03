import {Request, Response} from "express";
import {handleCode} from "./executables/handleCode";
import {handleChallenge} from "./executables/handleChallenge";
import {getDatabase} from "./model/database/client";
import {UserRow} from "./model/database/model";

// noinspection JSUnusedGlobalSymbols
export async function webhookHandler(req: Request, res: Response): Promise<void> {
    console.log("Received webhook body=", req.body);

    if (req.query['code']) {
        await handleCode(req, res)
    } else if (req.query['hub.mode'] == 'subscribe') {
        await handleChallenge(req, res);
    } else {
        res.status(200).send({status: "OK", hello: "world"});
    }
}

