"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivities = getActivities;
const jwt_1 = require("../jwt");
const activities_1 = require("../model/database/activities");
async function getActivities(req, res) {
    console.log("getActivities");
    const user = await (0, jwt_1.extractUserFromJwt)(req);
    console.log("getActivities user=", user);
    const result = await activities_1.activities.getAll(user.user_id);
    console.log("getActivities result=", result);
    if (result.success) {
        const sanitised = JSON.parse(JSON.stringify(result.value, (_, v) => typeof v === "bigint" ? v.toString() : v));
        res.status(200).json(sanitised);
    }
    else {
        res.status(400).json({ error: result.error });
    }
}
