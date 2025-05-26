"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const model_1 = require("../model");
const activities_1 = require("../../src/model/database/activities");
const updateActivityDescription_1 = require("./updateActivityDescription");
const stravaApi_1 = require("../../src/model/stravaApi");
const users_1 = require("../../src/model/database/users");
async function default_1(task) {
    if (!(0, model_1.isWingActivityTask)(task)) {
        return {
            success: false,
            message: `Missing body information task=${JSON.stringify(task)}`
        };
    }
    console.log(`Gonna wing activity for activityId=${task.activityId}`);
    // Fetch ActivityRow
    const result = await activities_1.activities.get(task.activityId);
    if (!result.success) {
        return {
            success: false,
            message: `No activity rows for activityId=${task.activityId}`
        };
    }
    const activityRow = result.value;
    // const type: SomeType = {lol: "lil"}
    // Generate stats
    const stats = await (0, updateActivityDescription_1.generateStats)(activityRow);
    // Check description is already winged
    const alreadyWinged = activityRow.description.includes("🌐 parastats.info");
    // If winged, replace stats
    let wingedDescription;
    if (alreadyWinged) {
        console.log("Updating");
        wingedDescription = activityRow.description.replace(/🪂[\s\S]*parastats.info/, stats);
    }
    else {
        console.log("Appending");
        wingedDescription = activityRow.description.replace(`🪂 ${activityRow.wing}`, stats);
    }
    console.log('wingedDescription');
    console.log(wingedDescription);
    console.log();
    // Update Strava Activity description
    const userResult = await users_1.users.get(activityRow.user_id);
    if (!userResult.success) {
        return {
            success: false,
            message: `Couldn't get user for userId=${activityRow.user_id}`
        };
    }
    const stravaApi = new stravaApi_1.StravaApi(userResult.value.token);
    const updateDescriptionResult = await stravaApi.updateDescription(activityRow.activity_id, wingedDescription);
    if (!updateDescriptionResult.success) {
        return {
            success: false,
            message: updateDescriptionResult.error
        };
    }
    // if success store updated else store failed
    const updateResult = await activities_1.activities.updateDescription(task.activityId, wingedDescription, "done");
    if (!updateResult.success) {
        return {
            success: false,
            message: `Failed to updateDescription error=${updateResult.error}`
        };
    }
    return {
        success: true
    };
}
