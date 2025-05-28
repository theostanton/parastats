import {failure, Result, success} from "@model/Result";
import {TakeOff} from "@model/TakeOff";
import {getDatabase} from "./client";
import {Pilot} from "@model/Pilot";
import {Activity} from "@model/Activity";

export async function getActivities(): Promise<Result<Activity[]>> {
    const database = await getDatabase()
    const result = await database.query<Activity>(`
        select user_id,
               activity_id,
               wing,
               duration_sec,
               distance_meters,
               start_date,
               description_status,
               description
        from activities`)
    if (result.rows) {
        return success(result.rows.map(row => row.reify()))
    } else {
        return failure(`No activities`)
    }
}

export async function getActivitiesForPilot(user_id: number, limit: number = 1000): Promise<Result<Activity[]>> {
    const database = await getDatabase()
    const result = await database.query<Activity>(`
        select user_id,
               activity_id,
               wing,
               duration_sec,
               distance_meters,
               start_date,
               description_status,
               description
        from activities
        where user_id = $1
        limit $2`, [user_id, limit])
    if (result.rows) {
        return success(result.rows.map(row => row.reify()))
    } else {
        return failure(`No activities for user_id=${user_id}`)
    }
}

export async function getActivitiesForPilotAndWing(user_id: number, wing: string): Promise<Result<Activity[]>> {
    const database = await getDatabase()
    const result = await database.query<Activity>(`
        select user_id,
               activity_id,
               wing,
               duration_sec,
               distance_meters,
               start_date,
               description_status,
               description
        from activities
        where user_id = $1
          and lower(wing) = $2`, [user_id, wing])
    if (result.rows) {
        return success(result.rows.map(row => row.reify()))
    } else {
        return failure(`No activities for user_id=${user_id} && wing=${wing}`)
    }
}

export async function getActivity(activity_id: number): Promise<Result<Activity>> {
    const database = await getDatabase()
    const result = await database.query<Activity>(`
        select user_id,
               activity_id,
               wing,
               duration_sec,
               distance_meters,
               start_date,
               description_status,
               description
        from activities
        where activity_id = $1`, [activity_id])
    if (result.rows.length === 1) {
        return success(result.rows[0].reify())
    } else {
        return failure(`No activity for activity_id=${activity_id}`)
    }
}