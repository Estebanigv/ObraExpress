"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Alerta {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  prioridad: string;
  leida: boolean;
  fecha_limite?: string;
  created_at: string;
  acciones_disponibles?: any[];
  orden_trabajo_id?: string;
  venta_id?: string;
}

export default function AlertasAdmin() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    cargarAlertas();
    
    // Auto-refresh cada 30 segundos si está habilitado
    const interval = setInterval(() => {
      if (autoRefresh) {
        cargarAlertas();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [filtro, autoRefresh]);

  const cargarAlertas = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('alertas_sistema')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtro === 'no_leidas') {
        query = query.eq('leida', false);
      } else if (filtro === 'criticas') {
        query = query.eq('prioridad', 'critica');
      } else if (filtro === 'hoy') {
        const hoy = new Date().toISOString().split('T')[0];
        query = query.gte('created_at', hoy);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error cargando alertas:', error);
      } else {
        setAlertas(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (alertaId: string) => {
    try {
      const response = await fetch('/api/sistema-alertas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ alertaId })
      });

      if (response.ok) {
        cargarAlertas();
      }
    } catch (error) {
      console.error('Error marcando alerta como leída:', error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const response = await fetch('/api/sistema-alertas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ todasLeidas: true })
      });

      if (response.ok) {
        cargarAlertas();
      }
    } catch (error) {
      console.error('Error marcando todas las alertas como leídas:', error);
    }
  };

  const ejecutarSistemaAlertas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sistema-alertas');
      
      if (response.ok) {
        alert('Sistema de alertas ejecutado correctamente');
        cargarAlertas();
      } else {
        alert('Error ejecutando sistema de alertas');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error ejecutando sistema de alertas');
    } finally {
      setLoading(false);
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return 'bg-red-100 text-red-800 border-red-200';
      case 'alta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'critica': return '🚨';
      case 'alta': return '⚠️';
      case 'media': return '📢';
      case 'baja': return '💡';
      default: return '📝';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'orden_pendiente': return '📋';
      case 'entrega_atrasada': return '📅';
      case 'pago_pendiente': return '💳';
      case 'venta_aprobada': return '💰';
      case 'orden_confirmada': return '✅';
      default: return '🔔';
    }
  };

  const alertasNoLeidas = alertas.filter(a => !a.leida).length;
  const alertasCriticas = alertas.filter(a => a.prioridad === 'critica').length;

  if (loading && alertas.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando alertas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centro de Alertas</h1>
            <p className="text-gray-600 mt-1">
              Sistema de monitoreo y notificaciones automáticas
            </p>
          </div>
          <div className="flex space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Auto-refresh</span>
            </label>
            <button
              onClick={ejecutarSistemaAlertas}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              disabled={loading}
            >
              🔄 Ejecutar Alertas
            </button>
            <button
              onClick={marcarTodasComoLeidas}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
            >
              ✓ Marcar Todas Leídas
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total Alertas</h3>
          <p className="text-2xl font-bold text-blue-600">{alertas.length}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800">No Leídas</h3>
          <p className="text-2xl font-bold text-red-600">{alertasNoLeidas}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-800">Críticas</h3>
          <p className="text-2xl font-bold text-orange-600">{alertasCriticas}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Sistema</h3>
          <p className="text-xl font-bold text-green-600">
            {autoRefresh ? '🟢 Activo' : '🔴 Pausado'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-4">
          <button
            onClick={() => setFiltro('todas')}
            className={`px-4 py-2 rounded-md font-medium ${
              filtro === 'todas' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('no_leidas')}
            className={`px-4 py-2 rounded-md font-medium ${
              filtro === 'no_leidas' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            No Leídas ({alertasNoLeidas})
          </button>
          <button
            onClick={() => setFiltro('criticas')}
            className={`px-4 py-2 rounded-md font-medium ${
              filtro === 'criticas' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Críticas ({alertasCriticas})
          </button>
          <button
            onClick={() => setFiltro('hoy')}
            className={`px-4 py-2 rounded-md font-medium ${
              filtro === 'hoy' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-4">
        {alertas.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ¡No hay alertas!
            </h3>
            <p className="text-gray-600">
              Todo está funcionando correctamente. No hay alertas que requieran tu atención.
            </p>
          </div>
        ) : (
          alertas.map((alerta) => (
            <div
              key={alerta.id}
              className={`bg-white rounded-lg shadow border-l-4 p-6 ${
                !alerta.leida ? 'bg-blue-50' : ''
              } ${getPrioridadColor(alerta.prioridad).split(' ')[2]}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getTipoIcon(alerta.tipo)}</span>
                    <span className="text-lg">{getPrioridadIcon(alerta.prioridad)}</span>
                    <h3 className={`text-lg font-semibold ${!alerta.leida ? 'text-blue-900' : 'text-gray-900'}`}>
                      {alerta.titulo}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadColor(alerta.prioridad)}`}>
                      {alerta.prioridad}
                    </span>
                    {!alerta.leida && (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Nuevo
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-4">{alerta.mensaje}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {new Date(alerta.created_at).toLocaleString('es-CL')}
                      {alerta.fecha_limite && (
                        <span className="ml-4">
                          📅 Límite: {new Date(alerta.fecha_limite).toLocaleString('es-CL')}
                        </span>
                      )}
                    </div>
                    
                    {/* Acciones disponibles */}
                    {alerta.acciones_disponibles && alerta.acciones_disponibles.length > 0 && (
                      <div className="flex space-x-2">
                        {alerta.acciones_disponibles.map((accion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              if (accion.url) {
                                window.open(accion.url, '_blank');
                              } else if (accion.email) {
                                window.open(`mailto:${accion.email}`, '_blank');
                              } else if (accion.telefono) {
                                window.open(`tel:${accion.telefono}`, '_blank');
                              }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium"
                          >
                            {accion.texto}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4 flex flex-col space-y-2">
                  {!alerta.leida && (
                    <button
                      onClick={() => marcarComoLeida(alerta.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                    >
                      ✓ Marcar Leída
                    </button>
                  )}
                  
                  {/* Enlaces rápidos */}
                  {alerta.venta_id && (
                    <a
                      href={`/admin/ventas?id=${alerta.venta_id}`}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm font-medium text-center"
                    >
                      Ver Venta
                    </a>
                  )}
                  
                  {alerta.orden_trabajo_id && (
                    <a
                      href={`/admin/ordenes-trabajo?id=${alerta.orden_trabajo_id}`}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm font-medium text-center"
                    >
                      Ver Orden
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}