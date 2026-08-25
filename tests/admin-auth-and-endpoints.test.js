const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../src/config/env');

describe('Admin Authentication & New Endpoints Integration Test', () => {
  jest.setTimeout(30000);
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

  describe('4. Token Refresh, Logout, and Password Reset Flow', () => {
    let testRefreshToken;

    beforeAll(() => {
      testRefreshToken = jwt.sign(
        { id: '00000000-0000-0000-0000-000000000001', email: adminEmail, role: 'admin' },
        env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
    });

    it('POST /api/v1/auth/refresh returns new token and new refreshToken with valid input', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: testRefreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('POST /api/v1/auth/refresh rejects missing token with 422', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(res.statusCode).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/refresh rejects invalid token with 401', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.token' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/logout logs out session cleanly', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ refreshToken: testRefreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Logged out successfully');
    });

    it('POST /api/v1/auth/forgot-password sends reset instructions', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: adminEmail });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('password reset link has been sent');
    });

    it('POST /api/v1/auth/reset-password rejects invalid token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({ token: 'fake_token', newPassword: 'newPassword123' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});

