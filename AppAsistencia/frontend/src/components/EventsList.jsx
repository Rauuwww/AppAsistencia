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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Eventos</h2>
        <button
          onClick={cargarEventos}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {eventos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay eventos registrados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {eventos.map((evento) => (
            <div key={evento.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {evento.nombre}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Fecha: {new Date(evento.fecha).toLocaleDateString('es-ES')}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      evento.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {evento.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => cambiarEstado(evento.id, !evento.activo)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      evento.activo
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
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