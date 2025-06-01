import fetchAllActivities, {FetchAllActivitiesTask} from "./fetchAllActivities";
import updateDescription, {UpdateDescriptionTask} from "./updateDescription";
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

export type TaskBody = FetchAllActivitiesTask | UpdateDescriptionTask | HelloWorldTask | SyncSitesTask

export type TaskHandler = (task: TaskBody) => Promise<TaskResult>

export type TaskName = TaskBody['name'];

export const taskHandlers: Record<TaskName, TaskHandler> = {
    SyncSites: syncSites,
    FetchAllActivities: fetchAllActivities,
    UpdateDescription: updateDescription,
    HelloWorld: helloWorld,
}