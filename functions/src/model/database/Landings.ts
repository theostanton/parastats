import {Point} from "ts-postgres";
import {Landing, LatLng, Takeoff} from "./model";
import {getDatabase} from "./client";

export namespace Landings {

    export async function upsert(landings: Landing[]): Promise<void> {
        const database = await getDatabase()
        for await(const landing of landings) {
            await database.query(`
                insert into landings(slug, name, lat, lng, alt)
                values ($1, $2, $3, $4, $5)
                on conflict(slug)
                    do update set name=$6,
                                  lat=$7,
                                  lng=$8,
                                  alt=$9;
            `, [landing.slug, landing.name, landing.lat, landing.lng, landing.alt,
                landing.name, landing.lat, landing.lng, landing.alt])
        }
    }

    export async function getSlugOfClosest(latLng: LatLng, limitMeters: number | null = null): Promise<string | null> {
        const client = await getDatabase()
        const query = `select l.slug                         as slug,
                              distance(l.lat, l.lng, $1, $2) as distance_meters
                       from landings as l
                       order by distance_meters
                       limit 1;`

        type Closest = {
            slug: string
            distance_meters: number
        }

        const result = await client.query<Closest>(query, [latLng[0], latLng[1]])

        const closest = result.rows[0].reify()

        if (!closest.slug) {
            return null
        }

        if (limitMeters == null || closest.distance_meters < limitMeters) {
            return closest.slug
        }

        return null
    }
}