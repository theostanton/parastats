import jwt from "jsonwebtoken";
import {Request, Response} from "express";
import {Pilots} from "./model/database/pilots";
import {PilotRow} from "./model/database/model";
import {failed, Result, success} from "./model/model";

export function generateJwt(userId: number): string {
    console.log(`generateJwt process.env.SESSION_SECRET=${process.env.SESSION_SECRET}`)
    return jwt.sign(
        {sub: userId, typ: 'session'},
        process.env.SESSION_SECRET!,
        {expiresIn: '7d', algorithm: 'HS256'}
    );

}

export function sign(userId: number, res: Response): string {
    console.log(`sign process.env.SESSION_SECRET=${process.env.SESSION_SECRET}`)

    const jwtToken = generateJwt(userId)
    res.cookie('sid', jwtToken, {
        domain: "parastats.info",
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        maxAge: 2 * 60 * 60 * 1000 // 2 hours
    });

    return jwtToken
}

export async function verifyJwt(req: Request, res: Response): Promise<Result<PilotRow>> {

    if (!process.env.SESSION_SECRET?.length) {
        throw Error('Session Secret required');
    }

    try {
        console.log(`verifyJwt`);

        const payload = jwt.verify(req.cookies.sid, process.env.SESSION_SECRET!);
        const userId = payload.sub as unknown as number
        console.log(`verifyJwt userId ${userId}`);
        const result = await Pilots.get(userId);
        console.log('result', result);
        if (result.success) {
            return success(result.value)
        }
        res.status(401).end()
    } catch {
        res.status(401).end();
    }
    return failed("401")
}

export async function extractUserFromJwt(req: Request): Promise<PilotRow> {
    const payload = jwt.verify(req.cookies.sid, process.env.SESSION_SECRET!);
    const userId = payload.sub as unknown as number
    const result = await Pilots.get(userId);
    if (result.success) {
        return result.value
    }
    throw "Tried to extractUserFromJwt on unverified jwt"
}