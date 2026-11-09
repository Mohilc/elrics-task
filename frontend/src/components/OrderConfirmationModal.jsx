import React from 'react';
import { CheckCircle, Printer, ArrowRight, Package, Calendar, User, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function OrderConfirmationModal() {
  const { lastPlacedOrder, isReceiptOpen, setIsReceiptOpen } = useCart();

  if (!isReceiptOpen || !lastPlacedOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Order Confirmed!</h2>
          <p className="text-xs text-emerald-100 font-medium mt-1">
            Thank you for shopping with Elrics Store. Your order is being processed.
          </p>
          <div className="inline-block mt-3 px-3 py-1 bg-black/20 rounded-full text-xs font-mono font-bold tracking-wider">
            Order ID: {lastPlacedOrder.orderId}
          </div>

          {/* Delivery Status Stepper */}
          <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between max-w-sm mx-auto text-[11px] font-bold">
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-white text-emerald-700 flex items-center justify-center text-[10px] mb-1">✓</span>
              <span>Confirmed</span>
            </div>
            <div className="h-0.5 flex-1 bg-white/40 mx-2 -mt-4" />
            <div className="flex flex-col items-center">
              <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-900 flex items-center justify-center text-[10px] mb-1 animate-pulse">●</span>
              <span>Packing</span>
            </div>
            <div className="h-0.5 flex-1 bg-white/20 mx-2 -mt-4" />
            <div className="flex flex-col items-center opacity-60">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] mb-1">○</span>
              <span>Shipped</span>
            </div>
            <div className="h-0.5 flex-1 bg-white/20 mx-2 -mt-4" />
            <div className="flex flex-col items-center opacity-60">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] mb-1">○</span>
              <span>Delivery</span>
            </div>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-6">
          
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Order Date</span>
              <span className="font-bold text-slate-800">
                {formatDate(lastPlacedOrder.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Payment &amp; Delivery</span>
              <span className="font-bold text-slate-800">
                Cash / Card on Delivery
              </span>
            </div>
            <div className="col-span-2 pt-2">
              <span className="text-slate-400 block font-medium">Shipping Address</span>
              <span className="font-bold text-slate-800">
                {lastPlacedOrder.customer.name} • {lastPlacedOrder.customer.address}, {lastPlacedOrder.customer.city} {lastPlacedOrder.customer.postalCode}
              </span>
            </div>
          </div>

          {/* Items breakdown */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
              Items Ordered ({lastPlacedOrder.items.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {lastPlacedOrder.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-50">
                  <div className="flex-1 pr-2">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="text-slate-400 block text-[11px]">
                      {formatCurrency(item.price)} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-900">
                    {formatCurrency(item.itemTotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Billing computation receipt */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(lastPlacedOrder.subtotal)}
              </span>
            </div>

            {lastPlacedOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Discount ({lastPlacedOrder.coupon ? lastPlacedOrder.coupon.code : ''})</span>
                <span>-{formatCurrency(lastPlacedOrder.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600">
              <span>GST (18% on Taxable Amount)</span>
              <span className="font-semibold text-slate-900">
                {formatCurrency(lastPlacedOrder.gst)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Shipping Charges</span>
              <span className="font-semibold text-slate-900">
                {lastPlacedOrder.shipping === 0 ? 'FREE' : formatCurrency(lastPlacedOrder.shipping)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-base">
              <span>Total Paid</span>
              <span className="text-brand-700">{formatCurrency(lastPlacedOrder.total)}</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center space-x-3 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Invoice</span>
            </button>
            <button
              type="button"
              onClick={() => setIsReceiptOpen(false)}
              className="flex-1 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

