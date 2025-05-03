import {InitialiseUserResult} from "./initialiseUser";
import {getDatabase} from "../model/database/client";
import {ActivityRow} from "../model/database/model";
import {activities} from "../model/database/activities";
import {failed, Result, success} from "../model/model";

export type AggregationResult = {
    count: number
    total_duration_sec: number
    total_distance_meters: number
}

export function formatAggregationResult(result: AggregationResult): string {
    return `${elapsedTime(result.total_duration_sec)} over ${result.count} ${result.count == 1 ? "flight" : "flights"}`
}

function elapsedTime(duration_secs: number): string {
    if (duration_secs >= 60 * 60) {
        const hours = Math.floor(duration_secs / (60 * 60))
        const minutes = Math.floor((duration_secs - hours * 60 * 60) / 60)
        return `${hours}h ${minutes}min`
    }
    const hours = Math.floor(duration_secs / (60 * 60))
    const minutes = (duration_secs - 60 * 60 * hours) / 60
    return `${minutes}min`
}

export async function updateActivityDescription(activityId: number, dry: boolean = true): Promise<Result<string>> {
    // Get ActivityRow
    const result = await activities.get(activityId)
    if (!result.success) {
        return failed(`No results for activityId=${activityId}`)
    }
    const activityRow = result.value

    // Generate stats
    const stats = await generateStats(activityRow)

    // Check description is already winged
    const alreadyWinged = activityRow.description.includes("🌐 parastats.info")

    // If winged, replace stats
    let wingedDescription: string
    if (alreadyWinged) {
        wingedDescription = activityRow.description.replace(/🪂[\s\S]*parastats.info/, stats)
    } else {
        wingedDescription = activityRow.description.replace(`🪂 ${activityRow.wing}`, stats)
    }
    console.log('wingedDescription')
    console.log(wingedDescription)
    console.log()

    // Update Strava Activity description
    //TODO

    // if success store updated else store failed

    return success(wingedDescription)
}

export async function generateStats(activityRow: ActivityRow): Promise<string> {
    const allTimeWing = await getAllTimeWingAggregationResult(activityRow)
    const allTime = await getAllTimeAggregationResult(activityRow)
    const sameYear = await getSameYearAggregationResult(activityRow)

    return `🪂 ${activityRow.wing}
This wing ${formatAggregationResult(allTimeWing)}
This year ${formatAggregationResult(sameYear)}
All time ${formatAggregationResult(allTime)}
🌐 parastats.info`
}

export async function getAllTimeWingAggregationResult(activityRow: ActivityRow): Promise<AggregationResult> {
    const client = await getDatabase()
    const result = await client.query<AggregationResult>(`
        select count(1)::int               as count,
               sum(duration_sec)::float    as total_duration_sec,
               sum(distance_meters)::float as total_distance_meters
        from activities
        where user_id = $1
          and wing = $2
          and start_date <= $3
    `, [activityRow.user_id, activityRow.wing, activityRow.start_date])

    return result.rows[0].reify()
}

export async function getAllTimeAggregationResult(activityRow: ActivityRow): Promise<AggregationResult> {
    const client = await getDatabase()
    const result = await client.query<AggregationResult>(`
        select count(1)::int               as count,
               sum(duration_sec)::float    as total_duration_sec,
               sum(distance_meters)::float as total_distance_meters
        from activities
        where user_id = $1
          and start_date <= $2
    `, [activityRow.user_id, activityRow.start_date])

    return result.rows[0].reify()
}

export async function getSameYearAggregationResult(activityRow: ActivityRow): Promise<AggregationResult> {
    const client = await getDatabase()
    const result = await client.query<AggregationResult>(`
        select count(1)::int               as count,
               sum(duration_sec)::float    as total_duration_sec,
               sum(distance_meters)::float as total_distance_meters
        from activities
        where user_id = $1
          and start_date <= $2
          and date_part('year', start_date) = date_part('year', $2)
    `, [activityRow.user_id, activityRow.start_date])

    return result.rows[0].reify()
}
