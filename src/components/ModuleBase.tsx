import React, { ReactNode } from 'react';
import { AlertType } from '@/types';

interface ModuleBaseProps {
  title: string;
  description?: string;
  children: ReactNode;
  showAlert?: (type: AlertType, title: string, message: string) => void;
  actions?: ReactNode;
  filters?: ReactNode;
}

export const ModuleBase: React.FC<ModuleBaseProps> = ({
  title,
  description,
  children,
  showAlert,
  actions,
  filters
}) => {
  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {description && (
            <p className="text-sm text-gray-300 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      </div>

      {/* Filtros */}
      {filters && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex flex-wrap items-end gap-4">
            {filters}
          </div>
        </div>
      )}

      {/* Contenido */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        {children}
      </div>
    </div>
  );
};
