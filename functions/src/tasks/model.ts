import fetchAllActivities, {FetchAllActivitiesTask} from "./fetchAllActivities";
import wingActivity, {WingActivityTask} from "./wingActivity";
import helloWorld, {HelloWorldTask} from "./helloWorld";
import syncSites, {SyncSitesTask} from "./syncSites";

export type TaskResult = TaskSuccess | TaskFailure

export type TaskSuccess = {
    success: true
}

export type TaskFailure = {
    success: false
    message: string
}

export type TaskBody = FetchAllActivitiesTask | WingActivityTask | HelloWorldTask | SyncSitesTask

export type TaskHandler = (task: TaskBody) => Promise<TaskResult>

export type TaskName = TaskBody['name'];

export const taskHandlers: Record<TaskName, TaskHandler> = {
    SyncSites: syncSites,
    FetchAllActivities: fetchAllActivities,
    WingActivity: wingActivity,
    HelloWorld: helloWorld,
}