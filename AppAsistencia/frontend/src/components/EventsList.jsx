import React, { useState, useEffect } from 'react';
import { eventosAPI } from '../services/api';

const EventsList = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const response = await eventosAPI.obtenerEventos();
      setEventos(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (id, activo) => {
    try {
      await eventosAPI.cambiarEstadoEvento(id, activo);
      await cargarEventos(); // Recargar la lista
    } catch (error) {
      console.error('Error changing event status:', error);
      setError('Error al cambiar el estado del evento');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 rounded" style={{ backgroundColor: 'var(--color-error)', color: 'white', border: '1px solid var(--color-error)' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Eventos</h2>
        <button
          onClick={cargarEventos}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
        >
          Actualizar
        </button>
      </div>

      {eventos.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
          <p>No hay eventos registrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventos.map((evento) => (
            <div key={evento.id} className="rounded-lg p-4" style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-highlight)' }}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {evento.nombre}
                  </h3>
                  <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Fecha: {new Date(evento.fecha).toLocaleDateString('es-ES')}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white`}
                    style={{
                      backgroundColor: evento.activo ? 'var(--color-success)' : 'var(--color-text-secondary)'
                    }}>
                      {evento.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => cambiarEstado(evento.id, !evento.activo)}
                    className="px-3 py-1 text-sm rounded transition-colors text-white"
                    style={{
                      backgroundColor: evento.activo ? 'var(--color-error)' : 'var(--color-success)'
                    }}
                  >
                    {evento.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;