const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${queryString}`);
  },

  getCoupons: () => request('/coupons'),

  validateCoupon: (code, items) => request('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, items })
  }),

  calculateBilling: (items, couponCode = null) => request('/billing/calculate', {
    method: 'POST',
    body: JSON.stringify({ items, couponCode })
  }),

  placeOrder: ({ items, couponCode, customer }) => request('/orders', {
    method: 'POST',
    body: JSON.stringify({ items, couponCode, customer })
  }),

  getOrders: () => request('/orders'),

  resetStore: () => request('/admin/reset', { method: 'POST' }),

  getSystemStatus: () => request('/admin/status'),

  getAiRecommendations: (query, cartItems = []) => request('/ai/recommend', {
    method: 'POST',
    body: JSON.stringify({ query, cartItems })
  }),

  compareProducts: (product1Id, product2Id) => request('/ai/compare', {
    method: 'POST',
    body: JSON.stringify({ product1Id, product2Id })
  })
};

