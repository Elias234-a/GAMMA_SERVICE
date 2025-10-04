import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert } from '@/types';

interface NotificationSystemProps {
  alerts: Alert[];
  onRemoveAlert: (id: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({ alerts, onRemoveAlert }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-white border-l-4 border-green-500 shadow-lg';
      case 'error':
        return 'bg-white border-l-4 border-red-500 shadow-lg';
      case 'warning':
        return 'bg-white border-l-4 border-yellow-500 shadow-lg';
      case 'info':
        return 'bg-white border-l-4 border-blue-500 shadow-lg';
      default:
        return 'bg-white border-l-4 border-blue-500 shadow-lg';
    }
  };

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 space-y-3 max-w-sm">
      {alerts.map((alert, index) => (
        <div
          key={alert.id}
          className={`
            w-full p-4 rounded-lg transform transition-all duration-500
            ${getAlertStyles(alert.type)}
            hover:scale-105 cursor-pointer animate-in slide-in-from-right
          `}
          style={{
            animationDelay: `${index * 100}ms`
          }}
          onClick={() => onRemoveAlert(alert.id)}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">
              {getAlertIcon(alert.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900">{alert.title}</h4>
              <p className="text-sm mt-1 text-gray-700">{alert.message}</p>
              <p className="text-xs text-gray-500 mt-2">Clic para eliminar</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveAlert(alert.id);
              }}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors hover:scale-110"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      
      {alerts.length > 1 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => alerts.forEach(alert => onRemoveAlert(alert.id))}
            className="bg-white px-3 py-2 text-xs sm:text-sm text-gray-700 hover:text-gray-900 transition-colors hover:scale-105 border border-gray-300 rounded-lg shadow-md"
          >
            Eliminar todas ({alerts.length})
          </button>
        </div>
      )}
    </div>
  );
};