import React, { ReactNode, memo } from 'react';
import { AlertType } from '../App';
import { useTheme } from '../contexts/ThemeContext';

interface ModuleBaseProps {
  title: string;
  description?: string;
  children: ReactNode;
  showAlert?: (type: AlertType, title: string, message: string) => void;
  actions?: ReactNode;
  filters?: ReactNode;
}

export const ModuleBase: React.FC<ModuleBaseProps> = memo(({
  title,
  description,
  children,
  showAlert,
  actions,
  filters
}) => {
  const { colors } = useTheme();
  
  return (
    <div className="space-y-6 relative z-10">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>{title}</h1>
          {description && (
            <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      </div>

      {/* Filtros */}
      {filters && (
        <div 
          className="backdrop-blur-sm rounded-xl p-4 border"
          style={{ 
            backgroundColor: colors.background.glass,
            borderColor: colors.border
          }}
        >
          <div className="flex flex-wrap items-end gap-4">
            {filters}
          </div>
        </div>
      )}

      {/* Contenido */}
      <div 
        className="backdrop-blur-sm rounded-xl border overflow-hidden"
        style={{ 
          backgroundColor: colors.background.glass,
          borderColor: colors.border
        }}
      >
        {children}
      </div>
    </div>
  );
 }
);
