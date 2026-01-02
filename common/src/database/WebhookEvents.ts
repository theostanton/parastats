import { Client } from 'ts-postgres';
import { 
    WebhookEventRow, 
    WebhookEventWithTasks, 
    WebhookEventStatus, 
    WebhookEventType, 
    WebhookObjectType,
    StravaAthleteId,
    Either,
    success,
    failure
} from '../model';

export class WebhookEvents {
    /**
     * Create a new webhook event record
     */
    static async create(
        client: Client,
        event: {
            event_type: WebhookEventType;
            object_type: WebhookObjectType;
            object_id: string;
            pilot_id: StravaAthleteId | null;
            payload: any;
        }
    ): Promise<Either<WebhookEventRow>> {
        try {
            const query = `
                INSERT INTO webhook_events (
                    event_type, object_type, object_id, pilot_id, payload
                ) VALUES ($1, $2, $3, $4, $5::jsonb)
                RETURNING *
            `;

            const result = await client.query(query, [
                event.event_type,
                event.object_type,
                event.object_id,
                event.pilot_id,
                JSON.stringify(event.payload)
            ]);

            return success(result.rows[0].reify() as WebhookEventRow);
        } catch (error) {
            return failure(`Failed to create webhook event: ${error}`);
        }
    }

    /**
     * Update webhook event status and processing info
     */
    static async updateStatus(
        client: Client,
        eventId: string,
        update: {
            status: WebhookEventStatus;
            processed_at?: Date;
            error_message?: string | null;
            processing_duration_ms?: number | null;
        }
    ): Promise<Either<WebhookEventRow>> {
        try {
            const query = `
                UPDATE webhook_events
                SET
                    status = $1,
                    processed_at = COALESCE($2, processed_at),
                    error_message = COALESCE($3, error_message),
                    processing_duration_ms = COALESCE($4, processing_duration_ms)
                WHERE id = $5
                RETURNING *
            `;

            const result = await client.query(query, [
                update.status,
                update.processed_at || null,
                update.error_message || null,
                update.processing_duration_ms || null,
                eventId
            ]);

            if (result.rows.length === 0) {
                return failure(`Webhook event not found: ${eventId}`);
            }

            return success(result.rows[0].reify() as WebhookEventRow);
        } catch (error) {
            return failure(`Failed to update webhook event: ${error}`);
        }
    }

    /**
     * Get webhook event by ID
     */
    static async get(
        client: Client,
        eventId: string
    ): Promise<Either<WebhookEventRow>> {
        try {
            const query = `SELECT * FROM webhook_events WHERE id = $1`;
            const result = await client.query(query, [eventId]);
            
            if (result.rows.length === 0) {
                return failure(`Webhook event not found: ${eventId}`);
            }
            
            return success(result.rows[0].reify() as WebhookEventRow);
        } catch (error) {
            return failure(`Failed to get webhook event: ${error}`);
        }
    }

    /**
     * Get recent webhook events with pagination
     */
    static async getRecent(
        client: Client,
        options: {
            limit?: number;
            offset?: number;
            pilot_id?: StravaAthleteId;
            status?: WebhookEventStatus;
            event_type?: WebhookEventType;
            hours_back?: number;
        } = {}
    ): Promise<Either<WebhookEventRow[]>> {
        try {
            const {
                limit = 50,
                offset = 0,
                pilot_id,
                status,
                event_type,
                hours_back = 24
            } = options;

            let query = `
                SELECT * FROM webhook_events 
                WHERE received_at > NOW() - INTERVAL '${hours_back} hours'
            `;
            const params: any[] = [];
            let paramIndex = 1;

            if (pilot_id !== undefined) {
                query += ` AND pilot_id = $${paramIndex}`;
                params.push(pilot_id);
                paramIndex++;
            }

            if (status !== undefined) {
                query += ` AND status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }

            if (event_type !== undefined) {
                query += ` AND event_type = $${paramIndex}`;
                params.push(event_type);
                paramIndex++;
            }

            query += ` ORDER BY received_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const result = await client.query(query, params);
            return success(result.rows.map(r => r.reify()) as WebhookEventRow[]);
        } catch (error) {
            return failure(`Failed to get recent webhook events: ${error}`);
        }
    }

    /**
     * Get webhook events with task execution counts
     */
    static async getWithTasks(
        client: Client,
        options: {
            limit?: number;
            offset?: number;
            hours_back?: number;
        } = {}
    ): Promise<Either<WebhookEventWithTasks[]>> {
        try {
            const { limit = 50, offset = 0, hours_back = 24 } = options;

            const query = `
                SELECT * FROM webhook_events_with_tasks 
                WHERE received_at > NOW() - INTERVAL '${hours_back} hours'
                ORDER BY received_at DESC 
                LIMIT $1 OFFSET $2
            `;

            const result = await client.query(query, [limit, offset]);
            return success(result.rows.map(r => r.reify()) as WebhookEventWithTasks[]);
        } catch (error) {
            return failure(`Failed to get webhook events with tasks: ${error}`);
        }
    }

    /**
     * Get events that need retry (failed status, retry_count < max_retries)
     */
    static async getPendingRetries(
        client: Client,
        maxRetries: number = 3
    ): Promise<Either<WebhookEventRow[]>> {
        try {
            const query = `
                SELECT * FROM webhook_events 
                WHERE status = 'failed' 
                AND retry_count < $1
                AND (last_retry_at IS NULL OR last_retry_at < NOW() - INTERVAL '5 minutes')
                ORDER BY received_at ASC
                LIMIT 10
            `;

            const result = await client.query(query, [maxRetries]);
            return success(result.rows.map(r => r.reify()) as WebhookEventRow[]);
        } catch (error) {
            return failure(`Failed to get pending retries: ${error}`);
        }
    }

    /**
     * Increment retry count for an event
     */
    static async incrementRetryCount(
        client: Client,
        eventId: string
    ): Promise<Either<WebhookEventRow>> {
        try {
            const query = `
                UPDATE webhook_events 
                SET 
                    retry_count = retry_count + 1,
                    last_retry_at = NOW(),
                    status = 'pending'
                WHERE id = $1
                RETURNING *
            `;

            const result = await client.query(query, [eventId]);
            
            if (result.rows.length === 0) {
                return failure(`Webhook event not found: ${eventId}`);
            }
            
            return success(result.rows[0].reify() as WebhookEventRow);
        } catch (error) {
            return failure(`Failed to increment retry count: ${error}`);
        }
    }

    /**
     * Get webhook event statistics
     */
    static async getStats(
        client: Client,
        hoursBack: number = 24
    ): Promise<Either<{
        total_events: number;
        completed_events: number;
        failed_events: number;
        pending_events: number;
        success_rate: number;
        avg_processing_time_ms: number;
    }>> {
        try {
            const query = `
                SELECT 
                    COUNT(*) as total_events,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_events,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_events,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_events,
                    ROUND(
                        COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric / 
                        NULLIF(COUNT(*), 0) * 100, 2
                    ) as success_rate,
                    ROUND(AVG(processing_duration_ms)) as avg_processing_time_ms
                FROM webhook_events 
                WHERE received_at > NOW() - INTERVAL '${hoursBack} hours'
            `;

            const result = await client.query(query);
            return success(result.rows[0].reify() as any);
        } catch (error) {
            return failure(`Failed to get webhook stats: ${error}`);
        }
    }
}