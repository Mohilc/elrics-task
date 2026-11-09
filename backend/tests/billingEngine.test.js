const { calculateBilling, round2 } = require('../src/services/billingEngine');

describe('Elrics Billing & Coupon Engine Unit Tests', () => {
  const sampleItems = [
    {
      product: { id: 'p1', name: 'Item 1', price: 1200, isAccessory: false },
      quantity: 1
    }
  ];

  describe('1. Subtotal & Core Calculation Flow', () => {
    test('calculates correct subtotal for single item', () => {
      const res = calculateBilling(sampleItems);
      expect(res.subtotal).toBe(1200);
      expect(res.itemCount).toBe(1);
    });

    test('calculates correct subtotal for multiple items with quantities', () => {
      const items = [
        { product: { id: 'p1', name: 'Headphones', price: 1500 }, quantity: 2 },
        { product: { id: 'p2', name: 'Stand', price: 300 }, quantity: 3 }
      ];
      // (1500*2) + (300*3) = 3000 + 900 = 3900
      const res = calculateBilling(items);
      expect(res.subtotal).toBe(3900);
      expect(res.itemCount).toBe(5);
    });

    test('handles empty cart gracefully', () => {
      const res = calculateBilling([]);
      expect(res.subtotal).toBe(0);
      expect(res.discount).toBe(0);
      expect(res.gst).toBe(0);
      expect(res.shippingFee).toBe(0);
      expect(res.total).toBe(0);
    });

    test('throws error for invalid or negative quantity', () => {
      expect(() => {
        calculateBilling([{ product: { id: 'p1', price: 500 }, quantity: -1 }]);
      }).toThrow(/Invalid item quantity/);

      expect(() => {
        calculateBilling([{ product: { id: 'p1', price: 500 }, quantity: 0 }]);
      }).toThrow(/Invalid item quantity/);
    });

    test('verifies exact calculation order: Subtotal -> Discount -> GST (18%) -> Shipping -> Total', () => {
      // Subtotal = 1000, 10% discount = 100 -> taxable = 900
      // GST 18% of 900 = 162
      // Taxable 900 < 999 threshold -> Shipping = 49
      // Total = 900 + 162 + 49 = 1111
      const coupon = {
        code: 'TEST10',
        type: 'percentage',
        value: 10,
        minPurchase: 500,
        active: true
      };
      const items = [{ product: { id: 'p1', price: 1000 }, quantity: 1 }];
      const res = calculateBilling(items, coupon);

      expect(res.subtotal).toBe(1000);
      expect(res.discount).toBe(100);
      expect(res.taxableAmount).toBe(900);
      expect(res.gst).toBe(162);
      expect(res.shippingFee).toBe(49);
      expect(res.total).toBe(1111);
    });
  });

  describe('2. Coupon: WELCOME10 (10% off, min ₹1,000, max ₹500)', () => {
    const welcomeCoupon = {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minPurchase: 1000,
      maxDiscount: 500,
      active: true
    };

    test('rejects WELCOME10 if subtotal is below ₹1,000', () => {
      const items = [{ product: { id: 'p1', price: 800 }, quantity: 1 }];
      expect(() => calculateBilling(items, welcomeCoupon)).toThrow(
        /minimum purchase of ₹1,000/
      );
    });

    test('applies 10% discount when subtotal is ₹2,000 (discount = ₹200)', () => {
      const items = [{ product: { id: 'p1', price: 2000 }, quantity: 1 }];
      const res = calculateBilling(items, welcomeCoupon);
      expect(res.discount).toBe(200);
    });

    test('caps discount at ₹500 when 10% of subtotal exceeds ₹500 (e.g. ₹6,000)', () => {
      const items = [{ product: { id: 'p1', price: 6000 }, quantity: 1 }];
      const res = calculateBilling(items, welcomeCoupon);
      // 10% of 6000 is 600, capped at 500
      expect(res.discount).toBe(500);
    });
  });

  describe('3. Coupon: FLAT500 (Flat ₹500, min ₹5,000)', () => {
    const flatCoupon = {
      code: 'FLAT500',
      type: 'flat',
      value: 500,
      minPurchase: 5000,
      active: true
    };

    test('rejects FLAT500 when subtotal is below ₹5,000', () => {
      const items = [{ product: { id: 'p1', price: 4999 }, quantity: 1 }];
      expect(() => calculateBilling(items, flatCoupon)).toThrow(
        /minimum purchase of ₹5,000/
      );
    });

    test('applies exact ₹500 discount when subtotal is ₹5,000 or more', () => {
      const items = [{ product: { id: 'p1', price: 5500 }, quantity: 1 }];
      const res = calculateBilling(items, flatCoupon);
      expect(res.discount).toBe(500);
      expect(res.taxableAmount).toBe(5000);
    });
  });

  describe('4. Coupon: FESTIVAL20 (20% off, min ₹10,000, max ₹2,000)', () => {
    const festivalCoupon = {
      code: 'FESTIVAL20',
      type: 'percentage',
      value: 20,
      minPurchase: 10000,
      maxDiscount: 2000,
      active: true
    };

    test('rejects FESTIVAL20 when subtotal is below ₹10,000', () => {
      const items = [{ product: { id: 'p1', price: 9500 }, quantity: 1 }];
      expect(() => calculateBilling(items, festivalCoupon)).toThrow(
        /minimum purchase of ₹10,000/
      );
    });

    test('caps discount at ₹2,000 when 20% exceeds max discount (e.g. ₹15,000)', () => {
      const items = [{ product: { id: 'p1', price: 15000 }, quantity: 1 }];
      const res = calculateBilling(items, festivalCoupon);
      // 20% of 15000 = 3000, capped at 2000
      expect(res.discount).toBe(2000);
    });
  });

  describe('5. Coupon: FREESHIP', () => {
    const freeshipCoupon = {
      code: 'FREESHIP',
      type: 'shipping',
      value: 0,
      minPurchase: 0,
      active: true
    };

    test('waives shipping fee on order under free shipping threshold', () => {
      // Order of 500 would normally have 49 shipping
      const items = [{ product: { id: 'p1', price: 500 }, quantity: 1 }];
      const withoutCoupon = calculateBilling(items, null);
      expect(withoutCoupon.shippingFee).toBe(49);

      const withCoupon = calculateBilling(items, freeshipCoupon);
      expect(withCoupon.shippingFee).toBe(0);
      expect(withCoupon.isFreeShipping).toBe(true);
    });
  });

  describe('6. Coupon: BUY2GET1 (3 accessories required, cheapest unit free)', () => {
    const buy2get1Coupon = {
      code: 'BUY2GET1',
      type: 'buy2get1',
      value: 0,
      minPurchase: 0,
      active: true
    };

    test('rejects BUY2GET1 if fewer than 3 accessories are in cart', () => {
      const items = [
        { product: { id: 'a1', price: 300, isAccessory: true }, quantity: 1 },
        { product: { id: 'a2', price: 500, isAccessory: true }, quantity: 1 }
      ];
      expect(() => calculateBilling(items, buy2get1Coupon)).toThrow(
        /requires at least 3 eligible accessories/
      );
    });

    test('ignores non-accessories in accessory count', () => {
      const items = [
        { product: { id: 'p1', price: 3000, isAccessory: false }, quantity: 2 },
        { product: { id: 'a1', price: 300, isAccessory: true }, quantity: 1 }
      ];
      expect(() => calculateBilling(items, buy2get1Coupon)).toThrow(
        /requires at least 3 eligible accessories/
      );
    });

    test('makes the cheapest accessory unit 100% free', () => {
      // 3 accessories: Cable (299), Mount (449), Charger (899)
      // Cheapest is Cable (299)
      const items = [
        { product: { id: 'a1', price: 299, isAccessory: true }, quantity: 1 },
        { product: { id: 'a2', price: 449, isAccessory: true }, quantity: 1 },
        { product: { id: 'a3', price: 899, isAccessory: true }, quantity: 1 }
      ];
      const res = calculateBilling(items, buy2get1Coupon);
      expect(res.discount).toBe(299);
      expect(res.subtotal).toBe(299 + 449 + 899); // 1647
      expect(res.taxableAmount).toBe(1647 - 299); // 1348
    });

    test('works with single accessory with quantity 3 (1 of them is free)', () => {
      const items = [
        { product: { id: 'a1', price: 300, isAccessory: true }, quantity: 3 }
      ];
      const res = calculateBilling(items, buy2get1Coupon);
      expect(res.discount).toBe(300);
      expect(res.subtotal).toBe(900);
      expect(res.taxableAmount).toBe(600);
    });
  });

  describe('7. Coupon Expiry and Inactivity Validation', () => {
    test('rejects expired coupon', () => {
      const expiredCoupon = {
        code: 'EXPIRED10',
        type: 'percentage',
        value: 10,
        expiresAt: new Date(Date.now() - 100000),
        active: true
      };
      expect(() => calculateBilling(sampleItems, expiredCoupon)).toThrow(
        /has expired/
      );
    });

    test('rejects disabled/inactive coupon', () => {
      const inactiveCoupon = {
        code: 'DISABLED',
        type: 'percentage',
        value: 10,
        active: false
      };
      expect(() => calculateBilling(sampleItems, inactiveCoupon)).toThrow(
        /disabled or inactive/
      );
    });
  });

  describe('8. Shipping Rules & GST Rules', () => {
    test('standard shipping of ₹49 applies below threshold ₹999', () => {
      const items = [{ product: { id: 'p1', price: 950 }, quantity: 1 }];
      const res = calculateBilling(items);
      expect(res.shippingFee).toBe(49);
      expect(res.isFreeShipping).toBe(false);
    });

    test('free shipping unlocks automatically above ₹999 threshold', () => {
      const items = [{ product: { id: 'p1', price: 1000 }, quantity: 1 }];
      const res = calculateBilling(items);
      expect(res.shippingFee).toBe(0);
      expect(res.isFreeShipping).toBe(true);
    });

    test('applies exactly 18% GST on (Subtotal - Discount)', () => {
      // Subtotal = 2000, 500 flat discount -> taxable = 1500
      // 18% of 1500 = 270
      const coupon = { code: 'FLAT500', type: 'flat', value: 500, minPurchase: 1000, active: true };
      const items = [{ product: { id: 'p1', price: 2000 }, quantity: 1 }];
      const res = calculateBilling(items, coupon);
      expect(res.taxableAmount).toBe(1500);
      expect(res.gst).toBe(270);
    });
  });
});

