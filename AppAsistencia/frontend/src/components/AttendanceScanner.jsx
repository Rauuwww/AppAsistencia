import React, { useState, useEffect } from 'react';
import QRScanner from './QRScanner';
import { asistenciasAPI } from '../services/api';

const AttendanceScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleScanSuccess = async (invitadoId) => {
    setScanResult(invitadoId);
    setIsLoading(true);
    
    try {
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

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Escáner de Asistencia
        </h2>
        <p className="text-gray-600">
          Escanee el código QR del invitado para confirmar su asistencia
        </p>
      </div>

      {/* Mensajes */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
          messageType === 'error' ? 'bg-red-100 text-red-700 border border-red-300' :
          'bg-blue-100 text-blue-700 border border-blue-300'
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
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Código Escaneado:</h3>
          <p className="text-sm text-gray-600 break-all">{scanResult}</p>
          
          {/* Estado de asistencia */}
          {attendanceStatus && (
            <div className="mt-3">
              {attendanceStatus === 'confirmed' && (
                <div className="flex items-center text-green-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Asistencia Confirmada
                </div>
              )}
              
              {attendanceStatus === 'not_attended' && (
                <div className="flex items-center text-orange-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Marcado como No Asistió
                </div>
              )}
              
              {attendanceStatus === 'error' && (
                <div className="flex items-center text-red-600">
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
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={isLoading}
        >
          Nuevo Escaneo
        </button>
        
        {scanResult && attendanceStatus === 'confirmed' && (
          <button
            onClick={markAsNotAttended}
            className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : 'Marcar como No Asistió'}
          </button>
        )}
      </div>

      {/* Información adicional */}
      <div className="mt-6 text-sm text-gray-500 text-center">
        <p>El código QR debe contener el ID del invitado generado por el sistema.</p>
      </div>
    </div>
  );
};

export default AttendanceScanner;