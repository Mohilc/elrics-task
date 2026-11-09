import React, { useState } from 'react';
import { ShoppingCart, Star, Plus, Minus, Check, Sparkles, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export default function ProductCard({ product, onOpenDetail }) {
  const { cart, addToCart, setIsCheckoutOpen } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = cart.find(item => (item.product.id || item.product._id) === (product.id || product._id));
  const currentInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = Math.max(0, product.stock - currentInCart);
  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = remainingStock <= 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock || isMaxInCart) return;
    addToCart(product, selectedQty);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
    setSelectedQty(1);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    if (isOutOfStock || isMaxInCart) return;
    addToCart(product, selectedQty);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(product)}
      className="group relative flex flex-col bg-white rounded-3xl border-2 border-slate-200/90 hover:border-brand-500 hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Top Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.badge && (
          <span className="px-3.5 py-1.5 text-xs font-black uppercase tracking-wider rounded-xl bg-slate-900 text-white shadow-md">
            {product.badge}
          </span>
        )}
        {product.isAccessory && (
          <span className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BUY2GET1 Offer</span>
          </span>
        )}
      </div>

      {/* Stock indicator badge */}
      <div className="absolute top-4 right-4 z-10">
        {isOutOfStock ? (
          <span className="px-3 py-1.5 text-xs font-black rounded-xl bg-rose-100 text-rose-800 border border-rose-300">
            Out of Stock
          </span>
        ) : remainingStock <= 3 ? (
          <span className="px-3 py-1.5 text-xs font-black rounded-xl bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            Only {remainingStock} left!
          </span>
        ) : (
          <span className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
            Stock: {product.stock}
          </span>
        )}
      </div>

      {/* Product Image */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-extrabold uppercase tracking-wider text-brand-700 bg-brand-100/80 px-2.5 py-1 rounded-lg text-xs">
            {product.category}
          </span>
          <div className="flex items-center space-x-1 text-amber-500 font-bold text-sm">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-slate-900 font-extrabold">{product.rating || 4.5}</span>
            <span className="text-slate-400 font-medium">({product.reviewsCount || 42})</span>
          </div>
        </div>

        <h3 className="font-extrabold text-slate-900 text-lg leading-snug line-clamp-1 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>

        <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed flex-1 font-normal">
          {product.description}
        </p>

        {/* Pricing */}
        <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-baseline justify-between">
          <div>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-wider block">Price</span>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(product.price)}
            </div>
          </div>
          {currentInCart > 0 && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg">
              {currentInCart} in cart
            </span>
          )}
        </div>

        {/* Action Buttons: Add to Cart & Buy Now */}
        <div className="mt-5 flex flex-col gap-2.5" onClick={(e) => e.stopPropagation()}>
          
          <div className="flex items-center gap-2">
            {!isOutOfStock && !isMaxInCart && remainingStock > 1 && (
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                  disabled={selectedQty <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-extrabold text-slate-900">
                  {selectedQty}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedQty(Math.min(remainingStock, selectedQty + 1))}
                  className="w-8 h-8 flex items-center justify-center font-bold text-slate-700 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                  disabled={selectedQty >= remainingStock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Add to Cart button */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock || isMaxInCart}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : isMaxInCart
                  ? 'bg-amber-50 text-amber-800 border border-amber-300 cursor-not-allowed'
                  : justAdded
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white hover:bg-slate-50 active:scale-95 text-slate-900 border-2 border-slate-900 shadow-sm'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 animate-bounce" />
                  <span>Added!</span>
                </>
              ) : isOutOfStock ? (
                <span>Out of Stock</span>
              ) : isMaxInCart ? (
                <span>Max in Cart</span>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>

          {/* Direct Buy Now button */}
          {!isOutOfStock && !isMaxInCart && (
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-black text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 active:scale-[0.98] shadow-lg shadow-brand-500/25 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-current" />
              <span>Buy Now • Direct Order</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
