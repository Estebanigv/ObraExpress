"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { navigate } from '@/lib/client-utils';
import productosData from '@/data/productos-policarbonato.json';
import { formatCurrency } from '@/utils/format-currency';

interface CotizadorDetalladoProps {
  bgColor?: string;
  textColor?: string;
}

interface ProductVariant {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tipo: string;
  precio_neto: number;
  precio_con_iva: number;
  espesor: string;
  dimensiones: string;
  color: string;
  uso: string;
  stock: number;
  uv_protection: boolean;
  garantia: string;
}

interface FilterOptions {
  categoria: string;
  espesor: string;
  color: string;
  dimensiones: string;
  busqueda: string;
}

interface DeliveryDate {
  fecha: Date;
  tipo: 'normal' | 'express' | 'programado';
  costo_adicional: number;
}

const DELIVERY_OPTIONS = [
  { id: 'normal', nombre: 'Despacho Normal (5-7 días)', dias: 7, costo: 0 },
  { id: 'express', nombre: 'Despacho Express (2-3 días)', dias: 3, costo: 15000 },
  { id: 'programado', nombre: 'Despacho Programado', dias: 0, costo: 8000 }
];

const COMUNAS_SANTIAGO = [
  'Santiago Centro', 'Providencia', 'Las Condes', 'Vitacura', 'La Reina',
  'Ñuñoa', 'Macul', 'San Miguel', 'La Florida', 'Puente Alto',
  'Maipú', 'Pudahuel', 'Quilicura', 'Renca', 'Independencia',
  'Recoleta', 'Huechuraba', 'Conchalí', 'La Granja', 'San Bernardo'
];

