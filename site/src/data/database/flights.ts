import {failure, Either, success} from "@model/Either";
import {withPooledClient, Client} from "./client";
import {FlightWithSites, StravaActivityId, StravaAthleteId} from "@parastats/common";

export namespace Flights {

    const FlightsWithSitesQuery = `
        select pilot_id,
               strava_activity_id,
               wing,
               duration_sec,
               distance_meters,
               start_date,
               description,
               polyline,
               to_json(t) as takeoff,
               to_json(l) as landing
        from flights as f
                 left join sites as t on f.takeoff_id = t.ffvl_sid
                 left join sites as l on f.landing_id = l.ffvl_sid
    `

    export async function getAll(): Promise<Either<FlightWithSites[]>> {
        return withPooledClient(async (database: Client) => {
            const result = await database.query<FlightWithSites>(FlightsWithSitesQuery)
            if (result.rows) {
                return success(result.rows.map(row => row.reify()))
            } else {
                return failure(`No flights`)
            }
        });
    }

    export async function getForPilot(pilotId: StravaAthleteId, limit: number = 1000): Promise<Either<FlightWithSites[]>> {
        return withPooledClient(async (database: Client) => {
            const result = await database.query<FlightWithSites>(`
            ${FlightsWithSitesQuery}
                where pilot_id = $1
                limit $2`, [pilotId, limit])
            if (result.rows) {
                return success(result.rows.map(row => row.reify()))
            } else {
                return failure(`No flights for pilot_id=${pilotId}`)
            }
        });
    }

    export async function getForPilotAndWing(pilotId: StravaAthleteId, wing: string): Promise<Either<FlightWithSites[]>> {
        return withPooledClient(async (database: Client) => {
            const result = await database.query<FlightWithSites>(`
                ${FlightsWithSitesQuery}
                where pilot_id = $1
                  and lower(wing) = $2`, [pilotId, wing])
            if (result.rows) {
                return success(result.rows.map(row => row.reify()))
            } else {
                return failure(`No flights for pilotId=${pilotId} && wing=${wing}`)
            }
        });
    }

    export async function get(flightId: StravaActivityId): Promise<Either<FlightWithSites>> {
        return withPooledClient(async (database: Client) => {
            const result = await database.query<FlightWithSites>(`
                ${FlightsWithSitesQuery}
                where strava_activity_id = $1`, [flightId])
            if (result.rows.length === 1) {
                return success(result.rows[0].reify())
            } else {
                return failure(`No flight for flightId=${flightId}`)
            }
        });
    }

    // async function rowWithSites(result: Result<Flight>): Promise<Either<FlightWithSites>> {
    //     const flight: Flight = result.rows[0].reify()
    //
    //     const [site, takeoffError] = await Sites.get(flight.takeoff_id)
    //     if (takeoffError) {
    //         console.error(takeoffError)
    //     }
    //     const [landing, landingError] = await Landings.get(flight.landing_id)
    //     if (landingError) {
    //         console.error(landingError)
    //     }
    //     return success({
    //         ...flight,
    //         takeoff,
    //         landing
    //     })
    // }
    //
    // async function rowsWithSites(result: Result<Flight>): Promise<Either<FlightWithSites[]>> {
    //     const flights: Flight[] = result.rows.map(row => row.reify())
    //
    //     const flightWithSites: FlightWithSites[] = []
    //     for await(const flight of flights) {
    //         const [takeoff] = await Takeoffs.get(flight.takeoff_id)
    //         const [landing] = await Landings.get(flight.landing_id)
    //         flightWithSites.push({
    //             ...flight,
    //             takeoff,
    //             landing
    //         })
    //     }
    //     return success(flightWithSites)
    // }
}