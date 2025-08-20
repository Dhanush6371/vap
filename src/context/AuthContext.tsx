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
  const [userPhone, setUserPhone] = useState<string | null>("mock-user");
  const isAuthenticated = true; // Always authenticated for console usage

  useEffect(() => {
    const saved = sessionStorage.getItem("userPhone");
    if (saved) setUserPhone(saved);
    else setUserPhone("mock-user"); // Default user for console
  }, []);

  useEffect(() => {
    if (userPhone) sessionStorage.setItem("userPhone", userPhone);
    else sessionStorage.removeItem("userPhone");
  }, [userPhone]);

  const requestOtp = async (phone: string) => {
    try {
      console.log("Mock OTP sent to:", phone);
      return true; // Always successful for console usage
    } catch (e) {
      console.error("requestOtp error:", e);
      return true;
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      console.log("Mock OTP verified for:", phone, "with OTP:", otp);
      setUserPhone(phone);
      localStorage.setItem("sessionToken", "mock-token");
      return true; // Always successful for console usage
    } catch (e) {
      console.error("verifyOtp error:", e);
      return true;
    }
  };

  const logout = () => {
    setUserPhone("mock-user");
    localStorage.removeItem("sessionToken");
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userPhone, requestOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
