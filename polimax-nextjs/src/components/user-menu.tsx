"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function UserMenu() {
  const { user, logout, login, register, isLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    telefono: ''
  });
  const [error, setError] = useState('');

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
    return (
      <div className="relative">
        <div className="flex items-center space-x-2 bg-green-100 rounded-lg px-2 py-1 border border-green-200">
          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-xs">
              {user.nombre.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden lg:block">
            <p className="text-green-900 text-xs font-medium">{user.nombre}</p>
            {user.tieneDescuento && (
              <p className="text-green-700 text-xs">
                🎉 {user.porcentajeDescuento}% OFF
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700 text-xs bg-red-100 hover:bg-red-200 px-2 py-0.5 rounded transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <a
          href="/login"
          className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-3 py-2 rounded-full font-medium transition-all flex items-center space-x-2 text-sm shadow-lg hover:shadow-xl hover:scale-105"
          title="Ingresar / Registrarse"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden xl:inline">Ingresar</span>
        </a>

      </div>
    </>
  );
}