import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import AttendanceScanner from './components/AttendanceScanner';
import EventsList from './components/EventsList';
import AttendanceList from './components/AttendanceList';
import EventRegistration from './components/EventRegistration';
import AssistantRegistration from './components/AssistantRegistration';
import QRGenerator from './components/QRGenerator';
import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('');

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const currentUser = localStorage.getItem('user');
    
    if (authStatus === 'true' && currentUser) {
      setIsAuthenticated(true);
      setUser(currentUser);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setUser('SYSDBA');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser('');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'scanner':
        return <AttendanceScanner />;
      case 'register-event':
        return <EventRegistration />;
      case 'register-assistant':
        return <AssistantRegistration />;
      case 'qr-generator':
        return <QRGenerator />;
      case 'events':
        return <EventsList />;
      case 'attendance':
        return <AttendanceList />;
      default:
        return <AttendanceScanner />;
    }
  };

  // Si no está autenticado, mostrar el login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header con elevación Material UI */}
      <header className="bg-surface border-b border-border shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold mb-2 text-text-primary font-sans">
                Sistema de Asistencia QR
              </h1>
              <p className="text-lg text-text-secondary font-light">
                Gestión de eventos y control de asistencia mediante códigos QR
              </p>
            </div>
            
            {/* Información del usuario y botón de logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-text-secondary font-light">Usuario</p>
                <p className="text-text-primary font-medium">{user}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-error text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-error/80 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation con estilo Material UI */}
      <div className="bg-surface border-b border-border shadow-sm">
        <div className="container mx-auto px-6">
          <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>

      {/* Main Content con padding y estructura Material UI */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Footer con estilo Material UI */}
      <footer className="bg-surface border-t border-border mt-16">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center">
            <p className="text-sm text-text-secondary font-light">
              &copy; 2024 Sistema de Asistencia QR. Desarrollado con React y Tailwind CSS.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;