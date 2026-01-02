import { withPooledClient, Client } from '../database';
import { Either, failure, success, FlightRow, StravaActivityId, StravaAthleteId, DescriptionPreference } from '../model';

export namespace Flights {
    export async function get(flightId: StravaActivityId): Promise<Either<FlightRow>> {
        return withPooledClient(async (database: Client) => {
            const result = await database.query<FlightRow>(`
                select *
                from flights
                where strava_activity_id = $1`, [flightId])
            if (result.rows.length === 1) {
                return success(result.rows[0].reify())
            } else {
                return failure(`No results for flightId=${flightId}`)
            }
        });
    }

    export async function getAll(pilotId: StravaAthleteId): Promise<Either<FlightRow[]>> {
        return withPooledClient(async (database: Client) => {
            const result = await database.query<FlightRow>(`
                select *
                from flights
                where pilot_id = $1`, [pilotId])
            if (result.rows) {
                return success(result.rows.map(r => r.reify()))
            } else {
                return failure(`Failed to getAll for pilotId=${pilotId}`)
            }
        });
    }

    export async function updateDescription(flightId: StravaActivityId, description: string): Promise<Either<void>> {
        return withPooledClient(async (database: Client) => {
            try {
                await database.query(`
                    update flights
                    set description = $1
                    where strava_activity_id = $2
                `, [description, flightId])
                return success(undefined)
            } catch (error) {
                return failure(`Failed to updateDescription flightId=${flightId} description=${description} error=${error}`)
            }
        });
    }

    export async function updateDescriptionWithPreferences(
        flightId: StravaActivityId, 
        description: string, 
        preferencesSnapshot: DescriptionPreference
    ): Promise<Either<void>> {
        return withPooledClient(async (database: Client) => {
            try {
                await database.query(`
                    update flights
                    set description = $1, description_preferences_snapshot = $2
                    where strava_activity_id = $3
                `, [description, JSON.stringify(preferencesSnapshot), flightId])
                return success(undefined)
            } catch (error) {
                return failure(`Failed to updateDescriptionWithPreferences flightId=${flightId} error=${error}`)
            }
        });
    }

    export async function upsert(flights: FlightRow[]): Promise<Either<void>> {
        return withPooledClient(async (database: Client) => {
            try {
                const errors: string[] = []
                for (const flight of flights) {
                    console.log(`Inserting flight strava_activity_id=${flight.strava_activity_id}`)
                    try {
                        await database.query(`
                                    insert into flights(pilot_id,
                                                        strava_activity_id,
                                                        wing,
                                                        duration_sec,
                                                        distance_meters,
                                                        start_date,
                                                        description,
                                                        polyline,
                                                        landing_id,
                                                        takeoff_id)
                                    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                                    on conflict(strava_activity_id)
                                        do update set wing=$11,
                                                      duration_sec=$12,
                                                      distance_meters=$13,
                                                      start_date=$14,
                                                      description=$15,
                                                      polyline=$16,
                                                      landing_id=$17,
                                                      takeoff_id=$18;
                            `,
                            [
                                flight.pilot_id,
                                flight.strava_activity_id,
                                flight.wing,
                                flight.duration_sec,
                                flight.distance_meters,
                                flight.start_date,
                                flight.description,
                                flight.polyline ?? null,
                                flight.landing_id ?? null,
                                flight.takeoff_id ?? null,

                                flight.wing,
                                flight.duration_sec,
                                flight.distance_meters,
                                flight.start_date,
                                flight.description,
                                flight.polyline ?? null,
                                flight.landing_id ?? null,
                                flight.takeoff_id ?? null,
                            ])
                    } catch (error) {
                        console.log(`Failed:${error}`)
                        errors.push(error!!.toString())
                    }
                }
                if (errors.length > 0) {
                    return failure(`${errors.length} failed: ${errors.join('\n')}`)
                }
                return success(undefined)
            } catch (error) {
                return failure(error!!.toString())
            }
        });
    }
}