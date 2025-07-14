-- Apply the monitoring schema to your database
-- Run this script against your PostgreSQL database to add monitoring tables

\echo 'Applying monitoring tables schema...'

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for webhook event status
DO $$ BEGIN
    CREATE TYPE webhook_event_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'ignored');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum for task execution status  
DO $$ BEGIN
    CREATE TYPE task_execution_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum for webhook event types from Strava
DO $$ BEGIN
    CREATE TYPE webhook_event_type AS ENUM ('create', 'update', 'delete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum for webhook object types from Strava
DO $$ BEGIN
    CREATE TYPE webhook_object_type AS ENUM ('activity', 'athlete');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table to track all incoming webhook events
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type webhook_event_type NOT NULL,
    object_type webhook_object_type NOT NULL,
    object_id VARCHAR(255) NOT NULL, -- Strava activity/athlete ID
    pilot_id INTEGER REFERENCES pilots(pilot_id) ON DELETE SET NULL,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    status webhook_event_status NOT NULL DEFAULT 'pending',
    error_message TEXT,
    payload JSONB NOT NULL, -- Full webhook payload from Strava
    processing_duration_ms INTEGER,
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes for common queries
    CONSTRAINT webhook_events_object_id_type_idx UNIQUE (object_id, event_type, received_at)
);

-- Table to track all task executions
CREATE TABLE IF NOT EXISTS task_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_name VARCHAR(100) NOT NULL, -- TaskName from your existing types
    task_payload JSONB NOT NULL,
    triggered_by VARCHAR(255), -- webhook_event_id UUID, 'manual', 'scheduled', etc.
    triggered_by_webhook_id UUID REFERENCES webhook_events(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status task_execution_status NOT NULL DEFAULT 'pending',
    error_message TEXT,
    execution_duration_ms INTEGER,
    pilot_id INTEGER REFERENCES pilots(pilot_id) ON DELETE SET NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhook_events_pilot_id ON webhook_events(pilot_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_received_at ON webhook_events(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_object_id ON webhook_events(object_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);

CREATE INDEX IF NOT EXISTS idx_task_executions_pilot_id ON task_executions(pilot_id);
CREATE INDEX IF NOT EXISTS idx_task_executions_status ON task_executions(status);
CREATE INDEX IF NOT EXISTS idx_task_executions_started_at ON task_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_task_executions_task_name ON task_executions(task_name);
CREATE INDEX IF NOT EXISTS idx_task_executions_triggered_by_webhook_id ON task_executions(triggered_by_webhook_id);

-- View for webhook events with task execution counts
CREATE OR REPLACE VIEW webhook_events_with_tasks AS
SELECT 
    we.*,
    COUNT(te.id) as triggered_tasks_count,
    COUNT(CASE WHEN te.status = 'completed' THEN 1 END) as completed_tasks_count,
    COUNT(CASE WHEN te.status = 'failed' THEN 1 END) as failed_tasks_count
FROM webhook_events we
LEFT JOIN task_executions te ON te.triggered_by_webhook_id = we.id
GROUP BY we.id, we.event_type, we.object_type, we.object_id, we.pilot_id, 
         we.received_at, we.processed_at, we.status, we.error_message, 
         we.payload, we.processing_duration_ms, we.retry_count, we.last_retry_at;

-- View for recent monitoring activity (last 24 hours)
CREATE OR REPLACE VIEW recent_monitoring_activity AS
SELECT 
    'webhook' as type,
    id::text as entity_id,
    event_type::text as action,
    status::text as status,
    received_at as timestamp,
    pilot_id,
    error_message,
    processing_duration_ms as duration_ms
FROM webhook_events 
WHERE received_at > NOW() - INTERVAL '24 hours'

UNION ALL

SELECT 
    'task' as type,
    id::text as entity_id,
    task_name as action,
    status::text as status,
    started_at as timestamp,
    pilot_id,
    error_message,
    execution_duration_ms as duration_ms
FROM task_executions 
WHERE started_at > NOW() - INTERVAL '24 hours'

ORDER BY timestamp DESC;

\echo 'Monitoring tables schema applied successfully!'
\echo 'You can now use webhook_events and task_executions tables for monitoring.'