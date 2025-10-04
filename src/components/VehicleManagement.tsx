import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Car, FileDown, X, Calendar } from 'lucide-react';
import { AlertType } from '@/types';

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
  plate: string;
  owner: string;
  color: string;
  type: string;
  status: 'registered' | 'pending' | 'expired';
  registrationDate: string;
}

interface VehicleManagementProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
}

export const VehicleManagement: React.FC<VehicleManagementProps> = ({ showAlert, showConfirmDialog }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: 1,
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
      plate: 'ABC-123',
      owner: 'Juan Pérez García',
      color: 'Blanco',
      type: 'Sedán',
      status: 'registered',
      registrationDate: '2024-01-15'
    },
    {
      id: 2,
      brand: 'Honda',
      model: 'Civic',
      year: 2021,
      plate: 'DEF-456',
      owner: 'María González López',
      color: 'Azul',
      type: 'Sedán',
      status: 'registered',
      registrationDate: '2024-02-20'
    },
    {
      id: 3,
      brand: 'Ford',
      model: 'F-150',
      year: 2023,
      plate: 'GHI-789',
      owner: 'Carlos Rodríguez',
      color: 'Negro',
      type: 'Pickup',
      status: 'pending',
      registrationDate: '2024-03-10'
    },
    {
      id: 4,
      brand: 'Chevrolet',
      model: 'Spark',
      year: 2020,
      plate: 'JKL-012',
      owner: 'Ana Martínez',
      color: 'Rojo',
      type: 'Compacto',
      status: 'expired',
      registrationDate: '2023-12-05'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    plate: '',
    owner: '',
    color: '',
    type: 'Sedán'
  });

  const vehicleTypes = ['Sedán', 'SUV', 'Pickup', 'Compacto', 'Deportivo', 'Motocicleta', 'Camión'];
  const colors = ['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Verde', 'Amarillo', 'Plateado'];

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      owner: '',
      color: '',
      type: 'Sedán'
    });
    setShowModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      plate: vehicle.plate,
      owner: vehicle.owner,
      color: vehicle.color,
      type: vehicle.type
    });
    setShowModal(true);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    showConfirmDialog(
      'Eliminar Vehículo',
      `¿Está seguro que desea eliminar el vehículo "${vehicle.brand} ${vehicle.model}" con placa ${vehicle.plate}? Esta acción no se puede deshacer.`,
      () => {
        setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
        showAlert('success', 'Vehículo eliminado', `El vehículo ${vehicle.brand} ${vehicle.model} ha sido eliminado correctamente`);
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brand || !formData.model || !formData.plate || !formData.owner || !formData.color) {
      showAlert('error', 'Campos requeridos', 'Por favor complete todos los campos obligatorios');
      return;
    }

    // Validate plate format (ABC-123)
    const platePattern = /^[A-Z]{3}-\d{3}$/;
    if (!platePattern.test(formData.plate.toUpperCase())) {
      showAlert('error', 'Formato de placa inválido', 'La placa debe tener el formato ABC-123');
      return;
    }

    // Check if plate already exists (excluding current vehicle if editing)
    const existingVehicle = vehicles.find(v => 
      v.plate.toUpperCase() === formData.plate.toUpperCase() && 
      (!editingVehicle || v.id !== editingVehicle.id)
    );
    
    if (existingVehicle) {
      showAlert('error', 'Placa duplicada', 'Ya existe un vehículo registrado con esta placa');
      return;
    }

    if (editingVehicle) {
      // Update existing vehicle
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === editingVehicle.id 
          ? { ...vehicle, ...formData, plate: formData.plate.toUpperCase() }
          : vehicle
      ));
      showAlert('success', 'Vehículo actualizado', `Los datos del vehículo ${formData.brand} ${formData.model} han sido actualizados`);
    } else {
      // Add new vehicle
      const newVehicle: Vehicle = {
        id: Math.max(...vehicles.map(v => v.id)) + 1,
        ...formData,
        plate: formData.plate.toUpperCase(),
        status: 'registered',
        registrationDate: new Date().toISOString().split('T')[0]
      };
      setVehicles(prev => [...prev, newVehicle]);
      showAlert('success', 'Vehículo registrado', `El vehículo ${formData.brand} ${formData.model} ha sido registrado correctamente`);
    }

    setShowModal(false);
    setFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      owner: '',
      color: '',
      type: 'Sedán'
    });
  };

  const handleExport = () => {
    showConfirmDialog(
      'Exportar Datos',
      '¿Desea exportar la lista de vehículos a un archivo Excel?',
      () => {
        // Mock export functionality
        showAlert('success', 'Exportación exitosa', 'El archivo Excel ha sido generado y descargado correctamente');
      }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'registered':
        return 'Registrado';
      case 'pending':
        return 'Pendiente';
      case 'expired':
        return 'Vencido';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Gestión de Vehículos</h2>
            <p className="text-gray-600">Administre el registro de vehículos del sistema</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileDown className="h-5 w-5" />
              <span>Exportar</span>
            </button>
            <button
              onClick={handleAddVehicle}
              className="flex items-center space-x-2 bg-[#1E3A8A] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Nuevo Vehículo</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por marca, modelo, placa o propietario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
          />
        </div>
      </div>

      {/* Vehicle Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vehículos</p>
              <p className="text-2xl font-bold text-gray-800">{vehicles.length}</p>
            </div>
            <Car className="h-8 w-8 text-[#1E3A8A]" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Registrados</p>
              <p className="text-2xl font-bold text-green-600">{vehicles.filter(v => v.status === 'registered').length}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{vehicles.filter(v => v.status === 'pending').length}</p>
            </div>
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-yellow-500 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Vencidos</p>
              <p className="text-2xl font-bold text-red-600">{vehicles.filter(v => v.status === 'expired').length}</p>
            </div>
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="h-4 w-4 bg-red-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Vehículo</th>
                <th className="text-left p-4 font-semibold text-gray-700">Placa</th>
                <th className="text-left p-4 font-semibold text-gray-700">Propietario</th>
                <th className="text-left p-4 font-semibold text-gray-700">Detalles</th>
                <th className="text-left p-4 font-semibold text-gray-700">Estado</th>
                <th className="text-left p-4 font-semibold text-gray-700">Fecha Registro</th>
                <th className="text-left p-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center">
                        <Car className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-sm text-gray-500">Año {vehicle.year}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-lg text-[#1E3A8A] bg-blue-50 px-3 py-1 rounded-lg">
                      {vehicle.plate}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{vehicle.owner}</p>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Tipo: {vehicle.type}</p>
                      <p className="text-sm text-gray-600">Color: {vehicle.color}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(vehicle.registrationDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
                        className="p-2 text-gray-600 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar vehículo"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar vehículo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-12">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No se encontraron vehículos</p>
          </div>
        )}
      </div>

      {/* Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Marca *</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    placeholder="Toyota, Honda, Ford..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Modelo *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    placeholder="Corolla, Civic, F-150..."
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Año *</label>
                  <input
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Placa *</label>
                  <input
                    type="text"
                    value={formData.plate}
                    onChange={(e) => setFormData(prev => ({ ...prev, plate: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent font-mono"
                    placeholder="ABC-123"
                    maxLength={7}
                  />
                  <p className="text-xs text-gray-500 mt-1">Formato: ABC-123</p>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Propietario *</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  placeholder="Nombre completo del propietario"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Tipo de Vehículo *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  >
                    {vehicleTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Color *</label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                  >
                    <option value="">Seleccionar color</option>
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-lg transition-colors"
                >
                  {editingVehicle ? 'Actualizar' : 'Registrar'} Vehículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};