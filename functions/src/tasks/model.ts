import { executeFetchAllActivitiesTask } from "./fetchAllActivities";
import { executeUpdateDescriptionTask } from "./updateDescription";
import { executeHelloWorldTask } from "./helloWorld";
import { executeSyncSitesTask } from "./syncSites";
import { FetchAllActivitiesTask, UpdateDescriptionTask, HelloWorldTask, SyncSitesTask } from "@parastats/common/src/model";

export type TaskResult = TaskSuccess | TaskFailure

export type TaskSuccess = {
    success: true
}

export type TaskFailure = {
    success: false
    message: string
}

export type TaskBody = FetchAllActivitiesTask | UpdateDescriptionTask | HelloWorldTask | SyncSitesTask

export type TaskHandler = (task: any) => Promise<TaskResult>

export type TaskName = TaskBody['name'];

export const taskHandlers: Record<TaskName, TaskHandler> = {
    SyncSites: executeSyncSitesTask,
    FetchAllActivities: executeFetchAllActivitiesTask,
    UpdateDescription: executeUpdateDescriptionTask,
    HelloWorld: executeHelloWorldTask,
}