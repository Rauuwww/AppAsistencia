import React from 'react';

const Navigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'scanner', label: 'Escáner QR', icon: '📱' },
    { id: 'events', label: 'Eventos', icon: '📅' },
    { id: 'attendance', label: 'Asistencias', icon: '👥' },
  ];

  return (
    <nav className="bg-white shadow-lg rounded-lg mb-6">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            <span className="mr-2 text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;