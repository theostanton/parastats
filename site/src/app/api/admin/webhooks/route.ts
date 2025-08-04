import { NextRequest, NextResponse } from 'next/server';
import { withPooledClient } from '@database/client';
import { WebhookEvent } from '@model/admin';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 50;

    if (isNaN(limit) || limit <= 0 || limit > 1000) {
      return NextResponse.json({ error: 'Invalid limit parameter (1-1000)' }, { status: 400 });
    }

    const [webhookEvents, error] = await withPooledClient(async (database) => {
      try {
        const query = `
          SELECT 
            id,
            event_type,
            object_type,
            object_id,
            pilot_id,
            received_at,
            processed_at,
            status,
            error_message,
            processing_duration_ms,
            retry_count
          FROM webhook_events 
          ORDER BY received_at DESC 
          LIMIT $1
        `;

        const result = await database.query(query, [limit]);

        const events: WebhookEvent[] = result.rows.map((row: any) => ({
          id: row.id,
          event_type: row.event_type,
          object_type: row.object_type,
          object_id: row.object_id,
          pilot_id: row.pilot_id,
          received_at: row.received_at.toISOString(),
          processed_at: row.processed_at ? row.processed_at.toISOString() : null,
          status: row.status,
          error_message: row.error_message,
          processing_duration_ms: row.processing_duration_ms,
          retry_count: row.retry_count
        }));

        return [events, null];
      } catch (err) {
        return [null, `Database query failed: ${err}`];
      }
    });

    if (error) {
      console.error('Error fetching webhook events:', error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(webhookEvents);
  } catch (error) {
    console.error('Error fetching webhook events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}