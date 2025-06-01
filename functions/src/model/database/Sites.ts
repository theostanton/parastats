import {Site} from "./model";
import {failed, Result, success} from "../model";
import {getDatabase} from "./client";

export namespace Sites {
    export async function upsert(sites: Site[]): Promise<Result<void>> {
        const database = await getDatabase()
        try {


            const errors: string[] = []
            for await (const site of sites) {
                console.log(`Upserting site=${JSON.stringify(site)}`)
                try {
                    await database.query(`
                                insert into sites(ffvl_sid, slug, name, lat, lng, alt, nearest_balise_id, polygon)
                                values ($1, $2, $3, $4, $5, $6, $7, $8)
                                on conflict(ffvl_sid)
                                    do update set slug=$9,
                                                  name=$10,
                                                  lat=$11,
                                                  lng=$12,
                                                  alt=$13,
                                                  nearest_balise_id=$14,
                                                  polygon=$15
                        `,
                        [
                            site.ffvl_sid,
                            site.slug,
                            site.name,
                            site.lat,
                            site.lng,
                            site.alt,
                            site.nearest_balise_id,
                            site.polygon,

                            site.slug,
                            site.name,
                            site.lat,
                            site.lng,
                            site.alt,
                            site.nearest_balise_id,
                            site.polygon
                        ])
                } catch (error) {
                    console.log(`Failed:${error}`)
                    errors.push(error!!.toString())
                }
            }
            if (errors.length > 0) {
                return failed(`${errors.length} failed: ${errors.join('\n')}`)
            }
            return success(undefined)
        } catch (error) {
            return failed(error!!.toString())
        }
    }
}