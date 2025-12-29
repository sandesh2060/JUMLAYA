// ============================================
// Frontend/src/main.jsx - WITH STOREPROVIDER ADDED
// ============================================
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './i18n' 
import './index.css'
import App from './App'
import 'leaflet/dist/leaflet.css' 

// Context Providers
import { ThemeProvider } from '@/context/ThemeContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { AuthProvider } from '@/context/AuthContext'
import { StoreProvider } from '@/context/StoreContext' // 🆕 ADD THIS
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { NotificationProvider } from '@/context/NotificationContext'

// Debug: Log environment variables
console.log('🔧 Environment Variables:', {
  API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            {/* 🆕 ADD STOREPROVIDER HERE - BEFORE CART & WISHLIST */}
            <StoreProvider>
              <NotificationProvider>
                <CartProvider>
                  <WishlistProvider>
                    <App />
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: 'var(--toast-bg, #fff)',
                          color: 'var(--toast-color, #000)',
                        },
                        success: {
                          duration: 3000,
                          iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                          },
                        },
                        error: {
                          duration: 4000,
                          iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                          },
                        },
                      }}
                    />
                  </WishlistProvider>
                </CartProvider>
              </NotificationProvider>
            </StoreProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);