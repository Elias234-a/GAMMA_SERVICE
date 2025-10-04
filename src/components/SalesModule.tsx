import React, { useState } from 'react';
import { Plus, Search, Eye, Edit, Trash2, FileText, DollarSign, Calendar, User } from 'lucide-react';
import type { AlertColor } from '@mui/material';
import type { Sale } from '@/types/app.types';
import type { Client } from '@/types/client';
import type { Vehicle } from '@/types/app.types';

interface SalesModuleProps {
  showAlert: (type: AlertColor, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
  sales: Sale[];
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  clients: Client[];
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
}

export const SalesModule: React.FC<SalesModuleProps> = ({ 
  showAlert, 
  showConfirmDialog, 
  sales, 
  setSales,
  clients,
  vehicles,
  setVehicles
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    clientId: '',
    vehicleId: '',
    totalPrice: 0,
    paymentMethod: 'cash' as Sale['paymentMethod'],
    salesperson: '',
    downPayment: 0,
    financingAmount: 0,
    installments: 12
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const salespeople = ['Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez'];
  const paymentMethods = [
    { value: 'cash', label: 'Pago de Contado' },
    { value: 'credit', label: 'Crédito Directo' },
    { value: 'financing', label: 'Financiación Bancaria' },
    { value: 'mixed', label: 'Pago Mixto' }
  ];

  const filteredSales = sales.filter(sale => {
    const client = clients.find(c => c.id === sale.clientId);
    const vehicle = vehicles.find(v => v.id === sale.vehicleId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.saleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle?.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};

    switch (currentStep) {
      case 1:
        if (!formData.clientId) {
          newErrors.clientId = 'Debe seleccionar un cliente';
        }
        if (!formData.vehicleId) {
          newErrors.vehicleId = 'Debe seleccionar un vehículo';
        }
        break;
      case 2:
        if (!formData.paymentMethod) {
          newErrors.paymentMethod = 'Debe seleccionar un método de pago';
        }
        if (formData.paymentMethod === 'mixed') {
          if (!formData.downPayment || formData.downPayment <= 0) {
            newErrors.downPayment = 'La cuota inicial debe ser mayor a cero';
          }
          if (formData.downPayment >= formData.totalPrice) {
            newErrors.downPayment = 'La cuota inicial debe ser menor al precio total';
          }
        }
        break;
      case 3:
        if (!formData.salesperson) {
          newErrors.salesperson = 'Debe asignar un vendedor';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSale = () => {
    setEditingSale(null);
    setCurrentStep(1);
    setFormData({
      clientId: '',
      vehicleId: '',
      totalPrice: 0,
      paymentMethod: 'cash',
      salesperson: '',
      downPayment: 0,
      financingAmount: 0,
      installments: 12
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setCurrentStep(1);
    const vehicle = vehicles.find(v => v.id === sale.vehicleId);
    setFormData({
      clientId: sale.clientId,
      vehicleId: sale.vehicleId,
      totalPrice: sale.totalPrice,
      paymentMethod: sale.paymentMethod,
      salesperson: sale.salesperson,
      downPayment: 0,
      financingAmount: 0,
      installments: 12
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleDeleteSale = (sale: Sale) => {
    showConfirmDialog(
      'Eliminar Venta',
      `¿Está seguro que desea eliminar la venta ${sale.saleNumber}? Esta acción no se puede deshacer.`,
      () => {
        // Return vehicle to available status
        setVehicles(prev => prev.map(v => 
          v.id === sale.vehicleId ? { ...v, status: 'available', clientId: '' } : v
        ));
        setSales(prev => prev.filter(s => s.id !== sale.id));
        showAlert('success', 'Venta eliminada', 'La venta ha sido eliminada exitosamente');
      }
    );
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep === 1) {
        const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
        if (selectedVehicle) {
          setFormData(prev => ({ ...prev, totalPrice: selectedVehicle.price }));
        }
      }
      setCurrentStep(prev => prev + 1);
    } else {
      showAlert('error', 'Datos incompletos', 'Por favor complete todos los campos obligatorios');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSaveSale = () => {
    if (!validateCurrentStep()) {
      showAlert('error', 'Datos inválidos', 'Por favor corrija los errores en el formulario');
      return;
    }

    if (editingSale) {
      // Update existing sale
      setSales(prev => prev.map(sale => 
        sale.id === editingSale.id 
          ? { ...sale, ...formData }
          : sale
      ));
      showAlert('success', 'Venta actualizada', 'Los datos de la venta han sido actualizados');
    } else {
      // Add new sale
      const newSale: Sale = {
        id: Date.now().toString(),
        saleNumber: `VEN-${Date.now().toString().slice(-6)}`,
        ...formData,
        saleDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        contractGenerated: false
      };
      setSales(prev => [...prev, newSale]);
      
      // Update vehicle status and assign to client
      setVehicles(prev => prev.map(v => 
        v.id === formData.vehicleId 
          ? { ...v, status: 'sold', clientId: formData.clientId }
          : v
      ));
      
      showAlert('success', 'Venta registrada', 'La venta ha sido registrada exitosamente');
    }

    setShowAddModal(false);
    setEditingSale(null);
    setCurrentStep(1);
    setFormData({
      clientId: '',
      vehicleId: '',
      totalPrice: 0,
      paymentMethod: 'cash',
      salesperson: '',
      downPayment: 0,
      financingAmount: 0,
      installments: 12
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string | number) => {
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

  const getStatusBadge = (status: Sale['status']) => {
    const statusConfig = {
      pending: { label: 'Pendiente', class: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
      completed: { label: 'Completada', class: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
      cancelled: { label: 'Cancelada', class: 'bg-red-500/20 text-red-300 border border-red-500/30' }
    };
    
    const config = statusConfig[status];
    return <span className={`inline-flex px-3 py-1 text-xs rounded-full glass-content ${config.class}`}>{config.label}</span>;
  };

  const generateContract = (sale: Sale) => {
    showConfirmDialog(
      'Generar Contrato',
      '¿Desea generar el contrato de venta para esta transacción?',
      () => {
        setSales(prev => prev.map(s => 
          s.id === sale.id ? { ...s, contractGenerated: true } : s
        ));
        showAlert('success', 'Contrato generado', 'El contrato de venta ha sido generado exitosamente');
      }
    );
  };

  const completeSale = (sale: Sale) => {
    showConfirmDialog(
      'Completar Venta',
      '¿Está seguro que desea marcar esta venta como completada?',
      () => {
        setSales(prev => prev.map(s => 
          s.id === sale.id ? { ...s, status: 'completed' } : s
        ));
        showAlert('success', 'Venta completada', 'La venta ha sido marcada como completada');
      }
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h4 className="text-white">Selección de Cliente y Vehículo</h4>
            
            <div>
              <label className="block text-gray-200 mb-2">
                Cliente *
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className={`w-full px-3 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm ${
                  errors.clientId ? 'border-red-400' : 'border-white/20'
                }`}
              >
                <option value="" className="text-gray-900">Seleccionar cliente</option>
                {clients.filter(c => c.status === 'active').map(client => (
                  <option key={client.id} value={client.id} className="text-gray-900">
                    {client.name} - {client.identification}
                  </option>
                ))}
              </select>
              {errors.clientId && <p className="mt-1 text-red-400">{errors.clientId}</p>}
            </div>

            <div>
              <label className="block text-gray-200 mb-2">
                Vehículo *
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                className={`w-full px-3 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm ${
                  errors.vehicleId ? 'border-red-400' : 'border-white/20'
                }`}
              >
                <option value="" className="text-gray-900">Seleccionar vehículo</option>
                {vehicles.filter(v => v.status === 'available').map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id} className="text-gray-900">
                    {vehicle.brand} {vehicle.model} {vehicle.year} - ${vehicle.price.toLocaleString('es-CO')}
                  </option>
                ))}
              </select>
              {errors.vehicleId && <p className="mt-1 text-red-400">{errors.vehicleId}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h4 className="text-white">Método de Pago</h4>
            
            <div>
              <label className="block text-gray-200 mb-2">
                Método de Pago *
              </label>
              <div className="space-y-2">
                {paymentMethods.map(method => (
                  <label key={method.value} className="flex items-center glass-content p-3 rounded-lg hover:bg-white/10 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="mr-3 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-gray-200">{method.label}</span>
                  </label>
                ))}
              </div>
              {errors.paymentMethod && <p className="mt-1 text-red-400">{errors.paymentMethod}</p>}
            </div>

            <div className="glass-content p-4 rounded-lg">
              <p className="text-gray-200">Precio del Vehículo</p>
              <p className="text-white text-2xl">${formData.totalPrice.toLocaleString('es-CO')}</p>
            </div>

            {formData.paymentMethod === 'mixed' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-200 mb-2">
                    Cuota Inicial *
                  </label>
                  <input
                    type="number"
                    value={formData.downPayment}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      handleInputChange('downPayment', value);
                      handleInputChange('financingAmount', formData.totalPrice - value);
                    }}
                    className={`w-full px-3 py-3 bg-white/10 border rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm ${
                      errors.downPayment ? 'border-red-400' : 'border-white/20'
                    }`}
                    placeholder="0"
                    min="0"
                    max={formData.totalPrice}
                  />
                  {errors.downPayment && <p className="mt-1 text-red-400">{errors.downPayment}</p>}
                </div>

                <div className="glass-content p-4 rounded-lg">
                  <p className="text-gray-200">Monto a Financiar</p>
                  <p className="text-blue-300 text-xl">
                    ${(formData.totalPrice - formData.downPayment).toLocaleString('es-CO')}
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h4 className="text-white">Información del Vendedor</h4>
            
            <div>
              <label className="block text-gray-200 mb-2">
                Vendedor Asignado *
              </label>
              <select
                value={formData.salesperson}
                onChange={(e) => handleInputChange('salesperson', e.target.value)}
                className={`w-full px-3 py-3 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 backdrop-blur-sm ${
                  errors.salesperson ? 'border-red-400' : 'border-white/20'
                }`}
              >
                <option value="" className="text-gray-900">Seleccionar vendedor</option>
                {salespeople.map(person => (
                  <option key={person} value={person} className="text-gray-900">{person}</option>
                ))}
              </select>
              {errors.salesperson && <p className="mt-1 text-red-400">{errors.salesperson}</p>}
            </div>

            <div className="glass-content p-4 rounded-lg">
              <h5 className="text-white mb-3">Resumen de la Venta</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-200">Cliente:</span>
                  <span className="text-white">{getClientName(formData.clientId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200">Vehículo:</span>
                  <span className="text-white">{getVehicleInfo(formData.vehicleId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200">Método de Pago:</span>
                  <span className="text-white">{paymentMethods.find(m => m.value === formData.paymentMethod)?.label}</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-2">
                  <span className="text-orange-300">Total:</span>
                  <span className="text-orange-300 text-xl">${formData.totalPrice.toLocaleString('es-CO')}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 glass-module fade-in">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-white">Ventas y Contrataciones</h1>
            <p className="text-gray-200 mt-1">Gestione las ventas de vehículos</p>
          </div>
          <button
            onClick={handleAddSale}
            className="mt-4 sm:mt-0 btn-electric text-white px-6 py-3 rounded-lg transition-all hover:scale-105 flex items-center space-x-2 glass-hover"
          >
            <Plus className="h-5 w-5 icon-enhanced" />
            <span>Nueva Venta</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 glass-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-200">Total Ventas</p>
              <p className="text-white text-3xl">{sales.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-400 icon-enhanced" />
          </div>
        </div>
        <div className="glass-card p-6 glass-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-200">Pendientes</p>
              <p className="text-white text-3xl">
                {sales.filter(s => s.status === 'pending').length}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-400 icon-enhanced" />
          </div>
        </div>
        <div className="glass-card p-6 glass-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-200">Completadas</p>
              <p className="text-white text-3xl">
                {sales.filter(s => s.status === 'completed').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center glass-content">
              <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 glass-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-200">Ingresos</p>
              <p className="text-white text-2xl">
                ${sales.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.totalPrice, 0).toLocaleString('es-CO')}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-400 icon-enhanced" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 icon-enhanced" />
              <input
                type="text"
                placeholder="Buscar por cliente, número de venta, vehículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 backdrop-blur-sm"
            >
              <option value="all" className="text-gray-900">Todos los estados</option>
              <option value="pending" className="text-gray-900">Pendientes</option>
              <option value="completed" className="text-gray-900">Completadas</option>
              <option value="cancelled" className="text-gray-900">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Venta</th>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Vendedor</th>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-gray-200 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-white">{sale.saleNumber}</div>
                      <div className="text-gray-300">{new Date(sale.saleDate).toLocaleDateString('es-CO')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-400 mr-2 icon-enhanced" />
                      <div className="text-white">{getClientName(sale.clientId)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {getVehicleInfo(sale.vehicleId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {sale.salesperson}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    ${sale.totalPrice.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(sale.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => showAlert('info', 'Ver venta', `Mostrando detalles de ${sale.saleNumber}`)}
                        className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/20 rounded-lg transition-all glass-hover"
                      >
                        <Eye className="h-4 w-4 icon-enhanced" />
                      </button>
                      {!sale.contractGenerated && sale.status === 'pending' && (
                        <button
                          onClick={() => generateContract(sale)}
                          className="text-emerald-400 hover:text-emerald-300 p-2 hover:bg-emerald-500/20 rounded-lg transition-all glass-hover"
                          title="Generar contrato"
                        >
                          <FileText className="h-4 w-4 icon-enhanced" />
                        </button>
                      )}
                      {sale.status === 'pending' && (
                        <button
                          onClick={() => completeSale(sale)}
                          className="text-purple-400 hover:text-purple-300 p-2 hover:bg-purple-500/20 rounded-lg transition-all glass-hover"
                          title="Completar venta"
                        >
                          <DollarSign className="h-4 w-4 icon-enhanced" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEditSale(sale)}
                        className="text-orange-400 hover:text-orange-300 p-2 hover:bg-orange-500/20 rounded-lg transition-all glass-hover"
                      >
                        <Edit className="h-4 w-4 icon-enhanced" />
                      </button>
                      <button
                        onClick={() => handleDeleteSale(sale)}
                        className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/20 rounded-lg transition-all glass-hover"
                      >
                        <Trash2 className="h-4 w-4 icon-enhanced" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4 icon-enhanced" />
            <p className="text-gray-300">No se encontraron ventas</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-white mb-4">
                {editingSale ? 'Editar Venta' : 'Nueva Venta'}
              </h3>

              {/* Step Progress */}
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center glass-content ${
                      currentStep >= step ? 'bg-orange-500 text-white glow-orange' : 'bg-white/20 text-gray-300'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-20 h-1 mx-2 rounded ${
                        currentStep > step ? 'bg-orange-500' : 'bg-white/20'
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
                      setEditingSale(null);
                      setCurrentStep(1);
                      setFormData({
                        clientId: '',
                        vehicleId: '',
                        totalPrice: 0,
                        paymentMethod: 'cash',
                        salesperson: '',
                        downPayment: 0,
                        financingAmount: 0,
                        installments: 12
                      });
                      setErrors({});
                    }}
                    className="px-6 py-3 text-gray-200 bg-white/10 hover:bg-white/20 rounded-lg transition-all glass-hover border border-white/20"
                  >
                    Cancelar
                  </button>
                  {currentStep > 1 && (
                    <button
                      onClick={handlePrevStep}
                      className="px-6 py-3 text-orange-300 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg transition-all glass-hover border border-orange-500/30"
                    >
                      Anterior
                    </button>
                  )}
                </div>
                
                {currentStep < 3 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 btn-electric text-white rounded-lg transition-all glass-hover"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleSaveSale}
                    className="px-6 py-3 btn-emerald text-white rounded-lg transition-all glass-hover"
                  >
                    {editingSale ? 'Actualizar' : 'Registrar Venta'}
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