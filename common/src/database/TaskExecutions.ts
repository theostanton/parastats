import { Client } from 'ts-postgres';
import { 
    TaskExecutionRow, 
    TaskExecutionStatus, 
    TaskName,
    StravaAthleteId,
    Either,
    success,
    failure
} from '../model';

export class TaskExecutions {
    /**
     * Create a new task execution record
     */
    static async create(
        client: Client,
        execution: {
            task_name: TaskName;
            task_payload: any;
            triggered_by?: string;
            triggered_by_webhook_id?: string;
            pilot_id?: StravaAthleteId | null;
        }
    ): Promise<Either<TaskExecutionRow>> {
        try {
            const query = `
                INSERT INTO task_executions (
                    task_name, task_payload, triggered_by, triggered_by_webhook_id, pilot_id
                ) VALUES ($1, $2::jsonb, $3, $4, $5)
                RETURNING *
            `;

            const result = await client.query(query, [
                execution.task_name,
                JSON.stringify(execution.task_payload),
                execution.triggered_by || null,
                execution.triggered_by_webhook_id || null,
                execution.pilot_id || null
            ]);
            
            return success(result.rows[0].reify() as TaskExecutionRow);
        } catch (error) {
            return failure(`Failed to create task execution: ${error}`);
        }
    }

    /**
     * Update task execution status and completion info
     */
    static async updateStatus(
        client: Client,
        executionId: string,
        update: {
            status: TaskExecutionStatus;
            completed_at?: Date;
            error_message?: string | null;
            execution_duration_ms?: number | null;
        }
    ): Promise<Either<TaskExecutionRow>> {
        try {
            const query = `
                UPDATE task_executions
                SET
                    status = $1,
                    completed_at = COALESCE($2, completed_at),
                    error_message = COALESCE($3, error_message),
                    execution_duration_ms = COALESCE($4, execution_duration_ms)
                WHERE id = $5
                RETURNING *
            `;

            const result = await client.query(query, [
                update.status,
                update.completed_at || null,
                update.error_message || null,
                update.execution_duration_ms || null,
                executionId
            ]);

            if (result.rows.length === 0) {
                return failure(`Task execution not found: ${executionId}`);
            }

            return success(result.rows[0].reify() as TaskExecutionRow);
        } catch (error) {
            return failure(`Failed to update task execution: ${error}`);
        }
    }

    /**
     * Get task execution by ID
     */
    static async get(
        client: Client,
        executionId: string
    ): Promise<Either<TaskExecutionRow>> {
        try {
            const query = `SELECT * FROM task_executions WHERE id = $1`;
            const result = await client.query(query, [executionId]);
            
            if (result.rows.length === 0) {
                return failure(`Task execution not found: ${executionId}`);
            }
            
            return success(result.rows[0].reify() as TaskExecutionRow);
        } catch (error) {
            return failure(`Failed to get task execution: ${error}`);
        }
    }

    /**
     * Get recent task executions with pagination
     */
    static async getRecent(
        client: Client,
        options: {
            limit?: number;
            offset?: number;
            pilot_id?: StravaAthleteId;
            status?: TaskExecutionStatus;
            task_name?: TaskName;
            hours_back?: number;
            triggered_by_webhook_id?: string;
        } = {}
    ): Promise<Either<TaskExecutionRow[]>> {
        try {
            const {
                limit = 50,
                offset = 0,
                pilot_id,
                status,
                task_name,
                hours_back = 24,
                triggered_by_webhook_id
            } = options;

            let query = `
                SELECT * FROM task_executions 
                WHERE started_at > NOW() - INTERVAL '${hours_back} hours'
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

            if (task_name !== undefined) {
                query += ` AND task_name = $${paramIndex}`;
                params.push(task_name);
                paramIndex++;
            }

            if (triggered_by_webhook_id !== undefined) {
                query += ` AND triggered_by_webhook_id = $${paramIndex}`;
                params.push(triggered_by_webhook_id);
                paramIndex++;
            }

            query += ` ORDER BY started_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            const result = await client.query(query, params);
            return success(result.rows.map(r => r.reify()) as TaskExecutionRow[]);
        } catch (error) {
            return failure(`Failed to get recent task executions: ${error}`);
        }
    }

