import React, { useState } from 'react';
import { Shield, Eye, Calendar, User, Filter, Download, Search, AlertCircle } from 'lucide-react';
import { AlertType } from '../App';

interface AuditModuleProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'warning' | 'error';
  affectedRecord?: string;
}

export const AuditModule: React.FC<AuditModuleProps> = ({ showAlert }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      timestamp: '2024-01-22 14:30:15',
      user: 'admin@amplatform.com',
      action: 'Login',
      module: 'Autenticación',
      details: 'Inicio de sesión exitoso',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: '2',
      timestamp: '2024-01-22 14:35:22',
      user: 'admin@amplatform.com',
      action: 'Crear Usuario',
      module: 'Gestión de Usuarios',
      details: 'Usuario creado: juan.perez@email.com',
      ipAddress: '192.168.1.100',
      status: 'success',
      affectedRecord: 'juan.perez@email.com'
    },
    {
      id: '3',
      timestamp: '2024-01-22 14:42:11',
      user: 'admin@amplatform.com',
      action: 'Generar Factura',
      module: 'Facturación',
      details: 'Factura F-2024-001 generada por $1,200.00',
      ipAddress: '192.168.1.100',
      status: 'success',
      affectedRecord: 'F-2024-001'
    },
    {
      id: '4',
      timestamp: '2024-01-22 15:15:33',
      user: 'operador@amplatform.com',
      action: 'Intento Login Fallido',
      module: 'Autenticación',
      details: 'Contraseña incorrecta - 3 intentos',
      ipAddress: '192.168.1.105',
      status: 'warning'
    },
    {
      id: '5',
      timestamp: '2024-01-22 15:30:44',
      user: 'admin@amplatform.com',
      action: 'Eliminar Vehículo',
      module: 'Gestión de Vehículos',
      details: 'Vehículo ABC-123 eliminado del sistema',
      ipAddress: '192.168.1.100',
      status: 'warning',
      affectedRecord: 'ABC-123'
    },
    {
      id: '6',
      timestamp: '2024-01-22 16:20:55',
      user: 'system@amplatform.com',
      action: 'Backup Error',
      module: 'Sistema',
      details: 'Error en backup automático - disco lleno',
      ipAddress: 'localhost',
      status: 'error'
    },
    {
      id: '7',
      timestamp: '2024-01-22 16:45:12',
      user: 'admin@amplatform.com',
      action: 'Exportar Reporte',
      module: 'Reportes',
      details: 'Reporte financiero exportado a PDF',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: '8',
      timestamp: '2024-01-22 17:10:28',
      user: 'operador@amplatform.com',
      action: 'Procesar Placa',
      module: 'Trámite de Placas',
      details: 'Placa DEF-456 procesada exitosamente',
      ipAddress: '192.168.1.105',
      status: 'success',
      affectedRecord: 'DEF-456'
    }
  ]);

  const filterOptions = [
    { value: 'all', label: 'Todas las acciones' },
    { value: 'success', label: 'Exitosas' },
    { value: 'warning', label: 'Advertencias' },
    { value: 'error', label: 'Errores' },
    { value: 'login', label: 'Inicios de sesión' },
    { value: 'create', label: 'Creaciones' },
    { value: 'delete', label: 'Eliminaciones' },
    { value: 'update', label: 'Modificaciones' }
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         log.status === selectedFilter ||
                         (selectedFilter === 'login' && log.action.toLowerCase().includes('login')) ||
                         (selectedFilter === 'create' && log.action.toLowerCase().includes('crear')) ||
                         (selectedFilter === 'delete' && log.action.toLowerCase().includes('eliminar')) ||
                         (selectedFilter === 'update' && log.action.toLowerCase().includes('modificar'));
    
    const logDate = new Date(log.timestamp.split(' ')[0]);
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    const matchesDate = logDate >= fromDate && logDate <= toDate;
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Exitoso</span>;
      case 'warning':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Advertencia</span>;
      case 'error':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Error</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Desconocido</span>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'warning':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'error':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-500 rounded-full"></div>;
    }
  };

  const handleExportLogs = () => {
    showAlert('success', 'Logs exportados', 'Los registros de auditoría han sido exportados exitosamente');
  };

  const statsData = {
    total: auditLogs.length,
    success: auditLogs.filter(log => log.status === 'success').length,
    warnings: auditLogs.filter(log => log.status === 'warning').length,
    errors: auditLogs.filter(log => log.status === 'error').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Auditoría del Sistema</h2>
            <p className="text-white/80">Registro completo de actividades y eventos</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExportLogs}
              className="flex items-center space-x-2 px-4 py-2 text-white/80 glass-card hover:text-white transition-colors glass-hover"
            >
              <Download className="h-4 w-4 icon-enhanced" />
              <span>Exportar Logs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Eventos</p>
              <p className="text-2xl font-bold text-white">{statsData.total}</p>
            </div>
            <Shield className="h-8 w-8 text-[#2563EB] icon-enhanced" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Exitosos</p>
              <p className="text-2xl font-bold text-white">{statsData.success}</p>
            </div>
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Advertencias</p>
              <p className="text-2xl font-bold text-white">{statsData.warnings}</p>
            </div>
            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Errores</p>
              <p className="text-2xl font-bold text-white">{statsData.errors}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-[#EF4444] icon-enhanced" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-white/90 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70 icon-enhanced" />
              <input
                type="text"
                placeholder="Usuario, acción, módulo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/90 mb-2">Filtro</label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="dropdown-menu w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value} className="text-black">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/90 mb-2">Desde</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70 icon-enhanced" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/90 mb-2">Hasta</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70 icon-enhanced" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-card">
        <div className="p-6 border-b border-white/20">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Eye className="h-5 w-5 mr-2 icon-enhanced" />
            Registro de Actividades ({filteredLogs.length} eventos)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-4 px-6 text-white/90 font-medium">Estado</th>
                <th className="text-left py-4 px-6 text-white/90 font-medium">Fecha/Hora</th>
                <th className="text-left py-4 px-6 text-white/90 font-medium">Usuario</th>
                <th className="text-left py-4 px-6 text-white/90 font-medium">Acción</th>
                <th className="text-left py-4 px-6 text-white/90 font-medium">Módulo</th>
                <th className="text-left py-4 px-6 text-white/90 font-medium">Detalles</th>
                <th className="text-left py-4 px-6 text-white/90 font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      {getStatusBadge(log.status)}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white/90 text-sm font-mono">
                    {log.timestamp}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-white/70" />
                      <span className="text-white/90 text-sm">{log.user}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`font-medium ${
                      log.status === 'error' ? 'text-red-400' :
                      log.status === 'warning' ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-white/90">{log.module}</td>
                  <td className="py-4 px-6">
                    <div className="text-white/90 text-sm">
                      {log.details}
                      {log.affectedRecord && (
                        <div className="text-xs text-white/70 mt-1">
                          Registro: {log.affectedRecord}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-white/70 text-sm font-mono">
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center">
            <Eye className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">No se encontraron registros con los filtros aplicados</p>
          </div>
        )}
      </div>
    </div>
  );
};