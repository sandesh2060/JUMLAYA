// ============================================
// INDEX 2B: Frontend/src/hooks/useAuth.js
// Custom Hook for Auth Context
// ============================================
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  
  return context;
};

export default useAuth;