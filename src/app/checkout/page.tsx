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
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen del Pedido</h3>
                
                <div className="space-y-4 mb-6">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{item.nombre}</h4>
                        <p className="text-sm text-gray-600">{item.descripcion}</p>
                        <p className="text-sm text-gray-500">Cantidad: {item.cantidad}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-gray-800">${item.total.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total:</span>
                    <span className="text-xl font-bold text-yellow-600">${state.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="lg:col-span-2">
              
              {step === 'info' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Información de Entrega</h2>
                  
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
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Método de Pago</h2>
                  
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
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">¡Pago Exitoso!</h2>
                  <p className="text-gray-600 mb-8">Tu pedido ha sido procesado correctamente. Pronto nos contactaremos contigo.</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="text-sm text-gray-500">
                      <p><strong>Total pagado:</strong> ${state.total.toLocaleString()}</p>
                      <p><strong>Cliente:</strong> {clientData.nombre}</p>
                      <p><strong>Email:</strong> {clientData.email}</p>
                    </div>
                  </div>
                  
                  <Link
                    href="/"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-medium transition-colors inline-block"
                  >
                    Volver al Inicio
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}