"use client";

import React from 'react';
import { NavbarSimple } from '@/components/navbar-simple';

export default function PagoError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      <NavbarSimple />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {/* Icono de error */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Error en el Pago
            </h1>
            <p className="text-gray-700">
              Ocurrió un error inesperado durante el procesamiento
            </p>
          </div>

          <div className="space-y-6">
            {/* Información del error */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">¿Qué ocurrió?</h3>
              <div className="text-sm text-gray-800 space-y-2">
                <p>Se produjo un error técnico durante el procesamiento de su pago. Esto puede deberse a:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Problemas temporales de conectividad</li>
                  <li>Mantenimiento en los sistemas de pago</li>
                  <li>Error en la comunicación con el banco</li>
                  <li>Timeout en la sesión de pago</li>
                </ul>
              </div>
            </div>

            {/* Qué hacer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4">¿Qué puede hacer?</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-medium">Esperar unos minutos</div>
                    <div className="text-blue-700">Los problemas técnicos suelen resolverse rápidamente</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-medium">Intentar nuevamente</div>
                    <div className="text-blue-700">Vuelva al carrito y procese el pago otra vez</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-medium">Usar otro método</div>
                    <div className="text-blue-700">Considere usar transferencia bancaria como alternativa</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    4
                  </div>
                  <div>
                    <div className="font-medium">Contactar Soporte</div>
                    <div className="text-blue-700">Si persiste el problema, contáctenos para ayuda técnica</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información técnica */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-900 mb-3">Información Técnica</h3>
              <div className="text-sm text-yellow-800 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Código de Error:</span>
                    <div className="font-mono text-xs">PAYMENT_ERROR_001</div>
                  </div>
                  <div>
                    <span className="font-medium">Timestamp:</span>
                    <div className="font-mono text-xs">{new Date().toLocaleString()}</div>
                  </div>
                </div>
                <p className="text-xs text-yellow-700 mt-3">
                  Proporcione esta información al contactar soporte técnico
                </p>
              </div>
            </div>

            {/* Información de contacto */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-3">Contacto de Emergencia</h3>
              <div className="text-sm text-green-800 space-y-2">
                <div>📧 Email: soporte@obraexpress.cl</div>
                <div>📱 WhatsApp: +56 9 8765 4321</div>
                <div>📞 Teléfono: +56 2 2345 6789</div>
                <div>⏰ Horario: Lun-Vie 9:00-18:00</div>
              </div>
              <div className="bg-white rounded p-3 mt-3">
                <div className="text-xs text-green-700">
                  <strong>Soporte 24/7:</strong> Para emergencias de pago, contáctenos por WhatsApp
                </div>
              </div>
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
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
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