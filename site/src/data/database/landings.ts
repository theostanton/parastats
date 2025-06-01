import {failure, Either, success} from "@model/Either";
import {TakeOff} from "@model/TakeOff";
import {getDatabase} from "./client";
import {Landing} from "@model/Landing";
import {StravaAthleteId} from "@model/Pilot";
import {PilotTakeoffStats, TakeoffStatsItem} from "@database/takeoffs";

export type PilotLandingStats = {
    stats: LandingStatsItem[]
}

export type LandingStatsItem = {
    landing: Landing
    flights: number
}

export namespace Landings {

    export async function getAll(): Promise<Either<Landing[]>> {
        const database = await getDatabase()
        const result = await database.query<Landing>(`
            select slug, name, lat, lng, alt
            from landings`)
        if (result.rows) {
            return success(result.rows.map(row => row.reify()))
        } else {
            return failure(`No landing`)
        }
    }

    export async function get(slug: string): Promise<Either<Landing>> {
        const database = await getDatabase()
        const result = await database.query<Landing>(`
            select slug, name, lat, lng, alt
            from landings
            where slug = $1`, [slug])
        if (result.rows.length === 1) {
            return success(result.rows[0].reify())
        } else {
            return failure(`No landings for slug=${slug}`)
        }
    }


    export async function getPilotStats(pilotId: StravaAthleteId): Promise<Either<PilotLandingStats>> {
        const database = await getDatabase()
        const result = await database.query<LandingStatsItem>(`
            select to_json(l) as landing, count(1) as flights
            from flights as f
                     left join landings as l on l.slug = f.landing_id
            where pilot_id = $1
            group by f.landing_id, l
        `, [pilotId])

        return success({
            stats: result.rows.map((row) => row.reify()),
        })
    }
}