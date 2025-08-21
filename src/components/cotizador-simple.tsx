"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { navigate } from '@/lib/client-utils';
import productosData from '@/data/productos-policarbonato.json';

interface ProductVariant {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio_con_iva: number;
  espesor: string;
  dimensiones: string;
  color: string;
  stock: number;
  uv_protection: boolean;
  garantia: string;
}

interface FilterOptions {
  busqueda: string;
  categoria: string;
  espesor: string;
}

const PRODUCTOS_POR_PAGINA = 6;

export const CotizadorSimple: React.FC = () => {
  const [productos, setProductos] = useState<ProductVariant[]>([]);
  const [filtros, setFiltros] = useState<FilterOptions>({
    busqueda: '',
    categoria: '',
    espesor: ''
  });
  const [productosSeleccionados, setProductosSeleccionados] = useState<{
    producto: ProductVariant;
    cantidad: number;
  }[]>([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [paso, setPaso] = useState(1);

  // Cargar productos
  useEffect(() => {
    const todosLosProductos: ProductVariant[] = [];
    productosData.productos_policarbonato.forEach(categoria => {
      if (categoria.variantes) {
        todosLosProductos.push(...categoria.variantes);
      }
    });
    setProductos(todosLosProductos);
  }, []);

  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    return productos.filter(producto => {
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        if (!producto.nombre.toLowerCase().includes(busqueda) &&
            !producto.codigo.toLowerCase().includes(busqueda)) {
          return false;
        }
      }
      if (filtros.categoria && producto.categoria !== filtros.categoria) return false;
      if (filtros.espesor && producto.espesor !== filtros.espesor) return false;
      return true;
    });
  }, [productos, filtros]);

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / PRODUCTOS_POR_PAGINA);
  const productosEnPagina = productosFiltrados.slice(
    (paginaActual - 1) * PRODUCTOS_POR_PAGINA,
    paginaActual * PRODUCTOS_POR_PAGINA
  );

  // Opciones de filtros
  const opcionesFiltros = useMemo(() => {
    const categorias = new Set<string>();
    const espesores = new Set<string>();
    
    productos.forEach(p => {
      categorias.add(p.categoria);
      espesores.add(p.espesor);
    });
    
    return {
      categorias: Array.from(categorias).sort(),
      espesores: Array.from(espesores).sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        return numA - numB;
      })
    };
  }, [productos]);

  // Agregar producto
  const agregarProducto = (producto: ProductVariant) => {
    const existente = productosSeleccionados.find(p => p.producto.codigo === producto.codigo);
    
    if (existente) {
      setProductosSeleccionados(prev =>
        prev.map(item =>
          item.producto.codigo === producto.codigo
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      );
    } else {
      setProductosSeleccionados(prev => [...prev, { producto, cantidad: 1 }]);
    }
  };

  // Actualizar cantidad
  const actualizarCantidad = (codigo: string, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      setProductosSeleccionados(prev => prev.filter(item => item.producto.codigo !== codigo));
    } else {
      setProductosSeleccionados(prev =>
        prev.map(item =>
          item.producto.codigo === codigo
            ? { ...item, cantidad: nuevaCantidad }
            : item
        )
      );
    }
  };

  // Calcular total
  const total = productosSeleccionados.reduce((sum, item) => {
    return sum + (item.producto.precio_con_iva * item.cantidad);
  }, 0);

  // Enviar cotización
  const enviarCotizacion = () => {
    const resumen = productosSeleccionados.map(item => 
      `• ${item.producto.nombre} (${item.producto.espesor}, ${item.producto.color})
        Cantidad: ${item.cantidad}
        Precio unitario: $${item.producto.precio_con_iva.toLocaleString('es-CL')}
        Subtotal: $${(item.producto.precio_con_iva * item.cantidad).toLocaleString('es-CL')}`
    ).join('\n\n');

    const mensaje = `🏗️ *COTIZACIÓN ObraExpress*

📦 *PRODUCTOS SELECCIONADOS:*
${resumen}

💰 *TOTAL: $${total.toLocaleString('es-CL')} CLP*

🌐 Cotización desde: obraexpress.cl
📅 ${new Date().toLocaleDateString('es-CL')}`;

    const whatsappUrl = `https://wa.me/56933334444?text=${encodeURIComponent(mensaje)}`;
    navigate.openInNewTab(whatsappUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Sitio Principal
            </button>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">Cotizador ObraExpress</h1>
              <p className="text-gray-600">Selecciona los productos que necesitas</p>
            </div>
            
            {productosSeleccionados.length > 0 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg px-6 py-4">
                <div className="text-green-700 font-bold text-lg">
                  {productosSeleccionados.length} producto{productosSeleccionados.length > 1 ? 's' : ''} seleccionado{productosSeleccionados.length > 1 ? 's' : ''}
                </div>
                <div className="text-green-600 text-xl font-bold">
                  Total: ${total.toLocaleString('es-CL')}
                </div>
                <button
                  onClick={enviarCotizacion}
                  className="mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all w-full"
                >
                  Enviar Cotización →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Buscar y Filtrar Productos</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={filtros.busqueda}
                onChange={(e) => {
                  setFiltros(prev => ({ ...prev, busqueda: e.target.value }));
                  setPaginaActual(1);
                }}
                className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={filtros.categoria}
              onChange={(e) => {
                setFiltros(prev => ({ ...prev, categoria: e.target.value }));
                setPaginaActual(1);
              }}
              className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">Todas las categorías</option>
              {opcionesFiltros.categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={filtros.espesor}
              onChange={(e) => {
                setFiltros(prev => ({ ...prev, espesor: e.target.value }));
                setPaginaActual(1);
              }}
              className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            >
              <option value="">Todos los espesores</option>
              {opcionesFiltros.espesores.map(esp => (
                <option key={esp} value={esp}>{esp}</option>
              ))}
            </select>
          </div>
          
          {(filtros.busqueda || filtros.categoria || filtros.espesor) && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-gray-600">
                Mostrando {productosFiltrados.length} de {productos.length} productos
              </span>
              <button
                onClick={() => setFiltros({ busqueda: '', categoria: '', espesor: '' })}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ✖ Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Carrito de productos seleccionados */}
        {productosSeleccionados.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-200 mb-8">
            <h3 className="text-xl font-bold text-green-700 mb-4">
              🛒 Productos en tu Cotización ({productosSeleccionados.length})
            </h3>
            <div className="space-y-3">
              {productosSeleccionados.map(item => (
                <div key={item.producto.codigo} className="flex items-center justify-between bg-green-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{item.producto.nombre}</h4>
                    <p className="text-sm text-gray-600">{item.producto.espesor} • {item.producto.color}</p>
                    <p className="text-sm text-green-600 font-medium">
                      ${item.producto.precio_con_iva.toLocaleString('es-CL')} por m²
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => actualizarCantidad(item.producto.codigo, item.cantidad - 1)}
                      className="w-10 h-10 bg-red-100 hover:bg-red-200 text-red-600 rounded-full font-bold transition-all"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-lg">{item.cantidad}</span>
                    <button
                      onClick={() => actualizarCantidad(item.producto.codigo, item.cantidad + 1)}
                      className="w-10 h-10 bg-green-100 hover:bg-green-200 text-green-600 rounded-full font-bold transition-all"
                    >
                      +
                    </button>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-gray-900">
                        ${(item.producto.precio_con_iva * item.cantidad).toLocaleString('es-CL')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Productos */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              📦 Catálogo de Productos
            </h3>
            <span className="text-gray-600">
              Página {paginaActual} de {totalPaginas}
            </span>
          </div>
          
          {productosEnPagina.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-600 mb-2">No se encontraron productos</h3>
              <p className="text-gray-500">Intenta con otros términos de búsqueda</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productosEnPagina.map(producto => {
                  const seleccionado = productosSeleccionados.find(p => p.producto.codigo === producto.codigo);
                  
                  return (
                    <div
                      key={producto.codigo}
                      className={`
                        border-2 rounded-xl p-6 transition-all hover:shadow-lg
                        ${seleccionado ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'}
                      `}
                    >
                      <div className="mb-4">
                        <h4 className="font-bold text-lg text-gray-900 mb-2">{producto.nombre}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{producto.descripcion}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            📏 {producto.espesor}
                          </span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                            🎨 {producto.color}
                          </span>
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            📦 Stock: {producto.stock}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-3">
                          Código: {producto.codigo} • Garantía: {producto.garantia}
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold text-gray-900">
                            ${producto.precio_con_iva.toLocaleString('es-CL')}
                          </div>
                          <div className="text-sm text-gray-600">por m² (IVA incluido)</div>
                        </div>
                        
                        {seleccionado ? (
                          <div className="space-y-3">
                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-center font-bold">
                              ✓ Agregado ({seleccionado.cantidad})
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => actualizarCantidad(producto.codigo, seleccionado.cantidad - 1)}
                                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 rounded-lg font-medium transition-all"
                              >
                                - Quitar
                              </button>
                              <button
                                onClick={() => actualizarCantidad(producto.codigo, seleccionado.cantidad + 1)}
                                className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 py-2 rounded-lg font-medium transition-all"
                              >
                                + Agregar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => agregarProducto(producto)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                          >
                            + Agregar al Carrito
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="flex justify-center items-center mt-8 gap-2">
                  <button
                    onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
                    disabled={paginaActual === 1}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-all"
                  >
                    ← Anterior
                  </button>
                  
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setPaginaActual(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        page === paginaActual
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-all"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};