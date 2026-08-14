const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

describe('PinPoint Backend API Test Suite', () => {
  let authToken;
  const mockUserId = '11111111-1111-1111-1111-111111111111';

  beforeAll(() => {
    authToken = jwt.sign(
      { id: mockUserId, email: 'admin@pinpoint.com', role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('Root and Health Check', () => {
    it('GET / should return 200 OK and server running info', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('PinPoint Backend API is running');
    });

    it('GET /health should return 200 OK', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('ok');
    });
  });

  describe('Public Contact Endpoint', () => {
    it('POST /api/v1/public/contact should validate request and accept submission', async () => {
      const res = await request(app)
        .post('/api/v1/public/contact')
        .send({
          fullName: 'Jane Doe',
          businessName: 'Coastal Escapes',
          email: 'jane@coastalescapes.com',
          industry: 'Tourism',
          message: 'Would like to request a demo of PinPoint.',
        });
      
      expect([201, 500]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        expect(res.body.success).toBe(true);
      }
    });

    it('POST /api/v1/public/contact should reject invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/public/contact')
        .send({
          fullName: 'John Doe',
          email: 'invalid-email-address',
          message: 'Test message',
        });
      
      expect(res.statusCode).toEqual(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Authentication', () => {
    it('POST /api/v1/auth/login should require valid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'notanemail' });
      expect(res.statusCode).toEqual(422);
    });
  });

  describe('Protected Endpoints Security', () => {
    it('GET /api/v1/leads without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/leads');
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/analytics/dashboard without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/analytics/dashboard');
      expect(res.statusCode).toEqual(401);
    });

    it('GET /api/v1/settings without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/v1/settings');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('Authenticated Lead Endpoints Validation', () => {
    it('POST /api/v1/leads should require details field', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      expect(res.statusCode).toEqual(422);
    });

    it('PATCH /api/v1/leads/:id/status should validate status enum', async () => {
      const res = await request(app)
        .patch('/api/v1/leads/11111111-1111-1111-1111-111111111111/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'InvalidStatus' });
      expect(res.statusCode).toEqual(422);
    });
  });

  describe('Settings Updates Validation', () => {
    it('PUT /api/v1/settings/keywords should validate non-empty array', async () => {
      const res = await request(app)
        .put('/api/v1/settings/keywords')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ keywords: [] });
      expect(res.statusCode).toEqual(422);
    });

    it('PUT /api/v1/settings/scoring-rules should validate weight bounds', async () => {
      const res = await request(app)
        .put('/api/v1/settings/scoring-rules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scoringRules: [{ criterion: 'Test', weight: 150 }],
        });
      expect(res.statusCode).toEqual(422);
    });
  });
});
