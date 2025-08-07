import React, { useState, useEffect } from 'react';
import useValidation from '../hooks/useValidation';

const ConfiguracionSistema = () => {
  const [config, setConfig] = useState({
    empresaNombre: 'Mi Empresa',
    logoUrl: 'https://i.imgur.com/8e4rzZJ.png',
    colorPrimario: '#4F9EFF',
    mostrarLogoEnQR: true,
    formatoFecha: 'DD/MM/YYYY',
    zonaHoraria: 'America/Mexico_City',
    idioma: 'es',
    notificaciones: true,
    autoBackup: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const validation = useValidation(config);

  const validationRules = {
    empresaNombre: ['required', { type: 'minLength', params: 2 }],
    logoUrl: ['required'],
    colorPrimario: ['required']
  };

  useEffect(() => {
    // Cargar configuración guardada
    const savedConfig = localStorage.getItem('systemConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!validation.validateForm(validationRules)) {
      setMessage({ type: 'error', text: 'Por favor corrige los errores en el formulario' });
      return;
    }

    try {
      setIsLoading(true);
      
      // Guardar en localStorage
      localStorage.setItem('systemConfig', JSON.stringify(config));
      
      // Aquí podrías enviar al backend si tienes una API
      // await api.guardarConfiguracion(config);
      
      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
      
      // Recargar la página para aplicar cambios
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const defaultConfig = {
      empresaNombre: 'Mi Empresa',
      logoUrl: 'https://i.imgur.com/8e4rzZJ.png',
      colorPrimario: '#4F9EFF',
      mostrarLogoEnQR: true,
      formatoFecha: 'DD/MM/YYYY',
      zonaHoraria: 'America/Mexico_City',
      idioma: 'es',
      notificaciones: true,
      autoBackup: false
    };
    setConfig(defaultConfig);
    setMessage({ type: 'warning', text: 'Configuración restablecida a valores por defecto' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Mensaje de estado */}
      {message.text && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' ? 'bg-success/10 border-success text-success' :
          message.type === 'error' ? 'bg-error/10 border-error text-error' :
          'bg-warning/10 border-warning text-warning'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 px-8 py-6 border-b border-border">
          <h2 className="text-3xl font-semibold mb-2 text-text-primary">⚙️ Configuración del Sistema</h2>
          <p className="text-text-secondary font-light">Personaliza la configuración de tu sistema de asistencia</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Información de la Empresa */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-text-primary">Información de la Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Nombre de la Empresa *
                </label>
                <input
                  type="text"
                  value={config.empresaNombre}
                  onChange={(e) => handleConfigChange('empresaNombre', e.target.value)}
                  className={`w-full p-3 bg-background border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                    validation.errors.empresaNombre ? 'border-error' : 'border-border'
                  }`}
                  placeholder="Ingresa el nombre de tu empresa"
                />
                {validation.errors.empresaNombre && (
                  <p className="text-error text-sm mt-1">{validation.errors.empresaNombre}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  URL del Logo *
                </label>
                <input
                  type="url"
                  value={config.logoUrl}
                  onChange={(e) => handleConfigChange('logoUrl', e.target.value)}
                  className={`w-full p-3 bg-background border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary ${
                    validation.errors.logoUrl ? 'border-error' : 'border-border'
                  }`}
                  placeholder="https://ejemplo.com/logo.png"
                />
                {validation.errors.logoUrl && (
                  <p className="text-error text-sm mt-1">{validation.errors.logoUrl}</p>
                )}
              </div>
            </div>
          </div>

          {/* Personalización Visual */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-text-primary">Personalización Visual</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Color Primario *
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={config.colorPrimario}
                    onChange={(e) => handleConfigChange('colorPrimario', e.target.value)}
                    className="w-16 h-12 border border-border rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.colorPrimario}
                    onChange={(e) => handleConfigChange('colorPrimario', e.target.value)}
                    className="flex-1 p-3 bg-background border border-border rounded-lg text-text-primary"
                    placeholder="#4F9EFF"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Mostrar Logo en QR
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.mostrarLogoEnQR}
                    onChange={(e) => handleConfigChange('mostrarLogoEnQR', e.target.checked)}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                  />
                  <span className="ml-3 text-sm text-text-secondary">
                    Incluir logo de empresa en los códigos QR generados
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración Regional */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-text-primary">Configuración Regional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Formato de Fecha
                </label>
                <select
                  value={config.formatoFecha}
                  onChange={(e) => handleConfigChange('formatoFecha', e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Zona Horaria
                </label>
                <select
                  value={config.zonaHoraria}
                  onChange={(e) => handleConfigChange('zonaHoraria', e.target.value)}
                  className="w-full p-3 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="America/Mexico_City">México (GMT-6)</option>
                  <option value="America/New_York">Nueva York (GMT-5)</option>
                  <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                  <option value="Europe/Madrid">Madrid (GMT+1)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>

          {/* Configuración del Sistema */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-text-primary">Configuración del Sistema</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                <div>
                  <h4 className="font-medium text-text-primary">Notificaciones</h4>
                  <p className="text-sm text-text-secondary">Recibir notificaciones de eventos importantes</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.notificaciones}
                  onChange={(e) => handleConfigChange('notificaciones', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                <div>
                  <h4 className="font-medium text-text-primary">Backup Automático</h4>
                  <p className="text-sm text-text-secondary">Crear copias de seguridad automáticas de los datos</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoBackup}
                  onChange={(e) => handleConfigChange('autoBackup', e.target.checked)}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:bg-primary-light hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Guardando...
                </>
              ) : (
                'Guardar Configuración'
              )}
            </button>

            <button
              onClick={handleReset}
              className="px-6 py-3 bg-surface border border-border text-text-primary rounded-lg font-medium transition-all duration-200 hover:bg-highlight"
            >
              Restablecer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracionSistema;