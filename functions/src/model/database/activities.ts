import {getDatabase} from "./client";
import {Failed, failed, Result, Success, success} from "../model";
import {ActivityRow} from "./model";

export namespace activities {
    export async function get(activityId: number): Promise<Result<ActivityRow>> {
        const database = await getDatabase()
        const result = await database.query<ActivityRow>(`
            select user_id,
                   activity_id,
                   wing,
                   duration_sec,
                   distance_meters,
                   start_date,
                   description_status,
                   description
            from activities
            where activity_id = $1`, [activityId])
        if (result.rows.length === 1) {
            return new Success(result.rows[0].reify())
        } else {
            return new Failed(`No results for activityId=${activityId}`)
        }
    }
}

export async function upsertActivities(activities: ActivityRow[]): Promise<Result<void>> {
    const database = await getDatabase()
    try {

        for await (const activity of activities) {
            console.log(`Inserting ${JSON.stringify(activity)}`)
            await database.query(`
                        insert into activities(user_id,
                                               activity_id,
                                               wing,
                                               duration_sec,
                                               distance_meters,
                                               start_date,
                                               description)
                        values ($1, $2, $3, $4, $5, $6, $7)
                        on conflict(activity_id)
                            do update set wing=$8,
                                          duration_sec=$9,
                                          distance_meters=$10,
                                          start_date=$11,
                                          description=$12;
                `,
                [
                    activity.user_id,
                    activity.activity_id,
                    activity.wing,
                    activity.duration_sec,
                    activity.distance_meters,
                    activity.start_date,
                    activity.description,
                    activity.wing,
                    activity.duration_sec,
                    activity.distance_meters,
                    activity.start_date,
                    activity.description
                ])
        }
        return success(undefined)
    } catch (error) {
        return failed(error!!.toString())
    }
}