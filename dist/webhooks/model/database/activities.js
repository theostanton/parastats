"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertActivities = insertActivities;
const client_1 = require("./client");
async function insertActivities(activities) {
    const database = await (0, client_1.getDatabase)();
    await database.query("insert into activities(user_id, activity_id, wing, duration_sec, distance_meters) values($1, $2, $3, $4, $5)", activities);
}
