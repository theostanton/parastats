import {LatLng, Takeoff} from "./model";
import {getDatabase} from "./client";

export namespace Takeoffs {

    export async function upsert(takeoffs: Takeoff[]): Promise<void> {
        const database = await getDatabase()
        for await(const takeoff of takeoffs) {
            await database.query(`
                insert into takeoffs(slug, name, lat, lng, alt)
                values ($1, $2, $3, $4, $5)
                on conflict(slug)
                    do update set name=$6,
                                  lat=$7,
                                  lng=$8,
                                  alt=$9;
            `, [takeoff.slug, takeoff.name, takeoff.lat, takeoff.lng, takeoff.alt,
                takeoff.name, takeoff.lat, takeoff.lng, takeoff.alt])
        }
    }

    export async function getSlugOfClosest(latLng: LatLng, limitMeters: number | null = null): Promise<string | null> {
        const client = await getDatabase()
        const query = `select t.slug                         as slug,
                              distance(t.lat, t.lng, $1, $2) as distance_meters
                       from takeoffs as t
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