import React, { useState } from 'react';
import { Settings, User, Shield, Bell, Database, Globe, Save, RefreshCw, Key, Mail, Phone, MapPin } from 'lucide-react';
import type { AlertColor } from '@mui/material';

interface SettingsModuleProps {
  showAlert: (type: AlertColor, title: string, message: string) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ showAlert }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'Administrador',
      email: 'admin@amplatform.com',
      phone: '+1 234 567 8900',
      address: 'Calle Principal 123, Ciudad'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      systemAlerts: true,
      reportReminders: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      passwordExpiry: '90',
      loginAttempts: '5'
    },
    system: {
      language: 'es',
      timezone: 'America/Mexico_City',
      dateFormat: 'DD/MM/YYYY',
      currency: 'MXN'
    }
  });

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'system', name: 'Sistema', icon: Settings }
  ];

  const handleSave = () => {
    showAlert('success', 'Configuración guardada', 'Los cambios han sido guardados correctamente');
  };

  const handleReset = () => {
    showAlert('info', 'Configuración restablecida', 'Se han restaurado los valores por defecto');
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <User className="h-5 w-5 mr-2 icon-enhanced" />
            Información Personal
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/90 mb-2">Nombre Completo</label>
              <input
                type="text"
                value={settings.profile.name}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, name: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70"
              />
            </div>
            <div>
              <label className="block text-white/90 mb-2">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70 icon-enhanced" />
                <input
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, email: e.target.value }
                  }))}
                  className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 icon-enhanced" />
            Contacto
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/90 mb-2">Teléfono</label>
              <input
                type="tel"
                value={settings.profile.phone}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  profile: { ...prev.profile, phone: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70"
              />
            </div>
            <div>
              <label className="block text-white/90 mb-2">Dirección</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/70 icon-enhanced" />
                <textarea
                  value={settings.profile.address}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, address: e.target.value }
                  }))}
                  className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 icon-enhanced" />
            Autenticación
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Autenticación de dos factores</p>
                <p className="text-white/70 text-sm">Agregar una capa extra de seguridad</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    security: { ...prev.security, twoFactorAuth: e.target.checked }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
              </label>
            </div>
            
            <div>
              <label className="block text-white/90 mb-2">Tiempo de sesión (minutos)</label>
              <select
                value={settings.security.sessionTimeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, sessionTimeout: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
              >
                <option value="15" className="text-black">15 minutos</option>
                <option value="30" className="text-black">30 minutos</option>
                <option value="60" className="text-black">1 hora</option>
                <option value="120" className="text-black">2 horas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Key className="h-5 w-5 mr-2 icon-enhanced" />
            Políticas de Contraseña
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/90 mb-2">Expiración de contraseña (días)</label>
              <input
                type="number"
                value={settings.security.passwordExpiry}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, passwordExpiry: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-white/90 mb-2">Intentos de login máximos</label>
              <input
                type="number"
                value={settings.security.loginAttempts}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: { ...prev.security, loginAttempts: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2 icon-enhanced" />
          Preferencias de Notificaciones
        </h3>
        <div className="space-y-4">
          {Object.entries({
            emailNotifications: 'Notificaciones por email',
            pushNotifications: 'Notificaciones push',
            smsNotifications: 'Notificaciones SMS',
            systemAlerts: 'Alertas del sistema',
            reportReminders: 'Recordatorios de reportes'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{label}</p>
                <p className="text-white/70 text-sm">Recibir {label.toLowerCase()}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notifications[key as keyof typeof settings.notifications]}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    notifications: { 
                      ...prev.notifications, 
                      [key]: e.target.checked 
                    }
                  }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 icon-enhanced" />
            Configuración Regional
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/90 mb-2">Idioma</label>
              <select
                value={settings.system.language}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, language: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
              >
                <option value="es" className="text-black">Español</option>
                <option value="en" className="text-black">English</option>
                <option value="fr" className="text-black">Français</option>
              </select>
            </div>
            <div>
              <label className="block text-white/90 mb-2">Zona Horaria</label>
              <select
                value={settings.system.timezone}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, timezone: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
              >
                <option value="America/Mexico_City" className="text-black">México (GMT-6)</option>
                <option value="America/New_York" className="text-black">Nueva York (GMT-5)</option>
                <option value="Europe/Madrid" className="text-black">Madrid (GMT+1)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 icon-enhanced" />
            Formato de Datos
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/90 mb-2">Formato de fecha</label>
              <select
                value={settings.system.dateFormat}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, dateFormat: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
              >
                <option value="DD/MM/YYYY" className="text-black">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY" className="text-black">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD" className="text-black">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-white/90 mb-2">Moneda</label>
              <select
                value={settings.system.currency}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, currency: e.target.value }
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-lg text-white"
              >
                <option value="MXN" className="text-black">Peso Mexicano (MXN)</option>
                <option value="USD" className="text-black">Dólar Americano (USD)</option>
                <option value="EUR" className="text-black">Euro (EUR)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Configuración del Sistema</h2>
            <p className="text-white/80">Personaliza tu experiencia en AM Platform</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 text-white/80 glass-card hover:text-white transition-colors glass-hover"
            >
              <RefreshCw className="h-4 w-4 icon-enhanced" />
              <span>Restablecer</span>
            </button>
            <button
              onClick={handleSave}
              className="btn-electric text-white py-2 px-4 rounded-lg font-semibold flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card">
        <div className="border-b border-white/20">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-[#2563EB] text-[#2563EB]'
                      : 'border-transparent text-white/70 hover:text-white'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 icon-enhanced" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'system' && renderSystemTab()}
        </div>
      </div>
    </div>
  );
};