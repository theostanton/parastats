import {isHelloWorldTask, TaskBody, TaskResult} from "../model";

export default async function (task: TaskBody): Promise<TaskResult> {
    if (!isHelloWorldTask(task)) {
        return {
            success: false,
            message: `Is not a HelloWorldTask task=${JSON.stringify(task)}`
        }
    }

    return {
        success: true,
    }
}