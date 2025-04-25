"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const index_1 = require("./database/index");
const stravaApi_1 = require("./stravaApi");
async function default_1(token) {
    const api = new stravaApi_1.StravaApi(token);
    const database = await (0, index_1.getDatabase)();
    // Fetch profile
    const athlete = await api.fetchAthlete();
    // Save profile to `user` table
    const result = await database.query("INSERT INTO users(user_id,first_name,token) values ($1, $2, $3);", [athlete.id, athlete.firstname, token]);
    // Fetch activities
    // Insert winged activities to activities
    // Edit recent activities
}
