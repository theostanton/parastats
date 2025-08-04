import { NextRequest, NextResponse } from 'next/server';
import { withPooledClient } from '@database/client';
import { MonitoringStats } from '@model/admin';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const hoursParam = url.searchParams.get('hours');
    const periodHours = hoursParam ? parseInt(hoursParam) : 24;

    if (isNaN(periodHours) || periodHours <= 0) {
      return NextResponse.json({ error: 'Invalid hours parameter' }, { status: 400 });
    }

    const [stats, error] = await withPooledClient(async (database) => {
      try {
        // Get webhook statistics
        const webhookQuery = `
          SELECT 
            COUNT(*) as total_events,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_events,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_events,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_events,
            AVG(CASE WHEN processing_duration_ms IS NOT NULL THEN processing_duration_ms END) as avg_processing_time_ms
          FROM webhook_events 
          WHERE received_at > NOW() - INTERVAL '${periodHours} hours'
        `;

        // Get task statistics
        const taskQuery = `
          SELECT 
            COUNT(*) as total_executions,
            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_executions,
            COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions,
            COUNT(CASE WHEN status = 'running' THEN 1 END) as running_executions,
            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_executions,
            AVG(CASE WHEN execution_duration_ms IS NOT NULL THEN execution_duration_ms END) as avg_execution_time_ms
          FROM task_executions 
          WHERE started_at > NOW() - INTERVAL '${periodHours} hours'
        `;

        const [webhookResult, taskResult] = await Promise.all([
          database.query(webhookQuery),
          database.query(taskQuery)
        ]);

        const webhookRow = webhookResult.rows[0] as any;
        const taskRow = taskResult.rows[0] as any;

        const stats: MonitoringStats = {
          period_hours: periodHours,
          webhooks: {
            total_events: parseInt(webhookRow.total_events) || 0,
            completed_events: parseInt(webhookRow.completed_events) || 0,
            failed_events: parseInt(webhookRow.failed_events) || 0,
            pending_events: parseInt(webhookRow.pending_events) || 0,
            success_rate: webhookRow.total_events > 0 
              ? (parseInt(webhookRow.completed_events) || 0) / parseInt(webhookRow.total_events) * 100
              : 0,
            avg_processing_time_ms: Math.round(parseFloat(webhookRow.avg_processing_time_ms) || 0)
          },
          tasks: {
            total_executions: parseInt(taskRow.total_executions) || 0,
            completed_executions: parseInt(taskRow.completed_executions) || 0,
            failed_executions: parseInt(taskRow.failed_executions) || 0,
            running_executions: parseInt(taskRow.running_executions) || 0,
            pending_executions: parseInt(taskRow.pending_executions) || 0,
            success_rate: taskRow.total_executions > 0 
              ? (parseInt(taskRow.completed_executions) || 0) / parseInt(taskRow.total_executions) * 100
              : 0,
            avg_execution_time_ms: Math.round(parseFloat(taskRow.avg_execution_time_ms) || 0)
          }
        };

        return [stats, null];
      } catch (err) {
        return [null, `Database query failed: ${err}`];
      }
    });

    if (error) {
      console.error('Error fetching monitoring stats:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching monitoring stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}