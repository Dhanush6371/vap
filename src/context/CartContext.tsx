import React, { createContext, useContext, useState, useEffect } from 'react';

// ====== Types ======
interface CartItem {
  id: number;
  name: string;
  price: string | number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  tableNum: string;
  dishes: CartItem[];
  total: string;
  orderTime: string;
  feedback?: string;
  status: 'completed' | 'preparing' | 'delivered';
}

interface CartContextType {
  cartItems: CartItem[];
  orders: Order[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateCartItem: (id: number, quantity: number) => void;
  clearCart: () => void;
  addOrder: (order: Omit<Order, 'id' | 'status'>) => Promise<void>;
  updateOrderFeedback: (orderId: string, feedback: string) => Promise<void>;
  totalItems: number;
  cartTotal: number;
  tableNum: string | null;
  lockTable: (tableNum: string) => Promise<boolean>;
  releaseTable: () => Promise<void>;
}

const CartContext = createContext<CartContextType>({} as CartContextType);
export const useCart = () => useContext(CartContext);

// ====== Backend URLs ======
const BACKEND_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [tableNum, setTableNum] = useState<string | null>(null);

  // ====== Load from session ======
  useEffect(() => {
    try {
      const savedCart = sessionStorage.getItem("cart");
      const savedOrders = sessionStorage.getItem("orders");
      const savedTable = sessionStorage.getItem("lockedTable");
      if (savedCart) setCartItems(JSON.parse(savedCart));
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedTable) setTableNum(savedTable);
    } catch (err) {
      console.error("Session restore error:", err);
    }
  }, []);

  // ====== Totals + persist ======
  useEffect(() => {
    const qty = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const total = cartItems.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
    setTotalItems(qty);
    setCartTotal(total);
    sessionStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    sessionStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (tableNum) sessionStorage.setItem("lockedTable", tableNum);
    else sessionStorage.removeItem("lockedTable");
  }, [tableNum]);

  // ====== Cart Functions ======
  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: number) => setCartItems(prev => prev.filter(i => i.id !== id));
  const updateCartItem = (id: number, qty: number) =>
    setCartItems(prev => qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  const clearCart = () => setCartItems([]);

  // ====== Backend Functions ======
  const lockTable = async (table: string): Promise<boolean> => {
    try {
      const res = await fetch(`${BACKEND_BASE}/lockTable`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table })
      });
      const data = await res.json();
      if (data.success) { setTableNum(table); return true; }
      return false;
    } catch (err) {
      console.error("Lock table error:", err);
      return false;
    }
  };

  const releaseTable = async () => {
    if (!tableNum) return;
    try {
      await fetch(`${BACKEND_BASE}/releaseTable`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: tableNum })
      });
    } catch (err) { console.error("Release error:", err); }
    setTableNum(null);
  };

  const addOrder = async (order: Omit<Order, 'id' | 'status'>) => {
    const res = await fetch(`${BACKEND_BASE}/orders`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });
    const saved = await res.json();
    if (!res.ok) throw new Error(saved.message || "Order save failed");
    setOrders(prev => [{ ...saved, status: "completed" }, ...prev]);
    clearCart();
    await releaseTable();
  };

  const updateOrderFeedback = async (orderId: string, feedback: string) => {
    await fetch(`${BACKEND_BASE}/feedback`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, feedback })
    });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, feedback } : o));
  };

  return (
    <CartContext.Provider value={{
      cartItems, orders, addToCart, removeFromCart, updateCartItem,
      clearCart, addOrder, updateOrderFeedback,
      totalItems, cartTotal, tableNum, lockTable, releaseTable
    }}>
      {children}
    </CartContext.Provider>
  );
};
