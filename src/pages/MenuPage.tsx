import React, { useState, useEffect } from 'react';
import { loadMenuData } from '../pictures';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MenuPage = () => {
  const { cartItems, addToCart, tableNum, lockTable } = useCart();
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadMenuData();
      setMenu(data);
      setLoading(false);
    };
    fetchData();
const token = localStorage.getItem("sessionToken");
    if (!token) {
      navigate("/login");
    }
const token = localStorage.getItem("sessionToken");
  if (!token) {
    navigate("/login");
    return;
  };
  const params = new URLSearchParams(window.location.search);
  const table = params.get("table");
  if (table) {
    fetch(`${BACKEND_BASE}/lockTable`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table }),
    }).then(res => res.json())
      .then(data => {
        if (!data.success) {
          alert("Table already in use!");
          navigate("/login");
        } else {
          localStorage.setItem("tableNum", table);
        }
      });
  }
  }, []);

  const handleAdd = async (item) => {
    if (!tableNum) {
      const tablePrompt = prompt("Enter your Table Number (from QR)");
      if (!tablePrompt) return alert("Table number required!");
      const locked = await lockTable(tablePrompt);
      if (!locked) {
        return alert("This table is already in use. Please contact staff.");
      }
    }
    addToCart({ ...item, quantity: 1 });
    alert(`${item.name} added to cart`);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#E8F3F1] flex items-center justify-center">Loading menu...</div>;
  }

  return (
    <div className="min-h-screen bg-[#E8F3F1] flex flex-col">
      <Navbar />
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menu.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden">
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4 flex flex-col">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-gray-500">${parseFloat(item.price).toFixed(2)}</p>
              <button
                onClick={() => handleAdd(item)}
                className="mt-2 flex items-center justify-center gap-2 bg-[#2A9D8F] text-white px-4 py-2 rounded hover:bg-[#22867a]"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
