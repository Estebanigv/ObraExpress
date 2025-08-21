"use client";

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NavbarSimple } from '@/components/navbar-simple';
import { ProductConfiguratorAdvanced } from '@/components/product-configurator-advanced';
import { ProductImage } from '@/components/optimized-image';

interface ProductGroup {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  variantes: any[];
  colores: string[];
  precio_desde: number;
  stock_total: number;
  variantes_count: number;
  imagen: string;
}

// Función para cargar datos de productos
const getProductData = (): ProductGroup[] => {
  try {
    const productosData = require('@/data/productos-policarbonato.json');
    return productosData.productos_policarbonato || [];
  } catch (error) {
    console.warn('Error cargando datos de productos:', error);
    return [];
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('configurador');
  
  const productId = params.id as string;
  const productos = getProductData();
  
  // Encontrar el producto por ID
  const producto = productos.find(p => p.id === productId);

  if (!producto) {
    return (
      <main className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Producto no encontrado
              </h1>
              <p className="text-gray-600 mb-6">
                El producto que buscas no existe o ha sido movido.
              </p>
              <button
                onClick={() => router.push('/productos')}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Ver todos los productos
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <NavbarSimple />
      
      {/* Hero Section */}
      <div className="relative pt-48 pb-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-amber-400/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f59e0b' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="relative container mx-auto px-6">
          {/* Breadcrumb elegante */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm">
              <button 
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-yellow-600 transition-colors font-medium"
              >
                Inicio
              </button>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <button 
                onClick={() => router.push('/productos')}
                className="text-gray-600 hover:text-yellow-600 transition-colors font-medium"
              >
                Productos
              </button>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-semibold">{producto.nombre}</span>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Información principal */}
            <div className="order-2 lg:order-1">
              <div className="mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-amber-400 text-black text-sm font-bold rounded-full shadow-lg">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {producto.categoria}
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {producto.nombre}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {producto.descripcion}
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/50">
                  <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    {producto.colores.length}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Colores</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/50">
                  <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    ${producto.precio_desde.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Desde</div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center shadow-lg border border-white/50">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {producto.stock_total}
                  </div>
                  <div className="text-sm font-medium text-gray-600">Stock</div>
                </div>
              </div>

              {/* Features destacadas */}
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-full border border-emerald-200">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Protección UV
                </span>
                <span className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full border border-blue-200">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Garantía 10 años
                </span>
                <span className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full border border-purple-200">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Alta resistencia
                </span>
              </div>
            </div>
            
            {/* Imagen principal mejorada */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-3xl blur-2xl opacity-20"></div>
                <div className="relative bg-white rounded-3xl p-4 shadow-2xl">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden aspect-square">
                    <ProductImage
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="container mx-auto px-6">
          {/* Navigation moderna */}
          <div className="relative">
            <div className="sticky top-36 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 -mx-6 px-6">
              <nav className="flex items-center justify-center">
                <div className="flex items-center space-x-1 bg-gray-100 rounded-2xl p-2 my-4">
                  {[
                    { id: 'configurador', label: 'Detalle', icon: '📦' },
                    { id: 'especificaciones', label: 'Especificaciones', icon: '📋' },
                    { id: 'aplicaciones', label: 'Aplicaciones', icon: '🏗️' },
                    { id: 'galeria', label: 'Galería', icon: '🖼️' },
                    { id: 'videos', label: 'Videos', icon: '🎬' },
                    { id: 'instalacion', label: 'Instalación', icon: '🔧' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-white text-gray-900 shadow-lg scale-105 border border-gray-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      <span className="mr-2 text-lg">{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </div>

          {/* Contenido de tabs con espaciado mejorado */}
          <div className="py-8">
            {activeTab === 'configurador' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Información del Producto</h2>
                  <p className="text-gray-600">Detalles principales y características del producto</p>
                </div>
                
                {/* Información básica del producto */}
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Imagen destacada */}
                    <div className="relative">
                      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden aspect-square">
                        <ProductImage
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    {/* Información detallada */}
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">{producto.nombre}</h3>
                      <p className="text-gray-600 text-lg mb-6 leading-relaxed">{producto.descripcion}</p>
                      
                      {/* Características destacadas */}
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-4 border border-emerald-200">
                          <h4 className="font-semibold text-emerald-900 mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Colores Disponibles
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {producto.colores.map((color) => (
                              <span key={color} className="px-3 py-1 bg-emerald-200 text-emerald-800 rounded-full text-sm font-medium">
                                {color}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Precio
                          </h4>
                          <p className="text-blue-800 text-xl font-bold">Desde ${producto.precio_desde.toLocaleString()}</p>
                        </div>
                        
                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
                          <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Stock Disponible
                          </h4>
                          <p className="text-purple-800 text-xl font-bold">{producto.stock_total} unidades</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'especificaciones' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Especificaciones Técnicas</h2>
                  <p className="text-gray-600">Detalles técnicos completos del producto</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v10a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1m8 0H7m8 14l-5-5 5-5m-5 5h12" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-blue-900">Espesores Disponibles</h4>
                    </div>
                    <div className="space-y-2">
                      {[...new Set(producto.variantes.map(v => v.espesor))].sort().map((espesor) => (
                        <div key={espesor} className="flex items-center text-blue-800">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                          {espesor}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-emerald-900">Colores</h4>
                    </div>
                    <div className="space-y-2">
                      {producto.colores.map((color) => (
                        <div key={color} className="flex items-center text-emerald-800">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                          {color}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-amber-900">Dimensiones</h4>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {[...new Set(producto.variantes.map(v => v.dimensiones))].sort().slice(0, 8).map((dimension) => (
                        <div key={dimension} className="flex items-center text-amber-800">
                          <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
                          {dimension}
                        </div>
                      ))}
                      {[...new Set(producto.variantes.map(v => v.dimensiones))].length > 8 && (
                        <div className="text-amber-600 text-sm font-medium mt-2 pl-5">
                          +{[...new Set(producto.variantes.map(v => v.dimensiones))].length - 8} dimensiones más...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'aplicaciones' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Aplicaciones y Usos</h2>
                  <p className="text-gray-600">Descubre todas las posibilidades de uso de este producto</p>
                </div>
                
                {producto.variantes[0]?.uso && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200 mb-8">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Descripción de Uso</h3>
                    <p className="text-blue-800 text-lg leading-relaxed">
                      {producto.variantes[0].uso}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { nombre: 'Techos', icono: '🏠', color: 'from-red-50 to-red-100 border-red-200 text-red-700' },
                    { nombre: 'Tragaluces', icono: '☀️', color: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700' },
                    { nombre: 'Invernaderos', icono: '🌱', color: 'from-green-50 to-green-100 border-green-200 text-green-700' },
                    { nombre: 'Cubiertas', icono: '⛱️', color: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700' },
                    { nombre: 'Divisiones', icono: '🔲', color: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700' },
                    { nombre: 'Marquesinas', icono: '🏢', color: 'from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700' },
                    { nombre: 'Diseño', icono: '🎨', color: 'from-pink-50 to-pink-100 border-pink-200 text-pink-700' },
                    { nombre: 'Arquitectura', icono: '🏛️', color: 'from-gray-50 to-gray-100 border-gray-200 text-gray-700' }
                  ].map((aplicacion) => (
                    <div key={aplicacion.nombre} className={`bg-gradient-to-br ${aplicacion.color} rounded-2xl p-4 border hover:scale-105 transition-transform duration-300 cursor-pointer`}>
                      <div className="text-center">
                        <div className="text-3xl mb-2">{aplicacion.icono}</div>
                        <span className="font-semibold">{aplicacion.nombre}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {activeTab === 'galeria' && (
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Galería de Imágenes del Producto
              </h3>
              
              {/* Grid de imágenes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Imagen principal */}
                <div className="md:col-span-2 lg:col-span-2">
                  <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video">
                    <ProductImage
                      src={producto.imagen}
                      alt={`${producto.nombre} - Vista principal`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">Vista principal del producto</p>
                </div>
                
                {/* Imágenes adicionales */}
                <div className="space-y-4">
                  <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square">
                    <ProductImage
                      src={producto.imagen}
                      alt={`${producto.nombre} - Detalle de instalación`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">Detalle de instalación</p>
                </div>
              </div>

              {/* Sección de colores disponibles con vista previa */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Colores Disponibles</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {producto.colores.map((color, index) => (
                    <div key={color} className="text-center">
                      <div className="bg-gray-200 rounded-lg overflow-hidden aspect-square mb-2 border-2 border-gray-300 hover:border-yellow-500 transition-colors cursor-pointer">
                        <ProductImage
                          src={producto.imagen}
                          alt={`${producto.nombre} - Color ${color}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{color}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Videos de Aplicación y Uso
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Video de instalación */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Proceso de Instalación</h4>
                  <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1m-6 0h6m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-600">Video de instalación</p>
                      <p className="text-sm text-gray-500">(Próximamente)</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Aprende paso a paso cómo instalar correctamente el {producto.nombre} en tu proyecto.
                  </p>
                </div>

                {/* Video de aplicaciones */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Ejemplos de Aplicación</h4>
                  <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V3a1 1 0 011 1v10a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1m8 0H7m8 14l-5-5 5-5m-5 5h12" />
                      </svg>
                      <p className="text-gray-600">Casos de uso reales</p>
                      <p className="text-sm text-gray-500">(Próximamente)</p>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Descubre las diferentes formas de usar {producto.nombre} en proyectos reales.
                  </p>
                </div>
              </div>

              {/* Video de comparación */}
              <div className="border-t border-gray-200 pt-8 mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Comparación con Otros Materiales</h4>
                <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <p className="text-gray-600">Video comparativo</p>
                    <p className="text-sm text-gray-500">(Próximamente)</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Conoce las ventajas del policarbonato frente a otros materiales como vidrio, acrílico y PVC.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'instalacion' && (
            <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Guía de Instalación
              </h3>
              
              {/* Herramientas necesarias */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Herramientas Necesarias</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { nombre: 'Taladro', icono: '🔧' },
                    { nombre: 'Sierra', icono: '⚒️' },
                    { nombre: 'Nivel', icono: '📏' },
                    { nombre: 'Tornillos', icono: '🔩' }
                  ].map((herramienta) => (
                    <div key={herramienta.nombre} className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-2xl mr-3">{herramienta.icono}</span>
                      <span className="text-blue-700 font-medium">{herramienta.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pasos de instalación */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Pasos de Instalación</h4>
                <div className="space-y-6">
                  {[
                    {
                      paso: 1,
                      titulo: 'Preparación del área',
                      descripcion: 'Limpia y prepara la superficie donde se instalará el material. Verifica que la estructura esté nivelada y sea resistente.'
                    },
                    {
                      paso: 2,
                      titulo: 'Medición y corte',
                      descripcion: 'Mide cuidadosamente las dimensiones necesarias y corta el material usando una sierra con dientes finos para evitar astillado.'
                    },
                    {
                      paso: 3,
                      titulo: 'Perforación',
                      descripcion: 'Realiza agujeros piloto ligeramente más grandes que los tornillos para permitir la expansión térmica del material.'
                    },
                    {
                      paso: 4,
                      titulo: 'Instalación de perfiles',
                      descripcion: 'Coloca los perfiles de cierre y unión según las especificaciones del fabricante, asegurando un sellado correcto.'
                    },
                    {
                      paso: 5,
                      titulo: 'Fijación final',
                      descripcion: 'Fija las láminas con tornillos autoroscantes, sin apretar excesivamente para evitar deformaciones.'
                    }
                  ].map((item) => (
                    <div key={item.paso} className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold mr-4">
                        {item.paso}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">{item.titulo}</h5>
                        <p className="text-gray-600">{item.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consejos importantes */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Consejos Importantes
                </h4>
                <ul className="space-y-2 text-amber-700">
                  <li>• Siempre usa protección UV adecuada en el lado expuesto al sol</li>
                  <li>• Permite espacio para expansión térmica en las fijaciones</li>
                  <li>• No camines directamente sobre las láminas durante la instalación</li>
                  <li>• Consulta con un profesional para instalaciones complejas</li>
                </ul>
              </div>
            </div>
          )}
          </div>

          {/* Sección de Productos Relacionados */}
          <div className="py-12 border-t border-gray-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Explorar Otros Productos</h2>
              <p className="text-gray-600">Descubre más opciones de la misma categoría</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productos
                .filter(p => p.id !== producto.id && p.categoria === producto.categoria)
                .slice(0, 8)
                .map((productoRelacionado) => (
                  <div 
                    key={productoRelacionado.id}
                    onClick={() => router.push(`/productos/${productoRelacionado.id}`)}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                  >
                    {/* Imagen del producto */}
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      <ProductImage
                        src={productoRelacionado.imagen}
                        alt={productoRelacionado.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Información del producto */}
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          {productoRelacionado.categoria}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2">
                        {productoRelacionado.nombre}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {productoRelacionado.descripcion}
                      </p>
                      
                      {/* Stats rápidas */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3">
                          <span className="text-emerald-600 font-semibold">
                            {productoRelacionado.colores.length} colores
                          </span>
                          <span className="text-blue-600 font-semibold">
                            ${productoRelacionado.precio_desde.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Si no hay productos relacionados, mostrar todos */}
            {productos.filter(p => p.id !== producto.id && p.categoria === producto.categoria).length === 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productos
                  .filter(p => p.id !== producto.id)
                  .slice(0, 8)
                  .map((productoRelacionado) => (
                    <div 
                      key={productoRelacionado.id}
                      onClick={() => router.push(`/productos/${productoRelacionado.id}`)}
                      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                        <ProductImage
                          src={productoRelacionado.imagen}
                          alt={productoRelacionado.nombre}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      
                      <div className="p-4">
                        <div className="mb-2">
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            {productoRelacionado.categoria}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors line-clamp-2">
                          {productoRelacionado.nombre}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {productoRelacionado.descripcion}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <span className="text-emerald-600 font-semibold">
                              {productoRelacionado.colores.length} colores
                            </span>
                            <span className="text-blue-600 font-semibold">
                              ${productoRelacionado.precio_desde.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
            
            {/* Botón para ver todos los productos */}
            <div className="text-center mt-8">
              <button
                onClick={() => router.push('/productos')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-400 text-black font-bold rounded-full hover:from-yellow-500 hover:to-amber-500 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Ver Todos los Productos
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}