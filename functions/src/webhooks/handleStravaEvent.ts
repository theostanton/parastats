import { Request, Response } from "express";
import {
    StravaWebhookEvent,
    WebhookEventStatus,
    WebhookEventType,
    WebhookObjectType,
    WebhookEvents,
    TaskExecutions,
    withPooledClient,
    Pilots,
    isSuccess, isFailure
} from "@parastats/common";
import triggerTask from "../tasks/trigger";

/**
 * Handle incoming Strava webhook events
 * Logs all events to monitoring and processes relevant ones
 */
export async function handleStravaEvent(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
        // Parse webhook payload
        const payload: StravaWebhookEvent = req.body;
        console.log("Received Strava webhook event:", JSON.stringify(payload, null, 2));

        // Validate required fields
        if (!payload.object_type || !payload.object_id || !payload.aspect_type || !payload.owner_id) {
            console.error("Invalid webhook payload - missing required fields");
            res.status(400).json({ error: "Invalid webhook payload" });
            return;
        }

        // Convert to our enum types
        const eventType = payload.aspect_type as WebhookEventType;
        const objectType = payload.object_type as WebhookObjectType;

        // Log webhook event to monitoring database
        const webhookEventResult = await withPooledClient(async (client) => {
            return await WebhookEvents.create(client, {
                event_type: eventType,
                object_type: objectType,
                object_id: payload.object_id.toString(),
                pilot_id: payload.owner_id,
                payload: payload
            });
        });

        if (!webhookEventResult[0]) {
            console.error("Failed to log webhook event:", webhookEventResult[1]);
            res.status(500).json({ error: "Failed to log webhook event" });
            return;
        }

        const webhookEvent = webhookEventResult[0];
        console.log(`Logged webhook event with ID: ${webhookEvent.id}`);

        // Respond quickly to Strava (within 2 seconds)
        res.status(200).json({ 
            status: "received",
            event_id: webhookEvent.id
        });

        // Process event asynchronously
        processWebhookEventAsync(webhookEvent.id, payload, startTime);

    } catch (error) {
        console.error("Error handling Strava webhook:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Process webhook event asynchronously after responding to Strava
 */
async function processWebhookEventAsync(
    webhookEventId: string, 
    payload: StravaWebhookEvent,
    startTime: number
): Promise<void> {
    try {
        console.log(`Processing webhook event ${webhookEventId} asynchronously`);

        // Update status to processing
        await withPooledClient(async (client) => {
            await WebhookEvents.updateStatus(client, webhookEventId, {
                status: WebhookEventStatus.Processing
            });
        });

        // Determine if we should process this event
        const shouldProcess = await shouldProcessEvent(payload);
        
        if (!shouldProcess.process) {
            console.log(`Ignoring webhook event: ${shouldProcess.reason}`);
            
            // Mark as ignored
            const processingTime = Date.now() - startTime;
            await withPooledClient(async (client) => {
                await WebhookEvents.updateStatus(client, webhookEventId, {
                    status: WebhookEventStatus.Ignored,
                    processed_at: new Date(),
                    processing_duration_ms: processingTime
                });
            });
            return;
        }

        // Process the event based on type
        let taskTriggered = false;
        let taskId: string | null = null;

        if (payload.object_type === 'activity') {
            taskId = await processActivityEvent(webhookEventId, payload);
            taskTriggered = !!taskId;
        } else if (payload.object_type === 'athlete') {
            await processAthleteEvent(webhookEventId, payload);
        }

        // Mark webhook as completed
        const processingTime = Date.now() - startTime;
        await withPooledClient(async (client) => {
            await WebhookEvents.updateStatus(client, webhookEventId, {
                status: WebhookEventStatus.Completed,
                processed_at: new Date(),
                processing_duration_ms: processingTime
            });
        });

        console.log(`Successfully processed webhook event ${webhookEventId} in ${processingTime}ms`);

    } catch (error) {
        console.error(`Error processing webhook event ${webhookEventId}:`, error);
        
        // Mark webhook as failed
        const processingTime = Date.now() - startTime;
        await withPooledClient(async (client) => {
            await WebhookEvents.updateStatus(client, webhookEventId, {
                status: WebhookEventStatus.Failed,
                processed_at: new Date(),
                processing_duration_ms: processingTime,
                error_message: error instanceof Error ? error.message : String(error)
            });
        });
    }
}

/**
 * Determine if we should process this webhook event
 */
async function shouldProcessEvent(payload: StravaWebhookEvent): Promise<{
    process: boolean;
    reason: string;
}> {
    // Only process activity events for now
    if (payload.object_type !== 'activity') {
        return {
            process: false,
            reason: `Object type '${payload.object_type}' not supported`
        };
    }

    // Skip deleted activities - we could implement cleanup later
    if (payload.aspect_type === 'delete') {
        return {
            process: false,
            reason: 'Activity deletion events not implemented'
        };
    }

    // Check if pilot exists in our system
    const pilotResult = await withPooledClient(async (client) => {
        return await Pilots.get(payload.owner_id);
    });

    if (!isSuccess(pilotResult)) {
        return {
            process: false,
            reason: `Pilot ${payload.owner_id} not found in our system`
        };
    }

    return {
        process: true,
        reason: 'Event should be processed'
    };
}

/**
 * Process activity-related webhook events
 */
async function processActivityEvent(
    webhookEventId: string, 
    payload: StravaWebhookEvent
): Promise<string | null> {
    console.log(`Processing activity event: ${payload.aspect_type} for activity ${payload.object_id}`);

    try {
        // For both create and update events, we'll trigger a FetchAllActivities task
        // This ensures we get the latest activity data and process it properly
        const taskBody = {
            name: "FetchAllActivities" as const,
            pilotId: payload.owner_id
        };

        // Trigger the task
        const taskResult = await triggerTask(taskBody);
        
        if (isFailure(taskResult)) {
            throw new Error(`Failed to trigger FetchAllActivities task: ${taskResult[1]}`);
        }

        // Log task execution to monitoring
        const taskExecutionResult = await withPooledClient(async (client) => {
            return await TaskExecutions.create(client, {
                task_name: "FetchAllActivities",
                task_payload: taskBody,
                triggered_by: `webhook_event`,
                triggered_by_webhook_id: webhookEventId,
                pilot_id: payload.owner_id
            });
        });

        if (!taskExecutionResult[0]) {
            console.error("Failed to log task execution:", taskExecutionResult[1]);
            return null;
        }

        const taskExecution = taskExecutionResult[0];
        console.log(`Triggered FetchAllActivities task with execution ID: ${taskExecution.id}`);
        
        return taskExecution.id;

    } catch (error) {
        console.error("Error processing activity event:", error);
        throw error;
    }
}

/**
 * Process athlete-related webhook events (e.g., deauthorization)
 */
async function processAthleteEvent(
    webhookEventId: string, 
    payload: StravaWebhookEvent
): Promise<void> {
    console.log(`Processing athlete event: ${payload.aspect_type} for athlete ${payload.object_id}`);

    // Handle athlete deauthorization
    if (payload.aspect_type === 'update' && payload.updates?.authorized === false) {
        console.log(`Athlete ${payload.object_id} has deauthorized the application`);
        // TODO: Implement cleanup logic for deauthorized athletes
        // - Mark pilot as inactive
        // - Clean up sensitive data if required
        // - Log the deauthorization
    }
}

/**
 * Verify Strava webhook signature (implement when we have the signing secret)
 */
export function verifyStravaSignature(req: Request): boolean {
    // TODO: Implement signature verification
    // const signature = req.headers['x-hub-signature-256'];
    // const secret = process.env.STRAVA_WEBHOOK_SECRET;
    // if (!signature || !secret) return false;
    
    // For now, return true - we'll implement this when we set up webhook subscriptions
    return true;
}