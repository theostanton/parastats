import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { TestDatabaseSetup } from '../../../../test/setup';
import { Client } from 'ts-postgres';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { WebhookEvent } from '@model/admin';

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

describe('/api/admin/webhooks', () => {
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
    await testClient.query('TRUNCATE webhook_events RESTART IDENTITY CASCADE');
  });

  describe('Happy Path Tests', () => {
    it('should return webhook events with default limit of 50', async () => {
      // Setup test data
      const now = new Date();
      const testEvents = Array.from({ length: 60 }, (_, i) => ({
        event_type: 'create',
        object_type: 'activity',
        object_id: `activity_${i}`,
        pilot_id: i % 2 === 0 ? 123 : 456,
        status: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'failed' : 'pending',
        processing_duration_ms: i * 100,
        received_at: new Date(now.getTime() - i * 60000), // Each event 1 minute apart
        processed_at: i % 3 !== 2 ? new Date(now.getTime() - i * 60000 + 5000) : null,
        error_message: i % 3 === 1 ? `Error ${i}` : null,
        retry_count: Math.floor(i / 10)
      }));

      await TestDatabaseSetup.insertTestWebhookEvents(testEvents);

      // Create request
      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
      // Call endpoint
      const response = await GET(request);
      
      // Verify response
      expect(response.status).toBe(200);
      
      const data: WebhookEvent[] = await response.json();
      
      // Should return exactly 50 events (default limit)
      expect(data).toHaveLength(50);
      
      // Should be ordered by received_at DESC (most recent first)
      expect(new Date(data[0].received_at).getTime()).toBeGreaterThan(
        new Date(data[1].received_at).getTime()
      );
      
      // Verify structure of first event
      const firstEvent = data[0];
      expect(firstEvent).toMatchObject({
        id: expect.any(String),
        event_type: 'create',
        object_type: 'activity',
        object_id: 'activity_0',
        pilot_id: 123,
        received_at: expect.any(String),
        processed_at: expect.any(String),
        status: 'completed',
        error_message: null,
        processing_duration_ms: 0,
        retry_count: 0
      });
      
      // Verify ISO string format for dates
      expect(() => new Date(firstEvent.received_at)).not.toThrow();
      if (firstEvent.processed_at) {
        expect(() => new Date(firstEvent.processed_at)).not.toThrow();
      }
    });

    it('should return webhook events with custom limit', async () => {
      // Setup test data
      const testEvents = Array.from({ length: 30 }, (_, i) => ({
        event_type: 'update',
        object_type: 'activity',
        object_id: `activity_${i}`,
        status: 'completed',
        received_at: new Date(Date.now() - i * 60000)
      }));

      await TestDatabaseSetup.insertTestWebhookEvents(testEvents);

      // Create request with custom limit
      const request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=10');
      
      // Call endpoint
      const response = await GET(request);
      
      // Verify response
      expect(response.status).toBe(200);
      
      const data: WebhookEvent[] = await response.json();
      
      // Should return exactly 10 events
      expect(data).toHaveLength(10);
    });

    it('should return empty array when no webhook events exist', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: WebhookEvent[] = await response.json();
      expect(data).toEqual([]);
    });

    it('should handle all webhook event fields correctly', async () => {
      const now = new Date();
      const testEvent = {
        event_type: 'delete',
        object_type: 'athlete',
        object_id: 'athlete_123',
        pilot_id: 789,
        status: 'failed',
        processing_duration_ms: 2500,
        received_at: now,
        processed_at: new Date(now.getTime() + 5000),
        error_message: 'Processing failed due to invalid data',
        retry_count: 3
      };

      await TestDatabaseSetup.insertTestWebhookEvents([testEvent]);

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: WebhookEvent[] = await response.json();
      
      expect(data).toHaveLength(1);
      expect(data[0]).toMatchObject({
        id: expect.any(String),
        event_type: 'delete',
        object_type: 'athlete',
        object_id: 'athlete_123',
        pilot_id: 789,
        received_at: now.toISOString(),
        processed_at: new Date(now.getTime() + 5000).toISOString(),
        status: 'failed',
        error_message: 'Processing failed due to invalid data',
        processing_duration_ms: 2500,
        retry_count: 3
      });
    });

    it('should handle null fields correctly', async () => {
      const testEvent = {
        event_type: 'create',
        object_type: 'activity',
        object_id: 'activity_null_test',
        pilot_id: null,
        status: 'pending',
        processing_duration_ms: null,
        received_at: new Date(),
        processed_at: null,
        error_message: null,
        retry_count: 0
      };

      await TestDatabaseSetup.insertTestWebhookEvents([testEvent]);

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: WebhookEvent[] = await response.json();
      
      expect(data).toHaveLength(1);
      expect(data[0]).toMatchObject({
        id: expect.any(String),
        event_type: 'create',
        object_type: 'activity',
        object_id: 'activity_null_test',
        pilot_id: null,
        received_at: expect.any(String),
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
      expect(data).toMatchObject({
        error: 'Invalid limit parameter (1-1000)'
      });
    });

    it('should reject limit parameter - zero', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=0');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toMatchObject({
        error: 'Invalid limit parameter (1-1000)'
      });
    });

    it('should reject limit parameter - negative', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=-5');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toMatchObject({
        error: 'Invalid limit parameter (1-1000)'
      });
    });

    it('should reject limit parameter - too large', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=1001');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toMatchObject({
        error: 'Invalid limit parameter (1-1000)'
      });
    });

    it('should accept limit parameter - boundary values', async () => {
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
    it('should handle database connection errors gracefully', async () => {
      // Temporarily close the database connection to simulate error
      await testClient.end();
      
      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
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
      // Setup only 5 records but ask for 100
      const testEvents = Array.from({ length: 5 }, (_, i) => ({
        event_type: 'create',
        object_type: 'activity',
        object_id: `activity_${i}`,
        status: 'completed',
        received_at: new Date(Date.now() - i * 60000)
      }));

      await TestDatabaseSetup.insertTestWebhookEvents(testEvents);

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=100');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: WebhookEvent[] = await response.json();
      
      // Should return only 5 events
      expect(data).toHaveLength(5);
    });

    it('should maintain correct order even with same timestamps', async () => {
      const sameTime = new Date();
      
      const testEvents = Array.from({ length: 3 }, (_, i) => ({
        event_type: 'create',
        object_type: 'activity',
        object_id: `activity_${i}`,
        status: 'completed',
        received_at: sameTime
      }));

      await TestDatabaseSetup.insertTestWebhookEvents(testEvents);

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: WebhookEvent[] = await response.json();
      
      expect(data).toHaveLength(3);
      // All should have the same timestamp
      expect(data.every(event => event.received_at === sameTime.toISOString())).toBe(true);
    });

    it('should handle decimal limit parameter correctly', async () => {
      const testEvents = Array.from({ length: 10 }, (_, i) => ({
        event_type: 'create',
        object_type: 'activity',
        object_id: `activity_${i}`,
        status: 'completed',
        received_at: new Date(Date.now() - i * 60000)
      }));

      await TestDatabaseSetup.insertTestWebhookEvents(testEvents);

      // Test with decimal value (should be parsed to integer)
      const request = new NextRequest('http://localhost:3000/api/admin/webhooks?limit=5.7');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: WebhookEvent[] = await response.json();
      
      // Should return 5 events (parsed as integer)
      expect(data).toHaveLength(5);
    });
  });

  describe('Response Format Validation', () => {
    it('should match WebhookEvent interface exactly', async () => {
      const testEvent = {
        event_type: 'create',
        object_type: 'activity',
        object_id: 'activity_format_test',
        pilot_id: 123,
        status: 'completed',
        processing_duration_ms: 1500,
        received_at: new Date(),
        processed_at: new Date(),
        error_message: null,
        retry_count: 2
      };

      await TestDatabaseSetup.insertTestWebhookEvents([testEvent]);

      const request = new NextRequest('http://localhost:3000/api/admin/webhooks');
      
      const response = await GET(request);
      
      expect(response.status).toBe(200);
      
      const data: WebhookEvent[] = await response.json();
      
      expect(data).toHaveLength(1);
      
      const event = data[0];
      
      // Verify all required fields are present with correct types
      expect(typeof event.id).toBe('string');
      expect(typeof event.event_type).toBe('string');
      expect(typeof event.object_type).toBe('string');
      expect(typeof event.object_id).toBe('string');
      expect(typeof event.pilot_id).toBe('number');
      expect(typeof event.received_at).toBe('string');
      expect(typeof event.processed_at).toBe('string');
      expect(typeof event.status).toBe('string');
      expect(event.error_message).toBe(null);
      expect(typeof event.processing_duration_ms).toBe('number');
      expect(typeof event.retry_count).toBe('number');
      
      // Verify no extra fields
      const expectedFields = [
        'id', 'event_type', 'object_type', 'object_id', 'pilot_id',
        'received_at', 'processed_at', 'status', 'error_message',
        'processing_duration_ms', 'retry_count'
      ];
      
      expect(Object.keys(event)).toEqual(expect.arrayContaining(expectedFields));
      expect(Object.keys(event)).toHaveLength(expectedFields.length);
    });
  });
});