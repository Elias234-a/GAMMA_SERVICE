import React, { useState } from 'react';
import { Plus, Search, Eye, Edit, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { AlertType, Client, Vehicle } from '../App';

interface PlateRequest {
  id: string;
  requestNumber: string;
  clientId: string;
  vehicleId: string;
  requestDate: string;
  estimatedDelivery: string;
  status: 'pending' | 'documents_review' | 'in_process' | 'ready' | 'delivered';
  plateNumber?: string;
  cost: number;
  documents: {
    vehicleTitle: boolean;
    insurance: boolean;
    identification: boolean;
    inspection: boolean;
  };
  notes: string;
}

interface PlatesModuleProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
  clients: Client[];
  vehicles: Vehicle[];
}

export const PlatesModule: React.FC<PlatesModuleProps> = ({ 
  showAlert, 
  showConfirmDialog, 
  clients,
  vehicles
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    clientId: '',
    vehicleId: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock plate requests data
  const [plateRequests, setPlateRequests] = useState<PlateRequest[]>([
    {
      id: '1',
      requestNumber: 'PLA-2024-001',
      clientId: '1',
      vehicleId: '1',
      requestDate: '2024-01-15',
      estimatedDelivery: '2024-02-15',
      status: 'ready',
      plateNumber: 'ABC123',
      cost: 450000,
      documents: {
        vehicleTitle: true,
        insurance: true,
        identification: true,
        inspection: true
      },
      notes: 'Trámite completado sin observaciones'
    },
    {
      id: '2',
      requestNumber: 'PLA-2024-002',
      clientId: '2',
      vehicleId: '2',
      requestDate: '2024-01-20',
      estimatedDelivery: '2024-02-20',
      status: 'in_process',
      cost: 450000,
      documents: {
        vehicleTitle: true,
        insurance: true,
        identification: true,
        inspection: false
      },
      notes: 'Pendiente inspección técnica vehicular'
    }
  ]);

  const steps = [
    { id: 1, title: 'Datos del Cliente', icon: 'user' },
    { id: 2, title: 'Vehículo', icon: 'car' },
    { id: 3, title: 'Documentos', icon: 'file' },
    { id: 4, title: 'Confirmación', icon: 'check' }
  ];

  const filteredRequests = plateRequests.filter(request => {
    const client = clients.find(c => c.id === request.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!formData.clientId) {
          newErrors.clientId = 'Debe seleccionar un cliente';
        }
        break;
      case 2:
        if (!formData.vehicleId) {
          newErrors.vehicleId = 'Debe seleccionar un vehículo';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRequest = () => {
    setCurrentStep(1);
    setFormData({
      clientId: '',
      vehicleId: '',
      notes: ''
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => prev + 1);
    } else {
      showAlert('error', 'Datos incompletos', 'Por favor complete todos los campos obligatorios');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSaveRequest = () => {
    if (!validateCurrentStep()) {
      showAlert('error', 'Datos inválidos', 'Por favor corrija los errores en el formulario');
      return;
    }

    const newRequest: PlateRequest = {
      id: Date.now().toString(),
      requestNumber: `PLA-${new Date().getFullYear()}-${String(plateRequests.length + 1).padStart(3, '0')}`,
      ...formData,
      requestDate: new Date().toISOString().split('T')[0],
      estimatedDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      cost: 450000,
      documents: {
        vehicleTitle: false,
        insurance: false,
        identification: false,
        inspection: false
      }
    };

    setPlateRequests(prev => [...prev, newRequest]);
    setShowAddModal(false);
    showAlert('success', 'Trámite iniciado', `Solicitud ${newRequest.requestNumber} creada exitosamente`);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente no encontrado';
  };

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : 'Vehículo no encontrado';
  };

  const getStatusBadge = (status: PlateRequest['status']) => {
    const statusConfig = {
      pending: { label: 'Pendiente', class: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30', icon: Clock },
      documents_review: { label: 'Revisión Documentos', class: 'bg-blue-500/20 text-blue-300 border border-blue-500/30', icon: FileText },
      in_process: { label: 'En Proceso', class: 'bg-purple-500/20 text-purple-300 border border-purple-500/30', icon: AlertTriangle },
      ready: { label: 'Lista', class: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', icon: CheckCircle },
      delivered: { label: 'Entregada', class: 'bg-gray-500/20 text-gray-300 border border-gray-500/30', icon: CheckCircle }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs rounded-full glass-content ${config.class}`}>
        <Icon className="h-3 w-3 mr-1 icon-enhanced" />
        {config.label}
      </span>
    );
  };

  const updateRequestStatus = (requestId: string, newStatus: PlateRequest['status']) => {
    setPlateRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    ));
    showAlert('success', 'Estado actualizado', 'El estado del trámite ha sido actualizado');
  };

  const generatePlateNumber = (requestId: string) => {
    showConfirmDialog(
      'Asignar Placa',
      '¿Desea generar y asignar el número de placa para este trámite?',
      () => {
        const plateNumber = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 900) + 100}`;
        setPlateRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, plateNumber, status: 'ready' } : req
        ));
        showAlert('success', 'Placa asignada', `Placa ${plateNumber} asignada exitosamente`);
      }
    );
  };

  const deliverPlate = (requestId: string) => {
    showConfirmDialog(
      'Entregar Placa',
      '¿Confirma la entrega de la placa al cliente?',
      () => {
        setPlateRequests(prev => prev.map(req => 
          req.id === requestId ? { ...req, status: 'delivered' } : req
        ));
        showAlert('success', 'Placa entregada', 'La placa ha sido entregada al cliente');
      }
    );
  };

  const availableVehicles = vehicles.filter(v => 
    v.status === 'sold' && !plateRequests.some(req => req.vehicleId === v.id && req.status !== 'delivered')
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Información del Cliente</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className={`w-full px-3 py-2 border ${
                  errors.clientId ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Seleccionar cliente</option>
                {clients.filter(c => c.status === 'active').map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.identification}
                  </option>
                ))}
              </select>
              {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
            </div>

            {formData.clientId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Datos del Cliente</h5>
                {(() => {
                  const client = clients.find(c => c.id === formData.clientId);
                  return client ? (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Nombre:</strong> {client.name}</p>
                      <p><strong>Identificación:</strong> {client.identification}</p>
                      <p><strong>Teléfono:</strong> {client.phone}</p>
                      <p><strong>Email:</strong> {client.email}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Selección de Vehículo</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehículo *
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                className={`w-full px-3 py-2 border ${
                  errors.vehicleId ? 'border-red-300' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Seleccionar vehículo</option>
                {availableVehicles.filter(v => !formData.clientId || v.clientId === formData.clientId).map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} {vehicle.year} - VIN: {vehicle.vin}
                  </option>
                ))}
              </select>
              {errors.vehicleId && <p className="mt-1 text-sm text-red-600">{errors.vehicleId}</p>}
            </div>

            {availableVehicles.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  No hay vehículos disponibles para trámite de placas. 
                  Solo se pueden tramitar placas para vehículos vendidos.
                </p>
              </div>
            )}

            {formData.vehicleId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-2">Datos del Vehículo</h5>
                {(() => {
                  const vehicle = vehicles.find(v => v.id === formData.vehicleId);
                  return vehicle ? (
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Marca:</strong> {vehicle.brand}</p>
                      <p><strong>Modelo:</strong> {vehicle.model}</p>
                      <p><strong>Año:</strong> {vehicle.year}</p>
                      <p><strong>Color:</strong> {vehicle.color}</p>
                      <p><strong>VIN:</strong> {vehicle.vin}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Documentos Requeridos</h4>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-900 mb-2">Documentos Necesarios</h5>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Título de propiedad del vehículo
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Póliza de seguro vigente
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Identificación del propietario
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Certificado de inspección técnica vehicular
                </li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Notas adicionales sobre el trámite..."
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Confirmación del Trámite</h4>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-4">Resumen del Trámite</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span>{getClientName(formData.clientId)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vehículo:</span>
                  <span>{getVehicleInfo(formData.vehicleId)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha de solicitud:</span>
                  <span>{new Date().toLocaleDateString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha estimada de entrega:</span>
                  <span>{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('es-CO')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Costo del trámite:</span>
                  <span>${(450000).toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> El cliente deberá presentar todos los documentos requeridos 
                en un plazo máximo de 5 días hábiles para continuar con el proceso.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trámite de Placas</h1>
            <p className="text-gray-600 mt-1">Gestione los trámites de placas vehiculares</p>
          </div>
          <button
            onClick={handleAddRequest}
            disabled={availableVehicles.length === 0}
            className="mt-4 sm:mt-0 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Trámite</span>
          </button>
        </div>
        {availableVehicles.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">No hay vehículos disponibles para trámite de placas</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trámites</p>
              <p className="text-3xl font-bold text-gray-900">{plateRequests.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-gray-900">
                {plateRequests.filter(r => r.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Proceso</p>
              <p className="text-3xl font-bold text-gray-900">
                {plateRequests.filter(r => ['documents_review', 'in_process'].includes(r.status)).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Listas</p>
              <p className="text-3xl font-bold text-gray-900">
                {plateRequests.filter(r => r.status === 'ready').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entregadas</p>
              <p className="text-3xl font-bold text-gray-900">
                {plateRequests.filter(r => r.status === 'delivered').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, número de trámite, placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="documents_review">Revisión Documentos</option>
              <option value="in_process">En Proceso</option>
              <option value="ready">Listas</option>
              <option value="delivered">Entregadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trámite</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.requestNumber}</div>
                      <div className="text-sm text-gray-500">
                        Solicitud: {new Date(request.requestDate).toLocaleDateString('es-CO')}
                      </div>
                      <div className="text-sm text-gray-500">
                        Entrega: {new Date(request.estimatedDelivery).toLocaleDateString('es-CO')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getClientName(request.clientId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getVehicleInfo(request.vehicleId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.plateNumber ? (
                      <div className="bg-gray-100 px-3 py-1 rounded-lg text-center font-mono text-sm font-bold">
                        {request.plateNumber}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(request.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${request.cost.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => showAlert('info', 'Ver trámite', `Mostrando detalles de ${request.requestNumber}`)}
                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {request.status === 'in_process' && !request.plateNumber && (
                        <button
                          onClick={() => generatePlateNumber(request.id)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded"
                          title="Asignar placa"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      )}
                      {request.status === 'ready' && (
                        <button
                          onClick={() => deliverPlate(request.id)}
                          className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-100 rounded"
                          title="Entregar placa"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      {request.status !== 'delivered' && (
                        <button
                          onClick={() => showAlert('info', 'Actualizar estado', 'Funcionalidad de actualización de estado disponible')}
                          className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-100 rounded"
                          title="Actualizar estado"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron trámites</p>
          </div>
        )}
      </div>

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Nuevo Trámite de Placa
              </h3>

              {/* Step Progress */}
              <div className="flex items-center justify-between mb-6">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step.id}
                    </div>
                    <div className="ml-2 hidden sm:block">
                      <p className={`text-sm font-medium ${
                        currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 sm:w-20 h-1 mx-2 ${
                        currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                ))}
              </div>

              {renderStepContent()}
              
              <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setCurrentStep(1);
                      setFormData({
                        clientId: '',
                        vehicleId: '',
                        notes: ''
                      });
                      setErrors({});
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  {currentStep > 1 && (
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      Anterior
                    </button>
                  )}
                </div>
                
                {currentStep < 4 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleSaveRequest}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Iniciar Trámite
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};