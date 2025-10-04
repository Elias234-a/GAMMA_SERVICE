import React, { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, Car, DollarSign } from 'lucide-react';
import { AlertType, Vehicle, Client } from '../App';

interface VehiclesModuleProps {
  showAlert: (type: AlertType, title: string, message: string) => void;
  showConfirmDialog: (title: string, message: string, onConfirm: () => void) => void;
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  clients: Client[];
}

export const VehiclesModule: React.FC<VehiclesModuleProps> = ({ 
  showAlert, 
  showConfirmDialog, 
  vehicles, 
  setVehicles,
  clients 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    plate: '',
    vin: '',
    color: '',
    price: 0,
    clientId: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const brands = ['Toyota', 'Chevrolet', 'Nissan', 'Hyundai', 'Ford', 'Volkswagen', 'Mazda', 'Kia', 'Honda', 'Renault'];
  const colors = ['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Plata', 'Dorado', 'Verde', 'Amarillo'];

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesBrand = brandFilter === 'all' || vehicle.brand === brandFilter;
    return matchesSearch && matchesStatus && matchesBrand;
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.brand.trim()) {
      newErrors.brand = 'La marca es obligatoria';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'El modelo es obligatorio';
    }
    if (!formData.year || formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Año inválido (1990 - ' + (new Date().getFullYear() + 1) + ')';
    }
    if (!formData.vin.trim()) {
      newErrors.vin = 'El VIN es obligatorio';
    } else if (formData.vin.length !== 17) {
      newErrors.vin = 'El VIN debe tener exactamente 17 caracteres';
    }
    if (!formData.color.trim()) {
      newErrors.color = 'El color es obligatorio';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a cero';
    }

    // Check for duplicate VIN (excluding current vehicle when editing)
    const duplicateVin = vehicles.find(vehicle => 
      vehicle.vin === formData.vin && 
      (!editingVehicle || vehicle.id !== editingVehicle.id)
    );
    if (duplicateVin) {
      newErrors.vin = 'Ya existe un vehículo con este VIN';
    }

    // Check for duplicate plate if provided (excluding current vehicle when editing)
    if (formData.plate.trim()) {
      const duplicatePlate = vehicles.find(vehicle => 
        vehicle.plate === formData.plate && 
        (!editingVehicle || vehicle.id !== editingVehicle.id)
      );
      if (duplicatePlate) {
        newErrors.plate = 'Ya existe un vehículo con esta placa';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      vin: '',
      color: '',
      price: 0,
      clientId: ''
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      plate: vehicle.plate,
      vin: vehicle.vin,
      color: vehicle.color,
      price: vehicle.price,
      clientId: vehicle.clientId
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleDeleteVehicle = (vehicle: Vehicle) => {
    showConfirmDialog(
      'Eliminar Vehículo',
      `¿Está seguro que desea eliminar el vehículo "${vehicle.brand} ${vehicle.model}"? Esta acción no se puede deshacer.`,
      () => {
        setVehicles(prev => prev.filter(v => v.id !== vehicle.id));
        showAlert('success', 'Vehículo eliminado', 'El vehículo ha sido eliminado exitosamente');
      }
    );
  };

  const handleSaveVehicle = () => {
    if (!validateForm()) {
      showAlert('error', 'Datos inválidos', 'Por favor corrija los errores en el formulario');
      return;
    }

    if (editingVehicle) {
      // Update existing vehicle
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === editingVehicle.id 
          ? { ...vehicle, ...formData }
          : vehicle
      ));
      showAlert('success', 'Vehículo actualizado', 'Los datos del vehículo han sido actualizados');
    } else {
      // Add new vehicle
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        ...formData,
        status: 'available'
      };
      setVehicles(prev => [...prev, newVehicle]);
      showAlert('success', 'Vehículo registrado', 'El vehículo ha sido registrado exitosamente');
    }

    setShowAddModal(false);
    setEditingVehicle(null);
    setFormData({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plate: '',
      vin: '',
      color: '',
      price: 0,
      clientId: ''
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
    return client ? client.name : 'Sin asignar';
  };

  const getStatusBadge = (status: Vehicle['status']) => {
    const statusConfig: Record<string, { label: string; class: string }> = {
      'Disponible': { label: 'Disponible', class: 'bg-green-500/20 text-green-300 backdrop-blur-sm' },
      'Vendido': { label: 'Vendido', class: 'bg-blue-500/20 text-blue-300 backdrop-blur-sm' },
      'Reservado': { label: 'Reservado', class: 'bg-yellow-500/20 text-yellow-300 backdrop-blur-sm' }
    };
    
    const config = statusConfig[status];
    return <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.class}`}>{config.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Gestión de Vehículos</h1>
            <p className="text-gray-200 mt-1">Administre el inventario de vehículos</p>
          </div>
          <button
            onClick={handleAddVehicle}
            className="mt-4 sm:mt-0 btn-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Vehículo</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Total Vehículos</p>
              <p className="text-3xl font-bold text-white">{vehicles.length}</p>
            </div>
            <Car className="h-8 w-8 text-blue-400 icon-enhanced" />
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Disponibles</p>
              <p className="text-3xl font-bold text-white">
                {vehicles.filter(v => v.status === 'available').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-4 h-4 bg-green-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Vendidos</p>
              <p className="text-3xl font-bold text-white">
                {vehicles.filter(v => v.status === 'sold').length}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Valor Total</p>
              <p className="text-2xl font-bold text-white">
                ${vehicles.filter(v => v.status === 'available').reduce((sum, v) => sum + v.price, 0).toLocaleString('es-CO')}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400 icon-enhanced" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input
                type="text"
                placeholder="Buscar por marca, modelo, placa, VIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-white/20 rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg glass-content text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todos los estados</option>
              <option value="available">Disponibles</option>
              <option value="sold">Vendidos</option>
              <option value="reserved">Reservados</option>
            </select>
          </div>
          <div>
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="w-full px-3 py-2 border border-white/20 rounded-lg glass-content text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todas las marcas</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="glass-content">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">VIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Placa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Propietario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-200 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-white/10 rounded-full p-2 mr-3 backdrop-blur-sm">
                        <Car className="h-5 w-5 text-gray-300" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{vehicle.brand} {vehicle.model}</div>
                        <div className="text-sm text-gray-300">{vehicle.year} - {vehicle.color}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">
                    {vehicle.vin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {vehicle.plate || 'Sin placa'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {getClientName(vehicle.clientId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    ${vehicle.price.toLocaleString('es-CO')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(vehicle.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => showAlert('info', 'Ver vehículo', `Mostrando detalles de ${vehicle.brand} ${vehicle.model}`)}
                        className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-500/20 rounded backdrop-blur-sm"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditVehicle(vehicle)}
                        className="text-yellow-400 hover:text-yellow-300 p-1 hover:bg-yellow-500/20 rounded backdrop-blur-sm"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle)}
                        className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded backdrop-blur-sm"
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
          <div className="p-8 text-center">
            <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No se encontraron vehículos</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Marca *
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    className={`vehicle-select w-full px-3 py-2 border ${
                      errors.brand ? 'border-red-400' : 'border-white/20'
                    } rounded-lg glass-content focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                  >
                    <option value="">Seleccionar marca</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  {errors.brand && <p className="mt-1 text-sm text-red-400">{errors.brand}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Modelo *
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      errors.model ? 'border-red-400' : 'border-white/20'
                    } rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                    placeholder="Corolla"
                  />
                  {errors.model && <p className="mt-1 text-sm text-red-400">{errors.model}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Año *
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border ${
                      errors.year ? 'border-red-400' : 'border-white/20'
                    } rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                  {errors.year && <p className="mt-1 text-sm text-red-400">{errors.year}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Color *
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className={`vehicle-select w-full px-3 py-2 border ${
                      errors.color ? 'border-red-400' : 'border-white/20'
                    } rounded-lg glass-content focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                  >
                    <option value="">Seleccionar color</option>
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                  {errors.color && <p className="mt-1 text-sm text-red-400">{errors.color}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    VIN *
                  </label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border ${
                      errors.vin ? 'border-red-400' : 'border-white/20'
                    } rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono`}
                    placeholder="JT2BF28K123456789"
                    maxLength={17}
                  />
                  {errors.vin && <p className="mt-1 text-sm text-red-400">{errors.vin}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Placa
                  </label>
                  <input
                    type="text"
                    value={formData.plate}
                    onChange={(e) => handleInputChange('plate', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 border ${
                      errors.plate ? 'border-red-400' : 'border-white/20'
                    } rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                    placeholder="ABC123 (opcional)"
                  />
                  {errors.plate && <p className="mt-1 text-sm text-red-400">{errors.plate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border ${
                      errors.price ? 'border-red-400' : 'border-white/20'
                    } rounded-lg glass-content placeholder-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                    placeholder="85000000"
                    min="0"
                  />
                  {errors.price && <p className="mt-1 text-sm text-red-400">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Propietario
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => handleInputChange('clientId', e.target.value)}
                    className="w-full px-3 py-2 border border-white/20 rounded-lg glass-content text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Sin asignar</option>
                    {clients.filter(c => c.status === 'active').map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingVehicle(null);
                    setFormData({
                      brand: '',
                      model: '',
                      year: new Date().getFullYear(),
                      plate: '',
                      vin: '',
                      color: '',
                      price: 0,
                      clientId: ''
                    });
                    setErrors({});
                  }}
                  className="px-4 py-2 text-white glass-content border border-white/20 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveVehicle}
                  className="px-4 py-2 btn-primary text-white rounded-lg"
                >
                  {editingVehicle ? 'Actualizar' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};