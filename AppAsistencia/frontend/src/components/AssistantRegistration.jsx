import React, { useState, useEffect, useRef } from 'react';
import { asistenciasAPI, eventosAPI } from '../services/api';
import QRCodeStyling from 'qr-code-styling';
import QRConfigModal from './QRConfigModal';

const AssistantRegistration = () => {
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    empresa: '',
    eventoId: '',
    noEntradas: 1
  });
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [lastQRData, setLastQRData] = useState(null); // { invitadoId, nombreUsuario, empresa }
  const [qrStyle, setQrStyle] = useState({
    width: 300,
    height: 350,
    margin: 15,
    dotsOptions: { color: '#4F9EFF', type: 'rounded' },
    backgroundOptions: { color: '#fff' },
    cornersSquareOptions: { color: '#4F9EFF', type: 'extra-rounded' },
    cornersDotOptions: { color: '#4F9EFF', type: 'dot' },
    qrOptions: { 
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: 'M'
    }
  });
  const qrRef = useRef(null);
  const qrInstance = useRef(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (showQRModal && lastQRData && qrRef.current) {
      // Generar el QR solo cuando se muestra el modal
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = qrStyle.width;
      canvas.height = qrStyle.height + 80; // Espacio extra para texto
      
      // Fondo blanco
      ctx.fillStyle = qrStyle.backgroundOptions.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const qr = new QRCodeStyling({
        ...qrStyle,
        data: lastQRData.invitadoId
      });
      
      // Generar QR en canvas temporal
      const tempDiv = document.createElement('div');
      qr.append(tempDiv);
      
      // Esperar a que se genere el QR y luego agregarlo al canvas principal
      setTimeout(() => {
        const qrCanvas = tempDiv.querySelector('canvas');
        if (qrCanvas) {
          // Dibujar el QR en el canvas principal (posición superior)
          ctx.drawImage(qrCanvas, qrStyle.margin, qrStyle.margin, qrStyle.width - (qrStyle.margin * 2), qrStyle.height - (qrStyle.margin * 2));
          
          // Agregar texto debajo del QR
          ctx.textAlign = 'center';
          ctx.fillStyle = '#1E1E2E';
          
          // Nombre del usuario
          ctx.font = 'bold 16px Arial, sans-serif';
          ctx.fillText(lastQRData.nombreUsuario, canvas.width / 2, qrStyle.height + 20);
          
          // Empresa
          ctx.font = '14px Arial, sans-serif';
          ctx.fillStyle = qrStyle.dotsOptions.color;
          ctx.fillText(lastQRData.empresa, canvas.width / 2, qrStyle.height + 45);
          
          // Limpiar el contenedor y agregar el canvas final
          qrRef.current.innerHTML = '';
          qrRef.current.appendChild(canvas);
          
          // Guardar referencia para descarga
          qrInstance.current = { canvas };
        }
      }, 100);
    }
  }, [showQRModal, lastQRData, qrStyle]);

  const loadEvents = async () => {
    try {
      const response = await eventosAPI.obtenerEventos();
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      showMessage('Error al cargar eventos', 'error');
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombreUsuario || !formData.empresa || !formData.eventoId) {
      showMessage('Por favor, complete todos los campos', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await asistenciasAPI.registrarAsistencia({
        ...formData,
        asistio: 0 // Por defecto no asistió hasta que escanee el QR
      });
      // Generar invitadoId igual que getQRCode
      const selectedEvent = events.find(e => e.id == formData.eventoId);
      const nombreEvento = selectedEvent.nombre.replace(/\s+/g, '_');
      const usuarioSan = formData.nombreUsuario.replace(/\s+/g, '_');
      const empresaSan = formData.empresa.replace(/\s+/g, '_');
      const invitadoId = `${nombreEvento}_${usuarioSan}_${empresaSan}`;
      setLastQRData({
        invitadoId,
        nombreUsuario: formData.nombreUsuario,
        empresa: formData.empresa
      });
      setShowQRModal(true);
      showMessage('Asistente registrado exitosamente', 'success');
      setFormData({
        nombreUsuario: '',
        empresa: '',
        eventoId: '',
        noEntradas: 1
      });
    } catch (error) {
      console.error('Error registering assistant:', error);
      showMessage('Error al registrar asistente', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getQRCode = () => {
    if (!formData.nombreUsuario || !formData.empresa || !formData.eventoId) {
      return '';
    }
    
    const selectedEvent = events.find(e => e.id == formData.eventoId);
    if (!selectedEvent) return '';
    
    const nombreEvento = selectedEvent.nombre.replace(/\s+/g, '_');
    const usuarioSan = formData.nombreUsuario.replace(/\s+/g, '_');
    const empresaSan = formData.empresa.replace(/\s+/g, '_');
    
    return `${nombreEvento}_${usuarioSan}_${empresaSan}`;
  };

  const handleDownloadQR = () => {
    if (qrInstance.current && qrInstance.current.canvas) {
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.download = `${lastQRData.invitadoId}.png`;
      link.href = qrInstance.current.canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Card principal con elevación Material UI */}
      <div className="bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
        {/* Header de la card */}
        <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 px-8 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h2 className="text-3xl font-semibold mb-2 text-text-primary">
                📝 Registro de Asistentes
              </h2>
              <p className="text-text-secondary font-light">
                Complete el formulario para registrar un nuevo asistente al evento
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Campos de información personal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Nombre del Usuario */}
              <div className="relative">
                <label htmlFor="nombreUsuario" className="block text-sm font-medium mb-3 text-text-secondary">
                  Nombre Completo
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="nombreUsuario"
                    name="nombreUsuario"
                    value={formData.nombreUsuario}
                    onChange={handleInputChange}
                    placeholder="Ingrese el nombre completo"
                    className="w-full px-4 py-3 bg-highlight/50 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:border-primary text-text-primary transition-all duration-200 placeholder-text-secondary/50"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Empresa */}
              <div className="relative">
                <label htmlFor="empresa" className="block text-sm font-medium mb-3 text-text-secondary">
                  Empresa
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="empresa"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    placeholder="Ingrese el nombre de la empresa"
                    className="w-full px-4 py-3 bg-highlight/50 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:border-primary text-text-primary transition-all duration-200 placeholder-text-secondary/50"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Número de Entradas */}
              <div className="relative">
                <label htmlFor="noEntradas" className="block text-sm font-medium mb-3 text-text-secondary">
                  Número de Entradas
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="noEntradas"
                    name="noEntradas"
                    value={formData.noEntradas}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className="w-full px-4 py-3 bg-highlight/50 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:border-primary text-text-primary transition-all duration-200"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Evento */}
            <div className="relative">
              <label htmlFor="eventoId" className="block text-sm font-medium mb-3 text-text-secondary">
                Evento
              </label>
              <div className="relative">
                <select
                  id="eventoId"
                  name="eventoId"
                  value={formData.eventoId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-highlight/50 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:border-primary text-text-primary transition-all duration-200 appearance-none"
                  required
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
            </div>

            {/* QR Code Preview con estilo Material UI */}
            {getQRCode() && (
              <div className="bg-highlight/30 border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-text-primary">ID del Invitado (QR)</h3>
                  <div className="flex items-center text-xs text-text-secondary">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: qrStyle.dotsOptions.color }}
                    ></div>
                    Estilo: {qrStyle.dotsOptions.type} • {qrStyle.width}px
                  </div>
                </div>
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <code className="text-sm font-mono text-text-primary break-all">{getQRCode()}</code>
                </div>
                <p className="text-sm text-text-secondary mt-3 font-light">
                  Este ID será generado automáticamente y se puede usar para crear el código QR del asistente.
                  <button 
                    type="button"
                    onClick={() => setShowConfigModal(true)}
                    className="text-primary hover:text-primary-light ml-2 underline"
                  >
                    Personalizar estilo
                  </button>
                </p>
              </div>
            )}

            {/* Botón de envío con estilo Material UI */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-primary text-white py-4 px-8 rounded-lg font-medium transition-all duration-200 hover:bg-primary-light hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Registrar Asistente</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal para mostrar y descargar el QR único del usuario registrado */}
      {showQRModal && lastQRData && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 px-6 py-4 border-b border-border">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-text-primary">
                  QR del Asistente Registrado
                </h3>
              </div>
            </div>
            {/* Contenido del modal */}
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="flex flex-col items-center">
                  <div ref={qrRef} className="mb-4"></div>
                  <p className="text-xs text-text-secondary text-center">
                    QR personalizado con información de empresa
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDownloadQR}
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:bg-primary-light hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar QR Personalizado
                </button>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-full bg-surface border border-primary text-primary py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:bg-highlight hover:text-primary"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default AssistantRegistration;