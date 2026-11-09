import React, { useState } from 'react';
import { X, Star, ShoppingCart, Shield, Truck, RotateCcw, Check, Sparkles, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatters';

export default function ProductDetailModal({ product, onClose }) {
  const { cart, addToCart, setIsCheckoutOpen } = useCart();
  const [selectedQty, setSelectedQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const cartItem = cart.find(item => (item.product.id || item.product._id) === (product.id || product._id));
  const currentInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = Math.max(0, product.stock - currentInCart);
  const isOutOfStock = product.stock <= 0;
  const isMaxInCart = remainingStock <= 0;

  const handleAdd = () => {
    if (isOutOfStock || isMaxInCart) return;
    addToCart(product, selectedQty);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 900);
  };

  const handleBuyNow = () => {
    if (isOutOfStock || isMaxInCart) return;
    addToCart(product, selectedQty);
    onClose();
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border-2 border-slate-200 overflow-hidden my-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto bg-slate-100 flex items-center justify-center overflow-hidden min-h-[300px]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {product.isAccessory && (
              <div className="absolute top-5 left-5">
                <span className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                  <Sparkles className="w-4 h-4" />
                  <span>BUY2GET1 Offer Eligible</span>
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center space-x-2.5 text-xs mb-3">
                <span className="px-3 py-1 rounded-lg bg-brand-100 text-brand-800 font-extrabold uppercase tracking-wider text-xs">
                  {product.category}
                </span>
                <div className="flex items-center space-x-1 text-amber-500 font-extrabold text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-slate-900">{product.rating || 4.5}</span>
                  <span className="text-slate-400 font-medium">({product.reviewsCount || 42} reviews)</span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                {product.name}
              </h2>

              <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed font-normal">
                {product.description}
              </p>

              {/* Guarantees */}
              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-xs text-slate-700 text-center font-bold">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <Truck className="w-5 h-5 mx-auto mb-1.5 text-brand-600" />
                  <span>Free Delivery &gt; ₹999</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <Shield className="w-5 h-5 mx-auto mb-1.5 text-emerald-600" />
                  <span>1-Year Warranty</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <RotateCcw className="w-5 h-5 mx-auto mb-1.5 text-indigo-600" />
                  <span>7-Day Return</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-5 border-t border-slate-200">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Price</span>
                  <div className="text-3xl font-black text-slate-900">
                    {formatCurrency(product.price)}
                  </div>
                </div>
                <div className="text-right">
                  {isOutOfStock ? (
                    <span className="text-sm font-extrabold text-rose-600">Out of Stock</span>
                  ) : remainingStock <= 3 ? (
                    <span className="text-sm font-extrabold text-amber-700 animate-pulse">
                      Only {remainingStock} left in stock!
                    </span>
                  ) : (
                    <span className="text-sm font-extrabold text-emerald-700">
                      ✓ In Stock ({product.stock} units)
                    </span>
                  )}
                </div>
              </div>

              {/* Dual Action Buttons */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {!isOutOfStock && !isMaxInCart && remainingStock > 1 && (
                    <div className="flex items-center border border-slate-300 bg-slate-100 rounded-xl p-1">
                      <button
                        onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                        disabled={selectedQty <= 1}
                        className="w-9 h-9 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded-lg transition-colors text-base"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-base font-extrabold text-slate-900">
                        {selectedQty}
                      </span>
                      <button
                        onClick={() => setSelectedQty(Math.min(remainingStock, selectedQty + 1))}
                        disabled={selectedQty >= remainingStock}
                        className="w-9 h-9 flex items-center justify-center font-bold text-slate-700 hover:bg-white rounded-lg transition-colors text-base"
                      >
                        +
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={isOutOfStock || isMaxInCart}
                    className={`flex-1 py-3.5 px-5 rounded-xl text-sm font-bold transition-all flex items-center justify-center space-x-2 ${
                      isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border'
                        : isMaxInCart
                        ? 'bg-amber-100 text-amber-800 cursor-not-allowed'
                        : justAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-900 active:scale-95'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-5 h-5 animate-bounce" />
                        <span>Added to Cart!</span>
                      </>
                    ) : isOutOfStock ? (
                      <span>Out of Stock</span>
                    ) : isMaxInCart ? (
                      <span>Max in Cart ({product.stock})</span>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>

                {!isOutOfStock && !isMaxInCart && (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full py-3.5 px-5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 active:scale-98 shadow-xl shadow-brand-500/30 flex items-center justify-center space-x-2 transition-all"
                  >
                    <Zap className="w-4 h-4 text-amber-300 fill-current" />
                    <span>Buy Now • Instant Checkout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
