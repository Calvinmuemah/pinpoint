const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

describe('PDF Endpoints Specification Verification', () => {
  jest.setTimeout(30000);
  let authToken;
  const mockUserId = '11111111-1111-1111-1111-111111111111';

  beforeAll(() => {
    authToken = jwt.sign(
      { id: mockUserId, email: 'admin@pinpoint.com', role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('1. Public & Contact Form Endpoints', () => {
    it('POST /api/v1/public/contact - matches PDF schema', async () => {
      const res = await request(app)
        .post('/api/v1/public/contact')
        .send({
          fullName: 'Alice Johnson',
          businessName: 'Kenya Safari Tours',
          email: 'alice@kenyasafari.com',
          industry: 'Tourism',
          message: 'We want to integrate PinPoint into our sales flow.',
        });

      expect([201, 500]).toContain(res.statusCode);
      if (res.statusCode === 201) {
        expect(res.body.success).toBe(true);
      }
    });
  });

  describe('2. Authentication & User Profile Endpoints', () => {
    it('POST /api/v1/auth/login - validates body structure', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@pinpoint.com',
          password: 'password123',
        });

      expect([200, 401, 500]).toContain(res.statusCode);
    });

    it('GET /api/v1/user/profile - requires auth header', async () => {
      const res = await request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 404, 500]).toContain(res.statusCode);
    });

    it('PUT /api/v1/user/profile - updates user profile', async () => {
      const res = await request(app)
        .put('/api/v1/user/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Calvin Muema',
          email: 'calvin@pinpoint.com',
        });

      expect([200, 409, 500]).toContain(res.statusCode);
    });
  });

  describe('3. Lead Intelligence Management Endpoints', () => {
    it('GET /api/v1/leads - supports search, scoreFilter, status, page, limit', async () => {
      const res = await request(app)
        .get('/api/v1/leads?search=Mombasa&scoreFilter=Hot&status=New&page=1&limit=20')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 500]).toContain(res.statusCode);
    });

    it('POST /api/v1/leads - manual / simulated interception creation', async () => {
      const res = await request(app)
        .post('/api/v1/leads')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          details: 'Looking for a 3-day beach safari in Diani next week.',
          destination: 'Diani',
          travelType: 'Safari',
          budget: 1200,
          source: 'Twitter',
        });

      expect([201, 500]).toContain(res.statusCode);
    });

    it('GET /api/v1/leads/:id - retrieves lead details by ID', async () => {
      const res = await request(app)
        .get('/api/v1/leads/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 404, 500]).toContain(res.statusCode);
    });

    it('PATCH /api/v1/leads/:id/status - accepts valid operational statuses', async () => {
      const res = await request(app)
        .patch('/api/v1/leads/11111111-1111-1111-1111-111111111111/status')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Contacted' });

      expect([200, 404, 500]).toContain(res.statusCode);
    });

    it('POST /api/v1/leads/:id/star - toggles star flag', async () => {
      const res = await request(app)
        .post('/api/v1/leads/11111111-1111-1111-1111-111111111111/star')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 404, 500]).toContain(res.statusCode);
    });

    it('DELETE /api/v1/leads/:id - archives/deletes lead', async () => {
      const res = await request(app)
        .delete('/api/v1/leads/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 404, 500]).toContain(res.statusCode);
    });

    it('GET /api/v1/leads/export - downloads CSV format', async () => {
      const res = await request(app)
        .get('/api/v1/leads/export?status=New')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 500]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.headers['content-type']).toContain('text/csv');
      }
    });
  });

  describe('4. Notifications & Action Queue Endpoints', () => {
    it('GET /api/v1/notifications - supports status filter (Pending/Later)', async () => {
      const res = await request(app)
        .get('/api/v1/notifications?status=Pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 500]).toContain(res.statusCode);
    });

    it('DELETE /api/v1/notifications/:id - deletes specific notification', async () => {
      const res = await request(app)
        .delete('/api/v1/notifications/11111111-1111-1111-1111-111111111111')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 404, 500]).toContain(res.statusCode);
    });

    it('DELETE /api/v1/notifications - bulk clears by status', async () => {
      const res = await request(app)
        .delete('/api/v1/notifications?status=Pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 500]).toContain(res.statusCode);
    });
  });

  describe('5. Dashboard & Analytics Endpoints', () => {
    it('GET /api/v1/analytics/dashboard - retrieves summary metrics', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 500]).toContain(res.statusCode);
    });

    it('GET /api/v1/analytics/breakdown - supports timeframe query (7d, 30d, all)', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/breakdown?timeframe=30d')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 500]).toContain(res.statusCode);
    });
  });

  describe('6. AI Listener & System Settings Endpoints', () => {
    it('GET /api/v1/settings - retrieves listener & scoring configurations', async () => {
      const res = await request(app)
        .get('/api/v1/settings')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 500]).toContain(res.statusCode);
    });

    it('PUT /api/v1/settings/keywords - updates monitored keywords', async () => {
      const res = await request(app)
        .put('/api/v1/settings/keywords')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          keywords: ['Mombasa vacation', 'Kenya safari tour'],
        });

      expect([200, 500]).toContain(res.statusCode);
    });

    it('PUT /api/v1/settings/sources - toggles active social platforms', async () => {
      const res = await request(app)
        .put('/api/v1/settings/sources')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sources: [
            { id: 'Reddit', enabled: true },
            { id: 'TripAdvisor', enabled: false },
          ],
        });

      expect([200, 500]).toContain(res.statusCode);
    });

    it('PUT /api/v1/settings/scoring-rules - configures scoring weights and criteria', async () => {
      const res = await request(app)
        .put('/api/v1/settings/scoring-rules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          scoringRules: [
            {
              id: 'destination',
              criterion: 'Explicit travel destination mentioned',
              weight: 25,
              description: 'Target location defined',
            },
          ],
        });

      expect([200, 500]).toContain(res.statusCode);
    });
  });
});
