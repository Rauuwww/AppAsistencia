import React, { useState } from 'react';
import Navigation from './components/Navigation';
import AttendanceScanner from './components/AttendanceScanner';
import EventsList from './components/EventsList';
import AttendanceList from './components/AttendanceList';
import EventRegistration from './components/EventRegistration';
import AssistantRegistration from './components/AssistantRegistration';
import QRGenerator from './components/QRGenerator';

function App() {
  const [activeTab, setActiveTab] = useState('scanner');

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

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header con elevación Material UI */}
      <header className="bg-surface border-b border-border shadow-lg">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 text-text-primary font-sans">
              Sistema de Asistencia QR
            </h1>
            <p className="text-lg text-text-secondary font-light">
              Gestión de eventos y control de asistencia mediante códigos QR
            </p>
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