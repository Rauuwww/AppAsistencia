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
    <nav className="flex flex-wrap sm:flex-nowrap">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative flex-1 flex items-center justify-center py-4 px-3 sm:px-6 text-sm font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'text-primary border-b-2 border-primary bg-highlight/20'
              : 'text-text-secondary hover:text-text-primary hover:bg-highlight/10'
          }`}
        >
          <span className="mr-2 text-lg">{tab.icon}</span>
          <span className="hidden sm:inline font-medium">{tab.label}</span>
          <span className="sm:hidden text-xs font-medium">{tab.label.split(' ')[0]}</span>
          
          {/* Indicador Material UI para tab activo */}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-sm"></div>
          )}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;