const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

describe('AI Travel Intelligence Agent Test Suite', () => {
  jest.setTimeout(30000);
  let authToken;

  beforeAll(() => {
    authToken = jwt.sign(
      { id: '11111111-1111-1111-1111-111111111111', email: 'pinadmin@gmail.com', role: 'admin' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('1. Live AI Intent Analysis', () => {
    it('POST /api/v1/ai/analyze accurately extracts travel intent, score, and matches businesses', async () => {
      const res = await request(app)
        .post('/api/v1/ai/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Looking for luxury resort recommendations in Mombasa next month for our honeymoon. Budget is around $3,000.',
          source: 'Reddit',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.action).toBe('LEAD_GENERATED');
      expect(res.body.data.intelligence.isTravelIntent).toBe(true);
      expect(res.body.data.intelligence.destination).toBe('Mombasa');
      expect(res.body.data.intelligence.intentScore).toBeGreaterThanOrEqual(80);
      expect(res.body.data.matchedBusinesses.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/ai/analyze discards irrelevant text without travel intent', async () => {
      const res = await request(app)
        .post('/api/v1/ai/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Just finished reading a great science fiction book today.',
          source: 'Twitter',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.action).toBe('DISCARD');
    });
  });

  describe('2. Automated Agent Source & Keyword Scanning', () => {
    it('POST /api/v1/ai/scan runs agent scanning pipeline across monitored platforms', async () => {
      const res = await request(app)
        .post('/api/v1/ai/scan')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.scannedKeywords).toBeDefined();
      expect(res.body.data.scannedSources).toBeDefined();
      expect(res.body.data.totalLeadsDetected).toBeGreaterThanOrEqual(0);
    });
  });
});
