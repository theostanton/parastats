import { NextRequest, NextResponse } from 'next/server';
import { withPooledClient } from '@database/client';
import { TaskExecution } from '@model/admin';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 50;

    if (isNaN(limit) || limit <= 0 || limit > 1000) {
      return NextResponse.json({ error: 'Invalid limit parameter (1-1000)' }, { status: 400 });
    }

    const [taskExecutions, error] = await withPooledClient(async (database) => {
      try {
        const query = `
          SELECT 
            id,
            task_name,
            triggered_by,
            started_at,
            completed_at,
            status,
            error_message,
            execution_duration_ms,
            pilot_id,
            retry_count
          FROM task_executions 
          ORDER BY started_at DESC 
          LIMIT $1
        `;

        const result = await database.query(query, [limit]);

        const executions: TaskExecution[] = result.rows.map((row: any) => ({
          id: row.id,
          task_name: row.task_name,
          triggered_by: row.triggered_by,
          started_at: row.started_at.toISOString(),
          completed_at: row.completed_at ? row.completed_at.toISOString() : null,
          status: row.status,
          error_message: row.error_message,
          execution_duration_ms: row.execution_duration_ms,
          pilot_id: row.pilot_id,
          retry_count: row.retry_count
        }));

        return [executions, null];
      } catch (err) {
        return [null, `Database query failed: ${err}`];
      }
    });

    if (error) {
      console.error('Error fetching task executions:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(taskExecutions);
  } catch (error) {
    console.error('Error fetching task executions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}