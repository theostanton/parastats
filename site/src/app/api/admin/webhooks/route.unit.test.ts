import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

// Mock the database client
const mockWithPooledClient = vi.fn();

vi.mock('@database/client', () => ({
  withPooledClient: mockWithPooledClient
}));

describe('/api/admin/webhooks - Unit Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Happy Path Tests', () => {
    it('should return webhook events with default limit of 50', async () => {
      const mockResult = {
        rows: [
          {
            id: 'uuid-1',
            event_type: 'create',
            object_type: 'activity',
            object_id: 'activity_123',
            pilot_id: 456,
            received_at: new Date('2023-01-01T12:00:00Z'),
            processed_at: new Date('2023-01-01T12:00:05Z'),
            status: 'completed',
            error_message: null,
            processing_duration_ms: 5000,
            retry_count: 0
          },
          {
            id: 'uuid-2',
            event_type: 'update',
            object_type: 'activity',
            object_id: 'activity_124',
            pilot_id: 789,
            received_at: new Date('2023-01-01T11:59:00Z'),
            processed_at: null,
            status: 'pending',
            error_message: null,
            processing_duration_ms: null,
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

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toHaveLength(2);
      expect(data[0]).toEqual({
        id: 'uuid-1',
        event_type: 'create',
        object_type: 'activity',
        object_id: 'activity_123',
        pilot_id: 456,
        received_at: '2023-01-01T12:00:00.000Z',
        processed_at: '2023-01-01T12:00:05.000Z',
        status: 'completed',
        error_message: null,
        processing_duration_ms: 5000,
        retry_count: 0
      });
      expect(data[1]).toEqual({
        id: 'uuid-2',
        event_type: 'update',
        object_type: 'activity',
        object_id: 'activity_124',
        pilot_id: 789,
        received_at: '2023-01-01T11:59:00.000Z',
        processed_at: null,
        status: 'pending',
        error_message: null,
        processing_duration_ms: null,
        retry_count: 1
      });

      // Verify SQL query was called with default limit
      expect(mockWithPooledClient).toHaveBeenCalledTimes(1);
      const callback = mockWithPooledClient.mock.calls[0][0];
      const mockDb = { query: vi.fn().mockResolvedValue(mockResult) };
      await callback(mockDb);
      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT $1'), [50]);
    });

    it('should return webhook events with custom limit', async () => {
      const mockResult = { rows: [] };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=25');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);

      // Verify SQL query was called with custom limit
      const callback = mockWithPooledClient.mock.calls[0][0];
      const mockDb = { query: vi.fn().mockResolvedValue(mockResult) };
      await callback(mockDb);
      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT $1'), [25]);
    });

    it('should return empty array when no webhook events exist', async () => {
      const mockResult = { rows: [] };

      mockWithPooledClient.mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn().mockResolvedValue(mockResult)
        };
        const result = await callback(mockDatabase);
        return [result, null];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toEqual([]);
    });

    it('should handle all webhook event fields correctly', async () => {
      const mockResult = {
        rows: [{
          id: 'uuid-test',
          event_type: 'delete',
          object_type: 'athlete',
          object_id: 'athlete_123',
          pilot_id: 789,
          received_at: new Date('2023-01-01T10:00:00Z'),
          processed_at: new Date('2023-01-01T10:00:10Z'),
          status: 'failed',
          error_message: 'Processing failed due to invalid data',
          processing_duration_ms: 10000,
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

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toHaveLength(1);
      expect(data[0]).toEqual({
        id: 'uuid-test',
        event_type: 'delete',
        object_type: 'athlete',
        object_id: 'athlete_123',
        pilot_id: 789,
        received_at: '2023-01-01T10:00:00.000Z',
        processed_at: '2023-01-01T10:00:10.000Z',
        status: 'failed', 
        error_message: 'Processing failed due to invalid data',
        processing_duration_ms: 10000,
        retry_count: 3
      });
    });

    it('should handle null fields correctly', async () => {
      const mockResult = {
        rows: [{
          id: 'uuid-null-test',
          event_type: 'create',
          object_type: 'activity',
          object_id: 'activity_null_test',
          pilot_id: null,
          received_at: new Date('2023-01-01T09:00:00Z'),
          processed_at: null,
          status: 'pending',
          error_message: null,
          processing_duration_ms: null,
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

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toHaveLength(1);
      expect(data[0]).toEqual({
        id: 'uuid-null-test',
        event_type: 'create',
        object_type: 'activity',
        object_id: 'activity_null_test',
        pilot_id: null,
        received_at: '2023-01-01T09:00:00.000Z',
        processed_at: null,
        status: 'pending',
        error_message: null,
        processing_duration_ms: null,
        retry_count: 0
      });
    });
  });

  describe('Parameter Validation Tests', () => {
    it('should reject limit parameter - non-numeric', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=invalid');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({
        error: 'Invalid limit parameter (1-1000)'
      });
      
      expect(mockWithPooledClient).not.toHaveBeenCalled();
    });

    it('should reject limit parameter - zero', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=0');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({
        error: 'Invalid limit parameter (1-1000)'
      });
      
      expect(mockWithPooledClient).not.toHaveBeenCalled();
    });

    it('should reject limit parameter - negative', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=-5');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({
        error: 'Invalid limit parameter (1-1000)'
      });
      
      expect(mockWithPooledClient).not.toHaveBeenCalled();
    });

    it('should reject limit parameter - too large', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=1001');
      
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
      let request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=1');
      let response = await GET(request);
      expect(response.status).toBe(200);

      // Test maximum valid limit
      request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=1000');
      response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle database errors gracefully', async () => {
      mockWithPooledClient.mockImplementation(async () => {
        return [null, 'Database connection failed'];
      });

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
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

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
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

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
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

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=5.7');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);

      // Verify SQL query was called with parsed integer
      const callback = mockWithPooledClient.mock.calls[0][0];
      const mockDb = { query: vi.fn().mockResolvedValue(mockResult) };
      await callback(mockDb);
      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT $1'), [5]);
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

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
      await GET(request);

      const callback = mockWithPooledClient.mock.calls[0][0];
      const mockDb = { query: vi.fn().mockResolvedValue(mockResult) };
      await callback(mockDb);
      
      const [query, params] = mockDb.query.mock.calls[0];
      
      // Verify SQL query contains expected elements
      expect(query).toContain('SELECT');
      expect(query).toContain('FROM webhook_events');
      expect(query).toContain('ORDER BY received_at DESC');
      expect(query).toContain('LIMIT $1');
      
      // Verify all expected columns are selected
      expect(query).toContain('id');
      expect(query).toContain('event_type');
      expect(query).toContain('object_type');
      expect(query).toContain('object_id');
      expect(query).toContain('pilot_id');
      expect(query).toContain('received_at');
      expect(query).toContain('processed_at');
      expect(query).toContain('status');
      expect(query).toContain('error_message');
      expect(query).toContain('processing_duration_ms');
      expect(query).toContain('retry_count');
      
      expect(params).toEqual([50]);
    });
  });

  describe('Response Format Validation', () => {
    it('should ensure proper date formatting to ISO strings', async () => {
      const testDate = new Date('2023-06-15T14:30:45.123Z');
      const mockResult = {
        rows: [{
          id: 'uuid-date-test',
          event_type: 'create',
          object_type: 'activity',
          object_id: 'activity_date_test',
          pilot_id: 123,
          received_at: testDate,
          processed_at: testDate,
          status: 'completed',
          error_message: null,
          processing_duration_ms: 1000,
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

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data[0].received_at).toBe('2023-06-15T14:30:45.123Z');
      expect(data[0].processed_at).toBe('2023-06-15T14:30:45.123Z');
      
      // Verify dates are valid ISO strings
      expect(() => new Date(data[0].received_at)).not.toThrow();
      expect(() => new Date(data[0].processed_at!)).not.toThrow();
    });
  });
});