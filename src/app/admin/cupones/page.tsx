"use client";

import React, { useState } from 'react';

interface Cupon {
  id: string;
  codigo: string;
  descripcion: string;
  tipo: 'porcentaje' | 'fijo';
  valor: number;
  usoMaximo: number;
  usosActuales: number;
  fechaInicio: string;
  fechaExpiracion: string;
  activo: boolean;
  aplicaA: 'todos' | 'categoria' | 'producto';
  condicionMinima?: number;
  creadoPor: string;
}

export default function AdminCupones() {
  const [cupones, setCupones] = useState<Cupon[]>([
    {
      id: '1',
      codigo: 'WELCOME10',
      descripcion: 'Descuento de bienvenida para nuevos clientes',
      tipo: 'porcentaje',
      valor: 10,
      usoMaximo: 100,
      usosActuales: 23,
      fechaInicio: '2024-01-01',
      fechaExpiracion: '2024-12-31',
      activo: true,
      aplicaA: 'todos',
      condicionMinima: 50000,
      creadoPor: 'admin@obraexpress.cl'
    },
    {
      id: '2',
      codigo: 'POLICARB15',
      descripcion: 'Descuento especial en policarbonatos',
      tipo: 'porcentaje',
      valor: 15,
      usoMaximo: 50,
      usosActuales: 8,
      fechaInicio: '2024-01-15',
      fechaExpiracion: '2024-03-15',
      activo: true,
      aplicaA: 'categoria',
      condicionMinima: 100000,
      creadoPor: 'admin@obraexpress.cl'
    },
    {
      id: '3',
      codigo: 'GRATIS5000',
      descripcion: 'Descuento fijo para compras grandes',
      tipo: 'fijo',
      valor: 5000,
      usoMaximo: 25,
      usosActuales: 12,
      fechaInicio: '2024-01-10',
      fechaExpiracion: '2024-02-29',
      activo: false,
      aplicaA: 'todos',
      condicionMinima: 200000,
      creadoPor: 'admin@obraexpress.cl'
    }
  ]);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [cuponEditando, setCuponEditando] = useState<Cupon | null>(null);
  const [filtroActivos, setFiltroActivos] = useState('todos');

  const formatearMoneda = (cantidad: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(cantidad);
  };

  const generarCodigoAleatorio = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultado = '';
    for (let i = 0; i < 8; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
  };

  const cuponesFiltrados = cupones.filter(cupon => {
    if (filtroActivos === 'activos') return cupon.activo;
    if (filtroActivos === 'inactivos') return !cupon.activo;
    return true;
  });

  const estadisticasCupones = {
    total: cupones.length,
    activos: cupones.filter(c => c.activo).length,
    usosTotal: cupones.reduce((sum, c) => sum + c.usosActuales, 0),
    ahorroTotal: cupones.reduce((sum, c) => {
      const ahorroPromedio = c.tipo === 'porcentaje' ? 
        (c.valor / 100) * 75000 : // Asumiendo ticket promedio de 75k
        c.valor;
      return sum + (ahorroPromedio * c.usosActuales);
    }, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold">🎫 Sistema de Cupones y Descuentos</h1>
        <p className="text-purple-100 mt-2">
          Gestión completa de promociones y descuentos para clientes
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cupones</p>
              <p className="text-2xl font-bold text-purple-600">{estadisticasCupones.total}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎫</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cupones Activos</p>
              <p className="text-2xl font-bold text-green-600">{estadisticasCupones.activos}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usos Totales</p>
              <p className="text-2xl font-bold text-blue-600">{estadisticasCupones.usosTotal}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ahorro Total</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatearMoneda(estadisticasCupones.ahorroTotal)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={filtroActivos}
              onChange={(e) => setFiltroActivos(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="todos">Todos los cupones</option>
              <option value="activos">Solo activos</option>
              <option value="inactivos">Solo inactivos</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-md">
              📊 Generar Reporte
            </button>
            
            <button
              onClick={() => setMostrarModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-md"
            >
              ➕ Crear Cupón
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Cupones */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Cupones de Descuento ({cuponesFiltrados.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Validez
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cuponesFiltrados.map((cupon) => (
                <tr key={cupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {cupon.codigo}
                      </div>
                      <div className="text-sm text-gray-500">
                        {cupon.descripcion}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-semibold text-purple-600">
                        {cupon.tipo === 'porcentaje' ? `${cupon.valor}%` : formatearMoneda(cupon.valor)}
                      </div>
                      <div className="text-gray-500">
                        {cupon.aplicaA === 'todos' ? 'Todos los productos' : 
                         cupon.aplicaA === 'categoria' ? 'Por categoría' : 'Producto específico'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-semibold text-blue-600">
                        {cupon.usosActuales}/{cupon.usoMaximo}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(cupon.usosActuales / cupon.usoMaximo) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>
                      <div className="text-gray-900">
                        Hasta: {new Date(cupon.fechaExpiracion).toLocaleDateString('es-CL')}
                      </div>
                      {cupon.condicionMinima && (
                        <div className="text-gray-500">
                          Mín: {formatearMoneda(cupon.condicionMinima)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      cupon.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {cupon.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setCuponEditando(cupon);
                          setMostrarModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Editar cupón"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => {
                          const copiado = navigator.clipboard.writeText(cupon.codigo);
                          // Mostrar notificación de copiado
                        }}
                        className="text-green-600 hover:text-green-900 transition-colors"
                        title="Copiar código"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => {
                          setCupones(cupones.map(c => 
                            c.id === cupon.id ? { ...c, activo: !c.activo } : c
                          ));
                        }}
                        className="text-orange-600 hover:text-orange-900 transition-colors"
                        title={cupon.activo ? 'Desactivar' : 'Activar'}
                      >
                        {cupon.activo ? '🔴' : '🟢'}
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Eliminar cupón"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cupones Rápidos */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Crear Cupones Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🎉</span>
              <h4 className="font-semibold text-gray-900">Descuento 10%</h4>
              <p className="text-sm text-gray-600">Para nuevos clientes</p>
            </div>
          </button>

          <button className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <div className="text-center">
              <span className="text-2xl mb-2 block">💎</span>
              <h4 className="font-semibold text-gray-900">$5.000 OFF</h4>
              <p className="text-sm text-gray-600">Compras sobre $100k</p>
            </div>
          </button>

          <button className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🏷️</span>
              <h4 className="font-semibold text-gray-900">15% Categoría</h4>
              <p className="text-sm text-gray-600">Solo policarbonatos</p>
            </div>
          </button>
        </div>
      </div>

      {/* Modal de Crear/Editar Cupón */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {cuponEditando ? 'Editar Cupón' : 'Crear Nuevo Cupón'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código del Cupón
                </label>
                <div className="flex">
                  <input
                    type="text"
                    defaultValue={cuponEditando?.codigo || ''}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="DESCUENTO10"
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      input.value = generarCodigoAleatorio();
                    }}
                    className="px-3 py-2 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700"
                    title="Generar código aleatorio"
                  >
                    🎲
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Descuento
                </label>
                <select
                  defaultValue={cuponEditando?.tipo || 'porcentaje'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="porcentaje">Porcentaje (%)</option>
                  <option value="fijo">Monto Fijo (CLP)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor del Descuento
                </label>
                <input
                  type="number"
                  defaultValue={cuponEditando?.valor || ''}
                  placeholder="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usos Máximos
                </label>
                <input
                  type="number"
                  defaultValue={cuponEditando?.usoMaximo || ''}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  defaultValue={cuponEditando?.fechaInicio || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Expiración
                </label>
                <input
                  type="date"
                  defaultValue={cuponEditando?.fechaExpiracion || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aplica a
                </label>
                <select
                  defaultValue={cuponEditando?.aplicaA || 'todos'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="todos">Todos los productos</option>
                  <option value="categoria">Solo una categoría</option>
                  <option value="producto">Producto específico</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compra Mínima (CLP)
                </label>
                <input
                  type="number"
                  defaultValue={cuponEditando?.condicionMinima || ''}
                  placeholder="50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                rows={3}
                defaultValue={cuponEditando?.descripcion || ''}
                placeholder="Descripción del cupón para mostrar a los clientes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={cuponEditando?.activo !== false}
                  className="rounded border-gray-300 text-purple-600 shadow-sm focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Cupón activo</span>
              </label>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setMostrarModal(false);
                    setCuponEditando(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  {cuponEditando ? 'Actualizar' : 'Crear'} Cupón
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}