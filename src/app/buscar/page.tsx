"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { NavbarSimple } from '@/components/navbar-simple';
import { ProductConfiguratorSimple } from '@/components/product-configurator-simple';
import { BuscadorGlobal } from '@/components/buscador-global';
import productosData from '@/data/productos-policarbonato.json';

interface SearchResult {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tipo: string;
  espesor: string;
  color: string;
  dimensiones: string;
  precio: number;
  url?: string;
  destacado?: boolean;
}

// Componente que maneja los search params
function BuscarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState<string>('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');
  const [ordenPor, setOrdenPor] = useState<string>('relevancia');

  // Efecto para obtener el query de la URL
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
    }
  }, [searchParams]);

  // Crear índice de búsqueda
  const searchIndex = useMemo(() => {
    const index: SearchResult[] = [];
    
    productosData.productos_policarbonato.forEach(categoria => {
      if (categoria.variantes) {
        categoria.variantes.forEach(producto => {
          index.push({
            id: producto.codigo,
            codigo: producto.codigo,
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            categoria: producto.categoria,
            tipo: producto.tipo || '',
            espesor: producto.espesor,
            color: producto.color,
            dimensiones: producto.dimensiones,
            precio: producto.precio_con_iva,
            url: `/productos/${producto.codigo}`
          });
        });
      }
    });
    
    return index;
  }, []);

  // Obtener categorías únicas
  const todasLasCategorias = searchIndex.map(p => p.categoria);
  const categoriasUnicas = Array.from(new Set(todasLasCategorias)).sort();
  const categorias = ['Todos', ...categoriasUnicas];

  // Función de búsqueda con scoring
  const performSearch = useMemo(() => {
    if (!query.trim()) {
      return [];
    }
    
    const terms = query.toLowerCase().split(' ').filter(Boolean);
    
    const scored = searchIndex.map(item => {
      let score = 0;
      const searchableText = `
        ${item.nombre} ${item.descripcion} ${item.categoria} 
        ${item.tipo} ${item.espesor} ${item.color} ${item.dimensiones} 
        ${item.codigo}
      `.toLowerCase();
      
      // Coincidencia exacta en código
      if (item.codigo.toLowerCase() === query.toLowerCase()) {
        score += 100;
      }
      
      // Coincidencias en el texto
      terms.forEach(term => {
        // Coincidencia en nombre (más peso)
        if (item.nombre.toLowerCase().includes(term)) {
          score += 50;
        }
        
        // Coincidencia en espesor (importante)
        if (item.espesor.toLowerCase().includes(term)) {
          score += 40;
        }
        
        // Coincidencia en color (importante)
        if (item.color.toLowerCase().includes(term)) {
          score += 40;
        }
        
        // Coincidencia en categoría
        if (item.categoria.toLowerCase().includes(term)) {
          score += 30;
        }
        
        // Coincidencia en dimensiones
        if (item.dimensiones.toLowerCase().includes(term)) {
          score += 30;
        }
        
        // Coincidencia en descripción
        if (item.descripcion.toLowerCase().includes(term)) {
          score += 20;
        }
        
        // Coincidencia general
        if (searchableText.includes(term)) {
          score += 10;
        }
      });
      
      return { item, score };
    });
    
    // Filtrar y ordenar por relevancia
    const filtered = scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
    
    return filtered;
  }, [query, searchIndex]);

  // Filtrar resultados
  const resultadosFiltrados = useMemo(() => {
    let resultados = performSearch;

    // Filtro por categoría
    if (filtroCategoria !== 'Todos') {
      resultados = resultados.filter(item => item.categoria === filtroCategoria);
    }

    // Ordenar
    if (ordenPor === 'precio-asc') {
      resultados = [...resultados].sort((a, b) => a.precio - b.precio);
    } else if (ordenPor === 'precio-desc') {
      resultados = [...resultados].sort((a, b) => b.precio - a.precio);
    } else if (ordenPor === 'nombre') {
      resultados = [...resultados].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    // 'relevancia' ya está ordenado por score

    return resultados;
  }, [performSearch, filtroCategoria, ordenPor]);

  // Manejar nueva búsqueda
  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    const url = new URL(window.location);
    url.searchParams.set('q', newQuery);
    router.push(url.pathname + url.search);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <NavbarSimple />
      
      <div className="pt-56 pb-20">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Resultados de búsqueda
            </h1>
            {query && (
              <p className="text-xl text-gray-600">
                Búsqueda para: <span className="font-semibold text-gray-800">"{query}"</span>
              </p>
            )}
          </div>

          {/* Buscador más ancho para la página de resultados */}
          <div className="mb-8 bg-white rounded-2xl shadow-sm p-6">
            <div className="max-w-6xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Buscar en todo el catálogo..."
                  autoFocus={!query}
                  className="w-full px-6 py-4 pl-12 pr-6 text-lg bg-white/95 backdrop-blur-sm border-2 border-gray-200 focus:border-yellow-400 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200 shadow-sm"
                />
                <svg 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
                {query && (
                  <button
                    onClick={() => handleSearch('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Categoría
                </label>
                <div className="relative">
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 appearance-none bg-white"
                  >
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <svg className="w-4 h-4 inline mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                  Ordenar por
                </label>
                <div className="relative">
                  <select
                    value={ordenPor}
                    onChange={(e) => setOrdenPor(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 appearance-none bg-white"
                  >
                    <option value="relevancia">🎯 Relevancia</option>
                    <option value="nombre">📝 Nombre A-Z</option>
                    <option value="precio-asc">💰 Precio: Menor a Mayor</option>
                    <option value="precio-desc">💎 Precio: Mayor a Menor</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Botón de limpiar filtros */}
            {(filtroCategoria !== 'Todos' || ordenPor !== 'relevancia') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setFiltroCategoria('Todos');
                    setOrdenPor('relevancia');
                  }}
                  className="flex items-center justify-center w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Resultados */}
          <div className="mb-6">
            <p className="text-gray-600">
              {query ? (
                <>
                  {resultadosFiltrados.length > 0 ? (
                    <>
                      Se encontraron {resultadosFiltrados.length} resultado{resultadosFiltrados.length !== 1 ? 's' : ''} para 
                      <span className="font-medium text-gray-800"> "{query}"</span>
                      {filtroCategoria !== 'Todos' && (
                        <> en <span className="font-medium text-gray-800">{filtroCategoria}</span></>
                      )}
                    </>
                  ) : (
                    <>
                      No se encontraron resultados para 
                      <span className="font-medium text-gray-800"> "{query}"</span>
                      {filtroCategoria !== 'Todos' && (
                        <> en <span className="font-medium text-gray-800">{filtroCategoria}</span></>
                      )}
                    </>
                  )}
                </>
              ) : (
                'Ingresa un término de búsqueda para comenzar'
              )}
            </p>
          </div>

          {/* Grid de Resultados */}
          {query && resultadosFiltrados.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8">
              {resultadosFiltrados.map((resultado) => {
                // Convertir resultado a formato compatible con ProductConfiguratorSimple
                const productGroup = {
                  id: resultado.codigo,
                  nombre: resultado.nombre,
                  descripcion: resultado.descripcion,
                  categoria: resultado.categoria,
                  variantes: [{
                    codigo: resultado.codigo,
                    nombre: resultado.nombre,
                    descripcion: resultado.descripcion,
                    categoria: resultado.categoria,
                    tipo: resultado.tipo,
                    espesor: resultado.espesor,
                    color: resultado.color,
                    dimensiones: resultado.dimensiones,
                    precio_con_iva: resultado.precio,
                    stock: 100 // Valor por defecto
                  }],
                  colores: [resultado.color],
                  imagen: `/assets/images/Productos/${resultado.categoria}/${resultado.codigo}.webp`,
                  precio_desde: resultado.precio,
                  stock_total: 100,
                  variantes_count: 1
                };

                return (
                  <ProductConfiguratorSimple 
                    key={resultado.id}
                    productGroup={productGroup}
                    className="h-full w-full max-w-sm mx-auto sm:max-w-none"
                  />
                );
              })}
            </div>
          )}

          {/* Sin resultados */}
          {query && resultadosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron resultados
              </h3>
              <p className="text-gray-600 mb-4">
                No se encontraron productos que coincidan con "{query}"
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Verifica la ortografía de las palabras</p>
                <p>• Intenta con términos más generales</p>
                <p>• Usa palabras clave como "6mm", "transparente", "alveolar"</p>
              </div>
            </div>
          )}

          {/* Sin query inicial */}
          {!query && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Buscar en el catálogo
              </h3>
              <p className="text-gray-600 mb-4">
                Usa la caja de búsqueda para encontrar productos específicos
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• Busca por espesor: "6mm", "10mm", "3mm"</p>
                <p>• Busca por color: "transparente", "bronce", "opal"</p>
                <p>• Busca por tipo: "alveolar", "compacto", "ondulado"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Componente principal con Suspense
export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando resultados de búsqueda...</p>
          </div>
        </div>
      </div>
    }>
      <BuscarContent />
    </Suspense>
  );
}