import {Request, Response} from "express";
import {extractUserFromJwt, generateJwt, sign} from "../jwt";

export async function generateToken(req: Request, res: Response) {
    const userId = req.query.user_id

    console.log(`generateToken userId=${userId}`)

    if (!userId) {
        res.status(400).json({error: "user_id is required"})
        return
    }

    const jwtToken = generateJwt(Number.parseInt(userId as string))
    res.status(200).json({
        jwtToken: jwtToken
    });
}