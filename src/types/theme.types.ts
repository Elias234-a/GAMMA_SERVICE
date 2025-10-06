export interface ThemeColors {
  text: {
    primary: string;
    secondary: string;
    accent: string;
  };
  background: {
    primary: string;
    secondary: string;
    glass: string;
    grid: string;
  };
  border: string;
  shadow: string;
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

export const lightTheme: ThemeColors = {
  text: {
    primary: '#000000',
    secondary: '#374151',
    accent: '#3B82F6'
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    glass: 'rgba(255, 255, 255, 0.1)',
    grid: `linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
           linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)`
  },
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)'
};

export const darkTheme: ThemeColors = {
  text: {
    primary: '#FFFFFF',
    secondary: '#D1D5DB',
    accent: '#60A5FA'
  },
  background: {
    primary: '#0F0F0F',
    secondary: '#1F2937',
    glass: 'rgba(255, 255, 255, 0.05)',
    grid: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
           linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`
  },
  border: '#374151',
  shadow: 'rgba(0, 0, 0, 0.3)'
};