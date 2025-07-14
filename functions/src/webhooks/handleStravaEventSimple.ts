import {isSuccess} from "@parastats/common";
import { Request, Response } from "express";
import triggerTask from "../tasks/trigger";

/**
 * Simple Strava webhook event handler without monitoring
 * This is a temporary implementation until Docker path mapping is fixed
 */
export async function handleStravaEventSimple(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    
    try {
        const payload = req.body;
        console.log("Received Strava webhook event:", JSON.stringify(payload, null, 2));

        // Validate required fields
        if (!payload.object_type || !payload.object_id || !payload.aspect_type || !payload.owner_id) {
            console.error("Invalid webhook payload - missing required fields");
            res.status(400).json({ error: "Invalid webhook payload" });
            return;
        }

        // Respond quickly to Strava (within 2 seconds)
        res.status(200).json({ 
            status: "received",
            message: "Webhook event received and will be processed"
        });

        // Process event asynchronously
        processWebhookEventAsync(payload, startTime);

    } catch (error) {
        console.error("Error handling Strava webhook:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Process webhook event asynchronously after responding to Strava
 */
async function processWebhookEventAsync(payload: any, startTime: number): Promise<void> {
    try {
        console.log(`Processing webhook event asynchronously`);

        // Only process activity events for now
        if (payload.object_type !== 'activity') {
            console.log(`Ignoring webhook event: Object type '${payload.object_type}' not supported`);
            return;
        }

        // Skip deleted activities
        if (payload.aspect_type === 'delete') {
            console.log('Ignoring activity deletion events');
            return;
        }

        // For both create and update events, trigger a FetchAllActivities task
        const taskBody = {
            name: "FetchAllActivities" as const,
            pilotId: payload.owner_id
        };

        console.log(`Triggering FetchAllActivities task for pilot ${payload.owner_id}`);
        
        // Trigger the task
        const taskResult = await triggerTask(taskBody);
        
        if (!isSuccess(taskResult)) {
            throw new Error(`Failed to trigger FetchAllActivities task: ${taskResult[1]}`);
        }

        const processingTime = Date.now() - startTime;
        console.log(`Successfully processed webhook event in ${processingTime}ms`);

    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`Error processing webhook event:`, error);
        console.log(`Failed to process webhook event in ${processingTime}ms`);
    }
}

/**
 * Verify Strava webhook signature (implement when we have the signing secret)
 */
export function verifyStravaSignatureSimple(req: Request): boolean {
    // TODO: Implement signature verification
    // For now, return true - we'll implement this when we set up webhook subscriptions
    return true;
}