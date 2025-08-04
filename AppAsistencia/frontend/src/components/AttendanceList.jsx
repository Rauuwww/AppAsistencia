import React, { useState, useEffect } from 'react';
import { asistenciasAPI } from '../services/api';

const AttendanceList = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'attended', 'not_attended'
  const [editingEntradas, setEditingEntradas] = useState(null);

  useEffect(() => {
    cargarAsistencias();
  }, []);

  const cargarAsistencias = async () => {
    try {
      setLoading(true);
      const response = await asistenciasAPI.obtenerAsistencias();
      setAsistencias(response.data);
    } catch (error) {
      console.error('Error loading attendance:', error);
      setError('Error al cargar las asistencias');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstadoAsistencia = async (invitadoId, asistio) => {
    try {
      await asistenciasAPI.cambiarEstadoAsistencia(invitadoId, asistio);
      await cargarAsistencias(); // Recargar la lista
    } catch (error) {
      console.error('Error changing attendance status:', error);
      setError('Error al cambiar el estado de asistencia');
    }
  };

  const actualizarNoEntradas = async (invitadoId, noEntradas) => {
    try {
      await asistenciasAPI.actualizarNoEntradas(invitadoId, noEntradas);
      await cargarAsistencias(); // Recargar la lista
      setEditingEntradas(null);
    } catch (error) {
      console.error('Error updating number of entries:', error);
      setError('Error al actualizar el número de entradas');
    }
  };

  const exportarCSV = async () => {
    try {
      const response = await asistenciasAPI.exportarCSV();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'asistencias.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting CSV:', error);
      setError('Error al exportar CSV');
    }
  };

  const asistenciasFiltradas = asistencias.filter(asistencia => {
    if (filter === 'attended') return asistencia.asistio === 1;
    if (filter === 'not_attended') return asistencia.asistio === 0;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Asistencias</h2>
        <div className="flex gap-2">
          <button
            onClick={exportarCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Exportar CSV
          </button>
          <button
            onClick={cargarAsistencias}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos ({asistencias.length})
          </button>
          <button
            onClick={() => setFilter('attended')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              filter === 'attended' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Asistieron ({asistencias.filter(a => a.asistio === 1).length})
          </button>
          <button
            onClick={() => setFilter('not_attended')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              filter === 'not_attended' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            No Asistieron ({asistencias.filter(a => a.asistio === 0).length})
          </button>
        </div>
      </div>

      {asistenciasFiltradas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No hay asistencias registradas</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invitado ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entradas
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {asistenciasFiltradas.map((asistencia) => (
                <tr key={asistencia.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900 break-all">
                    {asistencia.invitadoId}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {asistencia.nombreUsuario}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {asistencia.empresa}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {asistencia.eventoNombre}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {new Date(asistencia.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      asistencia.asistio 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {asistencia.asistio ? 'Asistió' : 'No Asistió'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {editingEntradas === asistencia.invitadoId ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          defaultValue={asistencia.noEntradas}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              actualizarNoEntradas(asistencia.invitadoId, parseInt(e.target.value));
                            }
                          }}
                          onBlur={(e) => {
                            actualizarNoEntradas(asistencia.invitadoId, parseInt(e.target.value));
                          }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span 
                        className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                        onClick={() => setEditingEntradas(asistencia.invitadoId)}
                      >
                        {asistencia.noEntradas || 1}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => cambiarEstadoAsistencia(asistencia.invitadoId, asistencia.asistio ? 0 : 1)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        asistencia.asistio
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {asistencia.asistio ? 'Marcar No Asistió' : 'Marcar Asistió'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AttendanceList;