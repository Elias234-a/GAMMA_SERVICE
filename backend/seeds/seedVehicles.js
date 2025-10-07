import mongoose from 'mongoose';
import Vehicle from '../models/Vehicle.js';
import Inventory from '../models/Inventory.js';
import connectDB from '../config/db.js';

const vehicles = [
  // Toyota
  { brand: 'Toyota', model: 'Corolla', year: 2023, vin: '1HGBH41JXMN109186', plate: 'ABC123', color: 'Blanco', price: 95000000, cost: 75000000, status: 'available', category: 'sedan', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 1.8, doors: 4 },
  { brand: 'Toyota', model: 'RAV4', year: 2023, vin: '2T3ZFREV0EW123456', plate: 'DEF456', color: 'Negro', price: 145000000, cost: 120000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'hybrid', mileage: 0, engineSize: 2.5, doors: 5 },
  { brand: 'Toyota', model: 'Hilux', year: 2022, vin: '5TFUY5F14MX123789', plate: 'GHI789', color: 'Plateado', price: 135000000, cost: 110000000, status: 'available', category: 'truck', type: 'new', transmission: 'manual', fuel: 'diesel', mileage: 0, engineSize: 2.8, doors: 4 },
  { brand: 'Toyota', model: 'Land Cruiser', year: 2023, vin: 'JTMRW3FV5MD123456', color: 'Blanco Perla', price: 350000000, cost: 290000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 5.7, doors: 5 },
  { brand: 'Toyota', model: 'Yaris', year: 2021, vin: 'VNKKH3B36MA123456', plate: 'JKL012', color: 'Rojo', price: 55000000, cost: 45000000, status: 'available', category: 'hatchback', type: 'used', transmission: 'manual', fuel: 'gasoline', mileage: 35000, engineSize: 1.3, doors: 5 },
  
  // Mazda
  { brand: 'Mazda', model: 'CX-5', year: 2023, vin: 'JM3KFBDM5N0123456', plate: 'MNO345', color: 'Azul', price: 128000000, cost: 105000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.5, doors: 5 },
  { brand: 'Mazda', model: 'Mazda 3', year: 2022, vin: '3MZBM1U73MM123456', plate: 'PQR678', color: 'Gris', price: 92000000, cost: 75000000, status: 'available', category: 'sedan', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.0, doors: 4 },
  { brand: 'Mazda', model: 'CX-9', year: 2023, vin: 'JM3TCBDY6N0123456', color: 'Negro', price: 185000000, cost: 155000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.5, doors: 5 },
  { brand: 'Mazda', model: 'Mazda 2', year: 2020, vin: '3MZBN1K73KM123456', plate: 'STU901', color: 'Blanco', price: 48000000, cost: 40000000, status: 'available', category: 'sedan', type: 'used', transmission: 'manual', fuel: 'gasoline', mileage: 42000, engineSize: 1.5, doors: 4 },
  
  // Chevrolet
  { brand: 'Chevrolet', model: 'Tracker', year: 2023, vin: 'KL1TG6DE0NC123456', plate: 'VWX234', color: 'Rojo', price: 89000000, cost: 72000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 1.2, doors: 5 },
  { brand: 'Chevrolet', model: 'Onix', year: 2023, vin: '3GNCJKSB0NL123456', plate: 'YZA567', color: 'Azul', price: 62000000, cost: 50000000, status: 'available', category: 'sedan', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 1.2, doors: 4 },
  { brand: 'Chevrolet', model: 'Captiva', year: 2022, vin: 'KL1TM5SL2MC123456', plate: 'BCD890', color: 'Negro', price: 115000000, cost: 95000000, status: 'reserved', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'diesel', mileage: 0, engineSize: 2.0, doors: 5 },
  
  // Renault
  { brand: 'Renault', model: 'Duster', year: 2023, vin: '8A6SR5CA3NJ123456', plate: 'EFG123', color: 'Verde', price: 78000000, cost: 63000000, status: 'available', category: 'suv', type: 'new', transmission: 'manual', fuel: 'gasoline', mileage: 0, engineSize: 1.6, doors: 5 },
  { brand: 'Renault', model: 'Sandero', year: 2022, vin: '93Y5SRD65NJ123456', plate: 'HIJ456', color: 'Blanco', price: 52000000, cost: 42000000, status: 'available', category: 'hatchback', type: 'new', transmission: 'manual', fuel: 'gasoline', mileage: 0, engineSize: 1.6, doors: 5 },
  { brand: 'Renault', model: 'Koleos', year: 2023, vin: 'VF1VFDFD0NJ123456', color: 'Gris', price: 135000000, cost: 110000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.5, doors: 5 },
  
  // Nissan
  { brand: 'Nissan', model: 'Kicks', year: 2023, vin: '3N1CP5DV5NL123456', plate: 'KLM789', color: 'Naranja', price: 85000000, cost: 68000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 1.6, doors: 5 },
  { brand: 'Nissan', model: 'Sentra', year: 2023, vin: '3N1AB8CV0NY123456', plate: 'NOP012', color: 'Plateado', price: 98000000, cost: 80000000, status: 'available', category: 'sedan', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 1.8, doors: 4 },
  { brand: 'Nissan', model: 'X-Trail', year: 2022, vin: '5N1DL0AN5NC123456', plate: 'QRS345', color: 'Negro', price: 145000000, cost: 120000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.5, doors: 5 },
  { brand: 'Nissan', model: 'Frontier', year: 2023, vin: '1N6AD0EV3NN123456', color: 'Blanco', price: 125000000, cost: 100000000, status: 'available', category: 'truck', type: 'new', transmission: 'automatic', fuel: 'diesel', mileage: 0, engineSize: 2.3, doors: 4 },
  
  // Honda
  { brand: 'Honda', model: 'CR-V', year: 2023, vin: '2HKRW2H89NH123456', plate: 'TUV678', color: 'Gris', price: 155000000, cost: 130000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 1.5, doors: 5 },
  { brand: 'Honda', model: 'Civic', year: 2023, vin: '2HGFC2F59NH123456', plate: 'WXY901', color: 'Azul', price: 105000000, cost: 85000000, status: 'available', category: 'sedan', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.0, doors: 4 },
  { brand: 'Honda', model: 'Accord', year: 2022, vin: '1HGCV1F32NA123456', plate: 'ZAB234', color: 'Negro', price: 125000000, cost: 102000000, status: 'sold', category: 'sedan', type: 'new', transmission: 'automatic', fuel: 'hybrid', mileage: 0, engineSize: 2.0, doors: 4 },
  
  // Ford
  { brand: 'Ford', model: 'Ranger', year: 2023, vin: '8AFER3FL9N6123456', plate: 'CDE567', color: 'Plateado', price: 138000000, cost: 115000000, status: 'available', category: 'truck', type: 'new', transmission: 'automatic', fuel: 'diesel', mileage: 0, engineSize: 3.2, doors: 4 },
  { brand: 'Ford', model: 'Escape', year: 2023, vin: '1FMCU9HD5NUB12345', plate: 'FGH890', color: 'Rojo', price: 132000000, cost: 108000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'hybrid', mileage: 0, engineSize: 2.5, doors: 5 },
  { brand: 'Ford', model: 'Mustang', year: 2022, vin: '1FA6P8TH4N5123456', plate: 'IJK123', color: 'Amarillo', price: 245000000, cost: 200000000, status: 'available', category: 'coupe', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 5.0, doors: 2 },
  
  // Hyundai
  { brand: 'Hyundai', model: 'Tucson', year: 2023, vin: '5NMS34AJ9NH123456', plate: 'LMN456', color: 'Blanco', price: 125000000, cost: 102000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.5, doors: 5 },
  { brand: 'Hyundai', model: 'Elantra', year: 2023, vin: '5NPD84LF8NH123456', plate: 'OPQ789', color: 'Gris', price: 92000000, cost: 75000000, status: 'available', category: 'sedan', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.0, doors: 4 },
  { brand: 'Hyundai', model: 'Santa Fe', year: 2022, vin: '5NMS5CAD3NH123456', plate: 'RST012', color: 'Negro', price: 165000000, cost: 135000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.5, doors: 5 },
  
  // Kia
  { brand: 'Kia', model: 'Sportage', year: 2023, vin: 'KNDPM3AC0N7123456', plate: 'UVW345', color: 'Verde', price: 118000000, cost: 95000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.0, doors: 5 },
  { brand: 'Kia', model: 'Rio', year: 2022, vin: 'KNADH4A38M6123456', plate: 'XYZ678', color: 'Azul', price: 58000000, cost: 47000000, status: 'available', category: 'sedan', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 1.4, doors: 4 },
  { brand: 'Kia', model: 'Sorento', year: 2023, vin: '5XYPH4A39NG123456', color: 'Plateado', price: 148000000, cost: 122000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'diesel', mileage: 0, engineSize: 2.2, doors: 5 },
  
  // Volkswagen
  { brand: 'Volkswagen', model: 'Tiguan', year: 2023, vin: '3VV2B7AX1NM123456', plate: 'ABC901', color: 'Gris', price: 142000000, cost: 115000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.0, doors: 5 },
  { brand: 'Volkswagen', model: 'Jetta', year: 2023, vin: '3VWC57BU9NM123456', plate: 'DEF234', color: 'Blanco', price: 98000000, cost: 80000000, status: 'available', category: 'sedan', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 1.4, doors: 4 },
  { brand: 'Volkswagen', model: 'Amarok', year: 2022, vin: 'WVW5BR93XMW123456', plate: 'GHI567', color: 'Negro', price: 152000000, cost: 125000000, status: 'available', category: 'truck', type: 'new', transmission: 'automatic', fuel: 'diesel', mileage: 0, engineSize: 3.0, doors: 4 },
  
  // BMW
  { brand: 'BMW', model: 'X3', year: 2023, vin: '5UX53DP05N9123456', plate: 'JKL890', color: 'Azul', price: 285000000, cost: 235000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.0, doors: 5 },
  { brand: 'BMW', model: '320i', year: 2022, vin: 'WBA8B9C55N7123456', plate: 'MNO123', color: 'Blanco', price: 235000000, cost: 195000000, status: 'available', category: 'sedan', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.0, doors: 4 },
  
  // Mercedes-Benz
  { brand: 'Mercedes-Benz', model: 'GLC 300', year: 2023, vin: 'WDC0G8EB5NF123456', plate: 'PQR456', color: 'Negro', price: 325000000, cost: 270000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.0, doors: 5 },
  { brand: 'Mercedes-Benz', model: 'Clase C', year: 2022, vin: '55SWF4KB9MU123456', plate: 'STU789', color: 'Plateado', price: 275000000, cost: 225000000, status: 'available', category: 'sedan', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.0, doors: 4 },
  
  // Suzuki
  { brand: 'Suzuki', model: 'Vitara', year: 2023, vin: 'JS2YEA93XN6123456', plate: 'VWX012', color: 'Rojo', price: 82000000, cost: 65000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 1.6, doors: 5 },
  { brand: 'Suzuki', model: 'Swift', year: 2022, vin: 'JS2AA96V0M6123456', plate: 'YZA345', color: 'Amarillo', price: 52000000, cost: 42000000, status: 'available', category: 'hatchback', type: 'new', transmission: 'manual', fuel: 'gasoline', mileage: 0, engineSize: 1.2, doors: 5 },
  
  // Jeep
  { brand: 'Jeep', model: 'Compass', year: 2023, vin: '3C4NJCCB8NT123456', plate: 'BCD678', color: 'Verde', price: 138000000, cost: 112000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.4, doors: 5 },
  { brand: 'Jeep', model: 'Wrangler', year: 2022, vin: '1C4HJXDG6MW123456', plate: 'EFG901', color: 'Negro', price: 225000000, cost: 185000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 3.6, doors: 4 },
  
  // Mitsubishi
  { brand: 'Mitsubishi', model: 'L200', year: 2023, vin: 'MM4JR3UDXNJ123456', plate: 'HIJ234', color: 'Blanco', price: 125000000, cost: 102000000, status: 'available', category: 'truck', type: 'new', transmission: 'manual', fuel: 'diesel', mileage: 0, engineSize: 2.4, doors: 4 },
  { brand: 'Mitsubishi', model: 'ASX', year: 2022, vin: 'JA4AZ3A39MZ123456', plate: 'KLM567', color: 'Gris', price: 92000000, cost: 75000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 2.0, doors: 5 },
  
  // Peugeot
  { brand: 'Peugeot', model: '2008', year: 2023, vin: 'VF3CUYHZ8NS123456', plate: 'NOP890', color: 'Azul', price: 88000000, cost: 70000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'gasoline', mileage: 0, engineSize: 1.2, doors: 5 },
  { brand: 'Peugeot', model: '3008', year: 2023, vin: 'VF3LAYHZ6NS123456', color: 'Negro', price: 132000000, cost: 108000000, status: 'available', category: 'suv', type: 'new', transmission: 'automatic', fuel: 'diesel', mileage: 0, engineSize: 2.0, doors: 5 }
];

