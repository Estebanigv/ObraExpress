"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { NavbarSimple } from '@/components/navbar-simple';
import { supabase } from '@/lib/supabase';

function ConfirmarDescargaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [catalogos, setCatalogos] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<{nombre: string, email: string} | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        // Verificar el token en Supabase
        const { data, error } = await supabase
          .from('descargas_catalogos')
          .select('*')
          .eq('download_token', token)
          .eq('email_sent', true)
          .single();

        if (error || !data) {
          setStatus('error');
          return;
        }

        // Verificar si el token no ha expirado (24 horas)
        const tokenDate = new Date(data.created_at);
        const now = new Date();
        const diffHours = (now.getTime() - tokenDate.getTime()) / (1000 * 60 * 60);
        
        if (diffHours > 24) {
          setStatus('expired');
          return;
        }

        // Si ya fue verificado previamente, proceder directamente a la descarga
        if (data.email_verified) {
          setStatus('success');
          setCatalogos(data.catalogos_seleccionados || []);
          setUserInfo({ nombre: data.nombre, email: data.email });
          // Iniciar descarga automáticamente
          triggerDownloads(data.catalogos_seleccionados || []);
          return;
        }

        // Marcar email como verificado
        const { error: updateError } = await supabase
          .from('descargas_catalogos')
          .update({ email_verified: true })
          .eq('download_token', token);

        if (updateError) {
          console.error('Error actualizando verificación:', updateError);
          setStatus('error');
          return;
        }

        // Configurar estado de éxito
        setStatus('success');
        setCatalogos(data.catalogos_seleccionados || []);
        setUserInfo({ nombre: data.nombre, email: data.email });
        
        // Iniciar descarga automáticamente
        triggerDownloads(data.catalogos_seleccionados || []);

      } catch (error) {
        console.error('Error verificando token:', error);
        setStatus('error');
      }
    };

    verifyToken();
  }, [searchParams]);

  const triggerDownloads = (catalogosIds: string[]) => {
    // Mapeo de IDs a archivos
    const catalogoFiles = {
      'laminas-alveolares': 'catalogo-laminas-alveolares.pdf',
      'rollos-compactos': 'catalogo-rollos-compactos.pdf', 
      'accesorios': 'catalogo-accesorios.pdf',
      'sistemas-estructurales': 'catalogo-sistemas-estructurales.pdf',
      'catalogo-general': 'catalogo-general-polimax.pdf'
    };

    // Simular descarga de cada catálogo
    catalogosIds.forEach((catalogoId, index) => {
      setTimeout(() => {
        const fileName = catalogoFiles[catalogoId as keyof typeof catalogoFiles] || `${catalogoId}.pdf`;
        const link = document.createElement('a');
        link.href = `/assets/catalogos/${fileName}`;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 1000); // Espaciar las descargas por 1 segundo
    });
  };

  const handleManualDownload = () => {
    if (catalogos.length > 0) {
      triggerDownloads(catalogos);
    }
  };

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Verificando tu solicitud...
                </h1>
                <p className="text-gray-600">
                  Por favor espera mientras verificamos tu email de confirmación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Enlace no válido
                </h1>
                <p className="text-gray-600 mb-6">
                  El enlace de confirmación no es válido o ha ocurrido un error. 
                  Por favor, solicita nuevamente la descarga de catálogos.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'expired') {
    return (
      <main className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Enlace expirado
                </h1>
                <p className="text-gray-600 mb-6">
                  Este enlace de confirmación ha expirado. Los enlaces son válidos por 24 horas.
                  Por favor, solicita nuevamente la descarga de catálogos.
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Solicitar nueva descarga
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'success') {
    return (
      <main className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  ¡Email verificado exitosamente!
                </h1>
                <p className="text-gray-600 mb-6">
                  Hola <strong>{userInfo?.nombre}</strong>, tu email ha sido verificado correctamente.
                  Las descargas de tus catálogos han comenzado automáticamente.
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Catálogos descargándose:</h3>
                  <div className="space-y-1">
                    {catalogos.map((catalogoId) => {
                      const nombres = {
                        'laminas-alveolares': 'Láminas Alveolares',
                        'rollos-compactos': 'Rollos Compactos',
                        'accesorios': 'Accesorios Profesionales',
                        'sistemas-estructurales': 'Sistemas Estructurales',
                        'catalogo-general': 'Catálogo General'
                      };
                      return (
                        <div key={catalogoId} className="text-blue-700 text-sm">
                          • {nombres[catalogoId as keyof typeof nombres] || catalogoId}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleManualDownload}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Descargar nuevamente
                  </button>
                  <button
                    onClick={() => router.push('/productos')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Ver productos
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-6">
                  Si las descargas no comenzaron automáticamente, haz clic en "Descargar nuevamente"
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return null;
}

export default function ConfirmarDescargaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando enlace...</p>
          </div>
        </div>
      </div>
    }>
      <ConfirmarDescargaContent />
    </Suspense>
  );
}