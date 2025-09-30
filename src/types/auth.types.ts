export type UserRole = 'Administrador' | 'Vendedor' | 'Cliente' | 'Mecánico' | 'admin' | 'ventas' | 'inventario' | 'taller' | 'contabilidad' | 'cliente';

export interface User {
  email: string;
  role: UserRole;
  name: string;
}

// Lista de todos los módulos disponibles (deben coincidir con los IDs en Sidebar.tsx)
const allModules = [
  'dashboard', 'sales', 'clients', 'vehicles', 'crm',
  'workshop', 'billing', 'financing', 'plates',
  'inventory', 'purchases', 'hr', 'reports', 'dian', 'portal', 'users'
];

// Mapeo de roles a módulos permitidos
export const rolePermissions: Record<UserRole, string[]> = {
  // Roles en español
  'Administrador': [...allModules], // Acceso a todos los módulos
  'Vendedor': ['dashboard', 'sales', 'clients', 'vehicles', 'crm'],
  'Mecánico': ['dashboard', 'workshop'],
  'Cliente': ['dashboard', 'portal'],
  
  // Roles en inglés (mantener compatibilidad)
  admin: [...allModules], // Acceso a todos los módulos
  ventas: ['dashboard', 'sales', 'clients', 'vehicles', 'crm'],
  inventario: ['dashboard', 'vehicles', 'inventory', 'purchases'],
  taller: ['dashboard', 'workshop'],
  contabilidad: ['dashboard', 'billing', 'reports', 'financing'],
  cliente: ['dashboard', 'portal']
};
