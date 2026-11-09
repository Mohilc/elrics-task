import React from 'react';
import { Tag, Sparkles, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Banner({ onSelectCoupon }) {
  const { applyCoupon } = useCart();

  return (
    <div className="bg-gradient-to-r from-slate-950 via-brand-950 to-indigo-950 text-white py-3 px-4 text-xs sm:text-sm font-semibold border-b border-brand-900/60 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <span className="flex items-center px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
            🔥 Exclusive Deals
          </span>
          <span className="hidden sm:inline text-slate-200">
            Use code <span className="font-extrabold text-amber-300 underline cursor-pointer hover:text-white" onClick={() => applyCoupon('WELCOME10')}>WELCOME10</span> for 10% off (min ₹1,000)
          </span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline text-slate-200">
            Buy 2 Get 1 Free on Accessories with <span className="font-extrabold text-amber-300 underline cursor-pointer hover:text-white" onClick={() => applyCoupon('BUY2GET1')}>BUY2GET1</span>
          </span>
        </div>

        <div className="flex items-center space-x-4 text-slate-200">
          <div className="flex items-center space-x-1.5 font-bold">
            <Truck className="w-4 h-4 text-brand-400" />
            <span>Free Shipping Above ₹999</span>
          </div>
          <button
            onClick={() => onSelectCoupon && onSelectCoupon()}
            className="flex items-center space-x-1 text-brand-300 hover:text-white font-extrabold transition-colors underline"
          >
            <span>View Coupons</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
