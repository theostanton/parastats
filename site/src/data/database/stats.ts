import {failure, Either, success} from "@model/Either";
import {StravaAthleteId} from "@model/Pilot";
import {getDatabase} from "@database/client";

export type PilotWingStats = {
    wingStats: WingStatItem[]
}

export type WingStatItem = {
    wing: string
    flights: number
}

export async function getPilotWingStats(pilotId: StravaAthleteId): Promise<Either<PilotWingStats>> {
    const database = await getDatabase()
    const result = await database.query<WingStatItem>(`
        select trim(wing) as wing, count(1) as flights
        from flights
        where pilot_id = $1
        group by trim(wing)
        order by flights desc
    `, [pilotId])

    if (!result.rows) {
        return failure(`No PilotWingStats for pilotId=${pilotId}`)
    }

    return success({
        wingStats: result.rows.map((row) => row.reify()),
    })
}