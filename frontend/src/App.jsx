import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Banner from './components/Banner';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import OrderHistoryModal from './components/OrderHistoryModal';
import AIAdvisorModal from './components/AIAdvisorModal';
import CompareModal from './components/CompareModal';
import ToastContainer from './components/ToastContainer';
import AdminBar from './components/AdminBar';
import { api } from './services/api';
import { useCart } from './context/CartContext';
import { Sparkles, SlidersHorizontal, Package, Tag, ArrowRight, Scale } from 'lucide-react';

const CATEGORIES = ['All', 'Audio', 'Wearables', 'Computing', 'Accessories'];

export default function App() {
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [ordersCount, setOrdersCount] = useState(0);

  // Modals state
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const { setIsCartOpen, applyCoupon } = useCart();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodsRes, coupsRes, ordersRes] = await Promise.all([
        api.getProducts(),
        api.getCoupons(),
        api.getOrders()
      ]);

      if (prodsRes.success) setProducts(prodsRes.data);
      if (coupsRes.success) setCoupons(coupsRes.data);
      if (ordersRes.success) setOrdersCount(ordersRes.count || ordersRes.data.length);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter & Sort Products
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0; // featured
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Banner */}
      <Banner onSelectCoupon={() => setIsCartOpen(true)} />

      {/* Navbar */}
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        ordersCount={ordersCount}
        onOpenAIAdvisor={() => setIsAIAdvisorOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-indigo-950 text-white p-8 sm:p-14 mb-12 overflow-hidden shadow-2xl border border-brand-900/40">
          <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-20 top-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-bold text-brand-300 mb-5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Full-Stack E-Commerce Shopping &amp; Billing Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              Premium Tech, Built with Precision.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              Rule-based billing with deterministic discount sequencing, dynamic coupon re-validation (WELCOME10, BUY2GET1, FLAT500, FREESHIP), 18% GST calculation, and instant <b>⚡ Buy Now</b> direct checkout.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => {
                  setSelectedCategory('Accessories');
                  window.scrollTo({ top: 450, behavior: 'smooth' });
                }}
                className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-brand-500/30 transition-all flex items-center space-x-2"
              >
                <span>Shop BUY2GET1 Accessories</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsAIAdvisorOpen(true)}
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>NVIDIA AI Shopping Advisor</span>
              </button>

              <button
                onClick={() => setIsCompareOpen(true)}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white font-extrabold text-sm sm:text-base rounded-2xl backdrop-blur-md transition-all flex items-center space-x-2"
              >
                <Scale className="w-4 h-4" />
                <span>Compare Products</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters & Categories Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-10">
          
          {/* Category Tabs */}
          <div className="flex items-center space-x-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            {CATEGORIES.map(cat => {
              const active = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all border-2 ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/15'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {cat === 'Accessories' ? 'Accessories (BUY2GET1 Offer)' : cat}
                </button>
              );
            })}
          </div>

          {/* Sorting & Counter */}
          <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
            <span className="text-sm text-slate-600 font-bold">
              Showing <span className="text-brand-700 font-black">{filteredProducts.length}</span> products
            </span>

            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs sm:text-sm font-bold bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 outline-none text-slate-800 focus:border-brand-500 cursor-pointer shadow-sm"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-slate-500">Loading catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No products match your criteria</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search or switching categories.</p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchTerm(''); }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id || product._id}
                product={product}
                onOpenDetail={(prod) => setSelectedProductForDetail(prod)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
      />

      {/* NVIDIA AI Shopping Advisor Modal */}
      <AIAdvisorModal
        isOpen={isAIAdvisorOpen}
        onClose={() => setIsAIAdvisorOpen(false)}
      />

      {/* NVIDIA AI Product Comparison Modal */}
      <CompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        allProducts={products}
      />

      {/* Cart Drawer */}
      <CartDrawer coupons={coupons} />

      {/* Checkout Modal */}
      <CheckoutModal onOrderPlaced={loadData} />

      {/* Order Confirmation Receipt */}
      <OrderConfirmationModal />

      {/* Order History Modal */}
      <OrderHistoryModal />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Admin & System Toolbar */}
      <AdminBar onDataReset={loadData} />
    </div>
  );
}
