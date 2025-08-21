"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Venta {
  id: string;
  numero_orden: string;
  cliente_nombre: string;
  cliente_email: string;
  total: number;
  estado: string;
  metodo_pago: string;
  created_at: string;
  productos: any[];
}

export default function VentasAdmin() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);

  useEffect(() => {
    cargarVentas();
  }, [filtroEstado, filtroFecha]);

  const cargarVentas = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('ventas')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtroEstado !== 'todas') {
        query = query.eq('estado', filtroEstado);
      }

      if (filtroFecha) {
        const fechaInicio = new Date(filtroFecha);
        const fechaFin = new Date(fechaInicio);
        fechaFin.setDate(fechaFin.getDate() + 1);
        
        query = query
          .gte('created_at', fechaInicio.toISOString())
          .lt('created_at', fechaFin.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error cargando ventas:', error);
      } else {
        setVentas(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarExcel = async () => {
    try {
      // Preparar datos para Excel
      const datosExcel = ventas.map(venta => ({
        'Número Orden': venta.numero_orden,
        'Cliente': venta.cliente_nombre,
        'Email': venta.cliente_email,
        'Total': venta.total,
        'Estado': venta.estado,
        'Método Pago': venta.metodo_pago,
        'Fecha': new Date(venta.created_at).toLocaleDateString('es-CL'),
        'Productos': venta.productos.map(p => `${p.nombre} (${p.cantidad})`).join(', ')
      }));

      // Convertir a CSV (simulación de Excel)
      const headers = Object.keys(datosExcel[0] || {});
      const csvContent = [
        headers.join(','),
        ...datosExcel.map(row => 
          headers.map(header => 
            typeof row[header] === 'string' && row[header].includes(',') 
              ? `"${row[header]}"` 
              : row[header]
          ).join(',')
        )
      ].join('\n');

      // Descargar archivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ventas_polimax_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('Archivo descargado exitosamente');
    } catch (error) {
      console.error('Error exportando:', error);
      alert('Error al exportar archivo');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobada': return 'bg-green-100 text-green-800';
      case 'procesando': return 'bg-yellow-100 text-yellow-800';
      case 'completada': return 'bg-blue-100 text-blue-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando ventas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Ventas</h1>
          <button
            onClick={exportarExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium flex items-center space-x-2"
          >
            <span>📊</span>
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="todas">Todas las ventas</option>
              <option value="pendiente">Pendientes</option>
              <option value="aprobada">Aprobadas</option>
              <option value="procesando">Procesando</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Fecha
            </label>
            <input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroEstado('todas');
                setFiltroFecha('');
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total Ventas</h3>
          <p className="text-2xl font-bold text-blue-600">{ventas.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Ventas Aprobadas</h3>
          <p className="text-2xl font-bold text-green-600">
            {ventas.filter(v => v.estado === 'aprobada').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800">En Proceso</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {ventas.filter(v => v.estado === 'procesando').length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">Ingresos Total</h3>
          <p className="text-xl font-bold text-purple-600">
            ${ventas.reduce((sum, v) => sum + v.total, 0).toLocaleString('es-CL')}
          </p>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ventas.map((venta) => (
                <tr key={venta.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {venta.numero_orden}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{venta.cliente_nombre}</div>
                      <div className="text-sm text-gray-500">{venta.cliente_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${venta.total.toLocaleString('es-CL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(venta.estado)}`}>
                      {venta.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(venta.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setVentaSeleccionada(venta)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalle */}
      {ventaSeleccionada && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalle de Venta: {ventaSeleccionada.numero_orden}
                </h3>
                <button
                  onClick={() => setVentaSeleccionada(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Cliente:</label>
                    <p>{ventaSeleccionada.cliente_nombre}</p>
                  </div>
                  <div>
                    <label className="font-semibold">Email:</label>
                    <p>{ventaSeleccionada.cliente_email}</p>
                  </div>
                  <div>
                    <label className="font-semibold">Total:</label>
                    <p className="font-bold text-lg">${ventaSeleccionada.total.toLocaleString('es-CL')}</p>
                  </div>
                  <div>
                    <label className="font-semibold">Método de Pago:</label>
                    <p>{ventaSeleccionada.metodo_pago}</p>
                  </div>
                </div>

                <div>
                  <label className="font-semibold">Productos:</label>
                  <div className="mt-2 space-y-2">
                    {ventaSeleccionada.productos.map((producto, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">{producto.nombre}</span>
                          <span>${(producto.precio * producto.cantidad).toLocaleString('es-CL')}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Código: {producto.codigo} | Cantidad: {producto.cantidad} | 
                          Precio unitario: ${producto.precio.toLocaleString('es-CL')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setVentaSeleccionada(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}