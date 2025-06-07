import {Request, Response} from "express";
import {StravaAthlete} from "@/stravaApi/model";
import axios from "axios";
import {StravaApi} from "@/stravaApi";
import {withPooledClient} from "@/database/client";
import {PilotRow} from "@/database/model";
import trigger from "@/tasks/trigger";
import {sign} from "@/jwt";

export async function handleCode(req: Request, res: Response) {
    console.log("handleCode code=", req.query['code'])
    type Response = {
        access_token: string,
        refresh_token: string,
        expires_at: number,
        athlete: StravaAthlete
    }

    const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID!!.toString(),
        client_secret: process.env.CLIENT_SECRET!!.toString(),
        code: req.query['code']!!.toString(),
        grant_type: "authorization_code"
    }).toString();
    let url = `https://www.strava.com/oauth/token?${params}`;

    const response = await axios.post<Response>(url)

    const body = response.data
    console.log("handleCode body=")
    console.log(body)

    const {access_token, refresh_token, expires_at} = body
    const api = StravaApi.fromAccessToken(access_token)

    // Fetch profile
    const athlete = await api.fetchAthlete()

    // Save profile to `user` table
    await withPooledClient(async (database) => {
        let expiresAtDate = new Date(expires_at * 1000);
        await database.query<PilotRow>(`
                INSERT INTO pilots (pilot_id,
                                    first_name,
                                    strava_access_token,
                                    strava_refresh_token,
                                    strava_expires_at)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (pilot_id)
                    DO UPDATE SET first_name           = $6,
                                  strava_access_token  = $7,
                                  strava_refresh_token = $8,
                                  strava_expires_at    = $9;`,
            [athlete.id, athlete.firstname, access_token, refresh_token, expiresAtDate,
                athlete.firstname, access_token, refresh_token, expiresAtDate]
        )
    })
    console.log(`Inserted user`)

    await trigger({name: "FetchAllActivities", pilotId: athlete.id})

    sign(athlete.id, res)

    res.redirect('https://paragliderstats.com/welcome');
}