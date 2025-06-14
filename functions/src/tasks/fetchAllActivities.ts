import { FetchAllActivitiesTask, TaskResult, StravaActivityId, StravaAthleteId, FlightRow } from '@parastats/common/src/model';
import { withPooledClient } from '@parastats/common';
import { Pilots } from '../model/database/Pilots';
import { Flights } from '../model/database/Flights';
import { StravaApi } from '../model/stravaApi';
import { convertStravaActivityToFlight } from './utils/stravaConverter';

export async function executeFetchAllActivitiesTask(
    task: FetchAllActivitiesTask
): Promise<TaskResult> {
    console.log(`Executing FetchAllActivities for pilotId=${task.pilotId}`);

    // Get pilot from database
    const pilotResult = await Pilots.get(task.pilotId);
    if (!pilotResult.success) {
        return {
            success: false,
            message: `No pilot with id ${task.pilotId}: ${pilotResult.error}`,
        };
    }
    const pilot = pilotResult.value;

    // Create Strava API instance
    const api = await StravaApi.fromUserId(pilot.pilot_id);

    // Get existing activity IDs from database
    const existingActivityIds: StravaActivityId[] = await withPooledClient(async (database) => {
        type ExistingStravaActivityId = Pick<FlightRow, 'strava_activity_id'>;
        console.log('Fetching existing activity IDs');
        const existingActivityIdsResult = await database.query(`
            select f.strava_activity_id as strava_activity_id
            from flights as f
            where pilot_id = $1
        `, [pilot.pilot_id]);
        console.log(`Fetched existingActivityIdsResult=${JSON.stringify(existingActivityIdsResult)}`);

        return [...existingActivityIdsResult].map(a => a.strava_activity_id);
    });

    // Fetch activities from Strava
    const paraglidingActivityIdsResult = await api.fetchParaglidingActivityIds(1000, existingActivityIds);

    if (!paraglidingActivityIdsResult.success) {
        return {
            success: false,
            message: `fetchParaglidingActivityIds failed: ${paraglidingActivityIdsResult.error}`
        };
    }
    const paraglidingActivityIds: StravaActivityId[] = paraglidingActivityIdsResult.value;

    // Process paragliding activity IDs
    // 1. Fetch full Strava Activity
    // 2. Convert to FlightRow  
    // 3. Store to flights table
    const storedFlights: FlightRow[] = [];

    for (const activityId of paraglidingActivityIds) {
        try {
            const activityResult = await api.fetchActivity(activityId);
            if (!activityResult.success) {
                console.log(`Failed to fetch activity ${activityId}: ${activityResult.error}`);
                
                // Check for rate limiting
                if (activityResult.error === 'Rate limited') {
                    const errorMessage = `Got rate limited after ${storedFlights.length} activities`;
                    console.log(errorMessage);
                    return {
                        success: false,
                        message: errorMessage,
                    };
                }
                continue;
            }
            
            const stravaActivity = activityResult.value;

            const conversionResult = await convertStravaActivityToFlight(pilot.pilot_id, stravaActivity);
            if (conversionResult.success) {
                const flightRow = conversionResult.value;
                const upsertResult = await Flights.upsert([flightRow]);
                if (!upsertResult.success) {
                    return {
                        success: false,
                        message: `Flights.upsert failed for row=${JSON.stringify(flightRow)} error=${upsertResult.error}`
                    };
                }
                storedFlights.push(flightRow);
                console.log(`Processed ${storedFlights.length}/${paraglidingActivityIds.length}`);
            } else {
                console.log(`Failed to convert activity id=${activityId} error=${conversionResult.error}`);
            }
        } catch (error) {
            console.error(`Error processing activity ${activityId}:`, error);
            // Continue with next activity
        }
    }

    console.log(`Successfully processed ${storedFlights.length} activities for pilot ${task.pilotId}`);
    return {
        success: true
    };
}