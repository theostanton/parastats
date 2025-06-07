import {Request, Response} from "express";
import {extractPilotFromJwt, generateJwt, sign} from "@/jwt";
import {Pilots} from "@/database/Pilots";
import {StravaAthleteId} from "@/stravaApi/model";

export async function generateToken(req: Request, res: Response) {
    const pilotIdRaw = req.query.pilot_id

    console.log(`generateToken pilotIdRaw=${pilotIdRaw}`)

    if (!pilotIdRaw) {
        res.status(400).json({error: "pilot_id is required"})
        return
    }

    const pilotId = Number.parseInt(pilotIdRaw as string)

    const jwtToken = generateJwt(pilotId)
    const accessTokenResult = await Pilots.getAccessToken(pilotId)

    if (accessTokenResult.success) {
        res.status(200).json({
            jwtToken,
            accessToken: accessTokenResult.value
        });
    } else {
        res.status(400).json({error: accessTokenResult.error})
    }
}