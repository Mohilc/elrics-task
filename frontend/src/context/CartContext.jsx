import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('elrics_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCouponCode, setAppliedCouponCode] = useState(() => {
    try {
      return localStorage.getItem('elrics_coupon') || null;
    } catch {
      return null;
    }
  });

  const [couponWarning, setCouponWarning] = useState(null);
  const [billingSummary, setBillingSummary] = useState({
    subtotal: 0,
    itemCount: 0,
    discount: 0,
    taxableAmount: 0,
    gstRate: 18,
    gst: 0,
    shippingFee: 0,
    isFreeShipping: false,
    shippingReason: '',
    total: 0,
    appliedCoupon: null,
    savings: 0,
    freeShipThreshold: 999,
    amountNeededForFreeShipping: 999
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Toast helper
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('elrics_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (appliedCouponCode) {
        localStorage.setItem('elrics_coupon', appliedCouponCode);
      } else {
        localStorage.removeItem('elrics_coupon');
      }
    } catch (e) {
      console.error(e);
    }
  }, [appliedCouponCode]);

  // Recompute billing whenever cart or coupon changes
  const refreshBilling = useCallback(async (currentCart, couponCode) => {
    if (!currentCart || currentCart.length === 0) {
      setBillingSummary({
        subtotal: 0,
        itemCount: 0,
        discount: 0,
        taxableAmount: 0,
        gstRate: 18,
        gst: 0,
        shippingFee: 0,
        isFreeShipping: false,
        shippingReason: 'Your cart is empty',
        total: 0,
        appliedCoupon: null,
        savings: 0,
        freeShipThreshold: 999,
        amountNeededForFreeShipping: 999
      });
      setCouponWarning(null);
      return;
    }

    try {
      const itemsPayload = currentCart.map(item => ({
        productId: item.product.id || item.product._id,
        quantity: item.quantity
      }));

      const res = await api.calculateBilling(itemsPayload, couponCode);
      if (res.success && res.data) {
        setBillingSummary(res.data);
        if (res.data.couponWarning) {
          setCouponWarning(res.data.couponWarning);
          addToast(`Coupon alert: ${res.data.couponWarning}`, 'warning');
          // If coupon rule failed on item removal, clear the coupon
          setAppliedCouponCode(null);
        } else {
          setCouponWarning(null);
        }
      }
    } catch (err) {
      console.error('Billing refresh error:', err);
    }
  }, [addToast]);

  useEffect(() => {
    refreshBilling(cart, appliedCouponCode);
  }, [cart, appliedCouponCode, refreshBilling]);

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);

    setCart(prev => {
      const existingIndex = prev.findIndex(item => (item.product.id || item.product._id) === (product.id || product._id));
      if (existingIndex > -1) {
        const existingItem = prev[existingIndex];
        const newTotalQty = existingItem.quantity + qtyToAdd;
        if (newTotalQty > product.stock) {
          addToast(`Cannot add ${qtyToAdd} more. Maximum available stock is ${product.stock}.`, 'warning');
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...existingItem,
          quantity: newTotalQty
        };
        addToast(`Updated ${product.name} quantity to ${newTotalQty}`, 'success');
        return updated;
      } else {
        if (qtyToAdd > product.stock) {
          addToast(`Cannot add. Only ${product.stock} items left in stock.`, 'warning');
          return prev;
        }
        addToast(`Added ${product.name} to cart`, 'success');
        return [...prev, { product, quantity: qtyToAdd }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    const qty = parseInt(newQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => {
      return prev.map(item => {
        const pId = item.product.id || item.product._id;
        if (pId === productId) {
          if (qty > item.product.stock) {
            addToast(`Only ${item.product.stock} units available in stock.`, 'warning');
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity: qty };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const filtered = prev.filter(item => (item.product.id || item.product._id) !== productId);
      addToast('Item removed from cart', 'info');
      return filtered;
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCouponCode(null);
    setCouponWarning(null);
    addToast('Shopping cart cleared', 'info');
  };

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      addToast('Please enter a coupon code', 'warning');
      return false;
    }

    if (cart.length === 0) {
      addToast('Your cart is empty. Add items first to apply coupons.', 'warning');
      return false;
    }

    const cleanCode = code.trim().toUpperCase();

    try {
      const itemsPayload = cart.map(item => ({
        product: item.product,
        quantity: item.quantity
      }));

      const res = await api.validateCoupon(cleanCode, itemsPayload);
      if (res.success && res.data) {
        setAppliedCouponCode(cleanCode);
        setCouponWarning(null);
        addToast(`Coupon "${cleanCode}" applied! You saved ₹${res.data.discount}`, 'success');
        return true;
      }
    } catch (err) {
      addToast(err.message, 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    const prev = appliedCouponCode;
    setAppliedCouponCode(null);
    setCouponWarning(null);
    if (prev) {
      addToast(`Coupon ${prev} removed`, 'info');
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCouponCode,
        applyCoupon,
        removeCoupon,
        couponWarning,
        billingSummary,
        refreshBilling,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        lastPlacedOrder,
        setLastPlacedOrder,
        isReceiptOpen,
        setIsReceiptOpen,
        isOrderHistoryOpen,
        setIsOrderHistoryOpen,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

