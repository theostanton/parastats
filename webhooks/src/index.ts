import {Request, Response} from "express";
import {getDatabase} from "./database/index";

export async function webhookHandler(req: Request, res: Response): Promise<void> {
    console.log("Received webhook:", req.body);
    console.log("Received webhook:", JSON.stringify(req.body));

    if (req.query['code']) {
        handleCode(req,res)
    } else if (req.query['hub.mode'] == 'subscribe') {
        handleChallenge(req, res);
    } else {
        const client = await getDatabase()
        const rows = await client.query<UserRow>("SELECT * FROM users")
        const users: UserRow[] = [...rows]

        res.status(200).send({status: "OK", users: users});
    }
}

function handleChallenge(req: Request, res: Response) {
    res.status(200).send({'hub.challenge': req.query['hub.challenge']});
}

function handleCode(req: Request, res: Response) {
    //https://webhooks.parastats.info/?state=&code=dc9f4bba26200268407d872afe1a0e6dd0cbe650&scope=read,activity:write,activity:read_all,read_all

}

