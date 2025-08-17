"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { NavbarSimple } from '@/components/navbar-simple';

// Regiones y comunas de Chile (reutilizando la estructura)
const regionesChile = {
  'Región Metropolitana': [
    'Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'Maipú', 'La Florida', 'Peñalolén', 
    'Puente Alto', 'San Bernardo', 'Melipilla', 'Pudahuel', 'Quilicura', 'Renca', 
    'Independencia', 'Recoleta', 'Conchalí', 'Huechuraba', 'Vitacura', 'Lo Barnechea', 
    'La Reina', 'Macul', 'San Joaquín', 'San Miguel', 'San Ramón', 'La Granja', 
    'La Pintana', 'El Bosque', 'Pedro Aguirre Cerda', 'Lo Espejo', 'Estación Central', 
    'Cerrillos', 'Quinta Normal', 'Lo Prado', 'Cerro Navia', 'Colina', 
    'Lampa', 'Tiltil', 'María Pinto', 'Curacaví', 'San Pedro', 
    'Alhué', 'Buin', 'Paine', 'Calera de Tango', 'Pirque', 'San José de Maipo', 
    'Padre Hurtado', 'Peñaflor', 'Talagante', 'El Monte', 'Isla de Maipo'
  ],
  'Región de Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Casablanca', 'San Antonio'],
  'Región del Biobío': ['Concepción', 'Talcahuano', 'Chillán', 'Los Ángeles', 'Coronel', 'San Pedro de la Paz'],
  'Región de la Araucanía': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Nueva Imperial', 'Angol'],
  'Región de Los Lagos': ['Puerto Montt', 'Osorno', 'Castro', 'Ancud', 'Puerto Varas', 'Frutillar'],
  'Región de Antofagasta': ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones', 'San Pedro de Atacama'],
  'Región de Atacama': ['Copiapó', 'Vallenar', 'Chañaral', 'Diego de Almagro', 'Tierra Amarilla'],
  'Región de Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña', 'Monte Patria'],
  'Región del Libertador Bernardo O\'Higgins': ['Rancagua', 'San Fernando', 'Pichilemu', 'Santa Cruz', 'Rengo'],
  'Región del Maule': ['Talca', 'Curicó', 'Linares', 'Cauquenes', 'Constitución', 'Molina'],
  'Región de Ñuble': ['Chillán', 'San Carlos', 'Bulnes', 'Yungay', 'Quirihue'],
  'Región de Los Ríos': ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli', 'Lanco'],
  'Región de Aysén': ['Coyhaique', 'Puerto Aysén', 'Chile Chico', 'Cochrane'],
  'Región de Magallanes': ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Cabo de Hornos'],
  'Región de Arica y Parinacota': ['Arica', 'Putre', 'General Lagos'],
  'Región de Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica']
};

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const [step, setStep] = useState<'info' | 'payment' | 'success'>('info');
  const [processing, setProcessing] = useState(false);

  // Datos del cliente
  const [clientData, setClientData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    region: '',
    comuna: '',
    direccion: '',
    comentarios: ''
  });

  // Datos de pago
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    paymentMethod: 'card' as 'card' | 'transbank'
  });

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const missingFields = [];
    if (!clientData.nombre) missingFields.push('Nombre completo');
    if (!clientData.telefono) missingFields.push('Teléfono');
    if (!clientData.email) missingFields.push('Email');
    if (!clientData.region) missingFields.push('Región');
    if (!clientData.comuna) missingFields.push('Comuna');
    if (!clientData.direccion) missingFields.push('Dirección');
    
    if (missingFields.length > 0) {
      alert(`Por favor completa los siguientes campos:\n\n• ${missingFields.join('\n• ')}`);
      return;
    }
    
    setStep('payment');
  };

  const processPayment = async () => {
    setProcessing(true);
    
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      setStep('success');
      
      // Limpiar carrito después del pago exitoso
      setTimeout(() => {
        clearCart();
      }, 5000);
    } else {
      alert('Error en el procesamiento del pago. Por favor, intenta nuevamente.');
    }
    
    setProcessing(false);
  };

  const validatePayment = () => {
    if (!clientData.email || !/\S+@\S+\.\S+/.test(clientData.email)) {
      alert('Por favor ingresa un email válido');
      return false;
    }
    
    if (paymentData.paymentMethod === 'card') {
      const { cardNumber, cardHolder, expiryDate, cvv } = paymentData;
      
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        alert('Por favor ingresa un número de tarjeta válido');
        return false;
      }
      
      if (!cardHolder.trim()) {
        alert('Por favor ingresa el nombre del titular');
        return false;
      }
      
      if (!expiryDate || !/\d{2}\/\d{2}/.test(expiryDate)) {
        alert('Por favor ingresa una fecha de vencimiento válida (MM/AA)');
        return false;
      }
      
      if (!cvv || cvv.length < 3) {
        alert('Por favor ingresa un CVV válido');
        return false;
      }
    }
    
    return true;
  };

  const handlePayment = () => {
    if (validatePayment()) {
      processPayment();
    }
  };

  if (state.items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5M7 13h10m0 0l1.5 6H7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Carrito Vacío</h1>
            <p className="text-gray-600 mb-6">No tienes productos en tu carrito para procesar.</p>
            <Link
              href="/"
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors inline-block"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarSimple />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Finalizar Compra</h1>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className={`flex items-center space-x-2 ${step === 'info' ? 'text-yellow-600' : step === 'payment' || step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'info' ? 'bg-yellow-500 text-black' : step === 'payment' || step === 'success' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>1</div>
                <span>Información</span>
              </div>
              <div className="w-12 h-px bg-gray-300"></div>
              <div className={`flex items-center space-x-2 ${step === 'payment' ? 'text-yellow-600' : step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-yellow-500 text-black' : step === 'success' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>2</div>
                <span>Pago</span>
              </div>
              <div className="w-12 h-px bg-gray-300"></div>
              <div className={`flex items-center space-x-2 ${step === 'success' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'success' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>3</div>
                <span>Confirmación</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Resumen del pedido (siempre visible) */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 border border-gray-100">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H17M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6M7 13H5M17 13h2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Tu Pedido</h3>
                    <p className="text-sm text-gray-500">{state.items.length} producto{state.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {state.items.map((item) => (
                    <div key={item.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <div className="flex space-x-3">
                        {/* Imagen del producto */}
                        <div className="w-16 h-16 bg-white rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-200">
                          {item.imagen ? (
                            <img 
                              src={item.imagen} 
                              alt={item.nombre}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling!.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`text-gray-400 text-center ${item.imagen ? 'hidden' : ''}`}>
                            <div className="text-2xl">📦</div>
                          </div>
                        </div>
                        
                        {/* Información del producto */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">{item.nombre}</h4>
                          {item.descripcion && (
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.descripcion}</p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                                  {item.cantidad} uds
                                </span>
                              </div>
                              <div className="mt-1">
                                ${item.precioUnitario.toLocaleString()} c/u
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-900">
                                ${item.total.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          {/* Información adicional según tipo */}
                          {item.tipo === 'coordinacion' && (
                            <div className="mt-2 text-xs text-blue-600 space-y-1">
                              <p>📅 {item.fechaDespacho?.toLocaleDateString('es-CL')}</p>
                              <p>📍 {item.region}, {item.comuna}</p>
                            </div>
                          )}
                          
                          {item.especificaciones && item.especificaciones.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              <p className="line-clamp-1">{item.especificaciones.slice(0, 2).join(' • ')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Resumen de totales */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-800">${state.items.reduce((sum, item) => sum + item.total, 0).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Envío:</span>
                    <span className="font-medium text-green-600">Gratis</span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-800">Total a Pagar:</span>
                      <span className="text-xl font-bold text-yellow-600">${state.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                {/* Badges de seguridad */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-600">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Pago Seguro</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Entrega Rápida</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-2">
              
              {step === 'info' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Información de Entrega</h2>
                      <p className="text-sm text-gray-600">¿Dónde quieres recibir tu pedido?</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleClientSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={clientData.nombre}
                          onChange={(e) => setClientData({...clientData, nombre: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono *
                        </label>
                        <input
                          type="tel"
                          required
                          value={clientData.telefono}
                          onChange={(e) => setClientData({...clientData, telefono: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          placeholder="+56 9 1234 5678"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={clientData.email}
                        onChange={(e) => setClientData({...clientData, email: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Región *
                        </label>
                        <select
                          required
                          value={clientData.region}
                          onChange={(e) => {
                            setClientData({...clientData, region: e.target.value, comuna: ''});
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        >
                          <option value="">-- Selecciona tu región --</option>
                          {Object.keys(regionesChile).map((region) => (
                            <option key={region} value={region}>
                              {region}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comuna *
                        </label>
                        <select
                          required
                          value={clientData.comuna}
                          onChange={(e) => setClientData({...clientData, comuna: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          disabled={!clientData.region}
                        >
                          <option value="">
                            {clientData.region ? '-- Selecciona tu comuna --' : '-- Primero selecciona una región --'}
                          </option>
                          {clientData.region && regionesChile[clientData.region as keyof typeof regionesChile]?.map((comuna) => (
                            <option key={comuna} value={comuna}>
                              {comuna}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección específica *
                      </label>
                      <textarea
                        required
                        value={clientData.direccion}
                        onChange={(e) => setClientData({...clientData, direccion: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        rows={3}
                        placeholder="Calle, número, depto/casa, referencias adicionales"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comentarios adicionales
                      </label>
                      <textarea
                        value={clientData.comentarios}
                        onChange={(e) => setClientData({...clientData, comentarios: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        rows={2}
                        placeholder="Horario preferido, instrucciones especiales, etc."
                      />
                    </div>

                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-medium transition-colors"
                      >
                        Continuar al Pago
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === 'payment' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Método de Pago</h2>
                      <p className="text-sm text-gray-600">Elige cómo prefieres pagar</p>
                    </div>
                  </div>
                  
                  {/* Similar al sistema de pago del coordinador-despacho */}
                  <div className="space-y-6">
                    {/* Selección de método */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        onClick={() => setPaymentData({...paymentData, paymentMethod: 'card'})}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentData.paymentMethod === 'card' 
                            ? 'border-yellow-500 bg-yellow-50' 
                            : 'border-gray-200 bg-white hover:border-yellow-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            paymentData.paymentMethod === 'card' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                          }`}>
                            {paymentData.paymentMethod === 'card' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-800">Tarjeta de Crédito/Débito</h5>
                            <p className="text-sm text-gray-600">Pago directo con tu tarjeta</p>
                          </div>
                        </div>
                      </div>

                      <div 
                        onClick={() => setPaymentData({...paymentData, paymentMethod: 'transbank'})}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          paymentData.paymentMethod === 'transbank' 
                            ? 'border-yellow-500 bg-yellow-50' 
                            : 'border-gray-200 bg-white hover:border-yellow-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            paymentData.paymentMethod === 'transbank' ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'
                          }`}>
                            {paymentData.paymentMethod === 'transbank' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1"></div>}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-800">Transbank Webpay Plus</h5>
                            <p className="text-sm text-gray-600">Pago seguro a través de Transbank</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Campos de pago */}
                    {paymentData.paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Número de Tarjeta *
                          </label>
                          <input
                            type="text"
                            value={paymentData.cardNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                              if (value.replace(/\s/g, '').length <= 16) {
                                setPaymentData({...paymentData, cardNumber: value});
                              }
                            }}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre del Titular *
                          </label>
                          <input
                            type="text"
                            value={paymentData.cardHolder}
                            onChange={(e) => setPaymentData({...paymentData, cardHolder: e.target.value.toUpperCase()})}
                            placeholder="JUAN PÉREZ"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha de Vencimiento *
                            </label>
                            <input
                              type="text"
                              value={paymentData.expiryDate}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                let formatted = value;
                                if (value.length >= 2) {
                                  formatted = value.slice(0, 2) + '/' + value.slice(2, 4);
                                }
                                if (formatted.length <= 5) {
                                  setPaymentData({...paymentData, expiryDate: formatted});
                                }
                              }}
                              placeholder="MM/AA"
                              maxLength={5}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CVV *
                            </label>
                            <input
                              type="text"
                              value={paymentData.cvv}
                              onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 4) {
                                  setPaymentData({...paymentData, cvv: value});
                                }
                              }}
                              placeholder="123"
                              maxLength={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-4 pt-6">
                      <button
                        onClick={() => setStep('info')}
                        className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Volver
                      </button>
                      <button
                        onClick={handlePayment}
                        disabled={processing}
                        className={`flex-2 ${processing ? 'bg-gray-400' : 'bg-yellow-500 hover:bg-yellow-600'} text-black px-8 py-3 rounded-lg transition-colors font-medium flex items-center justify-center space-x-2`}
                      >
                        {processing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                            <span>Procesando...</span>
                          </>
                        ) : (
                          <span>Pagar ${state.total.toLocaleString()}</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Pago Exitoso! 🎉</h2>
                  <p className="text-gray-600 mb-8">Tu pedido ha sido procesado correctamente. Pronto nos contactaremos contigo para coordinar la entrega.</p>
                  
                  {/* Resumen de la compra */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de tu compra</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Número de orden:</span>
                        <span className="font-mono font-semibold text-gray-900">#PM-{Date.now().toString().slice(-6)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total pagado:</span>
                        <span className="font-bold text-green-600">${state.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cliente:</span>
                        <span className="font-medium text-gray-900">{clientData.nombre}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">{clientData.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Entrega en:</span>
                        <span className="font-medium text-gray-900">{clientData.comuna}, {clientData.region}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Próximos pasos */}
                  <div className="bg-blue-50 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4">¿Qué sigue ahora?</h3>
                    <div className="space-y-3 text-left">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-800 text-sm font-bold">1</span>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">Confirmación por email</p>
                          <p className="text-sm text-blue-600">Recibirás un email con los detalles de tu pedido</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-800 text-sm font-bold">2</span>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">Contacto telefónico</p>
                          <p className="text-sm text-blue-600">Te llamaremos para coordinar la entrega</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-blue-800 text-sm font-bold">3</span>
                        </div>
                        <div>
                          <p className="font-medium text-blue-800">Entrega</p>
                          <p className="text-sm text-blue-600">Recibirás tus productos en la dirección indicada</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Link
                      href="/"
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl inline-block"
                    >
                      Volver al Inicio
                    </Link>
                    <Link
                      href="/productos"
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-xl font-medium transition-colors inline-block"
                    >
                      Seguir Comprando
                    </Link>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}