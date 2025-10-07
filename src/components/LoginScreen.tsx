import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Mail, Phone, MapPin, Loader2, UserCircle, ChevronDown } from 'lucide-react';
import { AlertType } from '../App';
import gammaLogo from '../assets/logo_claro.png';
import authService from '../services/authService';
import { UserRole } from '../types/auth.types';
import { useTheme } from '../contexts/ThemeContext';

interface LoginScreenProps {
  onLogin: (success: boolean, role?: UserRole, userName?: string) => void;
  showAlert: (type: AlertType, title: string, message: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, showAlert }) => {
  const { colors } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
    confirmPassword: '',
    recoveryEmail: '',
    role: ''
  });
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if ((isLogin || !isLogin) && !formData.role) {
      newErrors.role = 'Por favor seleccione un rol';
    }

    if (!isLogin && !showForgotPassword) {
      if (!formData.name) {
        newErrors.name = 'El nombre es obligatorio';
      }
      if (!formData.phone) {
        newErrors.phone = 'El teléfono es obligatorio';
      }
      if (!formData.address) {
        newErrors.address = 'La dirección es obligatoria';
      }
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Por favor confirme su contraseña';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    } else if (!showForgotPassword) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      }
    }

    if (showForgotPassword) {
      if (!formData.recoveryEmail) {
        newErrors.recoveryEmail = 'El correo de recuperación es obligatorio';
      } else if (!/\S+@\S+\.\S+/.test(formData.recoveryEmail)) {
        newErrors.recoveryEmail = 'Correo electrónico inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showAlert('error', 'Datos inválidos', 'Por favor corrija los errores en el formulario');
      return;
    }

    // Add role validation for login
    if (isLogin && !formData.role) {
      showAlert('error', 'Rol requerido', 'Por favor seleccione un rol');
      return;
    }

    if (showForgotPassword) {
      // Simulate password recovery
      showAlert('success', 'Recuperación enviada', 'Se ha enviado un enlace de recuperación a su correo');
      setShowForgotPassword(false);
      setFormData(prev => ({
        ...prev,
        recoveryEmail: '',
        role: prev.role || ''
      }));
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        // Try backend authentication first
        try {
          const response = await authService.login({
            email: formData.email,
            password: formData.password,
            role: formData.role
          });
          
          // Success - login with backend user data
          onLogin(true, response.user.role, response.user.name);
          showAlert('success', 'Acceso exitoso', `Bienvenido ${response.user.name}`);
        } catch (backendError) {
          // Fallback to hardcoded credentials for demo
          const credentials = {
            'admin@gammaservice.com': { password: 'admin123', role: 'Administrador', name: 'Administrador' },
            'vendedor@gammaservice.com': { password: 'vendedor123', role: 'Vendedor', name: 'Vendedor' },
            'cliente@gammaservice.com': { password: 'cliente123', role: 'Cliente', name: 'Cliente' },
            'mecanico@gammaservice.com': { password: 'mecanico123', role: 'Mecánico', name: 'Mecánico' }
          };

          const user = credentials[formData.email as keyof typeof credentials];

          if (user && user.password === formData.password) {
            if (user.role === formData.role) {
              const validRole = user.role as UserRole;
              onLogin(true, validRole, user.name);
              showAlert('success', 'Acceso exitoso', `Bienvenido ${user.name}`);
            } else {
              showAlert('error', 'Error de autenticación', 'El rol seleccionado no coincide con las credenciales');
              onLogin(false);
            }
          } else {
            showAlert('error', 'Error de autenticación', 'Correo o contraseña incorrectos');
            onLogin(false, undefined, undefined);
          }
        }
      } else {
        // Registration
        try {
          await authService.register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            address: formData.address,
            role: formData.role
          });
          
          showAlert('success', 'Registro exitoso', 'Usuario registrado correctamente. Puede iniciar sesión');
          setIsLogin(true);
          setFormData({
            email: formData.email,
            password: '',
            name: '',
            phone: '',
            address: '',
            confirmPassword: '',
            recoveryEmail: '',
            role: ''
          });
        } catch (registerError) {
          showAlert('error', 'Error de registro', registerError instanceof Error ? registerError.message : 'No se pudo registrar el usuario');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (showForgotPassword) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" 
        style={{ 
          backgroundColor: colors.background.primary,
          backgroundImage: colors.background.grid,
          backgroundSize: '20px 20px'
        }}
      >
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="mx-auto flex justify-center">
              <img
                src={gammaLogo}
                alt="GAMMA Service"
                className="h-16 w-auto object-contain"
              />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold" style={{ color: colors.text.primary }}>
              Recuperar Contraseña
            </h2>
            <p className="mt-2 text-center text-sm" style={{ color: colors.text.secondary }}>
              Ingrese su correo electrónico para recibir las instrucciones
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="recoveryEmail" className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                Correo Electrónico *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" style={{ color: colors.text.secondary }} />
                </div>
                <input
                  id="recoveryEmail"
                  type="email"
                  value={formData.recoveryEmail}
                  onChange={(e) => handleInputChange('recoveryEmail', e.target.value)}
                  className="glass-input appearance-none block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ color: colors.text.primary }}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              {errors.recoveryEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.recoveryEmail}</p>
              )}
            </div>

            <div className="flex flex-col space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Enlace'
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                style={{
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  borderColor: colors.border
                }}
                className="w-full py-3 px-4 border rounded-lg text-sm font-medium hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                Volver al Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // FORMULARIO PRINCIPAL
  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" 
      style={{ 
        backgroundColor: colors.background.primary,
        backgroundImage: colors.background.grid,
        backgroundSize: '20px 20px'
      }}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto flex justify-center">
            <img
              src={gammaLogo}
              alt="GAMMA Service"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold" style={{ color: colors.text.primary }}>
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: colors.text.secondary }}>
            {isLogin ? 'Acceda a GAMMA Service' : 'Registrarse en GAMMA Service'}
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            {/* Rol de Usuario - PRIMERO */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                Rol de Usuario *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <UserCircle className="h-5 w-5" style={{ color: colors.text.secondary }} />
                </div>
                <select
                  id="role"
                  value={formData.role}
                  onChange={e => handleInputChange('role', e.target.value)}
                  className="glass-input appearance-none block w-full pl-10 pr-10 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ color: colors.text.primary }}
                >
                  <option value="">Seleccione un rol</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Vendedor">Vendedor</option>
                  <option value="Cliente">Cliente</option>
                  <option value="Mecánico">Mecánico</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <ChevronDown className="h-5 w-5" style={{ color: colors.text.secondary }} />
                </div>
              </div>
              {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
            </div>

            {!isLogin && (
              <>
                {/* Campos de registro */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Nombre *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <User className="h-5 w-5" style={{ color: colors.text.secondary }} />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      className="glass-input appearance-none block w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      style={{ color: colors.text.primary }}
                      placeholder="Juan Pérez"
                    />
                  </div>
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Teléfono *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Phone className="h-5 w-5" style={{ color: colors.text.secondary }} />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      className="glass-input appearance-none block w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      style={{ color: colors.text.primary }}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                    Dirección *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MapPin className="h-5 w-5" style={{ color: colors.text.secondary }} />
                    </div>
                    <input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={e => handleInputChange('address', e.target.value)}
                      className="glass-input appearance-none block w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      style={{ color: colors.text.primary }}
                      placeholder="Calle 123 #45-67"
                    />
                  </div>
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>
              </>
            )}

            {/* Email y contraseña */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                Correo Electrónico *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5" style={{ color: colors.text.secondary }} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className="glass-input appearance-none block w-full pl-10 pr-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ color: colors.text.primary }}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                Contraseña *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5" style={{ color: colors.text.secondary }} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  className="glass-input appearance-none block w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  style={{ color: colors.text.primary }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" style={{ color: colors.text.secondary }} /> : <Eye className="h-5 w-5" style={{ color: colors.text.secondary }} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock className="h-5 w-5" style={{ color: colors.text.secondary }} />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => handleInputChange('confirmPassword', e.target.value)}
                    className="glass-input appearance-none block w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ color: colors.text.primary }}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={showConfirmPassword ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" style={{ color: colors.text.secondary }} /> : <Eye className="h-5 w-5" style={{ color: colors.text.secondary }} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isLogin ? 'Iniciando sesión...' : 'Creando cuenta...'}
              </>
            ) : (
              isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
            )}
          </button>

          <div className="flex items-center justify-between">
            {isLogin ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-orange-400 hover:text-orange-300"
                >
                  ¿Olvidó su contraseña?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(false);
                    setFormData({
                      email: formData.email,
                      password: '',
                      name: '',
                      phone: '',
                      address: '',
                      confirmPassword: '',
                      recoveryEmail: '',
                      role: ''
                    });
                    setErrors({});
                  }}
                  className="text-sm text-orange-400 hover:text-orange-300"
                >
                  Crear cuenta nueva
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setFormData({
                    email: formData.email,
                    password: '',
                    name: '',
                    phone: '',
                    address: '',
                    confirmPassword: '',
                    recoveryEmail: '',
                    role: ''
                  });
                  setErrors({});
                }}
                className="text-sm text-orange-400 hover:text-orange-300"
              >
                Ya tengo cuenta
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};