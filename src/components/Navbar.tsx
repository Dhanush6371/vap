// File: src/components/Navbar.tsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ShoppingCart } from "lucide-react";

const Navbar = () => {
  const { totalItems } = useCart();
  const { pathname } = useLocation();

  return (
    <nav className="bg-[#2A9D8F] text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">OrderIn</Link>
        <div className="flex items-center space-x-6">
          <Link to="/" className={pathname === "/" ? "underline" : ""}>Menu</Link>
          <Link to="/orders" className={pathname === "/orders" ? "underline" : ""}>Orders</Link>
          <Link to="/cart" className="relative flex items-center">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs font-bold rounded-full px-1">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;




