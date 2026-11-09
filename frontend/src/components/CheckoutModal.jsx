import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, ArrowLeft, Loader2, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import confetti from 'canvas-confetti';

export default function CheckoutModal({ onOrderPlaced }) {
  const {
    cart,
    appliedCouponCode,
    billingSummary,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setLastPlacedOrder,
    setIsReceiptOpen,
    addToast
  } = useCart();

  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isCheckoutOpen) return null;

  const handleFillDemo = () => {
    setCustomer({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      phone: '+91 98765 43210',
      address: 'Plot 42, Silicon Valley Avenue, Koramangala 4th Block',
      city: 'Bengaluru',
      postalCode: '560034'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!customer.name.trim() || !customer.email.trim() || !customer.address.trim()) {
      setError('Please fill out all required fields (Name, Email, Address).');
      return;
    }

    if (cart.length === 0) {
      setError('Cannot place order: your cart is empty.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        items: cart.map(item => ({
          productId: item.product.id || item.product._id,
          quantity: item.quantity
        })),
        couponCode: appliedCouponCode,
        customer
      };

      const res = await api.placeOrder(payload);
      if (res.success && res.data) {
        // Fire celebration confetti!
        try {
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {
          console.error(e);
        }

        setLastPlacedOrder(res.data);
        clearCart();
        setIsCheckoutOpen(false);
        setIsReceiptOpen(true);
        addToast(`Order ${res.data.orderId} placed successfully!`, 'success');
        if (onOrderPlaced) onOrderPlaced();
      }
    } catch (err) {
      setError(err.message || 'Failed to place order.');
      addToast(err.message || 'Order placement failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-xl font-black text-slate-900">Checkout &amp; Shipping</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">Enter delivery address and review order</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFillDemo}
            className="text-xs sm:text-sm font-black text-brand-700 bg-brand-100/90 hover:bg-brand-200 border border-brand-300 px-3.5 py-2 rounded-xl transition-colors shadow-sm"
          >
            ⚡ Auto-Fill Demo
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-sm font-bold text-rose-800">
              {error}
            </div>
          )}

          {/* Customer Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Rohan Sharma"
                className="w-full px-4 py-3 text-sm font-semibold bg-slate-50 border-2 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                placeholder="rohan@example.com"
                className="w-full px-4 py-3 text-sm font-semibold bg-slate-50 border-2 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-3 text-sm font-semibold bg-slate-50 border-2 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl outline-none transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">
                Street Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                placeholder="House / Flat No., Street, Landmark"
                className="w-full px-4 py-3 text-sm font-semibold bg-slate-50 border-2 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl outline-none resize-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">City</label>
              <input
                type="text"
                value={customer.city}
                onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                placeholder="Bengaluru"
                className="w-full px-4 py-3 text-sm font-semibold bg-slate-50 border-2 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-black text-slate-800 mb-1.5">Postal Code</label>
              <input
                type="text"
                value={customer.postalCode}
                onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                placeholder="560034"
                className="w-full px-4 py-3 text-sm font-semibold bg-slate-50 border-2 border-slate-200 focus:border-brand-500 focus:bg-white rounded-xl outline-none transition-colors"
              />
            </div>
          </div>

          {/* Order Summary Recap */}
          <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200/90 space-y-3 text-sm">
            <h4 className="font-black text-slate-900 uppercase tracking-wider text-xs">
              Order Summary ({billingSummary.itemCount} items)
            </h4>
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Subtotal</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(billingSummary.subtotal)}</span>
            </div>
            {billingSummary.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon ({appliedCouponCode})</span>
                <span>-{formatCurrency(billingSummary.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-700 font-medium">
              <span>GST (18% on Taxable Net)</span>
              <span className="font-extrabold text-slate-900">{formatCurrency(billingSummary.gst)}</span>
            </div>
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Delivery / Shipping</span>
              <span className="font-extrabold">{billingSummary.isFreeShipping ? 'FREE' : formatCurrency(billingSummary.shippingFee)}</span>
            </div>
            <div className="pt-3 border-t-2 border-slate-200 flex justify-between font-black text-slate-900 text-lg">
              <span>Total Payable</span>
              <span className="text-brand-700 text-2xl font-black">{formatCurrency(billingSummary.total)}</span>
            </div>
          </div>

          {/* Place Order CTA */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(false)}
              className="flex-1 py-3.5 px-4 border-2 border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl transition-colors"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-4 px-6 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 active:scale-[0.99] text-white font-black text-base rounded-2xl shadow-xl shadow-brand-600/35 flex items-center justify-center space-x-2 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Validating &amp; Placing Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Confirm &amp; Place Order ({formatCurrency(billingSummary.total)})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
