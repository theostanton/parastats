import {Request, Response} from "express";
import {extractUserFromJwt, sign} from "../jwt";

export async function generateToken(req: Request, res: Response) {
    const userId = req.query.user_id

    console.log(`generateToken userId=${userId}`)

    if (!userId) {
        res.status(400).json({error: "user_id is required"})
        return
    }

    const jwtToken = sign(Number.parseInt(userId as string), res)
    res.status(200).json({
        jwtToken: jwtToken
    });
}