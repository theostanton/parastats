import {Request, Response} from "express";
import {StravaAthlete} from "../model/stravaApi/model";
import axios from "axios";
import {StravaApi} from "../model/stravaApi";
import {getDatabase} from "../model/database/client";
import {UserRow} from "../model/database/model";
import trigger from "../tasks/trigger";

export async function handleCode(req: Request, res: Response) {
    console.log("handleCode code=", req.query['code'])
    type Response = {
        access_token: string,
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

    const token = body.access_token
    const api = new StravaApi(token)
    const database = await getDatabase()

    // Fetch profile
    const athlete = await api.fetchAthlete()

    // Save profile to `user` table
    const result = await database.query<UserRow>(`
                INSERT INTO users (user_id, first_name, token)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id)
                    DO UPDATE SET first_name = $4,
                                  token      = $5;`,
        [athlete.id, athlete.firstname, token, athlete.firstname, token]
    )
    console.log(`Inserted user ${result.rows[0]}`)

    await trigger({name: "FetchAllActivities", userId: athlete.id})

    res.status(200).send({status: "OK", action: "handleCode"});
}