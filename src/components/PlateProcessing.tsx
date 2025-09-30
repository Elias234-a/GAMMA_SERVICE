import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  Car, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { AlertType } from '../App';

interface PlateProcessingProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
}

interface PlateRequest {
  id: string;
  requestNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  vehicleType: string;
  vehicleModel: string;
  vehicleYear: string;
  plateType: 'standard' | 'commercial' | 'motorcycle' | 'diplomatic' | 'tourist';
  plateColor: 'white' | 'yellow' | 'red' | 'blue' | 'green';
  status: 'pending' | 'documents_review' | 'transit_valuation' | 'approved' | 'plate_ready' | 'delivered' | 'rejected';
  submissionDate: string;
  estimatedDelivery: string;
  totalCost: number;
  documents: {
    vehicleTitle: boolean;
    insurance: boolean;
    identification: boolean;
    inspection: boolean;
  };
  transitOfficer?: string;
  valuationNotes?: string;
  plateNumber?: string;
}

const plateColors = {
  white: { bg: '#FFFFFF', text: '#000000', name: 'Blanca (Particular)' },
  yellow: { bg: '#FACC15', text: '#000000', name: 'Amarilla (Comercial)' },
  red: { bg: '#DC2626', text: '#FFFFFF', name: 'Roja (Diplomática)' },
  blue: { bg: '#2563EB', text: '#FFFFFF', name: 'Azul (Oficial)' },
  green: { bg: '#16A34A', text: '#FFFFFF', name: 'Verde (Turística)' }
};

const plateTypes = {
  standard: 'Estándar',
  commercial: 'Comercial',
  motorcycle: 'Motocicleta',
  diplomatic: 'Diplomática',
  tourist: 'Turística'
};

