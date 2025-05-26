"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertStravaActivity = convertStravaActivity;
function convertStravaActivity(userId, stravaActivity) {
    const matches = stravaActivity.description
        .split("\n")
        .map((line) => line.match(/^🪂 ([a-zA-Z ]*)/g))
        .filter(match => match != null && match.length > 0)
        .map((line) => line[0].replace("🪂 ", ""));
    if (matches.length == 0) {
        return null;
    }
    return {
        user_id: userId,
        activity_id: stravaActivity.id,
        distance_meters: stravaActivity.distance,
        duration_sec: stravaActivity.elapsed_time,
        wing: matches[0],
        start_date: new Date(stravaActivity.start_date),
        description: stravaActivity.description,
        description_status: "todo"
    };
}
