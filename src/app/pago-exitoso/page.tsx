"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { NavbarSimple } from '@/components/navbar-simple';

function PagoExitosoContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Obtener detalles de la transacción
      fetch(`/api/payments/transbank/init?token=${token}`)
        .then(res => res.json())
        .then(data => {
          setTransactionDetails(data.reference);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching transaction details:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <NavbarSimple />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {/* Icono de éxito */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-green-900 mb-2">
              ¡Pago Exitoso!
            </h1>
            <p className="text-green-700">
              Su pago ha sido procesado correctamente
            </p>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando detalles...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Detalles de la transacción */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-900 mb-4">Detalles de la Transacción</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">Número de Orden:</span>
                    <div className="text-green-900 font-mono">
                      {transactionDetails?.orderId || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Fecha:</span>
                    <div className="text-green-900">
                      {new Date().toLocaleDateString('es-CL')}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Token:</span>
                    <div className="text-green-900 font-mono text-xs break-all">
                      {token}
                    </div>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Estado:</span>
                    <div className="text-green-900 font-semibold">
                      AUTORIZADO
                    </div>
                  </div>
                </div>
              </div>

              {/* Próximos pasos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-4">Próximos Pasos</h3>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      1
                    </div>
                    <div>
                      <div className="font-medium">Confirmación por Email</div>
                      <div className="text-blue-700">Recibirá un email con la confirmación de pago y detalles de su pedido</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      2
                    </div>
                    <div>
                      <div className="font-medium">Procesamiento del Pedido</div>
                      <div className="text-blue-700">Su pedido será preparado y procesado en 24-48 horas hábiles</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                      3
                    </div>
                    <div>
                      <div className="font-medium">Coordinación de Entrega</div>
                      <div className="text-blue-700">Nuestro equipo se contactará para coordinar la entrega</div>
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
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Imprimir Comprobante
                </button>
                <a
                  href="/"
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                >
                  Volver al Inicio
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PagoExitoso() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando detalles del pago...</p>
          </div>
        </div>
      </div>
    }>
      <PagoExitosoContent />
    </Suspense>
  );
}