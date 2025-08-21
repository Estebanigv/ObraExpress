"use client";

import React from 'react';
import { NavbarSimple } from '@/components/navbar-simple';

export default function PagoCancelado() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <NavbarSimple />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {/* Icono de cancelación */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-orange-900 mb-2">
              Pago Cancelado
            </h1>
            <p className="text-orange-700">
              La transacción fue cancelada por el usuario
            </p>
          </div>

          <div className="space-y-6">
            {/* Información */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <h3 className="font-semibold text-orange-900 mb-4">¿Qué pasó?</h3>
              <div className="text-sm text-orange-800 space-y-2">
                <p>Su pago fue cancelado. Esto puede ocurrir por:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cancelación manual durante el proceso</li>
                  <li>Problemas de conectividad</li>
                  <li>Timeout en la sesión de pago</li>
                </ul>
              </div>
            </div>

            {/* Opciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">Opciones Disponibles</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Intentar Nuevamente</div>
                    <div className="text-blue-700">Puede volver al carrito y procesar el pago nuevamente</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Contactar Soporte</div>
                    <div className="text-blue-700">Si persisten los problemas, contáctenos para asistencia</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Método Alternativo</div>
                    <div className="text-blue-700">Considere usar transferencia bancaria como método de pago</div>
                  </div>
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
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="/"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Volver al Inicio
              </a>
              <button
                onClick={() => window.history.back()}
                className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Intentar Nuevamente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}