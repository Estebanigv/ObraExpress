"use client";

import React from 'react';
import { NavbarSimple } from '@/components/navbar-simple';

export default function PagoRechazado() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
      <NavbarSimple />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {/* Icono de rechazo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-900 mb-2">
              Pago Rechazado
            </h1>
            <p className="text-red-700">
              La transacción no pudo ser procesada
            </p>
          </div>

          <div className="space-y-6">
            {/* Información */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="font-semibold text-red-900 mb-4">¿Por qué fue rechazado?</h3>
              <div className="text-sm text-red-800 space-y-2">
                <p>Su pago fue rechazado. Las causas más comunes son:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Fondos insuficientes en la cuenta</li>
                  <li>Tarjeta bloqueada o vencida</li>
                  <li>Límite de compra excedido</li>
                  <li>Datos incorrectos de la tarjeta</li>
                  <li>Restricciones del banco emisor</li>
                </ul>
              </div>
            </div>

            {/* Recomendaciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Recomendaciones</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Verificar Datos</div>
                    <div className="text-blue-700">Revise que el número de tarjeta, fecha de vencimiento y CVV sean correctos</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Contactar su Banco</div>
                    <div className="text-blue-700">Consulte con su banco sobre posibles restricciones o límites</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Usar Otra Tarjeta</div>
                    <div className="text-blue-700">Intente con una tarjeta diferente si tiene disponible</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    4
                  </div>
                  <div>
                    <div className="font-medium">Transferencia Bancaria</div>
                    <div className="text-blue-700">Considere pagar mediante transferencia bancaria</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Métodos de pago alternativos */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-4">Métodos de Pago Alternativos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="font-medium text-green-900 mb-2">💳 OnePay</div>
                  <div className="text-green-700">Pago con aplicación móvil</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="font-medium text-green-900 mb-2">🏦 Transferencia</div>
                  <div className="text-green-700">Pago por transferencia bancaria</div>
                </div>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-900 mb-3">¿Necesita Ayuda?</h3>
              <div className="text-sm text-yellow-800 space-y-2">
                <div>📧 Email: ventas@obraexpress.cl</div>
                <div>📱 WhatsApp: +56 9 8765 4321</div>
                <div>📞 Teléfono: +56 2 2345 6789</div>
              </div>
              <p className="text-xs text-yellow-700 mt-3">
                Nuestro equipo de soporte puede ayudarle a resolver problemas de pago
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="/"
                className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
              >
                Volver al Inicio
              </a>
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Intentar con Otra Tarjeta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}