    /**
     * Get task executions that need retry
     */
    static async getPendingRetries(
        client: Client,
        maxRetries: number = 3
    ): Promise<Either<TaskExecutionRow[]>> {
        try {
            const query = `
                SELECT * FROM task_executions 
                WHERE status = 'failed' 
                AND retry_count < $1
                AND (last_retry_at IS NULL OR last_retry_at < NOW() - INTERVAL '5 minutes')
                ORDER BY started_at ASC
                LIMIT 10
            `;

            const result = await client.query(query, [maxRetries]);
            return success(result.rows.map(r => r.reify()) as TaskExecutionRow[]);
        } catch (error) {
            return failure(`Failed to get pending retries: ${error}`);
        }
    }

    /**
     * Increment retry count for a task execution
     */
    static async incrementRetryCount(
        client: Client,
        executionId: string
    ): Promise<Either<TaskExecutionRow>> {
        try {
            const query = `
                UPDATE task_executions 
                SET 
                    retry_count = retry_count + 1,
                    last_retry_at = NOW(),
                    status = 'pending'
                WHERE id = $1
                RETURNING *
            `;

            const result = await client.query(query, [executionId]);
            
            if (result.rows.length === 0) {
                return failure(`Task execution not found: ${executionId}`);
            }
            
            return success(result.rows[0].reify() as TaskExecutionRow);
        } catch (error) {
            return failure(`Failed to increment retry count: ${error}`);
        }
    }

    /**
     * Get task execution statistics
     */
    static async getStats(
        client: Client,
        hoursBack: number = 24
    ): Promise<Either<{
        total_executions: number;
        completed_executions: number;
        failed_executions: number;
        running_executions: number;
        pending_executions: number;
        success_rate: number;
        avg_execution_time_ms: number;
        stats_by_task_name: Array<{
            task_name: string;
            count: number;
            success_rate: number;
            avg_duration_ms: number;
        }>;
    }>> {
        try {
            // Get overall stats
            const overallQuery = `
                SELECT 
                    COUNT(*) as total_executions,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_executions,
                    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions,
                    COUNT(CASE WHEN status = 'running' THEN 1 END) as running_executions,
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_executions,
                    ROUND(
                        COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric / 
                        NULLIF(COUNT(*), 0) * 100, 2
                    ) as success_rate,
                    ROUND(AVG(execution_duration_ms)) as avg_execution_time_ms
                FROM task_executions 
                WHERE started_at > NOW() - INTERVAL '${hoursBack} hours'
            `;

            // Get stats by task name
            const byTaskQuery = `
                SELECT 
                    task_name,
                    COUNT(*) as count,
                    ROUND(
                        COUNT(CASE WHEN status = 'completed' THEN 1 END)::numeric / 
                        NULLIF(COUNT(*), 0) * 100, 2
                    ) as success_rate,
                    ROUND(AVG(execution_duration_ms)) as avg_duration_ms
                FROM task_executions 
                WHERE started_at > NOW() - INTERVAL '${hoursBack} hours'
                GROUP BY task_name
                ORDER BY count DESC
            `;

            const [overallResult, byTaskResult] = await Promise.all([
                client.query(overallQuery),
                client.query(byTaskQuery)
            ]);

            const stats = {
                ...overallResult.rows[0].reify(),
                stats_by_task_name: byTaskResult.rows.map(r => r.reify())
            };

            return success(stats as any);
        } catch (error) {
            return failure(`Failed to get task execution stats: ${error}`);
        }
    }

    /**
     * Get recent monitoring activity (combines webhook events and task executions)
     */
    static async getRecentMonitoringActivity(
        client: Client,
        options: {
            limit?: number;
            hours_back?: number;
            pilot_id?: StravaAthleteId;
        } = {}
    ): Promise<Either<Array<{
        type: 'webhook' | 'task';
        entity_id: string;
        action: string;
        status: string;
        timestamp: Date;
        pilot_id: StravaAthleteId | null;
        error_message: string | null;
        duration_ms: number | null;
    }>>> {
        try {
            const { limit = 100, hours_back = 24, pilot_id } = options;

            let query = `SELECT * FROM recent_monitoring_activity WHERE timestamp > NOW() - INTERVAL '${hours_back} hours'`;
            const params: any[] = [];
            let paramIndex = 1;

            if (pilot_id !== undefined) {
                query += ` AND pilot_id = $${paramIndex}`;
                params.push(pilot_id);
                paramIndex++;
            }

            query += ` ORDER BY timestamp DESC LIMIT $${paramIndex}`;
            params.push(limit);

            const result = await client.query(query, params);
            return success(result.rows.map(r => r.reify()) as any);
        } catch (error) {
            return failure(`Failed to get recent monitoring activity: ${error}`);
        }
    }
}