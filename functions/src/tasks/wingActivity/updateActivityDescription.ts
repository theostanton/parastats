import {getDatabase} from "../../model/database/client";
import {ActivityRow} from "../../model/database/model";

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
    const minutes = Math.floor((duration_secs - 60 * 60 * hours) / 60)
    return `${minutes}min`
}

export async function generateStats(activityRow: ActivityRow): Promise<string> {
    const allTimeWing = await getAllTimeWingAggregationResult(activityRow)
    const allTime = await getAllTimeAggregationResult(activityRow)
    const sameYear = await getSameYearAggregationResult(activityRow)

    return `🪂 ${activityRow.wing}
This wing ${formatAggregationResult(allTimeWing)}
${activityRow.start_date.getFullYear()} ${formatAggregationResult(sameYear)}
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
