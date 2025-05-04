import {isFetchAllActivitiesTask, TaskBody, TaskResult} from "../model";
import {StravaApi} from "../../model/stravaApi";
import {convertStravaActivities} from "./convertStravaActivities";
import {users} from "../../model/database/users";
import {activities} from "../../model/database/activities";
import upsertActivities = activities.upsertActivities;

export default async function (task: TaskBody): Promise<TaskResult> {
    if (!isFetchAllActivitiesTask(task)) {
        return {
            success: false,
            message: `Missing body information task=${JSON.stringify(task)}`
        }
    }

    console.log(`Gonna initialise user for userId=${task.userId}`)

    const userResult = await users.get(task.userId)
    if (!userResult.success) {
        return {
            success: false,
            message: `No user with id ${task.userId}`,
        }
    }
    const user = userResult.value

    const api = new StravaApi(user.token)

    // Fetch activities
    const fetchWingedActivitiesResult = await api.fetchWingedActivities()

    if (!fetchWingedActivitiesResult.success) {
        return {
            success: false,
            message: `fetchWingedActivities failed: ${fetchWingedActivitiesResult.error}`
        }
    }
    const wingedActivities = fetchWingedActivitiesResult.value
    console.log(`Got ${wingedActivities.length} winged activities`)

    // Convert to ActivityRows
    const activityRows = convertStravaActivities(user.user_id, wingedActivities)
    console.log(`Got ${activityRows.length} activity rows`)

    // Insert winged activities to activities
    const insertActivitiesResult = await upsertActivities(activityRows)
    if (!insertActivitiesResult.success) {
        return {
            success: false,
            message: `insertActivities failed: ${insertActivitiesResult.error}`
        }
    }
    console.log(`Inserted ${activityRows.length} activity rows`)

    // Edit recent activities
    //TODO

    return {
        success: true
    }
}