import React, { useState } from 'react';
import { Users, Phone, Mail, Calendar, TrendingUp, MessageSquare, Target, Star, UserPlus, Clock, CheckCircle } from 'lucide-react';
import type { AlertColor } from '@mui/material';

interface CRMModuleProps {
  showAlert: (type: AlertColor, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  interestLevel: 'low' | 'medium' | 'high';
  vehicleInterest: string;
  budget: number;
  lastContact: string;
  nextFollowUp: string;
  notes: string;
  assignedTo: string;
  createdAt: string;
}

interface Activity {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  description: string;
  outcome: string;
  date: string;
  duration?: number;
}

export const CRMModule: React.FC<CRMModuleProps> = ({ showAlert, showConfirmDialog }) => {
  const [activeTab, setActiveTab] = useState<'leads' | 'activities' | 'reports'>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Estado para el formulario de nuevo lead
  const [newLead, setNewLead] = useState<Omit<Lead, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    phone: '',
    source: 'Web',
    status: 'new',
    interestLevel: 'medium',
    vehicleInterest: '',
    budget: 0,
    lastContact: new Date().toISOString().split('T')[0],
    nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    assignedTo: 'Juan Pérez' // Valor por defecto, podrías obtenerlo del usuario autenticado
  });

  // Estado para el formulario de nueva actividad
  const [newActivity, setNewActivity] = useState<Omit<Activity, 'id' | 'leadId'>>({ 
    type: 'call',
    description: '',
    outcome: '',
    date: new Date().toISOString().split('T')[0],
    duration: 15
  });
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'Roberto Silva',
      email: 'roberto.silva@email.com',
      phone: '+57 301 234 5678',
      source: 'Web',
      status: 'qualified',
      interestLevel: 'high',
      vehicleInterest: 'Toyota Corolla',
      budget: 80000000,
      lastContact: '2024-01-20',
      nextFollowUp: '2024-01-25',
      notes: 'Cliente muy interesado, busca financiación',
      assignedTo: 'Juan Pérez',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Carmen López',
      email: 'carmen.lopez@email.com',
      phone: '+57 310 987 6543',
      source: 'Referido',
      status: 'proposal',
      interestLevel: 'medium',
      vehicleInterest: 'Chevrolet Spark',
      budget: 50000000,
      lastContact: '2024-01-22',
      nextFollowUp: '2024-01-26',
      notes: 'Esperando aprobación de crédito',
      assignedTo: 'María García',
      createdAt: '2024-01-18'
    }
  ]);

  // Función para manejar el envío del formulario de nueva actividad
  const handleAddLead = () => {
    // Validar campos requeridos
    if (!newLead.name || !newLead.email || !newLead.phone || !newLead.vehicleInterest) {
      showAlert('error', 'Datos incompletos', 'Por favor complete todos los campos obligatorios');
      return;
    }

    // Crear nuevo lead
    const lead: Lead = {
      ...newLead,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    // Agregar a la lista de leads
    setLeads(prev => [lead, ...prev]);
    
    // Mostrar mensaje de éxito
    showAlert('success', 'Lead creado', 'El lead se ha creado correctamente');
    
    // Cerrar modal y resetear formulario
    setShowLeadModal(false);
    setNewLead({
      name: '',
      email: '',
      phone: '',
      source: 'Web',
      status: 'new',
      interestLevel: 'medium',
      vehicleInterest: '',
      budget: 0,
      lastContact: new Date().toISOString().split('T')[0],
      nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: '',
      assignedTo: 'Juan Pérez'
    });
  };

  const handleAddActivity = () => {
    if (!selectedLeadId || !newActivity.description || !newActivity.outcome) {
      showAlert('error', 'Datos incompletos', 'Por favor complete todos los campos obligatorios');
      return;
    }

    const activity: Activity = {
      id: Date.now().toString(),
      leadId: selectedLeadId,
      ...newActivity
    };

    // Actualizar la lista de actividades
    setActivities(prev => [activity, ...prev]);
    
    // Actualizar último contacto del lead
    setLeads(prev => 
      prev.map(lead => 
        lead.id === selectedLeadId 
          ? { ...lead, lastContact: newActivity.date } 
          : lead
      )
    );

    showAlert('success', 'Actividad registrada', 'La actividad se ha guardado correctamente');
    setShowActivityModal(false);
    setNewActivity({ 
      type: 'call',
      description: '',
      outcome: '',
      date: new Date().toISOString().split('T')[0],
      duration: 15
    });
    setSelectedLeadId('');
  };

  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      leadId: '1',
      type: 'call',
      description: 'Llamada de seguimiento',
      outcome: 'Cliente interesado, agenda cita para prueba de manejo',
      date: '2024-01-20',
      duration: 15
    },
    {
      id: '2',
      leadId: '2',
      type: 'email',
      description: 'Envío de cotización',
      outcome: 'Cotización enviada, cliente revisará',
      date: '2024-01-22'
    }
  ]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.vehicleInterest.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Lead['status']) => {
    const statusConfig = {
      new: { label: 'Nuevo', class: 'bg-blue-500/20 text-blue-300' },
      contacted: { label: 'Contactado', class: 'bg-yellow-500/20 text-yellow-300' },
      qualified: { label: 'Calificado', class: 'bg-purple-500/20 text-purple-300' },
      proposal: { label: 'Propuesta', class: 'bg-orange-500/20 text-orange-300' },
      negotiation: { label: 'Negociación', class: 'bg-pink-500/20 text-pink-300' },
      closed_won: { label: 'Ganado', class: 'bg-green-500/20 text-green-300' },
      closed_lost: { label: 'Perdido', class: 'bg-red-500/20 text-red-300' }
    };
    const config = statusConfig[status];
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class} backdrop-blur-sm`}>{config.label}</span>;
  };

  const getInterestLevelBadge = (level: Lead['interestLevel']) => {
    const levelConfig = {
      low: { label: 'Bajo', class: 'bg-gray-500/20 text-gray-300' },
      medium: { label: 'Medio', class: 'bg-yellow-500/20 text-yellow-300' },
      high: { label: 'Alto', class: 'bg-red-500/20 text-red-300' }
    };
    const config = levelConfig[level];
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class} backdrop-blur-sm`}>{config.label}</span>;
  };

  const getStatusStats = () => {
    const total = leads.length;
    const new_leads = leads.filter(l => l.status === 'new').length;
    const qualified = leads.filter(l => l.status === 'qualified').length;
    const proposals = leads.filter(l => l.status === 'proposal').length;
    const closed_won = leads.filter(l => l.status === 'closed_won').length;
    
    return { total, new_leads, qualified, proposals, closed_won };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">CRM y Atención al Cliente</h1>
            <p className="text-gray-200 mt-1">Gestión de leads, seguimiento y atención personalizada</p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => setShowActivityModal(true)}
              className="btn-emerald text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Nueva Actividad</span>
            </button>
            <button
              onClick={() => setShowLeadModal(true)}
              className="btn-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Nuevo Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Total Leads</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <Users className="h-6 w-6 text-blue-400 icon-enhanced" />
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Nuevos</p>
              <p className="text-2xl font-bold text-white">{stats.new_leads}</p>
            </div>
            <Star className="h-6 w-6 text-yellow-400 icon-enhanced" />
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Calificados</p>
              <p className="text-2xl font-bold text-white">{stats.qualified}</p>
            </div>
            <Target className="h-6 w-6 text-purple-400 icon-enhanced" />
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Propuestas</p>
              <p className="text-2xl font-bold text-white">{stats.proposals}</p>
            </div>
            <TrendingUp className="h-6 w-6 text-orange-400 icon-enhanced" />
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Cerrados</p>
              <p className="text-2xl font-bold text-white">{stats.closed_won}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-400 icon-enhanced" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="glass-card p-1">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('leads')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'leads' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Leads
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === 'activities' 
                ? 'bg-orange-500/30 text-white' 
                : 'text-gray-300 hover:bg-white/10'
            }`}
          >
            Actividades
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

      {/* Leads Tab */}
      {activeTab === 'leads' && (
        <>
          {/* Filters */}
          <div className="glass-card p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o vehículo de interés..."
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
                  <option value="new">Nuevos</option>
                  <option value="contacted">Contactados</option>
                  <option value="qualified">Calificados</option>
                  <option value="proposal">Propuestas</option>
                  <option value="negotiation">Negociación</option>
                  <option value="closed_won">Cerrados (Ganados)</option>
                  <option value="closed_lost">Cerrados (Perdidos)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Leads Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="glass-content">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Interés</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Nivel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Vendedor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Próx. Seguimiento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="bg-white/10 rounded-full p-2 mr-3 backdrop-blur-sm">
                            <Users className="h-5 w-5 text-gray-300" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{lead.name}</div>
                            <div className="text-sm text-gray-300">Presupuesto: ${lead.budget.toLocaleString('es-CO')}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{lead.phone}</div>
                        <div className="text-sm text-gray-300">{lead.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{lead.vehicleInterest}</div>
                        <div className="text-sm text-gray-300">Fuente: {lead.source}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getInterestLevelBadge(lead.interestLevel)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {lead.assignedTo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-white">
                          <Calendar className="h-4 w-4 mr-1 text-orange-400" />
                          {new Date(lead.nextFollowUp).toLocaleDateString('es-CO')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => showAlert('info', 'Llamar cliente', `Iniciando llamada a ${lead.name}`)}
                            className="text-green-400 hover:text-green-300 p-1 hover:bg-green-500/20 rounded backdrop-blur-sm"
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => showAlert('info', 'Enviar email', `Abriendo email para ${lead.name}`)}
                            className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-500/20 rounded backdrop-blur-sm"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => showAlert('info', 'Programar cita', `Programando cita con ${lead.name}`)}
                            className="text-purple-400 hover:text-purple-300 p-1 hover:bg-purple-500/20 rounded backdrop-blur-sm"
                          >
                            <Calendar className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLeads.length === 0 && (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No se encontraron leads</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="glass-card p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Actividades Recientes</h3>
            {activities.map((activity) => {
              const lead = leads.find(l => l.id === activity.leadId);
              return (
                <div key={activity.id} className="glass-content p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="bg-orange-500/20 rounded-full p-2 backdrop-blur-sm">
                        {activity.type === 'call' && <Phone className="h-4 w-4 text-orange-400" />}
                        {activity.type === 'email' && <Mail className="h-4 w-4 text-orange-400" />}
                        {activity.type === 'meeting' && <Calendar className="h-4 w-4 text-orange-400" />}
                        {activity.type === 'note' && <MessageSquare className="h-4 w-4 text-orange-400" />}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{activity.description}</h4>
                        <p className="text-gray-300 text-sm">{lead?.name}</p>
                        <p className="text-gray-400 text-sm">{activity.outcome}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">
                      {new Date(activity.date).toLocaleDateString('es-CO')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Conversión por Etapa</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Nuevos → Contactados</span>
                <span className="text-white font-medium">85%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Contactados → Calificados</span>
                <span className="text-white font-medium">65%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Calificados → Propuestas</span>
                <span className="text-white font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Propuestas → Cerrados</span>
                <span className="text-white font-medium">30%</span>
              </div>
            </div>
          </div>
          
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Rendimiento del Equipo</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Juan Pérez</span>
                <span className="text-green-400 font-medium">15 leads activos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">María García</span>
                <span className="text-green-400 font-medium">12 leads activos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Carlos López</span>
                <span className="text-green-400 font-medium">8 leads activos</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nueva Actividad */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-strong p-6 w-full max-w-md border border-white/20 rounded-xl backdrop-blur-lg">
            <h3 className="text-xl font-bold text-white mb-6">Nueva Actividad</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Lead *</label>
                <div className="relative">
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 backdrop-blur-sm appearance-none"
                  >
                    <option value="" className="bg-white/80 backdrop-blur-md text-gray-900">Seleccionar lead</option>
                    {leads.map(lead => (
                      <option 
                        key={lead.id} 
                        value={lead.id} 
                        className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2"
                      >
                        {lead.name} - {lead.vehicleInterest}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Tipo de Actividad *</label>
                <div className="relative">
                  <select
                    value={newActivity.type}
                    onChange={(e) => setNewActivity({...newActivity, type: e.target.value as Activity['type']})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 backdrop-blur-sm appearance-none"
                  >
                    <option value="call" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Llamada</option>
                    <option value="email" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Email</option>
                    <option value="meeting" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Reunión</option>
                    <option value="note" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Nota</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Descripción *</label>
                <input
                  type="text"
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="Ej: Llamada de seguimiento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Resultado *</label>
                <textarea
                  value={newActivity.outcome}
                  onChange={(e) => setNewActivity({...newActivity, outcome: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="Detalle el resultado de la actividad..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Fecha *</label>
                  <input
                    type="date"
                    value={newActivity.date}
                    onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Duración (min)</label>
                  <input
                    type="number"
                    value={newActivity.duration}
                    onChange={(e) => setNewActivity({...newActivity, duration: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                    min="1"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowActivityModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddActivity}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Guardar Actividad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nuevo Lead */}
      {showLeadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card-strong p-6 w-full max-w-2xl border border-white/20 rounded-xl backdrop-blur-lg">
            <h3 className="text-xl font-bold text-white mb-6">Nuevo Lead</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nombre Completo *</label>
                <input
                  type="text"
                  value={newLead.name}
                  onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Correo Electrónico *</label>
                <input
                  type="email"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="ejemplo@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Teléfono *</label>
                <input
                  type="tel"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="+57 300 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Origen</label>
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 backdrop-blur-sm appearance-none"
                >
                  <option value="Web" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Web</option>
                  <option value="Referido" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Referido</option>
                  <option value="Redes Sociales" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Redes Sociales</option>
                  <option value="Campaña" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Campaña</option>
                  <option value="Otro" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Vehículo de Interés *</label>
                <input
                  type="text"
                  value={newLead.vehicleInterest}
                  onChange={(e) => setNewLead({...newLead, vehicleInterest: e.target.value})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="Ej: Toyota Corolla"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Presupuesto (COP)</label>
                <input
                  type="number"
                  value={newLead.budget || ''}
                  onChange={(e) => setNewLead({...newLead, budget: Number(e.target.value)})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="Ej: 80000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Nivel de Interés</label>
                <select
                  value={newLead.interestLevel}
                  onChange={(e) => setNewLead({...newLead, interestLevel: e.target.value as 'low' | 'medium' | 'high'})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 backdrop-blur-sm appearance-none"
                >
                  <option value="low" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Bajo</option>
                  <option value="medium" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Medio</option>
                  <option value="high" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Alto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Estado</label>
                <select
                  value={newLead.status}
                  onChange={(e) => setNewLead({...newLead, status: e.target.value as Lead['status']})}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 backdrop-blur-sm appearance-none"
                >
                  <option value="new" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Nuevo</option>
                  <option value="contacted" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Contactado</option>
                  <option value="qualified" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Calificado</option>
                  <option value="proposal" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Propuesta</option>
                  <option value="negotiation" className="bg-white/80 backdrop-blur-md hover:bg-white/90 text-gray-900 p-2">Negociación</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">Notas</label>
                <textarea
                  value={newLead.notes}
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  placeholder="Información adicional sobre el lead..."
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowLeadModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddLead}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Guardar Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};