export const CotizadorDetallado: React.FC<CotizadorDetalladoProps> = ({ 
  bgColor = "bg-white", 
  textColor = "text-gray-900" 
}) => {
  // Estados principales
  const [productos, setProductos] = useState<ProductVariant[]>([]);
  const [filtros, setFiltros] = useState<FilterOptions>({
    categoria: '',
    espesor: '',
    color: '',
    dimensiones: '',
    busqueda: ''
  });
  
  const [productosSeleccionados, setProductosSeleccionados] = useState<{
    producto: ProductVariant;
    cantidad: number;
    area_total?: number;
  }[]>([]);
  
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    empresa: '',
    rut: '',
    telefono: '',
    email: '',
    direccion: '',
    comuna: '',
    region: 'Región Metropolitana',
    notas: ''
  });
  
  const [despacho, setDespacho] = useState({
    tipo: 'normal',
    fecha_estimada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    fecha_programada: '',
    instalacion: false,
    costo_instalacion: 0
  });
  
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [paso, setPaso] = useState(1); // 1: Productos, 2: Datos, 3: Despacho, 4: Resumen
  
  // Cargar productos al montar
  useEffect(() => {
    const todosLosProductos: ProductVariant[] = [];
    productosData.productos_policarbonato.forEach(categoria => {
      if (categoria.variantes) {
        todosLosProductos.push(...categoria.variantes);
      }
    });
    setProductos(todosLosProductos);
  }, []);
  
  // Obtener opciones únicas para filtros
  const opcionesFiltros = useMemo(() => {
    const categorias = new Set<string>();
    const espesores = new Set<string>();
    const colores = new Set<string>();
    const dimensiones = new Set<string>();
    
    productos.forEach(p => {
      categorias.add(p.categoria);
      espesores.add(p.espesor);
      colores.add(p.color);
      dimensiones.add(p.dimensiones);
    });
    
    return {
      categorias: Array.from(categorias).sort(),
      espesores: Array.from(espesores).sort((a, b) => {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        return numA - numB;
      }),
      colores: Array.from(colores).sort(),
      dimensiones: Array.from(dimensiones).sort()
    };
  }, [productos]);
  
  // Filtrar productos
  const productosFiltrados = useMemo(() => {
    return productos.filter(producto => {
      if (filtros.categoria && producto.categoria !== filtros.categoria) return false;
      if (filtros.espesor && producto.espesor !== filtros.espesor) return false;
      if (filtros.color && producto.color !== filtros.color) return false;
      if (filtros.dimensiones && producto.dimensiones !== filtros.dimensiones) return false;
      if (filtros.busqueda) {
        const busqueda = filtros.busqueda.toLowerCase();
        return producto.nombre.toLowerCase().includes(busqueda) ||
               producto.descripcion.toLowerCase().includes(busqueda) ||
               producto.codigo.toLowerCase().includes(busqueda);
      }
      return true;
    });
  }, [productos, filtros]);
  
  // Calcular totales
  const totales = useMemo(() => {
    const subtotal = productosSeleccionados.reduce((acc, item) => {
      return acc + (item.producto.precio_con_iva * item.cantidad);
    }, 0);
    
    let costoDespacho = 0;
    const opcionDespacho = DELIVERY_OPTIONS.find(opt => opt.id === despacho.tipo);
    if (opcionDespacho) {
      costoDespacho = opcionDespacho.costo;
    }
    
    const costoInstalacion = despacho.instalacion ? subtotal * 0.25 : 0;
    
    return {
      subtotal,
      costoDespacho,
      costoInstalacion,
      total: subtotal + costoDespacho + costoInstalacion
    };
  }, [productosSeleccionados, despacho]);
  
  // Agregar producto al carrito
  const agregarProducto = (producto: ProductVariant, cantidad: number = 1) => {
    const existente = productosSeleccionados.find(p => p.producto.codigo === producto.codigo);
    
    if (existente) {
      setProductosSeleccionados(prev => 
        prev.map(item => 
          item.producto.codigo === producto.codigo 
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      );
    } else {
      // Calcular área si es posible
      const dimensiones = producto.dimensiones.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)/);
      let area_total = undefined;
      if (dimensiones) {
        const ancho = parseFloat(dimensiones[1]);
        const largo = parseFloat(dimensiones[2]);
        area_total = ancho * largo * cantidad;
      }
      
      setProductosSeleccionados(prev => [...prev, { 
        producto, 
        cantidad,
        area_total 
      }]);
    }
  };
  
  // Actualizar cantidad de producto
  const actualizarCantidad = (codigo: string, cantidad: number) => {
    if (cantidad <= 0) {
      setProductosSeleccionados(prev => prev.filter(item => item.producto.codigo !== codigo));
    } else {
      setProductosSeleccionados(prev => 
        prev.map(item => {
          if (item.producto.codigo === codigo) {
            const dimensiones = item.producto.dimensiones.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)/);
            let area_total = undefined;
            if (dimensiones) {
              const ancho = parseFloat(dimensiones[1]);
              const largo = parseFloat(dimensiones[2]);
              area_total = ancho * largo * cantidad;
            }
            return { ...item, cantidad, area_total };
          }
          return item;
        })
      );
    }
  };
  
  // Calcular fecha de entrega
  const calcularFechaEntrega = (tipo: string) => {
    const hoy = new Date();
    const opcion = DELIVERY_OPTIONS.find(opt => opt.id === tipo);
    if (opcion && opcion.dias > 0) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + opcion.dias);
      return fecha;
    }
    return hoy;
  };
  
  // Generar calendario para despacho programado
  const generarDiasCalendario = () => {
    const dias = [];
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    for (let d = new Date(inicioMes); d <= finMes; d.setDate(d.getDate() + 1)) {
      if (d >= hoy) {
        dias.push(new Date(d));
      }
    }
    
    return dias;
  };
  
  // Enviar cotización
  const enviarCotizacion = () => {
    const resumenProductos = productosSeleccionados.map(item => 
      `• ${item.producto.nombre}
        - Código: ${item.producto.codigo}
        - Espesor: ${item.producto.espesor}
        - Color: ${item.producto.color}
        - Dimensiones: ${item.producto.dimensiones}
        - Cantidad: ${item.cantidad} unidad(es)
        - Área total: ${item.area_total ? item.area_total.toFixed(2) + ' m²' : 'N/A'}
        - Precio unitario: $${formatCurrency(item.producto.precio_con_iva)}
        - Subtotal: $${formatCurrency(item.producto.precio_con_iva * item.cantidad)}`
    ).join('\n\n');
    
    const fechaEntrega = despacho.tipo === 'programado' && despacho.fecha_programada
      ? new Date(despacho.fecha_programada).toLocaleDateString('es-CL')
      : calcularFechaEntrega(despacho.tipo).toLocaleDateString('es-CL');
    
    const mensaje = `🏗️ *COTIZACIÓN DETALLADA - ObraExpress*

📋 *PRODUCTOS SELECCIONADOS:*
${resumenProductos}

💰 *RESUMEN DE COSTOS:*
• Subtotal productos: $${formatCurrency(totales.subtotal)}
• Costo despacho: $${formatCurrency(totales.costoDespacho)}
${despacho.instalacion ? `• Instalación (25%): $${formatCurrency(totales.costoInstalacion)}` : ''}
• *TOTAL: $${formatCurrency(totales.total)} CLP*

📦 *DESPACHO:*
• Tipo: ${DELIVERY_OPTIONS.find(opt => opt.id === despacho.tipo)?.nombre}
• Fecha estimada: ${fechaEntrega}
• Instalación: ${despacho.instalacion ? 'Sí incluye' : 'No incluye'}

👤 *DATOS DEL CLIENTE:*
• Nombre: ${datosCliente.nombre}
${datosCliente.empresa ? `• Empresa: ${datosCliente.empresa}` : ''}
${datosCliente.rut ? `• RUT: ${datosCliente.rut}` : ''}
• Teléfono: ${datosCliente.telefono}
• Email: ${datosCliente.email}
• Dirección: ${datosCliente.direccion}
• Comuna: ${datosCliente.comuna}
• Región: ${datosCliente.region}
${datosCliente.notas ? `• Notas: ${datosCliente.notas}` : ''}

🌐 Cotización generada desde: obraexpress.cl
📅 Fecha: ${new Date().toLocaleDateString('es-CL')}`;

    const whatsappUrl = `https://wa.me/56933334444?text=${encodeURIComponent(mensaje)}`;
    navigate.openInNewTab(whatsappUrl);
  };
  
  return (
    <div className={`${bgColor} ${textColor} min-h-screen`}>
      {/* Header fijo */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Navegación principal */}
            <button
              onClick={() => navigate.push('/')}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al Sitio Principal
            </button>
            
            {/* Título y progreso */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Cotizador ObraExpress</h1>
              <div className="text-sm text-gray-600">Paso {paso} de 4</div>
            </div>
            
            {/* Carrito resumen */}
            {productosSeleccionados.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <div className="text-sm text-green-700 font-medium">
                  {productosSeleccionados.length} producto{productosSeleccionados.length > 1 ? 's' : ''} seleccionado{productosSeleccionados.length > 1 ? 's' : ''}
                </div>
                <div className="text-xs text-green-600">
                  Total: ${formatCurrency(totales.subtotal)}
                </div>
              </div>
            )}
          </div>
          
          {/* Indicador de progreso simplificado */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-3">
              {[
                { num: 1, label: 'Productos', icon: '📦' },
                { num: 2, label: 'Datos', icon: '👤' },
                { num: 3, label: 'Despacho', icon: '🚚' },
                { num: 4, label: 'Resumen', icon: '✅' }
              ].map((step) => (
                <div key={step.num} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2
                    ${paso >= step.num 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-gray-100 text-gray-400 border-gray-300'
                    }
                    transition-all duration-300
                  `}>
                    {paso > step.num ? '✓' : step.icon}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    paso >= step.num ? 'text-blue-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  {step.num < 4 && (
                    <svg className="w-6 h-6 mx-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Paso 1: Selección de Productos */}
      {paso === 1 && (
        <div className="space-y-6">
          {/* Barra de búsqueda y filtros */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Buscar y Filtrar Productos</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre, código..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Todas las categorías</option>
                {opcionesFiltros.categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={filtros.espesor}
                onChange={(e) => setFiltros(prev => ({ ...prev, espesor: e.target.value }))}
                className="p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option value="">Todos los espesores</option>
                {opcionesFiltros.espesores.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
            </div>
            
            {(filtros.busqueda || filtros.categoria || filtros.espesor) && (
              <button
                onClick={() => setFiltros({ categoria: '', espesor: '', color: '', dimensiones: '', busqueda: '' })}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ✖ Limpiar filtros
              </button>
            )}
          </div>
          
          {/* Filtros avanzados */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h3 className="text-lg font-bold mb-4 text-amber-400">Filtros Rápidos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <select
                value={filtros.categoria}
                onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                className="p-3 bg-white/90 text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Todas las categorías</option>
                {opcionesFiltros.categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <select
                value={filtros.espesor}
                onChange={(e) => setFiltros(prev => ({ ...prev, espesor: e.target.value }))}
                className="p-3 bg-white/90 text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Todos los espesores</option>
                {opcionesFiltros.espesores.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
              
              <select
                value={filtros.color}
                onChange={(e) => setFiltros(prev => ({ ...prev, color: e.target.value }))}
                className="p-3 bg-white/90 text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Todos los colores</option>
                {opcionesFiltros.colores.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
              
              <select
                value={filtros.dimensiones}
                onChange={(e) => setFiltros(prev => ({ ...prev, dimensiones: e.target.value }))}
                className="p-3 bg-white/90 text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Todas las dimensiones</option>
                {opcionesFiltros.dimensiones.map(dim => (
                  <option key={dim} value={dim}>{dim}</option>
                ))}
              </select>
            </div>
            
            {(filtros.categoria || filtros.espesor || filtros.color || filtros.dimensiones || filtros.busqueda) && (
              <button
                onClick={() => setFiltros({ categoria: '', espesor: '', color: '', dimensiones: '', busqueda: '' })}
                className="mt-4 text-amber-400 hover:text-yellow-300 text-sm"
              >
                ✖ Limpiar filtros
              </button>
            )}
          </div>
          
          {/* Productos seleccionados (carrito) */}
          {productosSeleccionados.length > 0 && (
            <div className="bg-green-500/20 border-2 border-green-400 rounded-xl p-4">
              <h3 className="text-lg font-bold mb-3 text-green-400">
                🛒 Productos Seleccionados ({productosSeleccionados.length})
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {productosSeleccionados.map(item => (
                  <div key={item.producto.codigo} className="flex justify-between items-center bg-white/10 rounded-lg p-2">
                    <div className="flex-1">
                      <span className="text-sm font-medium">{item.producto.nombre}</span>
                      <span className="text-xs opacity-75 ml-2">({item.producto.espesor}, {item.producto.color})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => actualizarCantidad(item.producto.codigo, item.cantidad - 1)}
                        className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 rounded-full"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-bold">{item.cantidad}</span>
                      <button
                        onClick={() => actualizarCantidad(item.producto.codigo, item.cantidad + 1)}
                        className="w-8 h-8 bg-green-500/20 hover:bg-green-500/30 rounded-full"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-green-400/30">
                <div className="flex justify-between items-center">
                  <span className="font-bold">Subtotal:</span>
                  <span className="text-xl font-bold text-amber-400">
                    ${formatCurrency(totales.subtotal)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Lista de productos */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-amber-400">
                📦 Catálogo de Productos
              </h3>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {productosFiltrados.length} productos encontrados
                </div>
                <div className="text-xs opacity-75">
                  de {productos.length} disponibles
                </div>
              </div>
            </div>
            
            <div className="bg-amber-100/20 backdrop-blur-sm rounded-xl p-4 border border-amber-300/30">
              <div className="flex items-center gap-2 text-amber-200 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold">¿Cómo funciona?</span>
              </div>
              <p className="text-sm opacity-90">
                Selecciona los productos que necesitas y especifica la cantidad. Cada producto incluye precio por m² y stock disponible.
              </p>
            </div>
            
            <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
              {productosFiltrados.map(producto => {
                const seleccionado = productosSeleccionados.find(p => p.producto.codigo === producto.codigo);
                
                return (
                  <div 
                    key={producto.codigo} 
                    className={`
                      bg-white/15 backdrop-blur-sm rounded-xl p-6 border
                      hover:bg-white/25 hover:scale-[1.02] transition-all cursor-pointer
                      ${seleccionado ? 'ring-2 ring-amber-400 border-amber-400/50' : 'border-white/20'}
                    `}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Información del producto */}
                      <div className="lg:col-span-2 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-amber-300 text-lg">{producto.nombre}</h4>
                            <p className="text-sm opacity-80 mt-1">{producto.descripcion}</p>
                            <div className="text-xs opacity-60 mt-1">Código: {producto.codigo}</div>
                          </div>
                          {seleccionado && (
                            <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs font-bold border border-green-400/30">
                              ✓ En carrito ({seleccionado.cantidad})
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium border border-emerald-400/30">
                            📏 {producto.espesor}
                          </span>
                          <span className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-medium border border-cyan-400/30">
                            🎨 {producto.color}
                          </span>
                          <span className="px-3 py-1.5 bg-purple-500/20 text-purple-300 rounded-full text-xs font-medium border border-purple-400/30">
                            📐 {producto.dimensiones}
                          </span>
                          <span className="px-3 py-1.5 bg-orange-500/20 text-orange-300 rounded-full text-xs font-medium border border-orange-400/30">
                            📦 Stock: {producto.stock}
                          </span>
                          {producto.uv_protection && (
                            <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-400/30">
                              ☀️ UV Protection
                            </span>
                          )}
                        </div>
                        
                        <div className="text-xs opacity-70 mt-2">
                          Garantía: {producto.garantia}
                        </div>
                      </div>
                      
                      {/* Precio y acciones */}
                      <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold text-amber-300">
                            ${formatCurrency(producto.precio_con_iva)}
                          </div>
                          <div className="text-xs opacity-75">IVA incluido</div>
                          {producto.precio_con_iva <= 100000 && (
                            <div className="text-xs text-yellow-400 mt-1">Mínimo 10 unidades</div>
                          )}
                        </div>
                        
                        {seleccionado ? (
                          <div className="space-y-3">
                            <div className="bg-green-500/20 text-green-300 px-3 py-2 rounded-lg text-center border border-green-400/30">
                              <div className="font-bold">✓ En tu cotización</div>
                              <div className="text-sm">Cantidad: {seleccionado.cantidad}</div>
                            </div>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => actualizarCantidad(producto.codigo, seleccionado.cantidad - 1)}
                                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                              >
                                - Quitar
                              </button>
                              <button
                                onClick={() => actualizarCantidad(producto.codigo, seleccionado.cantidad + 1)}
                                className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-400/30 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                              >
                                + Agregar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => agregarProducto(producto)}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
                          >
                            + Agregar al Carrito
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Botón siguiente */}
          <div className="flex justify-between items-center pt-6">
            <div className="text-sm opacity-75">
              Selecciona los productos que necesitas
            </div>
            <button
              onClick={() => setPaso(2)}
              disabled={productosSeleccionados.length === 0}
              className={`
                px-8 py-3 rounded-xl font-bold transition-all
                ${productosSeleccionados.length > 0
                  ? 'bg-amber-400 text-black hover:bg-amber-500'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
      
      {/* Paso 2: Datos del Cliente */}
      {paso === 2 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-4">👤 Datos del Cliente</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nombre Completo *</label>
              <input
                type="text"
                value={datosCliente.nombre}
                onChange={(e) => setDatosCliente(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full p-3 bg-white/90 text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Empresa (opcional)</label>
              <input
                type="text"
                value={datosCliente.empresa}
                onChange={(e) => setDatosCliente(prev => ({ ...prev, empresa: e.target.value }))}
                className="w-full p-3 bg-white/90 text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">RUT (opcional)</label>
              <input
                type="text"
                value={datosCliente.rut}
                onChange={(e) => setDatosCliente(prev => ({ ...prev, rut: e.target.value }))}
                placeholder="12.345.678-9"
                className="w-full p-3 bg-white/90 text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Teléfono *</label>
              <input
                type="tel"
                value={datosCliente.telefono}
                onChange={(e) => setDatosCliente(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="+56 9 xxxx xxxx"
                className="w-full p-3 bg-white/90 text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Email *</label>
              <input
                type="email"
                value={datosCliente.email}
                onChange={(e) => setDatosCliente(prev => ({ ...prev, email: e.target.value }))}
                placeholder="correo@ejemplo.com"
                className="w-full p-3 bg-white/90 text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold mb-2">Comuna *</label>
              <select
                value={datosCliente.comuna}
                onChange={(e) => setDatosCliente(prev => ({ ...prev, comuna: e.target.value }))}
                className="w-full p-3 bg-white/90 text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-400"
                required
              >
                <option value="">Seleccionar comuna...</option>
                {COMUNAS_SANTIAGO.map(comuna => (
                  <option key={comuna} value={comuna}>{comuna}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Dirección de Despacho *</label>
              <input
                type="text"
                value={datosCliente.direccion}
                onChange={(e) => setDatosCliente(prev => ({ ...prev, direccion: e.target.value }))}
                placeholder="Calle, número, depto/oficina"
                className="w-full p-3 bg-white/90 text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-400"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-2">Notas adicionales (opcional)</label>
              <textarea
                value={datosCliente.notas}
                onChange={(e) => setDatosCliente(prev => ({ ...prev, notas: e.target.value }))}
                placeholder="Indicaciones especiales, referencias, etc."
                rows={3}
                className="w-full p-3 bg-white/90 text-gray-800 rounded-lg focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
          
          {/* Botones navegación */}
          <div className="flex justify-between items-center pt-6">
            <button
              onClick={() => setPaso(1)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-bold transition-all"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPaso(3)}
              disabled={!datosCliente.nombre || !datosCliente.telefono || !datosCliente.email || !datosCliente.direccion || !datosCliente.comuna}
              className={`
                px-8 py-3 rounded-xl font-bold transition-all
                ${datosCliente.nombre && datosCliente.telefono && datosCliente.email && datosCliente.direccion && datosCliente.comuna
                  ? 'bg-amber-400 text-black hover:bg-amber-500'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}
      
      {/* Paso 3: Opciones de Despacho */}
      {paso === 3 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-4">📦 Opciones de Despacho y Entrega</h3>
          
          {/* Tipo de despacho */}
          <div className="space-y-4">
            <label className="block text-lg font-semibold mb-3">Selecciona el tipo de despacho:</label>
            <div className="grid gap-4">
              {DELIVERY_OPTIONS.map(opcion => (
                <div
                  key={opcion.id}
                  onClick={() => {
                    setDespacho(prev => ({ 
                      ...prev, 
                      tipo: opcion.id,
                      fecha_estimada: calcularFechaEntrega(opcion.id)
                    }));
                    if (opcion.id === 'programado') {
                      setMostrarCalendario(true);
                    }
                  }}
                  className={`
                    p-4 rounded-xl cursor-pointer transition-all
                    ${despacho.tipo === opcion.id 
                      ? 'bg-amber-400/20 ring-2 ring-amber-400' 
                      : 'bg-white/10 hover:bg-white/20'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-lg">{opcion.nombre}</h4>
                      <p className="text-sm opacity-75 mt-1">
                        {opcion.id === 'normal' && 'Entrega estándar en días hábiles'}
                        {opcion.id === 'express' && '⚡ Entrega prioritaria rápida'}
                        {opcion.id === 'programado' && '📅 Elige la fecha que prefieras'}
                      </p>
                      {opcion.id !== 'programado' && (
                        <p className="text-sm mt-2 text-amber-400">
                          Fecha estimada: {calcularFechaEntrega(opcion.id).toLocaleDateString('es-CL', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      {opcion.costo > 0 ? (
                        <div className="text-xl font-bold text-amber-400">
                          +${formatCurrency(opcion.costo)}
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-green-400">
                          GRATIS
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Calendario para despacho programado */}
          {despacho.tipo === 'programado' && mostrarCalendario && (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <h4 className="font-bold mb-3">📅 Selecciona la fecha de entrega:</h4>
              <div className="grid grid-cols-7 gap-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
                  <div key={dia} className="text-center text-sm font-bold py-2">
                    {dia}
                  </div>
                ))}
                {generarDiasCalendario().map(dia => {
                  const seleccionado = despacho.fecha_programada && 
                    new Date(despacho.fecha_programada).toDateString() === dia.toDateString();
                  const esHoy = new Date().toDateString() === dia.toDateString();
                  
                  return (
                    <button
                      key={dia.toISOString()}
                      onClick={() => {
                        setDespacho(prev => ({ 
                          ...prev, 
                          fecha_programada: dia.toISOString().split('T')[0]
                        }));
                        setMostrarCalendario(false);
                      }}
                      className={`
                        p-2 rounded-lg text-center transition-all
                        ${seleccionado 
                          ? 'bg-amber-400 text-black font-bold' 
                          : esHoy
                          ? 'bg-blue-500/30 hover:bg-blue-500/50'
                          : 'bg-white/10 hover:bg-white/20'
                        }
                      `}
                    >
                      {dia.getDate()}
                    </button>
                  );
                })}
              </div>
              {despacho.fecha_programada && (
                <div className="mt-4 p-3 bg-amber-400/20 rounded-lg">
                  <span className="text-sm">Fecha seleccionada: </span>
                  <span className="font-bold">
                    {new Date(despacho.fecha_programada).toLocaleDateString('es-CL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Opción de instalación */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <h4 className="font-bold text-lg">🔧 Servicio de Instalación Profesional</h4>
                <p className="text-sm opacity-75 mt-1">
                  Nuestro equipo especializado instalará los productos
                </p>
                <p className="text-sm text-amber-400 mt-2">
                  Costo: 25% del valor de los productos
                </p>
              </div>
              <input
                type="checkbox"
                checked={despacho.instalacion}
                onChange={(e) => setDespacho(prev => ({ ...prev, instalacion: e.target.checked }))}
                className="w-6 h-6 text-amber-400 rounded focus:ring-2 focus:ring-amber-400"
              />
            </label>
          </div>
          
          {/* Resumen de costos actualizado */}
          <div className="bg-blue-900/50 rounded-xl p-4">
            <h4 className="font-bold mb-3">💰 Resumen de Costos</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal productos:</span>
                <span className="font-bold">${formatCurrency(totales.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de despacho:</span>
                <span className="font-bold">
                  {totales.costoDespacho > 0 
                    ? `$${formatCurrency(totales.costoDespacho)}`
                    : 'GRATIS'
                  }
                </span>
              </div>
              {despacho.instalacion && (
                <div className="flex justify-between">
                  <span>Instalación (25%):</span>
                  <span className="font-bold">${formatCurrency(totales.costoInstalacion)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/20 flex justify-between">
                <span className="text-lg font-bold">TOTAL:</span>
                <span className="text-2xl font-bold text-amber-400">
                  ${formatCurrency(totales.total)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Botones navegación */}
          <div className="flex justify-between items-center pt-6">
            <button
              onClick={() => setPaso(2)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-bold transition-all"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPaso(4)}
              disabled={despacho.tipo === 'programado' && !despacho.fecha_programada}
              className={`
                px-8 py-3 rounded-xl font-bold transition-all
                ${(despacho.tipo !== 'programado' || despacho.fecha_programada)
                  ? 'bg-amber-400 text-black hover:bg-amber-500'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Ver Resumen →
            </button>
          </div>
        </div>
      )}
      
      {/* Paso 4: Resumen Final */}
      {paso === 4 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold mb-4">📋 Resumen de tu Cotización</h3>
          
          {/* Productos */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h4 className="font-bold text-lg mb-3 text-amber-400">Productos Seleccionados</h4>
            <div className="space-y-3">
              {productosSeleccionados.map(item => (
                <div key={item.producto.codigo} className="border-b border-white/20 pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-bold">{item.producto.nombre}</h5>
                      <div className="text-sm opacity-75 mt-1">
                        Código: {item.producto.codigo} | {item.producto.espesor} | {item.producto.color}
                      </div>
                      <div className="text-sm mt-1">
                        Dimensiones: {item.producto.dimensiones} | Cantidad: {item.cantidad}
                      </div>
                      {item.area_total && (
                        <div className="text-sm text-amber-400 mt-1">
                          Área total: {item.area_total.toFixed(2)} m²
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        ${formatCurrency(item.producto.precio_con_iva * item.cantidad)}
                      </div>
                      <div className="text-xs opacity-75">
                        ${formatCurrency(item.producto.precio_con_iva)} c/u
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Datos del cliente */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h4 className="font-bold text-lg mb-3 text-amber-400">Datos de Contacto</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="opacity-75">Nombre:</span>
                <span className="ml-2 font-medium">{datosCliente.nombre}</span>
              </div>
              {datosCliente.empresa && (
                <div>
                  <span className="opacity-75">Empresa:</span>
                  <span className="ml-2 font-medium">{datosCliente.empresa}</span>
                </div>
              )}
              <div>
                <span className="opacity-75">Teléfono:</span>
                <span className="ml-2 font-medium">{datosCliente.telefono}</span>
              </div>
              <div>
                <span className="opacity-75">Email:</span>
                <span className="ml-2 font-medium">{datosCliente.email}</span>
              </div>
              <div className="col-span-2">
                <span className="opacity-75">Dirección:</span>
                <span className="ml-2 font-medium">
                  {datosCliente.direccion}, {datosCliente.comuna}
                </span>
              </div>
            </div>
          </div>
          
          {/* Despacho */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h4 className="font-bold text-lg mb-3 text-amber-400">Información de Entrega</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="opacity-75">Tipo de despacho:</span>
                <span className="font-medium">
                  {DELIVERY_OPTIONS.find(opt => opt.id === despacho.tipo)?.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Fecha estimada:</span>
                <span className="font-medium">
                  {despacho.tipo === 'programado' && despacho.fecha_programada
                    ? new Date(despacho.fecha_programada).toLocaleDateString('es-CL')
                    : calcularFechaEntrega(despacho.tipo).toLocaleDateString('es-CL')
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-75">Instalación:</span>
                <span className="font-medium">
                  {despacho.instalacion ? '✓ Incluida' : '✗ No incluida'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Total final */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl p-6">
            <div className="space-y-3">
              <div className="flex justify-between text-lg">
                <span>Subtotal productos:</span>
                <span className="font-bold">${formatCurrency(totales.subtotal)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Despacho:</span>
                <span className="font-bold">
                  {totales.costoDespacho > 0 
                    ? `$${formatCurrency(totales.costoDespacho)}`
                    : 'GRATIS'
                  }
                </span>
              </div>
              {despacho.instalacion && (
                <div className="flex justify-between text-lg">
                  <span>Instalación:</span>
                  <span className="font-bold">${formatCurrency(totales.costoInstalacion)}</span>
                </div>
              )}
              <div className="pt-4 border-t-2 border-yellow-400 flex justify-between">
                <span className="text-2xl font-bold">TOTAL FINAL:</span>
                <span className="text-3xl font-bold text-amber-400">
                  ${formatCurrency(totales.total)} CLP
                </span>
              </div>
            </div>
          </div>
          
          {/* Botones finales */}
          <div className="flex justify-between items-center pt-6">
            <button
              onClick={() => setPaso(3)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-bold transition-all"
            >
              ← Modificar
            </button>
            <button
              onClick={enviarCotizacion}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 Enviar Cotización por WhatsApp
            </button>
          </div>
          
          <div className="text-center text-sm opacity-75 pt-4">
            <p>Al enviar esta cotización, recibirás una confirmación en tu email</p>
            <p>Nuestro equipo te contactará en menos de 2 horas hábiles</p>
          </div>
        </div>
      )}
    </div>
  );
};