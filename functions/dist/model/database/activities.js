"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activities = void 0;
const client_1 = require("./client");
const model_1 = require("../model");
var activities;
(function (activities_1) {
    async function get(activityId) {
        const database = await (0, client_1.getDatabase)();
        const result = await database.query(`
            select user_id,
                   activity_id,
                   wing,
                   duration_sec,
                   distance_meters,
                   start_date,
                   description_status,
                   description
            from activities
            where activity_id = $1`, [activityId]);
        if (result.rows.length === 1) {
            return new model_1.Success(result.rows[0].reify());
        }
        else {
            return new model_1.Failed(`No results for activityId=${activityId}`);
        }
    }
    activities_1.get = get;
    async function getAll(userId) {
        const database = await (0, client_1.getDatabase)();
        const result = await database.query(`
            select user_id,
                   activity_id,
                   wing,
                   duration_sec,
                   distance_meters,
                   start_date,
                   description_status,
                   description
            from activities
            where user_id = $1`, [userId]);
        if (result.rows) {
            return (0, model_1.success)([...result]);
        }
        else {
            return (0, model_1.failed)(`Failed to getAll for userId=${userId}`);
        }
    }
    activities_1.getAll = getAll;
    async function updateDescription(activityId, description, descriptionStatus) {
        const database = await (0, client_1.getDatabase)();
        try {
            await database.query(`
                update activities
                set description = $1
                where activity_id = $2
            `, [description, activityId]);
            return (0, model_1.success)(undefined);
        }
        catch (error) {
            return (0, model_1.failed)(`Failed to updateDescription activityId=${activityId} description=${description} descriptionStatus=${descriptionStatus} error=${error}`);
        }
    }
    activities_1.updateDescription = updateDescription;
    async function upsertActivities(activities) {
        const database = await (0, client_1.getDatabase)();
        try {
            for await (const activity of activities) {
                console.log(`Inserting ${JSON.stringify(activity)}`);
                await database.query(`
                            insert into activities(user_id,
                                                   activity_id,
                                                   wing,
                                                   duration_sec,
                                                   distance_meters,
                                                   start_date,
                                                   description)
                            values ($1, $2, $3, $4, $5, $6, $7)
                            on conflict(activity_id)
                                do update set wing=$8,
                                              duration_sec=$9,
                                              distance_meters=$10,
                                              start_date=$11,
                                              description=$12;
                    `, [
                    activity.user_id,
                    activity.activity_id,
                    activity.wing,
                    activity.duration_sec,
                    activity.distance_meters,
                    activity.start_date,
                    activity.description,
                    activity.wing,
                    activity.duration_sec,
                    activity.distance_meters,
                    activity.start_date,
                    activity.description
                ]);
            }
            return (0, model_1.success)(undefined);
        }
        catch (error) {
            return (0, model_1.failed)(error.toString());
        }
    }
    activities_1.upsertActivities = upsertActivities;
})(activities || (exports.activities = activities = {}));
