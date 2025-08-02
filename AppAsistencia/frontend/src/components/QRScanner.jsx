import React, { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';

const QRScanner = ({ onScanSuccess, onScanError, isActive = true }) => {
  const videoRef = useRef(null);
  const qrScanner = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');

  useEffect(() => {
    initScanner();
    return () => {
      stopScanning();
    };
  }, []);

  useEffect(() => {
    if (isActive && selectedDevice && qrScanner.current) {
      startScanning();
    } else {
      stopScanning();
    }
  }, [isActive, selectedDevice]);

  const initScanner = async () => {
    try {
      const cameras = await QrScanner.listCameras(true);
      setDevices(cameras);
      
      if (cameras.length > 0) {
        // Seleccionar la cámara trasera por defecto si está disponible
        const rearCamera = cameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('rear') ||
          camera.label.toLowerCase().includes('environment')
        );
        setSelectedDevice(rearCamera ? rearCamera.id : cameras[0].id);
      }

      // Crear el scanner
      qrScanner.current = new QrScanner(
        videoRef.current,
        (result) => {
          onScanSuccess?.(result.data);
        },
        {
          onDecodeError: (error) => {
            // Solo reportar errores que no sean de "no encontrado"
            if (error.message && !error.message.includes('No QR code found')) {
              console.error('Decode error:', error);
            }
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
    } catch (error) {
      console.error('Error initializing scanner:', error);
      onScanError?.(error.message);
    }
  };

  const startScanning = async () => {
    if (!selectedDevice || isScanning || !qrScanner.current) return;

    try {
      setIsScanning(true);
      await qrScanner.current.setCamera(selectedDevice);
      await qrScanner.current.start();
    } catch (error) {
      console.error('Error starting scanner:', error);
      onScanError?.(error.message);
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrScanner.current) {
      qrScanner.current.stop();
      setIsScanning(false);
    }
  };

  const handleDeviceChange = async (deviceId) => {
    stopScanning();
    setSelectedDevice(deviceId);
  };

  return (
    <div className="qr-scanner w-full max-w-md mx-auto">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Cámara:
        </label>
        <select
          value={selectedDevice}
          onChange={(e) => handleDeviceChange(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.label || `Cámara ${device.id.slice(0, 8)}`}
            </option>
          ))}
        </select>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          playsInline
          muted
        />
        {!isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <p className="text-white text-center">Escáner desactivado</p>
          </div>
        )}
        {isActive && (
          <div className="absolute inset-0 border-2 border-dashed border-white opacity-50">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-blue-500"></div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
          isScanning 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            isScanning ? 'bg-green-500' : 'bg-gray-500'
          }`}></div>
          {isScanning ? 'Escaneando...' : 'Detenido'}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;