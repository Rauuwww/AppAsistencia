import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simular delay de autenticación
    setTimeout(() => {
      // Credenciales fijas
      const validUsername = 'SYSDBA';
      const validPassword = 'masterkey';

      if (credentials.username === validUsername && credentials.password === validPassword) {
        // Guardar estado de autenticación en localStorage
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('user', credentials.username);
        onLogin();
      } else {
        setError('Credenciales incorrectas. Usuario: SYSDBA, Contraseña: masterkey');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card principal con elevación Material UI */}
        <div className="bg-surface rounded-xl shadow-2xl border border-border overflow-hidden">
          {/* Header de la card */}
          <div className="bg-gradient-to-r from-primary/10 to-primary-light/10 px-8 py-8 border-b border-border">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-semibold mb-2 text-text-primary">
                Acceso al Sistema
              </h2>
              <p className="text-text-secondary font-light">
                Ingrese sus credenciales para acceder al sistema de asistencia
              </p>
            </div>
          </div>

          {/* Formulario de login */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mensaje de error */}
              {error && (
                <div className="bg-error/10 text-error border border-error rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {/* Campo Usuario */}
              <div className="relative">
                <label htmlFor="username" className="block text-sm font-medium mb-3 text-text-secondary">
                  Usuario
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={credentials.username}
                    onChange={handleInputChange}
                    placeholder="Ingrese su usuario"
                    className="w-full px-4 py-3 bg-highlight/50 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:border-primary text-text-primary transition-all duration-200 placeholder-text-secondary/50"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium mb-3 text-text-secondary">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    placeholder="Ingrese su contraseña"
                    className="w-full px-4 py-3 bg-highlight/50 border border-border rounded-lg focus:ring-2 focus:ring-primary-light focus:ring-offset-2 focus:border-primary text-text-primary transition-all duration-200 placeholder-text-secondary/50"
                    required
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Información de credenciales */}
              <div className="bg-highlight/30 border border-border rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-primary mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-text-secondary">
                    <p className="font-medium text-text-primary mb-1">Credenciales de Acceso:</p>
                    <p><strong>Usuario:</strong> SYSDBA</p>
                    <p><strong>Contraseña:</strong> masterkey</p>
                  </div>
                </div>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-4 px-6 rounded-lg font-medium transition-all duration-200 hover:bg-primary-light hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Iniciar Sesión</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-text-secondary font-light">
                Sistema de Asistencia QR - Acceso Administrativo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;