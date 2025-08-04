import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const eventosAPI = {
  // Obtener todos los eventos
  obtenerEventos: () => api.get('/eventos'),
  
  // Crear un nuevo evento
  crearEvento: (evento) => api.post('/eventos', evento),
  
  // Cambiar estado de evento
  cambiarEstadoEvento: (id, activo) => api.put(`/eventos/${id}/estado`, { activo }),
};

export const asistenciasAPI = {
  // Obtener todas las asistencias
  obtenerAsistencias: () => api.get('/asistencias'),
  
  // Registrar nueva asistencia
  registrarAsistencia: (asistencia) => api.post('/asistencia', asistencia),
  
  // Cambiar estado de asistencia usando invitadoId
  cambiarEstadoAsistencia: (invitadoId, asistio) => 
    api.put(`/asistencia/${invitadoId}/estado`, { asistio }),
  
  // Actualizar número de entradas de una asistencia
  actualizarNoEntradas: (invitadoId, noEntradas) => 
    api.put(`/asistencia/${invitadoId}/entradas`, { noEntradas }),
  
  // Exportar CSV
  exportarCSV: () => api.get('/exportar', { responseType: 'blob' }),
};

export default api;