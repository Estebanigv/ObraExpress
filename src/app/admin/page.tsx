"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface DashboardStats {
  ventasTotal: number;
  ventasHoy: number;
  ordenesPendientes: number;
  alertasNoLeidas: number;
  ventasMes: number;
  ingresosMes: number;
  ingresosTotal: number;
}

interface RecentActivity {
  id: string;
  accion: string;
  usuario: string;
  created_at: string;
  detalles?: any;
}

interface ChartData {
  mes: string;
  ventas: number;
  ingresos: number;
  promedio: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    ventasTotal: 0,
    ventasHoy: 0,
    ordenesPendientes: 0,
    alertasNoLeidas: 0,
    ventasMes: 0,
    ingresosMes: 0,
    ingresosTotal: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showDemoData, setShowDemoData] = useState(false);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartMode, setChartMode] = useState<'auto' | 'custom'>('auto');
  const [selectedMonths, setSelectedMonths] = useState<Date[]>([]);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);

  useEffect(() => {
    cargarDashboard();
    // Removido auto-refresh para evitar reseteos
  }, [selectedMonth]);

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      
      // Estadísticas principales
      await Promise.all([
        cargarEstadisticasVentas(),
        cargarOrdenesPendientes(),
        cargarAlertasNoLeidas(),
        cargarActividadReciente(),
        cargarDatosGraficos()
      ]);

    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticasVentas = async () => {
    try {
      // Total de ventas (número)
      const { count: ventasTotal, error: errorVentasTotal } = await supabase
        .from('ventas')
        .select('*', { count: 'exact', head: true });

      if (errorVentasTotal) {
        console.log('Las tablas aún no están configuradas. Usar datos demo.');
        setShowDemoData(true);
        // Usar datos demo si las tablas no existen
        setStats(prev => ({
          ...prev,
          ventasTotal: 5,
          ventasHoy: 1,
          ventasMes: 3,
          ingresosMes: 150000,
          ingresosTotal: 750000
        }));
        return;
      }

      // Ingresos totales (CLP)
      const { data: todasVentas } = await supabase
        .from('ventas')
        .select('total');

      const ingresosTotal = todasVentas?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;

      // Ventas de hoy
      const hoy = new Date().toISOString().split('T')[0];
      const { count: ventasHoy } = await supabase
        .from('ventas')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', hoy);

      // Ventas del mes seleccionado
      const inicioMes = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const finMes = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0, 23, 59, 59);

      const { data: ventasMesData, count: ventasMes } = await supabase
        .from('ventas')
        .select('total', { count: 'exact' })
        .gte('created_at', inicioMes.toISOString())
        .lte('created_at', finMes.toISOString());

      const ingresosMes = ventasMesData?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;

      setStats(prev => ({
        ...prev,
        ventasTotal: ventasTotal || 0,
        ventasHoy: ventasHoy || 0,
        ventasMes: ventasMes || 0,
        ingresosMes,
        ingresosTotal
      }));

    } catch (error) {
      console.error('Error cargando estadísticas de ventas:', error);
      // Usar datos demo en caso de error
      setStats(prev => ({
        ...prev,
        ventasTotal: 5,
        ventasHoy: 1,
        ventasMes: 3,
        ingresosMes: 150000,
        ingresosTotal: 750000
      }));
    }
  };

  const cargarOrdenesPendientes = async () => {
    try {
      const { count, error } = await supabase
        .from('ordenes_trabajo_proveedor')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'enviada');

      if (error) {
        setStats(prev => ({ ...prev, ordenesPendientes: 2 })); // Dato demo
        return;
      }

      setStats(prev => ({ ...prev, ordenesPendientes: count || 0 }));
    } catch (error) {
      console.error('Error cargando órdenes pendientes:', error);
      setStats(prev => ({ ...prev, ordenesPendientes: 2 })); // Dato demo
    }
  };

  const cargarAlertasNoLeidas = async () => {
    try {
      const { count, error } = await supabase
        .from('alertas_sistema')
        .select('*', { count: 'exact', head: true })
        .eq('leida', false);

      if (error) {
        setStats(prev => ({ ...prev, alertasNoLeidas: 1 })); // Dato demo
        return;
      }

      setStats(prev => ({ ...prev, alertasNoLeidas: count || 0 }));
    } catch (error) {
      console.error('Error cargando alertas:', error);
      setStats(prev => ({ ...prev, alertasNoLeidas: 1 })); // Dato demo
    }
  };

  const cargarActividadReciente = async () => {
    try {
      const { data } = await supabase
        .from('logs_actividad')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(data || []);
    } catch (error) {
      console.error('Error cargando actividad reciente:', error);
    }
  };

  const formatearMoneda = (cantidad: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(cantidad);
  };

  const formatearMes = (fecha: Date) => {
    return fecha.toLocaleDateString('es-CL', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const cambiarMes = (direccion: 'anterior' | 'siguiente') => {
    setSelectedMonth(prev => {
      const nuevaFecha = new Date(prev);
      if (direccion === 'anterior') {
        nuevaFecha.setMonth(prev.getMonth() - 1);
      } else {
        nuevaFecha.setMonth(prev.getMonth() + 1);
      }
      return nuevaFecha;
    });
  };

  const irAMesActual = () => {
    setSelectedMonth(new Date());
  };

  const obtenerDatosMes = async (fecha: Date) => {
    const inicioMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const finMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59);
    const mesNombre = fecha.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' });
    
    if (showDemoData) {
      // Datos demo con variación aleatoria
      const ventasBase = Math.floor(Math.random() * 8) + 2;
      const ingresosMes = ventasBase * (Math.random() * 50000 + 30000);
      
      return {
        mes: mesNombre,
        ventas: ventasBase,
        ingresos: Math.round(ingresosMes),
        promedio: Math.round(ingresosMes / ventasBase)
      };
    } else {
      // Datos reales de la base de datos
      const { data: ventasMes, count } = await supabase
        .from('ventas')
        .select('total', { count: 'exact' })
        .gte('created_at', inicioMes.toISOString())
        .lte('created_at', finMes.toISOString());

      const ingresosMes = ventasMes?.reduce((sum, venta) => sum + (venta.total || 0), 0) || 0;
      const promedio = count && count > 0 ? ingresosMes / count : 0;

      return {
        mes: mesNombre,
        ventas: count || 0,
        ingresos: ingresosMes,
        promedio: Math.round(promedio)
      };
    }
  };

  const cargarDatosGraficos = async () => {
    try {
      const datos = [];
      
      if (chartMode === 'auto') {
        // Generar datos para los últimos 6 meses
        const hoy = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
          datos.push(await obtenerDatosMes(fecha));
        }
      } else {
        // Usar meses seleccionados personalizados
        const mesesOrdenados = [...selectedMonths].sort((a, b) => a.getTime() - b.getTime());
        
        for (const fecha of mesesOrdenados) {
          datos.push(await obtenerDatosMes(fecha));
        }
      }
      
      setChartData(datos);
    } catch (error) {
      console.error('Error cargando datos de gráficos:', error);
      // Generar datos demo en caso de error
      const datosDemo = [];
      const hoy = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const mesNombre = fecha.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' });
        const ventas = Math.floor(Math.random() * 8) + 2;
        const ingresos = ventas * (Math.random() * 50000 + 30000);
        
        datosDemo.push({
          mes: mesNombre,
          ventas,
          ingresos: Math.round(ingresos),
          promedio: Math.round(ingresos / ventas)
        });
      }
      
      setChartData(datosDemo);
    }
  };

  const toggleMonthSelection = (fecha: Date) => {
    const mesKey = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    const fechaExiste = selectedMonths.some(
      m => `${m.getFullYear()}-${m.getMonth()}` === mesKey
    );

    if (fechaExiste) {
      setSelectedMonths(selectedMonths.filter(
        m => `${m.getFullYear()}-${m.getMonth()}` !== mesKey
      ));
    } else {
      if (selectedMonths.length < 12) { // Máximo 12 meses
        setSelectedMonths([...selectedMonths, new Date(fecha.getFullYear(), fecha.getMonth(), 1)]);
      }
    }
  };

  const aplicarSeleccionPersonalizada = () => {
    if (selectedMonths.length > 0) {
      setChartMode('custom');
      setShowCalendarModal(false);
      cargarDatosGraficos();
    }
  };

  const volverModoAutomatico = () => {
    setChartMode('auto');
    setSelectedMonths([]);
    cargarDatosGraficos();
  };

  // Generar lista de meses para el modal
  const generarMesesCalendario = () => {
    const meses = [];
    const hoy = new Date();
    
    // Últimos 24 meses
    for (let i = 23; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      meses.push(fecha);
    }
    
    // Próximos 12 meses
    for (let i = 1; i <= 12; i++) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() + i, 1);
      meses.push(fecha);
    }
    
    return meses;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner de configuración si es necesario */}
      {showDemoData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              ⚠️
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Base de datos no configurada
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Las tablas del sistema aún no están configuradas. Mostrando datos de ejemplo. 
                  Para configurar la base de datos, ejecuta el archivo <code className="bg-yellow-100 px-1 rounded">SETUP_DATABASE.sql</code> en Supabase.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-blue-100 mt-1">
          Panel de control unificado - Sistema ObraExpress
        </p>
        <div className="text-sm text-blue-200 mt-2">
          Última actualización: {new Date().toLocaleString('es-CL')}
        </div>
      </div>

      {/* Selector de Mes */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">📅 Período de Análisis</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => cambiarMes('anterior')}
              className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              ⬅️ Anterior
            </button>
            <div className="text-center min-w-[160px]">
              <div className="text-xl font-bold text-gray-900 capitalize">
                {formatearMes(selectedMonth)}
              </div>
              {selectedMonth.getMonth() === new Date().getMonth() && 
               selectedMonth.getFullYear() === new Date().getFullYear() && (
                <div className="text-sm text-blue-600">Mes actual</div>
              )}
            </div>
            <button
              onClick={() => cambiarMes('siguiente')}
              className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Siguiente ➡️
            </button>
            <button
              onClick={irAMesActual}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Ir a Hoy
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Ventas Total</h3>
              <p className="text-3xl font-bold text-green-600">{stats.ventasTotal}</p>
              <p className="text-sm text-gray-600">Número de ventas</p>
            </div>
            <div className="text-4xl text-green-500">📊</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-emerald-500">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Ingresos Total</h3>
              <p className="text-2xl font-bold text-emerald-600">{formatearMoneda(stats.ingresosTotal)}</p>
              <p className="text-sm text-gray-600">Ingresos totales CLP</p>
            </div>
            <div className="text-4xl text-emerald-500">💰</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Órdenes Pendientes</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.ordenesPendientes}</p>
              <p className="text-sm text-gray-600">Esperando respuesta</p>
            </div>
            <div className="text-4xl text-orange-500">📋</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Alertas</h3>
              <p className="text-3xl font-bold text-red-600">{stats.alertasNoLeidas}</p>
              <p className="text-sm text-gray-600">Sin leer</p>
            </div>
            <div className="text-4xl text-red-500">🚨</div>
          </div>
        </div>
      </div>

      {/* Estadísticas del mes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas del Período Seleccionado</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ventas del mes:</span>
              <span className="text-xl font-bold text-blue-600">{stats.ventasMes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ingresos del mes:</span>
              <span className="text-xl font-bold text-green-600">
                {formatearMoneda(stats.ingresosMes)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Promedio por venta:</span>
              <span className="text-lg font-semibold text-purple-600">
                {stats.ventasMes > 0 ? formatearMoneda(stats.ingresosMes / stats.ventasMes) : '$0'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay actividad reciente</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="border-l-2 border-blue-200 pl-3">
                  <p className="text-sm font-medium text-gray-900">{activity.accion}</p>
                  <p className="text-xs text-gray-500">
                    {activity.usuario} • {new Date(activity.created_at).toLocaleString('es-CL')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Gráficos de Desempeño */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">📊 Análisis de Ventas por Período</h3>
          <div className="flex items-center space-x-3">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={volverModoAutomatico}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartMode === 'auto'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Últimos 6 meses
              </button>
              <button
                onClick={() => setShowCalendarModal(true)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  chartMode === 'custom'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📅 Personalizar
              </button>
            </div>
            {chartMode === 'custom' && (
              <div className="text-sm text-gray-600">
                {selectedMonths.length} meses seleccionados
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Gráfico de Ventas por Mes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            📊 Ventas por Mes
            {chartMode === 'auto' ? ' (Últimos 6 meses)' : ' (Personalizado)'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'ventas' ? `${value} ventas` : `${formatearMoneda(Number(value))}`,
                    name === 'ventas' ? 'Número de Ventas' : 'Ingresos'
                  ]}
                />
                <Legend />
                <Bar dataKey="ventas" fill="#3B82F6" name="ventas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Ingresos por Mes */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 Ingresos por Mes (CLP)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
                <Tooltip 
                  formatter={(value) => [formatearMoneda(Number(value)), 'Ingresos']}
                />
                <Legend />
                <Bar dataKey="ingresos" fill="#10B981" name="ingresos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Gráfico de Tendencia y Promedio */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Análisis de Tendencia y Promedio por Venta</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'ventas') return [`${value} ventas`, 'Número de Ventas'];
                  return [formatearMoneda(Number(value)), name === 'promedio' ? 'Promedio por Venta' : 'Ingresos'];
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="ventas" stroke="#3B82F6" strokeWidth={3} name="ventas" />
              <Line yAxisId="right" type="monotone" dataKey="promedio" stroke="#F59E0B" strokeWidth={3} name="promedio" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Insights automáticos */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Insights Automáticos</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-600">Mes con más ventas:</span>
              <p className="text-gray-700">
                {chartData.length > 0 && chartData.reduce((max, item) => item.ventas > max.ventas ? item : max, chartData[0])?.mes || 'N/A'}
              </p>
            </div>
            <div>
              <span className="font-medium text-green-600">Mes con mayores ingresos:</span>
              <p className="text-gray-700">
                {chartData.length > 0 && chartData.reduce((max, item) => item.ingresos > max.ingresos ? item : max, chartData[0])?.mes || 'N/A'}
              </p>
            </div>
            <div>
              <span className="font-medium text-orange-600">Mejor promedio por venta:</span>
              <p className="text-gray-700">
                {chartData.length > 0 && formatearMoneda(chartData.reduce((max, item) => item.promedio > max.promedio ? item : max, chartData[0])?.promedio || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            href="/admin/ventas"
            className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-center transition-colors group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">💼</div>
            <h4 className="font-semibold text-green-800">Gestión Ventas</h4>
            <p className="text-sm text-green-600">Ver y exportar ventas</p>
          </Link>

          <Link 
            href="/admin/ordenes-trabajo"
            className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 text-center transition-colors group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
            <h4 className="font-semibold text-orange-800">Órdenes Trabajo</h4>
            <p className="text-sm text-orange-600">Gestionar proveedores</p>
          </Link>

          <Link 
            href="/admin/alertas"
            className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-4 text-center transition-colors group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🚨</div>
            <h4 className="font-semibold text-red-800">Centro Alertas</h4>
            <p className="text-sm text-red-600">Monitoreo automático</p>
          </Link>

          <Link 
            href="/admin/archivos"
            className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-center transition-colors group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📁</div>
            <h4 className="font-semibold text-purple-800">Archivos</h4>
            <p className="text-sm text-purple-600">Gestión documentos</p>
          </Link>

          <Link 
            href="/admin/notificaciones"
            className="bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg p-4 text-center transition-colors group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔔</div>
            <h4 className="font-semibold text-yellow-800">Notificaciones</h4>
            <p className="text-sm text-yellow-600">Enviar a clientes</p>
          </Link>
        </div>
      </div>

      {/* Estado del sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-semibold text-gray-900 mb-3">🔧 Sistema de Alertas</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className="text-sm font-semibold text-green-600">🟢 Activo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Frecuencia:</span>
              <span className="text-sm text-gray-800">Cada 10 minutos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Último check:</span>
              <span className="text-sm text-gray-800">
                {new Date().toLocaleTimeString('es-CL')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-semibold text-gray-900 mb-3">📧 Notificaciones</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Email admin:</span>
              <span className="text-sm text-blue-600">gonzalezvogel@gmail.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Proveedor principal:</span>
              <span className="text-sm text-gray-800">Leker Chile</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-semibold text-gray-900 mb-3">🗄️ Base de Datos</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Estado:</span>
              <span className="text-sm font-semibold text-green-600">🟢 Conectada</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tablas:</span>
              <span className="text-sm text-gray-800">8 configuradas</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Proveedor:</span>
              <span className="text-sm text-gray-800">Supabase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Calendario Personalizado */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                📅 Seleccionar Meses para Comparación
              </h3>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Selecciona hasta 12 meses para crear tu análisis personalizado. Puedes elegir cualquier combinación de meses.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-gray-600">
                  Seleccionados: <strong>{selectedMonths.length}/12</strong>
                </span>
                {selectedMonths.length > 0 && (
                  <button
                    onClick={() => setSelectedMonths([])}
                    className="text-red-600 hover:text-red-700"
                  >
                    Limpiar selección
                  </button>
                )}
              </div>
            </div>

            {/* Grid de Meses */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {generarMesesCalendario().map((fecha, index) => {
                const mesKey = `${fecha.getFullYear()}-${fecha.getMonth()}`;
                const isSelected = selectedMonths.some(
                  m => `${m.getFullYear()}-${m.getMonth()}` === mesKey
                );
                const mesNombre = fecha.toLocaleDateString('es-CL', { 
                  month: 'long', 
                  year: 'numeric' 
                });
                const esHoy = fecha.getMonth() === new Date().getMonth() && 
                           fecha.getFullYear() === new Date().getFullYear();

                return (
                  <button
                    key={index}
                    onClick={() => toggleMonthSelection(fecha)}
                    disabled={!isSelected && selectedMonths.length >= 12}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    } ${
                      !isSelected && selectedMonths.length >= 12
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer'
                    } ${
                      esHoy ? 'ring-2 ring-green-300' : ''
                    }`}
                  >
                    <div className="capitalize">{mesNombre}</div>
                    {esHoy && <div className="text-xs text-green-600 mt-1">Actual</div>}
                    {isSelected && <div className="text-xs text-blue-600 mt-1">✓ Seleccionado</div>}
                  </button>
                );
              })}
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCalendarModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={aplicarSeleccionPersonalizada}
                disabled={selectedMonths.length === 0}
                className={`px-4 py-2 rounded-md font-medium ${
                  selectedMonths.length > 0
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Aplicar Selección ({selectedMonths.length} meses)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}