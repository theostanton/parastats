import {TaskResult, isWingActivityTask, TaskBody} from "../model";

export default async function (task: TaskBody): Promise<TaskResult> {
    if (!isWingActivityTask(task)) {
        return {
            success: false,
            message: `Missing body information task=${JSON.stringify(task)}`
        }
    }

    console.log(`Gonna wing activity for activityId=${task.activityId}`)

    return {
        success: true
    }
}