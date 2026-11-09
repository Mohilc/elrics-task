const initialProducts = [
  {
    id: 'prod-001',
    name: 'Elrics Apex Wireless Headphones',
    category: 'Audio',
    price: 3499,
    stock: 15,
    rating: 4.8,
    reviewsCount: 142,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    description: 'Studio-grade hybrid active noise cancellation, 40mm titanium drivers, and 50-hour ultra-long battery life.',
    isAccessory: false,
    badge: 'Bestseller'
  },
  {
    id: 'prod-002',
    name: 'Elrics Wave Pro ANC Earbuds',
    category: 'Audio',
    price: 2199,
    stock: 20,
    rating: 4.7,
    reviewsCount: 98,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    description: 'Immersive spatial audio, IPX5 water resistance, quad microphones with AI environmental noise reduction.',
    isAccessory: false,
    badge: 'Trending'
  },
  {
    id: 'prod-003',
    name: 'Elrics SoundBar Ultra 120W',
    category: 'Audio',
    price: 6999,
    stock: 8,
    rating: 4.9,
    reviewsCount: 64,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    description: 'Cinematic Dolby Digital surround soundbar with dedicated wireless subwoofer and HDMI eARC connectivity.',
    isAccessory: false,
    badge: 'Premium'
  },
  {
    id: 'prod-004',
    name: 'Elrics Horizon AMOLED Smartwatch',
    category: 'Wearables',
    price: 4299,
    stock: 12,
    rating: 4.6,
    reviewsCount: 115,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    description: '1.43-inch Always-on AMOLED display, Bluetooth calling, real-time SpO2, and 120+ professional sports modes.',
    isAccessory: false,
    badge: 'Popular'
  },
  {
    id: 'prod-005',
    name: 'Elrics Pulse Fitness Band 2',
    category: 'Wearables',
    price: 1499,
    stock: 25,
    rating: 4.5,
    reviewsCount: 83,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80',
    description: 'Slim lightweight fitness band with continuous heart-rate tracking, sleep stage analysis, and 14-day battery.',
    isAccessory: false
  },
  {
    id: 'prod-006',
    name: 'Elrics Quantum Mechanical Keyboard RGB',
    category: 'Computing',
    price: 4799,
    stock: 14,
    rating: 4.9,
    reviewsCount: 204,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    description: 'Hot-swappable tactile linear red switches, sound dampening foam, PBT dye-sub keycaps, and per-key RGB backlighting.',
    isAccessory: false,
    badge: 'Top Rated'
  },
  {
    id: 'prod-007',
    name: 'Elrics Glide Wireless Precision Mouse',
    category: 'Computing',
    price: 1899,
    stock: 20,
    rating: 4.7,
    reviewsCount: 156,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',
    description: 'Ergonomic sculpt with dual Bluetooth / 2.4GHz connectivity, silent click switches, and thumb scroll wheel.',
    isAccessory: false
  },
  {
    id: 'prod-008',
    name: 'Elrics Studio 4K Ultra Webcam',
    category: 'Computing',
    price: 5499,
    stock: 9,
    rating: 4.8,
    reviewsCount: 77,
    image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=600&q=80',
    description: 'Sony STARVIS sensor with autofocus, HDR video up to 4K@30fps, built-in dual stereo noise-canceling mics, and physical privacy shutter.',
    isAccessory: false
  },
  // Accessories (Eligible for BUY2GET1 coupon)
  {
    id: 'prod-009',
    name: 'Elrics Braided USB-C Fast Cable (2m)',
    category: 'Accessories',
    price: 299,
    stock: 50,
    rating: 4.7,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    description: '100W Power Delivery nylon double-braided fast charging cable with reinforced zinc alloy connectors.',
    isAccessory: true,
    badge: 'BUY2GET1 Eligible'
  },
  {
    id: 'prod-010',
    name: 'Elrics 65W GaN Dual-Port Charger',
    category: 'Accessories',
    price: 899,
    stock: 30,
    rating: 4.8,
    reviewsCount: 189,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    description: 'Next-gen Gallium Nitride ultra-compact fast wall charger with USB-C (65W) + USB-A (18W) smart power distribution.',
    isAccessory: true,
    badge: 'BUY2GET1 Eligible'
  },
  {
    id: 'prod-011',
    name: 'Elrics Magnetic MagSafe Phone Mount',
    category: 'Accessories',
    price: 449,
    stock: 40,
    rating: 4.6,
    reviewsCount: 92,
    image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?auto=format&fit=crop&w=600&q=80',
    description: '360° rotation magnetic car and desk mount with ultra-strong N52 neodymium magnets and universal sticky base.',
    isAccessory: true,
    badge: 'BUY2GET1 Eligible'
  },
  {
    id: 'prod-012',
    name: 'Elrics Aluminum Laptop Stand',
    category: 'Accessories',
    price: 1199,
    stock: 18,
    rating: 4.9,
    reviewsCount: 145,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
    description: 'Foldable ergonomic laptop riser with 6 adjustable height angles, heat dissipation airflow slots, and silicone anti-slip pads.',
    isAccessory: true,
    badge: 'BUY2GET1 Eligible'
  },
  {
    id: 'prod-013',
    name: 'Elrics Microfiber Display Cleaning Kit',
    category: 'Accessories',
    price: 199,
    stock: 60,
    rating: 4.5,
    reviewsCount: 88,
    image: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80',
    description: 'Streak-free eco screen spray + 2 plush washable microfiber cloths for monitors, phones, laptops, and camera lenses.',
    isAccessory: true,
    badge: 'BUY2GET1 Eligible'
  },
  {
    id: 'prod-014',
    name: 'Elrics Shockproof Hard Travel Case',
    category: 'Accessories',
    price: 649,
    stock: 22,
    rating: 4.8,
    reviewsCount: 73,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    description: 'EVA hard shell carrying case with custom foam compartments for headphones, cables, chargers, and small tech gear.',
    isAccessory: true,
    badge: 'BUY2GET1 Eligible'
  }
];

const initialCoupons = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minPurchase: 1000,
    maxDiscount: 500,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days in future
    active: true,
    description: '10% off on orders above ₹1,000 (Maximum discount ₹500)'
  },
  {
    code: 'FLAT500',
    type: 'flat',
    value: 500,
    minPurchase: 5000,
    maxDiscount: null,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    active: true,
    description: 'Flat ₹500 discount on orders of ₹5,000 or more'
  },
  {
    code: 'FESTIVAL20',
    type: 'percentage',
    value: 20,
    minPurchase: 10000,
    maxDiscount: 2000,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    active: true,
    description: 'Mega 20% festive discount on orders of ₹10,000 or more (Capped at ₹2,000)'
  },
  {
    code: 'FREESHIP',
    type: 'shipping',
    value: 0,
    minPurchase: 0,
    maxDiscount: null,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    active: true,
    description: 'Free shipping on any order regardless of amount'
  },
  {
    code: 'BUY2GET1',
    type: 'buy2get1',
    value: 0,
    minPurchase: 0,
    maxDiscount: null,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
    active: true,
    description: 'Buy 2 get 1 free on all eligible accessories (Cheapest item is 100% free)'
  },
  {
    code: 'EXPIRED50',
    type: 'percentage',
    value: 50,
    minPurchase: 500,
    maxDiscount: 1000,
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
    active: true,
    description: 'Special 50% discount (Demonstration: Expired coupon)'
  }
];

module.exports = { initialProducts, initialCoupons };
