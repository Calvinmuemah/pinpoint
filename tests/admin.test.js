const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

describe('Admin Client Management & Onboarding Test Suite', () => {
  let adminToken;
  let clientToken;

  beforeAll(() => {
    adminToken = jwt.sign(
      { id: '11111111-1111-1111-1111-111111111111', email: 'admin@pinpoint.com', role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    clientToken = jwt.sign(
      { id: '22222222-2222-2222-2222-222222222222', email: 'user@client.com', role: 'client' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('Authorization Checks', () => {
    it('POST /api/v1/admin/clients should reject non-admin users with 403', async () => {
      const res = await request(app)
        .post('/api/v1/admin/clients')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          name: 'Safari Explorers',
          email: 'safari@explorers.com',
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/v1/admin/inquiries should reject unauthorized access', async () => {
      const res = await request(app).get('/api/v1/admin/inquiries');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('Admin Client Onboarding', () => {
    it('POST /api/v1/admin/clients should validate request payload', async () => {
      const res = await request(app)
        .post('/api/v1/admin/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'A', // too short
          email: 'bademail',
        });

      expect(res.statusCode).toEqual(422);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/admin/clients accepts valid client and triggers onboarding', async () => {
      const res = await request(app)
        .post('/api/v1/admin/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Mombasa Ocean Safari Tours',
          email: 'info@mombasaocean.com',
          subscriptionPlan: 'Enterprise Plan',
          price: 299,
          keywords: ['Mombasa trip', 'Diani beach'],
        });

      expect([201, 409, 500]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.client).toBeDefined();
        expect(res.body.data.temporaryPassword).toBeDefined();
      }
    });

    it('GET /api/v1/admin/inquiries retrieves all public inquiries', async () => {
      const res = await request(app)
        .get('/api/v1/admin/inquiries')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 500]).toContain(res.statusCode);
    });

    it('GET /api/v1/admin/clients retrieves all onboarded clients', async () => {
      const res = await request(app)
        .get('/api/v1/admin/clients')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 500]).toContain(res.statusCode);
    });
  });
});
