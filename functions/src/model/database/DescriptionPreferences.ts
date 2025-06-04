import {Failed, failed, Result, Success, success} from "../model";
import {getDatabase} from "./client";
import {DescriptionPreference, PilotRow} from "./model";
import {StravaAthleteId} from "../stravaApi/model";

export namespace DescriptionPreferences {

    export async function get(pilotId: StravaAthleteId): Promise<Result<DescriptionPreference>> {
        const database = await getDatabase()
        const result = await database.query<DescriptionPreference>("select * from description_preferences", [pilotId])
        if (result.rows.length === 1) {
            return new Success(result.rows[0].reify())
        } else {
            return new Failed(`No pilots for pilotId=${pilotId}`)
        }
    }

    export async function upsert(preferences: DescriptionPreference[]): Promise<Result<void>> {
        const database = await getDatabase()
        try {
            const errors: string[] = []
            for await (const preference of preferences) {
                try {
                    await database.query(`
                                insert into description_preferences(pilot_id,
                                                                    include_sites,
                                                                    include_wind,
                                                                    include_wing_aggregate,
                                                                    include_year_aggregate,
                                                                    include_all_time_aggregate)
                                values ($1, $2, $3, $4, $5, $6)
                                on conflict(pilot_id)
                                    do update set include_sites=$7,
                                                  include_wind=$8,
                                                  include_wing_aggregate=$9,
                                                  include_year_aggregate=$10,
                                                  include_all_time_aggregate=$11
                        `,
                        [
                            preference.pilot_id,
                            preference.include_sites,
                            preference.include_wind,
                            preference.include_wing_aggregate,
                            preference.include_year_aggregate,
                            preference.include_all_time_aggregate,

                            preference.include_sites,
                            preference.include_wind,
                            preference.include_wing_aggregate,
                            preference.include_year_aggregate,
                            preference.include_all_time_aggregate
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