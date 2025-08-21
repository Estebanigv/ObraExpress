"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Cliente {
  id: string;
  email: string;
  nombre: string;
  telefono?: string;
  tieneDescuento: boolean;
  porcentajeDescuento: number;
  comprasRealizadas: number;
  totalComprado: number;
  fechaRegistro: Date;
  ultimaCompra?: Date;
}

interface NotificationTemplate {
  id: string;
  nombre: string;
  tipo: 'promocion' | 'sistema' | 'compra' | 'despacho' | 'cotizacion';
  titulo: string;
  mensaje: string;
  segmento: 'todos' | 'nuevos' | 'frecuentes' | 'vip' | 'inactivos' | 'custom';
  criterios?: {
    minCompras?: number;
    maxCompras?: number;
    minTotal?: number;
    maxTotal?: number;
    diasInactividad?: number;
    tieneDescuento?: boolean;
  };
}

export default function AdminNotificacionesPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'enviar' | 'historial' | 'plantillas' | 'productos'>('enviar');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedClientes, setSelectedClientes] = useState<string[]>([]);
  const [filtroSegmento, setFiltroSegmento] = useState<string>('todos');
  const [notificationForm, setNotificationForm] = useState({
    tipo: 'promocion' as const,
    titulo: '',
    mensaje: '',
    accion: '',
    descuento: 0,
    productosAplicables: 'todos' as 'todos' | 'categoria' | 'seleccionados',
    categoriasSeleccionadas: [] as string[],
    productosSeleccionados: [] as string[]
  });
  const [sending, setSending] = useState(false);
  const [plantillas, setPlantillas] = useState<NotificationTemplate[]>([
    {
      id: '1',
      nombre: 'Descuento Nuevo Cliente',
      tipo: 'promocion',
      titulo: '¡Bienvenido! {descuento}% de Descuento',
      mensaje: 'Como cliente nuevo, aprovecha tu descuento exclusivo del {descuento}% en tu primera compra.',
      segmento: 'nuevos',
      criterios: { maxCompras: 0 }
    },
    {
      id: '2',
      nombre: 'Oferta Cliente Frecuente',
      tipo: 'promocion',
      titulo: '🌟 Oferta Especial para Ti',
      mensaje: 'Por ser un cliente valioso, te ofrecemos un {descuento}% adicional en tu próxima compra.',
      segmento: 'frecuentes',
      criterios: { minCompras: 3 }
    },
    {
      id: '3',
      nombre: 'Cliente VIP',
      tipo: 'promocion',
      titulo: '👑 Beneficio VIP Exclusivo',
      mensaje: 'Has alcanzado el status VIP. Disfruta de {descuento}% de descuento permanente.',
      segmento: 'vip',
      criterios: { minTotal: 500000 }
    },
    {
      id: '4',
      nombre: 'Reactivación',
      tipo: 'promocion',
      titulo: '¡Te Extrañamos!',
      mensaje: 'Hace tiempo que no nos visitas. Vuelve con un {descuento}% de descuento.',
      segmento: 'inactivos',
      criterios: { diasInactividad: 30 }
    },
    {
      id: '5',
      nombre: 'Nueva Línea de Productos',
      tipo: 'sistema',
      titulo: '🆕 Nuevos Productos Disponibles',
      mensaje: 'Descubre nuestra nueva línea de policarbonatos premium con descuentos de lanzamiento.',
      segmento: 'todos'
    },
    {
      id: '6',
      nombre: 'Despacho Gratis',
      tipo: 'despacho',
      titulo: '🚚 Despacho Gratis Esta Semana',
      mensaje: 'Por tiempo limitado, despacho gratis en compras sobre $100.000',
      segmento: 'todos'
    }
  ]);

  // Simular clientes (en producción vendría de la base de datos)
  useEffect(() => {
    const clientesEjemplo: Cliente[] = [
      {
        id: '1',
        email: 'nuevo@cliente.cl',
        nombre: 'Juan Pérez',
        telefono: '+56912345678',
        tieneDescuento: true,
        porcentajeDescuento: 5,
        comprasRealizadas: 0,
        totalComprado: 0,
        fechaRegistro: new Date('2024-01-20'),
      },
      {
        id: '2',
        email: 'frecuente@cliente.cl',
        nombre: 'María González',
        telefono: '+56987654321',
        tieneDescuento: true,
        porcentajeDescuento: 10,
        comprasRealizadas: 5,
        totalComprado: 450000,
        fechaRegistro: new Date('2023-06-15'),
        ultimaCompra: new Date('2024-01-15')
      },
      {
        id: '3',
        email: 'vip@cliente.cl',
        nombre: 'Carlos Rodríguez',
        telefono: '+56955555555',
        tieneDescuento: true,
        porcentajeDescuento: 15,
        comprasRealizadas: 12,
        totalComprado: 1250000,
        fechaRegistro: new Date('2023-01-10'),
        ultimaCompra: new Date('2024-01-18')
      },
      {
        id: '4',
        email: 'inactivo@cliente.cl',
        nombre: 'Ana Silva',
        telefono: '+56944444444',
        tieneDescuento: false,
        porcentajeDescuento: 0,
        comprasRealizadas: 2,
        totalComprado: 180000,
        fechaRegistro: new Date('2023-09-20'),
        ultimaCompra: new Date('2023-11-15')
      }
    ];
    setClientes(clientesEjemplo);
  }, []);

  // Filtrar clientes según segmento
  const getClientesFiltrados = () => {
    const ahora = new Date();
    
    switch (filtroSegmento) {
      case 'nuevos':
        return clientes.filter(c => c.comprasRealizadas === 0);
      case 'frecuentes':
        return clientes.filter(c => c.comprasRealizadas >= 3);
      case 'vip':
        return clientes.filter(c => c.totalComprado >= 500000);
      case 'inactivos':
        return clientes.filter(c => {
          if (!c.ultimaCompra) return c.comprasRealizadas > 0;
          const diasInactivo = Math.floor((ahora.getTime() - c.ultimaCompra.getTime()) / (1000 * 60 * 60 * 24));
          return diasInactivo > 30;
        });
      case 'con_descuento':
        return clientes.filter(c => c.tieneDescuento);
      case 'todos':
      default:
        return clientes;
    }
  };

  const clientesFiltrados = getClientesFiltrados();

  // Seleccionar todos los clientes del segmento
  const handleSelectAll = () => {
    if (selectedClientes.length === clientesFiltrados.length) {
      setSelectedClientes([]);
    } else {
      setSelectedClientes(clientesFiltrados.map(c => c.id));
    }
  };

  // Usar plantilla
  const usarPlantilla = (plantilla: NotificationTemplate) => {
    setNotificationForm({
      tipo: plantilla.tipo,
      titulo: plantilla.titulo,
      mensaje: plantilla.mensaje,
      accion: plantilla.tipo === 'promocion' ? 'productos' : '',
      descuento: 0,
      productosAplicables: 'todos',
      categoriasSeleccionadas: [],
      productosSeleccionados: []
    });
    setFiltroSegmento(plantilla.segmento);
    setActiveTab('enviar');
  };

  // Enviar notificaciones
  const handleSendNotifications = async () => {
    if (selectedClientes.length === 0) {
      alert('Selecciona al menos un cliente');
      return;
    }

    if (!notificationForm.titulo || !notificationForm.mensaje) {
      alert('Completa el título y mensaje');
      return;
    }

    setSending(true);

    try {
      // Reemplazar variables en el mensaje
      const tituloFinal = notificationForm.titulo.replace('{descuento}', notificationForm.descuento.toString());
      const mensajeFinal = notificationForm.mensaje.replace('{descuento}', notificationForm.descuento.toString());

      // Simular envío (en producción se enviaría a Supabase)
      for (const clienteId of selectedClientes) {
        const cliente = clientes.find(c => c.id === clienteId);
        if (!cliente) continue;

        // Preparar datos de la notificación
        const notificationData = {
          action: notificationForm.accion === 'productos' ? 'go-to-products' : notificationForm.accion,
          discount: notificationForm.descuento,
          applicableProducts: notificationForm.productosAplicables,
          categories: notificationForm.categoriasSeleccionadas,
          specificProducts: notificationForm.productosSeleccionados
        };

        console.log('📧 Enviando notificación a:', cliente.email, {
          tipo: notificationForm.tipo,
          titulo: tituloFinal,
          mensaje: mensajeFinal,
          data: notificationData
        });

        // Aquí se enviaría a Supabase
        // await createNotification(clienteId, notificationForm.tipo, tituloFinal, mensajeFinal, notificationData);
      }

      alert(`✅ Notificaciones enviadas a ${selectedClientes.length} clientes`);
      
      // Limpiar formulario
      setNotificationForm({
        tipo: 'promocion',
        titulo: '',
        mensaje: '',
        accion: '',
        descuento: 0,
        productosAplicables: 'todos',
        categoriasSeleccionadas: [],
        productosSeleccionados: []
      });
      setSelectedClientes([]);
      
    } catch (error) {
      console.error('Error enviando notificaciones:', error);
      alert('Error al enviar notificaciones');
    } finally {
      setSending(false);
    }
  };

  // Verificar si es admin
  const isAdmin = user?.email === 'admin@obraexpress.cl' || user?.email === 'soporte@obraexpress.cl';

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Restringido</h1>
          <p className="text-gray-600">Solo administradores pueden acceder a esta sección.</p>
          <Link href="/" className="mt-4 inline-block bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-600">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Notificaciones</h1>
              <p className="text-gray-600 mt-1">Envía notificaciones personalizadas a tus clientes</p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              ← Volver al Admin
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['enviar', 'productos', 'plantillas', 'historial'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'enviar' ? '📨 Enviar Notificación' : 
                   tab === 'productos' ? '🏷️ Productos con Descuento' :
                   tab === 'plantillas' ? '📋 Plantillas' : 
                   '📊 Historial'}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Contenido según tab activa */}
        {activeTab === 'enviar' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario de notificación */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Crear Notificación</h2>
              
              <div className="space-y-4">
                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Notificación
                  </label>
                  <select
                    value={notificationForm.tipo}
                    onChange={(e) => setNotificationForm({...notificationForm, tipo: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="promocion">🎁 Promoción/Descuento</option>
                    <option value="sistema">📢 Anuncio del Sistema</option>
                    <option value="despacho">🚚 Información de Despacho</option>
                    <option value="compra">🛒 Relacionado a Compras</option>
                  </select>
                </div>

                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={notificationForm.titulo}
                    onChange={(e) => setNotificationForm({...notificationForm, titulo: e.target.value})}
                    placeholder="Ej: ¡Oferta Especial del 20%!"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Usa {'{descuento}'} para insertar el porcentaje</p>
                </div>

                {/* Mensaje */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje
                  </label>
                  <textarea
                    value={notificationForm.mensaje}
                    onChange={(e) => setNotificationForm({...notificationForm, mensaje: e.target.value})}
                    placeholder="Describe la promoción o información..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Variables disponibles: {'{descuento}'}, {'{nombre}'}</p>
                </div>

                {/* Descuento (si es promoción) */}
                {notificationForm.tipo === 'promocion' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porcentaje de Descuento
                    </label>
                    <input
                      type="number"
                      value={notificationForm.descuento}
                      onChange={(e) => setNotificationForm({...notificationForm, descuento: parseInt(e.target.value) || 0})}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                )}

                {/* Productos aplicables (si es promoción) */}
                {notificationForm.tipo === 'promocion' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Productos con descuento
                    </label>
                    <select
                      value={notificationForm.productosAplicables}
                      onChange={(e) => setNotificationForm({...notificationForm, productosAplicables: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <option value="todos">Todos los productos</option>
                      <option value="categoria">Por categoría</option>
                      <option value="seleccionados">Productos específicos</option>
                    </select>
                    
                    {notificationForm.productosAplicables === 'categoria' && (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-gray-600">Selecciona categorías:</p>
                        {['Láminas Alveolares', 'Rollos Compactos', 'Policarbonato Ondulado', 'Accesorios'].map(categoria => (
                          <label key={categoria} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={notificationForm.categoriasSeleccionadas.includes(categoria)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNotificationForm({
                                    ...notificationForm, 
                                    categoriasSeleccionadas: [...notificationForm.categoriasSeleccionadas, categoria]
                                  });
                                } else {
                                  setNotificationForm({
                                    ...notificationForm,
                                    categoriasSeleccionadas: notificationForm.categoriasSeleccionadas.filter(c => c !== categoria)
                                  });
                                }
                              }}
                              className="mr-2 text-yellow-500"
                            />
                            <span className="text-sm">{categoria}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Acción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Acción al hacer clic
                  </label>
                  <select
                    value={notificationForm.accion}
                    onChange={(e) => setNotificationForm({...notificationForm, accion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="">Sin acción</option>
                    <option value="productos">Ir a Productos</option>
                    <option value="ofertas">Ir a Ofertas</option>
                    <option value="perfil">Ir al Perfil</option>
                  </select>
                </div>
              </div>

              {/* Vista previa */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Vista Previa:</h3>
                <div className="bg-white p-3 rounded border border-gray-200">
                  <div className="font-medium text-gray-900">
                    {notificationForm.titulo.replace('{descuento}', notificationForm.descuento.toString()) || 'Título de la notificación'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {notificationForm.mensaje.replace('{descuento}', notificationForm.descuento.toString()) || 'Mensaje de la notificación'}
                  </div>
                </div>
              </div>
            </div>

            {/* Selección de clientes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Destinatarios</h2>
              
              {/* Filtro de segmento */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segmento de Clientes
                </label>
                <select
                  value={filtroSegmento}
                  onChange={(e) => {
                    setFiltroSegmento(e.target.value);
                    setSelectedClientes([]);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="todos">Todos los clientes ({clientes.length})</option>
                  <option value="nuevos">Clientes nuevos (sin compras)</option>
                  <option value="frecuentes">Clientes frecuentes (3+ compras)</option>
                  <option value="vip">Clientes VIP ($500k+)</option>
                  <option value="inactivos">Clientes inactivos (30+ días)</option>
                  <option value="con_descuento">Con descuento activo</option>
                </select>
              </div>

              {/* Estadísticas del segmento */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total en segmento:</span>
                    <span className="ml-2 font-semibold">{clientesFiltrados.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Seleccionados:</span>
                    <span className="ml-2 font-semibold text-yellow-600">{selectedClientes.length}</span>
                  </div>
                </div>
              </div>

              {/* Lista de clientes */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedClientes.length === clientesFiltrados.length && clientesFiltrados.length > 0}
                      onChange={handleSelectAll}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium">Seleccionar todos</span>
                  </label>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {clientesFiltrados.map((cliente) => (
                    <label
                      key={cliente.id}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedClientes.includes(cliente.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClientes([...selectedClientes, cliente.id]);
                          } else {
                            setSelectedClientes(selectedClientes.filter(id => id !== cliente.id));
                          }
                        }}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{cliente.nombre}</div>
                        <div className="text-xs text-gray-600">{cliente.email}</div>
                        <div className="flex gap-2 mt-1">
                          {cliente.comprasRealizadas === 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Nuevo
                            </span>
                          )}
                          {cliente.comprasRealizadas >= 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Frecuente
                            </span>
                          )}
                          {cliente.totalComprado >= 500000 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              VIP
                            </span>
                          )}
                          {cliente.tieneDescuento && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              {cliente.porcentajeDescuento}% OFF
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Botón enviar */}
              <button
                onClick={handleSendNotifications}
                disabled={sending || selectedClientes.length === 0}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                  sending || selectedClientes.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                }`}
              >
                {sending ? 'Enviando...' : `Enviar a ${selectedClientes.length} cliente${selectedClientes.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* Tab de Plantillas */}
        {activeTab === 'plantillas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plantillas.map((plantilla) => (
              <div key={plantilla.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{plantilla.nombre}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    plantilla.tipo === 'promocion' ? 'bg-orange-100 text-orange-800' :
                    plantilla.tipo === 'sistema' ? 'bg-gray-100 text-gray-800' :
                    plantilla.tipo === 'despacho' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {plantilla.tipo}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  <strong>Título:</strong> {plantilla.titulo}
                </div>
                
                <div className="text-sm text-gray-600 mb-3">
                  <strong>Mensaje:</strong> {plantilla.mensaje}
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  <strong>Segmento:</strong> {plantilla.segmento}
                </div>
                
                <button
                  onClick={() => usarPlantilla(plantilla)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Usar Plantilla
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab de Productos */}
        {activeTab === 'productos' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Configurar Productos con Descuento</h2>
              <p className="text-gray-600">Define qué productos son elegibles para descuentos automáticos de notificaciones</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuración de descuentos por categoría */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-800">Descuentos por Categoría</h3>
                
                <div className="space-y-3">
                  {/* Láminas Alveolares */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="font-medium">Láminas Alveolares</span>
                      </label>
                      <span className="text-sm text-gray-500">12 productos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Descuento:</span>
                      <input
                        type="number"
                        defaultValue="5"
                        min="0"
                        max="50"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>

                  {/* Rollos Compactos */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="font-medium">Rollos Compactos</span>
                      </label>
                      <span className="text-sm text-gray-500">8 productos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Descuento:</span>
                      <input
                        type="number"
                        defaultValue="10"
                        min="0"
                        max="50"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>

                  {/* Policarbonato Ondulado */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="font-medium">Policarbonato Ondulado</span>
                      </label>
                      <span className="text-sm text-gray-500">6 productos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Descuento:</span>
                      <input
                        type="number"
                        defaultValue="0"
                        min="0"
                        max="50"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>

                  {/* Accesorios */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="font-medium">Accesorios</span>
                      </label>
                      <span className="text-sm text-gray-500">15 productos</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Descuento:</span>
                      <input
                        type="number"
                        defaultValue="15"
                        min="0"
                        max="50"
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos específicos destacados */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-gray-800">Productos Destacados con Descuento</h3>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700">Productos más vendidos</h4>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {[
                      { nombre: 'Policarbonato Alveolar 6mm Cristal', categoria: 'Láminas Alveolares', descuento: 5, activo: true },
                      { nombre: 'Policarbonato Compacto 3mm Bronce', categoria: 'Rollos Compactos', descuento: 10, activo: true },
                      { nombre: 'Kit de Fijación Completo', categoria: 'Accesorios', descuento: 15, activo: true },
                      { nombre: 'Policarbonato Alveolar 10mm Opal', categoria: 'Láminas Alveolares', descuento: 5, activo: false },
                      { nombre: 'Perfil de Aluminio H', categoria: 'Accesorios', descuento: 15, activo: true },
                      { nombre: 'Policarbonato Ondulado 0.8mm Verde', categoria: 'Ondulado', descuento: 0, activo: false }
                    ].map((producto, index) => (
                      <div key={index} className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{producto.nombre}</div>
                          <div className="text-xs text-gray-500">{producto.categoria}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            producto.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {producto.activo ? `${producto.descuento}% OFF` : 'Sin descuento'}
                          </span>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              defaultChecked={producto.activo}
                              className="text-yellow-500 focus:ring-yellow-500"
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración global */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Configuración Global de Descuentos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración del descuento (días)
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descuento máximo permitido (%)
                  </label>
                  <input
                    type="number"
                    defaultValue="25"
                    min="1"
                    max="50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">Aplicar descuento automáticamente al hacer clic en notificación</span>
                  </label>
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700">Permitir acumulación de descuentos</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-6 flex justify-end space-x-3">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                Restablecer
              </button>
              <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium transition-colors">
                Guardar Configuración
              </button>
            </div>
          </div>
        )}

        {/* Tab de Historial */}
        {activeTab === 'historial' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Historial de Notificaciones</h3>
              <p className="text-sm">El historial de notificaciones enviadas aparecerá aquí</p>
              <p className="text-xs mt-2">Esta función se activará cuando se conecte con la base de datos</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}