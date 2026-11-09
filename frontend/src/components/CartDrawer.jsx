import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Tag,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  Info
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export default function CartDrawer({ coupons = [] }) {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    appliedCouponCode,
    applyCoupon,
    removeCoupon,
    couponWarning,
    billingSummary,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [showCouponsList, setShowCouponsList] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || inputCoupon;
    if (!code) return;
    setIsApplying(true);
    await applyCoupon(code);
    setIsApplying(false);
    setInputCoupon('');
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Free shipping progress calculation
  const freeThreshold = billingSummary.freeShipThreshold || 999;
  const taxableAmount = billingSummary.taxableAmount || 0;
  const progressPercent = Math.min(100, Math.round((taxableAmount / freeThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-brand-100 text-brand-700 rounded-2xl shadow-sm">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Your Shopping Cart</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-bold">
                  {billingSummary.itemCount} {billingSummary.itemCount === 1 ? 'item' : 'items'} in cart
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 px-2 py-1 transition-colors"
                >
                  Clear Cart
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Bar */}
          {cart.length > 0 && (
            <div className="px-6 py-4 bg-gradient-to-r from-brand-50 to-indigo-50 border-b border-brand-100">
              <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-2">
                <div className="flex items-center space-x-2 text-brand-950">
                  <Truck className="w-4 h-4 text-brand-600" />
                  <span>
                    {billingSummary.isFreeShipping
                      ? '🎉 You unlocked FREE Delivery!'
                      : `Add ${formatCurrency(billingSummary.amountNeededForFreeShipping)} more for FREE Delivery`}
                  </span>
                </div>
                <span className="text-brand-700 font-extrabold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-brand-200/80 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Coupon Warning (re-validation notice) */}
          {couponWarning && (
            <div className="mx-6 mt-4 p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start space-x-3 text-xs sm:text-sm text-amber-900 font-medium">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold">Coupon Notice:</span> {couponWarning}
              </div>
            </div>
          )}

          {/* Scrollable Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
                  <ShoppingBag className="w-12 h-12" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Your cart is empty</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-xs leading-relaxed">
                  Browse products and click <b>Add to Cart</b> or use <b>⚡ Buy Now</b> to check out directly.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const prod = item.product;
                const pId = prod.id || prod._id;
                const isMax = item.quantity >= prod.stock;

                return (
                  <div
                    key={pId}
                    className="flex space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-colors"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl bg-white border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1 pr-2">
                            {prod.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(pId)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs font-bold text-brand-700">
                            {formatCurrency(prod.price)}
                          </span>
                          {prod.isAccessory && (
                            <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                              Accessory
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-slate-300 bg-white rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => updateQuantity(pId, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-bold text-sm"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-extrabold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(pId, item.quantity + 1)}
                            disabled={isMax}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors font-bold text-sm ${
                              isMax
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <span className="text-sm sm:text-base font-black text-slate-900">
                          {formatCurrency(prod.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Billing Summary */}
          {cart.length > 0 && (
            <div className="border-t border-slate-200 bg-white p-6 space-y-4 shadow-xl">
              
              {/* Coupon Engine Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <Tag className="w-4 h-4 text-brand-600" />
                    <span>Coupons &amp; Offers</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowCouponsList(!showCouponsList)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-800 underline"
                  >
                    {showCouponsList ? 'Hide Offers' : 'View Offers'}
                  </button>
                </div>

                {/* Applied Coupon Tag */}
                {appliedCouponCode ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl">
                    <div className="flex items-center space-x-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <span className="font-black text-sm text-emerald-950 tracking-wider">
                          {appliedCouponCode}
                        </span>
                        <span className="text-xs text-emerald-800 ml-2 font-bold">
                          Saved {formatCurrency(billingSummary.discount)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:text-rose-800 font-extrabold px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputCoupon}
                      onChange={(e) => setInputCoupon(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME10, BUY2GET1"
                      className="flex-1 px-4 py-2.5 text-xs font-extrabold uppercase bg-slate-50 border-2 border-slate-200 focus:border-brand-500 rounded-xl outline-none placeholder:normal-case placeholder:font-normal placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon()}
                      disabled={isApplying || !inputCoupon.trim()}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black rounded-xl transition-colors"
                    >
                      {isApplying ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                )}

                {/* Available Coupons Drawer */}
                {showCouponsList && (
                  <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl max-h-48 overflow-y-auto space-y-2">
                    {coupons.map((c) => {
                      const isCurrent = appliedCouponCode === c.code;
                      return (
                        <div
                          key={c.code}
                          className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs"
                        >
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-brand-700 text-sm">{c.code}</span>
                              <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md uppercase">
                                {c.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-1">{c.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleApplyCoupon(c.code)}
                            disabled={isCurrent}
                            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold ${
                              isCurrent
                                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                : 'bg-brand-50 hover:bg-brand-100 text-brand-700'
                            }`}
                          >
                            {isCurrent ? 'Applied' : 'Apply'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Exact Billing Engine Calculation Breakdown */}
              <div className="space-y-2.5 pt-3 border-t border-slate-200 text-sm">
                
                {/* 1. Subtotal */}
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>Subtotal ({billingSummary.itemCount} items)</span>
                  <span className="font-extrabold text-slate-900">
                    {formatCurrency(billingSummary.subtotal)}
                  </span>
                </div>

                {/* 2. Coupon Discount */}
                {billingSummary.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span className="flex items-center space-x-1.5">
                      <span>Coupon Discount</span>
                      {billingSummary.appliedCoupon && (
                        <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded uppercase font-black">
                          {billingSummary.appliedCoupon.code}
                        </span>
                      )}
                    </span>
                    <span className="font-extrabold">
                      -{formatCurrency(billingSummary.discount)}
                    </span>
                  </div>
                )}

                {/* 3. GST (18%) */}
                <div className="flex justify-between text-slate-700 font-medium">
                  <span>GST (18% on Taxable Net)</span>
                  <span className="font-extrabold text-slate-900">
                    {formatCurrency(billingSummary.gst)}
                  </span>
                </div>

                {/* 4. Shipping Charges */}
                <div className="flex justify-between text-slate-700 font-medium">
                  <span className="flex items-center space-x-1.5">
                    <span>Shipping Charges</span>
                    {billingSummary.isFreeShipping && (
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-black uppercase">
                        FREE
                      </span>
                    )}
                  </span>
                  <span className="font-extrabold">
                    {billingSummary.isFreeShipping ? (
                      <span className="text-emerald-700 font-black">₹0</span>
                    ) : (
                      formatCurrency(billingSummary.shippingFee)
                    )}
                  </span>
                </div>

                {/* 5. Final Payable Amount */}
                <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-black text-slate-900 block">Total Payable</span>
                    <p className="text-xs text-slate-400 font-medium">Inclusive of all taxes &amp; fees</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-brand-700">
                      {formatCurrency(billingSummary.total)}
                    </span>
                  </div>
                </div>

                {/* Total Savings Highlight */}
                {billingSummary.savings > 0 && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-center text-xs sm:text-sm font-extrabold border border-emerald-200">
                    🎉 You save {formatCurrency(billingSummary.savings)} on this order!
                  </div>
                )}
              </div>

              {/* Checkout CTA */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full py-4 bg-brand-600 hover:bg-brand-700 active:scale-[0.99] text-white font-black text-base rounded-2xl shadow-xl shadow-brand-600/35 flex items-center justify-center space-x-2 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
