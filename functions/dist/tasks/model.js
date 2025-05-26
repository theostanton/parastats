"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskHandlers = void 0;
exports.isFetchAllActivitiesTask = isFetchAllActivitiesTask;
exports.isWingActivityTask = isWingActivityTask;
const fetchAllActivities_1 = __importDefault(require("./fetchAllActivities"));
const wingActivity_1 = __importDefault(require("./wingActivity"));
function isFetchAllActivitiesTask(body) {
    return body.userId !== undefined;
}
function isWingActivityTask(body) {
    return body.activityId !== undefined;
}
exports.taskHandlers = {
    FetchAllActivities: fetchAllActivities_1.default,
    WingActivity: wingActivity_1.default,
};
