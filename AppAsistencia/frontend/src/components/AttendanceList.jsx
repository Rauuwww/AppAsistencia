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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3 rounded mb-4" style={{ backgroundColor: 'var(--color-error)', color: 'white', border: '1px solid var(--color-error)' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Lista de Asistencias</h2>
        <div className="flex gap-2">
          <button
            onClick={exportarCSV}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-success)', color: 'white' }}
          >
            Exportar CSV
          </button>
          <button
            onClick={cargarAsistencias}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
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
                ? 'text-white' 
                : 'hover:bg-opacity-10'
            }`}
            style={{
              backgroundColor: filter === 'all' ? 'var(--color-primary)' : 'var(--color-highlight)',
              color: filter === 'all' ? 'white' : 'var(--color-text-secondary)'
            }}
          >
            Todos ({asistencias.length})
          </button>
          <button
            onClick={() => setFilter('attended')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              filter === 'attended' 
                ? 'text-white' 
                : 'hover:bg-opacity-10'
            }`}
            style={{
              backgroundColor: filter === 'attended' ? 'var(--color-success)' : 'var(--color-highlight)',
              color: filter === 'attended' ? 'white' : 'var(--color-text-secondary)'
            }}
          >
            Asistieron ({asistencias.filter(a => a.asistio === 1).length})
          </button>
          <button
            onClick={() => setFilter('not_attended')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              filter === 'not_attended' 
                ? 'text-white' 
                : 'hover:bg-opacity-10'
            }`}
            style={{
              backgroundColor: filter === 'not_attended' ? 'var(--color-error)' : 'var(--color-highlight)',
              color: filter === 'not_attended' ? 'white' : 'var(--color-text-secondary)'
            }}
          >
            No Asistieron ({asistencias.filter(a => a.asistio === 0).length})
          </button>
        </div>
      </div>

      {asistenciasFiltradas.length === 0 ? (
        <div className="text-center py-8" style={{ color: 'var(--color-text-secondary)' }}>
          <p>No hay asistencias registradas</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr style={{ backgroundColor: 'var(--color-highlight)' }}>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Invitado ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Nombre
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Empresa
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Evento
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Fecha
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Estado
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Entradas
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {asistenciasFiltradas.map((asistencia) => (
                <tr key={asistencia.id} className="hover:bg-opacity-10" style={{ ':hover': { backgroundColor: 'var(--color-highlight)' } }}>
                  <td className="px-4 py-2 text-sm break-all" style={{ color: 'var(--color-text-primary)' }}>
                    {asistencia.invitadoId}
                  </td>
                  <td className="px-4 py-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {asistencia.nombreUsuario}
                  </td>
                  <td className="px-4 py-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {asistencia.empresa}
                  </td>
                  <td className="px-4 py-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {asistencia.eventoNombre}
                  </td>
                  <td className="px-4 py-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {new Date(asistencia.fecha).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      asistencia.asistio 
                        ? 'text-white' 
                        : 'text-white'
                    }`}
                    style={{
                      backgroundColor: asistencia.asistio ? 'var(--color-success)' : 'var(--color-error)'
                    }}>
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
                          className="w-16 px-2 py-1 text-sm rounded"
                          style={{
                            backgroundColor: 'var(--color-highlight)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-text-primary)'
                          }}
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
                        className="cursor-pointer hover:bg-opacity-10 px-2 py-1 rounded"
                        style={{ 
                          color: 'var(--color-text-primary)',
                          ':hover': { backgroundColor: 'var(--color-highlight)' }
                        }}
                        onClick={() => setEditingEntradas(asistencia.invitadoId)}
                      >
                        {asistencia.noEntradas || 1}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => cambiarEstadoAsistencia(asistencia.invitadoId, asistencia.asistio ? 0 : 1)}
                      className="px-3 py-1 text-xs rounded transition-colors"
                      style={{
                        backgroundColor: asistencia.asistio ? 'var(--color-error)' : 'var(--color-success)',
                        color: 'white'
                      }}
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