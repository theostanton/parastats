import {TaskResult, TaskBody} from "@/tasks/model";
// import {generateStats} from "./updateActivityDescription";
import {Pilots, Flights, isSuccess} from "@parastats/common";
import {StravaApi} from "@/stravaApi";
import {StravaActivityId} from "@/stravaApi/model";

export type UpdateDescriptionTask = {
    name: "UpdateDescription";
    flightId: StravaActivityId
}

function isWingActivityTask(body: TaskBody): body is UpdateDescriptionTask {
    return (body as UpdateDescriptionTask).flightId !== undefined;
}

export default async function (task: TaskBody): Promise<TaskResult> {
    if (!isWingActivityTask(task)) {
        return {
            success: false,
            message: `Missing body information task=${JSON.stringify(task)}`
        }
    }

    console.log(`Gonna update description flightId=${task.flightId}`)

    // Fetch ActivityRow
    const result = await Flights.get(task.flightId)
    if (!isSuccess(result)) {
        return {
            success: false,
            message: `No flight rows for flightId=${task.flightId}`
        }
    }
    const [activityRow] = result

    // Generate stats (temporarily disabled)
    // const stats = await generateStats(activityRow)
    const stats = null;

    if (stats == null) {
        console.log("Skipping because stats generation is temporarily disabled")
        return {
            success: true,
        }
    }

    // Check description is already winged
    const alreadyWinged = activityRow.description.includes("🌐 paragliderstats.com")

    // If winged, replace stats
    let wingedDescription: string
    if (alreadyWinged) {
        console.log("Updating")
        wingedDescription = activityRow.description.replace(/(?:[🪂↘️↗️])[\s\S]*paragliderstats.com/, stats)
    } else {
        console.log("Appending")
        wingedDescription = activityRow.description.replace(`🪂 ${activityRow.wing}`, stats)
    }
    console.log('wingedDescription')
    console.log(wingedDescription)
    console.log()

    // Update Strava Activity description
    const userResult = await Pilots.get(activityRow.pilot_id)
    if (!isSuccess(userResult)) {
        return {
            success: false,
            message: `Couldn't get user for userId=${activityRow.pilot_id}`
        }
    }
    const [user] = userResult;
    const stravaApi = await StravaApi.fromUserId(user.pilot_id)
    const updateDescriptionResult = await stravaApi.updateDescription(activityRow.strava_activity_id, wingedDescription)
    if (!isSuccess(updateDescriptionResult)) {
        return {
            success: false,
            message: updateDescriptionResult[1]
        }
    }

    // if success store updated else store failed
    const updateResult = await Flights.updateDescription(task.flightId, wingedDescription)
    if (!isSuccess(updateResult)) {
        return {
            success: false,
            message: `Failed to updateDescription error=${updateResult[1]}`
        }
    }

    return {
        success: true
    }
}