import {failure, Either, success} from "@model/Either";
import {getDatabase} from "./client";
import {StravaAthleteId} from "@model/Pilot";
import {Site} from "@model/Site";

export type PilotSitesStats = {
    takeoffs: SitesStatsItem[]
    landings: SitesStatsItem[]
}

export type SitesStatsItem = {
    site: Site
    flights: number
}

export namespace Sites {

    export async function getAll(): Promise<Either<Site[]>> {
        const database = await getDatabase()
        const result = await database.query<Site>(`
            select *
            from sites
            order by name`)
        if (result.rows) {
            return success(result.rows.map(row => row.reify()))
        } else {
            return failure(`No sites`)
        }
    }

    export async function getForSlug(slug: string): Promise<Either<Site>> {
        const database = await getDatabase()
        const result = await database.query<Site>(`
            select *
            from sites
            where slug = $1`, [slug])
        if (result.rows.length == 1) {
            return success(result.rows[0].reify())
        } else {
            return failure(`No results for slug=${slug}`)
        }
    }

    export async function getPilotStats(pilotId: StravaAthleteId): Promise<Either<PilotSitesStats>> {
        const database = await getDatabase()
        const takeoffsResult = await database.query<SitesStatsItem>(`
            with ss as (select s.ffvl_sid as ffvl_sid,
                               count(1)   as flights
                        from flights as f
                                 left join sites as s on s.ffvl_sid = f.takeoff_id
                        where f.pilot_id = $1
                        group by f.takeoff_id, s.ffvl_sid)

            select ss.flights as flights, to_json(s) as site
            from ss
                     left join sites as s on ss.ffvl_sid = s.ffvl_sid
            order by flights desc;
        `, [pilotId])

        const landingsResult = await database.query<SitesStatsItem>(`
            with ss as (select s.ffvl_sid as ffvl_sid,
                               count(1)   as flights
                        from flights as f
                                 left join sites as s on s.ffvl_sid = f.landing_id
                        where f.pilot_id = $1
                        group by f.landing_id, s.ffvl_sid)

            select ss.flights as flights,
                   to_json(s) as site
            from ss
                     left join sites as s on ss.ffvl_sid = s.ffvl_sid
            order by flights desc;
        `, [pilotId])

        return success({
            takeoffs: takeoffsResult.rows.map((row) => row.reify()),
            landings: landingsResult.rows.map((row) => row.reify()),
        })
    }

}