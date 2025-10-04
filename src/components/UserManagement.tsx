import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone, User, X } from 'lucide-react';
import { AlertType } from '@/types/common';

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface UserManagementProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ showAlert, showConfirmDialog }) => {
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      fullName: 'Juan Pérez García',
      email: 'juan.perez@email.com',
      phone: '555-0123',
      role: 'Cliente',
      status: 'active',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      fullName: 'María González López',
      email: 'maria.gonzalez@email.com',
      phone: '555-0124',
      role: 'Cliente',
      status: 'active',
      createdAt: '2024-02-20'
    },
    {
      id: 3,
      fullName: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@email.com',
      phone: '555-0125',
      role: 'Administrador',
      status: 'active',
      createdAt: '2024-01-10'
    },
    {
      id: 4,
      fullName: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      phone: '555-0126',
      role: 'Cliente',
      status: 'inactive',
      createdAt: '2024-03-05'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Cliente'
  });

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: 'Cliente'
    });
    setShowModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
    setShowModal(true);
  };

  const handleDeleteUser = (user: User) => {
    showConfirmDialog(
      'Eliminar Usuario',
      `¿Está seguro que desea eliminar al usuario "${user.fullName}"? Esta acción no se puede deshacer.`,
      () => {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        showAlert('success', 'Usuario eliminado', `El usuario ${user.fullName} ha sido eliminado correctamente`);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone) {
      showAlert('error', 'Campos requeridos', 'Por favor complete todos los campos obligatorios');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showAlert('error', 'Email inválido', 'Por favor ingrese un email válido');
      return;
    }

    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...formData }
          : user
      ));
      showAlert('success', 'Usuario actualizado', `Los datos de ${formData.fullName} han sido actualizados`);
    } else {
      // Add new user
      const newUser: User = {
        id: Math.max(...users.map(u => u.id)) + 1,
        ...formData,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [...prev, newUser]);
      showAlert('success', 'Usuario registrado', `${formData.fullName} ha sido registrado correctamente`);
    }

    setShowModal(false);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: 'Cliente'
    });
  };

  const toggleUserStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    showAlert(
      'info', 
      'Estado actualizado', 
      `El usuario ${user.fullName} ahora está ${newStatus === 'active' ? 'activo' : 'inactivo'}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6 border border-white/20 fade-in">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
            <p className="text-white/80">Administre los usuarios del sistema</p>
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center justify-center space-x-2 btn-electric text-white px-4 py-2 rounded-lg pulse-glow"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo Usuario</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
          <input
            type="text"
            placeholder="Buscar usuarios por nombre, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Usuario</th>
                <th className="text-left p-4 font-semibold text-gray-700">Contacto</th>
                <th className="text-left p-4 font-semibold text-gray-700">Rol</th>
                <th className="text-left p-4 font-semibold text-gray-700">Estado</th>
                <th className="text-left p-4 font-semibold text-gray-700">Fecha Registro</th>
                <th className="text-left p-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{user.fullName}</p>
                        <p className="text-sm text-gray-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${user.role === 'Administrador' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                      }
                    `}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium transition-colors
                        ${user.status === 'active' 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }
                      `}
                    >
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-gray-600 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar usuario"
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

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron usuarios</p>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="Ingrese el nombre completo"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Correo Electrónico *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Teléfono *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="555-0123"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                >
                  <option value="Cliente">Cliente</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-lg transition-colors"
                >
                  {editingUser ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};