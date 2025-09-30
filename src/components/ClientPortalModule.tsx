import React, { useState } from 'react';
import { 
  Globe, 
  User, 
  Car, 
  Calendar, 
  Wrench,
  Star,
  Phone,
  Mail,
  MapPin,
  Shield,
} from 'lucide-react';
import { AlertType } from '../App';

interface ClientAccount {
  id: string;
  name: string;
  identification: string;
  email: string;
  phone: string;
  address: string;
  registrationDate: string;
  status: 'active' | 'inactive';
  loyaltyPoints: number;
  purchases: Purchase[];
  appointments: Appointment[];
  serviceHistory: ServiceRecord[];
  notifications: Notification[];
}

interface Purchase {
  id: string;
  date: string;
  vehicle: string;
  amount: number;
  status: 'completed' | 'financing' | 'pending';
  warranty: {
    endDate: string;
    coverage: string;
  };
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  service: string;
  vehicle: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

interface ServiceRecord {
  id: string;
  date: string;
  service: string;
  vehicle: string;
  cost: number;
  technician: string;
  nextService?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'success';
  read: boolean;
}

interface ClientPortalModuleProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
}

export const ClientPortalModule: React.FC<ClientPortalModuleProps> = ({ showAlert, showConfirmDialog }) => {
  const [selectedClient, setSelectedClient] = useState<ClientAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'purchases' | 'appointments' | 'services' | 'profile'>('dashboard');
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  // Mock client data
  const [clients] = useState<ClientAccount[]>([
    {
      id: '1',
      name: 'María García López',
      identification: '12345678901',
      email: 'maria.garcia@email.com',
      phone: '+57 300 123 4567',
      address: 'Calle 123 #45-67, Bogotá',
      registrationDate: '2024-01-15',
      status: 'active',
      loyaltyPoints: 2500,
      purchases: [
        {
          id: '1',
          date: '2024-01-15',
          vehicle: 'Toyota Corolla 2024',
          amount: 85000000,
          status: 'completed',
          warranty: {
            endDate: '2027-01-15',
            coverage: 'Garantía completa 3 años'
          }
        }
      ],
      appointments: [
        {
          id: '1',
          date: '2024-02-15',
          time: '10:00',
          service: 'Mantenimiento 10,000 km',
          vehicle: 'Toyota Corolla 2024',
          status: 'scheduled',
          notes: 'Primer mantenimiento preventivo'
        }
      ],
      serviceHistory: [
        {
          id: '1',
          date: '2024-01-20',
          service: 'Entrega de vehículo',
          vehicle: 'Toyota Corolla 2024',
          cost: 0,
          technician: 'Carlos Méndez',
          nextService: 'Mantenimiento 10,000 km'
        }
      ],
      notifications: [
        {
          id: '1',
          title: 'Mantenimiento Programado',
          message: 'Su vehículo Toyota Corolla tiene mantenimiento programado para el 15 de febrero',
          date: '2024-02-01',
          type: 'info',
          read: false
        },
        {
          id: '2',
          title: 'Garantía Activa',
          message: 'Su garantía está activa hasta enero 2027. Consulte los términos y condiciones.',
          date: '2024-01-15',
          type: 'success',
          read: true
        }
      ]
    }
  ]);

  const [newAppointment, setNewAppointment] = useState({
    date: '',
    time: '',
    service: '',
    vehicle: '',
    notes: ''
  });

  const handleClientLogin = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client || null);
    if (client) {
      showAlert('success', 'Acceso exitoso', `Bienvenido ${client.name}`);
    }
  };

  const handleScheduleAppointment = () => {
    if (!newAppointment.date || !newAppointment.time || !newAppointment.service) {
      showAlert('error', 'Datos incompletos', 'Por favor complete todos los campos obligatorios');
      return;
    }

    const appointment: Appointment = {
      id: Date.now().toString(),
      date: newAppointment.date,
      time: newAppointment.time,
      service: newAppointment.service,
      vehicle: newAppointment.vehicle,
      status: 'scheduled',
      notes: newAppointment.notes
    };

    // Add to client appointments (mock)
    showAlert('success', 'Cita agendada', 'Su cita ha sido programada exitosamente');
    setShowNewAppointment(false);
    setNewAppointment({ date: '', time: '', service: '', vehicle: '', notes: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300 border-green-400/50';
      case 'scheduled': return 'bg-blue-500/20 text-blue-300 border-blue-400/50';
      case 'cancelled': return 'bg-red-500/20 text-red-300 border-red-400/50';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
      case 'financing': return 'bg-purple-500/20 text-purple-300 border-purple-400/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info': return 'bg-blue-500/20 text-blue-300 border-blue-400/50';
      case 'warning': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
      case 'success': return 'bg-green-500/20 text-green-300 border-green-400/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
    }
  };

  // Client selection screen
  if (!selectedClient) {
    return (
      <div className="space-y-6">
        <div className="glass-card-strong p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white flex items-center justify-center">
              <Globe className="h-8 w-8 mr-3 text-orange-300" />
              Portal del Cliente GAMMA Service
            </h1>
            <p className="text-gray-200 mt-2">Acceda a su información personal, citas y servicios</p>
          </div>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">Seleccionar Cliente (Demo)</h2>
          <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleClientLogin(client.id)}
                className="p-4 glass-content border border-white/20 rounded-lg hover:border-white/40 hover:shadow-lg transition-all text-left group"
              >
                <div className="flex items-center">
                  <div className="bg-orange-500/20 p-3 rounded-full mr-4">
                    <User className="h-6 w-6 text-orange-300" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{client.name}</h3>
                    <p className="text-sm text-gray-300">{client.email}</p>
                    <p className="text-xs text-gray-400">ID: {client.identification}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Bienvenido, {selectedClient.name}
            </h1>
            <p className="text-gray-200 mt-1">Panel de cliente - GAMMA Service</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowNewAppointment(true)}
              className="btn-primary px-4 py-2 rounded-lg"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Cita
            </button>
            <button
              onClick={() => setSelectedClient(null)}
              className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card p-1">
        <nav className="flex space-x-1">
          {[
            { id: 'dashboard', label: 'Resumen', icon: Globe },
            { id: 'purchases', label: 'Mis Compras', icon: Car },
            { id: 'appointments', label: 'Citas', icon: Calendar },
            { id: 'services', label: 'Servicios', icon: Wrench },
            { id: 'profile', label: 'Perfil', icon: User }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-orange-500/30 text-white border border-orange-400/50'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">Puntos Lealtad</p>
                  <p className="text-3xl font-bold text-white">{selectedClient.loyaltyPoints}</p>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-full">
                  <Star className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">Vehículos</p>
                  <p className="text-3xl font-bold text-white">{selectedClient.purchases.length}</p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <Car className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">Citas Pendientes</p>
                  <p className="text-3xl font-bold text-white">
                    {selectedClient.appointments.filter(a => a.status === 'scheduled').length}
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-200">Servicios</p>
                  <p className="text-3xl font-bold text-white">{selectedClient.serviceHistory.length}</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <Wrench className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Notificaciones Recientes</h3>
            <div className="space-y-3">
              {selectedClient.notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'border-opacity-70' : 'border-opacity-30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{notification.title}</h4>
                      <p className="text-sm text-gray-200 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notification.date).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Purchases Tab */}
      {activeTab === 'purchases' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Mis Compras</h3>
          <div className="space-y-4">
            {selectedClient.purchases.map((purchase) => (
              <div key={purchase.id} className="glass-content p-4 rounded-lg border border-white/10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                  <div className="flex items-center">
                    <div className="bg-blue-500/20 p-3 rounded-full mr-4">
                      <Car className="h-6 w-6 text-blue-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{purchase.vehicle}</h4>
                      <p className="text-sm text-gray-300">
                        Comprado el {new Date(purchase.date).toLocaleDateString('es-CO')}
                      </p>
                      <p className="text-lg font-bold text-white mt-1">
                        ${purchase.amount.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start lg:items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(purchase.status)}`}>
                      {purchase.status === 'completed' ? 'Completado' : 
                       purchase.status === 'financing' ? 'Financiando' : 'Pendiente'}
                    </span>
                    <div className="text-sm text-gray-300">
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        Garantía hasta {new Date(purchase.warranty.endDate).toLocaleDateString('es-CO')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'appointments' && (
        <div className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-white">Mis Citas</h3>
            <button
              onClick={() => setShowNewAppointment(true)}
              className="btn-primary px-4 py-2 rounded-lg"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Nueva Cita
            </button>
          </div>
          <div className="space-y-4">
            {selectedClient.appointments.map((appointment) => (
              <div key={appointment.id} className="glass-content p-4 rounded-lg border border-white/10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                  <div className="flex items-center">
                    <div className="bg-green-500/20 p-3 rounded-full mr-4">
                      <Calendar className="h-6 w-6 text-green-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{appointment.service}</h4>
                      <p className="text-sm text-gray-300">{appointment.vehicle}</p>
                      <p className="text-sm text-gray-300">
                        {new Date(appointment.date).toLocaleDateString('es-CO')} a las {appointment.time}
                      </p>
                      {appointment.notes && (
                        <p className="text-xs text-gray-400 mt-1">{appointment.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(appointment.status)}`}>
                    {appointment.status === 'scheduled' ? 'Programada' :
                     appointment.status === 'completed' ? 'Completada' : 'Cancelada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Historial de Servicios</h3>
          <div className="space-y-4">
            {selectedClient.serviceHistory.map((service) => (
              <div key={service.id} className="glass-content p-4 rounded-lg border border-white/10">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                  <div className="flex items-center">
                    <div className="bg-purple-500/20 p-3 rounded-full mr-4">
                      <Wrench className="h-6 w-6 text-purple-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{service.service}</h4>
                      <p className="text-sm text-gray-300">{service.vehicle}</p>
                      <p className="text-sm text-gray-300">
                        {new Date(service.date).toLocaleDateString('es-CO')} - {service.technician}
                      </p>
                      {service.nextService && (
                        <p className="text-xs text-orange-300 mt-1">Próximo: {service.nextService}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">
                      {service.cost > 0 ? `$${service.cost.toLocaleString('es-CO')}` : 'Sin costo'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Mi Perfil</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre Completo</label>
                <p className="text-white">{selectedClient.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Identificación</label>
                <p className="text-white">{selectedClient.identification}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <p className="text-white flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  {selectedClient.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                <p className="text-white flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {selectedClient.phone}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
              <p className="text-white flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                {selectedClient.address}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cliente desde</label>
              <p className="text-white">
                {new Date(selectedClient.registrationDate).toLocaleDateString('es-CO')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-strong p-6 w-full max-w-md border border-white/20 rounded-xl backdrop-blur-lg">
            <h3 className="text-xl font-bold text-white mb-6">Agendar Nueva Cita</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Fecha *</label>
                <input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Hora *</label>
                <select
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                >
                  <option value="" className="bg-gray-800">Seleccionar hora</option>
                  <option value="08:00" className="bg-gray-800">08:00</option>
                  <option value="09:00" className="bg-gray-800">09:00</option>
                  <option value="10:00" className="bg-gray-800">10:00</option>
                  <option value="11:00" className="bg-gray-800">11:00</option>
                  <option value="14:00" className="bg-gray-800">14:00</option>
                  <option value="15:00" className="bg-gray-800">15:00</option>
                  <option value="16:00" className="bg-gray-800">16:00</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Servicio *</label>
                <select
                  value={newAppointment.service}
                  onChange={(e) => setNewAppointment({...newAppointment, service: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                >
                  <option value="" className="bg-gray-800">Seleccionar servicio</option>
                  <option value="Mantenimiento preventivo" className="bg-gray-800">Mantenimiento preventivo</option>
                  <option value="Cambio de aceite" className="bg-gray-800">Cambio de aceite</option>
                  <option value="Revisión general" className="bg-gray-800">Revisión general</option>
                  <option value="Reparación" className="bg-gray-800">Reparación</option>
                  <option value="Diagnóstico" className="bg-gray-800">Diagnóstico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Vehículo</label>
                <select
                  value={newAppointment.vehicle}
                  onChange={(e) => setNewAppointment({...newAppointment, vehicle: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                >
                  <option value="" className="bg-gray-800">Seleccionar vehículo</option>
                  {selectedClient.purchases.map((purchase) => (
                    <option key={purchase.id} value={purchase.vehicle} className="bg-gray-800">
                      {purchase.vehicle}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Notas adicionales</label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="Describe el problema o servicio requerido..."
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowNewAppointment(false)}
                className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleScheduleAppointment}
                className="flex-1 btn-primary px-4 py-2 rounded-lg"
              >
                Agendar Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};