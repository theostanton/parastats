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
                                  token = $5;`, [athlete.id, athlete.firstname, token, athlete.firstname, token]);
    // Fetch activities
    const wingedActivities = await api.fetchWingedActivities();
    // Convert to ActivityRows
    const activityRows = await convertStravaActivities(athlete.id, wingedActivities);
    // Insert winged activities to activities
    await (0, activities_1.insertActivities)(activityRows);
    // Edit recent activities
    //TODO
    return {
        success: true,
        message: `Inserted ${athlete.firstname} wingedActivities=${wingedActivities.length}`
    };
}
async function convertStravaActivities(userId, stravaActivities) {
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
        return {
            user_id: userId,
            activity_id: stravaActivity.id,
            distance_meters: stravaActivity.distance,
            duration_sec: stravaActivity.elapsed_time,
            wing: wing
        };
    }).filter(activity => activity != null);
}
