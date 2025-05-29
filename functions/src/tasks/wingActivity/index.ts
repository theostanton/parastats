import {TaskResult, isWingActivityTask, TaskBody} from "../model";
import {generateStats} from "./updateActivityDescription";
import {Activities} from "../../model/database/activities";
import {Pilots} from "../../model/database/pilots";
import {StravaApi} from "../../model/stravaApi";

export default async function (task: TaskBody): Promise<TaskResult> {
    if (!isWingActivityTask(task)) {
        return {
            success: false,
            message: `Missing body information task=${JSON.stringify(task)}`
        }
    }

    console.log(`Gonna wing activity for activityId=${task.activityId}`)

    // Fetch ActivityRow
    const result = await Activities.get(task.activityId)
    if (!result.success) {
        return {
            success: false,
            message: `No activity rows for activityId=${task.activityId}`
        }
    }
    const activityRow = result.value


    // const type: SomeType = {lol: "lil"}

    // Generate stats
    const stats = await generateStats(activityRow)

    // Check description is already winged
    const alreadyWinged = activityRow.description.includes("🌐 parastats.info")

    // If winged, replace stats
    let wingedDescription: string
    if (alreadyWinged) {
        console.log("Updating")
        wingedDescription = activityRow.description.replace(/🪂[\s\S]*parastats.info/, stats)
    } else {
        console.log("Appending")
        wingedDescription = activityRow.description.replace(`🪂 ${activityRow.wing}`, stats)
    }
    console.log('wingedDescription')
    console.log(wingedDescription)
    console.log()

    // Update Strava Activity description
    const userResult = await Pilots.get(activityRow.user_id)
    if (!userResult.success) {
        return {
            success: false,
            message: `Couldn't get user for userId=${activityRow.user_id}`
        }
    }
    const stravaApi = await StravaApi.fromUserId(userResult.value.user_id)
    const updateDescriptionResult = await stravaApi.updateDescription(activityRow.activity_id, wingedDescription)
    if (!updateDescriptionResult.success) {
        return {
            success: false,
            message: updateDescriptionResult.error
        }
    }

    // if success store updated else store failed
    const updateResult = await Activities.updateDescription(task.activityId, wingedDescription, "done")
    if (!updateResult.success) {
        return {
            success: false,
            message: `Failed to updateDescription error=${updateResult.error}`
        }
    }

    return {
        success: true
    }
}