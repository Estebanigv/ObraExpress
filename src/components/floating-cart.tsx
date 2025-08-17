"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

export function CartModal() {
  const { state, toggleCart, removeItem, updateQuantity } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  logger.log('🛒 FloatingCart render - items:', state.items.length, 'isOpen:', state.isOpen);
  
  // Calcular totales con descuento de usuario
  const subtotal = state.items.reduce((sum, item) => sum + item.total, 0);
  const descuentoPorcentaje = user?.porcentajeDescuento || 0;
  const descuentoMonto = subtotal * (descuentoPorcentaje / 100);
  const total = subtotal - descuentoMonto;

  const handleCheckout = () => {
    router.push('/checkout');
    toggleCart();
  };

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (state.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [state.isOpen]);

  return (
    <>
      {/* Botón flotante del carrito - como respaldo en esquina superior derecha */}
      <button 
        onClick={toggleCart}
        className="fixed top-32 right-6 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110"
        style={{ 
          zIndex: 60,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)' 
        }}
        title="Abrir carrito de compras"
      >
        <div className="relative">
          <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H17M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6M7 13H5M17 13h2" />
          </svg>
          
          {/* Badge de cantidad */}
          {state.items.length > 0 && (
            <div className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full min-w-[24px] h-6 flex items-center justify-center px-2 shadow-lg animate-pulse">
              {state.items.reduce((sum, item) => sum + item.cantidad, 0)}
            </div>
          )}
        </div>
      </button>

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
                              <Image
                                src={item.imagen}
                                alt={item.nombre}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
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
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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