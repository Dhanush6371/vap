// File: src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  userPhone: string | null;
  requestOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

const API = import.meta.env.VITE_API_BASE || "http://localhost:5173/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const isAuthenticated = !!userPhone;

  useEffect(() => {
    const saved = sessionStorage.getItem("userPhone");
    if (saved) setUserPhone(saved);
  }, []);

  useEffect(() => {
    if (userPhone) sessionStorage.setItem("userPhone", userPhone);
    else sessionStorage.removeItem("userPhone");
  }, [userPhone]);

  const requestOtp = async (phone: string) => {
    try {
      const res = await fetch(`${API}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      return res.ok;
    } catch (e) {
      console.error("requestOtp error:", e);
      return false;
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (res.ok && data?.success) {
        setUserPhone(phone);
        if (data.token) {
          localStorage.setItem("sessionToken", data.token);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error("verifyOtp error:", e);
      return false;
    }
  };

  const logout = () => {
    setUserPhone(null);
    localStorage.removeItem("sessionToken");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userPhone, requestOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
