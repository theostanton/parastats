import {StravaApi} from "../model/stravaApi";
import {getDatabase} from "../model/database/client";
import {StravaActivity} from "../model/stravaApi/model";
import {insertActivities} from "../model/database/activities";
import {isFailed} from "../model/model";
import {ActivityRow, UserRow} from "../model/database/model";

export type InitialiseUserResult = {
    success: boolean,
    message: string,
}

export default async function (token: string): Promise<InitialiseUserResult> {

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

    // Fetch activities
    const fetchWingedActivitiesResult = await api.fetchWingedActivities()

    if (!fetchWingedActivitiesResult.success) {
        return {
            success: false,
            message: `fetchWingedActivities failed: ${fetchWingedActivitiesResult.error}`
        }
    }
    const wingedActivities = fetchWingedActivitiesResult.value
    console.log(`Got ${wingedActivities.length} winged activities`)

    // Convert to ActivityRows
    const activityRows = convertStravaActivities(athlete.id, wingedActivities)
    console.log(`Got ${activityRows.length} activity rows`)

    // Insert winged activities to activities
    const insertActivitiesResult = await insertActivities(activityRows)
    if (!insertActivitiesResult.success) {
        return {
            success: false,
            message: `insertActivities failed: ${insertActivitiesResult.error}`
        }
    }
    console.log(`Inserted ${activityRows.length} activity rows`)

    // Edit recent activities
    //TODO

    return {
        success: true,
        message: `Inserted ${athlete.firstname} wingedActivities=${wingedActivities.length}`
    }

}

export function convertStravaActivities(userId: number, stravaActivities: StravaActivity[]): ActivityRow[] {
    return stravaActivities.map<ActivityRow | null>(stravaActivity => {

        const matches = stravaActivity.description
            .split("\n")
            .map((line) => line.match(/^🪂 ([a-zA-Z ]*)/g))
            .filter(match => match != null && match.length > 0)
            .map((line) => line!![0].replace("🪂 ", ""))

        if (matches.length == 0) {
            return null
        }
        const wing = matches[0]

        const result: ActivityRow = {
            user_id: userId,
            activity_id: stravaActivity.id,
            distance_meters: stravaActivity.distance,
            duration_sec: stravaActivity.elapsed_time,
            wing: wing,
            start_date: stravaActivity.start_date,
            description: stravaActivity.description,
            description_status: "todo"
        }
        return result
    }).filter(activity => activity != null)
}