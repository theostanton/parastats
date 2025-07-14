/**
 * Simple test script to verify webhook monitoring functionality
 * This simulates a Strava webhook event to test our implementation
 */

import { handleStravaEventSimple } from './handleStravaEventSimple';
import { Request, Response } from 'express';

// Mock Express request/response objects
const createMockRequest = (body: any): Request => ({
    body,
    method: 'POST',
    headers: {},
    query: {}
} as Request);

const createMockResponse = (): Response => {
    const res = {
        statusCode: 200,
        status: function(code: number) { this.statusCode = code; return this; },
        json: function(data: any) { console.log(`Response ${this.statusCode}:`, data); return this; },
        send: function(data: any) { console.log(`Response ${this.statusCode}:`, data); return this; }
    };
    return res as Response;
};

// Test webhook payload (simulating Strava webhook)
const testWebhookPayload = {
    object_type: 'activity',
    object_id: 12345678,
    aspect_type: 'create',
    owner_id: 4142500, // Replace with a valid pilot ID from your system
    subscription_id: 123456,
    event_time: Math.floor(Date.now() / 1000)
};

async function testWebhookMonitoring() {
    console.log('Testing webhook monitoring functionality...');
    console.log('Test payload:', JSON.stringify(testWebhookPayload, null, 2));
    
    const req = createMockRequest(testWebhookPayload);
    const res = createMockResponse();
    
    try {
        await handleStravaEventSimple(req, res);
        console.log('Webhook test completed successfully!');
    } catch (error) {
        console.error('Webhook test failed:', error);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testWebhookMonitoring().then(() => {
        console.log('Test finished');
        process.exit(0);
    }).catch((error) => {
        console.error('Test failed:', error);
        process.exit(1);
    });
}

export { testWebhookMonitoring };