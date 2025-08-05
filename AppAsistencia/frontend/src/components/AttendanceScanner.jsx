import React, { useState, useEffect } from 'react';
import QRScanner from './QRScanner';
import { asistenciasAPI } from '../services/api';

const AttendanceScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [showEntradasModal, setShowEntradasModal] = useState(false);
  const [userData, setUserData] = useState(null);

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const obtenerDatosUsuario = async (invitadoId) => {
    try {
      const response = await asistenciasAPI.obtenerAsistencias();
      const asistencia = response.data.find(a => a.invitadoId === invitadoId);
      return asistencia;
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
      return null;
    }
  };

  const handleScanSuccess = async (invitadoId) => {
    setScanResult(invitadoId);
    setIsLoading(true);
    
    try {
      // Obtener datos del usuario
      const userInfo = await obtenerDatosUsuario(invitadoId);
      if (userInfo) {
        setUserData(userInfo);
        setShowEntradasModal(true);
      }

      // Marcar como asistió (1)
      await asistenciasAPI.cambiarEstadoAsistencia(invitadoId, 1);
      setAttendanceStatus('confirmed');
      showMessage(`¡Asistencia confirmada para: ${invitadoId}!`, 'success');
    } catch (error) {
      console.error('Error updating attendance:', error);
      if (error.response?.status === 404) {
        showMessage('Invitado no encontrado. Verifique el código QR.', 'error');
      } else {
        showMessage('Error al confirmar asistencia. Intente nuevamente.', 'error');
      }
      setAttendanceStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanError = (error) => {
    showMessage(`Error del escáner: ${error}`, 'error');
  };

  const resetScanner = () => {
    setScanResult('');
    setAttendanceStatus(null);
    setMessage('');
    setShowEntradasModal(false);
    setUserData(null);
  };

  const markAsNotAttended = async () => {
    if (!scanResult) return;
    
    setIsLoading(true);
    try {
      // Marcar como no asistió (0)
      await asistenciasAPI.cambiarEstadoAsistencia(scanResult, 0);
      setAttendanceStatus('not_attended');
      showMessage(`Marcado como no asistió: ${scanResult}`, 'info');
    } catch (error) {
      console.error('Error updating attendance:', error);
      showMessage('Error al actualizar asistencia.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const closeEntradasModal = () => {
    setShowEntradasModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Card principal con elevación Material UI */}
      <div className="bg-surface rounded-xl shadow-xl border border-border overflow-hidden">
        {/* Header de la card */}
        <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 px-8 py-6 border-b border-border">
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-2 text-text-primary">
              Escáner de Asistencia
            </h2>
            <p className="text-text-secondary font-light">
              Escanee el código QR del invitado para confirmar su asistencia
            </p>
          </div>
        </div>

        {/* Contenido de la card */}
        <div className="p-8">
          {/* Mensajes con estilo Material UI */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg shadow-sm border-l-4 ${
              messageType === 'success' ? 'bg-success/10 text-success border-success' :
              messageType === 'error' ? 'bg-error/10 text-error border-error' :
              'bg-primary/10 text-primary border-primary'
            }`}>
              <div className="flex items-center">
                <span className="text-lg mr-3">
                  {messageType === 'success' ? '✓' : messageType === 'error' ? '✕' : 'ℹ'}
                </span>
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}

          {/* QR Scanner */}
          <div className="mb-8">
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
              isActive={!isLoading}
            />
          </div>

          {/* Resultado del escaneo con estilo Material UI */}
          {scanResult && (
            <div className="bg-highlight/50 border border-border rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-3 text-text-primary text-lg">Código Escaneado</h3>
              <div className="bg-background/50 rounded-lg p-4 mb-4">
                <code className="text-sm break-all text-text-primary font-mono">{scanResult}</code>
              </div>
              
              {/* Estado de asistencia con iconos Material UI */}
              {attendanceStatus && (
                <div className="mt-4">
                  {attendanceStatus === 'confirmed' && (
                    <div className="flex items-center text-success bg-success/10 rounded-lg p-3">
                      <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium">Asistencia Confirmada</span>
                    </div>
                  )}
                  
                  {attendanceStatus === 'not_attended' && (
                    <div className="flex items-center text-warning bg-warning/10 rounded-lg p-3">
                      <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-background" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium">Marcado como No Asistió</span>
                    </div>
                  )}
                  
                  {attendanceStatus === 'error' && (
                    <div className="flex items-center text-error bg-error/10 rounded-lg p-3">
                      <div className="w-8 h-8 bg-error rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium">Error al procesar</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Botones de acción con estilo Material UI */}
          <div className="flex gap-4">
            <button
              onClick={resetScanner}
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:bg-primary-light hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoading}
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Nuevo Escaneo
              </span>
            </button>
            
            {scanResult && attendanceStatus === 'confirmed' && (
              <button
                onClick={markAsNotAttended}
                className="flex-1 bg-warning text-background py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:bg-warning/80 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {isLoading ? 'Procesando...' : 'Marcar como No Asistió'}
                </span>
              </button>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-8 text-center">
            <p className="text-sm text-text-secondary font-light">
              El código QR debe contener el ID del invitado generado por el sistema.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Número de Entradas con estilo Material UI */}
      {showEntradasModal && userData && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 px-6 py-4 border-b border-border">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-text-primary">
                  Información del Invitado
                </h3>
              </div>
            </div>
            
            {/* Contenido del modal */}
            <div className="p-6">
              <div className="space-y-4 mb-6">
                <div className="bg-highlight/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-text-secondary mb-1">Nombre</p>
                  <p className="text-lg text-text-primary font-medium">{userData.nombreUsuario}</p>
                </div>
                
                <div className="bg-highlight/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-text-secondary mb-1">Empresa</p>
                  <p className="text-lg text-text-primary font-medium">{userData.empresa}</p>
                </div>
                
                <div className="bg-highlight/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-text-secondary mb-1">Evento</p>
                  <p className="text-lg text-text-primary font-medium">{userData.eventoNombre}</p>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-primary mb-1">Número de Entradas</p>
                  <p className="text-3xl font-bold text-primary">{userData.noEntradas || 1}</p>
                </div>
              </div>
              
              <button
                onClick={closeEntradasModal}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:bg-primary-light hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceScanner;