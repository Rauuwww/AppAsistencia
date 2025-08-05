import React, { useState, useEffect } from 'react';
import { eventosAPI } from '../services/api';

const EventRegistration = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    fecha: ''
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
    
    if (!formData.nombre || !formData.fecha) {
      showMessage('Por favor, complete todos los campos', 'error');
      return;
    }

    // Validar que la fecha no sea en el pasado
    const selectedDate = new Date(formData.fecha);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      showMessage('La fecha del evento no puede ser en el pasado', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await eventosAPI.crearEvento(formData);
      
      showMessage('Evento creado exitosamente', 'success');
      setFormData({
        nombre: '',
        fecha: ''
      });
      
      // Recargar la lista de eventos
      await loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      showMessage('Error al crear el evento', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEventStatus = async (eventId, currentStatus) => {
    try {
      await eventosAPI.cambiarEstadoEvento(eventId, !currentStatus);
      showMessage('Estado del evento actualizado', 'success');
      await loadEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
      showMessage('Error al actualizar el estado del evento', 'error');
    }
  };

  const getMessageStyle = (type) => {
    switch (type) {
      case 'success':
        return { backgroundColor: 'var(--color-success)', color: 'white', border: '1px solid var(--color-success)' };
      case 'error':
        return { backgroundColor: 'var(--color-error)', color: 'white', border: '1px solid var(--color-error)' };
      default:
        return { backgroundColor: 'var(--color-primary)', color: 'white', border: '1px solid var(--color-primary)' };
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de Registro */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
            🎪 Registrar Nuevo Evento
          </h2>

          {/* Message Alert */}
          {message && (
            <div className="mb-4 p-4 rounded-lg" style={getMessageStyle(messageType)}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del Evento */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Nombre del Evento
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Conferencia Anual de Tecnología"
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: 'var(--color-highlight)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  '--tw-ring-color': 'var(--color-primary-light)'
                }}
                required
              />
            </div>

            {/* Fecha del Evento */}
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                Fecha del Evento
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-offset-2"
                style={{
                  backgroundColor: 'var(--color-highlight)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                  '--tw-ring-color': 'var(--color-primary-light)'
                }}
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'var(--color-primary)', 
                color: 'white',
                '--tw-ring-color': 'var(--color-primary-light)'
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creando Evento...
                </span>
              ) : (
                'Crear Evento'
              )}
            </button>
          </form>
        </div>

        {/* Lista de Eventos Existentes */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
            📋 Eventos Registrados
          </h2>

          {events.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4" style={{ color: 'var(--color-text-secondary)' }}>📅</div>
              <p style={{ color: 'var(--color-text-secondary)' }}>No hay eventos registrados</p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>Crea tu primer evento usando el formulario</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="rounded-lg p-4" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-highlight)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{event.nombre}</h3>
                      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        📅 {new Date(event.fecha).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.activo 
                          ? 'text-white' 
                          : 'text-white'
                      }`}
                      style={{
                        backgroundColor: event.activo ? 'var(--color-success)' : 'var(--color-text-secondary)'
                      }}>
                        {event.activo ? 'Activo' : 'Inactivo'}
                      </span>
                      <button
                        onClick={() => handleToggleEventStatus(event.id, event.activo)}
                        className="px-3 py-1 text-xs font-medium rounded text-white"
                        style={{
                          backgroundColor: event.activo ? 'var(--color-error)' : 'var(--color-success)'
                        }}
                      >
                        {event.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegistration;