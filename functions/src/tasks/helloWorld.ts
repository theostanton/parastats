import { HelloWorldTask, TaskResult } from '@parastats/common/src/model';

export async function executeHelloWorldTask(
    task: HelloWorldTask
): Promise<TaskResult> {
    console.log('Executing HelloWorld task');
    
    // Simple test task that doesn't require any external dependencies
    console.log('Hello, World! Task executed successfully.');
    
    return {
        success: true
    };
}