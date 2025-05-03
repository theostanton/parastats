import {Request, Response} from "express";

export async function handleChallenge(req: Request, res: Response) {
    res.status(200).send({'hub.challenge': req.query['hub.challenge']});
}