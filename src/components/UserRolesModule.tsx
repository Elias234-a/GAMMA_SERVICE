import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Key,  
  Edit3, 
  Trash2, 
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  Save,
  X
} from 'lucide-react';
import type { AlertColor } from '@mui/material';

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  users: UserAccount[];
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'ventas' | 'finanzas' | 'taller' | 'administracion' | 'reportes';
}

interface UserRolesModuleProps {
  showAlert: (type: AlertColor, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
}

export const UserRolesModule: React.FC<UserRolesModuleProps> = ({ showAlert, showConfirmDialog }) => {
  const [permissions] = useState<Permission[]>([
    // Ventas
    { id: 'ventas_ver', name: 'Ver Ventas', description: 'Visualizar módulo de ventas', category: 'ventas' },
    { id: 'ventas_crear', name: 'Crear Ventas', description: 'Crear nuevas ventas', category: 'ventas' },
    { id: 'ventas_editar', name: 'Editar Ventas', description: 'Modificar ventas existentes', category: 'ventas' },
    { id: 'clientes_ver', name: 'Ver Clientes', description: 'Visualizar clientes', category: 'ventas' },
    { id: 'clientes_crear', name: 'Crear Clientes', description: 'Registrar nuevos clientes', category: 'ventas' },
    { id: 'vehiculos_ver', name: 'Ver Vehículos', description: 'Visualizar inventario de vehículos', category: 'ventas' },
    
    // Finanzas
    { id: 'finanzas_ver', name: 'Ver Finanzas', description: 'Acceso al módulo financiero', category: 'finanzas' },
    { id: 'facturacion_ver', name: 'Ver Facturación', description: 'Visualizar facturas', category: 'finanzas' },
    { id: 'facturacion_crear', name: 'Crear Facturas', description: 'Generar nuevas facturas', category: 'finanzas' },
    { id: 'dian_acceso', name: 'Acceso DIAN', description: 'Gestionar facturación electrónica', category: 'finanzas' },
    
    // Taller
    { id: 'taller_ver', name: 'Ver Taller', description: 'Acceso al módulo de taller', category: 'taller' },
    { id: 'taller_servicios', name: 'Gestionar Servicios', description: 'Crear y gestionar servicios', category: 'taller' },
    { id: 'tramites_ver', name: 'Ver Trámites', description: 'Acceso a trámites con tránsito', category: 'taller' },
    
    // Administración
    { id: 'usuarios_ver', name: 'Ver Usuarios', description: 'Visualizar usuarios del sistema', category: 'administracion' },
    { id: 'usuarios_crear', name: 'Crear Usuarios', description: 'Registrar nuevos usuarios', category: 'administracion' },
    { id: 'roles_gestionar', name: 'Gestionar Roles', description: 'Crear y modificar roles', category: 'administracion' },
    { id: 'configuracion', name: 'Configuración', description: 'Acceso a configuración del sistema', category: 'administracion' },
    
    // Reportes
    { id: 'reportes_ver', name: 'Ver Reportes', description: 'Acceso a reportes y análisis', category: 'reportes' },
    { id: 'reportes_exportar', name: 'Exportar Reportes', description: 'Exportar reportes en diferentes formatos', category: 'reportes' }
  ]);

  const [roles, setRoles] = useState<UserRole[]>([
    {
      id: '1',
      name: 'Administrador',
      description: 'Acceso completo al sistema',
      color: 'bg-red-500/20 text-red-300 border-red-400/50',
      permissions: permissions.map(p => p.id),
      users: [
        {
          id: '1',
          name: 'Super Admin',
          email: 'admin@gammaservice.com',
          roleId: '1',
          status: 'active',
          lastLogin: '2024-01-15T10:30:00',
          createdAt: '2024-01-01T00:00:00'
        }
      ]
    },
    {
      id: '2',
      name: 'Gerente',
      description: 'Gestión de áreas específicas',
      color: 'bg-orange-500/20 text-orange-300 border-orange-400/50',
      permissions: [
        'ventas_ver', 'ventas_crear', 'ventas_editar', 'clientes_ver', 'clientes_crear',
        'vehiculos_ver', 'finanzas_ver', 'facturacion_ver', 'reportes_ver', 'reportes_exportar'
      ],
      users: [
        {
          id: '2',
          name: 'Ana María Rodríguez',
          email: 'ana.rodriguez@gammaservice.com',
          roleId: '2',
          status: 'active',
          lastLogin: '2024-01-15T09:15:00',
          createdAt: '2024-01-05T00:00:00'
        }
      ]
    },
    {
      id: '3',
      name: 'Asesor Comercial',
      description: 'Enfocado en ventas y atención al cliente',
      color: 'bg-blue-500/20 text-blue-300 border-blue-400/50',
      permissions: [
        'ventas_ver', 'ventas_crear', 'clientes_ver', 'clientes_crear', 'vehiculos_ver'
      ],
      users: [
        {
          id: '3',
          name: 'Laura Patricia Silva',
          email: 'laura.silva@gammaservice.com',
          roleId: '3',
          status: 'active',
          lastLogin: '2024-01-14T16:45:00',
          createdAt: '2024-01-08T00:00:00'
        }
      ]
    },
    {
      id: '4',
      name: 'Técnico de Taller',
      description: 'Especializado en servicios técnicos',
      color: 'bg-green-500/20 text-green-300 border-green-400/50',
      permissions: [
        'taller_ver', 'taller_servicios', 'tramites_ver', 'clientes_ver', 'vehiculos_ver'
      ],
      users: [
        {
          id: '4',
          name: 'Carlos Eduardo Méndez',
          email: 'carlos.mendez@gammaservice.com',
          roleId: '4',
          status: 'active',
          lastLogin: '2024-01-14T14:20:00',
          createdAt: '2024-01-10T00:00:00'
        }
      ]
    },
    {
      id: '5',
      name: 'Contador',
      description: 'Gestión financiera y contable',
      color: 'bg-purple-500/20 text-purple-300 border-purple-400/50',
      permissions: [
        'finanzas_ver', 'facturacion_ver', 'facturacion_crear', 'dian_acceso', 'reportes_ver'
      ],
      users: []
    }
  ]);

  const [users, setUsers] = useState<UserAccount[]>(
    roles.flatMap(role => role.users)
  );

  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'permissions'>('roles');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingRole, setEditingRole] = useState<UserRole | null>(null);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    roleId: '',
    password: '',
    confirmPassword: ''
  });

  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const categoryNames = {
    ventas: 'Ventas',
    finanzas: 'Finanzas',
    taller: 'Taller',
    administracion: 'Administración',
    reportes: 'Reportes'
  };

  const getStatusColor = (status: UserAccount['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-400/50';
      case 'inactive': return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
      case 'suspended': return 'bg-red-500/20 text-red-300 border-red-400/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
    }
  };

  const handleCreateRole = () => {
    if (!newRole.name || !newRole.description) {
      showAlert('error', 'Datos incompletos', 'Por favor complete todos los campos obligatorios');
      return;
    }

    const role: UserRole = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
      color: 'bg-blue-500/20 text-blue-300 border-blue-400/50',
      users: []
    };

    setRoles([...roles, role]);
    setShowCreateRole(false);
    setNewRole({ name: '', description: '', permissions: [] });
    showAlert('success', 'Rol creado', 'El rol ha sido creado exitosamente');
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.roleId || !newUser.password) {
      showAlert('error', 'Datos incompletos', 'Por favor complete todos los campos obligatorios');
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      showAlert('error', 'Error de contraseña', 'Las contraseñas no coinciden');
      return;
    }

    const user: UserAccount = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      roleId: newUser.roleId,
      status: 'active',
      lastLogin: '',
      createdAt: new Date().toISOString()
    };

    setUsers([...users, user]);
    setShowCreateUser(false);
    setNewUser({ name: '', email: '', roleId: '', password: '', confirmPassword: '' });
    showAlert('success', 'Usuario creado', 'El usuario ha sido creado exitosamente');
  };

  const handleDeleteRole = (role: UserRole) => {
    if (role.users.length > 0) {
      showAlert('error', 'No se puede eliminar', 'Este rol tiene usuarios asignados. Reasigne los usuarios antes de eliminar.');
      return;
    }

    showConfirmDialog(
      'Eliminar rol',
      `¿Está seguro de eliminar el rol "${role.name}"?`,
      () => {
        setRoles(roles.filter(r => r.id !== role.id));
        showAlert('success', 'Rol eliminado', 'El rol ha sido eliminado exitosamente');
      }
    );
  };

  const handleDeleteUser = (user: UserAccount) => {
    showConfirmDialog(
      'Eliminar usuario',
      `¿Está seguro de eliminar al usuario "${user.name}"?`,
      () => {
        setUsers(users.filter(u => u.id !== user.id));
        showAlert('success', 'Usuario eliminado', 'El usuario ha sido eliminado exitosamente');
      }
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalRoles = roles.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Shield className="h-8 w-8 mr-3 text-orange-300" />
              Gestión de Usuarios y Roles
            </h1>
            <p className="text-gray-200 mt-1">Control de acceso y permisos del sistema</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Total Usuarios</p>
              <p className="text-3xl font-bold text-white">{totalUsers}</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Usuarios Activos</p>
              <p className="text-3xl font-bold text-white">{activeUsers}</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Roles Definidos</p>
              <p className="text-3xl font-bold text-white">{totalRoles}</p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-full">
              <Shield className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Permisos</p>
              <p className="text-3xl font-bold text-white">{permissions.length}</p>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-full">
              <Key className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card p-1">
        <nav className="flex space-x-1">
          {[
            { id: 'roles', label: 'Roles', icon: Shield },
            { id: 'users', label: 'Usuarios', icon: Users },
            { id: 'permissions', label: 'Permisos', icon: Key }
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
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Roles del Sistema</h2>
            <button
              onClick={() => setShowCreateRole(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
            >
              <Shield className="h-4 w-4" />
              <span>Nuevo Rol</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="glass-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{role.name}</h3>
                    <p className="text-sm text-gray-300">{role.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setNewRole({
                          name: role.name,
                          description: role.description,
                          permissions: role.permissions
                        });
                        setShowCreateRole(true);
                      }}
                      className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-gray-800"
                      title="Editar rol"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role)}
                      className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2 focus:ring-offset-gray-800"
                      title="Eliminar rol"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-300">Usuarios asignados:</p>
                    <p className="text-xl font-bold text-white">{role.users.length}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-300">Permisos otorgados:</p>
                    <p className="text-xl font-bold text-white">{role.permissions.length}</p>
                  </div>

                  <div className="mt-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${role.color}`}>
                      {role.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <h2 className="text-lg font-semibold text-white">Usuarios del Sistema</h2>
            <button
              onClick={() => setShowCreateUser(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
            >
              <UserPlus className="h-4 w-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          {/* Filters */}
          <div className="glass-card p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              >
                <option value="">Todos los estados</option>
                <option value="active" className="bg-gray-800">Activo</option>
                <option value="inactive" className="bg-gray-800">Inactivo</option>
                <option value="suspended" className="bg-gray-800">Suspendido</option>
              </select>

              <button 
                onClick={() => showAlert('info', 'Filtros Avanzados', 'Panel de filtros avanzados próximamente')}
                className="btn-responsive bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors group"
              >
                <Filter className="h-4 w-4 group-hover:text-orange-300" />
                Filtros Avanzados
              </button>
            </div>
          </div>

          {/* Users List */}
          <div className="glass-card p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-medium text-gray-200">Usuario</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-200">Rol</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-200">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-200">Último Acceso</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-200">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const userRole = roles.find(r => r.id === user.roleId);
                    return (
                      <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                              <Users className="h-4 w-4 text-blue-300" />
                            </div>
                            <div>
                              <p className="font-medium text-white">{user.name}</p>
                              <p className="text-sm text-gray-300">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {userRole && (
                            <span className={`px-3 py-1 rounded-full text-xs border ${userRole.color}`}>
                              {userRole.name}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(user.status)}`}>
                            {user.status === 'active' ? 'Activo' : 
                             user.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-200">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString('es-CO') : 'Nunca'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setNewUser({
                                    name: user.name,
                                    email: user.email,
                                    roleId: user.roleId,
                                    password: '',
                                    confirmPassword: ''
                                  });
                                  setShowCreateUser(true);
                                }}
                                className="p-1.5 bg-blue-500/20 text-blue-300 rounded-full hover:bg-blue-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-gray-800"
                                title="Editar usuario"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="p-1.5 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2 focus:ring-offset-gray-800"
                                title="Eliminar usuario"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Permisos del Sistema</h2>
          
          {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
            <div key={category} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {categoryNames[category as keyof typeof categoryNames]}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPermissions.map((permission) => (
                  <div key={permission.id} className="glass-content p-4 rounded-lg border border-white/10">
                    <div className="flex items-start">
                      <div className="bg-orange-500/20 p-2 rounded-full mr-3">
                        <Key className="h-4 w-4 text-orange-300" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{permission.name}</h4>
                        <p className="text-sm text-gray-300 mt-1">{permission.description}</p>
                        <span className="text-xs text-gray-400 mt-2 block">ID: {permission.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Role Modal */}
      {showCreateRole && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}
                </h3>
                <p className="text-gray-300 mt-1">
                  {editingRole ? 'Modifica los detalles del rol' : 'Configura un nuevo rol con permisos específicos'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateRole(false);
                  setEditingRole(null);
                  setNewRole({ name: '', description: '', permissions: [] });
                }}
                className="text-gray-300 hover:text-white p-1 -m-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nombre del Rol *</label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                    placeholder="Nombre del rol"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Descripción *</label>
                  <input
                    type="text"
                    value={newRole.description}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                    placeholder="Descripción del rol"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-4">Permisos</label>
                {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                  <div key={category} className="mb-6">
                    <h4 className="text-md font-medium text-gray-200 mb-3">
                      {categoryNames[category as keyof typeof categoryNames]}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categoryPermissions.map((permission) => (
                        <label key={permission.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10">
                          <input
                            type="checkbox"
                            checked={newRole.permissions.includes(permission.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewRole({
                                  ...newRole,
                                  permissions: [...newRole.permissions, permission.id]
                                });
                              } else {
                                setNewRole({
                                  ...newRole,
                                  permissions: newRole.permissions.filter(p => p !== permission.id)
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                          />
                          <div>
                            <span className="text-white font-medium">{permission.name}</span>
                            <p className="text-sm text-gray-300">{permission.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 mt-8 border-t border-white/10">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => {
                    setShowCreateRole(false);
                    setEditingRole(null);
                    setNewRole({ name: '', description: '', permissions: [] });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600/30 text-gray-200 rounded-lg hover:bg-gray-600/40 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleCreateRole}
                  disabled={!newRole.name || newRole.permissions.length === 0}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-orange-500/50 ${
                    !newRole.name || newRole.permissions.length === 0
                      ? 'bg-orange-500/30 text-orange-200 cursor-not-allowed border border-orange-500/20'
                      : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:-translate-y-0.5 transform hover:shadow-orange-500/20'
                  }`}
                >
                  {editingRole ? (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Actualizar Rol</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Crear Rol</span>
                    </>
                  )}
                  {newRole.permissions.length > 0 && (
                    <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs font-normal">
                      {newRole.permissions.length} {newRole.permissions.length === 1 ? 'permiso' : 'permisos'}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-strong p-6 w-full max-w-md backdrop-blur-md bg-white/5 border border-white/10 rounded-xl shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="juan@gammaservice.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Rol *
                </label>
                <div className="relative">
                  <select
                    value={newUser.roleId}
                    onChange={(e) => setNewUser({...newUser, roleId: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-gray-800 text-white hover:bg-orange-500">Seleccionar rol</option>
                    {roles.map((role) => (
                      <option 
                        key={role.id} 
                        value={role.id} 
                        className="bg-gray-800 text-white hover:bg-orange-500 hover:text-white py-2 px-3"
                      >
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Contraseña *
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => {
                    setShowCreateUser(false);
                    setEditingUser(null);
                    setNewUser({ name: '', email: '', roleId: '', password: '', confirmPassword: '' });
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600/30 text-gray-200 rounded-lg hover:bg-gray-600/40 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleCreateUser}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  {editingUser ? (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Actualizar Usuario</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Crear Usuario</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};