import React from 'react';
import { ShoppingBag, Search, Clock, Sparkles, Scale } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export default function Navbar({ searchTerm, setSearchTerm, ordersCount, onOpenAIAdvisor, onOpenCompare }) {
  const { cart, billingSummary, setIsCartOpen, setIsOrderHistoryOpen } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-200 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-600 shadow-lg shadow-brand-500/25 p-2.5">
              <img src="/elrics-logo.png" alt="Elrics" className="w-full h-full object-contain filter invert brightness-0" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-black tracking-tight text-slate-900">ELRICS</span>
                <span className="px-2 py-0.5 text-xs font-black uppercase tracking-wider bg-brand-100 text-brand-800 rounded-lg">STORE</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold tracking-wide">Guided by Wisdom • Billing &amp; Coupon Engine</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, headphones, accessories..."
                className="w-full pl-12 pr-4 py-3 text-sm font-medium bg-slate-100/90 hover:bg-slate-100 focus:bg-white border-2 border-transparent focus:border-brand-500 rounded-2xl transition-all duration-200 outline-none text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-brand-500/10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-bold text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* AI Advisor Button */}
            <button
              onClick={onOpenAIAdvisor}
              className="flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-extrabold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border-2 border-indigo-200 shadow-sm"
              title="Ask NVIDIA AI Shopping Assistant"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">AI Advisor</span>
            </button>

            {/* Compare Button */}
            <button
              onClick={onOpenCompare}
              className="hidden lg:flex items-center space-x-1.5 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors border-2 border-slate-200"
              title="Compare two products with AI"
            >
              <Scale className="w-4 h-4 text-slate-500" />
              <span>Compare</span>
            </button>

            {/* Orders history */}
            <button
              onClick={() => setIsOrderHistoryOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors border-2 border-slate-200"
              title="View your orders"
            >
              <Clock className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Orders</span>
              {ordersCount > 0 && (
                <span className="px-2 py-0.5 bg-slate-200 text-slate-800 font-extrabold rounded-full text-xs">
                  {ordersCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center space-x-3 px-4 sm:px-5 py-3 bg-brand-600 hover:bg-brand-700 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-brand-600/30 transition-all duration-200"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-slate-950 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-brand-600 animate-pulse">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-bold text-brand-100 uppercase tracking-wider leading-none">Cart</span>
                <span className="text-base font-black leading-tight">
                  {billingSummary.total > 0 ? formatCurrency(billingSummary.total) : '₹0'}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
