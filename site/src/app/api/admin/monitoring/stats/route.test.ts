import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { TestDatabaseSetup } from '../../../../../test/setup';
import { Client } from 'ts-postgres';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { withPooledClient } from '@database/client';

// Mock the database client to use our test database
let testClient: Client;
let testContainer: StartedPostgreSqlContainer;

// Mock the withPooledClient function to use our test database
const mockWithPooledClient = async <T>(callback: (client: Client) => Promise<T>): Promise<T> => {
  return await callback(testClient);
};

// Mock the database client module
const mockDatabaseClient = {
  withPooledClient: mockWithPooledClient
};

// Override the import
Object.assign(globalThis, {
  withPooledClient: mockWithPooledClient
});

describe('/api/admin/monitoring/stats', () => {
  beforeAll(async () => {
    const setup = await TestDatabaseSetup.createTestDatabase();
    testClient = setup.client;
    testContainer = setup.container;
  });

  afterAll(async () => {
    await TestDatabaseSetup.cleanup();
  });

  beforeEach(async () => {
    // Clear test data before each test
    await testClient.query('TRUNCATE webhook_events, task_executions RESTART IDENTITY CASCADE');
  });

  describe('Happy Path Tests', () => {
    it('should return monitoring stats for default 24 hour period', async () => {
      // Setup test data
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      await TestDatabaseSetup.insertTestWebhookEvents([
        {
          event_type: 'create',
          object_type: 'activity', 
          object_id: '12345',
          status: 'completed',
          processing_duration_ms: 1500,
          received_at: oneHourAgo,
          processed_at: oneHourAgo
        },
        {
          event_type: 'update', 
          object_type: 'activity',
          object_id: '12346',
          status: 'failed',
          processing_duration_ms: 2000,
          received_at: oneHourAgo,
          error_message: 'Test error'
        },
        {
          event_type: 'create',
          object_type: 'activity',
          object_id: '12347', 
          status: 'pending',
          received_at: oneHourAgo
        }
      ]);

      await TestDatabaseSetup.insertTestTaskExecutions([
        {
          task_name: 'fetchAllActivities',
          status: 'completed',
          execution_duration_ms: 5000,
          started_at: oneHourAgo,
          completed_at: oneHourAgo
        },
        {
          task_name: 'syncSites',
          status: 'failed', 
          execution_duration_ms: 3000,
          started_at: oneHourAgo,
          error_message: 'Sync failed'
        },
        {
          task_name: 'updateDescription',
          status: 'running',
          started_at: oneHourAgo
        }
      ]);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      // Call endpoint
      const response = await GET(request);
      
      // Verify response
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toMatchObject({
        period_hours: 24,
        webhooks: {
          total_events: 3,
          completed_events: 1,
          failed_events: 1,
          pending_events: 1,
          success_rate: expect.closeTo(33.33, 1),
          avg_processing_time_ms: expect.any(Number)
        },
        tasks: {
          total_executions: 3,
          completed_executions: 1,
          failed_executions: 1,
          running_executions: 1,
          pending_executions: 0,
          success_rate: expect.closeTo(33.33, 1),
          avg_execution_time_ms: expect.any(Number)
        }
      });
    });

    it('should return monitoring stats for custom hour period', async () => {
      // Setup test data for 2 hours ago (should be excluded) and 1 hour ago (should be included)
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      
      await TestDatabaseSetup.insertTestWebhookEvents([
        {
          event_type: 'create',
          object_type: 'activity',
          object_id: '12345',
          status: 'completed',
          received_at: oneHourAgo
        },
        {
          event_type: 'create',
          object_type: 'activity', 
          object_id: '12346',
          status: 'completed',
          received_at: twoHoursAgo // Should be excluded
        }
      ]);

      await TestDatabaseSetup.insertTestTaskExecutions([
        {
          task_name: 'fetchAllActivities',
          status: 'completed',
          started_at: oneHourAgo
        },
        {
          task_name: 'syncSites',
          status: 'completed',
          started_at: twoHoursAgo // Should be excluded
        }
      ]);

      // Create request with 1.5 hour period
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats?hours=1.5');
      
      // Call endpoint
      const response = await GET(request);
      
      // Verify response
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toMatchObject({
        period_hours: 1, // Should be rounded down
        webhooks: {
          total_events: 1, // Only recent event
          completed_events: 1,
          failed_events: 0,
          pending_events: 0,
          success_rate: 100
        },
        tasks: {
          total_executions: 1, // Only recent execution
          completed_executions: 1,
          failed_executions: 0,
          running_executions: 0,
          pending_executions: 0,
          success_rate: 100
        }
      });
    });

    it('should return zero stats when no data exists', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toMatchObject({
        period_hours: 24,
        webhooks: {
          total_events: 0,
          completed_events: 0,
          failed_events: 0,
          pending_events: 0,
          success_rate: 0,
          avg_processing_time_ms: 0
        },
        tasks: {
          total_executions: 0,
          completed_executions: 0,
          failed_executions: 0,
          running_executions: 0,
          pending_executions: 0,
          success_rate: 0,
          avg_execution_time_ms: 0
        }
      });
    });

    it('should calculate correct averages for processing times', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      await TestDatabaseSetup.insertTestWebhookEvents([
        {
          event_type: 'create',
          object_type: 'activity',
          object_id: '12345',
          status: 'completed',
          processing_duration_ms: 1000,
          received_at: oneHourAgo
        },
        {
          event_type: 'create',
          object_type: 'activity',
          object_id: '12346', 
          status: 'completed',
          processing_duration_ms: 3000,
          received_at: oneHourAgo
        }
      ]);

      await TestDatabaseSetup.insertTestTaskExecutions([
        {
          task_name: 'fetchAllActivities',
          status: 'completed',
          execution_duration_ms: 2000,
          started_at: oneHourAgo
        },
        {
          task_name: 'syncSites',
          status: 'completed',
          execution_duration_ms: 6000,
          started_at: oneHourAgo
        }
      ]);

      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Average webhook processing time should be (1000 + 3000) / 2 = 2000
      expect(data.webhooks.avg_processing_time_ms).toBe(2000);
      
      // Average task execution time should be (2000 + 6000) / 2 = 4000
      expect(data.tasks.avg_execution_time_ms).toBe(4000);
    });
  });

  describe('Parameter Validation Tests', () => {
    it('should reject invalid hours parameter - non-numeric', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats?hours=invalid');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toMatchObject({
        error: 'Invalid hours parameter'
      });
    });

    it('should reject invalid hours parameter - zero', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats?hours=0');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toMatchObject({
        error: 'Invalid hours parameter'
      });
    });

    it('should reject invalid hours parameter - negative', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats?hours=-5');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toMatchObject({
        error: 'Invalid hours parameter'
      });
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle database connection errors gracefully', async () => {
      // Temporarily close the database connection to simulate error
      await testClient.end();
      
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      
      // Restore connection for other tests
      const setup = await TestDatabaseSetup.createTestDatabase();
      testClient = setup.client;
    });
  });

  describe('Edge Cases', () => {
    it('should handle null processing/execution times correctly', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      await TestDatabaseSetup.insertTestWebhookEvents([
        {
          event_type: 'create',
          object_type: 'activity',
          object_id: '12345',
          status: 'pending', // No processing time for pending
          processing_duration_ms: null,
          received_at: oneHourAgo,
          processed_at: null
        }
      ]);

      await TestDatabaseSetup.insertTestTaskExecutions([
        {
          task_name: 'fetchAllActivities',
          status: 'running', // No execution time for running
          execution_duration_ms: null,
          started_at: oneHourAgo,
          completed_at: null
        }
      ]);

      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Average times should be 0 when all values are null
      expect(data.webhooks.avg_processing_time_ms).toBe(0);
      expect(data.tasks.avg_execution_time_ms).toBe(0);
    });

    it('should handle large hour values correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats?hours=8760'); // 1 year
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.period_hours).toBe(8760);
    });
  });
});