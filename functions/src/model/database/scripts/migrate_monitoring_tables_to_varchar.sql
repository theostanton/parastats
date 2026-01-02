-- Migration: Convert enum types to VARCHAR with CHECK constraints
-- This fixes ts-postgres compatibility issues with custom enum types

-- Drop existing tables and types
DROP VIEW IF EXISTS recent_monitoring_activity CASCADE;
DROP VIEW IF EXISTS webhook_events_with_tasks CASCADE;
DROP TABLE IF EXISTS task_executions CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;
DROP TYPE IF EXISTS webhook_event_status CASCADE;
DROP TYPE IF EXISTS task_execution_status CASCADE;
DROP TYPE IF EXISTS webhook_event_type CASCADE;
DROP TYPE IF EXISTS webhook_object_type CASCADE;

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table to track all incoming webhook events
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('create', 'update', 'delete')),
    object_type VARCHAR(20) NOT NULL CHECK (object_type IN ('activity', 'athlete')),
    object_id VARCHAR(255) NOT NULL,
    pilot_id INTEGER REFERENCES public.pilots(pilot_id) ON DELETE SET NULL,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'ignored')),
    error_message TEXT,
    payload JSONB NOT NULL,
    processing_duration_ms INTEGER,
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT webhook_events_object_id_type_idx UNIQUE (object_id, event_type, received_at)
);

-- Table to track all task executions
CREATE TABLE task_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_name VARCHAR(100) NOT NULL,
    task_payload JSONB NOT NULL,
    triggered_by VARCHAR(255),
    triggered_by_webhook_id UUID REFERENCES webhook_events(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    execution_duration_ms INTEGER,
    pilot_id INTEGER REFERENCES pilots(pilot_id) ON DELETE SET NULL,
    retry_count INTEGER NOT NULL DEFAULT 0,
    last_retry_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_webhook_events_pilot_id ON webhook_events(pilot_id);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_received_at ON webhook_events(received_at DESC);
CREATE INDEX idx_webhook_events_object_id ON webhook_events(object_id);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);

CREATE INDEX idx_task_executions_pilot_id ON task_executions(pilot_id);
CREATE INDEX idx_task_executions_status ON task_executions(status);
CREATE INDEX idx_task_executions_started_at ON task_executions(started_at DESC);
CREATE INDEX idx_task_executions_task_name ON task_executions(task_name);
CREATE INDEX idx_task_executions_triggered_by_webhook_id ON task_executions(triggered_by_webhook_id);

-- View for webhook events with task execution counts
CREATE VIEW webhook_events_with_tasks AS
SELECT
    we.*,
    COUNT(te.id) as triggered_tasks_count,
    COUNT(CASE WHEN te.status = 'completed' THEN 1 END) as completed_tasks_count,
    COUNT(CASE WHEN te.status = 'failed' THEN 1 END) as failed_tasks_count
FROM webhook_events we
LEFT JOIN task_executions te ON te.triggered_by_webhook_id = we.id
GROUP BY we.id;

-- View for recent monitoring activity (last 24 hours)
CREATE VIEW recent_monitoring_activity AS
SELECT
    'webhook' as type,
    id::text as entity_id,
    event_type as action,
    status,
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
    status,
    started_at as timestamp,
    pilot_id,
    error_message,
    execution_duration_ms as duration_ms
FROM task_executions
WHERE started_at > NOW() - INTERVAL '24 hours'

ORDER BY timestamp DESC;
