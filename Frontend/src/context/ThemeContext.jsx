// ============================================
// Frontend/src/context/ThemeContext.jsx - FIXED VERSION
// ============================================
import { createContext, useState, useEffect, useCallback } from "react";

export const ThemeContext = createContext(undefined);

const THEMES = {
  LIGHT: "light",
  DARK: "dark",
};

const STORAGE_KEY = "theme";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY);
      console.log('🎨 Initial theme from localStorage:', savedTheme);
      
      if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
        return savedTheme;
      }

      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return THEMES.DARK;
      }

      return THEMES.LIGHT;
    } catch (error) {
      console.error("❌ Error initializing theme:", error);
      return THEMES.LIGHT;
    }
  });

  // Apply theme to DOM - ⭐ FIXED VERSION
  useEffect(() => {
    try {
      const root = window.document.documentElement;
      
      // ⭐ KEY FIX: Only toggle 'dark' class, not 'light'
      if (theme === THEMES.DARK) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Set data attribute for additional styling hooks
      root.setAttribute("data-theme", theme);
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, theme);
      
      console.log('✅ Theme applied:', {
        theme,
        hasDarkClass: root.classList.contains('dark'),
        allClasses: root.className,
        localStorage: localStorage.getItem(STORAGE_KEY)
      });
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent("themeChange", { detail: { theme } }));
    } catch (error) {
      console.error("❌ Error applying theme:", error);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e) => {
        const hasManualPreference = localStorage.getItem(STORAGE_KEY);
        if (!hasManualPreference) {
          setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      }
    } catch (error) {
      console.error("❌ Error setting up system theme listener:", error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    console.log('🔄 Toggling theme from:', theme);
    setTheme((prevTheme) => {
      const newTheme = prevTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
      console.log('🔄 New theme:', newTheme);
      return newTheme;
    });
  }, [theme]);

  const setLightTheme = useCallback(() => {
    console.log('☀️ Setting light theme');
    setTheme(THEMES.LIGHT);
  }, []);

  const setDarkTheme = useCallback(() => {
    console.log('🌙 Setting dark theme');
    setTheme(THEMES.DARK);
  }, []);

  const setSystemTheme = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? THEMES.DARK : THEMES.LIGHT);
    } catch (error) {
      console.error("❌ Error setting system theme:", error);
    }
  }, []);

  const value = {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    isDark: theme === THEMES.DARK,
    isLight: theme === THEMES.LIGHT,
    themes: THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};