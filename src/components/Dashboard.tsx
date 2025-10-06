import React, { useState, useMemo } from 'react';
import { Users, Car, ShoppingCart, FileText, DollarSign, TrendingUp, Bell, Calendar, Plus, Clock, BarChart3, PieChart, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AlertType, Client, Vehicle, Sale } from '../App';
import { ModernCalendar } from './ui/modern-calendar';
import { LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface DashboardProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  clients: Client[];
  vehicles: Vehicle[];
  sales: Sale[];
  onNavigateToModule?: (module: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ showAlert, clients, vehicles, sales, onNavigateToModule }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Calculate metrics
  const metrics = useMemo(() => {
    const completedSales = sales.filter(sale => sale.status === 'completed');
    const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const pendingSales = sales.filter(sale => sale.status === 'pending').length;
    const availableVehicles = vehicles.filter(vehicle => vehicle.status === 'available').length;
    const activeClients = clients.filter(client => client.status === 'active').length;
    
    // Calculate growth percentages (simulated for demo)
    const revenueGrowth = 18.5;
    const clientsGrowth = 12.3;
    const vehiclesGrowth = 5.7;
    const salesGrowth = -3.2;
    
    return {
      totalRevenue,
      pendingSales,
      availableVehicles,
      activeClients,
      completedSales: completedSales.length,
      totalSales: sales.length,
      revenueGrowth,
      clientsGrowth,
      vehiclesGrowth,
      salesGrowth,
      averageSaleValue: completedSales.length > 0 ? totalRevenue / completedSales.length : 0,
      conversionRate: sales.length > 0 ? (completedSales.length / sales.length) * 100 : 0
    };
  }, [sales, clients, vehicles]);
  
  // Sales by month data
  const salesByMonth = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map((month, index) => ({
      name: month,
      ventas: Math.floor(Math.random() * 15) + 5,
      ingresos: Math.floor(Math.random() * 50000000) + 20000000
    }));
  }, []);
  
  // Sales by status
  const salesByStatus = useMemo(() => [
    { name: 'Completadas', value: sales.filter(s => s.status === 'completed').length, color: '#10b981' },
    { name: 'Pendientes', value: sales.filter(s => s.status === 'pending').length, color: '#f59e0b' },
    { name: 'Canceladas', value: sales.filter(s => s.status === 'cancelled').length, color: '#ef4444' }
  ], [sales]);
  
  // Sales by payment method
  const salesByPayment = useMemo(() => {
    const methods = sales.reduce((acc, sale) => {
      acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const colors: Record<string, string> = {
      cash: '#10b981',
      credit: '#3b82f6',
      financing: '#f59e0b',
      mixed: '#8b5cf6'
    };
    
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      credit: 'Crédito',
      financing: 'Financiamiento',
      mixed: 'Mixto'
    };
    
    return Object.entries(methods).map(([key, value]) => ({
      name: labels[key] || key,
      value,
      color: colors[key] || '#6b7280'
    }));
  }, [sales]);
  
  const totalRevenue = metrics.totalRevenue;
  const pendingSales = metrics.pendingSales;
  const availableVehicles = metrics.availableVehicles;
  const activeClients = metrics.activeClients;

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
            <h1 className="text-2xl font-bold text-theme-primary">Panel Principal</h1>
            <p className="text-theme-secondary mt-1">Bienvenido al sistema GAMMA Service</p>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <p className="text-sm text-theme-secondary">Último acceso</p>
            <p className="text-sm font-medium text-theme-primary">{new Date().toLocaleDateString('es-CO')}</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-theme-secondary">Clientes Activos</p>
              <p className="text-3xl font-bold text-theme-primary">{activeClients}</p>
              <p className={`text-sm flex items-center mt-1 ${metrics.clientsGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.clientsGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1 rotate-180" />}
                {metrics.clientsGrowth >= 0 ? '+' : ''}{metrics.clientsGrowth.toFixed(1)}% vs mes anterior
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-full backdrop-blur-sm">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-theme-secondary">Vehículos Disponibles</p>
              <p className="text-3xl font-bold text-theme-primary">{availableVehicles}</p>
              <p className={`text-sm flex items-center mt-1 ${metrics.vehiclesGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.vehiclesGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1 rotate-180" />}
                {metrics.vehiclesGrowth >= 0 ? '+' : ''}{metrics.vehiclesGrowth.toFixed(1)}% vs mes anterior
              </p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-full backdrop-blur-sm">
              <Car className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-theme-secondary">Ventas Pendientes</p>
              <p className="text-3xl font-bold text-theme-primary">{pendingSales}</p>
              <p className="text-sm text-orange-400 flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                {pendingSales > 0 ? 'Requieren atención' : 'Todo al día'}
              </p>
            </div>
            <div className="bg-orange-500/20 p-3 rounded-full backdrop-blur-sm">
              <ShoppingCart className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-theme-secondary">Ingresos Totales</p>
              <p className="text-2xl font-bold text-theme-primary">
                ${(totalRevenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-xs text-theme-secondary">${totalRevenue.toLocaleString('es-CO')} COP</p>
              <p className={`text-sm flex items-center mt-1 ${metrics.revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics.revenueGrowth >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1 rotate-180" />}
                {metrics.revenueGrowth >= 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}% vs mes anterior
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
        <h2 className="text-lg font-semibold text-theme-primary mb-2">Acceso Rápido a Flujos Principales</h2>
        <p className="text-sm text-theme-secondary mb-6">Navegue directamente a las áreas principales del sistema</p>
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
                    <h3 className="font-semibold text-theme-primary">{flow.title}</h3>
                    <p className="text-sm text-theme-secondary mt-1">{flow.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-theme-primary">Tendencia de Ventas</h2>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-xs rounded-lg bg-orange-500/20 text-orange-300 border border-orange-400/30">
                6 Meses
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={salesByMonth}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Area type="monotone" dataKey="ventas" stroke="#ea580c" fillOpacity={1} fill="url(#colorVentas)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-theme-secondary">Total Ventas</p>
              <p className="text-xl font-bold text-theme-primary">{metrics.totalSales}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Tasa Conversión</p>
              <p className="text-xl font-bold text-green-400">{metrics.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Sales by Status Pie Chart */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-theme-primary mb-4">Distribución de Ventas</h2>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie
                data={salesByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {salesByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </RePieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {salesByStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue and Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-semibold text-theme-primary mb-4">Ingresos Mensuales</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: number) => [`$${value.toLocaleString('es-CO')} COP`, 'Ingresos']}
              />
              <Bar dataKey="ingresos" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-theme-primary mb-4">Métodos de Pago</h2>
          <div className="space-y-4">
            {salesByPayment.map((method, index) => {
              const total = salesByPayment.reduce((sum, m) => sum + m.value, 0);
              const percentage = total > 0 ? (method.value / total) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">{method.name}</span>
                    <span className="text-sm font-semibold text-white">{method.value}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: method.color
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{percentage.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-emerald-500/10 rounded-lg border border-orange-400/20">
            <p className="text-xs text-theme-secondary mb-1">Valor Promedio por Venta</p>
            <p className="text-2xl font-bold text-theme-primary">
              ${(metrics.averageSaleValue / 1000000).toFixed(1)}M
            </p>
            <p className="text-xs text-theme-secondary">${metrics.averageSaleValue.toLocaleString('es-CO')} COP</p>
          </div>
        </div>
      </div>

      {/* Activity and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-theme-primary mb-4">Actividad Reciente</h2>
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
            <h2 className="text-lg font-semibold text-theme-primary">Notificaciones</h2>
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
            <h2 className="text-xl font-bold text-theme-primary">Calendario de Actividades</h2>
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
            <h3 className="text-lg font-semibold text-theme-primary mb-2">Calendario de Actividades</h3>
            <p className="text-theme-secondary mb-6">
              Gestiona tus citas, reuniones y eventos importantes en un solo lugar
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {calendarEvents.map((event) => (
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