import {failure, Result, success} from "@model/Result";
import {TakeOff} from "@model/TakeOff";
import {getDatabase} from "./client";
import {Pilot} from "@model/Pilot";

export async function getPilots(): Promise<Result<Pilot[]>> {
    const database = await getDatabase()
    const result = await database.query<Pilot>(`
        select first_name, user_id
        from pilots`)
    if (result.rows) {
        return success(result.rows.map(row => row.reify()))
    } else {
        return failure(`No pilots`)
    }
}

export async function getPilot(user_id: number): Promise<Result<Pilot>> {
    const database = await getDatabase()
    const result = await database.query<Pilot>(`
        select first_name, user_id
        from pilots
        where user_id = $1`, [user_id])
    if (result.rows.length === 1) {
        return success(result.rows[0].reify())
    } else {
        return failure(`No pilots for user_id=${user_id}`)
    }
}