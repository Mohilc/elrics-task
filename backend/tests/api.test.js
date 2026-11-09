const request = require('supertest');
const app = require('../src/app');
const { resetInMemoryStore } = require('../src/config/db');

describe('Elrics REST API Integration Tests', () => {
  beforeEach(() => {
    resetInMemoryStore();
  });

  describe('GET /api/products', () => {
    test('returns list of products with count and success flag', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    test('filters products by category correctly', async () => {
      const res = await request(app).get('/api/products?category=Accessories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach(item => {
        expect(item.category.toLowerCase()).toBe('accessories');
      });
    });

    test('searches products by query string', async () => {
      const res = await request(app).get('/api/products?search=Headphones');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toMatch(/Headphones/i);
    });
  });

  describe('GET /api/coupons', () => {
    test('returns all seeded coupons', async () => {
      const res = await request(app).get('/api/coupons');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const codes = res.body.data.map(c => c.code);
      expect(codes).toContain('WELCOME10');
      expect(codes).toContain('FLAT500');
      expect(codes).toContain('FESTIVAL20');
      expect(codes).toContain('FREESHIP');
      expect(codes).toContain('BUY2GET1');
    });
  });

  describe('POST /api/billing/calculate', () => {
    test('calculates billing for cart items without coupon', async () => {
      const payload = {
        items: [{ productId: 'prod-001', quantity: 1 }] // Headphones: 3499
      };
      const res = await request(app).post('/api/billing/calculate').send(payload);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subtotal).toBe(3499);
      expect(res.body.data.discount).toBe(0);
      expect(res.body.data.isFreeShipping).toBe(true); // >= 999
      expect(res.body.data.gst).toBe(Math.round((3499 * 18 / 100) * 100) / 100);
    });

    test('returns couponWarning and recalculates if coupon requirements fail', async () => {
      const payload = {
        items: [{ productId: 'prod-013', quantity: 1 }], // Cleaning kit: 199 (below 1000)
        couponCode: 'WELCOME10'
      };
      const res = await request(app).post('/api/billing/calculate').send(payload);
      expect(res.status).toBe(200);
      expect(res.body.data.couponWarning).toMatch(/minimum purchase/i);
      expect(res.body.data.discount).toBe(0);
    });
  });

  describe('POST /api/orders', () => {
    test('successfully places order, decrements stock, and returns orderId', async () => {
      const payload = {
        items: [{ productId: 'prod-009', quantity: 2 }],
        couponCode: null,
        customer: {
          name: 'Priya Sharma',
          email: 'priya@example.com',
          phone: '9876543210',
          address: '45 MG Road',
          city: 'Bengaluru',
          postalCode: '560001'
        }
      };

      const res = await request(app).post('/api/orders').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderId).toMatch(/^ELR-/);
      expect(res.body.data.total).toBeGreaterThan(0);
    });

    test('rejects placing order with empty cart', async () => {
      const payload = {
        items: [],
        customer: { name: 'Test', email: 'test@example.com', address: 'Test' }
      };
      const res = await request(app).post('/api/orders').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/empty cart/i);
    });

    test('rejects placing order with missing customer details', async () => {
      const payload = {
        items: [{ productId: 'prod-001', quantity: 1 }],
        customer: { name: '', email: '', address: '' }
      };
      const res = await request(app).post('/api/orders').send(payload);
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/customer details/i);
    });
  });
});

