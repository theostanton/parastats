import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the database client
vi.mock('@database/client', () => ({
  withPooledClient: vi.fn()
}));

describe('/api/admin/monitoring/stats - Unit Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Happy Path Tests', () => {
    it('should return monitoring stats with default 24 hour period', async () => {
      // Mock database responses
      const mockWebhookResult = {
        rows: [{
          total_events: '5',
          completed_events: '3',
          failed_events: '1',
          pending_events: '1',
          avg_processing_time_ms: '1500.5'
        }]
      };

      const mockTaskResult = {
        rows: [{
          total_executions: '10',
          completed_executions: '7',
          failed_executions: '2',
          running_executions: '1',
          pending_executions: '0',
          avg_execution_time_ms: '3000.75'
        }]
      };

      const { withPooledClient } = await import('@database/client');
      vi.mocked(withPooledClient).mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn()
            .mockResolvedValueOnce(mockWebhookResult)
            .mockResolvedValueOnce(mockTaskResult)
        };
        return await callback(mockDatabase);
      });

      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toEqual({
        period_hours: 24,
        webhooks: {
          total_events: 5,
          completed_events: 3,
          failed_events: 1,
          pending_events: 1,
          success_rate: 60,
          avg_processing_time_ms: 1501
        },
        tasks: {
          total_executions: 10,
          completed_executions: 7,
          failed_executions: 2,
          running_executions: 1,
          pending_executions: 0,
          success_rate: 70,
          avg_execution_time_ms: 3001
        }
      });

      expect(vi.mocked(withPooledClient)).toHaveBeenCalledTimes(1);
    });

    it('should return monitoring stats with custom hour period', async () => {
      const mockWebhookResult = { rows: [{ total_events: '2', completed_events: '2', failed_events: '0', pending_events: '0', avg_processing_time_ms: '1000' }] };
      const mockTaskResult = { rows: [{ total_executions: '3', completed_executions: '3', failed_executions: '0', running_executions: '0', pending_executions: '0', avg_execution_time_ms: '2000' }] };

      const { withPooledClient } = await import('@database/client');
      vi.mocked(withPooledClient).mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn()
            .mockResolvedValueOnce(mockWebhookResult)
            .mockResolvedValueOnce(mockTaskResult)
        };
        return await callback(mockDatabase);
      });

      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats?hours=12');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toEqual({
        period_hours: 12,
        webhooks: {
          total_events: 2,
          completed_events: 2,
          failed_events: 0,
          pending_events: 0,
          success_rate: 100,
          avg_processing_time_ms: 1000
        },
        tasks: {
          total_executions: 3,
          completed_executions: 3,
          failed_executions: 0,
          running_executions: 0,
          pending_executions: 0,
          success_rate: 100,
          avg_execution_time_ms: 2000
        }
      });
    });

    it('should return zero stats when no data exists', async () => {
      const mockEmptyResult = { rows: [{ total_events: '0', completed_events: '0', failed_events: '0', pending_events: '0', avg_processing_time_ms: null }] };
      const mockEmptyTaskResult = { rows: [{ total_executions: '0', completed_executions: '0', failed_executions: '0', running_executions: '0', pending_executions: '0', avg_execution_time_ms: null }] };

      const { withPooledClient } = await import('@database/client');
      vi.mocked(withPooledClient).mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn()
            .mockResolvedValueOnce(mockEmptyResult)
            .mockResolvedValueOnce(mockEmptyTaskResult)
        };
        return await callback(mockDatabase);
      });

      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toEqual({
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

    it('should calculate correct success rates', async () => {
      const mockWebhookResult = { rows: [{ total_events: '4', completed_events: '3', failed_events: '1', pending_events: '0', avg_processing_time_ms: '1500' }] };
      const mockTaskResult = { rows: [{ total_executions: '8', completed_executions: '6', failed_executions: '2', running_executions: '0', pending_executions: '0', avg_execution_time_ms: '2500' }] };

      const { withPooledClient } = await import('@database/client');
      vi.mocked(withPooledClient).mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn()
            .mockResolvedValueOnce(mockWebhookResult)  
            .mockResolvedValueOnce(mockTaskResult)
        };
        return await callback(mockDatabase);
      });

      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // 3/4 = 75% for webhooks, 6/8 = 75% for tasks
      expect(data.webhooks.success_rate).toBe(75);
      expect(data.tasks.success_rate).toBe(75);
    });
  });

  describe('Parameter Validation Tests', () => {
    it('should reject invalid hours parameter - non-numeric', async () => {
      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats?hours=invalid');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Invalid hours parameter' });
      
      const { withPooledClient } = await import('@database/client');
      expect(vi.mocked(withPooledClient)).not.toHaveBeenCalled();
    });

    it('should reject invalid hours parameter - zero', async () => {
      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats?hours=0');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Invalid hours parameter' });
      
      const { withPooledClient } = await import('@database/client');
      expect(vi.mocked(withPooledClient)).not.toHaveBeenCalled();
    });

    it('should reject invalid hours parameter - negative', async () => {
      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats?hours=-5');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Invalid hours parameter' });
      
      const { withPooledClient } = await import('@database/client');
      expect(vi.mocked(withPooledClient)).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle database errors gracefully', async () => {
      const { withPooledClient } = await import('@database/client');
      vi.mocked(withPooledClient).mockImplementation(async () => {
        return [null, 'Database connection failed'];
      });

      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Database connection failed' });
      
      expect(vi.mocked(withPooledClient)).toHaveBeenCalledTimes(1);
    });

    it('should handle database query exceptions', async () => {
      const { withPooledClient } = await import('@database/client');
      vi.mocked(withPooledClient).mockImplementation(async () => {
        return [null, 'Database query failed: Connection timeout'];
      });

      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Database query failed: Connection timeout' });
    });

    it('should handle unexpected errors', async () => {
      const { withPooledClient } = await import('@database/client');
      vi.mocked(withPooledClient).mockImplementation(async () => {
        throw new Error('Unexpected error');
      });

      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null average processing times', async () => {
      const mockWebhookResult = { rows: [{ total_events: '2', completed_events: '2', failed_events: '0', pending_events: '0', avg_processing_time_ms: null }] };
      const mockTaskResult = { rows: [{ total_executions: '3', completed_executions: '3', failed_executions: '0', running_executions: '0', pending_executions: '0', avg_execution_time_ms: null }] };

      const { withPooledClient } = await import('@database/client');
      vi.mocked(withPooledClient).mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn()
            .mockResolvedValueOnce(mockWebhookResult)
            .mockResolvedValueOnce(mockTaskResult)
        };
        return await callback(mockDatabase);
      });

      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data.webhooks.avg_processing_time_ms).toBe(0);
      expect(data.tasks.avg_execution_time_ms).toBe(0);
    });

    it('should handle large hour values', async () => {
      const mockWebhookResult = { rows: [{ total_events: '1', completed_events: '1', failed_events: '0', pending_events: '0', avg_processing_time_ms: '1000' }] };
      const mockTaskResult = { rows: [{ total_executions: '1', completed_executions: '1', failed_executions: '0', running_executions: '0', pending_executions: '0', avg_execution_time_ms: '2000' }] };

      const { withPooledClient } = await import('@database/client');
      vi.mocked(withPooledClient).mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn()
            .mockResolvedValueOnce(mockWebhookResult)
            .mockResolvedValueOnce(mockTaskResult)
        };
        return await callback(mockDatabase);
      });

      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats?hours=8760'); // 1 year
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.period_hours).toBe(8760);
    });

    it('should round average processing times correctly', async () => {
      const mockWebhookResult = { rows: [{ total_events: '2', completed_events: '2', failed_events: '0', pending_events: '0', avg_processing_time_ms: '1500.7' }] };
      const mockTaskResult = { rows: [{ total_executions: '2', completed_executions: '2', failed_executions: '0', running_executions: '0', pending_executions: '0', avg_execution_time_ms: '2500.3' }] };

      const { withPooledClient } = await import('@database/client');
      vi.mocked(withPooledClient).mockImplementation(async (callback) => {
        const mockDatabase = {
          query: vi.fn()
            .mockResolvedValueOnce(mockWebhookResult)
            .mockResolvedValueOnce(mockTaskResult)
        };
        return await callback(mockDatabase);
      });

      const { GET } = await import('./route');
      const request = new NextRequest('http://localhost:3000/api/admin/monitoring/stats');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Should be rounded to nearest integer
      expect(data.webhooks.avg_processing_time_ms).toBe(1501);
      expect(data.tasks.avg_execution_time_ms).toBe(2500);
    });
  });
});