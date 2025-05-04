import {StravaActivity} from "../../model/stravaApi/model";
import {ActivityRow} from "../../model/database/model";

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