import {Request, Response} from "express";
import {extractUserFromJwt} from "../jwt";

export async function getSelf(req: Request, res: Response) {
    const user = await extractUserFromJwt(req)
    res.status(200).send(`Hello ${user.first_name}`);
}