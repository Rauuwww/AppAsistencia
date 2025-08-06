import React from 'react';

const QRConfigModal = ({ isOpen, onClose, qrStyle, setQrStyle }) => {
  const presetStyles = [
    {
      name: 'Clásico Azul',
      style: {
        dotsOptions: { color: '#4F9EFF', type: 'rounded' },
        cornersSquareOptions: { color: '#4F9EFF', type: 'extra-rounded' },
        cornersDotOptions: { color: '#4F9EFF', type: 'dot' }
      }
    },
    {
      name: 'Verde Moderno',
      style: {
        dotsOptions: { color: '#50D2A0', type: 'square' },
        cornersSquareOptions: { color: '#50D2A0', type: 'square' },
        cornersDotOptions: { color: '#50D2A0', type: 'square' }
      }
    },
    {
      name: 'Púrpura Elegante',
      style: {
        dotsOptions: { color: '#84B9FF', type: 'dots' },
        cornersSquareOptions: { color: '#84B9FF', type: 'dot' },
        cornersDotOptions: { color: '#84B9FF', type: 'dot' }
      }
    },
    {
      name: 'Rojo Corporativo',
      style: {
        dotsOptions: { color: '#FF6B6B', type: 'classy-rounded' },
        cornersSquareOptions: { color: '#FF6B6B', type: 'extra-rounded' },
        cornersDotOptions: { color: '#FF6B6B', type: 'dot' }
      }
    }
  ];

  const applyPreset = (preset) => {
    setQrStyle(prev => ({
      ...prev,
      ...preset.style
    }));
  };

  const toggleLogo = () => {
    setQrStyle(prev => {
      if (prev.image) {
        // Si el logo está activo, desactivarlo
        return {
          ...prev,
          image: undefined,
          imageOptions: {
            ...prev.imageOptions,
            hideBackgroundDots: false
          }
        };
      } else {
        // Si el logo está inactivo, activarlo
        return {
          ...prev,
          image: 'https://i.imgur.com/g4hAfqU.png',
          imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.3,
            margin: 10,
            crossOrigin: 'anonymous'
          }
        };
      }
    });
  };

  const updateImageSize = (size) => {
    setQrStyle(prev => ({
      ...prev,
      imageOptions: {
        ...prev.imageOptions,
        imageSize: size
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header del modal */}
        <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text-primary">
                Configuración del QR
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-6">
            {/* Logo de Empresa */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-text-secondary">
                  Logo de Empresa
                </label>
                <button
                  onClick={toggleLogo}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    qrStyle.image ? 'bg-primary' : 'bg-highlight'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      qrStyle.image ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {qrStyle.image && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-highlight/30 rounded-lg">
                    <img 
                      src={qrStyle.image} 
                      alt="Logo empresa" 
                      className="w-8 h-8 object-contain bg-white rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-text-primary font-medium">Logo de empresa</p>
                      <p className="text-xs text-text-secondary">Se mostrará en el centro del QR</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-text-secondary mb-2">
                      Tamaño del logo: {Math.round((qrStyle.imageOptions?.imageSize || 0.3) * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="0.5"
                      step="0.05"
                      value={qrStyle.imageOptions?.imageSize || 0.3}
                      onChange={(e) => updateImageSize(parseFloat(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Estilos Predefinidos */}
            <div>
              <label className="block text-sm font-medium mb-3 text-text-secondary">
                Estilos Predefinidos
              </label>
              <div className="grid grid-cols-2 gap-3">
                {presetStyles.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="px-4 py-3 text-sm bg-highlight/50 border border-border rounded-lg hover:bg-highlight hover:border-primary transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-light text-text-primary font-medium"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Configuración de Tamaño */}
            <div>
              <label className="block text-sm font-medium mb-3 text-text-secondary">
                Tamaño del QR
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-secondary mb-2">Ancho</label>
                  <input
                    type="range"
                    min="200"
                    max="500"
                    value={qrStyle.width}
                    onChange={(e) => setQrStyle(prev => ({ 
                      ...prev, 
                      width: parseInt(e.target.value), 
                      height: parseInt(e.target.value) 
                    }))}
                    className="w-full accent-primary"
                  />
                  <span className="text-xs text-text-secondary">{qrStyle.width}px</span>
                </div>
                <div>
                  <label className="block text-xs text-text-secondary mb-2">Margen</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={qrStyle.margin}
                    onChange={(e) => setQrStyle(prev => ({ 
                      ...prev, 
                      margin: parseInt(e.target.value) 
                    }))}
                    className="w-full accent-primary"
                  />
                  <span className="text-xs text-text-secondary">{qrStyle.margin}px</span>
                </div>
              </div>
            </div>

            {/* Configuración de Color */}
            <div>
              <label className="block text-sm font-medium mb-3 text-text-secondary">
                Color Principal
              </label>
              <input
                type="color"
                value={qrStyle.dotsOptions.color}
                onChange={(e) => {
                  const color = e.target.value;
                  setQrStyle(prev => ({
                    ...prev,
                    dotsOptions: { ...prev.dotsOptions, color },
                    cornersSquareOptions: { ...prev.cornersSquareOptions, color },
                    cornersDotOptions: { ...prev.cornersDotOptions, color }
                  }));
                }}
                className="w-full h-12 border border-border rounded-lg cursor-pointer bg-highlight/50"
              />
            </div>

            {/* Tipo de Puntos */}
            <div>
              <label className="block text-sm font-medium mb-3 text-text-secondary">
                Estilo de Puntos
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['rounded', 'square', 'dots'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setQrStyle(prev => ({
                      ...prev,
                      dotsOptions: { ...prev.dotsOptions, type }
                    }))}
                    className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 font-medium ${
                      qrStyle.dotsOptions.type === type
                        ? 'bg-primary text-white'
                        : 'bg-highlight/50 border border-border text-text-primary hover:bg-highlight'
                    }`}
                  >
                    {type === 'rounded' ? 'Redondeado' : type === 'square' ? 'Cuadrado' : 'Puntos'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="px-6 py-4 border-t border-border bg-highlight/10">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-surface border border-border text-text-primary py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:bg-highlight"
            >
              Aplicar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRConfigModal;