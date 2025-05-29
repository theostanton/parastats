import {getDatabase} from "./client";
import {Success, Failed, Result} from "../model";
import {PilotRow, PilotRowFull} from "./model";
import axios from "axios";

export namespace Pilots {
    export async function insert(pilot: PilotRowFull): Promise<void> {
        const database = await getDatabase()
        await database.query("INSERT into pilots (user_id, first_name, strava_access_token, strava_refresh_token, strava_expires_at) values ($1, $2, $3,$4, $5)",
            [pilot.user_id, pilot.first_name, pilot.strava_access_token, pilot.strava_refresh_token, pilot.strava_expires_at]);
    }

    export async function get(userId: number): Promise<Result<PilotRow>> {
        console.log(`Pilot.get() userId=${userId}`);
        const database = await getDatabase()
        const result = await database.query<PilotRow>("select user_id,first_name from pilots where user_id = $1", [userId])
        console.log('result', result)
        if (result.rows.length === 1) {
            return new Success(result.rows[0].reify())
        } else {
            return new Failed(`No results for userId=${userId}`)
        }
    }

    export async function getFull(userId: number): Promise<Result<PilotRowFull>> {
        console.log(`users.get() userId=${userId}`);
        const database = await getDatabase()
        const result = await database.query<PilotRowFull>("select user_id,first_name,strava_access_token, strava_refresh_token, strava_expires_at from pilots where user_id = $1", [userId])
        console.log('result', result)
        if (result.rows.length === 1) {
            return new Success(result.rows[0].reify())
        } else {
            return new Failed(`No results for userId=${userId}`)
        }
    }

    export async function getAccessToken(userId: number): Promise<Result<string>> {
        const database = await getDatabase()
        const result = await database.query<PilotRowFull>(
            "select user_id,first_name,strava_access_token,strava_refresh_token,strava_expires_at  from pilots where user_id = $1",
            [userId]
        )

        if (result.rows.length === 1) {
            const userRowFull = result.rows[0].reify()

            if (userRowFull.strava_expires_at < new Date()) {
                console.log('Refreshing token')
                const params = new URLSearchParams({
                    client_id: process.env.CLIENT_ID!!.toString(),
                    client_secret: process.env.CLIENT_SECRET!!.toString(),
                    grant_type: "refresh_token",
                    refresh_token: userRowFull.strava_refresh_token,
                }).toString();

                let url = `https://www.strava.com/oauth/token?${params}`;
                const response = await axios.post(url)
                if (response.status != 200) {
                    throw new Failed(`Failed to refresh access token: status=${response.status} ${JSON.stringify(response)}`);
                }

                console.log(`Got refresh response =${JSON.stringify(response.data)}`)

                const newUserFullRow: PilotRowFull = {
                    user_id: userRowFull.user_id,
                    first_name: userRowFull.first_name,
                    strava_access_token: response.data.access_token,
                    strava_refresh_token: response.data.refresh_token,
                    strava_expires_at: new Date(response.data.strava_expires_at * 1000),
                }
                console.log('newUserFullRow', JSON.stringify(newUserFullRow))
                await insert(newUserFullRow)

                return new Success(newUserFullRow.strava_access_token)
            } else {
                return new Success(result.rows[0].reify().strava_access_token)
            }
        } else {
            return new Failed(`No results for userId=${userId}`)
        }
    }
}