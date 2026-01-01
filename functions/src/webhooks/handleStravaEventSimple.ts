import {isSuccess, isFailure} from "@parastats/common";
import { Request, Response } from "express";
import triggerTask from "../tasks/trigger";
import { Flights } from "../model/database/Flights";

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

        // Handle activity deletion
        if (payload.aspect_type === 'delete') {
            console.log(`Deleting activity ${payload.object_id}`);
            const deleteResult = await Flights.deleteByActivityId(payload.object_id.toString());

            if (isFailure(deleteResult)) {
                throw new Error(`Failed to delete flight: ${deleteResult[1]}`);
            }

            console.log(`Successfully deleted activity ${payload.object_id}`);
            return;
        }

        // Use UpdateSingleActivity task for efficient single-activity sync
        const taskBody = {
            name: "UpdateSingleActivity" as const,
            pilotId: payload.owner_id,
            activityId: payload.object_id.toString()
        };

        console.log(`Triggering UpdateSingleActivity task for activity ${payload.object_id}`);

        // Trigger the task
        const taskResult = await triggerTask(taskBody);

        if (!isSuccess(taskResult)) {
            throw new Error(`Failed to trigger UpdateSingleActivity task: ${taskResult[1]}`);
        }

        // Chain description update task for automatic stats updates
        const descriptionTaskBody = {
            name: "UpdateDescription" as const,
            flightId: payload.object_id.toString()
        };

        const descriptionTaskResult = await triggerTask(descriptionTaskBody);

        if (!isSuccess(descriptionTaskResult)) {
            console.error(`Failed to trigger UpdateDescription task: ${descriptionTaskResult[1]}`);
            // Don't throw - description update is optional, activity sync already succeeded
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
 * Verify Strava webhook signature using HMAC-SHA256
 */
export function verifyStravaSignatureSimple(req: Request): boolean {
    const signature = req.headers['x-hub-signature-256'] as string;
    const secret = process.env.STRAVA_WEBHOOK_SECRET;

    if (!signature || !secret) {
        console.error("Missing signature or webhook secret");
        return false;
    }

    try {
        const crypto = require('crypto');

        // Compute HMAC-SHA256 of raw request body
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(JSON.stringify(req.body));
        const computedSignature = `sha256=${hmac.digest('hex')}`;

        // Constant-time comparison to prevent timing attacks
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(computedSignature)
        );
    } catch (error) {
        console.error("Error verifying signature:", error);
        return false;
    }
}