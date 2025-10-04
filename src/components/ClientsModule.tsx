import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, User, Mail, Phone, MapPin } from 'lucide-react';
import { AlertType, Client } from '@/types/common';

interface ClientsModuleProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

export const ClientsModule: React.FC<ClientsModuleProps> = ({ 
  showAlert, 
  showConfirmDialog, 
  clients, 
  setClients 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    identification: '',
    phone: '',
    email: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.identification.includes(searchTerm) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (!formData.identification.trim()) {
      newErrors.identification = 'La identificación es obligatoria';
    } else if (!/^\d{8,11}$/.test(formData.identification)) {
      newErrors.identification = 'La identificación debe tener entre 8 y 11 dígitos';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }

    // Check for duplicate identification or email (excluding current client when editing)
    const duplicateId = clients.find(client => 
      client.identification === formData.identification && 
      (!editingClient || client.id !== editingClient.id)
    );
    if (duplicateId) {
      newErrors.identification = 'Ya existe un cliente con esta identificación';
    }

    const duplicateEmail = clients.find(client => 
      client.email === formData.email && 
      (!editingClient || client.id !== editingClient.id)
    );
    if (duplicateEmail) {
      newErrors.email = 'Ya existe un cliente con este correo electrónico';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      identification: '',
      phone: '',
      email: '',
      address: ''
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      identification: client.identification,
      phone: client.phone,
      email: client.email,
      address: client.address
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleDeleteClient = (client: Client) => {
    showConfirmDialog(
      'Eliminar Cliente',
      `¿Está seguro que desea eliminar el cliente "${client.name}"? Esta acción no se puede deshacer.`,
      () => {
        setClients(prev => prev.filter(c => c.id !== client.id));
        showAlert('success', 'Cliente eliminado', 'El cliente ha sido eliminado exitosamente');
      }
    );
  };

  const handleSaveClient = () => {
    if (!validateForm()) {
      showAlert('error', 'Datos inválidos', 'Por favor corrija los errores en el formulario');
      return;
    }

    if (editingClient) {
      // Update existing client
      setClients(prev => prev.map(client => 
        client.id === editingClient.id 
          ? { ...client, ...formData }
          : client
      ));
      showAlert('success', 'Cliente actualizado', 'Los datos del cliente han sido actualizados');
    } else {
      // Add new client
      const newClient: Client = {
        id: Date.now().toString(),
        ...formData,
        registrationDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };
      setClients(prev => [...prev, newClient]);
      showAlert('success', 'Cliente registrado', 'El cliente ha sido registrado exitosamente');
    }

    setShowAddModal(false);
    setEditingClient(null);
    setFormData({
      name: '',
      identification: '',
      phone: '',
      email: '',
      address: ''
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleClientStatus = (client: Client) => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    setClients(prev => prev.map(c => 
      c.id === client.id ? { ...c, status: newStatus } : c
    ));
    showAlert('success', 'Estado actualizado', `Cliente ${newStatus === 'active' ? 'activado' : 'desactivado'}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestión de Clientes</h1>
            <p className="text-gray-200 mt-1">Administre la información de sus clientes</p>
          </div>
          <button
            onClick={handleAddClient}
            className="mt-4 sm:mt-0 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Total Clientes</p>
              <p className="text-3xl font-bold text-white">{clients.length}</p>
            </div>
            <User className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Clientes Activos</p>
              <p className="text-3xl font-bold text-white">
                {clients.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Nuevos Este Mes</p>
              <p className="text-3xl font-bold text-white">
                {clients.filter(c => {
                  const clientDate = new Date(c.registrationDate);
                  const currentDate = new Date();
                  return clientDate.getMonth() === currentDate.getMonth() && 
                         clientDate.getFullYear() === currentDate.getFullYear();
                }).length}
              </p>
            </div>
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Plus className="h-4 w-4 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input
                type="text"
                placeholder="Buscar por nombre, identificación o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg glass-content text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="glass-content">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Identificación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Fecha Registro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-white/10 rounded-full p-2 mr-3 backdrop-blur-sm">
                        <User className="h-5 w-5 text-gray-300" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{client.name}</div>
                        <div className="text-sm text-gray-300">{client.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {client.identification}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{client.phone}</div>
                    <div className="text-sm text-gray-300">{client.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {new Date(client.registrationDate).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleClientStatus(client)}
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        client.status === 'active'
                          ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                          : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      } transition-colors backdrop-blur-sm`}
                    >
                      {client.status === 'active' ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => showAlert('info', 'Ver cliente', `Mostrando detalles de ${client.name}`)}
                        className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-500/20 rounded backdrop-blur-sm"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditClient(client)}
                        className="text-yellow-400 hover:text-yellow-300 p-1 hover:bg-yellow-500/20 rounded backdrop-blur-sm"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client)}
                        className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded backdrop-blur-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No se encontraron clientes</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card-strong max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300 icon-enhanced" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border ${
                        errors.name ? 'border-red-400' : 'border-white/20'
                      } rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="Juan Pérez García"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Identificación *
                  </label>
                  <input
                    type="text"
                    value={formData.identification}
                    onChange={(e) => handleInputChange('identification', e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errors.identification ? 'border-red-400' : 'border-white/20'
                    } rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                    placeholder="12345678901"
                  />
                  {errors.identification && <p className="mt-1 text-sm text-red-400">{errors.identification}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300 icon-enhanced" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border ${
                        errors.phone ? 'border-red-400' : 'border-white/20'
                      } rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300 icon-enhanced" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border ${
                        errors.email ? 'border-red-400' : 'border-white/20'
                      } rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Dirección *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-300 icon-enhanced" />
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full pl-10 pr-3 py-2 border ${
                        errors.address ? 'border-red-400' : 'border-white/20'
                      } rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none`}
                      rows={3}
                      placeholder="Calle 123 #45-67, Ciudad"
                    />
                  </div>
                  {errors.address && <p className="mt-1 text-sm text-red-400">{errors.address}</p>}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingClient(null);
                    setFormData({
                      name: '',
                      identification: '',
                      phone: '',
                      email: '',
                      address: ''
                    });
                    setErrors({});
                  }}
                  className="px-4 py-2 text-white glass-content border border-white/20 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveClient}
                  className="px-4 py-2 btn-primary text-white rounded-lg"
                >
                  {editingClient ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};