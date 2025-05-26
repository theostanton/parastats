import fetchAllActivities from "./fetchAllActivities";
import wingActivity from "./wingActivity";
import helloWorld from "./helloWorld";

export type TaskResult = TaskSuccess | TaskFailure

export type TaskSuccess = {
    success: true
}

export type TaskFailure = {
    success: false
    message: string
}

export type TaskBody = FetchAllActivitiesTask | WingActivityTask | HelloWorldTask

export type TaskHandler = (task: TaskBody) => Promise<TaskResult>

export type TaskName = TaskBody['name'];

export type HelloWorldTask = {
    name: "HelloWorld";
    hello: string
}

export function isHelloWorldTask(body: TaskBody): body is HelloWorldTask {
    return (body as HelloWorldTask).hello !== undefined;
}

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
    HelloWorld: helloWorld,
}