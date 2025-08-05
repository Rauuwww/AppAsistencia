import React from 'react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'scanner', label: 'Escáner QR', icon: '📱' },
    { id: 'register-event', label: 'Registrar Evento', icon: '🎪' },
    { id: 'register-assistant', label: 'Registrar Asistente', icon: '📝' },
    { id: 'qr-generator', label: 'Generar QR', icon: '🎨' },
    { id: 'events', label: 'Ver Eventos', icon: '📅' },
    { id: 'attendance', label: 'Asistencias', icon: '👥' },
  ];

  return (
    <nav className="bg-surface border border-border shadow-lg rounded-lg mb-6">
      <div className="flex flex-wrap sm:flex-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center py-3 px-2 sm:px-4 lg:px-6 text-xs sm:text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-highlight text-text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-highlight'
            }`}
          >
            <span className="mr-1 sm:mr-2 text-sm sm:text-lg">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;