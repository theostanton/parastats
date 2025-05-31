import {failure, Result, success} from "@model/Result";
import {getDatabase} from "./client";
import {Pilot} from "@model/Pilot";

export async function getPilots(): Promise<Result<Pilot[]>> {
    const database = await getDatabase()
    const result = await database.query<Pilot>(`
        select first_name, pilot_id
        from pilots`)
    if (result.rows) {
        return success(result.rows.map(row => row.reify()))
    } else {
        return failure(`No pilots`)
    }
}

export async function getPilot(pilotId: number): Promise<Result<Pilot>> {
    const database = await getDatabase()
    const result = await database.query<Pilot>(`
        select first_name, pilot_id
        from pilots
        where pilot_id = $1`, [pilotId])
    if (result.rows.length === 1) {
        return success(result.rows[0].reify())
    } else {
        return failure(`No pilots for pilotId=${pilotId}`)
    }
}