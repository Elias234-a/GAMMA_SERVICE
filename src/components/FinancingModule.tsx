import React, { useState } from 'react';
import { CreditCard, Search, CheckCircle, XCircle, Clock, AlertTriangle, DollarSign, Calculator } from 'lucide-react';
import type { AlertColor } from '@mui/material';
import type { Client } from '@/types/client';
import type { Vehicle } from '@/types/app.types';

interface CreditEvaluation {
  id: string;
  clientId: string;
  vehicleId: string;
  requestDate: string;
  creditAmount: number;
  downPayment: number;
  installments: number;
  interestRate: number;
  monthlyPayment: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  creditScore: number;
  datacreditoResponse: {
    score: number;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
    hasDebts: boolean;
    monthlyIncome: number;
  };
  approvalDate?: string;
  rejectionReason?: string;
}

interface FinancingModuleProps {
  showAlert: (type: AlertColor, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
  clients: Client[];
  vehicles: Vehicle[];
}

export const FinancingModule: React.FC<FinancingModuleProps> = ({ 
  showAlert, 
  showConfirmDialog, 
  clients,
  vehicles
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    vehicleId: '',
    creditAmount: 0,
    downPayment: 0,
    installments: 12,
    monthlyIncome: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock credit evaluations data
  const [evaluations, setEvaluations] = useState<CreditEvaluation[]>([
    {
      id: '1',
      clientId: '1',
      vehicleId: '1',
      requestDate: '2024-01-20',
      creditAmount: 68000000,
      downPayment: 17000000,
      installments: 36,
      interestRate: 1.2,
      monthlyPayment: 2234000,
      status: 'approved',
      creditScore: 750,
      datacreditoResponse: {
        score: 750,
        riskLevel: 'low',
        recommendations: ['Cliente con excelente historial crediticio', 'Capacidad de pago comprobada'],
        hasDebts: false,
        monthlyIncome: 8000000
      },
      approvalDate: '2024-01-21'
    }
  ]);

  const paymentMethods = [
    { value: 'cash', label: 'Pago de Contado', description: 'Pago completo al momento de la compra' },
    { value: 'credit', label: 'Crédito Directo', description: 'Financiación directa con la concesionaria' },
    { value: 'banking', label: 'Financiación Bancaria', description: 'Crédito a través de entidades bancarias' },
    { value: 'mixed', label: 'Pago Mixto', description: 'Combinación de cuota inicial y financiación' }
  ];

  const interestRates = {
    12: 1.0,  // 12 meses - 1.0% mensual
    24: 1.1,  // 24 meses - 1.1% mensual
    36: 1.2,  // 36 meses - 1.2% mensual
    48: 1.3,  // 48 meses - 1.3% mensual
    60: 1.4   // 60 meses - 1.4% mensual
  };

  const filteredEvaluations = evaluations.filter(evaluation => {
    const client = clients.find(c => c.id === evaluation.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client?.identification.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || evaluation.status === statusFilter;
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
        if (!formData.monthlyIncome || formData.monthlyIncome <= 0) {
          newErrors.monthlyIncome = 'Debe ingresar los ingresos mensuales';
        }
        if (!formData.downPayment || formData.downPayment < 0) {
          newErrors.downPayment = 'La cuota inicial no puede ser negativa';
        }
        if (formData.downPayment >= formData.creditAmount) {
          newErrors.downPayment = 'La cuota inicial debe ser menor al valor del vehículo';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartEvaluation = () => {
    setCurrentStep(1);
    setFormData({
      clientId: '',
      vehicleId: '',
      creditAmount: 0,
      downPayment: 0,
      installments: 12,
      monthlyIncome: 0
    });
    setErrors({});
    setShowEvaluationModal(true);
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep === 1) {
        const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
        if (selectedVehicle) {
          setFormData(prev => ({ 
            ...prev, 
            creditAmount: selectedVehicle.price,
            downPayment: selectedVehicle.price * 0.2 // 20% inicial por defecto
          }));
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

  const simulateDatacredito = async (clientId: string, monthlyIncome: number): Promise<CreditEvaluation['datacreditoResponse']> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate different credit scores based on client ID for demo
    const mockScores = {
      '1': 750,
      '2': 650,
      '3': 450
    };

    const score = mockScores[clientId as keyof typeof mockScores] || Math.floor(Math.random() * 400) + 400;
    const riskLevel: 'low' | 'medium' | 'high' = score >= 700 ? 'low' : score >= 600 ? 'medium' : 'high';
    
    const recommendations = [];
    if (score >= 700) {
      recommendations.push('Cliente con excelente historial crediticio');
      recommendations.push('Capacidad de pago comprobada');
    } else if (score >= 600) {
      recommendations.push('Cliente con buen historial crediticio');
      recommendations.push('Verificar capacidad de pago actual');
    } else {
      recommendations.push('Cliente con historial crediticio limitado');
      recommendations.push('Requiere evaluación adicional');
      recommendations.push('Considerar aumento de cuota inicial');
    }

    return {
      score,
      riskLevel,
      recommendations,
      hasDebts: score < 600,
      monthlyIncome
    };
  };

  const handleSubmitEvaluation = async () => {
    if (!validateCurrentStep()) {
      showAlert('error', 'Datos inválidos', 'Por favor corrija los errores en el formulario');
      return;
    }

    setIsEvaluating(true);

    try {
      // Simulate Datacrédito consultation
      const datacreditoResponse = await simulateDatacredito(formData.clientId, formData.monthlyIncome);
      
      const financeAmount = formData.creditAmount - formData.downPayment;
      const interestRate = interestRates[formData.installments as keyof typeof interestRates];
      const monthlyPayment = calculateMonthlyPayment(financeAmount, interestRate, formData.installments);
      
      // Determine approval based on credit score and payment capacity
      const paymentToIncomeRatio = monthlyPayment / formData.monthlyIncome;
      const isApproved = datacreditoResponse.score >= 600 && paymentToIncomeRatio <= 0.3;

      const newEvaluation: CreditEvaluation = {
        id: Date.now().toString(),
        clientId: formData.clientId,
        vehicleId: formData.vehicleId,
        requestDate: new Date().toISOString().split('T')[0],
        creditAmount: formData.creditAmount,
        downPayment: formData.downPayment,
        installments: formData.installments,
        interestRate,
        monthlyPayment,
        status: isApproved ? 'approved' : 'rejected',
        creditScore: datacreditoResponse.score,
        datacreditoResponse,
        approvalDate: isApproved ? new Date().toISOString().split('T')[0] : undefined,
        rejectionReason: isApproved ? undefined : 'Score crediticio insuficiente o capacidad de pago limitada'
      };

      setEvaluations(prev => [...prev, newEvaluation]);
      setShowEvaluationModal(false);
      
      if (isApproved) {
        showAlert('success', 'Crédito aprobado', 'La evaluación crediticia ha sido aprobada exitosamente');
      } else {
        showAlert('warning', 'Crédito rechazado', 'La evaluación crediticia no fue aprobada');
      }
    } catch (error) {
      showAlert('error', 'Error en evaluación', 'Hubo un problema al consultar Datacrédito');
    } finally {
      setIsEvaluating(false);
    }
  };

  const calculateMonthlyPayment = (principal: number, monthlyRate: number, months: number): number => {
    const rate = monthlyRate / 100;
    return (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
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

  const getStatusBadge = (status: CreditEvaluation['status']) => {
    const statusConfig = {
      pending: { label: 'Pendiente', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { label: 'Aprobado', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { label: 'Rechazado', class: 'bg-red-100 text-red-800', icon: XCircle },
      completed: { label: 'Completado', class: 'bg-blue-100 text-blue-800', icon: CheckCircle }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getRiskBadge = (riskLevel: 'low' | 'medium' | 'high') => {
    const riskConfig = {
      low: { label: 'Bajo Riesgo', class: 'bg-green-100 text-green-800' },
      medium: { label: 'Riesgo Medio', class: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'Alto Riesgo', class: 'bg-red-100 text-red-800' }
    };
    
    const config = riskConfig[riskLevel];
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>{config.label}</span>;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h4 className="font-medium text-white/90 mb-4 text-lg">Selección de Cliente y Vehículo</h4>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Cliente <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className={`financing-select ${errors.clientId ? 'border-red-400' : ''}`}
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

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Vehículo <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                className={`financing-select ${errors.vehicleId ? 'border-red-400' : ''}`}
              >
                <option value="">Seleccionar vehículo</option>
                {vehicles.filter(v => v.status === 'available').map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} {vehicle.year} - ${vehicle.price.toLocaleString('es-CO')}
                  </option>
                ))}
              </select>
              {errors.vehicleId && <p className="mt-1 text-sm text-red-600">{errors.vehicleId}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4 text-white">
            <h4 className="font-medium text-white/90">Información Financiera</h4>
            
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Ingresos Mensuales <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => handleInputChange('monthlyIncome', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border ${
                  errors.monthlyIncome ? 'border-red-400' : 'border-white/20'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/10 text-white placeholder-white/50`}
                placeholder="5000000"
              />
              {errors.monthlyIncome && <p className="mt-1 text-sm text-red-400">{errors.monthlyIncome}</p>}
            </div>

            <div className="bg-white/10 p-4 rounded-lg border border-white/10">
              <p className="text-sm font-medium text-white/80">Valor del Vehículo</p>
              <p className="text-2xl font-bold text-white">${formData.creditAmount.toLocaleString('es-CO')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Cuota Inicial
              </label>
              <input
                type="number"
                value={formData.downPayment}
                onChange={(e) => handleInputChange('downPayment', parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 border ${
                  errors.downPayment ? 'border-red-400' : 'border-white/20'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white/10 text-white`}
              />
              {errors.downPayment && <p className="mt-1 text-sm text-red-400">{errors.downPayment}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Número de Cuotas
              </label>
              <select
                value={formData.installments}
                onChange={(e) => handleInputChange('installments', parseInt(e.target.value))}
                className="financing-select"
              >
                <option value={12} className="text-gray-800">12 meses (1.0% interés mensual)</option>
                <option value={24} className="text-gray-800">24 meses (1.1% interés mensual)</option>
                <option value={36} className="text-gray-800">36 meses (1.2% interés mensual)</option>
                <option value={48} className="text-gray-800">48 meses (1.3% interés mensual)</option>
                <option value={60} className="text-gray-800">60 meses (1.4% interés mensual)</option>
              </select>
            </div>

            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-400/20">
              <h5 className="font-medium text-blue-300 mb-2">Cálculo Estimado</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/80">Monto a financiar:</span>
                  <span className="font-medium text-white">${(formData.creditAmount - formData.downPayment).toLocaleString('es-CO')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Cuota mensual estimada:</span>
                  <span className="font-bold text-white">
                    ${calculateMonthlyPayment(
                      formData.creditAmount - formData.downPayment,
                      interestRates[formData.installments as keyof typeof interestRates],
                      formData.installments
                    ).toLocaleString('es-CO')}
                  </span>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-white">Evaluación Financiera</h1>
            <p className="text-white/80 mt-1">Evaluación crediticia y opciones de financiamiento</p>
          </div>
          <button
            onClick={handleStartEvaluation}
            className="mt-4 sm:mt-0 btn-primary text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
          >
            <CreditCard className="h-4 w-4" />
            <span>Nueva Evaluación</span>
          </button>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paymentMethods.map((method) => (
          <div key={method.value} className="glass-card p-6 glass-hover">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white">{method.label}</h3>
              <CreditCard className="h-6 w-6 text-orange-400 icon-enhanced" />
            </div>
            <p className="text-white/80 mb-4">{method.description}</p>
            <button
              onClick={() => showAlert('info', 'Información', `Más detalles sobre ${method.label}`)}
              className="text-orange-300 hover:text-orange-200 transition-colors"
            >
              Más información
            </button>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card-strong p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">Evaluaciones</p>
              <p className="text-white">{evaluations.length}</p>
            </div>
            <CreditCard className="h-8 w-8 text-blue-400 icon-enhanced" />
          </div>
        </div>
        <div className="glass-card-strong p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">Aprobadas</p>
              <p className="text-white">
                {evaluations.filter(e => e.status === 'approved').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400 icon-enhanced" />
          </div>
        </div>
        <div className="glass-card-strong p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">Rechazadas</p>
              <p className="text-white">
                {evaluations.filter(e => e.status === 'rejected').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-400 icon-enhanced" />
          </div>
        </div>
        <div className="glass-card-strong p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80">Monto Total</p>
              <p className="text-white">
                ${evaluations.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.creditAmount, 0).toLocaleString('es-CO')} COP
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400 icon-enhanced" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                type="text"
                placeholder="Buscar por cliente, identificación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 glass-content border-white/20 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 glass-content border-white/20 rounded-lg bg-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobadas</option>
              <option value="rejected">Rechazadas</option>
              <option value="completed">Completadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="glass-card-strong overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-white/80 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-white/80 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-3 text-left text-white/80 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-white/80 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-white/80 uppercase tracking-wider">Riesgo</th>
                <th className="px-6 py-3 text-left text-white/80 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-white/80 uppercase tracking-wider">Cuota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredEvaluations.map((evaluation) => (
                <tr key={evaluation.id} className="hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-white">{getClientName(evaluation.clientId)}</div>
                      <div className="text-white/60">{new Date(evaluation.requestDate).toLocaleDateString('es-CO')}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {getVehicleInfo(evaluation.vehicleId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-white">${evaluation.creditAmount.toLocaleString('es-CO')} COP</div>
                      <div className="text-white/60">Inicial: ${evaluation.downPayment.toLocaleString('es-CO')} COP</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`font-bold ${
                      evaluation.creditScore >= 700 ? 'text-green-300' :
                      evaluation.creditScore >= 600 ? 'text-yellow-300' : 'text-red-300'
                    }`}>
                      {evaluation.creditScore}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRiskBadge(evaluation.datacreditoResponse.riskLevel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(evaluation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-white">
                        ${evaluation.monthlyPayment.toLocaleString('es-CO')} COP
                      </div>
                      <div className="text-white/60">{evaluation.installments} cuotas</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEvaluations.length === 0 && (
          <div className="p-8 text-center">
            <CreditCard className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <p className="text-white/60">No se encontraron evaluaciones crediticias</p>
          </div>
        )}
      </div>

      {/* Evaluation Modal */}
      {showEvaluationModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-lg border border-white/20">
            <div className="p-6">
              <h3 className="text-white text-xl font-semibold mb-6">
                Evaluación Crediticia
              </h3>

              {/* Step Progress */}
              <div className="flex items-center justify-between mb-6">
                {[1, 2].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                      currentStep >= step ? 'bg-orange-500 text-white' : 'bg-white/20 text-white/60'
                    }`}>
                      {step}
                    </div>
                    <div className="ml-2">
                      <p className={`font-medium ${
                        currentStep >= step ? 'text-orange-300' : 'text-white/60'
                      }`}>
                        {step === 1 ? 'Datos Básicos' : 'Información Financiera'}
                      </p>
                    </div>
                    {step < 2 && (
                      <div className={`w-20 h-1 mx-4 ${
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
                      setShowEvaluationModal(false);
                      setCurrentStep(1);
                      setFormData({
                        clientId: '',
                        vehicleId: '',
                        creditAmount: 0,
                        downPayment: 0,
                        installments: 12,
                        monthlyIncome: 0
                      });
                      setErrors({});
                    }}
                    className="px-4 py-2 text-gray-800 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                    disabled={isEvaluating}
                  >
                    Cancelar
                  </button>
                  {currentStep > 1 && (
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2 text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg transition-colors border border-orange-500/30"
                      disabled={isEvaluating}
                    >
                      Anterior
                    </button>
                  )}
                </div>
                
                {currentStep < 2 ? (
                  <button
                    onClick={handleNextStep}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors border border-orange-400/50"
                    disabled={isEvaluating}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitEvaluation}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    disabled={isEvaluating}
                  >
                    {isEvaluating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Consultando Datacrédito...</span>
                      </>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4" />
                        <span>Evaluar Crédito</span>
                      </>
                    )}
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