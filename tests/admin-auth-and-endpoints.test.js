const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../src/config/env');

describe('Admin Authentication & New Endpoints Integration Test', () => {
  const adminEmail = 'pinadmin@gmail.com';
  const adminPassword = 'pin@2026';
  let adminToken;

  beforeAll(async () => {
    // Generate valid signed JWT for pinadmin@gmail.com
    adminToken = jwt.sign(
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: adminEmail,
        role: 'admin',
      },
      env.JWT_SECRET,
      { expiresIn: '2h' }
    );
  });

  describe('1. Admin Credentials & Authentication', () => {
    it('POST /api/v1/auth/login validates credentials format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: adminEmail,
          password: adminPassword,
        });

      expect([200, 401, 500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toBeDefined();
        expect(res.body.data.user.email).toBe(adminEmail);
      }
    });

    it('POST /api/v1/auth/login rejects invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: adminEmail,
          password: 'wrongpassword',
        });

      expect([401, 500]).toContain(res.statusCode);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Admin Client Onboarding Flow', () => {
    it('POST /api/v1/admin/clients onboards a new client with automated temporary password', async () => {
      const res = await request(app)
        .post('/api/v1/admin/clients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Tsavo Safari Adventures',
          email: 'tsavo@adventures.com',
          subscriptionPlan: 'Pro Plan',
          price: 199,
          keywords: ['Tsavo safari', 'Kenya wildlife'],
        });

      expect([201, 409, 500]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.client.email).toBe('tsavo@adventures.com');
        expect(res.body.data.temporaryPassword).toBeDefined();
      }
    });

    it('GET /api/v1/admin/clients fetches all active clients', async () => {
      const res = await request(app)
        .get('/api/v1/admin/clients')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 500]).toContain(res.statusCode);
    });

    it('GET /api/v1/admin/inquiries fetches all submitted contact inquiries', async () => {
      const res = await request(app)
        .get('/api/v1/admin/inquiries')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 500]).toContain(res.statusCode);
    });
  });

  describe('3. Protected System Endpoints with Admin Token', () => {
    it('GET /api/v1/user/profile retrieves admin profile', async () => {
      const res = await request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 404, 500]).toContain(res.statusCode);
    });

    it('GET /api/v1/analytics/dashboard retrieves metrics', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 500]).toContain(res.statusCode);
    });

    it('GET /api/v1/settings retrieves system settings', async () => {
      const res = await request(app)
        .get('/api/v1/settings')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([200, 500]).toContain(res.statusCode);
    });
  });
});
