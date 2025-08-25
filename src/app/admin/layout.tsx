"use client";

import React, { useState, useEffect } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación del admin independiente
    const adminAuth = localStorage.getItem('obraexpress_admin_auth');
    setIsAdminAuthenticated(adminAuth === 'authenticated');
    setLoading(false);
  }, []);

  // Verificar si el admin está cargando
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está autenticado como admin, mostrar directamente el componente hijo 
  // (que manejará su propia autenticación)
  if (!isAdminAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header de administración empresarial */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Panel Empresarial ObraExpress
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Administrador: <strong>admin@obraexpress.cl</strong>
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('obraexpress_admin_auth');
                  window.location.reload();
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
              <a
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Ver Sitio Web
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación de pestañas empresariales */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-6 overflow-x-auto">
            <AdminNavLink href="/admin" icon="🏠">
              Dashboard
            </AdminNavLink>
            <AdminNavLink href="/admin/productos" icon="📦">
              Productos
            </AdminNavLink>
            <AdminNavLink href="/admin/cupones" icon="🎫">
              Cupones
            </AdminNavLink>
            <AdminNavLink href="/admin/ventas" icon="💰">
              Ventas
            </AdminNavLink>
            <AdminNavLink href="/admin/clientes" icon="👥">
              Clientes
            </AdminNavLink>
            <AdminNavLink href="/admin/proveedores" icon="🏭">
              Proveedores
            </AdminNavLink>
            <AdminNavLink href="/admin/documentos" icon="📄">
              Documentos
            </AdminNavLink>
            <AdminNavLink href="/admin/ordenes-trabajo" icon="📋">
              Órdenes
            </AdminNavLink>
            <AdminNavLink href="/admin/reportes" icon="📊">
              Reportes
            </AdminNavLink>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function AdminNavLink({ 
  href, 
  icon, 
  children 
}: { 
  href: string; 
  icon: string; 
  children: React.ReactNode;
}) {
  const isActive = typeof window !== 'undefined' && window.location.pathname === href;
  
  return (
    <a
      href={href}
      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <span>{icon}</span>
      <span>{children}</span>
    </a>
  );
}

