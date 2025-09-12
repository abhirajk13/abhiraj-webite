import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === null) return true; // Default to dark mode
      
      // Try to parse as JSON first
      try {
        return JSON.parse(saved);
      } catch (jsonError) {
        // If JSON parsing fails, check for string values
        if (saved === 'dark' || saved === 'true') {
          return true;
        } else if (saved === 'light' || saved === 'false') {
          return false;
        } else {
          // If it's some other invalid value, clear it and default to dark
          localStorage.removeItem('theme');
          return true;
        }
      }
    } catch (error) {
      // If anything goes wrong, clear localStorage and default to dark
      console.warn('Theme localStorage error, resetting to dark mode:', error);
      localStorage.removeItem('theme');
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme', JSON.stringify(isDarkMode));
      document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [isDarkMode]);

  // Cleanup effect to ensure localStorage is properly formatted
  useEffect(() => {
    try {
      const current = localStorage.getItem('theme');
      if (current && !current.startsWith('{') && !current.startsWith('[') && current !== 'true' && current !== 'false') {
        // If it's not a proper JSON boolean, fix it
        localStorage.setItem('theme', JSON.stringify(isDarkMode));
      }
    } catch (error) {
      console.warn('Theme localStorage cleanup error:', error);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
