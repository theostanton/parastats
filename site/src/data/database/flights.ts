import {failure, Result, success} from "@model/Result";
import {TakeOff} from "@model/TakeOff";
import {getDatabase} from "./client";
import {Pilot, StravaAthleteId} from "@model/Pilot";
import {Flight, StravaActivityId} from "@model/Flight";

export async function getFlights(): Promise<Result<Flight[]>> {
    const database = await getDatabase()
    const result = await database.query<Flight>(`
        select pilot_id,
               strava_activity_id,
               wing,
               duration_sec,
               distance_meters,
               start_date,
               description
        from flights`)
    if (result.rows) {
        return success(result.rows.map(row => row.reify()))
    } else {
        return failure(`No flights`)
    }
}

export async function getFlightsForPilot(pilotId: StravaAthleteId, limit: number = 1000): Promise<Result<Flight[]>> {
    const database = await getDatabase()
    const result = await database.query<Flight>(`
        select pilot_id,
               strava_activity_id,
               wing,
               duration_sec,
               distance_meters,
               start_date,
               description
        from flights
        where pilot_id = $1
        limit $2`, [pilotId, limit])
    if (result.rows) {
        return success(result.rows.map(row => row.reify()))
    } else {
        return failure(`No flights for pilot_id=${pilotId}`)
    }
}

export async function getFlightsForPilotAndWing(pilotId: StravaAthleteId, wing: string): Promise<Result<Flight[]>> {
    const database = await getDatabase()
    const result = await database.query<Flight>(`
        select pilot_id,
               strava_activity_id,
               wing,
               duration_sec,
               distance_meters,
               start_date,
               description
        from flights
        where pilot_id = $1
          and lower(wing) = $2`, [pilotId, wing])
    if (result.rows) {
        return success(result.rows.map(row => row.reify()))
    } else {
        return failure(`No activities for pilotId=${pilotId} && wing=${wing}`)
    }
}

export async function getFlight(flightId: StravaActivityId): Promise<Result<Flight>> {
    const database = await getDatabase()
    const result = await database.query<Flight>(`
        select pilot_id,
               strava_activity_id,
               wing,
               duration_sec,
               distance_meters,
               start_date,
               description
        from flights
        where strava_activity_id = $1`, [flightId])
    if (result.rows.length === 1) {
        return success(result.rows[0].reify())
    } else {
        return failure(`No flight for flightId=${flightId}`)
    }
}