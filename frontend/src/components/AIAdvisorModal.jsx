import React, { useState } from 'react';
import { X, Sparkles, Send, ShoppingBag, Loader2, Tag, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

const PRESET_QUERIES = [
  'How can I get FREE delivery on my cart?',
  'Best 3 accessories to activate the BUY2GET1 free deal?',
  'Recommend ANC headphones vs wireless earbuds for daily commute',
  'Best workspace computing setup under ₹10,000'
];

export default function AIAdvisorModal({ isOpen, onClose }) {
  const { cart, addToCart, addToast } = useCart();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  if (!isOpen) return null;

  const handleAsk = async (textToAsk) => {
    const q = textToAsk || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const itemsPayload = cart.map(item => ({
        product: item.product,
        quantity: item.quantity
      }));

      const res = await api.getAiRecommendations(q, itemsPayload);
      if (res.success && res.data) {
        setResponse(res.data);
      }
    } catch (err) {
      addToast('AI Assistant error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 relative flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-brand-500/30 border border-brand-400/40 rounded-xl backdrop-blur-md">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black tracking-tight">Elrics NVIDIA AI Shopping Advisor</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase">
                  DiffusionGemma
                </span>
              </div>
              <p className="text-xs text-brand-200 font-normal">Personalized product recommendations &amp; coupon strategies</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat / Recommendation Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Preset queries */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Popular Questions &amp; Deal Tips:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_QUERIES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(preset);
                    handleAsk(preset);
                  }}
                  className="text-left text-xs bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 border border-slate-200/80 px-3 py-1.5 rounded-xl transition-colors text-slate-700"
                >
                  💡 {preset}
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Box */}
          {response && (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-brand-700 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Advisor Insight</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Powered by {response.modelUsed}
                </span>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {response.aiAnalysis}
              </div>

              {/* Recommended Products grid */}
              {response.recommendedProducts && response.recommendedProducts.length > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-900 block">Recommended for you:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {response.recommendedProducts.map(prod => (
                      <div
                        key={prod.id || prod._id}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2 overflow-hidden pr-2">
                          <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                          <div className="truncate">
                            <span className="font-bold text-xs text-slate-800 block truncate">{prod.name}</span>
                            <span className="text-[11px] font-black text-brand-700">{formatCurrency(prod.price)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => addToCart(prod, 1)}
                          className="px-2.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="py-8 text-center text-xs text-brand-700 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
              <span className="font-semibold">NVIDIA AI is reasoning over the catalog &amp; billing rules...</span>
            </div>
          )}
        </div>

        {/* Query Input */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything: 'Suggest noise cancelling audio', 'How to save ₹500?'"
              className="flex-1 px-4 py-2.5 bg-white border border-slate-200 focus:border-brand-500 rounded-xl text-xs outline-none"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

