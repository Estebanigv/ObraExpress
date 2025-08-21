"use client";

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { redirect } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  // Verificar si el usuario está cargando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Verificar si el usuario está autenticado y es admin
  if (!user || !isUserAdmin(user.email)) {
    redirect('/login?redirect=/admin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header de administración */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Panel de Administración ObraExpress
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Administrador: <strong>{user.nombre}</strong>
              </span>
              <a
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Volver al Sitio
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación de pestañas */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <AdminNavLink href="/admin/ventas" icon="💰">
              Ventas
            </AdminNavLink>
            <AdminNavLink href="/admin/ordenes-trabajo" icon="📋">
              Órdenes de Trabajo
            </AdminNavLink>
            <AdminNavLink href="/admin/archivos" icon="📁">
              Archivos y Precios
            </AdminNavLink>
            <AdminNavLink href="/admin/proveedores" icon="🏭">
              Proveedores
            </AdminNavLink>
            <AdminNavLink href="/admin/alertas" icon="🔔">
              Alertas
            </AdminNavLink>
            <AdminNavLink href="/admin/configuracion" icon="⚙️">
              Configuración
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

function isUserAdmin(email: string): boolean {
  // Lista de emails de administradores
  const adminEmails = [
    'gonzalezvogel@gmail.com',
    'admin@obraexpress.cl',
    // Agregar más emails de admin según sea necesario
  ];
  
  return adminEmails.includes(email);
}