"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const { login, register, isLoading } = useAuth();
  const router = useRouter();
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
        router.push('/');
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
        router.push('/');
      } else {
        setError('El email ya está registrado');
      }
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setFormData({ email: '', password: '', nombre: '', telefono: '' });
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'microsoft' | 'facebook') => {
    // Por ahora simulamos el login social
    // En producción aquí iría la integración real con los proveedores OAuth
    setError('');
    
    try {
      // Simular datos del usuario social
      const socialUser = {
        email: `usuario@${provider}.com`,
        nombre: `Usuario de ${provider.charAt(0).toUpperCase() + provider.slice(1)}`,
        telefono: '',
        tieneDescuento: true,
        porcentajeDescuento: 5,
        fechaRegistro: new Date(),
        provider: provider
      };

      // Registrar automáticamente con datos sociales
      const success = await register(socialUser);
      
      if (success) {
        router.push('/');
      } else {
        // Si ya existe, intentar login
        setError(`Tu cuenta de ${provider} ya está registrada. Inicia sesión normalmente.`);
      }
    } catch (error) {
      setError(`Error al conectar con ${provider}. Intenta nuevamente.`);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      onClick={(e) => {
        // Si se hace click fuera del formulario, volver al inicio
        if (e.target === e.currentTarget) {
          router.push('/');
        }
      }}
    >
      <div className="max-w-md w-full space-y-8 relative">
        {/* Logo y Header */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center bg-white rounded-full p-6 shadow-xl border-4 border-yellow-400 mb-6 mx-auto w-24 h-24">
              <img 
                src="/assets/images/isotipo.png" 
                alt="POLIMAX" 
                className="h-12 w-12 object-contain" 
              />
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLoginMode ? 'Bienvenido de vuelta' : 'Únete a POLIMAX'}
          </h2>
          <p className="text-gray-600">
            {isLoginMode 
              ? 'Accede a tu cuenta para gestionar tus pedidos' 
              : 'Regístrate y obtén 5% de descuento en tu primera compra'
            }
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 relative">
          {/* Botón de cerrar dentro del formulario */}
          <button
            onClick={() => router.push('/')}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            title="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {!isLoginMode && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono (opcional)
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                    placeholder="+56 9 xxxx xxxx"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? 'Procesando...' : (isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">O continúa con</span>
              </div>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-gray-50 group"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium group-hover:text-gray-900">Continuar con Google</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-gray-50 group"
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-gray-700 font-medium group-hover:text-gray-900">Continuar con Apple</span>
            </button>

            {/* Microsoft */}
            <button
              type="button"
              onClick={() => handleSocialLogin('microsoft')}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-gray-50 group"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#F25022" d="M1 1h10v10H1z"/>
                <path fill="#00A4EF" d="M12 1h10v10H12z"/>
                <path fill="#7FBA00" d="M1 12h10v10H1z"/>
                <path fill="#FFB900" d="M12 12h10v10H12z"/>
              </svg>
              <span className="text-gray-700 font-medium group-hover:text-gray-900">Continuar con Microsoft</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-gray-50 group"
            >
              <svg className="w-5 h-5 mr-3" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-gray-700 font-medium group-hover:text-gray-900">Continuar con Facebook</span>
            </button>
          </div>

          {/* Toggle Mode */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={toggleMode}
              className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
            >
              {isLoginMode 
                ? '¿No tienes cuenta? Regístrate aquí' 
                : '¿Ya tienes cuenta? Inicia sesión'
              }
            </button>
          </div>

          {/* Beneficios del registro */}
          {!isLoginMode && (
            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-yellow-50 border border-green-200 rounded-xl">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Beneficios de registrarte
              </h3>
              <ul className="text-sm text-green-700 space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  5% de descuento permanente
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Historial de compras
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Seguimiento de pedidos
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Ofertas exclusivas
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Volver al inicio */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Menú Principal
          </button>
        </div>
      </div>
    </div>
  );
}