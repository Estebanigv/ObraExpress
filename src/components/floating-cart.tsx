"use client";

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function FloatingCart() {
  const { state, toggleCart, removeItem, updateQuantity } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  console.log('🛒 FloatingCart render - items:', state.items.length, 'isOpen:', state.isOpen);
  
  // Calcular totales con descuento de usuario
  const subtotal = state.items.reduce((sum, item) => sum + item.total, 0);
  const descuentoPorcentaje = user?.porcentajeDescuento || 0;
  const descuentoMonto = subtotal * (descuentoPorcentaje / 100);
  const total = subtotal - descuentoMonto;

  const handleCheckout = () => {
    router.push('/checkout');
    toggleCart();
  };

  return (
    <>
      {/* Botón flotante del carrito - SIEMPRE VISIBLE */}
      <div 
        className="fixed top-32 right-6 z-[999999] bg-white hover:bg-gray-50 rounded-full p-3 shadow-2xl cursor-pointer border-2 border-yellow-400"
        onClick={toggleCart}
        style={{ 
          zIndex: 999999,
          position: 'fixed',
          top: '8rem',
          right: '1.5rem',
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '50%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          cursor: 'pointer',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #eab308'
        }}
      >
        <Image
          src="/img/ico-paso5-carrocompra.png"
          alt="Carrito de compras"
          width={32}
          height={32}
          className="object-contain"
        />
        {state.items.length > 0 && (
          <span 
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '12px',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            {state.items.reduce((sum, item) => sum + item.cantidad, 0)}
          </span>
        )}
      </div>

      {/* Panel del carrito cuando hay items */}
      {state.isOpen && state.items.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleCart}></div>
          
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
            <div className="flex flex-col h-full">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Carrito de Compras</h2>
                <button
                  onClick={toggleCart}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.nombre}</h3>
                        <p className="text-sm text-gray-600">{item.descripcion}</p>
                        {item.tipo === 'coordinacion' && (
                          <div className="mt-2 text-xs text-blue-600">
                            <p>📅 Fecha: {item.fechaDespacho?.toLocaleDateString('es-CL')}</p>
                            <p>📍 {item.region}, {item.comuna}</p>
                          </div>
                        )}
                        {item.tipoProyecto && (
                          <div className="mt-2 text-xs text-purple-600">
                            <p>🏗️ Proyecto: {item.tipoProyecto}</p>
                            <p>👤 Cliente: {item.nombreCliente}</p>
                          </div>
                        )}
                        {item.especificaciones && (
                          <div className="mt-2 text-xs text-gray-500">
                            <p>Specs: {item.especificaciones.slice(0, 2).join(', ')}</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="w-12 text-center font-medium">{item.cantidad}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">${item.precioUnitario.toLocaleString()} c/u</p>
                        <p className="font-bold text-gray-800">${item.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-medium text-gray-800">${subtotal.toLocaleString()}</span>
                </div>
                
                {/* Descuento */}
                {user?.tieneDescuento && descuentoMonto > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Descuento ({descuentoPorcentaje}%):
                    </span>
                    <span className="font-medium">-${descuentoMonto.toLocaleString()}</span>
                  </div>
                )}
                
                {/* Total */}
                <div className="flex justify-between items-center border-t pt-4">
                  <span className="text-lg font-bold text-gray-800">Total:</span>
                  <span className="text-xl font-bold text-yellow-600">${total.toLocaleString()}</span>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  Proceder al Pago
                </button>
                
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                  <span className="flex items-center">
                    <svg className="h-4 w-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Compra Segura
                  </span>
                  <span className="flex items-center">
                    <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Entrega Rápida
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel del carrito vacío */}
      {state.isOpen && state.items.length === 0 && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleCart}></div>
          
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
            <div className="flex flex-col h-full">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Carrito de Compras</h2>
                <button
                  onClick={toggleCart}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Empty cart content */}
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H17M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6M7 13H5M17 13h2"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Tu carrito está vacío</h3>
                  <p className="text-gray-600 mb-6">Agrega productos para comenzar tu compra</p>
                  <button
                    onClick={() => {
                      toggleCart();
                      router.push('/productos');
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                  >
                    Ver Productos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}