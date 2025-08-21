"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface OrdenTrabajo {
  id: string;
  numero_orden_trabajo: string;
  venta_id: string;
  proveedor_id: string;
  productos_solicitados: any[];
  total_orden: number;
  estado: string;
  fecha_envio: string;
  fecha_confirmacion?: string;
  orden_compra_proveedor?: string;
  tiempo_respuesta_horas?: number;
  alertas_enviadas: number;
  ultima_alerta?: string;
  notas?: string;
  ventas?: {
    numero_orden: string;
    cliente_nombre: string;
    total: number;
  };
  proveedores?: {
    nombre: string;
    contacto_email: string;
    contacto_telefono: string;
  };
}

export default function OrdenesTrabajoAdmin() {
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenTrabajo | null>(null);
  const [mostrarModalActualizar, setMostrarModalActualizar] = useState(false);
  const [datosActualizacion, setDatosActualizacion] = useState({
    estado: '',
    orden_compra_proveedor: '',
    notas: ''
  });

  useEffect(() => {
    cargarOrdenes();
  }, [filtroEstado]);

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('ordenes_trabajo_proveedor')
        .select(`
          *,
          ventas (
            numero_orden,
            cliente_nombre,
            total
          ),
          proveedores (
            nombre,
            contacto_email,
            contacto_telefono
          )
        `)
        .order('fecha_envio', { ascending: false });

      if (filtroEstado !== 'todas') {
        query = query.eq('estado', filtroEstado);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error cargando órdenes:', error);
      } else {
        setOrdenes(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarOrden = async () => {
    if (!ordenSeleccionada) return;

    try {
      const actualizaciones: any = {
        estado: datosActualizacion.estado,
        notas: datosActualizacion.notas,
        updated_at: new Date().toISOString()
      };

      // Si se proporciona orden de compra del proveedor, marcar como confirmada
      if (datosActualizacion.orden_compra_proveedor) {
        actualizaciones.orden_compra_proveedor = datosActualizacion.orden_compra_proveedor;
        actualizaciones.fecha_confirmacion = new Date().toISOString();
        
        // Calcular tiempo de respuesta
        const fechaEnvio = new Date(ordenSeleccionada.fecha_envio);
        const ahora = new Date();
        const tiempoRespuesta = Math.floor((ahora.getTime() - fechaEnvio.getTime()) / (1000 * 60 * 60));
        actualizaciones.tiempo_respuesta_horas = tiempoRespuesta;
      }

      const { error } = await supabase
        .from('ordenes_trabajo_proveedor')
        .update(actualizaciones)
        .eq('id', ordenSeleccionada.id);

      if (error) {
        console.error('Error actualizando orden:', error);
        alert('Error al actualizar la orden');
      } else {
        // Crear log de actividad
        await supabase
          .from('logs_actividad')
          .insert({
            usuario: 'admin',
            accion: 'orden_trabajo_actualizada',
            entidad: 'orden_trabajo',
            entidad_id: ordenSeleccionada.id,
            detalles: {
              numero_orden: ordenSeleccionada.numero_orden_trabajo,
              estado_anterior: ordenSeleccionada.estado,
              estado_nuevo: datosActualizacion.estado,
              orden_compra: datosActualizacion.orden_compra_proveedor
            }
          });

        // Si se confirmó la orden, crear alerta de seguimiento
        if (datosActualizacion.orden_compra_proveedor && datosActualizacion.estado === 'confirmada') {
          await supabase
            .from('alertas_sistema')
            .insert({
              tipo: 'orden_confirmada',
              orden_trabajo_id: ordenSeleccionada.id,
              titulo: `Orden confirmada: ${ordenSeleccionada.numero_orden_trabajo}`,
              mensaje: `El proveedor ${ordenSeleccionada.proveedores?.nombre} confirmó la orden con número: ${datosActualizacion.orden_compra_proveedor}`,
              prioridad: 'media',
              usuario_asignado: 'admin_ventas'
            });
        }

        alert('Orden actualizada exitosamente');
        setMostrarModalActualizar(false);
        setOrdenSeleccionada(null);
        cargarOrdenes();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la orden');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'enviada': return 'bg-yellow-100 text-yellow-800';
      case 'confirmada': return 'bg-blue-100 text-blue-800';
      case 'en_proceso': return 'bg-purple-100 text-purple-800';
      case 'completada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadAlerta = (orden: OrdenTrabajo) => {
    const horasDesdeEnvio = Math.floor((new Date().getTime() - new Date(orden.fecha_envio).getTime()) / (1000 * 60 * 60));
    
    if (orden.estado === 'enviada') {
      if (horasDesdeEnvio > 24) return 'critica';
      if (horasDesdeEnvio > 12) return 'alta';
      if (horasDesdeEnvio > 6) return 'media';
    }
    
    return 'baja';
  };

  const enviarRecordatorio = async (orden: OrdenTrabajo) => {
    try {
      // Aquí iría la lógica para enviar email al proveedor
      // Por ahora solo actualizamos el contador de alertas
      
      await supabase
        .from('ordenes_trabajo_proveedor')
        .update({
          alertas_enviadas: orden.alertas_enviadas + 1,
          ultima_alerta: new Date().toISOString()
        })
        .eq('id', orden.id);

      // Crear alerta en el sistema
      await supabase
        .from('alertas_sistema')
        .insert({
          tipo: 'recordatorio_enviado',
          orden_trabajo_id: orden.id,
          titulo: `Recordatorio enviado: ${orden.numero_orden_trabajo}`,
          mensaje: `Se envió recordatorio #${orden.alertas_enviadas + 1} al proveedor ${orden.proveedores?.nombre}`,
          prioridad: 'baja',
          usuario_asignado: 'admin_ventas'
        });

      alert('Recordatorio enviado al proveedor');
      cargarOrdenes();
    } catch (error) {
      console.error('Error enviando recordatorio:', error);
      alert('Error al enviar recordatorio');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando órdenes de trabajo...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Órdenes de Trabajo a Proveedores</h1>
          <div className="flex space-x-2">
            <button
              onClick={cargarOrdenes}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="todas">Todas las órdenes</option>
              <option value="enviada">Enviadas</option>
              <option value="confirmada">Confirmadas</option>
              <option value="en_proceso">En Proceso</option>
              <option value="completada">Completadas</option>
              <option value="cancelada">Canceladas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800">Enviadas</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {ordenes.filter(o => o.estado === 'enviada').length}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Confirmadas</h3>
          <p className="text-2xl font-bold text-blue-600">
            {ordenes.filter(o => o.estado === 'confirmada').length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">En Proceso</h3>
          <p className="text-2xl font-bold text-purple-600">
            {ordenes.filter(o => o.estado === 'en_proceso').length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Completadas</h3>
          <p className="text-2xl font-bold text-green-600">
            {ordenes.filter(o => o.estado === 'completada').length}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800">Alertas Críticas</h3>
          <p className="text-2xl font-bold text-red-600">
            {ordenes.filter(o => getPrioridadAlerta(o) === 'critica').length}
          </p>
        </div>
      </div>

      {/* Tabla de órdenes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden Trabajo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venta Asociada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiempo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordenes.map((orden) => {
                const prioridad = getPrioridadAlerta(orden);
                const horasDesdeEnvio = Math.floor((new Date().getTime() - new Date(orden.fecha_envio).getTime()) / (1000 * 60 * 60));
                
                return (
                  <tr key={orden.id} className={`hover:bg-gray-50 ${prioridad === 'critica' ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {orden.numero_orden_trabajo}
                      {prioridad === 'critica' && <span className="ml-2 text-red-500">🚨</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{orden.proveedores?.nombre}</div>
                        <div className="text-sm text-gray-500">{orden.proveedores?.contacto_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{orden.ventas?.numero_orden}</div>
                        <div className="text-sm text-gray-500">{orden.ventas?.cliente_nombre}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${orden.total_orden.toLocaleString('es-CL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(orden.estado)}`}>
                        {orden.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {horasDesdeEnvio}h
                      {orden.alertas_enviadas > 0 && (
                        <div className="text-xs text-red-600">
                          {orden.alertas_enviadas} alertas
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setOrdenSeleccionada(orden)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver
                      </button>
                      <button
                        onClick={() => {
                          setOrdenSeleccionada(orden);
                          setDatosActualizacion({
                            estado: orden.estado,
                            orden_compra_proveedor: orden.orden_compra_proveedor || '',
                            notas: orden.notas || ''
                          });
                          setMostrarModalActualizar(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Actualizar
                      </button>
                      {orden.estado === 'enviada' && (
                        <button
                          onClick={() => enviarRecordatorio(orden)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Recordar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalle */}
      {ordenSeleccionada && !mostrarModalActualizar && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalle Orden: {ordenSeleccionada.numero_orden_trabajo}
                </h3>
                <button
                  onClick={() => setOrdenSeleccionada(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold">Proveedor:</label>
                    <p>{ordenSeleccionada.proveedores?.nombre}</p>
                  </div>
                  <div>
                    <label className="font-semibold">Estado:</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(ordenSeleccionada.estado)}`}>
                      {ordenSeleccionada.estado}
                    </span>
                  </div>
                  <div>
                    <label className="font-semibold">Total Orden:</label>
                    <p className="font-bold text-lg">${ordenSeleccionada.total_orden.toLocaleString('es-CL')}</p>
                  </div>
                  <div>
                    <label className="font-semibold">Fecha Envío:</label>
                    <p>{new Date(ordenSeleccionada.fecha_envio).toLocaleString('es-CL')}</p>
                  </div>
                  {ordenSeleccionada.orden_compra_proveedor && (
                    <div>
                      <label className="font-semibold">Orden Compra Proveedor:</label>
                      <p className="font-medium text-blue-600">{ordenSeleccionada.orden_compra_proveedor}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold">Productos Solicitados:</label>
                  <div className="mt-2 space-y-2">
                    {ordenSeleccionada.productos_solicitados.map((producto, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between">
                          <span className="font-medium">{producto.nombre}</span>
                          <span>${(producto.precio_proveedor * producto.cantidad).toLocaleString('es-CL')}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Código: {producto.codigo_proveedor} | Cantidad: {producto.cantidad}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {ordenSeleccionada.notas && (
                  <div>
                    <label className="font-semibold">Notas:</label>
                    <p className="mt-1 p-2 bg-gray-50 rounded">{ordenSeleccionada.notas}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setOrdenSeleccionada(null)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de actualización */}
      {mostrarModalActualizar && ordenSeleccionada && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Actualizar Orden: {ordenSeleccionada.numero_orden_trabajo}
                </h3>
                <button
                  onClick={() => setMostrarModalActualizar(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={datosActualizacion.estado}
                    onChange={(e) => setDatosActualizacion({...datosActualizacion, estado: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="enviada">Enviada</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="en_proceso">En Proceso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Orden de Compra del Proveedor
                  </label>
                  <input
                    type="text"
                    value={datosActualizacion.orden_compra_proveedor}
                    onChange={(e) => setDatosActualizacion({...datosActualizacion, orden_compra_proveedor: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Ej: OC-LEKER-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={datosActualizacion.notas}
                    onChange={(e) => setDatosActualizacion({...datosActualizacion, notas: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Notas adicionales sobre la orden..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setMostrarModalActualizar(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  onClick={actualizarOrden}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Actualizar Orden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}