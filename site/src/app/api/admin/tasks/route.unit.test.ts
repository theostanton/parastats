import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock the database client
const mockWithPooledClient = vi.fn();

vi.mock('@database/client', () => ({
  withPooledClient: mockWithPooledClient
}));

describe('/api/admin/tasks - Unit Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Happy Path Tests', () => {
    it('should return task executions with default limit of 50', async () => {
      const mockResult = {
        rows: [
          {
            id: 'uuid-task-1',
            task_name: 'fetchAllActivities',
            triggered_by: 'webhook',
            started_at: new Date('2023-01-01T12:00:00Z'),
            completed_at: new Date('2023-01-01T12:05:00Z'),
            status: 'completed',
            error_message: null,
            execution_duration_ms: 300000,
            pilot_id: 456,
            retry_count: 0
          },
          {
            id: 'uuid-task-2',
            task_name: 'syncSites',
            triggered_by: 'manual',
            started_at: new Date('2023-01-01T11:55:00Z'),
            completed_at: null,
            status: 'running',
            error_message: null,
            execution_duration_ms: null,
            pilot_id: null,
            retry_count: 1
          }
        ]
      };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toHaveLength(2);
      expect(data[0]).toEqual({
        id: 'uuid-task-1',
        task_name: 'fetchAllActivities',
        triggered_by: 'webhook',
        started_at: '2023-01-01T12:00:00.000Z',
        completed_at: '2023-01-01T12:05:00.000Z',
        status: 'completed',
        error_message: null,
        execution_duration_ms: 300000,
        pilot_id: 456,
        retry_count: 0
      });
      expect(data[1]).toEqual({
        id: 'uuid-task-2',
        task_name: 'syncSites',
        triggered_by: 'manual',
        started_at: '2023-01-01T11:55:00.000Z',
        completed_at: null,
        status: 'running',
        error_message: null,
        execution_duration_ms: null,
        pilot_id: null,
        retry_count: 1
      });

      // Verify SQL query was called with default limit
      expect(mockWithPooledClient).toHaveBeenCalledTimes(1);
      const callback = mockWithPooledClient.mock.calls[0][0];
      const mockDb = { query: vi.fn().mockResolvedValue(mockResult) };
      await callback(mockDb);
      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT $1'), [50]);
    });

    it('should return task executions with custom limit', async () => {
      const mockResult = { rows: [] };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=15');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);

      // Verify SQL query was called with custom limit
      const callback = mockWithPooledClient.mock.calls[0][0];
      const mockDb = { query: vi.fn().mockResolvedValue(mockResult) };
      await callback(mockDb);
      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT $1'), [15]);
    });

    it('should return empty array when no task executions exist', async () => {
      const mockResult = { rows: [] };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual([]);
    });

    it('should handle all task execution fields correctly', async () => {
      const mockResult = {
        rows: [{
          id: 'uuid-task-complete',
          task_name: 'updateDescription',
          triggered_by: 'scheduled',
          started_at: new Date('2023-01-01T10:00:00Z'),
          completed_at: new Date('2023-01-01T10:02:30Z'),
          status: 'failed',
          error_message: 'Task failed due to external API timeout',
          execution_duration_ms: 150000,
          pilot_id: 789,
          retry_count: 3
        }]
      };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toHaveLength(1);
      expect(data[0]).toEqual({
        id: 'uuid-task-complete',
        task_name: 'updateDescription',
        triggered_by: 'scheduled',
        started_at: '2023-01-01T10:00:00.000Z',
        completed_at: '2023-01-01T10:02:30.000Z',
        status: 'failed',
        error_message: 'Task failed due to external API timeout',
        execution_duration_ms: 150000,
        pilot_id: 789,
        retry_count: 3
      });
    });

    it('should handle null fields correctly', async () => {
      const mockResult = {
        rows: [{
          id: 'uuid-task-null',
          task_name: 'helloWorld',
          triggered_by: null,
          started_at: new Date('2023-01-01T09:00:00Z'),
          completed_at: null,
          status: 'pending',
          error_message: null,
          execution_duration_ms: null,
          pilot_id: null,
          retry_count: 0
        }]
      };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toHaveLength(1);
      expect(data[0]).toEqual({
        id: 'uuid-task-null',
        task_name: 'helloWorld',
        triggered_by: null,
        started_at: '2023-01-01T09:00:00.000Z',
        completed_at: null,
        status: 'pending',
        error_message: null,
        execution_duration_ms: null,
        pilot_id: null,
        retry_count: 0
      });
    });

    it('should handle different task names correctly', async () => {
      const mockResult = {
        rows: [
          {
            id: 'uuid-1',
            task_name: 'fetchAllActivities',
            triggered_by: 'webhook',
            started_at: new Date('2023-01-01T12:00:00Z'),
            completed_at: new Date('2023-01-01T12:05:00Z'),
            status: 'completed',
            error_message: null,
            execution_duration_ms: 300000,
            pilot_id: 123,
            retry_count: 0
          },
          {
            id: 'uuid-2',
            task_name: 'syncSites',
            triggered_by: 'manual',
            started_at: new Date('2023-01-01T11:55:00Z'),
            completed_at: new Date('2023-01-01T11:57:00Z'),
            status: 'completed',
            error_message: null,
            execution_duration_ms: 120000,
            pilot_id: null,
            retry_count: 0
          },
          {
            id: 'uuid-3',
            task_name: 'updateDescription',
            triggered_by: 'scheduled',
            started_at: new Date('2023-01-01T11:50:00Z'),
            completed_at: new Date('2023-01-01T11:52:00Z'),
            status: 'completed',
            error_message: null,
            execution_duration_ms: 120000,
            pilot_id: 456,
            retry_count: 0
          },
          {
            id: 'uuid-4',
            task_name: 'helloWorld',
            triggered_by: 'manual',
            started_at: new Date('2023-01-01T11:45:00Z'),
            completed_at: new Date('2023-01-01T11:45:01Z'),
            status: 'completed',
            error_message: null,
            execution_duration_ms: 1000,
            pilot_id: null,
            retry_count: 0
          }
        ]
      };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toHaveLength(4);
      
      const taskNames = data.map(task => task.task_name);
      expect(taskNames).toContain('fetchAllActivities');
      expect(taskNames).toContain('syncSites');
      expect(taskNames).toContain('updateDescription');
      expect(taskNames).toContain('helloWorld');
    });
  });

  describe('Parameter Validation Tests', () => {
    it('should reject limit parameter - non-numeric', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=invalid');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({
        error: 'Invalid limit parameter (1-1000)'
      });
      
      expect(mockWithPooledClient).not.toHaveBeenCalled();
    });

    it('should reject limit parameter - zero', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=0');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({
        error: 'Invalid limit parameter (1-1000)'
      });
      
      expect(mockWithPooledClient).not.toHaveBeenCalled();
    });

    it('should reject limit parameter - negative', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=-10');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({
        error: 'Invalid limit parameter (1-1000)'
      });
      
      expect(mockWithPooledClient).not.toHaveBeenCalled();
    });

    it('should reject limit parameter - too large', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=1001');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({
        error: 'Invalid limit parameter (1-1000)'
      });
      
      expect(mockWithPooledClient).not.toHaveBeenCalled();
    });

    it('should accept limit parameter - boundary values', async () => {
      const mockResult = { rows: [] };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

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
    it('should handle database errors gracefully', async () => {
      mockWithPooledClient.mockImplementation(async () => {
        return [null, 'Database connection failed'];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Database connection failed' });
      
      expect(mockWithPooledClient).toHaveBeenCalledTimes(1);
    });

    it('should handle database query exceptions', async () => {
      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockRejectedValue(new Error('Query failed'))
        };
        try {
          await callback(mockDatabase);
        } catch (err) {
          return [null, `Database query failed: ${err}`];
        }
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toContain('Database query failed');
    });

    it('should handle unexpected errors', async () => {
      mockWithPooledClient.mockImplementation(async () => {
        throw new Error('Unexpected error');
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle decimal limit parameter correctly', async () => {
      const mockResult = { rows: [] };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks?limit=7.9');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);

      // Verify SQL query was called with parsed integer
      const callback = mockWithPooledClient.mock.calls[0][0];
      const mockDb = { query: vi.fn().mockResolvedValue(mockResult) };
      await callback(mockDb);
      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT $1'), [7]);
    });

    it('should handle different task statuses correctly', async () => {
      const mockResult = {
        rows: [
          {
            id: 'uuid-pending',
            task_name: 'fetchAllActivities',
            triggered_by: 'webhook',
            started_at: new Date('2023-01-01T12:05:00Z'),
            completed_at: null,
            status: 'pending',
            error_message: null,
            execution_duration_ms: null,
            pilot_id: 123,
            retry_count: 0
          },
          {
            id: 'uuid-running',
            task_name: 'syncSites',
            triggered_by: 'manual',
            started_at: new Date('2023-01-01T12:04:00Z'),
            completed_at: null,
            status: 'running',
            error_message: null,
            execution_duration_ms: null,
            pilot_id: null,
            retry_count: 0
          },
          {
            id: 'uuid-completed',
            task_name: 'updateDescription',
            triggered_by: 'scheduled',
            started_at: new Date('2023-01-01T12:03:00Z'),
            completed_at: new Date('2023-01-01T12:04:00Z'),
            status: 'completed',
            error_message: null,
            execution_duration_ms: 60000,
            pilot_id: 456,
            retry_count: 0
          },
          {
            id: 'uuid-failed',
            task_name: 'helloWorld',
            triggered_by: 'manual',
            started_at: new Date('2023-01-01T12:02:00Z'),
            completed_at: new Date('2023-01-01T12:02:30Z'),
            status: 'failed',
            error_message: 'Test error',
            execution_duration_ms: 30000,
            pilot_id: null,
            retry_count: 2
          },
          {
            id: 'uuid-cancelled',
            task_name: 'fetchAllActivities',
            triggered_by: 'webhook',
            started_at: new Date('2023-01-01T12:01:00Z'),
            completed_at: new Date('2023-01-01T12:01:15Z'),
            status: 'cancelled',
            error_message: 'Task cancelled by user',
            execution_duration_ms: 15000,
            pilot_id: 789,
            retry_count: 0
          }
        ]
      };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toHaveLength(5);
      
      const statuses = data.map(task => task.status);
      expect(statuses).toContain('pending');
      expect(statuses).toContain('running');
      expect(statuses).toContain('completed');
      expect(statuses).toContain('failed');
      expect(statuses).toContain('cancelled');
    });

    it('should ensure correct SQL query structure', async () => {
      const mockResult = { rows: [] };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      await GET(request);

      const callback = mockWithPooledClient.mock.calls[0][0];
      const mockDb = { query: vi.fn().mockResolvedValue(mockResult) };
      await callback(mockDb);
      
      const [query, params] = mockDb.query.mock.calls[0];
      
      // Verify SQL query contains expected elements
      expect(query).toContain('SELECT');
      expect(query).toContain('FROM task_executions');
      expect(query).toContain('ORDER BY started_at DESC');
      expect(query).toContain('LIMIT $1');
      
      // Verify all expected columns are selected
      expect(query).toContain('id');
      expect(query).toContain('task_name');
      expect(query).toContain('triggered_by');
      expect(query).toContain('started_at');
      expect(query).toContain('completed_at');
      expect(query).toContain('status');
      expect(query).toContain('error_message');
      expect(query).toContain('execution_duration_ms');
      expect(query).toContain('pilot_id');
      expect(query).toContain('retry_count');
      
      expect(params).toEqual([50]);
    });
  });

  describe('Response Format Validation', () => {
    it('should ensure proper date formatting to ISO strings', async () => {
      const testStartDate = new Date('2023-06-15T14:30:45.123Z');
      const testCompletedDate = new Date('2023-06-15T14:35:20.456Z');
      
      const mockResult = {
        rows: [{
          id: 'uuid-date-test',
          task_name: 'fetchAllActivities',
          triggered_by: 'webhook',
          started_at: testStartDate,
          completed_at: testCompletedDate,
          status: 'completed',
          error_message: null,
          execution_duration_ms: 300000,
          pilot_id: 123,
          retry_count: 0
        }]
      };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data[0].started_at).toBe('2023-06-15T14:30:45.123Z');
      expect(data[0].completed_at).toBe('2023-06-15T14:35:20.456Z');
      
      // Verify dates are valid ISO strings
      expect(() => new Date(data[0].started_at)).not.toThrow();
      expect(() => new Date(data[0].completed_at!)).not.toThrow();
    });

    it('should handle TaskExecution with null values matching interface', async () => {
      const mockResult = {
        rows: [{
          id: 'uuid-null-interface-test',
          task_name: 'helloWorld',
          triggered_by: null,
          started_at: new Date('2023-01-01T12:00:00Z'),
          completed_at: null,
          status: 'pending',
          error_message: null,
          execution_duration_ms: null,
          pilot_id: null,
          retry_count: 0
        }]
      };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/tasks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
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