import React, { useState, useEffect, useRef } from 'react';
import { asistenciasAPI, eventosAPI } from '../services/api';
import QRCodeStyling from 'qr-code-styling';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const QRGenerator = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [eventAssistants, setEventAssistants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [previewQR, setPreviewQR] = useState(null);
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
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadEventAssistants();
    } else {
      setEventAssistants([]);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (eventAssistants.length > 0 && qrRef.current) {
      generatePreviewQR();
    }
  }, [eventAssistants, qrStyle]);

  const loadEvents = async () => {
    try {
      const response = await eventosAPI.obtenerEventos();
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      showMessage('Error al cargar eventos', 'error');
    }
  };

  const loadEventAssistants = async () => {
    if (!selectedEvent) return;
    
    setIsLoading(true);
    try {
      const response = await asistenciasAPI.obtenerAsistencias();
      // Filtrar asistentes del evento seleccionado y obtener únicos por invitadoId
      const eventAssistantsFiltered = response.data
        .filter(assistant => assistant.eventoId == selectedEvent)
        .reduce((acc, current) => {
          const existing = acc.find(item => item.invitadoId === current.invitadoId);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, []);
      
      setEventAssistants(eventAssistantsFiltered || []);
      showMessage(`${eventAssistantsFiltered.length} asistentes encontrados para este evento`, 'info');
    } catch (error) {
      console.error('Error loading event assistants:', error);
      showMessage('Error al cargar asistentes del evento', 'error');
    } finally {
      setIsLoading(false);
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

  const generatePreviewQR = () => {
    if (eventAssistants.length === 0) return;

    // Generar QR del primer asistente como preview
    const firstAssistant = eventAssistants[0];
    const qrCodeInstance = new QRCodeStyling({
      ...qrStyle,
      data: firstAssistant.invitadoId,
      image: undefined,
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 20
      }
    });

    qrRef.current.innerHTML = '';
    qrCodeInstance.append(qrRef.current);
    setPreviewQR(qrCodeInstance);
  };

  const generateAllQRs = async (format) => {
    if (eventAssistants.length === 0) {
      showMessage('No hay asistentes para generar QR', 'error');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      const zip = new JSZip();
      const selectedEventName = events.find(e => e.id == selectedEvent)?.nombre || 'Evento';
      const folderName = selectedEventName.replace(/[^a-zA-Z0-9]/g, '_');
      
      for (let i = 0; i < eventAssistants.length; i++) {
        const assistant = eventAssistants[i];
        
        // Crear instancia de QR para cada asistente
        const qrCodeInstance = new QRCodeStyling({
          ...qrStyle,
          data: assistant.invitadoId,
          image: undefined,
          imageOptions: {
            crossOrigin: 'anonymous',
            margin: 20
          }
        });

        // Generar el archivo
        const qrData = await new Promise((resolve) => {
          if (format === 'svg') {
            qrCodeInstance.getRawData('svg').then(resolve);
          } else {
            qrCodeInstance.getRawData('png').then(resolve);
          }
        });

        // Añadir al ZIP
        const fileName = `${assistant.nombreUsuario.replace(/[^a-zA-Z0-9]/g, '_')}_${assistant.empresa.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
        zip.file(fileName, qrData);
        
        // Actualizar progreso
        setGenerationProgress(Math.round(((i + 1) / eventAssistants.length) * 100));
      }

      // Generar y descargar ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `QR_Codes_${folderName}.zip`);
      
      showMessage(`${eventAssistants.length} códigos QR generados y descargados en formato ${format.toUpperCase()}`, 'success');
    } catch (error) {
      console.error('Error generating QRs:', error);
      showMessage('Error al generar los códigos QR', 'error');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
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
            {/* Selección de Evento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Evento
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              >
                <option value="">Seleccione un evento</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.nombre} - {new Date(event.fecha).toLocaleDateString()}
                  </option>
                ))}
              </select>
              
              {/* Información del evento seleccionado */}
              {selectedEvent && !isLoading && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>📊 Asistentes:</strong> {eventAssistants.length}
                  </p>
                  {eventAssistants.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Se generarán {eventAssistants.length} códigos QR únicos
                    </p>
                  )}
                </div>
              )}
              
              {isLoading && (
                <div className="mt-2 flex items-center text-sm text-gray-600">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Cargando asistentes...
                </div>
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

            {/* Botones de Generación en Lote */}
            {eventAssistants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Generar QR en Lote</h3>
                
                {/* Barra de progreso */}
                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Generando códigos QR...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => generateAllQRs('svg')}
                    disabled={isGenerating}
                    className="px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        SVG
                      </span>
                    ) : (
                      <>📄 {eventAssistants.length} SVG</>
                    )}
                  </button>
                  <button
                    onClick={() => generateAllQRs('png')}
                    disabled={isGenerating}
                    className="px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        PNG
                      </span>
                    ) : (
                      <>🖼️ {eventAssistants.length} PNG</>
                    )}
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 text-center">
                  Se descargará un archivo ZIP con todos los códigos QR
                </p>
              </div>
            )}
          </div>

          {/* Vista Previa del QR */}
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-lg font-medium text-gray-800">Vista Previa</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[400px] flex items-center justify-center bg-gray-50">
              {eventAssistants.length > 0 ? (
                <div className="text-center space-y-4">
                  <div ref={qrRef} className="flex items-center justify-center"></div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Muestra:</strong> {eventAssistants[0]?.nombreUsuario}</p>
                    <p><strong>Empresa:</strong> {eventAssistants[0]?.empresa}</p>
                    <p className="text-xs mt-2 text-gray-500">
                      Este es un ejemplo. Se generarán {eventAssistants.length} códigos únicos.
                    </p>
                  </div>
                </div>
              ) : selectedEvent ? (
                <div className="text-center">
                  <div className="text-gray-400 text-6xl mb-4">👥</div>
                  <p className="text-gray-500">No hay asistentes registrados para este evento</p>
                  <p className="text-sm text-gray-400 mt-2">Registra asistentes para generar códigos QR</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-gray-400 text-6xl mb-4">🎪</div>
                  <p className="text-gray-500">Selecciona un evento para generar códigos QR</p>
                  <p className="text-sm text-gray-400 mt-2">Los QR se generarán para todos los asistentes del evento</p>
                </div>
              )}
            </div>
            
            {/* Lista de asistentes del evento */}
            {eventAssistants.length > 0 && (
              <div className="w-full max-w-md space-y-2">
                <h4 className="text-sm font-medium text-gray-700 text-center">
                  Asistentes del Evento ({eventAssistants.length})
                </h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {eventAssistants.map((assistant, index) => (
                    <div key={assistant.invitadoId} className="text-xs bg-gray-100 p-2 rounded flex justify-between">
                      <span>{assistant.nombreUsuario}</span>
                      <span className="text-gray-500">{assistant.empresa}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;