export const PlateProcessing: React.FC<PlateProcessingProps> = ({ showAlert }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingRequest, setEditingRequest] = useState<PlateRequest | null>(null);

  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    vehicleType: '',
    vehicleModel: '',
    vehicleYear: '',
    plateType: 'standard' as PlateRequest['plateType'],
    plateColor: 'white' as PlateRequest['plateColor']
  });

  const [requests, setRequests] = useState<PlateRequest[]>([
    {
      id: '1',
      requestNumber: 'PLA-2024-001',
      clientName: 'María García López',
      clientPhone: '+52 55 1234 5678',
      clientEmail: 'maria.garcia@email.com',
      vehicleType: 'Automóvil',
      vehicleModel: 'Toyota Corolla',
      vehicleYear: '2023',
      plateType: 'standard',
      plateColor: 'white',
      status: 'plate_ready',
      submissionDate: '2024-01-15',
      estimatedDelivery: '2024-01-22',
      totalCost: 1200,
      documents: {
        vehicleTitle: true,
        insurance: true,
        identification: true,
        inspection: true
      },
      transitOfficer: 'Ing. Carlos Mendoza',
      valuationNotes: 'Vehículo en excelentes condiciones, documentación completa',
      plateNumber: 'ABC-123'
    },
    {
      id: '2',
      requestNumber: 'PLA-2024-002',
      clientName: 'Luis Rodríguez Pérez',
      clientPhone: '+52 55 8765 4321',
      clientEmail: 'luis.rodriguez@email.com',
      vehicleType: 'Camión',
      vehicleModel: 'Ford F-150',
      vehicleYear: '2022',
      plateType: 'commercial',
      plateColor: 'yellow',
      status: 'transit_valuation',
      submissionDate: '2024-01-18',
      estimatedDelivery: '2024-01-25',
      totalCost: 1800,
      documents: {
        vehicleTitle: true,
        insurance: true,
        identification: true,
        inspection: false
      },
      transitOfficer: 'Ing. Ana Martínez',
      valuationNotes: 'Pendiente inspección técnica vehicular'
    },
    {
      id: '3',
      requestNumber: 'PLA-2024-003',
      clientName: 'Carmen Jiménez Torres',
      clientPhone: '+52 55 9876 5432',
      clientEmail: 'carmen.jimenez@email.com',
      vehicleType: 'Motocicleta',
      vehicleModel: 'Honda CBR 600',
      vehicleYear: '2024',
      plateType: 'motorcycle',
      plateColor: 'white',
      status: 'pending',
      submissionDate: '2024-01-20',
      estimatedDelivery: '2024-01-27',
      totalCost: 800,
      documents: {
        vehicleTitle: true,
        insurance: false,
        identification: true,
        inspection: false
      }
    }
  ]);

  const steps = [
    { id: 1, title: 'Datos del Cliente', icon: User },
    { id: 2, title: 'Información del Vehículo', icon: Car },
    { id: 3, title: 'Documentos', icon: FileText },
    { id: 4, title: 'Pago y Confirmación', icon: CreditCard }
  ];

  const getStatusBadge = (status: PlateRequest['status']) => {
    const statusConfig = {
      pending: { label: 'Pendiente', class: 'bg-gray-100 text-gray-800' },
      documents_review: { label: 'Revisión Documentos', class: 'bg-blue-100 text-blue-800' },
      transit_valuation: { label: 'Valoración Tránsito', class: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Aprobado', class: 'bg-green-100 text-green-800' },
      plate_ready: { label: 'Placa Lista', class: 'bg-emerald-100 text-emerald-800' },
      delivered: { label: 'Entregado', class: 'bg-purple-100 text-purple-800' },
      rejected: { label: 'Rechazado', class: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status];
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>{config.label}</span>;
  };

  const getStatusIcon = (status: PlateRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'documents_review':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'transit_valuation':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'approved':
      case 'plate_ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const PlateVisualization = ({ plateColor, plateNumber, plateType }: { 
    plateColor: PlateRequest['plateColor'], 
    plateNumber?: string,
    plateType: PlateRequest['plateType']
  }) => {
    const color = plateColors[plateColor];
    const displayNumber = plateNumber || 'XXX-XXX';
    
    return (
      <div className="flex flex-col items-center space-y-2">
        <div 
          className="relative px-4 py-2 rounded-lg border-2 border-gray-800 shadow-lg"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          <div className="text-center">
            <div className="font-bold text-lg tracking-wider">{displayNumber}</div>
            <div className="text-xs font-medium">MÉXICO</div>
          </div>
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-gray-800 rounded-full"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-800 rounded-full"></div>
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gray-800 rounded-full"></div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-800 rounded-full"></div>
        </div>
        <div className="text-xs text-center">
          <div className="font-medium">{plateTypes[plateType]}</div>
          <div className="text-white/70">{color.name}</div>
        </div>
      </div>
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmitRequest = () => {
    const newRequest: PlateRequest = {
      id: Date.now().toString(),
      requestNumber: `PLA-2024-${String(requests.length + 1).padStart(3, '0')}`,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientEmail: formData.clientEmail,
      vehicleType: formData.vehicleType,
      vehicleModel: formData.vehicleModel,
      vehicleYear: formData.vehicleYear,
      plateType: formData.plateType,
      plateColor: formData.plateColor,
      status: 'pending',
      submissionDate: new Date().toISOString().split('T')[0],
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalCost: formData.plateType === 'motorcycle' ? 800 : formData.plateType === 'commercial' ? 1800 : 1200,
      documents: {
        vehicleTitle: false,
        insurance: false,
        identification: false,
        inspection: false
      }
    };

    setRequests(prev => [...prev, newRequest]);
    setShowNewRequest(false);
    setCurrentStep(1);
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      vehicleType: '',
      vehicleModel: '',
      vehicleYear: '',
      plateType: 'standard',
      plateColor: 'white'
    });
    showAlert('success', 'Solicitud creada', `Solicitud ${newRequest.requestNumber} creada exitosamente`);
  };

  const handleUpdateStatus = (requestId: string, newStatus: PlateRequest['status']) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: newStatus } : req
    ));
    showAlert('success', 'Estado actualizado', 'El estado de la solicitud ha sido actualizado');
  };

  const handleAssignTransitOfficer = (requestId: string, officer: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            transitOfficer: officer,
            status: req.status === 'documents_review' ? 'transit_valuation' : req.status
          } 
        : req
    ));
    showAlert('success', 'Oficial asignado', `Solicitud asignada a ${officer} para valoración`);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/90 mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70"
                  placeholder="Ingrese nombre completo"
                  required
                />
              </div>
              <div>
                <label className="block text-white/90 mb-2">Teléfono *</label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70"
                  placeholder="+52 55 1234 5678"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-white/90 mb-2">Correo Electrónico *</label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70"
                placeholder="cliente@email.com"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/90 mb-2">Tipo de Vehículo *</label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
                  required
                >
                  <option value="" className="text-black">Seleccionar tipo</option>
                  <option value="Automóvil" className="text-black">Automóvil</option>
                  <option value="Camión" className="text-black">Camión</option>
                  <option value="Motocicleta" className="text-black">Motocicleta</option>
                  <option value="SUV" className="text-black">SUV</option>
                  <option value="Van" className="text-black">Van</option>
                </select>
              </div>
              <div>
                <label className="block text-white/90 mb-2">Modelo *</label>
                <input
                  type="text"
                  value={formData.vehicleModel}
                  onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70"
                  placeholder="Toyota Corolla"
                  required
                />
              </div>
              <div>
                <label className="block text-white/90 mb-2">Año *</label>
                <input
                  type="number"
                  value={formData.vehicleYear}
                  onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70"
                  placeholder="2024"
                  min="1990"
                  max="2025"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/90 mb-2">Tipo de Placa *</label>
                <select
                  value={formData.plateType}
                  onChange={(e) => handleInputChange('plateType', e.target.value as PlateRequest['plateType'])}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
                  required
                >
                  <option value="standard" className="text-black">Estándar (Particular)</option>
                  <option value="commercial" className="text-black">Comercial</option>
                  <option value="motorcycle" className="text-black">Motocicleta</option>
                  <option value="diplomatic" className="text-black">Diplomática</option>
                  <option value="tourist" className="text-black">Turística</option>
                </select>
              </div>
              <div>
                <label className="block text-white/90 mb-2">Color de Placa *</label>
                <select
                  value={formData.plateColor}
                  onChange={(e) => handleInputChange('plateColor', e.target.value as PlateRequest['plateColor'])}
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
                  required
                >
                  <option value="white" className="text-black">Blanca (Particular)</option>
                  <option value="yellow" className="text-black">Amarilla (Comercial)</option>
                  <option value="red" className="text-black">Roja (Diplomática)</option>
                  <option value="blue" className="text-black">Azul (Oficial)</option>
                  <option value="green" className="text-black">Verde (Turística)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <PlateVisualization 
                plateColor={formData.plateColor}
                plateType={formData.plateType}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="glass-card p-4">
              <h4 className="text-white font-semibold mb-4">Documentos Requeridos</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Título de Propiedad</span>
                  <span className="text-red-400">Requerido</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Póliza de Seguro Vigente</span>
                  <span className="text-red-400">Requerido</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Identificación Oficial</span>
                  <span className="text-red-400">Requerido</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-white">Inspección Técnica Vehicular</span>
                  <span className="text-yellow-400">Pendiente valoración</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Nota:</strong> Los documentos serán revisados por nuestro equipo. 
                La inspección técnica será programada según la valoración del oficial de tránsito asignado.
              </p>
            </div>
          </div>
        );

      case 4:
        const estimatedCost = formData.plateType === 'motorcycle' ? 800 : 
                             formData.plateType === 'commercial' ? 1800 : 1200;
        return (
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h4 className="text-white font-semibold mb-4">Resumen de la Solicitud</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-white/70 text-sm">Cliente</label>
                    <p className="text-white font-medium">{formData.clientName}</p>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Vehículo</label>
                    <p className="text-white font-medium">{formData.vehicleModel} {formData.vehicleYear}</p>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm">Tipo</label>
                    <p className="text-white font-medium">{plateTypes[formData.plateType]}</p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <PlateVisualization 
                    plateColor={formData.plateColor}
                    plateType={formData.plateType}
                  />
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex justify-between items-center text-xl font-bold text-white">
                  <span>Total a Pagar:</span>
                  <span>${estimatedCost.toLocaleString()}</span>
                </div>
                <p className="text-white/70 text-sm mt-2">
                  Incluye: Trámite, placa, documentación y valoración técnica
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (showNewRequest) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Nueva Solicitud de Placa</h2>
              <p className="text-white/80">Complete los pasos para procesar una nueva placa</p>
            </div>
            <button
              onClick={() => setShowNewRequest(false)}
              className="text-white/80 hover:text-white px-4 py-2 glass-card transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-center w-full sm:w-auto">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${currentStep >= step.id 
                      ? 'bg-[#2563EB] border-[#2563EB] text-white' 
                      : 'border-white/30 text-white/60'
                    }
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3 flex-1 sm:flex-none">
                    <p className={`font-medium ${currentStep >= step.id ? 'text-white' : 'text-white/60'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden sm:block w-12 h-0.5 bg-white/20 mx-4"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="glass-card p-4 sm:p-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="glass-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            {currentStep < 4 ? (
              <button
                onClick={handleNextStep}
                className="btn-electric text-white py-2 px-6 rounded-lg font-semibold"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSubmitRequest}
                className="btn-emerald text-white py-2 px-6 rounded-lg font-semibold"
              >
                Enviar Solicitud
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Trámite de Placas</h2>
            <p className="text-white/80">Gestión completa de solicitudes de placas vehiculares</p>
          </div>
          <button
            onClick={() => setShowNewRequest(true)}
            className="btn-electric text-white py-2 px-4 rounded-lg font-semibold flex items-center space-x-2 w-full sm:w-auto justify-center"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Solicitud</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-4 sm:p-6">
          <div className="text-center">
            <p className="text-white/80 text-sm">Total Solicitudes</p>
            <p className="text-xl sm:text-2xl font-bold text-white">{requests.length}</p>
          </div>
        </div>
        <div className="glass-card p-4 sm:p-6">
          <div className="text-center">
            <p className="text-white/80 text-sm">En Valoración</p>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {requests.filter(r => r.status === 'transit_valuation').length}
            </p>
          </div>
        </div>
        <div className="glass-card p-4 sm:p-6">
          <div className="text-center">
            <p className="text-white/80 text-sm">Placas Listas</p>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {requests.filter(r => r.status === 'plate_ready').length}
            </p>
          </div>
        </div>
        <div className="glass-card p-4 sm:p-6">
          <div className="text-center">
            <p className="text-white/80 text-sm">Entregadas</p>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {requests.filter(r => r.status === 'delivered').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70 icon-enhanced" />
              <input
                type="text"
                placeholder="Buscar por cliente, número de solicitud..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
            >
              <option value="all" className="text-black">Todos los estados</option>
              <option value="pending" className="text-black">Pendiente</option>
              <option value="documents_review" className="text-black">Revisión Documentos</option>
              <option value="transit_valuation" className="text-black">Valoración Tránsito</option>
              <option value="approved" className="text-black">Aprobado</option>
              <option value="plate_ready" className="text-black">Placa Lista</option>
              <option value="delivered" className="text-black">Entregado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="glass-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-4 px-4 sm:px-6 text-white/90 font-medium">Solicitud</th>
                <th className="text-left py-4 px-4 sm:px-6 text-white/90 font-medium">Cliente</th>
                <th className="text-left py-4 px-4 sm:px-6 text-white/90 font-medium">Vehículo</th>
                <th className="text-left py-4 px-4 sm:px-6 text-white/90 font-medium">Placa</th>
                <th className="text-left py-4 px-4 sm:px-6 text-white/90 font-medium">Estado</th>
                <th className="text-left py-4 px-4 sm:px-6 text-white/90 font-medium">Oficial Tránsito</th>
                <th className="text-left py-4 px-4 sm:px-6 text-white/90 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-4 px-4 sm:px-6">
                    <div>
                      <p className="text-white font-medium">{request.requestNumber}</p>
                      <p className="text-white/70 text-sm">{request.submissionDate}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <div>
                      <p className="text-white font-medium">{request.clientName}</p>
                      <p className="text-white/70 text-sm">{request.clientPhone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <div>
                      <p className="text-white">{request.vehicleModel}</p>
                      <p className="text-white/70 text-sm">{request.vehicleType} {request.vehicleYear}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center space-x-3">
                      <PlateVisualization 
                        plateColor={request.plateColor}
                        plateNumber={request.plateNumber}
                        plateType={request.plateType}
                      />
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(request.status)}
                      {getStatusBadge(request.status)}
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    {request.transitOfficer ? (
                      <div>
                        <p className="text-white text-sm">{request.transitOfficer}</p>
                        {request.valuationNotes && (
                          <p className="text-white/70 text-xs mt-1">{request.valuationNotes}</p>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAssignTransitOfficer(request.id, 'Ing. Carlos Mendoza')}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        Asignar oficial
                      </button>
                    )}
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => showAlert('info', 'Ver detalles', `Abriendo detalles de ${request.requestNumber}`)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingRequest(request)}
                        className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/70">No se encontraron solicitudes con los filtros aplicados</p>
          </div>
        )}
      </div>
    </div>
  );
};