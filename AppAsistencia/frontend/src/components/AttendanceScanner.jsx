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
    <div className="max-w-2xl mx-auto p-6 bg-surface border border-border rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 text-text-primary">
          Escáner de Asistencia
        </h2>
        <p className="text-text-secondary">
          Escanee el código QR del invitado para confirmar su asistencia
        </p>
      </div>

      {/* Mensajes */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          messageType === 'success' ? 'bg-success text-white border border-success' :
          messageType === 'error' ? 'bg-error text-white border border-error' :
          'bg-primary text-white border border-primary'
        }`}>
          {message}
        </div>
      )}

      {/* QR Scanner */}
      <div className="mb-6">
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
          isActive={!isLoading}
        />
      </div>

      {/* Resultado del escaneo */}
      {scanResult && (
        <div className="bg-highlight border border-border p-4 rounded-lg mb-4">
          <h3 className="font-semibold mb-2 text-text-primary">Código Escaneado:</h3>
          <p className="text-sm break-all text-text-secondary">{scanResult}</p>
          
          {/* Estado de asistencia */}
          {attendanceStatus && (
            <div className="mt-3">
              {attendanceStatus === 'confirmed' && (
                <div className="flex items-center text-success">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Asistencia Confirmada
                </div>
              )}
              
              {attendanceStatus === 'not_attended' && (
                <div className="flex items-center text-warning">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Marcado como No Asistió
                </div>
              )}
              
              {attendanceStatus === 'error' && (
                <div className="flex items-center text-error">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Error al procesar
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3">
        <button
          onClick={resetScanner}
          className="flex-1 bg-primary text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          Nuevo Escaneo
        </button>
        
        {scanResult && attendanceStatus === 'confirmed' && (
          <button
            onClick={markAsNotAttended}
            className="flex-1 bg-warning text-background py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Marcar como No Asistió'}
          </button>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-6 text-sm text-center text-text-secondary">
        <p>El código QR debe contener el ID del invitado generado por el sistema.</p>
      </div>

      {/* Modal de Número de Entradas */}
      {showEntradasModal && userData && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-highlight mb-4">
                <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              
              <h3 className="text-lg font-medium mb-2 text-text-primary">
                Información del Invitado
              </h3>
              
              <div className="text-left space-y-3 mb-6">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Nombre:</p>
                  <p className="text-base text-text-primary">{userData.nombreUsuario}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-text-secondary">Empresa:</p>
                  <p className="text-base text-text-primary">{userData.empresa}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-text-secondary">Evento:</p>
                  <p className="text-base text-text-primary">{userData.eventoNombre}</p>
                </div>
                
                <div className="bg-highlight p-3 rounded-lg">
                  <p className="text-sm font-medium text-primary">Número de Entradas:</p>
                  <p className="text-2xl font-bold text-primary">{userData.noEntradas || 1}</p>
                </div>
              </div>
              
              <button
                onClick={closeEntradasModal}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2"
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