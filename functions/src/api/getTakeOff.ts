import {Request, Response} from "express";

export async function getTakeOff(req: Request, res: Response) {
    res.status(404).send('getTakeOff');
}