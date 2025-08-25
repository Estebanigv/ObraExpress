"use client";

import React, { useState } from 'react';

interface Proveedor {
  id: string;
  nombre: string;
  contacto: {
    nombre: string;
    telefono: string;
    email: string;
  };
  direccion: string;
  categoria: string;
  productos: string[];
  estado: 'activo' | 'inactivo' | 'pendiente';
  fechaRegistro: string;
  ultimoPedido?: string;
  condicionesPago: string;
  descuento?: number;
  notas?: string;
}

export default function AdminProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([
    {
      id: '1',
      nombre: 'Leker Chile S.A.',
      contacto: {
        nombre: 'Carlos Rodriguez',
        telefono: '+56 2 2345 6789',
        email: 'carlos@lekerchile.cl'
      },
      direccion: 'Av. Industrial 1234, Santiago',
      categoria: 'Policarbonatos',
      productos: ['Policarbonato Alveolar', 'Greca Industrial', 'Accesorios'],
      estado: 'activo',
      fechaRegistro: '2022-03-15',
      ultimoPedido: '2024-01-10',
      condicionesPago: '30 días',
      descuento: 15,
      notas: 'Proveedor principal con excelente calidad'
    },
    {
      id: '2',
      nombre: 'Distribuidora Nacional Ltda.',
      contacto: {
        nombre: 'María González',
        telefono: '+56 2 9876 5432',
        email: 'maria@distnacional.cl'
      },
      direccion: 'Calle Comercial 567, Valparaíso',
      categoria: 'Materiales Diversos',
      productos: ['Perfiles de Aluminio', 'Selladores', 'Herramientas'],
      estado: 'activo',
      fechaRegistro: '2022-08-20',
      ultimoPedido: '2024-01-08',
      condicionesPago: '15 días',
      descuento: 8,
      notas: 'Buenos precios en volumen'
    },
    {
      id: '3',
      nombre: 'Polímeros del Sur',
      contacto: {
        nombre: 'Juan Pérez',
        telefono: '+56 41 234 5678',
        email: 'juan@polimersos.cl'
      },
      direccion: 'Zona Industrial 890, Concepción',
      categoria: 'Plásticos',
      productos: ['Rollos PVC', 'Láminas Compactas'],
      estado: 'pendiente',
      fechaRegistro: '2024-01-05',
      condicionesPago: 'Contado',
      notas: 'Nuevo proveedor en evaluación'
    }
  ]);

  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null);

  const proveedoresFiltrados = proveedores.filter(proveedor => {
    const coincideEstado = filtroEstado === 'todos' || proveedor.estado === filtroEstado;
    const coincideCategoria = filtroCategoria === '' || proveedor.categoria === filtroCategoria;
    return coincideEstado && coincideCategoria;
  });

  const categorias = Array.from(new Set(proveedores.map(p => p.categoria)));

  const estadisticas = {
    total: proveedores.length,
    activos: proveedores.filter(p => p.estado === 'activo').length,
    pedidosRecientes: proveedores.filter(p => 
      p.ultimoPedido && new Date(p.ultimoPedido) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length,
    descuentoPromedio: Math.round(
      proveedores.filter(p => p.descuento).reduce((sum, p) => sum + (p.descuento || 0), 0) /
      proveedores.filter(p => p.descuento).length
    )
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold">🏭 Gestión de Proveedores</h1>
        <p className="text-indigo-100 mt-2">
          Control completo de la cadena de suministro y relaciones comerciales
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Proveedores</p>
              <p className="text-2xl font-bold text-indigo-600">{estadisticas.total}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🏭</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">{estadisticas.activos}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos Mes</p>
              <p className="text-2xl font-bold text-blue-600">{estadisticas.pedidosRecientes}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Descuento Prom.</p>
              <p className="text-2xl font-bold text-purple-600">
                {isNaN(estadisticas.descuentoPromedio) ? '0' : estadisticas.descuentoPromedio}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="pendiente">Pendientes</option>
            </select>
            
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-md">
              📊 Generar Reporte
            </button>
            
            <button
              onClick={() => setMostrarModal(true)}
              className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-md"
            >
              ➕ Agregar Proveedor
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Proveedores */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Directorio de Proveedores ({proveedoresFiltrados.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {proveedoresFiltrados.map((proveedor) => (
            <div key={proveedor.id} className="border rounded-xl p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{proveedor.nombre}</h3>
                  <p className="text-sm text-gray-600">{proveedor.categoria}</p>
                </div>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                  proveedor.estado === 'activo' ? 'bg-green-100 text-green-800' :
                  proveedor.estado === 'inactivo' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {proveedor.estado === 'activo' ? 'Activo' : 
                   proveedor.estado === 'inactivo' ? 'Inactivo' : 'Pendiente'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">👤</span>
                  <span className="font-medium">{proveedor.contacto.nombre}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📞</span>
                  <span>{proveedor.contacto.telefono}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">✉️</span>
                  <span>{proveedor.contacto.email}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <span className="mr-2">📍</span>
                  <span>{proveedor.direccion}</span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Condiciones de Pago</p>
                      <p className="font-medium text-gray-900">{proveedor.condicionesPago}</p>
                    </div>
                    {proveedor.descuento && (
                      <div>
                        <p className="text-gray-500">Descuento</p>
                        <p className="font-medium text-green-600">{proveedor.descuento}%</p>
                      </div>
                    )}
                  </div>

                  {proveedor.ultimoPedido && (
                    <div className="mt-2">
                      <p className="text-gray-500 text-sm">Último Pedido</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {new Date(proveedor.ultimoPedido).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3">
                  <p className="text-gray-500 text-sm mb-2">Productos que suministra:</p>
                  <div className="flex flex-wrap gap-1">
                    {proveedor.productos.map((producto, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full"
                      >
                        {producto}
                      </span>
                    ))}
                  </div>
                </div>

                {proveedor.notas && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Notas: </span>
                      {proveedor.notas}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <button
                  onClick={() => {
                    setProveedorEditando(proveedor);
                    setMostrarModal(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar proveedor"
                >
                  ✏️
                </button>
                <button
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Nuevo pedido"
                >
                  📦
                </button>
                <button
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  title="Ver historial"
                >
                  📊
                </button>
                <button
                  onClick={() => {
                    setProveedores(proveedores.map(p => 
                      p.id === proveedor.id ? {
                        ...p, 
                        estado: p.estado === 'activo' ? 'inactivo' : 'activo'
                      } : p
                    ));
                  }}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title={proveedor.estado === 'activo' ? 'Desactivar' : 'Activar'}
                >
                  {proveedor.estado === 'activo' ? '🔴' : '🟢'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📧</span>
              <h4 className="font-semibold text-gray-900">Enviar RFQ</h4>
              <p className="text-sm text-gray-600">Solicitud de cotización</p>
            </div>
          </button>

          <button className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📊</span>
              <h4 className="font-semibold text-gray-900">Evaluación</h4>
              <p className="text-sm text-gray-600">Calificar proveedores</p>
            </div>
          </button>

          <button className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📋</span>
              <h4 className="font-semibold text-gray-900">Contratos</h4>
              <p className="text-sm text-gray-600">Gestionar acuerdos</p>
            </div>
          </button>

          <button className="p-4 border-2 border-dashed border-orange-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📈</span>
              <h4 className="font-semibold text-gray-900">Análisis</h4>
              <p className="text-sm text-gray-600">Performance report</p>
            </div>
          </button>
        </div>
      </div>

      {/* Modal de Agregar/Editar Proveedor */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {proveedorEditando ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    defaultValue={proveedorEditando?.nombre || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    defaultValue={proveedorEditando?.categoria || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Seleccionar categoría</option>
                    <option value="Policarbonatos">Policarbonatos</option>
                    <option value="Materiales Diversos">Materiales Diversos</option>
                    <option value="Plásticos">Plásticos</option>
                    <option value="Metales">Metales</option>
                    <option value="Herramientas">Herramientas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <textarea
                    rows={3}
                    defaultValue={proveedorEditando?.direccion || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    defaultValue={proveedorEditando?.estado || 'pendiente'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contacto Principal
                  </label>
                  <input
                    type="text"
                    defaultValue={proveedorEditando?.contacto.nombre || ''}
                    placeholder="Nombre del contacto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    defaultValue={proveedorEditando?.contacto.telefono || ''}
                    placeholder="+56 2 2345 6789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={proveedorEditando?.contacto.email || ''}
                    placeholder="contacto@proveedor.cl"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condiciones de Pago
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option value="Contado">Contado</option>
                      <option value="15 días">15 días</option>
                      <option value="30 días">30 días</option>
                      <option value="45 días">45 días</option>
                      <option value="60 días">60 días</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      defaultValue={proveedorEditando?.descuento || ''}
                      placeholder="0"
                      min="0"
                      max="50"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Productos que Suministra
                </label>
                <textarea
                  rows={3}
                  defaultValue={proveedorEditando?.productos.join(', ') || ''}
                  placeholder="Separar con comas: Policarbonato Alveolar, Greca Industrial, Accesorios"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  rows={3}
                  defaultValue={proveedorEditando?.notas || ''}
                  placeholder="Comentarios internos sobre el proveedor..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setProveedorEditando(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                {proveedorEditando ? 'Actualizar' : 'Agregar'} Proveedor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}