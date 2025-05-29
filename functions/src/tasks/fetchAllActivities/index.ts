import {isFetchAllActivitiesTask, TaskBody, TaskResult} from "../model";
import {StravaApi} from "../../model/stravaApi";
import {convertStravaActivity} from "./convertStravaActivities";
import {getDatabase} from "../../model/database/client";
import {Pilots} from "../../model/database/pilots";
import {Activities} from "../../model/database/activities";
import upsertActivities = Activities.upsertActivities;
import {StravaActivity} from "../../model/stravaApi/model";
import axios, {AxiosHeaders} from "axios";

export default async function (task: TaskBody): Promise<TaskResult> {
    if (!isFetchAllActivitiesTask(task)) {
        return {
            success: false,
            message: `Missing body information task=${JSON.stringify(task)}`
        }
    }

    console.log(`Gonna initialise user for userId=${task.userId}`)

    // Get user from database
    const userResult = await Pilots.get(task.userId)
    if (!userResult.success) {
        return {
            success: false,
            message: `No user with id ${task.userId}`,
        }
    }
    const user = userResult.value

    const api = await StravaApi.fromUserId(user.user_id)

    // Get existing activity IDs from database
    const database = await getDatabase()
    type ExistingActivityId = { activity_id: number }
    const existingActivityIdsResult = await database.query<ExistingActivityId>(`
        select a.activity_id as activity_id
        from activities as a
                 inner join users as u
                            on a.user_id = u.user_id and u.user_id = $1
    `, [user.user_id])

    const existingActivityIds: number[] = [...existingActivityIdsResult].map(a => a.activity_id);

    // Fetch activities
    const fetchWingedActivityIdsResult = await api.fetchWingedActivityIds(1000, existingActivityIds)

    if (!fetchWingedActivityIdsResult.success) {
        return {
            success: false,
            message: `fetchWingedActivities failed: ${fetchWingedActivityIdsResult.error}`
        }
    }
    const wingedActivityIds: number[] = fetchWingedActivityIdsResult.value

    // Process winged activity IDs
    // 1. Fetch full Strava Activity
    // 2. Store to activities table
    const storedActivities: StravaActivity[] = []


    const headers = new AxiosHeaders();
    headers.set('Authorization', `Bearer ${api.token}`);
    for (const activityId of wingedActivityIds) {
        const result = await axios.get<StravaActivity>(`https://www.strava.com/api/v3/activities/${activityId}`, {headers: headers});

        if (result.status == 429) {
            let errorMessage = `Got rate limited after ${storedActivities.length} activities`;
            console.log(errorMessage);
            return {
                success: false,
                message: errorMessage,
            }
        }

        const stravaActivity = result.data;
        const activityRow = convertStravaActivity(user.user_id, stravaActivity)
        if (activityRow) {
            const insertActivityResult = await upsertActivities([activityRow])
            if (!insertActivityResult.success) {
                return {
                    success: false,
                    message: `upsertActivities failed for row=${activityRow} error=${insertActivityResult.error}`
                }
            }
            storedActivities.push(stravaActivity)
            console.log(`Appended ${storedActivities.length}/${wingedActivityIds.length}`);
        } else {
            console.log(`Skipped id=${stravaActivity.id} title=${stravaActivity.name} description=${stravaActivity.description}`);
        }
    }

    // Once succesful,
    //TODO

    return {
        success: true
    }
}