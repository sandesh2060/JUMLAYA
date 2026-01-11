// ============================================
// Frontend/src/main.jsx - WITH SCROLL TO TOP
// ============================================
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ✅ IMPORT i18n FIRST - BEFORE EVERYTHING
import "./i18n";
import "./index.css";
import App from "./App";
import "leaflet/dist/leaflet.css";

// ✅ Import ScrollToTop component
import ScrollToTop from "./components/ScrollToTop";

// Context Providers
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { StoreProvider } from "@/context/StoreContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { NotificationProvider } from "@/context/NotificationContext";

console.log("🔧 Environment Variables:", {
  API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* ✅ Add ScrollToTop here - inside BrowserRouter */}
      <ScrollToTop />
      
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <StoreProvider>
                <CartProvider>
                  <WishlistProvider>
                    <App />
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 900,
                        style: {
                          background: "var(--toast-bg, #fff)",
                          color: "var(--toast-color, #000)",
                          marginTop: "40px",
                        },
                        success: {
                          duration: 1300,
                          iconTheme: {
                            primary: "#10b981",
                            secondary: "#fff",
                          },
                        },
                        error: {
                          duration: 4000,
                          iconTheme: {
                            primary: "#ef4444",
                            secondary: "#fff",
                          },
                        },
                      }}
                    />
                  </WishlistProvider>
                </CartProvider>
              </StoreProvider>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);