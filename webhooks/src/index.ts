import {Request, Response} from "express";

export const webhookHandler = (req: Request, res: Response) => {
    console.log("Received webhook:", req.body);
    console.log("Received webhook:", JSON.stringify(req.body));

    if (req.query['hub.mode'] == 'subscribe') {
        handleChallenge(req, res);
    } else {
        res.status(200).send({status: "OK"});
    }
};

function handleChallenge(req: Request, res: Response) {
    res.status(200).send({'hub.challenge': req.query['hub.challenge']});
}