const seedVehicles = async () => {
  try {
    console.log('🌱 Conectando a la base de datos...');
    await connectDB();

    console.log('🗑️  Eliminando vehículos existentes...');
    await Vehicle.deleteMany({});
    await Inventory.deleteMany({});

    console.log('📦 Creando 50 vehículos...');
    const createdVehicles = await Vehicle.insertMany(vehicles);

    console.log('📋 Creando registros de inventario...');
    const inventoryRecords = createdVehicles.map(vehicle => ({
      vehicle: vehicle._id,
      location: vehicle.status === 'sold' ? 'sold' : (vehicle.plate ? 'showroom' : 'warehouse'),
      quantity: vehicle.status === 'sold' ? 0 : 1,
      status: vehicle.status === 'sold' ? 'sold' : (vehicle.status === 'reserved' ? 'reserved' : 'in_stock'),
      purchasePrice: vehicle.cost,
      purchaseDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
      supplier: { name: 'Proveedor ' + vehicle.brand },
      stockLevels: {
        minimum: 1,
        maximum: 3,
        reorderPoint: 1,
        reorderQuantity: 1
      }
    }));

    await Inventory.insertMany(inventoryRecords);

    console.log('✅ Seed completado exitosamente!');
    console.log(`   - ${createdVehicles.length} vehículos creados`);
    console.log(`   - ${inventoryRecords.length} registros de inventario creados`);
    console.log('\n📊 Resumen:');
    console.log(`   - Disponibles: ${vehicles.filter(v => v.status === 'available').length}`);
    console.log(`   - Reservados: ${vehicles.filter(v => v.status === 'reserved').length}`);
    console.log(`   - Vendidos: ${vehicles.filter(v => v.status === 'sold').length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedVehicles();
