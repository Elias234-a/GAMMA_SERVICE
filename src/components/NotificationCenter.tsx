import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Clock, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertType } from '../App';

interface NotificationCenterProps {
  alerts: Alert[];
  onRemoveAlert: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  alerts,
  onRemoveAlert,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getNotificationIcon = (type: AlertType) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: AlertType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const unreadCount = alerts.filter(alert => !alert.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 text-white hover:text-gray-200 hover:bg-white/15 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Notificaciones</h3>
              <div className="flex space-x-2">
                {alerts.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAllAsRead();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Marcar todo como leído
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No hay notificaciones
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <li
                    key={alert.id}
                    className={`p-3 hover:bg-gray-50 transition-colors ${!alert.read ? 'bg-blue-50' : ''}`}
                    onClick={() => onMarkAsRead(alert.id)}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 mt-0.5 mr-3 p-1.5 rounded-full ${getNotificationColor(alert.type).replace('bg-', 'bg-opacity-30 ')}`}>
                        {getNotificationIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(parseInt(alert.id)).toLocaleTimeString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveAlert(alert.id);
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {alerts.length > 0 && (
            <div className="p-2 border-t border-gray-200 bg-gray-50 text-center">
              <button
                onClick={() => {
                  alerts.forEach(alert => onRemoveAlert(alert.id));
                  setIsOpen(false);
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Limpiar todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
