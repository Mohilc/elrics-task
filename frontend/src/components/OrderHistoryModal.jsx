import React, { useEffect, useState } from 'react';
import { X, Clock, Package, ChevronRight, Eye } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-brand-100 text-brand-700 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Your Orders</h3>
              <p className="text-xs text-slate-500 font-medium">History of purchases and invoices</p>
            </div>
          </div>
          <button
            onClick={() => setIsOrderHistoryOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No orders placed yet</p>
              <p className="text-xs text-slate-400 mt-1">Add items to cart and complete checkout to see them here.</p>
            </div>
          ) : (
            orders.map(order => (
              <div
                key={order.orderId}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-brand-500/40 hover:shadow-md transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-brand-700">{order.orderId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {order.status || 'Confirmed'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {formatDate(order.createdAt)} • {order.items ? order.items.length : 0} items
                  </p>
                  <p className="text-xs font-black text-slate-900 mt-1">
                    Total: {formatCurrency(order.total)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewReceipt(order)}
                  className="px-3 py-1.5 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 text-brand-700 font-bold text-xs rounded-xl flex items-center space-x-1 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

