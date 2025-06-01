import {TaskResult, TaskBody} from "../model";
import {generateStats} from "./updateActivityDescription";
import {Pilots} from "../../model/database/Pilots";
import {StravaApi} from "../../model/stravaApi";
import {Flights} from "../../model/database/Flights";
import {StravaActivityId} from "../../model/stravaApi/model";

export type WingActivityTask = {
    name: "WingActivity";
    flightId: StravaActivityId
}

function isWingActivityTask(body: TaskBody): body is WingActivityTask {
    return (body as WingActivityTask).flightId !== undefined;
}

export default async function (task: TaskBody): Promise<TaskResult> {
    if (!isWingActivityTask(task)) {
        return {
            success: false,
            message: `Missing body information task=${JSON.stringify(task)}`
        }
    }

    console.log(`Gonna wing activity for activityId=${task.flightId}`)

    // Fetch ActivityRow
    const result = await Flights.get(task.flightId)
    if (!result.success) {
        return {
            success: false,
            message: `No activity rows for activityId=${task.flightId}`
        }
    }
    const activityRow = result.value

    // Generate stats
    const stats = await generateStats(activityRow)

    if (stats == null) {
        console.log("Skipping because stats==null")
        return {
            success: true,
        }
    }

    // Check description is already winged
    const alreadyWinged = activityRow.description.includes("🌐 parastats.info")

    // If winged, replace stats
    let wingedDescription: string
    if (alreadyWinged) {
        console.log("Updating")
        wingedDescription = activityRow.description.replace(/(?:[🪂↘️↗️])[\s\S]*parastats.info/, stats)
    } else {
        console.log("Appending")
        wingedDescription = activityRow.description.replace(`🪂 ${activityRow.wing}`, stats)
    }
    console.log('wingedDescription')
    console.log(wingedDescription)
    console.log()

    // Update Strava Activity description
    const userResult = await Pilots.get(activityRow.pilot_id)
    if (!userResult.success) {
        return {
            success: false,
            message: `Couldn't get user for userId=${activityRow.pilot_id}`
        }
    }
    const stravaApi = await StravaApi.fromUserId(userResult.value.pilot_id)
    const updateDescriptionResult = await stravaApi.updateDescription(activityRow.strava_activity_id, wingedDescription)
    if (!updateDescriptionResult.success) {
        return {
            success: false,
            message: updateDescriptionResult.error
        }
    }

    // if success store updated else store failed
    const updateResult = await Flights.updateDescription(task.flightId, wingedDescription)
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