import React, { useState, useEffect } from 'react';
import { X, Scale, Sparkles, ArrowRight, Check, ShoppingCart, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export default function CompareModal({ isOpen, onClose, allProducts = [], initialP1 = null, initialP2 = null }) {
  const { addToCart, addToast } = useCart();
  const [product1Id, setProduct1Id] = useState('');
  const [product2Id, setProduct2Id] = useState('');
  const [loading, setLoading] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  useEffect(() => {
    if (allProducts.length >= 2) {
      setProduct1Id(initialP1 ? (initialP1.id || initialP1._id) : (allProducts[0].id || allProducts[0]._id));
      setProduct2Id(initialP2 ? (initialP2.id || initialP2._id) : (allProducts[1].id || allProducts[1]._id));
    }
  }, [allProducts, initialP1, initialP2]);

  if (!isOpen) return null;

  const p1 = allProducts.find(p => (p.id || p._id) === product1Id);
  const p2 = allProducts.find(p => (p.id || p._id) === product2Id);

  const handleRunComparison = async () => {
    if (!product1Id || !product2Id) return;
    if (product1Id === product2Id) {
      addToast('Please select two different products to compare.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.compareProducts(product1Id, product2Id);
      if (res.success && res.data) {
        setComparisonResult(res.data);
      }
    } catch (err) {
      addToast('Comparison error: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-slate-900">NVIDIA AI Product Comparison</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                  Nemotron &amp; DiffusionGemma
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Compare specifications, value, and applicable coupon deals</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Product Selectors */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Product 1 Selector */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-600 block">Select Product A</label>
              <select
                value={product1Id}
                onChange={(e) => {
                  setProduct1Id(e.target.value);
                  setComparisonResult(null);
                }}
                className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-500 cursor-pointer"
              >
                {allProducts.map(p => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name} ({formatCurrency(p.price)})
                  </option>
                ))}
              </select>

              {p1 && (
                <div className="flex space-x-3 items-center pt-2">
                  <img src={p1.image} alt={p1.name} className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p1.name}</h4>
                    <span className="text-xs font-black text-brand-700">{formatCurrency(p1.price)}</span>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{p1.category} • {p1.rating}★</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product 2 Selector */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="text-xs font-bold text-slate-600 block">Select Product B</label>
              <select
                value={product2Id}
                onChange={(e) => {
                  setProduct2Id(e.target.value);
                  setComparisonResult(null);
                }}
                className="w-full text-xs font-semibold p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-500 cursor-pointer"
              >
                {allProducts.map(p => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name} ({formatCurrency(p.price)})
                  </option>
                ))}
              </select>

              {p2 && (
                <div className="flex space-x-3 items-center pt-2">
                  <img src={p2.image} alt={p2.name} className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p2.name}</h4>
                    <span className="text-xs font-black text-brand-700">{formatCurrency(p2.price)}</span>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{p2.category} • {p2.rating}★</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trigger Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleRunComparison}
              disabled={loading || product1Id === product2Id}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/25 transition-all inline-flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with NVIDIA AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate AI Comparison</span>
                </>
              )}
            </button>
          </div>

          {/* Comparison Output */}
          {comparisonResult && (
            <div className="p-6 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Comparative Analysis</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Model: {comparisonResult.modelUsed}
                </span>
              </div>

              <div className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {comparisonResult.comparison}
              </div>

              {/* Quick Add buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-3 justify-end">
                {p1 && (
                  <button
                    onClick={() => addToCart(p1, 1)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add {p1.name}</span>
                  </button>
                )}
                {p2 && (
                  <button
                    onClick={() => addToCart(p2, 1)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add {p2.name}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

