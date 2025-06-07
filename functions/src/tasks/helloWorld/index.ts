import {TaskBody, TaskResult} from "@/tasks/model";


export type HelloWorldTask = {
    name: "HelloWorld";
    hello: string
}

function isHelloWorldTask(body: TaskBody): body is HelloWorldTask {
    return (body as HelloWorldTask).hello !== undefined;
}

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