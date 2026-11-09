import React, { useEffect, useState } from 'react';
import { X, Clock, Package, Eye, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function OrderHistoryModal() {
  const { isOrderHistoryOpen, setIsOrderHistoryOpen, setLastPlacedOrder, setIsReceiptOpen } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOrderHistoryOpen) {
      setLoading(true);
      api.getOrders()
        .then(res => {
          if (res.success && res.data) {
            setOrders(res.data);
          }
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOrderHistoryOpen]);

  if (!isOrderHistoryOpen) return null;

  const handleViewReceipt = (order) => {
    setLastPlacedOrder(order);
    setIsOrderHistoryOpen(false);
    setIsReceiptOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border-2 border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-5 bg-slate-50 border-b-2 border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-brand-100 text-brand-700 rounded-2xl shadow-sm">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Your Orders &amp; Invoices</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold">Track previous purchases and download receipts</p>
            </div>
          </div>
          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400 font-bold">
              Loading your orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Package className="w-16 h-16 mx-auto mb-3 text-slate-300" />
              <p className="text-base font-black text-slate-800">No orders placed yet</p>
              <p className="text-sm text-slate-500 mt-1">Add items to cart or click <b>⚡ Buy Now</b> to place an order.</p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.orderId}
                className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 hover:border-brand-500/50 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2.5">
                    <span className="font-mono font-black text-sm text-brand-700">{order.orderId}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {order.status || 'Confirmed'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                    {formatDate(order.createdAt)} • {order.items ? order.items.length : 0} items
                  </p>
                  <p className="text-base font-black text-slate-900 mt-1.5">
                    Total: {formatCurrency(order.total)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewReceipt(order)}
                  className="px-4 py-2.5 bg-white hover:bg-brand-50 border-2 border-slate-300 hover:border-brand-500 text-brand-700 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-sm self-start sm:self-auto"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Full Receipt</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
