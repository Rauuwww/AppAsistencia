import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import AttendanceScanner from './components/AttendanceScanner';
import AssistantRegistration from './components/AssistantRegistration';
import AttendanceList from './components/AttendanceList';
import EventRegistration from './components/EventRegistration';
import EventsList from './components/EventsList';
import QRGenerator from './components/QRGenerator';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ConfiguracionSistema from './components/ConfiguracionSistema';
import MessageAlert from './components/MessageAlert';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

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

  const showMessage = (text, type = 'info', autoClose = true) => {
    setMessage({ text, type, autoClose });
  };

  const clearMessage = () => {
    setMessage({ type: '', text: '' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'scanner':
        return <AttendanceScanner showMessage={showMessage} />;
      case 'registration':
        return <AssistantRegistration showMessage={showMessage} />;
      case 'list':
        return <AttendanceList showMessage={showMessage} />;
      case 'events':
        return <EventRegistration showMessage={showMessage} />;
      case 'eventsList':
        return <EventsList showMessage={showMessage} />;
      case 'qrGenerator':
        return <QRGenerator showMessage={showMessage} />;
      case 'config':
        return <ConfiguracionSistema />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="bg-surface border-b border-border shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center justify-between w-full sm:w-auto sm:order-2">
              <div className="text-right mr-4 sm:mr-6">
                <p className="text-xs sm:text-sm text-text-secondary font-light">Usuario</p>
                <p className="text-sm sm:text-base text-text-primary font-medium">{user}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-error text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-all duration-200 hover:bg-error/80 hover:shadow-lg transform hover:-translate-y-0.5 flex items-center text-xs sm:text-sm"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Cerrar Sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </div>
            <div className="text-center sm:text-left sm:order-1 sm:flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-text-primary font-sans">
                Sistema de Asistencia QR
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-text-secondary font-light">
                Gestión de eventos y control de asistencia mediante códigos QR
              </p>
            </div>
            <div className="hidden sm:block sm:order-3 sm:w-48"></div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-6 mt-auto">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              © 2024 Sistema de Asistencia QR. Desarrollado con ❤️ para gestión profesional de eventos.
            </p>
          </div>
        </div>
      </footer>

      {/* Message Alert */}
      <MessageAlert message={message} onClose={clearMessage} />
    </div>
  );
}

export default App;