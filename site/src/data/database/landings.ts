import {failure, Result, success} from "@model/Result";
import {TakeOff} from "@model/TakeOff";
import {getDatabase} from "./client";
import {Landing} from "@model/Landing";

export async function getLandings(): Promise<Result<Landing[]>> {
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

export async function getLanding(slug: string): Promise<Result<Landing>> {
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
