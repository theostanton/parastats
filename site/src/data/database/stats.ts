import {failure, Result, success} from "@model/Result";
import {Pilot} from "@model/Pilot";
import {getDatabase} from "@database/client";

export type PilotWingStats = {
    wingStats: WingStatItem[]
}

export type WingStatItem = {
    wing: string
    flights: number
}

export async function getPilotWingStats(user_id: number): Promise<Result<PilotWingStats>> {
    const database = await getDatabase()
    const result = await database.query<WingStatItem>(`
        select trim(wing) as wing, count(1) as flights
        from activities as a
        where user_id = $1
        group by wing`, [user_id])

    if (!result.rows) {
        return failure(`No PilotWingStats for user_id=${user_id}`)
    }

    return success({
        wingStats: result.rows.map((row) => row.reify()),
    })
}