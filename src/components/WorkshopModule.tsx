import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, Clock, User, CheckCircle, AlertCircle, Settings, Car, FileText, DollarSign, Phone, MapPin } from 'lucide-react';
import { AlertType } from '../App';
import workshopService from '../services/workshopService';

interface WorkshopModuleProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
}

interface ServiceOrder {
  id: string;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  vehicle: string;
  vehiclePlate: string;
  serviceType: 'maintenance' | 'repair' | 'warranty' | 'inspection';
  description: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number; // en horas
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending_parts';
  technician: string;
  services: ServiceItem[];
  totalCost: number;
  createdAt: string;
  completedAt?: string;
  notes: string;
  warranty: boolean;
  warrantyExpiry?: string;
}

interface ServiceItem {
  id: string;
  name: string;
  type: 'service' | 'part';
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Technician {
  id: string;
  name: string;
  specialties: string[];
  workload: number; // 0-100%
  rating: number;
}

export const WorkshopModule: React.FC<WorkshopModuleProps> = ({ showAlert, showConfirmDialog }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'calendar' | 'technicians' | 'reports'>('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ServiceOrder | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Omit<ServiceOrder, 'id' | 'orderNumber' | 'createdAt' | 'completedAt' | 'totalCost' | 'services'>>({
    clientName: '',
    clientPhone: '',
    vehicle: '',
    vehiclePlate: '',
    serviceType: 'maintenance',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    estimatedDuration: 1,
    status: 'scheduled',
    technician: '',
    notes: '',
    warranty: false,
    warrantyExpiry: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Format phone number as user types
  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return `+${cleaned}`;
    if (cleaned.length <= 5) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
    if (cleaned.length <= 9) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`;
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)}`;
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    // Format phone number if it's the phone field
    if (field === 'clientPhone' && typeof value === 'string') {
      value = formatPhoneNumber(value);
    }
    
    // Format vehicle plate to uppercase
    if (field === 'vehiclePlate' && typeof value === 'string') {
      value = value.toUpperCase();
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error if it exists
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Validate client name
    if (!formData.clientName.trim()) {
      errors.clientName = 'El nombre del cliente es obligatorio';
    } else if (formData.clientName.trim().length < 3) {
      errors.clientName = 'El nombre debe tener al menos 3 caracteres';
    }
    
    // Validate phone (minimum 10 digits)
    const phoneDigits = formData.clientPhone.replace(/\D/g, '');
    if (!phoneDigits) {
      errors.clientPhone = 'El teléfono es obligatorio';
    } else if (phoneDigits.length < 10) {
      errors.clientPhone = 'El teléfono debe tener al menos 10 dígitos';
    }
    
    // Validate vehicle
    if (!formData.vehicle.trim()) {
      errors.vehicle = 'El vehículo es obligatorio';
    } else if (formData.vehicle.trim().length < 2) {
      errors.vehicle = 'Ingrese un modelo de vehículo válido';
    }
    
    // Validate plate
    if (!formData.vehiclePlate.trim()) {
      errors.vehiclePlate = 'La placa es obligatoria';
    } else if (!/^[A-Za-z]{3}\d{3}$/.test(formData.vehiclePlate)) {
      errors.vehiclePlate = 'Formato de placa inválido (ej: ABC123)';
    }
    
    // Validate description
    if (!formData.description.trim()) {
      errors.description = 'La descripción es obligatoria';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres';
    }
    
    // Validate technician
    if (!formData.technician) {
      errors.technician = 'Debe seleccionar un técnico';
    }
    
    // Validate date and time
    const selectedDate = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    const now = new Date();
    
    if (selectedDate < now) {
      errors.scheduledDate = 'La fecha y hora deben ser futuras';
    }
    
    // Validate warranty
    if (formData.warranty && !formData.warrantyExpiry) {
      errors.warrantyExpiry = 'Debe especificar la fecha de vencimiento de la garantía';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showAlert('error', 'Error', 'Por favor corrija los errores en el formulario');
      return;
    }
    
    // Confirm before creating order
    showConfirmDialog(
      'Confirmar orden de servicio',
      '¿Está seguro de crear esta nueva orden de servicio?',
      () => {
        const newOrder: ServiceOrder = {
          ...formData,
          id: Date.now().toString(),
          orderNumber: `OS-${new Date().getFullYear()}-${String(serviceOrders.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
          services: [],
          totalCost: 0,
          status: 'scheduled'
        };
        
        setServiceOrders(prev => [...prev, newOrder]);
        showAlert('success', 'Éxito', 'Orden de servicio creada correctamente');
        
        // Close modal and reset form
        setShowOrderModal(false);
        setFormData({
          clientName: '',
          clientPhone: '',
          vehicle: '',
          vehiclePlate: '',
          serviceType: 'maintenance',
          description: '',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '09:00',
          estimatedDuration: 1,
          status: 'scheduled',
          technician: '',
          notes: '',
          warranty: false,
          warrantyExpiry: ''
        });
      }
    );
  };

  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  
  // Load orders from backend
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await workshopService.getAll();
        setServiceOrders(response.data || []);
      } catch (error) {
        console.error('Error loading orders:', error);
      }
    };
    loadOrders();
  }, []);
  
  const [serviceOrdersOLD] = useState<ServiceOrder[]>([
    {
      id: '1',
      orderNumber: 'OS-2024-001',
      clientName: 'María García López',
      clientPhone: '+57 300 123 4567',
      vehicle: 'Toyota Corolla 2023',
      vehiclePlate: 'ABC123',
      serviceType: 'maintenance',
      description: 'Mantenimiento preventivo de 20,000 km',
      scheduledDate: '2024-01-25',
      scheduledTime: '09:00',
      estimatedDuration: 3,
      status: 'scheduled',
      technician: 'Carlos Méndez',
      services: [
        { id: '1', name: 'Cambio de aceite y filtro', type: 'service', quantity: 1, unitPrice: 85000, total: 85000 },
        { id: '2', name: 'Filtro de aire', type: 'part', quantity: 1, unitPrice: 35000, total: 35000 },
        { id: '3', name: 'Revisión general', type: 'service', quantity: 1, unitPrice: 50000, total: 50000 }
      ],
      totalCost: 170000,
      createdAt: '2024-01-20',
      notes: 'Cliente prefiere cita en la mañana',
      warranty: true,
      warrantyExpiry: '2024-07-25'
    },
    {
      id: '2',
      orderNumber: 'OS-2024-002',
      clientName: 'Roberto Silva',
      clientPhone: '+57 310 987 6543',
      vehicle: 'Chevrolet Spark 2022',
      vehiclePlate: 'DEF456',
      serviceType: 'repair',
      description: 'Reparación sistema de frenos',
      scheduledDate: '2024-01-24',
      scheduledTime: '14:00',
      estimatedDuration: 4,
      status: 'in_progress',
      technician: 'Luis Rodríguez',
      services: [
        { id: '1', name: 'Pastillas de freno delanteras', type: 'part', quantity: 1, unitPrice: 120000, total: 120000 },
        { id: '2', name: 'Discos de freno', type: 'part', quantity: 2, unitPrice: 180000, total: 360000 },
        { id: '3', name: 'Mano de obra especializada', type: 'service', quantity: 4, unitPrice: 45000, total: 180000 }
      ],
      totalCost: 660000,
      createdAt: '2024-01-22',
      notes: 'Urgente - problema de seguridad',
      warranty: true,
      warrantyExpiry: '2024-07-24'
    },
    {
      id: '3',
      orderNumber: 'OS-2024-003',
      clientName: 'Ana Martínez',
      clientPhone: '+57 320 456 7890',
      vehicle: 'Nissan Sentra 2023',
      vehiclePlate: 'GHI789',
      serviceType: 'warranty',
      description: 'Reparación bajo garantía - problema eléctrico',
      scheduledDate: '2024-01-23',
      scheduledTime: '10:30',
      estimatedDuration: 2,
      status: 'completed',
      technician: 'Diego Fernández',
      services: [
        { id: '1', name: 'Diagnóstico eléctrico', type: 'service', quantity: 1, unitPrice: 80000, total: 80000 },
        { id: '2', name: 'Módulo de control', type: 'part', quantity: 1, unitPrice: 0, total: 0 }
      ],
      totalCost: 80000,
      createdAt: '2024-01-20',
      completedAt: '2024-01-23',
      notes: 'Reparación cubierta por garantía de fábrica',
      warranty: true,
      warrantyExpiry: '2024-12-23'
    }
  ]);

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [techniciansOLD] = useState<Technician[]>([
    {
      id: '1',
      name: 'Carlos Méndez',
      specialties: ['Mantenimiento General', 'Motor', 'Transmisión'],
      workload: 75,
      rating: 4.8
    },
    {
      id: '2',
      name: 'Luis Rodríguez',
      specialties: ['Frenos', 'Suspensión', 'Seguridad'],
      workload: 90,
      rating: 4.9
    },
    {
      id: '3',
      name: 'Diego Fernández',
      specialties: ['Sistema Eléctrico', 'Diagnóstico', 'Aires Acondicionados'],
      workload: 60,
      rating: 4.7
    },
    {
      id: '4',
      name: 'Miguel Torres',
      specialties: ['Carrocería', 'Pintura', 'Soldadura'],
      workload: 45,
      rating: 4.6
    }
  ]);

  const filteredOrders = serviceOrders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ServiceOrder['status']) => {
    const statusConfig = {
      scheduled: { label: 'Programado', class: 'bg-blue-500/20 text-blue-300' },
      in_progress: { label: 'En Proceso', class: 'bg-yellow-500/20 text-yellow-300' },
      completed: { label: 'Completado', class: 'bg-green-500/20 text-green-300' },
      cancelled: { label: 'Cancelado', class: 'bg-red-500/20 text-red-300' },
      pending_parts: { label: 'Esperando Repuestos', class: 'bg-orange-500/20 text-orange-300' }
    };
    const config = statusConfig[status];
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class} backdrop-blur-sm`}>{config.label}</span>;
  };

  const getServiceTypeIcon = (type: ServiceOrder['serviceType']) => {
    switch (type) {
      case 'maintenance': return <Settings className="h-4 w-4 text-blue-400" />;
      case 'repair': return <Wrench className="h-4 w-4 text-red-400" />;
      case 'warranty': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'inspection': return <FileText className="h-4 w-4 text-purple-400" />;
      default: return <Car className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOrderStats = () => {
    const total = serviceOrders.length;
    const scheduled = serviceOrders.filter(o => o.status === 'scheduled').length;
    const inProgress = serviceOrders.filter(o => o.status === 'in_progress').length;
    const completed = serviceOrders.filter(o => o.status === 'completed').length;
    const totalRevenue = serviceOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.totalCost, 0);
    
    return { total, scheduled, inProgress, completed, totalRevenue };
  };

  const stats = getOrderStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Postventa y Taller</h1>
            <p className="text-gray-200 mt-1">Gestión de servicios, mantenimiento y garantías</p>
          </div>
          <button
            onClick={() => setShowOrderModal(true)}
            className="mt-4 sm:mt-0 btn-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Nueva Orden</span>
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Total Órdenes</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <FileText className="h-6 w-6 text-blue-400 icon-enhanced" />
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Programadas</p>
              <p className="text-2xl font-bold text-white">{stats.scheduled}</p>
            </div>
            <Calendar className="h-6 w-6 text-blue-400 icon-enhanced" />
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">En Proceso</p>
              <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
            </div>
            <Clock className="h-6 w-6 text-yellow-400 icon-enhanced" />
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Completadas</p>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-400 icon-enhanced" />
          </div>
        </div>
        
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Ingresos</p>
              <p className="text-xl font-bold text-white">${stats.totalRevenue.toLocaleString('es-CO')}</p>
            </div>
            <DollarSign className="h-6 w-6 text-green-400 icon-enhanced" />
          </div>
        </div>
      </div>

      {/* New Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Nueva Orden de Servicio</h3>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Info */}
                <div className="space-y-5">
                  <h4 className="text-lg font-semibold text-white/80 border-b border-white/10 pb-2">Datos del Cliente</h4>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Nombre Completo *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={e => handleInputChange('clientName', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          formErrors.clientName ? 'border-red-400' : 'border-white/10 hover:border-white/20'
                        }`}
                        placeholder="Juan Pérez"
                      />
                    </div>
                    {formErrors.clientName && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        {formErrors.clientName}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Teléfono *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={e => handleInputChange('clientPhone', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          formErrors.clientPhone ? 'border-red-400' : 'border-white/10 hover:border-white/20'
                        }`}
                        placeholder="+57 300 123 4567"
                        maxLength={15}
                      />
                    </div>
                    {formErrors.clientPhone && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        {formErrors.clientPhone}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Vehicle Info */}
                <div className="space-y-5">
                  <h4 className="text-lg font-semibold text-white/80 border-b border-white/10 pb-2">Datos del Vehículo</h4>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Vehículo *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Car className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.vehicle}
                        onChange={e => handleInputChange('vehicle', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                          formErrors.vehicle ? 'border-red-400' : 'border-white/10 hover:border-white/20'
                        }`}
                        placeholder="Ej: Toyota Corolla 2023"
                      />
                    </div>
                    {formErrors.vehicle && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        {formErrors.vehicle}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Placa *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <FileText className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={formData.vehiclePlate}
                        onChange={e => handleInputChange('vehiclePlate', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all uppercase ${
                          formErrors.vehiclePlate ? 'border-red-400' : 'border-white/10 hover:border-white/20'
                        }`}
                        placeholder="ABC123"
                        maxLength={6}
                      />
                    </div>
                    {formErrors.vehiclePlate && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        {formErrors.vehiclePlate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Details */}
                <div className="space-y-5">
                  <h4 className="text-lg font-semibold text-white/80 border-b border-white/10 pb-2">Detalles del Servicio</h4>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Tipo de Servicio *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Wrench className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        value={formData.serviceType}
                        onChange={e => handleInputChange('serviceType', e.target.value as any)}
                        className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                      >
                        <option value="maintenance">Mantenimiento</option>
                        <option value="repair">Reparación</option>
                        <option value="warranty">Garantía</option>
                        <option value="inspection">Inspección</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Descripción *</label>
                    <div className="relative">
                      <div className="absolute top-3 left-3">
                        <FileText className="h-4 w-4 text-gray-400" />
                      </div>
                      <textarea
                        value={formData.description}
                        onChange={e => handleInputChange('description', e.target.value)}
                        className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all min-h-[100px] ${
                          formErrors.description ? 'border-red-400' : 'border-white/10 hover:border-white/20'
                        }`}
                        placeholder="Describa el servicio a realizar..."
                      />
                    </div>
                    {formErrors.description && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        {formErrors.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Schedule & Technician */}
                <div className="space-y-5">
                  <h4 className="text-lg font-semibold text-white/80 border-b border-white/10 pb-2">Programación</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-white/80 mb-1.5">Fecha *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={formData.scheduledDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={e => handleInputChange('scheduledDate', e.target.value)}
                          className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                            formErrors.scheduledDate ? 'border-red-400' : 'border-white/10 hover:border-white/20'
                          }`}
                        />
                      </div>
                      {formErrors.scheduledDate && (
                        <p className="mt-1 text-xs text-red-400 flex items-center">
                          <AlertCircle className="h-3.5 w-3.5 mr-1" />
                          {formErrors.scheduledDate}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-white/80 mb-1.5">Hora *</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Clock className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                          value={formData.scheduledTime}
                          onChange={e => handleInputChange('scheduledTime', e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                        >
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return [
                              <option key={`${hour}:00`} value={`${hour}:00`}>{hour}:00</option>,
                              <option key={`${hour}:30`} value={`${hour}:30`}>{hour}:30</option>
                            ];
                          })}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Duración Estimada</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Clock className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        value={formData.estimatedDuration}
                        onChange={e => handleInputChange('estimatedDuration', Number(e.target.value))}
                        className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                      >
                        <option value={0.5}>30 minutos</option>
                        <option value={1}>1 hora</option>
                        <option value={1.5}>1 hora 30 minutos</option>
                        <option value={2}>2 horas</option>
                        <option value={2.5}>2 horas 30 minutos</option>
                        <option value={3}>3 horas</option>
                        <option value={4}>4 horas</option>
                        <option value={5}>5 horas</option>
                        <option value={6}>6 horas</option>
                        <option value={8}>8 horas (1 día)</option>
                        <option value={16}>16 horas (2 días)</option>
                        <option value={24}>24 horas (3 días)</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-white/80 mb-1.5">Técnico *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <select
                        value={formData.technician}
                        onChange={e => handleInputChange('technician', e.target.value)}
                        className={`w-full pl-10 pr-10 py-2.5 bg-white/5 border rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none ${
                          formErrors.technician ? 'border-red-400' : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <option value="">Seleccione un técnico</option>
                        {technicians.map(tech => (
                          <option key={tech.id} value={tech.name}>
                            {tech.name} ({tech.specialties[0]})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {formErrors.technician && (
                      <p className="mt-1 text-xs text-red-400 flex items-center">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" />
                        {formErrors.technician}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Additional Notes & Warranty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Notas Adicionales</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3">
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                    <textarea
                      value={formData.notes}
                      onChange={e => handleInputChange('notes', e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all min-h-[80px]"
                      placeholder="Observaciones adicionales (opcional)"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Garantía</label>
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="warranty"
                        checked={formData.warranty}
                        onChange={e => handleInputChange('warranty', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-600 bg-white/5 text-orange-500 focus:ring-orange-500 focus:ring-offset-gray-900"
                      />
                      <label htmlFor="warranty" className="text-sm font-medium text-white/80">
                        ¿Aplica garantía?
                      </label>
                    </div>
                    
                    {formData.warranty && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-white/80 mb-1.5">Vencimiento de garantía *</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="date"
                            value={formData.warrantyExpiry || ''}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => handleInputChange('warrantyExpiry', e.target.value)}
                            className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                              formErrors.warrantyExpiry ? 'border-red-400' : 'border-white/10 hover:border-white/20'
                            }`}
                          />
                        </div>
                        {formErrors.warrantyExpiry && (
                          <p className="mt-1 text-xs text-red-400 flex items-center">
                            <AlertCircle className="h-3.5 w-3.5 mr-1" />
                            {formErrors.warrantyExpiry}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-6 py-2.5 bg-white/10 border border-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30"
                >
                  Crear Orden de Servicio
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="glass-card p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'orders' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Órdenes de Servicio
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'calendar' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Calendario
          </button>
          <button
            onClick={() => setActiveTab('technicians')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'technicians' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Técnicos
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'reports' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Reportes
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
          {/* Filters */}
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Buscar por número de orden, cliente o placa..."
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
                  <option value="scheduled">Programadas</option>
                  <option value="in_progress">En Proceso</option>
                  <option value="completed">Completadas</option>
                  <option value="cancelled">Canceladas</option>
                  <option value="pending_parts">Esperando Repuestos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="glass-content">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Orden</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Vehículo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Servicio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Técnico</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Fecha/Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-white/10 rounded-full p-2 mr-3 backdrop-blur-sm">
                            {getServiceTypeIcon(order.serviceType)}
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-white">{order.orderNumber}</div>
                            <div className="text-sm text-gray-300">{order.serviceType === 'maintenance' ? 'Mantenimiento' : order.serviceType === 'repair' ? 'Reparación' : order.serviceType === 'warranty' ? 'Garantía' : 'Inspección'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{order.clientName}</div>
                        <div className="text-sm text-gray-300">{order.clientPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{order.vehicle}</div>
                        <div className="text-sm text-gray-300">Placa: {order.vehiclePlate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{order.description}</div>
                        <div className="text-sm text-gray-300">{order.estimatedDuration}h estimadas</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {order.technician}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{new Date(order.scheduledDate).toLocaleDateString('es-CO')}</div>
                        <div className="text-sm text-gray-300">{order.scheduledTime}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        ${order.totalCost.toLocaleString('es-CO')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => showAlert('info', 'Ver orden', `Mostrando detalles de ${order.orderNumber}`)}
                            className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-500/20 rounded backdrop-blur-sm"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => showAlert('info', 'Llamar cliente', `Llamando a ${order.clientName}`)}
                            className="text-green-400 hover:text-green-300 p-1 hover:bg-green-500/20 rounded backdrop-blur-sm"
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                          {order.status === 'scheduled' && (
                            <button
                              onClick={() => showAlert('success', 'Orden iniciada', `Orden ${order.orderNumber} marcada como en proceso`)}
                              className="text-yellow-400 hover:text-yellow-300 p-1 hover:bg-yellow-500/20 rounded backdrop-blur-sm"
                            >
                              <Clock className="h-4 w-4" />
                            </button>
                          )}
                          {order.status === 'in_progress' && (
                            <button
                              onClick={() => showAlert('success', 'Orden completada', `Orden ${order.orderNumber} marcada como completada`)}
                              className="text-green-400 hover:text-green-300 p-1 hover:bg-green-500/20 rounded backdrop-blur-sm"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="p-8 text-center">
                <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No se encontraron órdenes de servicio</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Technicians Tab */}
      {activeTab === 'technicians' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map((tech) => (
            <div key={tech.id} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/10 rounded-full p-3 backdrop-blur-sm">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">{tech.name}</h3>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-white text-sm">{tech.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-200 mb-2">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {tech.specialties.map((specialty, index) => (
                    <span key={index} className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs backdrop-blur-sm">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-200">Carga de trabajo</span>
                  <span className="text-sm text-white">{tech.workload}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      tech.workload >= 90 ? 'bg-red-500' : 
                      tech.workload >= 70 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}
                    style={{ width: `${tech.workload}%` }}
                  ></div>
                </div>
              </div>
              
              <button
                onClick={() => showAlert('info', 'Asignar tarea', `Asignando nueva tarea a ${tech.name}`)}
                className="w-full btn-primary text-white py-2 rounded-lg"
              >
                Asignar Orden
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Calendario de Servicios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceOrders.filter(order => order.status === 'scheduled').map((order) => (
              <div key={order.id} className="glass-content p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getServiceTypeIcon(order.serviceType)}
                    <span className="text-white font-medium">{order.orderNumber}</span>
                  </div>
                  <span className="text-xs text-gray-300">{order.scheduledTime}</span>
                </div>
                <h4 className="text-white font-medium mb-1">{order.clientName}</h4>
                <p className="text-gray-300 text-sm mb-2">{order.vehicle}</p>
                <p className="text-gray-400 text-xs mb-3">{order.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-orange-300 text-sm">{order.technician}</span>
                  <span className="text-gray-300 text-xs">{order.estimatedDuration}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Eficiencia del Taller</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Tiempo promedio por servicio</span>
                <span className="text-white font-medium">2.5 horas</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Servicios completados a tiempo</span>
                <span className="text-green-400 font-medium">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Satisfacción del cliente</span>
                <span className="text-green-400 font-medium">4.7/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Utilización de la capacidad</span>
                <span className="text-yellow-400 font-medium">78%</span>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ingresos por Servicio</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Mantenimiento</span>
                <span className="text-white font-medium">$2,850,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Reparaciones</span>
                <span className="text-white font-medium">$4,320,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Garantías</span>
                <span className="text-white font-medium">$580,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Inspecciones</span>
                <span className="text-white font-medium">$450,000</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};