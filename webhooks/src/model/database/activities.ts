import {StravaActivity} from "../stravaApi/model";
import {getDatabase} from "./client";

export async function insertActivities(activities:ActivityRow[]){
    const database = await getDatabase()
    await database.query("insert into activities(user_id, activity_id, wing, duration_sec, distance_meters) values($1, $2, $3, $4, $5)", activities)
}