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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-text-primary">
            Sistema de Asistencia QR
          </h1>
          <p className="text-text-secondary">
            Gestión de eventos y control de asistencia mediante códigos QR
          </p>
        </div>

        {/* Navigation */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-text-secondary">
          <p>&copy; 2024 Sistema de Asistencia QR. Desarrollado con React y Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;