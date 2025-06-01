import {failure, Either, success} from "@model/Either";
import {getDatabase} from "./client";
import {Pilot, StravaAthleteId} from "@model/Pilot";
import {Flight, FlightWithSites, StravaActivityId} from "@model/Flight";
import {Takeoffs} from "@database/takeoffs";
import {Landings} from "@database/landings";
import {Result} from "ts-postgres";

export namespace Flights {

    export async function getAll(): Promise<Either<FlightWithSites[]>> {
        const database = await getDatabase()
        const result = await database.query<Flight>(`
            select pilot_id,
                   strava_activity_id,
                   wing,
                   duration_sec,
                   distance_meters,
                   start_date,
                   description,
                   polyline,
                   takeoff_id,
                   landing_id
            from flights`)
        if (result.rows) {
            return rowsWithSites(result)
        } else {
            return failure(`No flights`)
        }
    }

    export async function getForPilot(pilotId: StravaAthleteId, limit: number = 1000): Promise<Either<FlightWithSites[]>> {
        const database = await getDatabase()
        const result = await database.query<Flight>(`
            select pilot_id,
                   strava_activity_id,
                   wing,
                   duration_sec,
                   distance_meters,
                   start_date,
                   description,
                   polyline,
                   takeoff_id,
                   landing_id
            from flights
            where pilot_id = $1
            limit $2`, [pilotId, limit])
        if (result.rows) {
            return rowsWithSites(result)
        } else {
            return failure(`No flights for pilot_id=${pilotId}`)
        }
    }

    export async function getForPilotAndWing(pilotId: StravaAthleteId, wing: string): Promise<Either<FlightWithSites[]>> {
        const database = await getDatabase()
        const result = await database.query<Flight>(`
            select pilot_id,
                   strava_activity_id,
                   wing,
                   duration_sec,
                   distance_meters,
                   start_date,
                   description,
                   polyline,
                   takeoff_id,
                   landing_id
            from flights
            where pilot_id = $1
              and lower(wing) = $2`, [pilotId, wing])
        if (result.rows) {
            return rowsWithSites(result)
        } else {
            return failure(`No flights for pilotId=${pilotId} && wing=${wing}`)
        }
    }

    export async function get(flightId: StravaActivityId): Promise<Either<FlightWithSites>> {
        const database = await getDatabase()
        const result = await database.query<Flight>(`
            select pilot_id,
                   strava_activity_id,
                   wing,
                   duration_sec,
                   distance_meters,
                   start_date,
                   description,
                   polyline,
                   takeoff_id,
                   landing_id
            from flights
            where strava_activity_id = $1`, [flightId])
        if (result.rows.length === 1) {
            return rowWithSites(result)
        } else {
            return failure(`No flight for flightId=${flightId}`)
        }
    }

    async function rowWithSites(result: Result<Flight>): Promise<Either<FlightWithSites>> {
        const flight: Flight = result.rows[0].reify()

        const [takeoff, takeoffError] = await Takeoffs.get(flight.takeoff_id)
        if (takeoffError) {
            console.error(takeoffError)
        }
        const [landing, landingError] = await Landings.get(flight.landing_id)
        if (landingError) {
            console.error(landingError)
        }
        return success({
            ...flight,
            takeoff,
            landing
        })
    }

    async function rowsWithSites(result: Result<Flight>): Promise<Either<FlightWithSites[]>> {
        const flights: Flight[] = result.rows.map(row => row.reify())

        const flightWithSites: FlightWithSites[] = []
        for await(const flight of flights) {
            const [takeoff] = await Takeoffs.get(flight.takeoff_id)
            const [landing] = await Landings.get(flight.landing_id)
            flightWithSites.push({
                ...flight,
                takeoff,
                landing
            })
        }
        return success(flightWithSites)
    }
}