"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
exports.convertStravaActivities = convertStravaActivities;
const stravaApi_1 = require("../model/stravaApi");
const client_1 = require("../model/database/client");
const activities_1 = require("../model/database/activities");
async function default_1(token) {
    const api = new stravaApi_1.StravaApi(token);
    const database = await (0, client_1.getDatabase)();
    // Fetch profile
    const athlete = await api.fetchAthlete();
    // Save profile to `user` table
    const result = await database.query(`
                INSERT INTO users (user_id, first_name, token)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id)
                    DO UPDATE SET first_name = $4,
                                  token      = $5;`, [athlete.id, athlete.firstname, token, athlete.firstname, token]);
    console.log(`Inserted user ${result.rows[0]}`);
    // Fetch activities
    const fetchWingedActivitiesResult = await api.fetchWingedActivities();
    if (!fetchWingedActivitiesResult.success) {
        return {
            success: false,
            message: `fetchWingedActivities failed: ${fetchWingedActivitiesResult.error}`
        };
    }
    const wingedActivities = fetchWingedActivitiesResult.value;
    console.log(`Got ${wingedActivities.length} winged activities`);
    // Convert to ActivityRows
    const activityRows = convertStravaActivities(athlete.id, wingedActivities);
    console.log(`Got ${activityRows.length} activity rows`);
    // Insert winged activities to activities
    const insertActivitiesResult = await (0, activities_1.insertActivities)(activityRows);
    if (!insertActivitiesResult.success) {
        return {
            success: false,
            message: `insertActivities failed: ${insertActivitiesResult.error}`
        };
    }
    console.log(`Inserted ${activityRows.length} activity rows`);
    // Edit recent activities
    //TODO
    return {
        success: true,
        message: `Inserted ${athlete.firstname} wingedActivities=${wingedActivities.length}`
    };
}
function convertStravaActivities(userId, stravaActivities) {
    return stravaActivities.map(stravaActivity => {
        const matches = stravaActivity.description
            .split("\n")
            .map((line) => line.match(/^🪂 ([a-zA-Z ]*)/g))
            .filter(match => match != null && match.length > 0)
            .map((line) => line[0].replace("🪂 ", ""));
        if (matches.length == 0) {
            return null;
        }
        const wing = matches[0];
        const result = {
            user_id: userId,
            activity_id: stravaActivity.id,
            distance_meters: stravaActivity.distance,
            duration_sec: stravaActivity.elapsed_time,
            wing: wing,
            start_date: stravaActivity.start_date,
            description: stravaActivity.description,
            description_status: "todo"
        };
        return result;
    }).filter(activity => activity != null);
}
