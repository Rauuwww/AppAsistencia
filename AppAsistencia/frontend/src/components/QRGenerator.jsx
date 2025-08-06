import React, { useState, useEffect, useRef } from 'react';
import { asistenciasAPI, eventosAPI } from '../services/api';
import QRCodeStyling from 'qr-code-styling';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import QRConfigModal from './QRConfigModal';

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
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [qrStyle, setQrStyle] = useState({
    width: 300,
    height: 300,
    margin: 10,
    dotsOptions: {
      color: '#4F9EFF',
      type: 'rounded'
    },
    backgroundOptions: {
      color: '#ffffff'
    },
    cornersSquareOptions: {
      color: '#4F9EFF',
      type: 'extra-rounded'
    },
    cornersDotOptions: {
      color: '#4F9EFF',
      type: 'dot'
    },
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: 'M'
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.3,
      margin: 10,
      crossOrigin: 'anonymous'
    },
    image: undefined
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
    
    // Calcular altura total según si hay logo o no
    const logoHeight = qrStyle.image ? 80 : 0;
    const totalHeight = qrStyle.height + 80 + logoHeight; // QR + texto + logo(si hay)
    
    // Crear canvas personalizado con texto
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = qrStyle.width;
    canvas.height = totalHeight;
    
    // Fondo blanco
    ctx.fillStyle = qrStyle.backgroundOptions.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Si hay logo, dibujarlo en el encabezado
    if (qrStyle.image) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Calcular tamaño y posición del logo en el encabezado
        const logoSize = 60; // Tamaño fijo para el encabezado
        const logoX = (canvas.width - logoSize) / 2;
        const logoY = 10; // Margen superior
        
        // Dibujar el logo en el encabezado
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        
        // Generar QR después del logo
        generateQRAfterLogo();
      };
      img.onerror = () => {
        console.warn('Error cargando logo, continuando sin él');
        generateQRAfterLogo();
      };
      img.src = qrStyle.image;
    } else {
      // Si no hay logo, generar QR directamente
      generateQRAfterLogo();
    }
    
    function generateQRAfterLogo() {
      // Crear configuración QR sin imagen (para evitar conflictos)
      const qrConfig = {
        ...qrStyle,
        image: undefined,
        imageOptions: undefined
      };
      
      const qrCodeInstance = new QRCodeStyling({
        ...qrConfig,
        data: firstAssistant.invitadoId
      });

      // Generar QR en div temporal
      const tempDiv = document.createElement('div');
      qrCodeInstance.append(tempDiv);
      
      // Esperar a que se genere el QR y luego agregarlo al canvas principal
      setTimeout(() => {
        const qrCanvas = tempDiv.querySelector('canvas');
        if (qrCanvas) {
          // Calcular posición Y del QR (después del logo si existe)
          const qrY = qrStyle.image ? logoHeight + 10 : qrStyle.margin;
          
          // Dibujar el QR en el canvas principal
          ctx.drawImage(qrCanvas, qrStyle.margin, qrY, qrStyle.width - (qrStyle.margin * 2), qrStyle.height - (qrStyle.margin * 2));
          
          // Agregar texto debajo del QR
          const textY = qrY + qrStyle.height - qrStyle.margin + 20;
          ctx.textAlign = 'center';
          const centerX = canvas.width / 2;
          
          // Nombre del usuario
          ctx.font = 'bold 16px Arial, sans-serif';
          ctx.fillStyle = qrStyle.dotsOptions.color;
          ctx.fillText(firstAssistant.nombreUsuario, centerX, textY);
          
          // Empresa
          ctx.font = '14px Arial, sans-serif';
          ctx.fillStyle = qrStyle.dotsOptions.color;
          ctx.fillText(firstAssistant.empresa, centerX, textY + 25);
          
          // Limpiar el contenedor y agregar el canvas final
          qrRef.current.innerHTML = '';
          qrRef.current.appendChild(canvas);
          
          setPreviewQR({ canvas });
        }
      }, 100);
    }
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
        
        if (format === 'png') {
          // Para PNG, crear canvas personalizado con texto y logo
          // Calcular altura total según si hay logo o no
          const logoHeight = qrStyle.image ? 80 : 0;
          const totalHeight = qrStyle.height + 80 + logoHeight; // QR + texto + logo(si hay)
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = qrStyle.width;
          canvas.height = totalHeight;
          
          // Fondo blanco
          ctx.fillStyle = qrStyle.backgroundOptions.color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Si hay logo, dibujarlo en el encabezado primero
          if (qrStyle.image) {
            await new Promise((logoResolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.onload = () => {
                // Calcular tamaño y posición del logo en el encabezado
                const logoSize = 60; // Tamaño fijo para el encabezado
                const logoX = (canvas.width - logoSize) / 2;
                const logoY = 10; // Margen superior
                
                // Dibujar el logo en el encabezado
                ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
                logoResolve();
              };
              img.onerror = () => {
                console.warn('Error cargando logo, continuando sin él');
                logoResolve();
              };
              img.src = qrStyle.image;
            });
          }
          
          // Crear QR temporal sin imagen (para evitar conflictos)
          const qrCodeInstance = new QRCodeStyling({
            ...qrStyle,
            data: assistant.invitadoId,
            image: undefined,
            imageOptions: undefined
          });

          // Generar QR en div temporal
          const tempDiv = document.createElement('div');
          qrCodeInstance.append(tempDiv);
          
          // Esperar a que se genere el QR
          await new Promise((resolve) => {
            setTimeout(() => {
              const qrCanvas = tempDiv.querySelector('canvas');
              if (qrCanvas) {
                // Calcular posición Y del QR (después del logo si existe)
                const qrY = qrStyle.image ? logoHeight + 10 : qrStyle.margin;
                
                // Dibujar el QR en el canvas principal
                ctx.drawImage(qrCanvas, qrStyle.margin, qrY, qrStyle.width - (qrStyle.margin * 2), qrStyle.height - (qrStyle.margin * 2));
                
                // Agregar texto debajo del QR
                const textY = qrY + qrStyle.height - qrStyle.margin + 20;
                ctx.textAlign = 'center';
                const centerX = canvas.width / 2;
                
                // Nombre del usuario
                ctx.font = 'bold 16px Arial, sans-serif';
                ctx.fillStyle = qrStyle.dotsOptions.color;
                ctx.fillText(assistant.nombreUsuario, centerX, textY);
                
                // Empresa
                ctx.font = '14px Arial, sans-serif';
                ctx.fillStyle = qrStyle.dotsOptions.color;
                ctx.fillText(assistant.empresa, centerX, textY + 25);
              }
              resolve();
            }, 100);
          });

          // Convertir canvas a blob y añadir al ZIP
          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
          const fileName = `${assistant.nombreUsuario.replace(/[^a-zA-Z0-9]/g, '_')}_${assistant.empresa.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
          zip.file(fileName, blob);
          
        } else {
          // Para SVG, usar qr-code-styling directamente (sin logo para evitar conflictos)
          const qrCodeInstance = new QRCodeStyling({
            ...qrStyle,
            data: assistant.invitadoId,
            image: undefined,
            imageOptions: undefined
          });

          const qrData = await new Promise((resolve) => {
            qrCodeInstance.getRawData('svg').then(resolve);
          });

          // Añadir al ZIP
          const fileName = `${assistant.nombreUsuario.replace(/[^a-zA-Z0-9]/g, '_')}_${assistant.empresa.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
          zip.file(fileName, qrData);
        }
        
        // Actualizar progreso
        setGenerationProgress(Math.round(((i + 1) / eventAssistants.length) * 100));
      }

      // Generar y descargar ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `QR_Codes_${folderName}.zip`);
      
      showMessage(`${eventAssistants.length} códigos QR generados y descargados en formato ${format.toUpperCase()}${format === 'png' ? ' con información de empresa' : ''}${qrStyle.image ? ' y logo' : ''}`, 'success');
    } catch (error) {
      console.error('Error generating QRs:', error);
      showMessage('Error al generar los códigos QR', 'error');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Card principal con elevación Material UI */}
      <div className="bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
        {/* Header de la card */}
        <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h2 className="text-3xl font-semibold mb-2 text-text-primary">
                🎨 Generador de Códigos QR
              </h2>
              <p className="text-text-secondary font-light">
                Genera códigos QR personalizados para todos los asistentes de un evento
              </p>
            </div>
            {/* Botón de configuración QR */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="bg-highlight/50 border border-border text-text-primary p-3 rounded-lg font-medium transition-all duration-200 hover:bg-highlight hover:border-primary transform hover:-translate-y-0.5"
              title="Configurar QR"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido de la card */}
        <div className="p-8">
          {/* Mensajes con estilo Material UI */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg shadow-sm border-l-4 ${
              messageType === 'success' ? 'bg-success/10 text-success border-success' :
              messageType === 'error' ? 'bg-error/10 text-error border-error' :
              'bg-primary/10 text-primary border-primary'
            }`}>
              <div className="flex items-center">
                <span className="text-lg mr-3">
                  {messageType === 'success' ? '✓' : messageType === 'error' ? '✕' : 'ℹ'}
                </span>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Panel de Control */}
            <div className="space-y-6">
              {/* Selección de Evento */}
              <div className="bg-highlight/30 rounded-lg p-6">
                <label className="block text-sm font-medium mb-3 text-text-secondary">
                  Seleccionar Evento
                </label>
                <div className="relative">
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-4 py-3 bg-highlight/50 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:border-primary text-text-primary transition-all duration-200 appearance-none"
                    disabled={isLoading}
                  >
                    <option value="">Seleccione un evento</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.nombre} - {new Date(event.fecha).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Información del evento seleccionado */}
                {selectedEvent && !isLoading && (
                  <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm font-medium text-primary">
                        <strong>Asistentes:</strong> {eventAssistants.length}
                      </p>
                    </div>
                    {eventAssistants.length > 0 && (
                      <p className="text-xs text-primary/80 mt-1">
                        Se generarán {eventAssistants.length} códigos QR únicos
                      </p>
                    )}
                  </div>
                )}
                
                {isLoading && (
                  <div className="mt-4 flex items-center text-sm text-text-secondary">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Cargando asistentes...
                  </div>
                )}
              </div>

              {/* Información de configuración actual */}
              <div className="bg-highlight/30 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-text-secondary">Configuración Actual</h3>
                  <button
                    onClick={() => setShowConfigModal(true)}
                    className="text-primary hover:text-primary-light text-sm underline"
                  >
                    Personalizar
                  </button>
                </div>
                <div className="space-y-2 text-sm text-text-secondary">
                  <div className="flex items-center justify-between">
                    <span>Tamaño:</span>
                    <span>{qrStyle.width}x{qrStyle.height}px</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estilo:</span>
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: qrStyle.dotsOptions.color }}
                      ></div>
                      <span>{qrStyle.dotsOptions.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Margen:</span>
                    <span>{qrStyle.margin}px</span>
                  </div>
                  {qrStyle.image && (
                    <div className="flex items-center justify-between">
                      <span>Logo:</span>
                      <div className="flex items-center">
                        <img 
                          src={qrStyle.image} 
                          alt="Logo" 
                          className="w-4 h-4 object-contain bg-white rounded mr-2"
                        />
                        <span>Encabezado</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Generación en Lote */}
              {eventAssistants.length > 0 && (
                <div className="bg-highlight/30 rounded-lg p-6 space-y-4">
                  <h3 className="text-sm font-medium text-text-secondary">Generar QR en Lote</h3>
                  
                  {/* Barra de progreso */}
                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-text-secondary">
                        <span>Generando códigos QR...</span>
                        <span>{generationProgress}%</span>
                      </div>
                      <div className="w-full bg-highlight rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${generationProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => generateAllQRs('svg')}
                      disabled={isGenerating}
                      className="px-4 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-light hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
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
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {eventAssistants.length} SVG
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => generateAllQRs('png')}
                      disabled={isGenerating}
                      className="px-4 py-3 bg-success text-white font-medium rounded-lg hover:bg-success/80 hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-success disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
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
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {eventAssistants.length} PNG + Info
                        </span>
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-text-secondary text-center font-light">
                    Se descargará un archivo ZIP con todos los códigos QR
                  </p>
                </div>
              )}
            </div>

            {/* Vista Previa del QR */}
            <div className="flex flex-col items-center space-y-6">
              <h3 className="text-xl font-semibold text-text-primary">Vista Previa</h3>
              <div className="border-2 border-dashed border-border rounded-xl p-8 min-h-[400px] flex items-center justify-center bg-highlight/20 w-full">
                {eventAssistants.length > 0 ? (
                  <div className="text-center space-y-4">
                    <div ref={qrRef} className="flex items-center justify-center"></div>
                    <div className="text-sm text-text-secondary">
                      <p className="font-medium text-text-primary"><strong>Muestra:</strong> {eventAssistants[0]?.nombreUsuario}</p>
                      <p className="font-medium text-text-primary"><strong>Empresa:</strong> {eventAssistants[0]?.empresa}</p>
                      <p className="text-xs mt-3 text-text-secondary font-light">
                        Este es un ejemplo. Se generarán {eventAssistants.length} códigos únicos.
                      </p>
                    </div>
                  </div>
                ) : selectedEvent ? (
                  <div className="text-center">
                    <div className="text-text-secondary text-6xl mb-4">👥</div>
                    <p className="text-text-secondary font-medium">No hay asistentes registrados para este evento</p>
                    <p className="text-sm text-text-secondary mt-2 font-light">Registra asistentes para generar códigos QR</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-text-secondary text-6xl mb-4">🎪</div>
                    <p className="text-text-secondary font-medium">Selecciona un evento para generar códigos QR</p>
                    <p className="text-sm text-text-secondary mt-2 font-light">Los QR se generarán para todos los asistentes del evento</p>
                  </div>
                )}
              </div>
              
              {/* Lista de asistentes del evento */}
              {eventAssistants.length > 0 && (
                <div className="w-full max-w-md space-y-3">
                  <h4 className="text-sm font-medium text-text-secondary text-center">
                    Asistentes del Evento ({eventAssistants.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-2 bg-highlight/30 rounded-lg p-3">
                    {eventAssistants.map((assistant, index) => (
                      <div key={assistant.invitadoId} className="text-xs bg-highlight/50 p-2 rounded flex justify-between items-center">
                        <span className="text-text-primary font-medium">{assistant.nombreUsuario}</span>
                        <span className="text-text-secondary">{assistant.empresa}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de configuración QR */}
      <QRConfigModal 
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        qrStyle={qrStyle}
        setQrStyle={setQrStyle}
      />
    </div>
  );
};

export default QRGenerator;