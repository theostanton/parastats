import {Request, Response} from "express";
import {extractPilotFromJwt} from "../jwt";

export async function getSelf(req: Request, res: Response) {
    const user = await extractPilotFromJwt(req)
    res.status(200).json({user});
}