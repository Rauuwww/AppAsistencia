import React, { useState, useEffect } from 'react';
import { asistenciasAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEventos: 0,
    totalAsistentes: 0,
    asistenciasHoy: 0,
    eventosActivos: 0,
    topEventos: [],
    graficoAsistencias: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Obtener todas las asistencias
      const asistencias = await asistenciasAPI.obtenerAsistencias();
      
      // Obtener eventos (simulado por ahora)
      const eventos = [
        { id: 1, nombre: 'Evento 1', activo: true },
        { id: 2, nombre: 'Evento 2', activo: true },
        { id: 3, nombre: 'Evento 3', activo: false }
      ];

      // Calcular estadísticas
      const hoy = new Date().toISOString().split('T')[0];
      const asistenciasHoy = asistencias.filter(a => 
        a.fechaRegistro && a.fechaRegistro.startsWith(hoy)
      ).length;

      // Top eventos por asistencias
      const eventosConAsistencias = eventos.map(evento => ({
        ...evento,
        asistencias: asistencias.filter(a => a.eventoId === evento.id).length
      })).sort((a, b) => b.asistencias - a.asistencias).slice(0, 5);

      // Gráfico de asistencias de los últimos 7 días
      const ultimos7Dias = [];
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        const fechaStr = fecha.toISOString().split('T')[0];
        const asistenciasDia = asistencias.filter(a => 
          a.fechaRegistro && a.fechaRegistro.startsWith(fechaStr)
        ).length;
        ultimos7Dias.push({
          fecha: fecha.toLocaleDateString('es-ES', { weekday: 'short' }),
          asistencias: asistenciasDia
        });
      }

      setStats({
        totalEventos: eventos.length,
        totalAsistentes: asistencias.length,
        asistenciasHoy,
        eventosActivos: eventos.filter(e => e.activo).length,
        topEventos: eventosConAsistencias,
        graficoAsistencias: ultimos7Dias
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-text-secondary">Cargando estadísticas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface p-6 rounded-xl border border-border hover:border-primary transition-colors">
          <div className="flex items-center">
            <div className="p-2 bg-primary/10 rounded-lg">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-text-secondary">Total Eventos</p>
              <p className="text-2xl font-bold text-text-primary">{stats.totalEventos}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border hover:border-primary transition-colors">
          <div className="flex items-center">
            <div className="p-2 bg-success/10 rounded-lg">
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-text-secondary">Total Asistentes</p>
              <p className="text-2xl font-bold text-text-primary">{stats.totalAsistentes}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border hover:border-primary transition-colors">
          <div className="flex items-center">
            <div className="p-2 bg-warning/10 rounded-lg">
              <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-text-secondary">Asistencias Hoy</p>
              <p className="text-2xl font-bold text-text-primary">{stats.asistenciasHoy}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border hover:border-primary transition-colors">
          <div className="flex items-center">
            <div className="p-2 bg-primary-light/10 rounded-lg">
              <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-text-secondary">Eventos Activos</p>
              <p className="text-2xl font-bold text-text-primary">{stats.eventosActivos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de asistencias */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Asistencias Últimos 7 Días</h3>
        <div className="flex items-end justify-between h-32">
          {stats.graficoAsistencias.map((dia, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="bg-primary rounded-t w-8 transition-all duration-300 hover:bg-primary-light"
                style={{ 
                  height: `${Math.max(10, (dia.asistencias / Math.max(...stats.graficoAsistencias.map(d => d.asistencias))) * 100)}%` 
                }}
              ></div>
              <span className="text-xs text-text-secondary mt-2">{dia.fecha}</span>
              <span className="text-xs text-text-primary font-medium">{dia.asistencias}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top eventos */}
      <div className="bg-surface rounded-xl border border-border p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Top 5 Eventos</h3>
        <div className="space-y-3">
          {stats.topEventos.map((evento, index) => (
            <div key={evento.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
              <div className="flex items-center">
                <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-text-primary">{evento.nombre}</p>
                  <p className="text-xs text-text-secondary">
                    {evento.activo ? 'Activo' : 'Inactivo'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-text-primary">{evento.asistencias}</p>
                <p className="text-xs text-text-secondary">asistentes</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;