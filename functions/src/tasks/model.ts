import fetchAllActivities from "./fetchAllActivities";
import wingActivity from "./wingActivity";

export type TaskResult = TaskSuccess | TaskFailure

export type TaskSuccess = {
    success: true
}

export type TaskFailure = {
    success: false
    message: string
}

export type TaskBody = FetchAllActivitiesTask | WingActivityTask

export type TaskHandler = (task: TaskBody) => Promise<TaskResult>

export type TaskName = TaskBody['name'];

export type FetchAllActivitiesTask = {
    name: "FetchAllActivities";
    userId: number
}

export function isFetchAllActivitiesTask(body: TaskBody): body is FetchAllActivitiesTask {
    return (body as FetchAllActivitiesTask).userId !== undefined;
}

export type WingActivityTask = {
    name: "WingActivity";
    activityId: number
}

export function isWingActivityTask(body: TaskBody): body is WingActivityTask {
    return (body as WingActivityTask).activityId !== undefined;
}

export const taskHandlers: Record<TaskName, TaskHandler> = {
    FetchAllActivities: fetchAllActivities,
    WingActivity: wingActivity,
}