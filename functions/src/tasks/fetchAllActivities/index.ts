import {isFetchAllActivitiesTask, TaskBody, TaskResult} from "../model";
import {StravaApi} from "../../model/stravaApi";
import {getDatabase} from "../../model/database/client";
import {Pilots} from "../../model/database/Pilots";
import {Flights} from "../../model/database/flights";
import {StravaActivity, StravaActivityId} from "../../model/stravaApi/model";
import axios, {AxiosHeaders} from "axios";
import {FlightRow} from "../../model/database/model";
import {StravaActivityToFlightConverter} from "./StravaActivityToFlightConverter";

export default async function (task: TaskBody): Promise<TaskResult> {
    if (!isFetchAllActivitiesTask(task)) {
        return {
            success: false,
            message: `Missing body information task=${JSON.stringify(task)}`
        }
    }

    console.log(`Gonna initialise pilot for pilotId=${task.pilotId}`)

    // Get pilot from database
    const pilotResult = await Pilots.get(task.pilotId)
    if (!pilotResult.success) {
        return {
            success: false,
            message: `No pilot with id ${task.pilotId}`,
        }
    }
    const pilot = pilotResult.value

    const api = await StravaApi.fromUserId(pilot.pilot_id)

    // Get existing activity IDs from database
    const database = await getDatabase()
    type ExistingStravaActivityId = Pick<FlightRow, 'strava_activity_id'>
    console.log('Gonna fetch existingActivityIds')
    const existingActivityIdsResult = await database.query<ExistingStravaActivityId>(`
        select f.strava_activity_id as strava_activity_id
        from flights as f
        where pilot_id = $1
    `, [pilot.pilot_id])
    console.log(`Fetched existingActivityIdsResult=${JSON.stringify(existingActivityIdsResult)}`)

    const existingActivityIds: StravaActivityId[] = [...existingActivityIdsResult].map(a => a.strava_activity_id);

    // Fetch activities
    const paraglidingActivityIdsResult = await api.fetchParaglidingActivityIds(1000, existingActivityIds)

    if (!paraglidingActivityIdsResult.success) {
        return {
            success: false,
            message: `fetchParaglidingActivityIds failed: ${paraglidingActivityIdsResult.error}`
        }
    }
    const paraglidingActivityIds: StravaActivityId[] = paraglidingActivityIdsResult.value

    // Process paragliding activity IDs
    // 1. Fetch full Strava Activity
    // 2. Store to flights table
    const storedFlights: FlightRow[] = []

    const headers = new AxiosHeaders();
    headers.set('Authorization', `Bearer ${api.token}`);
    for (const activityId of paraglidingActivityIds) {
        const result = await axios.get<StravaActivity>(`https://www.strava.com/api/v3/activities/${activityId}`, {headers: headers});

        if (result.status == 429) {
            let errorMessage = `Got rate limited after ${storedFlights.length} activities`;
            console.log(errorMessage);
            return {
                success: false,
                message: errorMessage,
            }
        }

        const stravaActivity = result.data;
        const conversionResult = await StravaActivityToFlightConverter.convert(pilot.pilot_id, stravaActivity)
        if (conversionResult.success) {
            const flightRow = conversionResult.value
            const upsertResult = await Flights.upsert([flightRow])
            if (!upsertResult.success) {
                return {
                    success: false,
                    message: `Flights.upsert failed for row=${JSON.stringify(flightRow)} error=${upsertResult.error}`
                }
            }
            storedFlights.push(flightRow)
            console.log(`Appended ${storedFlights.length}/${paraglidingActivityIds.length}`);
        } else {
            console.log(`Failed id=${stravaActivity.id} title=${stravaActivity.name} error=${conversionResult.error}`);
        }
    }

    return {
        success: true
    }
}