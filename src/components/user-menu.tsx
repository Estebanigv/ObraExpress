"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationSystem } from './notification-system';

export function UserMenu() {
  const { user, logout, login, register, isLoading } = useAuth();
  
  // Debug log para verificar el estado del usuario
  React.useEffect(() => {
    console.log('🔍 UserMenu - Estado del usuario:', { user, isLoading });
  }, [user, isLoading]);
  
  const [showModal, setShowModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    telefono: ''
  });
  const [error, setError] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

    if (isLoginMode) {
      const success = await login(formData.email, formData.password);
      if (success) {
        setShowModal(false);
        setFormData({ email: '', password: '', nombre: '', telefono: '' });
      } else {
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
    // Obtener solo el primer nombre
    const firstName = user.nombre.split(' ')[0];
    
    return (
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <NotificationSystem />
          
          {/* Avatar comprimido - clickeable */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 border-2 border-white hover:scale-105"
          >
            <span className="text-white font-bold text-sm">
              {firstName.charAt(0).toUpperCase()}
            </span>
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
                  <p className="text-slate-900 font-semibold text-sm">{firstName}</p>
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
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-1 sm:space-x-2 cursor-pointer"
          title="Ingresar / Registrarse"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden lg:inline">Ingreso Cliente</span>
          <span className="lg:hidden">Ingreso</span>
        </button>

        {/* Dropdown para usuario no logueado */}
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header para usuario no logueado */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center shadow-lg ring-2 ring-gray-100">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-slate-900 font-semibold text-sm">Usuario</p>
                  <p className="text-slate-700 text-xs">No has iniciado sesión</p>
                </div>
              </div>
            </div>
            
            {/* Acciones para usuario no logueado */}
            <div className="py-2">
              <a
                href="/login"
                className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-slate-50 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m0 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm font-medium">Iniciar Sesión</span>
              </a>
              
              <a
                href="/register"
                className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-slate-50 transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-sm font-medium">Registrarse</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}