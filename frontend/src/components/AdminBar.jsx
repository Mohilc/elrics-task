import React, { useEffect, useState } from 'react';
import { Database, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

export default function AdminBar({ onDataReset }) {
  const { addToast } = useCart();
  const [status, setStatus] = useState(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    api.getSystemStatus()
      .then(res => setStatus(res))
      .catch(() => setStatus(null));
  }, []);

  const handleReset = async () => {
    if (!window.confirm('Reset all product stocks, coupons, and orders to initial seed state?')) return;
    setResetting(true);
    try {
      await api.resetStore();
      addToast('System reset to initial seed state!', 'success');
      if (onDataReset) onDataReset();
    } catch (err) {
      addToast('Failed to reset store: ' + err.message, 'error');
    } finally {
      setResetting(false);
    }
  };

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300 py-3 px-4 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Backend & DB Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">Engine:</span>
            <span className="text-slate-400">Node/Express (Port 5000)</span>
          </div>

          <span className="text-slate-700">•</span>

          <div className="flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-brand-400" />
            <span className="text-slate-300 font-medium">
              {status?.database?.type === 'mongodb' ? 'MongoDB' : 'In-Memory Store (Zero-Config)'}
            </span>
          </div>

          <span className="text-slate-700 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">GST: 18% | Free Shipping &gt; ₹999</span>
        </div>

        {/* Right: Quick Reset for Testing */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
          >
            <RotateCcw className={`w-3 h-3 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </footer>
  );
}

