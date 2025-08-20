// File: src/pages/CartPage.tsx
import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Trash2 } from "lucide-react";

const BACKEND_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5173/api";

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateCartItem, cartTotal, tableNum, lockTable, releaseTable, addOrder } = useCart();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [paymentDone, setPaymentDone] = useState(false);
  const navigate = useNavigate();

  // 🔹 Require login
  useEffect(() => {
    if (!localStorage.getItem("sessionToken")) {
      alert("⚠️ Please login before ordering.");
      navigate("/login");
    }
  }, [navigate]);

  const handleLockAndCheckout = async () => {
    let currentTable = tableNum || localStorage.getItem("tableNum");
    if (!currentTable) {
      const promptTable = prompt("Enter Table Number from QR");
      if (!promptTable) return alert("Table number required!");
      currentTable = promptTable;
      localStorage.setItem("tableNum", currentTable);
    }
    const locked = await lockTable(currentTable);
    if (!locked) return alert("⚠️ Table already in use.");
    console.log("Mock payment processed for amount:", cartTotal);
    setPaymentDone(true);
    alert("✅ Payment successful!");
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return alert("Your cart is empty.");
    setLoading(true);
    try {
      const finalTable = tableNum || localStorage.getItem("tableNum")!;
      await addOrder({ tableNum: finalTable, dishes: cartItems, total: cartTotal.toFixed(2), orderTime: new Date().toISOString(), feedback });
      localStorage.removeItem("tableNum");
      alert("✅ Order placed!");
      navigate("/");
    } catch (err) {
      alert("❌ Failed to place order.");
    } finally { setLoading(false); }
  };

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-[#E8F3F1] flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-gray-600">Your cart is empty</h2>
          <Link to="/" className="mt-4 inline-block px-4 py-2 bg-[#2A9D8F] text-white rounded">Go to Menu</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E8F3F1] flex flex-col">
      <Navbar />
      <div className="flex-grow p-4 space-y-4">
        {cartItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow flex items-center">
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
            <div className="ml-4 flex-1">
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-[#2A9D8F] font-bold">${parseFloat(item.price as string).toFixed(2)}</p>
              <div className="flex items-center mt-2">
                <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => updateCartItem(item.id, item.quantity - 1)}>-</button>
                <span className="px-3">{item.quantity}</span>
                <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => updateCartItem(item.id, item.quantity + 1)}>+</button>
              </div>
            </div>
            <button className="ml-4 text-red-500" onClick={() => removeFromCart(item.id)}><Trash2 /></button>
          </div>
        ))}

        {/* Total */}
        <div className="bg-white p-4 rounded-lg shadow flex justify-between">
          <span>Total:</span>
          <span className="font-bold text-[#2A9D8F]">${cartTotal.toFixed(2)}</span>
        </div>

        {!paymentDone ? (
          <button onClick={handleLockAndCheckout} className="w-full bg-[#2A9D8F] text-white py-3 rounded hover:bg-[#22867a]">Proceed to Payment</button>
        ) : (
          <>
            <textarea placeholder="Leave feedback" value={feedback} onChange={e => setFeedback(e.target.value)} className="w-full p-3 border rounded" />
            <button onClick={handlePlaceOrder} disabled={loading} className="w-full bg-[#2A9D8F] text-white py-3 rounded mt-2 disabled:opacity-50">
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
