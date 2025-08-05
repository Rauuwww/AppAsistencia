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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error text-white border border-error px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Eventos</h2>
        <button
          onClick={cargarEventos}
          className="bg-primary text-white px-4 py-2 rounded-lg transition-colors"
        >
          Actualizar
        </button>
      </div>

      {eventos.length === 0 ? (
        <div className="text-center py-8 text-text-secondary">
          <p>No hay eventos registrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventos.map((evento) => (
            <div key={evento.id} className="border border-border bg-highlight rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {evento.nombre}
                  </h3>
                  <p className="mt-1 text-text-secondary">
                    Fecha: {new Date(evento.fecha).toLocaleDateString('es-ES')}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${
                      evento.activo 
                        ? 'bg-success' 
                        : 'bg-text-secondary'
                    }`}>
                      {evento.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => cambiarEstado(evento.id, !evento.activo)}
                    className={`px-3 py-1 text-sm rounded transition-colors text-white ${
                      evento.activo ? 'bg-error' : 'bg-success'
                    }`}
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