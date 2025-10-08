import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeContextType, ThemeColors, lightTheme, darkTheme } from '../types/theme.types';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Check localStorage for saved theme preference
    const saved = localStorage.getItem('theme');
    if (saved) {
      return saved === 'dark';
    }
    // Default to light theme
    return false;
  });

  const colors: ThemeColors = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDark(prev => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  // Apply theme AND text color to document root SYNCHRONOUSLY
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove transitions temporarily for instant color change
    root.style.setProperty('transition', 'none', 'important');
    
    if (isDark) {
      root.classList.add('dark');
      // Aplicar color de texto INMEDIATAMENTE
      root.style.color = '#FFFFFF';
    } else {
      root.classList.remove('dark');
      // Aplicar color de texto INMEDIATAMENTE
      root.style.color = '#000000';
    }
    
    // Force reflow to ensure styles are applied immediately
    void root.offsetHeight;
    
    // Re-enable transitions after a frame
    requestAnimationFrame(() => {
      root.style.removeProperty('transition');
    });
  }, [isDark]);

  const value: ThemeContextType = {
    isDark,
    toggleTheme,
    colors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};