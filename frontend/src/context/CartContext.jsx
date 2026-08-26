import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0, itemCount: 0 });
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data.cart);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function addItem(productId, { size, color, quantity = 1 } = {}) {
    const res = await api.post('/cart', { productId, size, color, quantity });
    setCart(res.data.cart);
    return res.data.cart;
  }

  async function updateItem(itemId, quantity) {
    const res = await api.put(`/cart/${itemId}`, { quantity });
    setCart(res.data.cart);
  }

  async function removeItem(itemId) {
    const res = await api.delete(`/cart/${itemId}`);
    setCart(res.data.cart);
  }

  async function clearCart() {
    const res = await api.delete('/cart');
    setCart(res.data.cart);
  }

  return (
    <CartContext.Provider value={{ cart, loading, refresh, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
