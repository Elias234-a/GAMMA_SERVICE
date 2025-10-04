import React, { useState } from 'react';
import { Users, Car, ShoppingCart, FileText, DollarSign, TrendingUp, Bell, Calendar, Plus, Clock } from 'lucide-react';
import { AlertType, Client, Vehicle, Sale } from '@/types';
import { ModernCalendar } from './ui/modern-calendar';

interface DashboardProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  clients: Client[];
  vehicles: Vehicle[];
  sales: Sale[];
  onNavigateToModule?: (module: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ showAlert, clients, vehicles, sales, onNavigateToModule }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  
  const totalRevenue = sales
    .filter(sale => sale.status === 'completed')
    .reduce((sum, sale) => sum + sale.total, 0);

  const pendingSales = sales.filter(sale => sale.status === 'pending').length;
  const availableVehicles = vehicles.filter(vehicle => vehicle.status === 'active').length;
  const activeClients = clients.filter(client => client.status === 'active').length;

  // Sample calendar events
  const calendarEvents = [
    {
      id: '1',
      title: 'Cita Venta Toyota',
      date: new Date(2024, 11, 15), // December 15, 2024
      time: '10:00 AM',
      type: 'appointment' as const,
      color: 'bg-orange-500'
    },
    {
      id: '2',
      title: 'Revisión Técnica',
      date: new Date(2024, 11, 18), // December 18, 2024
      time: '2:00 PM',
      type: 'meeting' as const,
      color: 'bg-emerald-500'
    },
    {
      id: '3',
      title: 'Entrega Vehículo',
      date: new Date(2024, 11, 20), // December 20, 2024
      time: '11:30 AM',
      type: 'deadline' as const,
      color: 'bg-blue-500'
    }
  ];

  const quickAccessFlows = [
    {
      title: 'Área de Ventas',
      description: 'Proceso completo de ventas',
      icon: ShoppingCart,
      color: 'bg-gradient-to-r from-orange-500/20 to-orange-600/30',
      borderColor: 'border-orange-400/50',
      iconColor: 'text-orange-300',
      action: () => {
        showAlert('success', 'Navegando', 'Accediendo al Área de Ventas...');
        onNavigateToModule?.('sales');
      }
    },
    {
      title: 'Área de Finanzas',
      description: 'Evaluación y facturación',
      icon: DollarSign,
      color: 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/30',
      borderColor: 'border-emerald-400/50',
      iconColor: 'text-emerald-300',
      action: () => {
        showAlert('success', 'Navegando', 'Accediendo al Área de Finanzas...');
        onNavigateToModule?.('financing');
      }
    },
    {
      title: 'Taller',
      description: 'Servicios y trámites',
      icon: Car,
      color: 'bg-gradient-to-r from-blue-500/20 to-blue-600/30',
      borderColor: 'border-blue-400/50',
      iconColor: 'text-blue-300',
      action: () => {
        showAlert('success', 'Navegando', 'Accediendo al Taller...');
        onNavigateToModule?.('workshop');
      }
    },
    {
      title: 'Atención al Cliente',
      description: 'CRM y seguimiento',
      icon: Users,
      color: 'bg-gradient-to-r from-purple-500/20 to-purple-600/30',
      borderColor: 'border-purple-400/50',
      iconColor: 'text-purple-300',
      action: () => {
        showAlert('success', 'Navegando', 'Accediendo a Atención al Cliente...');
        onNavigateToModule?.('crm');
      }
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Nueva venta registrada', client: 'María García', time: '10:30 AM', type: 'sale' },
    { id: 2, action: 'Cliente registrado', client: 'Carlos Rodríguez', time: '09:45 AM', type: 'client' },
    { id: 3, action: 'Factura generada', client: 'Ana López', time: '09:20 AM', type: 'billing' },
    { id: 4, action: 'Trámite de placa iniciado', client: 'Luis Martín', time: '08:55 AM', type: 'plate' }
  ];

  const notifications = [
    { id: 1, message: 'Factura pendiente de pago - Cliente: María García', type: 'warning', priority: 'high' },
    { id: 2, message: 'Trámite de placa próximo a vencer - ABC123', type: 'info', priority: 'medium' },
    { id: 3, message: 'Nuevo cliente registrado en el sistema', type: 'success', priority: 'low' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Panel Principal</h1>
            <p className="text-gray-200 mt-1">Bienvenido al sistema GAMMA Service</p>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <p className="text-sm text-gray-300">Último acceso</p>
            <p className="text-sm font-medium text-white">{new Date().toLocaleDateString('es-CO')}</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Clientes Activos</p>
              <p className="text-3xl font-bold text-white">{activeClients}</p>
              <p className="text-sm text-green-400 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +12% vs mes anterior
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-full backdrop-blur-sm">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Vehículos Disponibles</p>
              <p className="text-3xl font-bold text-white">{availableVehicles}</p>
              <p className="text-sm text-blue-400 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +5% vs mes anterior
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-full backdrop-blur-sm">
              <Car className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Ventas Pendientes</p>
              <p className="text-3xl font-bold text-white">{pendingSales}</p>
              <p className="text-sm text-orange-400 flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                Requieren atención
              </p>
            </div>
            <div className="bg-orange-500/20 p-3 rounded-full backdrop-blur-sm">
              <ShoppingCart className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Ingresos Totales</p>
              <p className="text-3xl font-bold text-white">
                ${totalRevenue.toLocaleString('es-CO')}
              </p>
              <p className="text-sm text-green-400 flex items-center mt-1">
                <TrendingUp className="h-4 w-4 mr-1" />
                +18% vs mes anterior
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-full backdrop-blur-sm">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access to Main Flow Areas */}
      <div className="glass-card-strong p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Acceso Rápido a Flujos Principales</h2>
        <p className="text-sm text-gray-300 mb-6">Navegue directamente a las áreas principales del sistema</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccessFlows.map((flow, index) => {
            const Icon = flow.icon;
            return (
              <button
                key={index}
                onClick={flow.action}
                className={`p-5 glass-content border ${flow.borderColor} rounded-lg hover:border-opacity-60 hover:shadow-xl transition-all text-left group glass-hover ${flow.color}`}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-white/10 group-hover:scale-110 transition-transform backdrop-blur-sm">
                    <Icon className={`h-6 w-6 ${flow.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{flow.title}</h3>
                    <p className="text-sm text-gray-200 mt-1">{flow.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 glass-content rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'sale' ? 'bg-green-400' :
                  activity.type === 'client' ? 'bg-blue-400' :
                  activity.type === 'billing' ? 'bg-orange-400' : 'bg-purple-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{activity.action}</p>
                  <p className="text-sm text-gray-200">{activity.client}</p>
                  <p className="text-xs text-gray-300 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => showAlert('info', 'Historial', 'Ver historial completo de actividad')}
            className="mt-4 w-full text-center text-sm text-orange-400 hover:text-orange-300 py-2 border border-orange-400/30 rounded-lg hover:bg-orange-500/10 transition-colors"
          >
            Ver todo el historial
          </button>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Notificaciones</h2>
            <Bell className="h-5 w-5 text-gray-300" />
          </div>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border-l-4 glass-content ${
                  notification.type === 'warning' ? 'border-yellow-400' :
                  notification.type === 'info' ? 'border-blue-400' :
                  'border-green-400'
                }`}
              >
                <p className="text-sm text-white">{notification.message}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    notification.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                    notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-green-500/20 text-green-300'
                  }`}>
                    {notification.priority === 'high' ? 'Alta' :
                     notification.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>
                  <button
                    onClick={() => showAlert('info', 'Notificación', 'Procesando notificación...')}
                    className="text-xs text-orange-400 hover:text-orange-300"
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => showAlert('info', 'Notificaciones', 'Ver todas las notificaciones')}
            className="mt-4 w-full text-center text-sm text-orange-400 hover:text-orange-300 py-2 border border-orange-400/30 rounded-lg hover:bg-orange-500/10 transition-colors"
          >
            Ver todas las notificaciones
          </button>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">Calendario de Actividades</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => showAlert('info', 'Nueva Cita', 'Función de agendar cita próximamente')}
              className="btn-responsive bg-orange-500/20 border border-orange-400/50 text-orange-300 hover:bg-orange-500/30 transition-colors group"
            >
              <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Nueva Cita
            </button>
            
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className={`btn-responsive border transition-colors ${
                showCalendar 
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/30' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Calendar className="h-4 w-4" />
              {showCalendar ? 'Ocultar' : 'Mostrar'} Calendario
            </button>
          </div>
        </div>

        {showCalendar && (
          <div className="animate-in slide-up">
            <ModernCalendar
              events={calendarEvents}
              onEventClick={(event) => showAlert('info', 'Evento', `Cita: ${event.title} - ${event.time}`)}
              onDateSelect={(date) => showAlert('info', 'Fecha', `Fecha seleccionada: ${date.toLocaleDateString('es-ES')}`)}
            />
          </div>
        )}
        
        {!showCalendar && (
          <div className="glass-card p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Calendario de Actividades</h3>
            <p className="text-gray-300 mb-6">
              Gestiona tus citas, reuniones y eventos importantes en un solo lugar
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {calendarEvents.map((event, index) => (
                <div key={event.id} className="glass-content p-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${event.color}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{event.title}</p>
                      <p className="text-xs text-gray-300">
                        {event.date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {event.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowCalendar(true)}
              className="btn-responsive bg-orange-500/20 border border-orange-400/50 text-orange-300 hover:bg-orange-500/30 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Ver Calendario Completo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};