import React, { useState, useEffect } from 'react';
import { asistenciasAPI, eventosAPI } from '../services/api';

const AssistantRegistration = () => {
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    empresa: '',
    eventoId: ''
  });
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

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
      
      showMessage('Asistente registrado exitosamente', 'success');
      setFormData({
        nombreUsuario: '',
        empresa: '',
        eventoId: ''
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📝 Registro de Asistentes
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del Usuario */}
            <div>
              <label htmlFor="nombreUsuario" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <input
                type="text"
                id="nombreUsuario"
                name="nombreUsuario"
                value={formData.nombreUsuario}
                onChange={handleInputChange}
                placeholder="Ingrese el nombre completo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Empresa */}
            <div>
              <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <input
                type="text"
                id="empresa"
                name="empresa"
                value={formData.empresa}
                onChange={handleInputChange}
                placeholder="Ingrese el nombre de la empresa"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Evento */}
          <div>
            <label htmlFor="eventoId" className="block text-sm font-medium text-gray-700 mb-2">
              Evento
            </label>
            <select
              id="eventoId"
              name="eventoId"
              value={formData.eventoId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccione un evento</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.nombre} - {new Date(event.fecha).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* QR Code Preview */}
          {getQRCode() && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">ID del Invitado (QR):</h3>
              <code className="text-sm bg-white p-2 rounded border block">{getQRCode()}</code>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Registrando...
                </span>
              ) : (
                'Registrar Asistente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssistantRegistration;