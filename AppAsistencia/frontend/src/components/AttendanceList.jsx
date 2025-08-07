import React, { useState, useEffect } from 'react';
import { asistenciasAPI } from '../services/api';
import SearchAndFilters from './SearchAndFilters';

const AttendanceList = ({ showMessage }) => {
  const [asistencias, setAsistencias] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    evento: { type: 'select', label: 'Evento', value: '', options: [] },
    fecha: { type: 'date', label: 'Fecha', value: '' },
    entradas: { type: 'select', label: 'Entradas', value: '', options: [
      { value: '1', label: '1 entrada' },
      { value: '2', label: '2 entradas' },
      { value: '3', label: '3 entradas' },
      { value: '4+', label: '4+ entradas' }
    ]}
  });
  const [editingEntradas, setEditingEntradas] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Actualizar opciones de eventos en filtros
    if (eventos.length > 0) {
      setFilters(prev => ({
        ...prev,
        evento: {
          ...prev.evento,
          options: eventos.map(evento => ({
            value: evento.id.toString(),
            label: evento.nombre
          }))
        }
      }));
    }
  }, [eventos]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [asistenciasData, eventosData] = await Promise.all([
        asistenciasAPI.obtenerAsistencias(),
        asistenciasAPI.obtenerEventos()
      ]);
      setAsistencias(asistenciasData);
      setEventos(eventosData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showMessage('Error al cargar los datos', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };

  const filteredAsistencias = asistencias.filter(asistencia => {
    const matchesSearch = asistencia.nombreUsuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asistencia.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asistencia.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEvent = !filters.evento.value || asistencia.eventoId == filters.evento.value;
    
    const matchesDate = !filters.fecha.value || 
                       asistencia.fechaRegistro?.startsWith(filters.fecha.value);
    
    const matchesEntradas = !filters.entradas.value || 
                           (filters.entradas.value === '4+' ? asistencia.noEntradas >= 4 : 
                            asistencia.noEntradas == filters.entradas.value);
    
    return matchesSearch && matchesEvent && matchesDate && matchesEntradas;
  });

  const handleEditEntradas = (asistencia) => {
    setEditingEntradas(asistencia.invitadoId);
    setEditingValue(asistencia.noEntradas.toString());
  };

  const handleSaveEntradas = async () => {
    try {
      await asistenciasAPI.actualizarNoEntradas(editingEntradas, parseInt(editingValue));
      
      setAsistencias(prev => prev.map(asistencia => 
        asistencia.invitadoId === editingEntradas 
          ? { ...asistencia, noEntradas: parseInt(editingValue) }
          : asistencia
      ));
      
      setEditingEntradas(null);
      setEditingValue('');
      showMessage('Número de entradas actualizado exitosamente', 'success');
    } catch (error) {
      console.error('Error updating entradas:', error);
      showMessage('Error al actualizar el número de entradas', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingEntradas(null);
    setEditingValue('');
  };

  const handleExport = async () => {
    try {
      const response = await asistenciasAPI.exportarCSV();
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asistencias_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showMessage('Archivo CSV exportado exitosamente', 'success');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showMessage('Error al exportar el archivo CSV', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-text-secondary">Cargando asistencias...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 px-8 py-6 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-3xl font-semibold mb-2 text-text-primary">📊 Lista de Asistencias</h2>
              <p className="text-text-secondary font-light">
                Gestiona y visualiza todas las asistencias registradas en el sistema
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExport}
                className="bg-success text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-success/80 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Exportar CSV
              </button>
              <button
                onClick={fetchData}
                className="bg-primary text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-primary-light hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualizar
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Búsqueda y Filtros */}
          <SearchAndFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFilterChange={handleFilterChange}
            placeholder="Buscar por nombre, empresa o email..."
          />

          {/* Información de resultados */}
          <div className="mb-6 text-sm text-text-secondary">
            Mostrando {filteredAsistencias.length} de {asistencias.length} asistencias
          </div>

          {/* Tabla de Asistencias */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Nombre</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Empresa</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Evento</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Fecha Registro</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Entradas</th>
                  <th className="text-left py-3 px-4 font-semibold text-text-primary">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAsistencias.map((asistencia) => (
                  <tr key={asistencia.invitadoId} className="border-b border-border hover:bg-highlight/10 transition-colors">
                    <td className="py-3 px-4 text-text-primary font-mono text-sm">
                      {asistencia.invitadoId}
                    </td>
                    <td className="py-3 px-4 text-text-primary font-medium">
                      {asistencia.nombreUsuario}
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {asistencia.empresa}
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {asistencia.email || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {eventos.find(e => e.id === asistencia.eventoId)?.nombre || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-sm">
                      {asistencia.fechaRegistro ? 
                        new Date(asistencia.fechaRegistro).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'N/A'
                      }
                    </td>
                    <td className="py-3 px-4">
                      {editingEntradas === asistencia.invitadoId ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="w-16 p-1 text-center bg-background border border-border rounded text-text-primary"
                            min="1"
                          />
                          <button
                            onClick={handleSaveEntradas}
                            className="text-success hover:text-success/80"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-error hover:text-error/80"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-text-primary font-medium">
                            {asistencia.noEntradas}
                          </span>
                          <button
                            onClick={() => handleEditEntradas(asistencia)}
                            className="text-primary hover:text-primary-light"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          className="text-primary hover:text-primary-light"
                          title="Ver detalles"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mensaje cuando no hay resultados */}
          {filteredAsistencias.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="text-lg font-medium text-text-primary mb-2">No se encontraron asistencias</h3>
              <p className="text-text-secondary">
                {searchTerm || Object.values(filters).some(f => f.value) 
                  ? 'Intenta ajustar los filtros de búsqueda' 
                  : 'No hay asistencias registradas en el sistema'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceList;