import React, { memo, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import LiquidEther from './LiquidEther';

interface ThemedLiquidEtherProps {
  className?: string;
  style?: React.CSSProperties;
  mouseForce?: number;
  cursorSize?: number;
  autoSpeed?: number;
  autoIntensity?: number;
  lightColors?: string[];
  darkColors?: string[];
}

/**
 * Componente LiquidEther que se adapta automáticamente al tema actual (claro/oscuro).
 * Debe usarse como fondo en cualquier módulo del sistema.
 */
export const ThemedLiquidEther: React.FC<ThemedLiquidEtherProps> = memo(({
  className = '',
  style = {},
  mouseForce = 20,
  cursorSize = 100,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  lightColors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  darkColors = ['#5227FF', '#FF9FFC', '#B19EEF']
}) => {
  const { isDark } = useTheme();

  // Memoizar colores para evitar re-renders innecesarios
  const colors = useMemo(() => 
    isDark ? darkColors : lightColors, 
    [isDark, darkColors, lightColors]
  );

  // Memoizar estilo para evitar recrear objeto en cada render
  const memoizedStyle = useMemo(() => ({ 
    width: '100%', 
    height: '100%',
    ...style 
  }), [style]);

  return (
    <LiquidEther
      colors={colors}
      mouseForce={mouseForce}
      cursorSize={cursorSize}
      style={memoizedStyle}
      className={className}
      autoDemo={true}
      autoSpeed={autoSpeed}
      autoIntensity={autoIntensity}
      autoResumeDelay={100}
      takeoverDuration={0.1}
      autoRampDuration={0.3}
    />
  );
});

export default ThemedLiquidEther;
