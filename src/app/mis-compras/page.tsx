"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface Compra {
  id: string;
  fecha: Date;
  productos: Array<{
    nombre: string;
    cantidad: number;
    precio: number;
    categoria: string;
  }>;
  total: number;
  estado: 'pendiente' | 'enviado' | 'entregado' | 'cancelado';
  numeroSeguimiento?: string;
}

function MisComprasContent() {
  const { user, isLoading } = useAuth();
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Datos de ejemplo (en producción vendrían de una API)
  const comprasEjemplo: Compra[] = [
    {
      id: 'COMP-001',
      fecha: new Date('2024-01-15'),
      productos: [
        { nombre: 'Policarbonato Alveolar 6mm Cristal', cantidad: 5, precio: 25900, categoria: 'Láminas Alveolares' },
        { nombre: 'Perfil de Aluminio H', cantidad: 2, precio: 8500, categoria: 'Accesorios' }
      ],
      total: 146400,
      estado: 'entregado',
      numeroSeguimiento: 'TRK-123456789'
    },
    {
      id: 'COMP-002', 
      fecha: new Date('2024-01-20'),
      productos: [
        { nombre: 'Policarbonato Compacto 3mm Bronce', cantidad: 3, precio: 32500, categoria: 'Rollos Compactos' }
      ],
      total: 97500,
      estado: 'enviado',
      numeroSeguimiento: 'TRK-987654321'
    },
    {
      id: 'COMP-003',
      fecha: new Date('2024-01-25'), 
      productos: [
        { nombre: 'Kit de Fijación Completo', cantidad: 1, precio: 45000, categoria: 'Accesorios' },
        { nombre: 'Policarbonato Ondulado 0.8mm Verde', cantidad: 4, precio: 18900, categoria: 'Ondulado' }
      ],
      total: 120600,
      estado: 'pendiente'
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando compras...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-yellow-100 rounded-full p-6 mx-auto mb-6 w-24 h-24 flex items-center justify-center">
            <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sesión Requerida</h2>
          <p className="text-gray-600 mb-6">
            Necesitas iniciar sesión para ver tus compras.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/"
              className="block bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const comprasFiltradas = filtroEstado === 'todos' 
    ? comprasEjemplo 
    : comprasEjemplo.filter(compra => compra.estado === filtroEstado);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'entregado': return 'bg-green-100 text-green-800';
      case 'enviado': return 'bg-blue-100 text-blue-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'entregado':
        return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
      case 'enviado':
        return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-.293-.707L15 4.586A1 1 0 0014.414 4H14v3z"/></svg>;
      case 'pendiente':
        return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
      default:
        return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Botón Volver */}
        <div className="mb-6">
          <Link
            href="/perfil"
            className="inline-flex items-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-300 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Perfil
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Compras</h1>
          <p className="text-gray-600">Historial y seguimiento de tus pedidos</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            <span className="text-sm font-medium text-gray-700 py-2">Filtrar por estado:</span>
            {['todos', 'pendiente', 'enviado', 'entregado', 'cancelado'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filtroEstado === estado
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Compras */}
        {comprasFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay compras</h3>
            <p className="text-gray-600 mb-6">
              {filtroEstado === 'todos' 
                ? 'Aún no has realizado ninguna compra'
                : `No tienes compras con estado "${filtroEstado}"`
              }
            </p>
            <Link
              href="/productos"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-colors"
            >
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {comprasFiltradas.map((compra) => (
              <div key={compra.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Header de la compra */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pedido #{compra.id}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {compra.fecha.toLocaleDateString('es-CL', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(compra.estado)}`}>
                        {getEstadoIcon(compra.estado)}
                        <span className="ml-1">{compra.estado.charAt(0).toUpperCase() + compra.estado.slice(1)}</span>
                      </span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          ${compra.total.toLocaleString('es-CL')}
                        </div>
                      </div>
                    </div>
                  </div>
                  {compra.numeroSeguimiento && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-600">
                        Seguimiento: 
                        <span className="font-mono font-medium text-blue-600 ml-1">
                          {compra.numeroSeguimiento}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Productos */}
                <div className="p-6">
                  <div className="space-y-3">
                    {compra.productos.map((producto, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                          <p className="text-sm text-gray-600">{producto.categoria}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {producto.cantidad} x ${producto.precio.toLocaleString('es-CL')}
                          </div>
                          <div className="font-medium text-gray-900">
                            ${(producto.cantidad * producto.precio).toLocaleString('es-CL')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Acciones */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 px-4 rounded-lg transition-colors">
                      Volver a Comprar
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                      Ver Detalles
                    </button>
                    {compra.estado === 'enviado' && (
                      <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors">
                        Rastrear Pedido
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Acciones principales */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/productos"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Explorar Productos
          </Link>
          <Link
            href="/"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MisComprasPage() {
  return <MisComprasContent />;
}