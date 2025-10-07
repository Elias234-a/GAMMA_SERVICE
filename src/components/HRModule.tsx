import React, { useState, useEffect } from 'react';
import hrService from '../services/hrService';
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
  Briefcase
} from 'lucide-react';
import { AlertType } from '../App';
import { FormInput, FormSelect } from './ui/FormInput';

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
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Load employees from backend
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const response = await hrService.getAll();
        setEmployees(response.data || []);
      } catch (error) {
        console.error('Error loading employees:', error);
      }
    };
    loadEmployees();
  }, []);
  
  const [employeesOLD] = useState<Employee[]>([
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-strong w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-white mb-4">
                {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Nombre Completo"
                  name="name"
                  value={newEmployee.name || ''}
                  onChange={(value) => setNewEmployee({...newEmployee, name: value})}
                  placeholder="Juan Pérez"
                  required
                  textOnly
                />

                <FormInput
                  label="Identificación"
                  name="identification"
                  value={newEmployee.identification || ''}
                  onChange={(value) => setNewEmployee({...newEmployee, identification: value.replace(/[^0-9]/g, '')})}
                  placeholder="12345678901"
                  required
                  maxLength={11}
                />

                <FormInput
                  label="Cargo"
                  name="position"
                  value={newEmployee.position || ''}
                  onChange={(value) => setNewEmployee({...newEmployee, position: value})}
                  placeholder="Asesor Comercial"
                  required
                />

                <FormSelect
                  label="Departamento"
                  name="department"
                  value={newEmployee.department || 'ventas'}
                  onChange={(value) => setNewEmployee({...newEmployee, department: value as Employee['department']})}
                  options={Object.entries(departmentNames).map(([key, name]) => ({ value: key, label: name }))}
                  required
                />

                <FormInput
                  label="Teléfono"
                  name="phone"
                  type="tel"
                  value={newEmployee.phone || ''}
                  onChange={(value) => setNewEmployee({...newEmployee, phone: value})}
                  placeholder="+57 300 123 4567"
                  required
                />

                <FormInput
                  label="Email Corporativo"
                  name="email"
                  type="email"
                  value={newEmployee.email || ''}
                  onChange={(value) => setNewEmployee({...newEmployee, email: value})}
                  placeholder="juan.perez@empresa.com"
                  required
                />

                <FormInput
                  label="Salario Base (COP)"
                  name="salary"
                  type="number"
                  value={newEmployee.salary || 0}
                  onChange={(value) => setNewEmployee({...newEmployee, salary: Number(value)})}
                  placeholder="2500000"
                  min={0}
                  required
                />

                <FormInput
                  label="Comisión (%)"
                  name="commissionRate"
                  type="number"
                  value={newEmployee.commissionRate || 0}
                  onChange={(value) => setNewEmployee({...newEmployee, commissionRate: Number(value)})}
                  placeholder="0.05"
                  min={0}
                  max={1}
                  required
                />
              </div>

              <FormInput
                label="Dirección"
                name="address"
                value={newEmployee.address || ''}
                onChange={(value) => setNewEmployee({...newEmployee, address: value})}
                placeholder="Calle 123 #45-67, Ciudad"
                required
              />
            </div>

              <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
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
                  className="px-6 py-3 text-gray-200 bg-white/10 hover:bg-white/20 rounded-lg transition-all glass-hover border border-white/20"
                >
                  Cancelar
                </button>
                <button
                  onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                  className="px-6 py-3 btn-emerald text-white rounded-lg transition-all glass-hover"
                >
                  {editingEmployee ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};