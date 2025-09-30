import React from 'react';
import { AlertTriangle, X, Check, Ban } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  type = 'warning'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'info':
        return <AlertTriangle className="h-6 w-6 text-blue-600" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'danger':
        return 'border-red-500';
      case 'info':
        return 'border-blue-500';
      default:
        return 'border-yellow-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with improved blur */}
      <div 
        className="modal-backdrop absolute inset-0"
        onClick={onCancel}
      />
      
      {/* Dialog with glassmorphism */}
      <div className={`modal-content relative max-w-md w-full rounded-lg border-t-4 ${getHeaderColor()} animate-in zoom-in-95 duration-200`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <h3 className="text-lg font-semibold text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-300 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message */}
        <div className="px-6 pb-6">
          <p className="text-white/90 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-end p-6 pt-0 border-t border-white/20">
          <button
            onClick={onCancel}
            className="btn-responsive bg-white/10 text-white hover:bg-white/20 border-white/30"
          >
            <Ban className="h-4 w-4" />
            <span>Cancelar</span>
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            className={`btn-responsive text-white font-medium
              ${type === 'danger' 
                ? 'bg-red-600/80 hover:bg-red-600 border-red-500/50' 
                : type === 'info'
                ? 'bg-blue-600/80 hover:bg-blue-600 border-blue-500/50'
                : 'bg-yellow-600/80 hover:bg-yellow-600 border-yellow-500/50'
              }`}
          >
            <Check className="h-4 w-4" />
            <span>Confirmar</span>
          </button>
        </div>
      </div>
    </div>
  );
};