import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, Star, Heart, Minus, Plus, ShoppingCart } from 'lucide-react';
import { loadMenuData } from '../pictures';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [menuData, setMenuData] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const { cartItems, addToCart, updateCartItem, tableNum, lockTable } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const [existingItem, setExistingItem] = useState(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showEdgeIndicator, setShowEdgeIndicator] = useState(true);
  const touchAreaRef = useRef(null);
  const inactivityTimer = useRef(null);
  const swipeThreshold = 100;

  useEffect(() => {
    const fetchData = async () => {
      const data = await loadMenuData();
      setMenuData(data);
      const foundItem = data.find(i => i.id === parseInt(id));
      setItem(foundItem);

      const cartItem = cartItems.find(item => item.id === parseInt(id));
      if (cartItem) {
        setExistingItem(cartItem);
        setQuantity(cartItem.quantity);
      } else {
        setExistingItem(null);
      }
    };
    fetchData();

    inactivityTimer.current = setTimeout(() => {
      setShowEdgeIndicator(false);
    }, 4000);

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [id, cartItems]);

  const resetInactivityTimer = () => {
    setShowEdgeIndicator(true);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setShowEdgeIndicator(false);
    }, 2000);
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
    resetInactivityTimer();
  };

  const handleAddToCart = async () => {
    if (!tableNum) {
      const tablePrompt = prompt("Enter your Table Number (from QR)");
      if (!tablePrompt) return alert("Table number required!");
      const locked = await lockTable(tablePrompt);
      if (!locked) {
        return alert("This table is already in use. Please contact staff.");
      }
    }

    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: quantity
    };

    if (existingItem) {
      updateCartItem(cartItem.id, cartItem.quantity);
    } else {
      addToCart(cartItem);
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
    resetInactivityTimer();
  };

  const navigateToItem = (direction) => {
    if (!menuData.length) return;
    const currentIndex = menuData.findIndex(i => i.id === parseInt(id));
    let newIndex = direction === 'next'
      ? (currentIndex + 1) % menuData.length
      : (currentIndex - 1 + menuData.length) % menuData.length;

    navigate(`/item/${menuData[newIndex].id}`, { replace: true });
    setQuantity(1);
    setIsSwiping(false);
    setCurrentX(0);
    resetInactivityTimer();
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
    setIsSwiping(true);
    resetInactivityTimer();
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const diff = e.touches[0].clientX - touchStartX;
    setCurrentX(diff);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    if (Math.abs(currentX) > swipeThreshold) {
      navigateToItem(currentX > 0 ? 'prev' : 'next');
    } else {
      setIsSwiping(false);
      setCurrentX(0);
    }
  };

  if (!item) return <div className="min-h-screen bg-[#E8F3F1] flex items-center justify-center">Loading...</div>;

  const totalPrice = (Number(item.price) * quantity).toFixed(2);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const transformStyle = isSwiping
    ? { transform: `translateX(${currentX}px)`, transition: 'none' }
    : { transform: 'translateX(0)', transition: 'transform 0.3s ease-out' };

  return (
    <div
      className="min-h-screen bg-[#E8F3F1] flex flex-col touch-pan-y"
      onClick={resetInactivityTimer}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      ref={touchAreaRef}
    >
      <Navbar />
      <div className="relative h-[30vh] sm:h-[40vh] overflow-hidden">
        <div className="w-full h-full" style={transformStyle}>
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
        </div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md"
        >
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl -mt-6 relative p-6 pb-24">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <div className="flex items-center gap-2 text-gray-500 mt-2">
              <Clock className="w-4 h-4" /> <span>20 min</span>
              <Star className="w-4 h-4 ml-2" /> <span>4.8</span>
            </div>
          </div>
          <button className="p-2 rounded-full bg-gray-100">
            <Heart className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <p className="text-gray-600 mt-4 mb-6">{item.desc}</p>

        <div className="flex items-center justify-center gap-4 my-6">
          <button onClick={() => handleQuantityChange(-1)} className="p-2 rounded-full bg-gray-100">
            <Minus className="w-5 h-5 text-[#2A9D8F]" />
          </button>
          <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
          <button onClick={() => handleQuantityChange(1)} className="p-2 rounded-full bg-gray-100">
            <Plus className="w-5 h-5 text-[#2A9D8F]" />
          </button>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
          <div className="flex justify-between items-center max-w-7xl mx-auto gap-4">
            <div>
              <span className="text-sm text-gray-500">Total Price</span>
              <span className="text-2xl font-bold">${totalPrice}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className={`px-6 py-3 rounded-lg font-medium text-white ${addedToCart ? 'bg-green-500' : 'bg-[#2A9D8F]'}`}
              >
                {addedToCart ? 'Added!' : existingItem ? 'Update Cart' : 'Add to Cart'}
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="border border-[#2A9D8F] text-[#2A9D8F] px-4 py-3 rounded-lg hover:bg-[#2A9D8F] hover:text-white"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;
