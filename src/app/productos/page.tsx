"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { NavbarSimple } from '@/components/navbar-simple';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProductImage } from '@/components/optimized-image';

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  subcategoria?: string;
  precio: number;
  imagen: string;
  especificaciones: {
    espesor?: string;
    colores?: string[];
    medidas?: string;
    uv?: boolean;
    garantia?: string;
  };
  stock: number;
  nuevo?: boolean;
  descuento?: number;
}

export default function ProductosPage() {
  const { addItem, state, removeItem, updateQuantity } = useCart();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');
  const [filtroSubcategoria, setFiltroSubcategoria] = useState<string>('Todos');
  const [ordenPor, setOrdenPor] = useState<string>('nombre');
  const [busqueda, setBusqueda] = useState<string>('');

  // Efecto para aplicar filtros desde URL
  useEffect(() => {
    const categoria = searchParams.get('categoria');
    const subcategoria = searchParams.get('subcategoria');
    
    if (categoria) {
      setFiltroCategoria(categoria);
    }
    if (subcategoria) {
      setFiltroSubcategoria(subcategoria);
    }
  }, [searchParams]);

  const productos: Product[] = [
    // Policarbonatos Ondulados
    {
      id: 'ondulado-cristal-6mm',
      nombre: 'Policarbonato Ondulado Cristal 6mm',
      descripcion: 'Lámina ondulada de policarbonato transparente ideal para techos y cubiertas.',
      categoria: 'Policarbonatos',
      subcategoria: 'Onduladas',
      precio: 15900,
      imagen: '/assets/images/Productos/policarbonato_ondulado_cristal_6mm.webp',
      especificaciones: {
        espesor: '6mm',
        colores: ['Cristal', 'Bronce', 'Verde', 'Azul'],
        medidas: '1.05m x 3.0m',
        uv: true,
        garantia: '10 años'
      },
      stock: 50
    },
    {
      id: 'ondulado-bronce-8mm',
      nombre: 'Policarbonato Ondulado Bronce 8mm',
      descripcion: 'Lámina ondulada con filtro UV y color bronce para mayor privacidad.',
      categoria: 'Policarbonatos',
      subcategoria: 'Onduladas',
      precio: 18500,
      imagen: '/assets/images/Productos/policarbonato_ondulado_bronce_8mm.webp',
      especificaciones: {
        espesor: '8mm',
        colores: ['Bronce', 'Cristal', 'Verde'],
        medidas: '1.05m x 3.0m',
        uv: true,
        garantia: '10 años'
      },
      stock: 35,
      nuevo: true
    },
    
    // Policarbonatos Alveolares
    {
      id: 'alveolar-4mm-cristal',
      nombre: 'Policarbonato Alveolar 4mm Cristal',
      descripcion: 'Estructura celular liviana con excelente aislamiento térmico.',
      categoria: 'Policarbonatos',
      subcategoria: 'Alveolar',
      precio: 12900,
      imagen: '/assets/images/Productos/policarbonato_alveolar_4mm_cristal.webp',
      especificaciones: {
        espesor: '4mm',
        colores: ['Cristal', 'Bronce', 'Azul', 'Verde'],
        medidas: '2.1m x 6.0m',
        uv: true,
        garantia: '10 años'
      },
      stock: 80
    },
    {
      id: 'alveolar-6mm-bronce',
      nombre: 'Policarbonato Alveolar 6mm Bronce',
      descripcion: 'Mayor resistencia estructural con filtro solar integrado.',
      categoria: 'Policarbonatos',
      subcategoria: 'Alveolar',
      precio: 16800,
      imagen: '/assets/images/Productos/policarbonato_alveolar_6mm_bronce.webp',
      especificaciones: {
        espesor: '6mm',
        colores: ['Bronce', 'Cristal', 'Verde'],
        medidas: '2.1m x 6.0m',
        uv: true,
        garantia: '10 años'
      },
      stock: 45
    },
    
    // Policarbonatos Compactos
    {
      id: 'compacto-3mm-cristal',
      nombre: 'Policarbonato Compacto 3mm Cristal',
      descripcion: 'Lámina sólida de alta resistencia al impacto y transparencia.',
      categoria: 'Policarbonatos',
      subcategoria: 'Compacto',
      precio: 22500,
      imagen: '/assets/images/Productos/policarbonato_compacto_3mm_cristal.webp',
      especificaciones: {
        espesor: '3mm',
        colores: ['Cristal', 'Bronce', 'Humo'],
        medidas: '1.22m x 2.44m',
        uv: true,
        garantia: '15 años'
      },
      stock: 25,
      descuento: 10
    },
    
    // Greca Industrial
    {
      id: 'greca-industrial-kr18',
      nombre: 'Greca Industrial KR18',
      descripcion: 'Perfil industrial resistente para aplicaciones de gran escala.',
      categoria: 'Policarbonatos',
      subcategoria: 'Greca Industrial',
      precio: 28900,
      imagen: '/assets/images/Productos/greca_industrial.webp',
      especificaciones: {
        espesor: '1.2mm',
        colores: ['Natural', 'Galvanizado'],
        medidas: '1.0m x 3.0m',
        uv: false,
        garantia: '5 años'
      },
      stock: 15
    },
    
    // Rollos
    {
      id: 'rollo-cristal-2mm',
      nombre: 'Rollo Policarbonato 2mm Cristal',
      descripcion: 'Rollo flexible ideal para proyectos curvos y diseños especiales.',
      categoria: 'Rollos',
      subcategoria: 'Plano',
      precio: 35900,
      imagen: '/assets/images/Productos/rollo_policarbonato_2mm_cristal.webp',
      especificaciones: {
        espesor: '2mm',
        colores: ['Cristal', 'Bronce'],
        medidas: '1.0m x 25m',
        uv: true,
        garantia: '8 años'
      },
      stock: 12
    },
    
    // Accesorios
    {
      id: 'perfil-h-10mm',
      nombre: 'Perfil H para Unión 10mm',
      descripcion: 'Perfil de unión para láminas alveolares de 10mm.',
      categoria: 'Accesorios',
      subcategoria: 'Perfiles',
      precio: 4500,
      imagen: '/assets/images/Productos/perfil_h_union_10mm.webp',
      especificaciones: {
        medidas: '6m de largo',
        colores: ['Transparente', 'Bronce']
      },
      stock: 100
    },
    {
      id: 'tornillos-autoperforantes',
      nombre: 'Tornillos Autoperforantes con Arandela',
      descripcion: 'Tornillos especiales para fijación de policarbonato.',
      categoria: 'Accesorios',
      subcategoria: 'Fijaciones',
      precio: 890,
      imagen: '/assets/images/Productos/tornillos_autoperforantes_arandela.webp',
      especificaciones: {
        medidas: 'Pack x 25 unidades'
      },
      stock: 200
    },
    
    // Pinturas y Selladores
    {
      id: 'barniz-madera-1lt',
      nombre: 'Barniz para Madera Exterior 1Lt',
      descripcion: 'Protección y acabado premium para maderas exteriores.',
      categoria: 'Pinturas/Selladores',
      subcategoria: 'Barnices',
      precio: 12900,
      imagen: '/assets/images/Productos/barniz_madera_exterior.webp',
      especificaciones: {
        colores: ['Natural', 'Nogal', 'Caoba'],
        medidas: '1 Litro'
      },
      stock: 60
    },
    {
      id: 'sellador-poliuretano',
      nombre: 'Sellador Poliuretano Transparente',
      descripcion: 'Sellador elástico de alta adherencia para juntas.',
      categoria: 'Pinturas/Selladores',
      subcategoria: 'Selladores',
      precio: 8900,
      imagen: '/assets/images/Productos/sellador_poliuretano_transparente.webp',
      especificaciones: {
        colores: ['Transparente', 'Blanco', 'Negro'],
        medidas: '290ml'
      },
      stock: 85
    }
  ];

  // Obtener categorías y subcategorías únicas
  const categorias = ['Todos', ...Array.from(new Set(productos.map(p => p.categoria)))];
  const subcategorias = useMemo(() => {
    if (filtroCategoria === 'Todos') {
      return ['Todos', ...Array.from(new Set(productos.map(p => p.subcategoria).filter(Boolean)))];
    }
    return ['Todos', ...Array.from(new Set(productos.filter(p => p.categoria === filtroCategoria).map(p => p.subcategoria).filter(Boolean)))];
  }, [filtroCategoria]);

  // Filtrar y ordenar productos
  const productosFiltrados = useMemo(() => {
    let resultado = productos;

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por categoría
    if (filtroCategoria !== 'Todos') {
      resultado = resultado.filter(p => p.categoria === filtroCategoria);
    }

    // Filtro por subcategoría
    if (filtroSubcategoria !== 'Todos') {
      resultado = resultado.filter(p => p.subcategoria === filtroSubcategoria);
    }

    // Ordenar
    resultado.sort((a, b) => {
      switch (ordenPor) {
        case 'precio-asc':
          return a.precio - b.precio;
        case 'precio-desc':
          return b.precio - a.precio;
        case 'nombre':
        default:
          return a.nombre.localeCompare(b.nombre);
      }
    });

    return resultado;
  }, [busqueda, filtroCategoria, filtroSubcategoria, ordenPor]);

  const agregarAlCarrito = (producto: Product, cantidad: number = 10) => {
    const item = {
      id: producto.id,
      tipo: 'producto' as const,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      cantidad: cantidad,
      precioUnitario: producto.precio,
      total: producto.precio * cantidad,
      imagen: producto.imagen,
      especificaciones: Object.entries(producto.especificaciones).map(([key, value]) => 
        `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
      )
    };
    
    addItem(item);
  };

  // Función para verificar si un producto está en el carrito
  const isInCart = (productId: string) => {
    return state.items.some(item => item.id === productId);
  };

  // Función para obtener la cantidad de un producto en el carrito
  const getCartQuantity = (productId: string) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.cantidad : 0;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <NavbarSimple />
      
      <div className="pt-56 pb-20">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Catálogo de Productos
            </h1>
            <p className="text-xl text-gray-600">
              Descubre nuestra amplia gama de productos de policarbonato y accesorios
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar productos
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              {/* Filtro Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={filtroCategoria}
                  onChange={(e) => {
                    setFiltroCategoria(e.target.value);
                    setFiltroSubcategoria('Todos');
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Subcategoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategoría
                </label>
                <select
                  value={filtroSubcategoria}
                  onChange={(e) => setFiltroSubcategoria(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  {subcategorias.map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={ordenPor}
                  onChange={(e) => setOrdenPor(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                >
                  <option value="nombre">Nombre A-Z</option>
                  <option value="precio-asc">Precio: Menor a Mayor</option>
                  <option value="precio-desc">Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="mb-6">
            <p className="text-gray-600">
              Mostrando {productosFiltrados.length} productos
              {busqueda && ` para "${busqueda}"`}
              {filtroCategoria !== 'Todos' && ` en ${filtroCategoria}`}
            </p>
          </div>

          {/* Grid de Productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productosFiltrados.map((producto) => (
              <div key={producto.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow p-6 group flex flex-col h-full">
                {/* Badges */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col space-y-2 h-12">
                    {producto.nuevo && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full w-fit">
                        Nuevo
                      </span>
                    )}
                    {producto.descuento && (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full w-fit">
                        -{producto.descuento}% OFF
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-700">{producto.categoria}</div>
                    {producto.subcategoria && (
                      <div className="text-sm text-gray-600 font-medium">{producto.subcategoria}</div>
                    )}
                  </div>
                </div>

                {/* Imagen */}
                <div className="bg-gray-100 rounded-xl h-48 mb-4 overflow-hidden">
                  <ProductImage
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Información - flex-grow para ocupar espacio disponible */}
                <div className="flex flex-col flex-grow">
                  {/* Nombre del producto - destacado y altura fija */}
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors mb-3 h-16 line-clamp-2 leading-tight">
                    {producto.nombre}
                  </h3>
                  
                  {/* Descripción - altura fija */}
                  <p className="text-base text-gray-700 mb-4 h-12 line-clamp-2 leading-relaxed font-medium">
                    {producto.descripcion}
                  </p>

                  {/* Especificaciones clave - altura fija */}
                  <div className="text-sm text-gray-600 space-y-1 mb-4 h-16 font-medium">
                    {producto.especificaciones.espesor && (
                      <div>Espesor: <span className="text-gray-800 font-semibold">{producto.especificaciones.espesor}</span></div>
                    )}
                    {producto.especificaciones.medidas && (
                      <div>Medidas: <span className="text-gray-800 font-semibold">{producto.especificaciones.medidas}</span></div>
                    )}
                    {producto.especificaciones.uv && (
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-green-700 font-semibold">Protección UV</span>
                      </div>
                    )}
                  </div>

                  {/* Stock - altura fija */}
                  <div className="flex items-center space-x-2 mb-4 h-4">
                    <div className={`w-2 h-2 rounded-full ${producto.stock > 10 ? 'bg-green-500' : producto.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-600">
                      {producto.stock > 10 ? 'En stock' : producto.stock > 0 ? `Solo ${producto.stock} disponibles` : 'Sin stock'}
                    </span>
                  </div>

                  {/* Sección de precios - flex-grow para empujar botón al final */}
                  <div className="flex-grow">
                    {/* Precio */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-baseline space-x-2">
                        {producto.descuento ? (
                          <>
                            <span className="text-lg font-bold text-yellow-600">
                              ${Math.round(producto.precio * (1 - producto.descuento / 100)).toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ${producto.precio.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            ${producto.precio.toLocaleString()}
                          </span>
                        )}
                      </div>
                      
                      {user?.tieneDescuento && (
                        <div className="text-xs text-green-600">
                          Tu precio: ${Math.round(producto.precio * (1 - (producto.descuento || 0) / 100) * (1 - user.porcentajeDescuento / 100)).toLocaleString()}
                          <span className="ml-1">(-{user.porcentajeDescuento}%)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón Agregar - siempre al final */}
                  {isInCart(producto.id) ? (
                    <div className="space-y-3 mt-auto">
                      <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 py-2 px-4 rounded-xl">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="font-medium">En el carrito ({getCartQuantity(producto.id)} uds)</span>
                      </div>
                      
                      {/* Controles de cantidad */}
                      <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Cantidad:</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                const newQuantity = Math.max(10, getCartQuantity(producto.id) - 10);
                                if (newQuantity < 10) {
                                  removeItem(producto.id);
                                } else {
                                  updateQuantity(producto.id, newQuantity);
                                }
                              }}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-12 text-center font-medium text-sm">{getCartQuantity(producto.id)}</span>
                            <button
                              onClick={() => updateQuantity(producto.id, getCartQuantity(producto.id) + 10)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">Mínimo 10 unidades (cambios de 10 en 10)</div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => removeItem(producto.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded-xl transition-all text-sm"
                        >
                          Quitar
                        </button>
                        <button
                          onClick={() => agregarAlCarrito(producto, 10)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-3 rounded-xl transition-all text-sm"
                        >
                          +10 más
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 mt-auto">
                      <div className="text-xs text-gray-500 text-center bg-yellow-50 py-2 px-3 rounded-lg">
                        📦 Venta mínima: 10 unidades
                      </div>
                      <button
                        onClick={() => agregarAlCarrito(producto, 10)}
                        disabled={producto.stock === 0}
                        className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {producto.stock === 0 ? 'Sin Stock' : 'Agregar 10 al Carrito'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sin resultados */}
          {productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-gray-600">
                Intenta ajustar los filtros o términos de búsqueda
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}