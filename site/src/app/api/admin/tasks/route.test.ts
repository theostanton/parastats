import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { TestDatabaseSetup } from '../../../../test/setup';
import { Client } from 'ts-postgres';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { TaskExecution } from '@model/admin';

// Mock the database client to use our test database
let testClient: Client;
let testContainer: StartedPostgreSqlContainer;

// Mock the withPooledClient function to use our test database
const mockWithPooledClient = async <T>(callback: (client: Client) => Promise<T>): Promise<T> => {
  return await callback(testClient);
};

// Override the import
Object.assign(globalThis, {
  withPooledClient: mockWithPooledClient
});

describe('/api/admin/tasks', () => {
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
    await testClient.query('TRUNCATE task_executions RESTART IDENTITY CASCADE');
  });

  describe('Happy Path Tests', () => {
    it('should return task executions with default limit of 50', async () => {
      // Setup test data
      const now = new Date();
      const testTasks = Array.from({ length: 60 }, (_, i) => ({
        task_name: i % 4 === 0 ? 'fetchAllActivities' : 
                   i % 4 === 1 ? 'syncSites' : 
                   i % 4 === 2 ? 'updateDescription' : 'helloWorld',
        triggered_by: i % 3 === 0 ? 'webhook' : i % 3 === 1 ? 'manual' : 'scheduled',
        pilot_id: i % 2 === 0 ? 123 : 456,
        status: i % 4 === 0 ? 'completed' : 
                i % 4 === 1 ? 'failed' : 
                i % 4 === 2 ? 'running' : 'pending',
        execution_duration_ms: i % 4 === 0 ? i * 100 : null,
        started_at: new Date(now.getTime() - i * 60000), // Each task 1 minute apart
        completed_at: i % 4 === 0 ? new Date(now.getTime() - i * 60000 + 5000) : null,
        error_message: i % 4 === 1 ? `Error ${i}` : null,
        retry_count: Math.floor(i / 10)
      }));

      await TestDatabaseSetup.insertTestTaskExecutions(testTasks);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      // Call endpoint
      const response = await GET(request);
      
      // Verify response
      expect(response.status).toBe(200);
      
      const data: TaskExecution[] = await response.json();
      
      // Should return exactly 50 tasks (default limit)
      expect(data).toHaveLength(50);
      
      // Should be ordered by started_at DESC (most recent first)
      expect(new Date(data[0].started_at).getTime()).toBeGreaterThan(
        new Date(data[1].started_at).getTime()
      );
      
      // Verify structure of first task
      const firstTask = data[0];
      expect(firstTask).toMatchObject({
        id: expect.any(String),
        task_name: 'fetchAllActivities',
        triggered_by: 'webhook',
        started_at: expect.any(String),
        completed_at: expect.any(String),
        status: 'completed',
        error_message: null,
        execution_duration_ms: 0,
        pilot_id: 123,
        retry_count: 0
      });
      
      // Verify ISO string format for dates
      expect(() => new Date(firstTask.started_at)).not.toThrow();
      if (firstTask.completed_at) {
        expect(() => new Date(firstTask.completed_at)).not.toThrow();
      }
    });

    it('should return task executions with custom limit', async () => {
      // Setup test data
      const testTasks = Array.from({ length: 30 }, (_, i) => ({
        task_name: 'fetchAllActivities',
        status: 'completed',
        started_at: new Date(Date.now() - i * 60000)
      }));

      await TestDatabaseSetup.insertTestTaskExecutions(testTasks);

      // Create request with custom limit
      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=15');
      
      // Call endpoint
      const response = await GET(request);
      
      // Verify response
      expect(response.status).toBe(200);
      
      const data: TaskExecution[] = await response.json();
      
      // Should return exactly 15 tasks
      expect(data).toHaveLength(15);
    });

    it('should return empty array when no task executions exist', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: TaskExecution[] = await response.json();
      expect(data).toEqual([]);
    });

    it('should handle all task execution fields correctly', async () => {
      const now = new Date();
      const testTask = {
        task_name: 'updateDescription',
        triggered_by: 'manual',
        pilot_id: 789,
        status: 'failed',
        execution_duration_ms: 15000,
        started_at: now,
        completed_at: new Date(now.getTime() + 15000),
        error_message: 'Task failed due to external API timeout',
        retry_count: 5
      };

      await TestDatabaseSetup.insertTestTaskExecutions([testTask]);

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: TaskExecution[] = await response.json();
      
      expect(data).toHaveLength(1);
      expect(data[0]).toMatchObject({
        id: expect.any(String),
        task_name: 'updateDescription',
        triggered_by: 'manual',
        started_at: now.toISOString(),
        completed_at: new Date(now.getTime() + 15000).toISOString(),
        status: 'failed',
        error_message: 'Task failed due to external API timeout',
        execution_duration_ms: 15000,
        pilot_id: 789,
        retry_count: 5
      });
    });

    it('should handle null fields correctly', async () => {
      const testTask = {
        task_name: 'helloWorld',
        triggered_by: null,
        pilot_id: null,
        status: 'running',
        execution_duration_ms: null,
        started_at: new Date(),
        completed_at: null,
        error_message: null,
        retry_count: 0
      };

      await TestDatabaseSetup.insertTestTaskExecutions([testTask]);

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: TaskExecution[] = await response.json();
      
      expect(data).toHaveLength(1);
      expect(data[0]).toMatchObject({
        id: expect.any(String),
        task_name: 'helloWorld',
        triggered_by: null,
        started_at: expect.any(String),
        completed_at: null,
        status: 'running',
        error_message: null,
        execution_duration_ms: null,
        pilot_id: null,
        retry_count: 0
      });
    });

    it('should handle different task names correctly', async () => {
      const taskNames = ['fetchAllActivities', 'syncSites', 'updateDescription', 'helloWorld'];
      const testTasks = taskNames.map((taskName, i) => ({
        task_name: taskName,
        status: 'completed',
        started_at: new Date(Date.now() - i * 60000)
      }));

      await TestDatabaseSetup.insertTestTaskExecutions(testTasks);

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: TaskExecution[] = await response.json();
      
      expect(data).toHaveLength(4);
      
      // Verify all task names are present (ordered by most recent first)
      const returnedTaskNames = data.map(task => task.task_name);
      expect(returnedTaskNames).toContain('fetchAllActivities');
      expect(returnedTaskNames).toContain('syncSites');
      expect(returnedTaskNames).toContain('updateDescription');
      expect(returnedTaskNames).toContain('helloWorld');
    });
  });

  describe('Parameter Validation Tests', () => {
    it('should reject limit parameter - non-numeric', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=invalid');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toMatchObject({
        error: 'Invalid limit parameter (1-1000)'
      });
    });

    it('should reject limit parameter - zero', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=0');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toMatchObject({
        error: 'Invalid limit parameter (1-1000)'
      });
    });

    it('should reject limit parameter - negative', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=-10');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toMatchObject({
        error: 'Invalid limit parameter (1-1000)'
      });
    });

    it('should reject limit parameter - too large', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=1001');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toMatchObject({
        error: 'Invalid limit parameter (1-1000)'
      });
    });

    it('should accept limit parameter - boundary values', async () => {
      // Test minimum valid limit
      let request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=1');
      let response = await GET(request);
      expect(response.status).toBe(200);

      // Test maximum valid limit
      request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=1000');
      response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle database connection errors gracefully', async () => {
      // Temporarily close the database connection to simulate error
      await testClient.end();
      
      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
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
    it('should handle limit greater than available records', async () => {
      // Setup only 3 records but ask for 100
      const testTasks = Array.from({ length: 3 }, (_, i) => ({
        task_name: 'fetchAllActivities',
        status: 'completed',
        started_at: new Date(Date.now() - i * 60000)
      }));

      await TestDatabaseSetup.insertTestTaskExecutions(testTasks);

      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=100');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: TaskExecution[] = await response.json();
      
      // Should return only 3 tasks
      expect(data).toHaveLength(3);
    });

    it('should maintain correct order even with same timestamps', async () => {
      const sameTime = new Date();
      
      const testTasks = Array.from({ length: 3 }, (_, i) => ({
        task_name: `task_${i}`,
        status: 'completed',
        started_at: sameTime
      }));

      await TestDatabaseSetup.insertTestTaskExecutions(testTasks);

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: TaskExecution[] = await response.json();
      
      expect(data).toHaveLength(3);
      // All should have the same timestamp
      expect(data.every(task => task.started_at === sameTime.toISOString())).toBe(true);
    });

    it('should handle decimal limit parameter correctly', async () => {
      const testTasks = Array.from({ length: 10 }, (_, i) => ({
        task_name: 'fetchAllActivities',
        status: 'completed',
        started_at: new Date(Date.now() - i * 60000)
      }));

      await TestDatabaseSetup.insertTestTaskExecutions(testTasks);

      // Test with decimal value (should be parsed to integer)
      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=7.9');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: TaskExecution[] = await response.json();
      
      // Should return 7 tasks (parsed as integer)
      expect(data).toHaveLength(7);
    });

    it('should handle different task statuses correctly', async () => {
      const statuses = ['pending', 'running', 'completed', 'failed', 'cancelled'];
      const testTasks = statuses.map((status, i) => ({
        task_name: 'fetchAllActivities',
        status: status,
        started_at: new Date(Date.now() - i * 60000)
      }));

      await TestDatabaseSetup.insertTestTaskExecutions(testTasks);

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: TaskExecution[] = await response.json();
      
      expect(data).toHaveLength(5);
      
      // Verify all statuses are present
      const returnedStatuses = data.map(task => task.status);
      expect(returnedStatuses).toContain('pending');
      expect(returnedStatuses).toContain('running');
      expect(returnedStatuses).toContain('completed');
      expect(returnedStatuses).toContain('failed');
      expect(returnedStatuses).toContain('cancelled');
    });
  });

  describe('Response Format Validation', () => {
    it('should match TaskExecution interface exactly', async () => {
      const testTask = {
        task_name: 'syncSites',
        triggered_by: 'scheduled',
        pilot_id: 456,
        status: 'completed',
        execution_duration_ms: 3500,
        started_at: new Date(),
        completed_at: new Date(),
        error_message: null,
        retry_count: 1
      };

      await TestDatabaseSetup.insertTestTaskExecutions([testTask]);

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: TaskExecution[] = await response.json();
      
      expect(data).toHaveLength(1);
      
      const task = data[0];
      
      // Verify all required fields are present with correct types
      expect(typeof task.id).toBe('string');
      expect(typeof task.task_name).toBe('string');
      expect(typeof task.triggered_by).toBe('string');
      expect(typeof task.started_at).toBe('string');
      expect(typeof task.completed_at).toBe('string');
      expect(typeof task.status).toBe('string');
      expect(task.error_message).toBe(null);
      expect(typeof task.execution_duration_ms).toBe('number');
      expect(typeof task.pilot_id).toBe('number');
      expect(typeof task.retry_count).toBe('number');
      
      // Verify no extra fields
      const expectedFields = [
        'id', 'task_name', 'triggered_by', 'started_at', 'completed_at',
        'status', 'error_message', 'execution_duration_ms', 'pilot_id', 'retry_count'
      ];
      
      expect(Object.keys(task)).toEqual(expect.arrayContaining(expectedFields));
      expect(Object.keys(task)).toHaveLength(expectedFields.length);
    });

    it('should handle TaskExecution with null values matching interface', async () => {
      const testTask = {
        task_name: 'helloWorld',
        triggered_by: null,
        pilot_id: null,
        status: 'pending',
        execution_duration_ms: null,
        started_at: new Date(),
        completed_at: null,
        error_message: null,
        retry_count: 0
      };

      await TestDatabaseSetup.insertTestTaskExecutions([testTask]);

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: TaskExecution[] = await response.json();
      
      expect(data).toHaveLength(1);
      
      const task = data[0];
      
      // Verify null values match interface expectations
      expect(task.triggered_by).toBe(null);
      expect(task.pilot_id).toBe(null);
      expect(task.completed_at).toBe(null);
      expect(task.error_message).toBe(null);
      expect(task.execution_duration_ms).toBe(null);
      
      // Verify non-null fields have correct types
      expect(typeof task.id).toBe('string');
      expect(typeof task.task_name).toBe('string');
      expect(typeof task.started_at).toBe('string');
      expect(typeof task.status).toBe('string');
      expect(typeof task.retry_count).toBe('number');
    });
  });
});