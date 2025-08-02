import React, { useState, useEffect, useRef } from 'react';
import { asistenciasAPI } from '../services/api';
import QRCodeStyling from 'qr-code-styling';

const QRGenerator = () => {
  const [assistants, setAssistants] = useState([]);
  const [selectedAssistant, setSelectedAssistant] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [qrStyle, setQrStyle] = useState({
    width: 300,
    height: 300,
    margin: 10,
    dotsOptions: {
      color: '#1e40af',
      type: 'rounded'
    },
    backgroundOptions: {
      color: '#ffffff'
    },
    cornersSquareOptions: {
      color: '#1e40af',
      type: 'extra-rounded'
    },
    cornersDotOptions: {
      color: '#1e40af',
      type: 'dot'
    }
  });
  
  const qrRef = useRef(null);

  useEffect(() => {
    loadAssistants();
  }, []);

  useEffect(() => {
    if (selectedAssistant && qrRef.current) {
      generateQR();
    }
  }, [selectedAssistant, qrStyle]);

  const loadAssistants = async () => {
    try {
      const response = await asistenciasAPI.obtenerAsistencias();
      // Filtrar para obtener asistentes únicos por invitadoId
      const uniqueAssistants = response.data.reduce((acc, current) => {
        const existing = acc.find(item => item.invitadoId === current.invitadoId);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, []);
      setAssistants(uniqueAssistants || []);
    } catch (error) {
      console.error('Error loading assistants:', error);
      showMessage('Error al cargar asistentes', 'error');
    }
  };

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const generateQR = () => {
    if (!selectedAssistant) return;

    const qrCodeInstance = new QRCodeStyling({
      ...qrStyle,
      data: selectedAssistant,
      image: undefined, // Puedes añadir un logo aquí si quieres
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 20
      }
    });

    qrRef.current.innerHTML = '';
    qrCodeInstance.append(qrRef.current);
    setQrCode(qrCodeInstance);
  };

  const downloadQR = (format) => {
    if (!qrCode) {
      showMessage('Primero genera un código QR', 'error');
      return;
    }

    const fileName = `QR_${selectedAssistant.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    if (format === 'svg') {
      qrCode.download({ extension: 'svg', name: fileName });
    } else if (format === 'png') {
      qrCode.download({ extension: 'png', name: fileName });
    }
    
    showMessage(`Código QR descargado en formato ${format.toUpperCase()}`, 'success');
  };

  const handleStyleChange = (category, property, value) => {
    setQrStyle(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [property]: value
      }
    }));
  };

  const presetStyles = [
    {
      name: 'Clásico Azul',
      style: {
        dotsOptions: { color: '#1e40af', type: 'rounded' },
        cornersSquareOptions: { color: '#1e40af', type: 'extra-rounded' },
        cornersDotOptions: { color: '#1e40af', type: 'dot' }
      }
    },
    {
      name: 'Verde Moderno',
      style: {
        dotsOptions: { color: '#059669', type: 'square' },
        cornersSquareOptions: { color: '#059669', type: 'square' },
        cornersDotOptions: { color: '#059669', type: 'square' }
      }
    },
    {
      name: 'Púrpura Elegante',
      style: {
        dotsOptions: { color: '#7c3aed', type: 'dots' },
        cornersSquareOptions: { color: '#7c3aed', type: 'dot' },
        cornersDotOptions: { color: '#7c3aed', type: 'dot' }
      }
    },
    {
      name: 'Rojo Corporativo',
      style: {
        dotsOptions: { color: '#dc2626', type: 'classy-rounded' },
        cornersSquareOptions: { color: '#dc2626', type: 'extra-rounded' },
        cornersDotOptions: { color: '#dc2626', type: 'dot' }
      }
    }
  ];

  const applyPreset = (preset) => {
    setQrStyle(prev => ({
      ...prev,
      ...preset.style
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🎨 Generador de Códigos QR
        </h2>

        {/* Message Alert */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-200' :
            messageType === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
            'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Control */}
          <div className="space-y-6">
            {/* Selección de Asistente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Asistente
              </label>
              <select
                value={selectedAssistant}
                onChange={(e) => setSelectedAssistant(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seleccione un asistente</option>
                {assistants.map((assistant) => (
                  <option key={assistant.invitadoId} value={assistant.invitadoId}>
                    {assistant.nombreUsuario} - {assistant.empresa}
                  </option>
                ))}
              </select>
              {selectedAssistant && (
                <p className="mt-2 text-sm text-gray-600">
                  <strong>ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{selectedAssistant}</code>
                </p>
              )}
            </div>

            {/* Estilos Predefinidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estilos Predefinidos
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presetStyles.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Configuración de Tamaño */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamaño del QR
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Ancho</label>
                  <input
                    type="range"
                    min="200"
                    max="500"
                    value={qrStyle.width}
                    onChange={(e) => setQrStyle(prev => ({ ...prev, width: parseInt(e.target.value), height: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-600">{qrStyle.width}px</span>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Margen</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={qrStyle.margin}
                    onChange={(e) => setQrStyle(prev => ({ ...prev, margin: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <span className="text-xs text-gray-600">{qrStyle.margin}px</span>
                </div>
              </div>
            </div>

            {/* Configuración de Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            {/* Botones de Descarga */}
            {selectedAssistant && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Descargar QR</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => downloadQR('svg')}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    📄 SVG
                  </button>
                  <button
                    onClick={() => downloadQR('png')}
                    className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    🖼️ PNG
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Vista Previa del QR */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Vista Previa</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[400px] flex items-center justify-center bg-gray-50">
              {selectedAssistant ? (
                <div ref={qrRef} className="flex items-center justify-center"></div>
              ) : (
                <div className="text-center">
                  <div className="text-gray-400 text-6xl mb-4">📱</div>
                  <p className="text-gray-500">Selecciona un asistente para generar el QR</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;