import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  DollarSign,
  Award,
  UserCheck,
  Briefcase,
  X,
  Save
} from 'lucide-react';
import { AlertType } from '../App';

interface Employee {
  id: string;
  name: string;
  identification: string;
  position: string;
  department: 'ventas' | 'taller' | 'administracion' | 'finanzas' | 'atencion_cliente';
  phone: string;
  email: string;
  address: string;
  hireDate: string;
  salary: number;
  commissionRate: number;
  status: 'active' | 'inactive' | 'vacation' | 'sick_leave';
  permissions: string[];
  performance: number; // 1-5 rating
  totalSales?: number;
}

interface HRModuleProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
}

export const HRModule: React.FC<HRModuleProps> = ({ showAlert, showConfirmDialog }) => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Ana María Rodríguez',
      identification: '12345678901',
      position: 'Gerente de Ventas',
      department: 'ventas',
      phone: '+57 300 123 4567',
      email: 'ana.rodriguez@gammaservice.com',
      address: 'Calle 100 #15-23, Bogotá',
      hireDate: '2023-01-15',
      salary: 4500000,
      commissionRate: 0.05,
      status: 'active',
      permissions: ['ventas', 'clientes', 'reportes'],
      performance: 4.8,
      totalSales: 125000000
    },
    {
      id: '2',
      name: 'Carlos Eduardo Méndez',
      identification: '98765432109',
      position: 'Mecánico Senior',
      department: 'taller',
      phone: '+57 310 987 6543',
      email: 'carlos.mendez@gammaservice.com',
      address: 'Carrera 45 #78-90, Medellín',
      hireDate: '2022-06-10',
      salary: 2800000,
      commissionRate: 0.02,
      status: 'active',
      permissions: ['taller', 'inventario'],
      performance: 4.5,
      totalSales: 0
    },
    {
      id: '3',
      name: 'Laura Patricia Silva',
      identification: '55566677788',
      position: 'Asesora Comercial',
      department: 'ventas',
      phone: '+57 320 555 6677',
      email: 'laura.silva@gammaservice.com',
      address: 'Avenida 68 #45-12, Bogotá',
      hireDate: '2023-08-01',
      salary: 2200000,
      commissionRate: 0.04,
      status: 'active',
      permissions: ['ventas', 'clientes'],
      performance: 4.2,
      totalSales: 85000000
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    identification: '',
    position: '',
    department: 'ventas',
    phone: '',
    email: '',
    address: '',
    salary: 0,
    commissionRate: 0,
    status: 'active',
    permissions: []
  });

  const departmentNames = {
    ventas: 'Ventas',
    taller: 'Taller',
    administracion: 'Administración',
    finanzas: 'Finanzas',
    atencion_cliente: 'Atención al Cliente'
  };

  const statusNames = {
    active: 'Activo',
    inactive: 'Inactivo',
    vacation: 'Vacaciones',
    sick_leave: 'Incapacidad'
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.identification.includes(searchTerm) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    const matchesStatus = !statusFilter || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.identification || !newEmployee.email) {
      showAlert('error', 'Datos incompletos', 'Por favor complete todos los campos obligatorios');
      return;
    }

    const employee: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name!,
      identification: newEmployee.identification!,
      position: newEmployee.position!,
      department: newEmployee.department as Employee['department'],
      phone: newEmployee.phone!,
      email: newEmployee.email!,
      address: newEmployee.address!,
      hireDate: new Date().toISOString().split('T')[0],
      salary: newEmployee.salary!,
      commissionRate: newEmployee.commissionRate!,
      status: newEmployee.status as Employee['status'],
      permissions: newEmployee.permissions!,
      performance: 3.0,
      totalSales: 0
    };

    setEmployees([...employees, employee]);
    setShowAddModal(false);
    setNewEmployee({
      name: '', identification: '', position: '', department: 'ventas',
      phone: '', email: '', address: '', salary: 0, commissionRate: 0,
      status: 'active', permissions: []
    });
    showAlert('success', 'Empleado agregado', 'El empleado ha sido registrado exitosamente');
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee(employee);
    setShowAddModal(true);
  };

  const handleUpdateEmployee = () => {
    if (!newEmployee.name || !newEmployee.identification || !newEmployee.email) {
      showAlert('error', 'Datos incompletos', 'Por favor complete todos los campos obligatorios');
      return;
    }

    const updatedEmployees = employees.map(emp => 
      emp.id === editingEmployee?.id ? { ...newEmployee, id: editingEmployee.id } as Employee : emp
    );

    setEmployees(updatedEmployees);
    setShowAddModal(false);
    setEditingEmployee(null);
    setNewEmployee({
      name: '', identification: '', position: '', department: 'ventas',
      phone: '', email: '', address: '', salary: 0, commissionRate: 0,
      status: 'active', permissions: []
    });
    showAlert('success', 'Empleado actualizado', 'Los datos del empleado han sido actualizados');
  };

  const handleDeleteEmployee = (employee: Employee) => {
    showConfirmDialog(
      'Eliminar empleado',
      `¿Está seguro de eliminar a ${employee.name}? Esta acción no se puede deshacer.`,
      () => {
        setEmployees(employees.filter(emp => emp.id !== employee.id));
        showAlert('success', 'Empleado eliminado', 'El empleado ha sido eliminado del sistema');
      }
    );
  };

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-400/50';
      case 'inactive': return 'bg-red-500/20 text-red-300 border-red-400/50';
      case 'vacation': return 'bg-blue-500/20 text-blue-300 border-blue-400/50';
      case 'sick_leave': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/50';
    }
  };

  const totalActiveEmployees = employees.filter(emp => emp.status === 'active').length;
  const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const averagePerformance = employees.reduce((sum, emp) => sum + emp.performance, 0) / employees.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Users className="h-8 w-8 mr-3 text-orange-300" />
              Recursos Humanos
            </h1>
            <p className="text-gray-200 mt-1">Gestión de personal, roles y comisiones</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
          >
            <UserPlus className="h-5 w-5" />
            <span>Nuevo Empleado</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Empleados Activos</p>
              <p className="text-3xl font-bold text-white">{totalActiveEmployees}</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Nómina Total</p>
              <p className="text-3xl font-bold text-white">
                ${totalPayroll.toLocaleString('es-CO')}
              </p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Rendimiento Promedio</p>
              <p className="text-3xl font-bold text-white">
                {averagePerformance.toFixed(1)}/5.0
              </p>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-full">
              <Award className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Departamentos</p>
              <p className="text-3xl font-bold text-white">5</p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-full">
              <Briefcase className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
            />
          </div>

          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-800 text-white">Todos los departamentos</option>
              {Object.entries(departmentNames).map(([key, name]) => (
                <option key={key} value={key} className="bg-gray-800 text-white hover:bg-orange-500">
                  {name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-800 text-white">Todos los estados</option>
              {Object.entries(statusNames).map(([key, name]) => (
                <option key={key} value={key} className="bg-gray-800 text-white hover:bg-orange-500">
                  {name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <button 
            onClick={() => showAlert('info', 'Filtros Avanzados', 'Panel de filtros avanzados próximamente')}
            className="btn-responsive bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors group"
          >
            <Filter className="h-4 w-4 group-hover:text-orange-300" />
            Filtros Avanzados
          </button>
        </div>
      </div>

      {/* Employees List */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Lista de Empleados ({filteredEmployees.length})</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 font-medium text-gray-200">Empleado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-200">Departamento</th>
                <th className="text-left py-3 px-4 font-medium text-gray-200">Cargo</th>
                <th className="text-left py-3 px-4 font-medium text-gray-200">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-200">Salario</th>
                <th className="text-left py-3 px-4 font-medium text-gray-200">Rendimiento</th>
                <th className="text-center py-3 px-4 font-medium text-gray-200">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className="bg-orange-500/20 p-2 rounded-full mr-3">
                        <Users className="h-4 w-4 text-orange-300" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{employee.name}</p>
                        <p className="text-sm text-gray-300">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-200">
                    {departmentNames[employee.department]}
                  </td>
                  <td className="py-4 px-4 text-gray-200">{employee.position}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(employee.status)}`}>
                      {statusNames[employee.status]}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-200">
                    ${employee.salary.toLocaleString('es-CO')}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span className="text-white">{employee.performance}/5.0</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="p-1.5 bg-blue-500/20 text-blue-300 rounded-full hover:bg-blue-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-gray-800"
                          title="Editar empleado"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee)}
                          className="p-1.5 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:ring-offset-2 focus:ring-offset-gray-800"
                          title="Eliminar empleado"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No se encontraron empleados</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
                </h3>
                <p className="text-gray-300 mt-1">
                  {editingEmployee ? 'Actualiza la información del empleado' : 'Completa el formulario para agregar un nuevo empleado'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEmployee(null);
                  setNewEmployee({
                    name: '', identification: '', position: '', department: 'ventas',
                    phone: '', email: '', address: '', salary: 0, commissionRate: 0,
                    status: 'active', permissions: []
                  });
                }}
                className="text-gray-300 hover:text-white p-1 -m-2 transition-colors rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Cerrar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newEmployee.name || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200"
                      placeholder="Juan Pérez"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Identificación *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newEmployee.identification || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, identification: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200"
                      placeholder="12345678901"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Cargo *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newEmployee.position || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200"
                      placeholder="Asesor Comercial"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Departamento *
                  </label>
                  <div className="relative">
                    <select
                      value={newEmployee.department || 'ventas'}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value as Employee['department']})}
                      className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 appearance-none cursor-pointer"
                    >
                      {Object.entries(departmentNames).map(([key, name]) => (
                        <option key={key} value={key} className="bg-gray-800 text-white hover:bg-orange-500">
                          {name}
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={newEmployee.phone || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">
                    Email Corporativo *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={newEmployee.email || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all duration-200"
                      placeholder="juan.perez@empresa.com"
                      pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Salario Base (COP) *
                    <input
                      type="number"
                      value={newEmployee.salary || ''}
                      onChange={(e) => setNewEmployee({...newEmployee, salary: Number(e.target.value)})}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                      placeholder="2500000"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Comisión (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={newEmployee.commissionRate || ''}
                    onChange={(e) => setNewEmployee({...newEmployee, commissionRate: Number(e.target.value)})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                    placeholder="0.05"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={newEmployee.address || ''}
                  onChange={(e) => setNewEmployee({...newEmployee, address: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="Calle 123 #45-67, Ciudad"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full pt-6 mt-8 border-t border-white/10">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEmployee(null);
                  setNewEmployee({
                    name: '', identification: '', position: '', department: 'ventas',
                    phone: '', email: '', address: '', salary: 0, commissionRate: 0,
                    status: 'active', permissions: []
                  });
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600/30 text-gray-200 rounded-lg hover:bg-gray-600/40 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <span>Cancelar</span>
              </button>
              <button
                onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
              >
                <Save className="h-5 w-5" />
                <span>{editingEmployee ? 'Actualizar' : 'Guardar'} Empleado</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};