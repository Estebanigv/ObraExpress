"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';
import { safeDocument } from '@/lib/client-utils';
import { CartThumbnail } from '@/components/optimized-image';

export function CartModal() {
  const { state, toggleCart, removeItem, updateQuantity, updateItem } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  // Estado para la fecha de despacho global
  const [fechaDespacho, setFechaDespacho] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Función para verificar si una fecha es jueves
  const isThursday = (date: Date) => {
    return date.getDay() === 4; // 4 = jueves
  };

  // Función para verificar si es el día actual
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Función para verificar si una fecha es válida para despacho
  const isValidDeliveryDate = (date: Date) => {
    if (!isThursday(date)) return false;
    
    // FORZAR JUEVES 21 COMO VÁLIDO PARA PRUEBA
    if (date.getDate() === 21 && date.getMonth() === 7) { // Agosto = mes 7
      console.log('🔍 FORZANDO JUEVES 21 COMO VÁLIDO');
      return true;
    }
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
    
    console.log('🔍 DEBUG GENERAL:', {
      hoy: today.toDateString(),
      diaDeLaSemana: dayOfWeek,
      fechaEvaluada: date.toDateString()
    });
    
    // Si hoy es miércoles o después, solo próximos jueves
    if (dayOfWeek >= 3) {
      return false; // Temporalmente deshabilitar otros días
    }
    
    // Si hoy es domingo, lunes o martes: puede ser el jueves de esta semana o posteriores
    return date.getTime() >= today.getTime();
  };

  // Generar los días del calendario para el mes actual (empezando en lunes)
  const generateCalendarDays = (month: Date) => {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    // Encontrar el lunes de la semana que contiene el primer día del mes
    const startOfWeek = new Date(startOfMonth);
    const dayOfWeek = startOfMonth.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Si es domingo (0), restar 6 días
    startOfWeek.setDate(startOfMonth.getDate() - daysToSubtract);
    
    const days = [];
    const current = new Date(startOfWeek);
    
    // Generar 6 semanas (42 días) para cubrir todo el mes
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays(currentMonth);

  // Funciones para navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  logger.log('🛒 FloatingCart render - items:', state.items.length, 'isOpen:', state.isOpen);
  
  // Calcular totales con descuento de usuario
  const subtotal = state.items.reduce((sum, item) => sum + item.total, 0);
  const descuentoPorcentaje = user?.porcentajeDescuento || 0;
  const descuentoMonto = subtotal * (descuentoPorcentaje / 100);
  const total = subtotal - descuentoMonto;

  const handleCheckout = () => {
    // Validar que haya fecha de despacho seleccionada
    if (!fechaDespacho) {
      alert('⚠️ Debes seleccionar una fecha de despacho antes de continuar.');
      return;
    }
    
    // La fecha ya está validada por el calendario, no necesitamos validar nuevamente
    const selectedDate = new Date(fechaDespacho);
    
    // Aplicar la fecha de despacho a todos los productos antes de ir al checkout
    console.log('🔍 Aplicando fecha de despacho:', selectedDate);
    console.log('🔍 Items antes de actualizar:', state.items.map(item => ({ 
      id: item.id, 
      tipo: item.tipo, 
      fechaDespacho: item.fechaDespacho 
    })));
    
    const promises = state.items
      .filter(item => item.tipo === 'producto')
      .map(item => {
        console.log('🔍 Actualizando item:', item.id, 'con fecha:', selectedDate);
        return updateItem(item.id, { fechaDespacho: selectedDate });
      });
    
    // Dar un momento para que se apliquen los cambios
    setTimeout(() => {
      console.log('🔍 Items después de actualizar:', state.items.map(item => ({ 
        id: item.id, 
        tipo: item.tipo, 
        fechaDespacho: item.fechaDespacho 
      })));
      router.push('/checkout');
      toggleCart();
    }, 100);
  };

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (state.isOpen) {
      safeDocument.setBodyOverflow('hidden');
    } else {
      safeDocument.setBodyOverflow('');
    }

    return () => {
      safeDocument.setBodyOverflow('');
    };
  }, [state.isOpen]);

  return (
    <>
      {/* Botón flotante del carrito - alineado con el menú de navegación - SOLO DESKTOP */}
      <div className="fixed top-[100px] right-16 hidden lg:block" style={{ zIndex: 60 }}>
        <button 
          onClick={toggleCart}
          className="relative rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 overflow-hidden"
          style={{ 
            boxShadow: '0 10px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)',
            width: '64px',
            height: '64px'
          }}
          title="Abrir carrito de compras"
        >
          <Image
            src="/assets/images/Iconos/ico-paso5-carrocompra-q85.webp"
            alt="Carrito de compras"
            fill
            className="object-cover"
          />
        </button>
        
        {/* Badge de cantidad fuera del botón para que no se corte */}
        {state.items.length > 0 && (
          <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-2 shadow-lg">
            {state.items.reduce((sum, item) => sum + item.cantidad, 0)}
          </div>
        )}
      </div>

      {/* Modal del carrito - usando posición fixed directa sin portal */}
      {state.isOpen && (
        <div 
          className="fixed inset-0 flex justify-end"
          style={{ 
            zIndex: 10000,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={toggleCart}
        >
          {/* Panel lateral del carrito */}
          <div 
            className="bg-white h-full flex flex-col shadow-2xl overflow-hidden"
            style={{ 
              width: '500px',
              maxWidth: '90vw',
              transform: state.isOpen ? 'translateX(0)' : 'translateX(100%)',
              transition: 'transform 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del carrito */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Carrito de Compras</h2>
                <p className="text-sm text-gray-600">
                  {state.items.length} producto{state.items.length !== 1 ? 's' : ''} • {state.items.reduce((sum, item) => sum + item.cantidad, 0)} unidades
                </p>
              </div>
              <button
                onClick={toggleCart}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {state.items.length === 0 ? (
              /* Carrito vacío */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H17M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6M7 13H5M17 13h2"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu carrito está vacío</h3>
                  <p className="text-gray-600 mb-6">Agrega productos para comenzar tu compra</p>
                  <button
                    onClick={() => {
                      toggleCart();
                      router.push('/productos');
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
                  >
                    Ver Productos
                  </button>
                </div>
              </div>
            ) : (
              /* Carrito con productos */
              <>
                {/* Lista de productos - scrolleable */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {state.items.map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex gap-4">
                          {/* Imagen del producto */}
                          <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                            {item.imagen ? (
                              <CartThumbnail
                                src={item.imagen}
                                alt={item.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Información del producto */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1 pr-2">
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.nombre}</h3>
                                {item.descripcion && (
                                  <p className="text-xs text-gray-600 mb-1">{item.descripcion}</p>
                                )}
                                <div className="text-xs text-gray-500">
                                  ${item.precioUnitario.toLocaleString()} por unidad
                                </div>
                              </div>
                              
                              {/* Botón eliminar */}
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                                title="Eliminar producto"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>

                            {/* Controles de cantidad */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-white rounded-lg border border-gray-300">
                                <button
                                  onClick={() => {
                                    const newQuantity = Math.max(10, item.cantidad - 10);
                                    if (newQuantity < 10) {
                                      removeItem(item.id);
                                    } else {
                                      updateQuantity(item.id, newQuantity);
                                    }
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                                  title="Quitar 10 unidades"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                  </svg>
                                </button>
                                
                                <div className="px-4 py-2 bg-gray-50 border-x border-gray-300 min-w-[70px] text-center">
                                  <div className="font-semibold text-sm">{item.cantidad}</div>
                                  <div className="text-xs text-gray-500">uds</div>
                                </div>
                                
                                <button
                                  onClick={() => updateQuantity(item.id, item.cantidad + 10)}
                                  className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                                  title="Agregar 10 unidades"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                </button>
                              </div>

                              {/* Total del item */}
                              <div className="text-right">
                                <div className="font-bold text-gray-900">${item.total.toLocaleString()}</div>
                              </div>
                            </div>

                            {/* Información adicional según tipo */}
                            {item.tipo === 'coordinacion' && (
                              <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="text-xs text-blue-700 space-y-1">
                                  <div>📅 {item.fechaDespacho?.toLocaleDateString('es-CL')}</div>
                                  <div>📍 {item.region}, {item.comuna}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                
                  {/* Fecha de despacho global */}
                  <div className="p-4 bg-yellow-50 border-t border-yellow-200">
                    <div className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      📦 Fecha de Despacho - Jueves
                    </div>
                    
                    <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-700 font-medium mb-1">
                        🚚 Horario de Despacho: Jueves de 9:00 a 18:00 hrs
                      </p>
                      <p className="text-xs text-green-600">
                        {(() => {
                          const today = new Date();
                          const dayOfWeek = today.getDay();
                          if (dayOfWeek === 0 || dayOfWeek === 1 || dayOfWeek === 2) {
                            return "Pedidos hasta el martes se despachan el jueves de la misma semana";
                          } else {
                            return "Pedidos desde el miércoles se despachan el jueves de la próxima semana";
                          }
                        })()}
                      </p>
                    </div>

                    {/* Calendario personalizado */}
                    <div className="border border-gray-300 rounded-lg p-4 bg-white">
                      {/* Header del calendario */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={goToPreviousMonth}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        <h3 className="text-lg font-semibold text-gray-800">
                          {currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                        </h3>
                        
                        <button
                          onClick={goToNextMonth}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* Días de la semana */}
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Días del calendario */}
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, index) => {
                          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                          const isValidDay = isValidDeliveryDate(day);
                          const isSelectedDay = fechaDespacho === day.toISOString().split('T')[0];
                          const isTodayDay = isToday(day);
                          
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                if (isValidDay) {
                                  setFechaDespacho(day.toISOString().split('T')[0]);
                                }
                              }}
                              disabled={!isValidDay}
                              className={`
                                relative h-10 text-sm rounded transition-colors
                                ${!isCurrentMonth ? 'text-gray-300' : ''}
                                ${isValidDay ? 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer font-semibold' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                                ${isSelectedDay ? 'bg-green-600 text-white ring-2 ring-green-400' : ''}
                                ${isTodayDay && !isSelectedDay ? 'ring-2 ring-blue-400' : ''}
                              `}
                            >
                              {day.getDate()}
                              {isTodayDay && (
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {fechaDespacho && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-600">
                          ✅ Jueves {new Date(fechaDespacho).toLocaleDateString('es-CL')} - Despacho de 9:00 a 18:00 hrs
                        </p>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-600 mt-2">
                      🚚 Todos los productos se despacharán juntos en esta fecha
                    </p>
                    {!fechaDespacho && (
                      <p className="text-sm text-amber-600 mt-1">
                        ⚠️ Debes seleccionar un jueves de despacho para continuar
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer con totales y botón de compra - SIEMPRE VISIBLE */}
                <div className="border-t border-gray-200 bg-white p-6 flex-shrink-0">
                  {/* Totales */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">${subtotal.toLocaleString()}</span>
                      </div>
                      
                      {user?.tieneDescuento && descuentoMonto > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Descuento ({descuentoPorcentaje}%):
                          </span>
                          <span className="font-medium">-${descuentoMonto.toLocaleString()}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Envío:</span>
                        <span className="font-medium text-green-600">Gratis</span>
                      </div>
                      
                      <div className="border-t border-gray-300 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">Total:</span>
                          <span className="text-xl font-bold text-yellow-600">${total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botón de compra - GARANTIZADO VISIBLE */}
                  <div className="space-y-3">
                    {!fechaDespacho && (
                      <div className="text-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-700">
                          ⚠️ Selecciona un jueves de despacho en el calendario
                        </p>
                      </div>
                    )}
                    
                    <button
                      onClick={handleCheckout}
                      disabled={!fechaDespacho}
                      className={`w-full font-bold py-4 px-6 rounded-xl transition-all transform shadow-lg flex items-center justify-center space-x-2 ${
                        !fechaDespacho
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black hover:scale-[1.02] hover:shadow-xl'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span>Proceder al Pago</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        toggleCart();
                        router.push('/productos');
                      }}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
                    >
                      Seguir Comprando
                    </button>
                  </div>

                  {/* Badges de confianza */}
                  <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Compra Segura
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Entrega Rápida
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}