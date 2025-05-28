import {failure, Result, success} from "@model/Result";
import {TakeOff} from "@model/TakeOff";
import {getDatabase} from "./client";

export async function getTakeOffs(): Promise<Result<TakeOff[]>> {
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

export async function getTakeOff(slug: string): Promise<Result<TakeOff>> {
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
