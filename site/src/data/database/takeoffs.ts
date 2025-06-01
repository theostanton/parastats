import {failure, Either, success} from "@model/Either";
import {TakeOff} from "@model/TakeOff";
import {getDatabase} from "./client";
import {StravaAthleteId} from "@model/Pilot";

export type PilotTakeoffStats = {
    stats: TakeoffStatsItem[]
}

export type TakeoffStatsItem = {
    takeoff: TakeOff
    flights: number
}

export namespace Takeoffs {

    export async function getAll(): Promise<Either<TakeOff[]>> {
        const database = await getDatabase()
        const result = await database.query<TakeOff>(`
            select slug, name, lat, lng, alt
            from takeoffs`)
        if (result.rows) {
            return success(result.rows.map(row => row.reify()))
        } else {
            return failure(`No takeoffs`)
        }
    }

    export async function get(slug: string): Promise<Either<TakeOff>> {
        const database = await getDatabase()
        const result = await database.query<TakeOff>(`
            select slug, name, lat, lng, alt
            from takeoffs
            where slug = $1`, [slug])
        if (result.rows.length === 1) {
            return success(result.rows[0].reify())
        } else {
            return failure(`No results for slug=${slug}`)
        }
    }

    export async function getPilotStats(pilotId: StravaAthleteId): Promise<Either<PilotTakeoffStats>> {
        const database = await getDatabase()
        const result = await database.query<TakeoffStatsItem>(`
            select to_json(t) as takeoff, count(1) as flights
            from flights as f
                     left join takeoffs as t on t.slug = f.takeoff_id
            where pilot_id = $1
            group by f.takeoff_id, t
        `, [pilotId])

        return success({
            stats: result.rows.map((row) => row.reify()),
        })
    }

}