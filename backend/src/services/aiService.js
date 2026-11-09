const env = require('../config/env');
const productService = require('./productService');

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

async function callNvidiaAI(messages, options = {}) {
  const model = options.model || env.nvidiaGeneralModel;
  const apiKey = options.apiKey || env.nvidiaGeneralKey;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout for speed

  try {
    const res = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature || 0.4,
        max_tokens: options.max_tokens || 800
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`[NVIDIA AI API Warning] Status ${res.status}: ${errText}`);
      throw new Error(`NVIDIA API returned status ${res.status}`);
    }

    const data = await res.json();
    return data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content
      : null;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn(`[NVIDIA AI fallback]: ${err.message}`);
    return null;
  }
}

class AIService {
  async recommend(query = '', currentCart = []) {
    const allProducts = await productService.getAllProducts();

    const catalogSummary = allProducts.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      isAccessory: p.isAccessory,
      rating: p.rating,
      description: p.description
    }));

    const cartSummary = currentCart.map(c => {
      const prod = c.product || c;
      return `${prod.name} (Qty: ${c.quantity || 1})`;
    }).join(', ');

    const prompt = `You are the Elrics Store AI Shopping Assistant powered by NVIDIA AI.
Catalog of available products:
${JSON.stringify(catalogSummary, null, 2)}

User's Query/Need: "${query || 'Recommend top trending electronics and accessories'}"
User's Current Cart: "${cartSummary || 'Cart is currently empty'}"

Active Coupon Deals in Store:
- WELCOME10: 10% off on orders >= ₹1,000 (cap ₹500)
- FLAT500: Flat ₹500 off on orders >= ₹5,000
- FESTIVAL20: 20% off on orders >= ₹10,000 (cap ₹2,000)
- FREESHIP: Free shipping on all orders
- BUY2GET1: Buy 2 get 1 free on all eligible accessories

Task:
1. Recommend 2 to 4 best matching products from the catalog above.
2. Provide a helpful, personalized explanation mentioning how the recommendations fit the user request and any applicable deal/coupon (especially BUY2GET1 if accessories or WELCOME10 if reaching ₹1,000 threshold).

Format your response in friendly Markdown with:
- A brief warm greeting and recommendation summary
- Why each product was chosen
- Best coupon strategy to save money`;

    const messages = [
      { role: 'system', content: 'You are an expert e-commerce product recommender and shopping advisor for Elrics.' },
      { role: 'user', content: prompt }
    ];

    const aiResponse = await callNvidiaAI(messages, {
      model: env.nvidiaGeneralModel,
      apiKey: env.nvidiaGeneralKey
    });

    if (aiResponse) {
      // Find matching products mentioned in response or matching query
      const lowerQuery = query.toLowerCase();
      let matchedProds = allProducts.filter(p =>
        lowerQuery && (p.name.toLowerCase().includes(lowerQuery) || p.category.toLowerCase().includes(lowerQuery))
      );
      if (matchedProds.length === 0) {
        matchedProds = allProducts.slice(0, 3);
      }

      return {
        success: true,
        aiAnalysis: aiResponse,
        modelUsed: env.nvidiaGeneralModel,
        recommendedProducts: matchedProds
      };
    }

    // Heuristic fallback if API timeout or offline
    const qLower = query.toLowerCase();
    let fallbackMatches = allProducts.filter(p =>
      qLower && (p.name.toLowerCase().includes(qLower) || p.category.toLowerCase().includes(qLower) || p.description.toLowerCase().includes(qLower))
    );
    if (fallbackMatches.length === 0) {
      fallbackMatches = allProducts.filter(p => p.badge || p.isAccessory).slice(0, 3);
    }

    return {
      success: true,
      aiAnalysis: `### 🤖 Elrics AI Recommendation\n\nBased on your interest in **"${query || 'our best tech'}"**, here are our top recommended picks from the Elrics catalog. Don't forget that orders above ₹999 get **FREE Shipping**, and accessories qualify for the **BUY2GET1** offer!`,
      modelUsed: 'heuristic-fast',
      recommendedProducts: fallbackMatches
    };
  }

  async compare(product1Id, product2Id) {
    const [p1, p2] = await Promise.all([
      productService.getProductById(product1Id),
      productService.getProductById(product2Id)
    ]);

    if (!p1 || !p2) {
      throw new Error('Both products must be specified for comparison.');
    }

    const prompt = `Compare these two e-commerce products from Elrics Store in detail:

Product 1:
Name: ${p1.name}
Category: ${p1.category}
Price: ₹${p1.price}
Rating: ${p1.rating} ★ (${p1.reviewsCount} reviews)
Description: ${p1.description}
Is Accessory: ${p1.isAccessory}

Product 2:
Name: ${p2.name}
Category: ${p2.category}
Price: ₹${p2.price}
Rating: ${p2.rating} ★ (${p2.reviewsCount} reviews)
Description: ${p2.description}
Is Accessory: ${p2.isAccessory}

Store Rules:
- 18% GST applies on taxable subtotal
- Free Shipping above ₹999 (standard ₹49)
- WELCOME10 coupon gives 10% off (min ₹1,000)
- BUY2GET1 coupon makes the cheapest accessory free if 3 accessories are in cart

Provide a comprehensive, stylish side-by-side comparison in Markdown:
1. **Key Advantages of ${p1.name}**
2. **Key Advantages of ${p2.name}**
3. **Value for Money & Pricing** (factoring in GST & Coupons)
4. **Final Recommendation**: Which one should the user pick based on their use-case?`;

    const messages = [
      { role: 'system', content: 'You are an objective tech reviewer and comparison engine for Elrics Store.' },
      { role: 'user', content: prompt }
    ];

    const aiResponse = await callNvidiaAI(messages, {
      model: env.nvidiaGeneralModel,
      apiKey: env.nvidiaGeneralKey
    });

    const result = {
      product1: p1,
      product2: p2,
      comparison: aiResponse || `### ⚖️ Side-by-Side Comparison: ${p1.name} vs ${p2.name}\n\n- **${p1.name}**: Priced at ₹${p1.price.toLocaleString('en-IN')}, rated ${p1.rating}★. Best for users seeking ${p1.category}.\n- **${p2.name}**: Priced at ₹${p2.price.toLocaleString('en-IN')}, rated ${p2.rating}★. Best for users seeking ${p2.category}.\n\n**Verdict**: Both products offer outstanding build quality and are covered by Elrics 1-year warranty.`,
      modelUsed: aiResponse ? env.nvidiaGeneralModel : 'heuristic-fast'
    };

    return result;
  }
}

module.exports = new AIService();

