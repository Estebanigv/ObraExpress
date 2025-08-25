"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from './notification-bell';
// import { NotificationSystem } from './notification-system'; // Temporalmente comentado para debug

export function UserMenu() {
  console.log('🚀 UserMenu component renderizando...');
  
  const { user, logout, login, register, loginWithGoogle, isLoading } = useAuth();
  
  console.log('🔍 UserMenu - Hook Auth obtenido:', { user, isLoading, login, register });
  
  // Debug log para verificar el estado del usuario
  React.useEffect(() => {
    console.log('🔍 UserMenu - Estado del usuario:', { user, isLoading });
  }, [user, isLoading]);
  
  const [showModal, setShowModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Debug para modal
  React.useEffect(() => {
    console.log('🔍 UserMenu - Estado del modal:', { showModal, isLoginMode, isDropdownOpen });
    if (showModal) {
      console.log('🚀 MODAL ABIERTO - showModal:', showModal);
    }
  }, [showModal, isLoginMode, isDropdownOpen]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Mount effect para portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloquear scroll del body cuando el modal esté abierto
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Evitar salto del scrollbar
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showModal]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    console.log('🚀 UserMenu - Iniciando submit:', { isLoginMode, email: formData.email });

    if (isLoginMode) {
      console.log('🔐 UserMenu - Intentando login...');
      const success = await login(formData.email, formData.password);
      console.log('🔐 UserMenu - Resultado login:', success);
      if (success) {
        console.log('✅ UserMenu - Login exitoso, cerrando modal');
        setShowModal(false);
        setFormData({ email: '', password: '', nombre: '', telefono: '' });
      } else {
        console.log('❌ UserMenu - Login fallido');
        setError('Email o contraseña incorrectos');
      }
    } else {
      if (!formData.nombre.trim()) {
        setError('El nombre es requerido');
        return;
      }
      
      const success = await register({
        email: formData.email,
        password: formData.password,
        nombre: formData.nombre,
        telefono: formData.telefono
      });
      
      if (success) {
        setShowModal(false);
        setFormData({ email: '', password: '', nombre: '', telefono: '' });
      } else {
        setError('El email ya está registrado');
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setFormData({ email: '', password: '', nombre: '', telefono: '' });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg w-20 h-8"></div>
    );
  }

  if (user) {
    // Obtener el nombre completo y manejar casos donde el nombre esté vacío
    console.log('👤 Usuario en UserMenu:', user);
    const displayName = user.nombre && user.nombre.trim() ? user.nombre : user.email.split('@')[0];
    const firstName = displayName.split(' ')[0];
    console.log('👤 Nombre para mostrar:', displayName);
    console.log('👤 Primer nombre para avatar:', firstName);
    
    return (
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center space-x-2">
          {/* Campanita de notificaciones */}
          <NotificationBell />
          
          {/* Botón de usuario logueado - ahora muestra el nombre completo */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
            title={`Logueado como ${displayName}`}
          >
            {/* Avatar pequeño dentro del botón */}
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {firstName.charAt(0).toUpperCase()}
              </span>
            </div>
            
            {/* Nombre del usuario */}
            <span className="hidden sm:inline max-w-24 truncate">
              {displayName}
            </span>
            <span className="sm:hidden">
              {firstName}
            </span>
            
            {/* Indicador de descuento si aplica */}
            {user.tieneDescuento && (
              <span className="text-yellow-300 text-xs">
                {user.porcentajeDescuento}%
              </span>
            )}
          </button>
        </div>

        {/* Dropdown expandido */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header del usuario */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-sm">{displayName}</p>
                  <p className="text-slate-700 text-xs">{user.email}</p>
                  {user.tieneDescuento && (
                    <span className="inline-block mt-1 text-yellow-700 text-xs bg-yellow-200 px-2 py-0.5 rounded-full">
                      🎉 {user.porcentajeDescuento}% OFF
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Acciones */}
            <div className="py-2">
              <a
                href="/perfil"
                className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium">Mi Perfil</span>
              </a>
              
              <a
                href="/mis-compras"
                className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-sm font-medium">Mis Compras</span>
              </a>

              <div className="border-t border-gray-100 my-1"></div>
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => {
            console.log('🎯 Click en botón Ingreso Cliente');
            setShowModal(true);
            setIsLoginMode(true);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 cursor-pointer"
          title="Ingreso Cliente"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden sm:inline">Ingreso Cliente</span>
          <span className="sm:hidden">Ingresar</span>
        </button>
      </div>

      {/* Modal de Login/Registro */}
      {showModal && mounted && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2147483647, // Máximo z-index posible
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            style={{
              maxHeight: 'calc(100vh - 2rem)',
              overflowY: 'auto',
              zIndex: 2147483647
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  Bienvenido a ObraExpress
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {isLoginMode ? 'Ingresa a tu cuenta' : 'Crea tu cuenta nueva'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full flex-shrink-0 ml-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            {/* Botón de Google */}
            <button
              onClick={() => {
                console.log('🎯 Click en Google desde modal');
                setError(''); // Limpiar errores previos
                setGoogleLoading(true);
                
                // Ejecutar de forma asíncrona sin bloquear la UI
                loginWithGoogle()
                  .then((result) => {
                    if (result.success && result.url) {
                      // Redirigir inmediatamente
                      window.location.href = result.url;
                    } else if (!result.success) {
                      setError(result.error || 'Error al conectar con Google');
                      setGoogleLoading(false);
                    }
                  })
                  .catch((error) => {
                    console.error('❌ Error:', error);
                    setError('Error al conectar con Google');
                    setGoogleLoading(false);
                  });
              }}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 mb-4 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              <span className="text-gray-700 font-medium group-hover:text-gray-900">
                {googleLoading 
                  ? 'Conectando con Google...'
                  : (isLoginMode ? 'Continuar con Google' : 'Registrarse con Google')
                }
              </span>
            </button>

            {/* Separador */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">O</span>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Nombre (solo para registro) */}
              {!isLoginMode && (
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    required
                    placeholder="Juan Pérez"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                  required
                  placeholder="tu@email.com"
                />
              </div>

              {/* Teléfono (solo para registro) */}
              {!isLoginMode && (
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                    placeholder="+56 9 1234 5678"
                  />
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
                  required
                  minLength={6}
                  placeholder={isLoginMode ? "Tu contraseña" : "Mínimo 6 caracteres"}
                />
              </div>

              {/* Checkbox recordarme (solo para login) */}
              {isLoginMode && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Recordarme
                  </label>
                </div>
              )}

              {/* Botón de submit */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                {isLoginMode ? 'Ingresar' : 'Crear Cuenta'}
              </button>
            </form>

            {/* Toggle entre Login/Registro */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {isLoginMode ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="ml-1 text-blue-500 hover:text-blue-600 font-semibold"
                >
                  {isLoginMode ? 'Crear cuenta' : 'Ingresar'}
                </button>
              </p>
            </div>

            {/* Link a recuperar contraseña (solo en login) */}
            {isLoginMode && (
              <div className="mt-2 text-center">
                <button
                  type="button"
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

          </div>
        </div>,
        document.body
      )}
    </>
  );
}