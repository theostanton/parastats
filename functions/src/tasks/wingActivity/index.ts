import {TaskResult, isWingActivityTask, TaskBody} from "../model";
import {activities} from "../../model/database/activities";
import {generateStats} from "./updateActivityDescription";

export default async function (task: TaskBody): Promise<TaskResult> {
    if (!isWingActivityTask(task)) {
        return {
            success: false,
            message: `Missing body information task=${JSON.stringify(task)}`
        }
    }

    console.log(`Gonna wing activity for activityId=${task.activityId}`)

    // Fetch ActivityRow
    const result = await activities.get(task.activityId)
    if (!result.success) {
        return {
            success: false,
            message: `No activity rows for activityId=${task.activityId}`
        }
    }
    const activityRow = result.value

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
    //TODO

    // if success store updated else store failed
    const updateResult = await activities.updateDescription(task.activityId, wingedDescription, "done")
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