"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const model_1 = require("../model");
const stravaApi_1 = require("../../model/stravaApi");
const convertStravaActivities_1 = require("./convertStravaActivities");
const client_1 = require("../../model/database/client");
const users_1 = require("../../model/database/users");
const activities_1 = require("../../model/database/activities");
var upsertActivities = activities_1.activities.upsertActivities;
const axios_1 = __importStar(require("axios"));
async function default_1(task) {
    if (!(0, model_1.isFetchAllActivitiesTask)(task)) {
        return {
            success: false,
            message: `Missing body information task=${JSON.stringify(task)}`
        };
    }
    console.log(`Gonna initialise user for userId=${task.userId}`);
    // Get user from database
    const userResult = await users_1.users.get(task.userId);
    if (!userResult.success) {
        return {
            success: false,
            message: `No user with id ${task.userId}`,
        };
    }
    const user = userResult.value;
    const api = new stravaApi_1.StravaApi(user.token);
    console.log(`got api for token=${user.token}`);
    // Get existing activity IDs from database
    const database = await (0, client_1.getDatabase)();
    const existingActivityIdsResult = await database.query(`
        select a.activity_id as activity_id
        from activities as a
                 inner join users as u
                            on a.user_id = u.user_id and u.token = $1
    `, [user.token]);
    const existingActivityIds = [...existingActivityIdsResult].map(a => a.activity_id);
    // Fetch activities
    const fetchWingedActivityIdsResult = await api.fetchWingedActivityIds(1000, existingActivityIds);
    if (!fetchWingedActivityIdsResult.success) {
        return {
            success: false,
            message: `fetchWingedActivities failed: ${fetchWingedActivityIdsResult.error}`
        };
    }
    const wingedActivityIds = fetchWingedActivityIdsResult.value;
    // Process winged activity IDs
    // 1. Fetch full Strava Activity
    // 2. Store to activities table
    const storedActivities = [];
    const headers = new axios_1.AxiosHeaders();
    headers.set('Authorization', `Bearer ${user.token}`);
    for (const activityId of wingedActivityIds) {
        const result = await axios_1.default.get(`https://www.strava.com/api/v3/activities/${activityId}`, { headers: headers });
        if (result.status == 429) {
            let errorMessage = `Got rate limited after ${storedActivities.length} activities`;
            console.log(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        }
        const stravaActivity = result.data;
        const activityRow = (0, convertStravaActivities_1.convertStravaActivity)(user.user_id, stravaActivity);
        if (activityRow) {
            const insertActivityResult = await upsertActivities([activityRow]);
            if (!insertActivityResult.success) {
                return {
                    success: false,
                    message: `upsertActivities failed for row=${activityRow} error=${insertActivityResult.error}`
                };
            }
            storedActivities.push(stravaActivity);
            console.log(`Appended ${storedActivities.length}/${wingedActivityIds.length}`);
        }
        else {
            console.log(`Skipped id=${stravaActivity.id} title=${stravaActivity.name} description=${stravaActivity.description}`);
        }
    }
    // Once succesful,
    //TODO
    return {
        success: true
    };
}
