"use client";

import React, { useState } from "react";

interface CatalogoDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  nombre: string;
  email: string;
  empresa: string;
  catalogos: string[];
  aceptaTerminos: boolean;
}

const catalogosDisponibles = [
  {
    id: "laminas-alveolares",
    nombre: "Láminas Alveolares",
    descripcion: "Catálogo completo de láminas alveolares de policarbonato",
    icon: "📄"
  },
  {
    id: "rollos-compactos", 
    nombre: "Rollos Compactos",
    descripcion: "Especificaciones técnicas de rollos compactos",
    icon: "🔄"
  },
  {
    id: "accesorios",
    nombre: "Accesorios Profesionales",
    descripcion: "Perfiles, tornillería y accesorios de instalación",
    icon: "🔧"
  },
  {
    id: "sistemas-estructurales",
    nombre: "Sistemas Estructurales", 
    descripcion: "Estructuras de soporte y sistemas de montaje",
    icon: "🏗️"
  },
  {
    id: "catalogo-general",
    nombre: "Catálogo General",
    descripcion: "Catálogo completo con todos nuestros productos",
    icon: "📚"
  }
];

export function CatalogoDownloadModal({ isOpen, onClose }: CatalogoDownloadModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    email: "",
    empresa: "",
    catalogos: [],
    aceptaTerminos: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleCatalogoToggle = (catalogoId: string) => {
    setFormData(prev => ({
      ...prev,
      catalogos: prev.catalogos.includes(catalogoId)
        ? prev.catalogos.filter(id => id !== catalogoId)
        : [...prev.catalogos, catalogoId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío de datos (aquí integrarías con tu backend/CRM)
    try {
      console.log("Datos del lead:", formData);
      
      // Aquí podrías enviar a tu CRM, base de datos, etc.
      // await sendLeadData(formData);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      
      // Después de 2 segundos, iniciar las descargas
      setTimeout(() => {
        formData.catalogos.forEach(catalogoId => {
          const url = `/assets/catalogos/${catalogoId}.pdf`;
          window.open(url, '_blank');
        });
        
        // Cerrar modal después de 3 segundos
        setTimeout(() => {
          onClose();
          setSubmitted(false);
          setFormData({ nombre: "", email: "", empresa: "", catalogos: [], aceptaTerminos: false });
        }, 3000);
      }, 2000);

    } catch (error) {
      console.error("Error al enviar datos:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.nombre && formData.email && formData.empresa && formData.catalogos.length > 0 && formData.aceptaTerminos;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-blue-50 to-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Descarga Catálogos POLIMAX
              </h2>
              <p className="text-gray-600 text-sm">
                Completa tus datos y selecciona los catálogos que necesitas
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {submitted ? (
          /* Success State */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">¡Gracias por tu interés!</h3>
              <p className="text-gray-600 mb-4">
                Tus catálogos se están descargando automáticamente.
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Form Content */}
            <div className="flex-1 overflow-hidden">
              <form onSubmit={handleSubmit} className="h-full flex flex-col">
                
                {/* Form Body - Two columns layout */}
                <div className="flex-1 px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                  
                  {/* Left Column - Datos Personales */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-2">*</span>
                      Datos Obligatorios
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Corporativo *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="tu@empresa.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa / Organización *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.empresa}
                        onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Nombre de tu empresa"
                      />
                    </div>

                    {/* Términos */}
                    <div className="flex items-start space-x-2 mt-4">
                      <input 
                        type="checkbox" 
                        required 
                        checked={formData.aceptaTerminos}
                        onChange={(e) => setFormData(prev => ({ ...prev, aceptaTerminos: e.target.checked }))}
                        className="mt-1" 
                      />
                      <p className="text-xs text-gray-600">
                        Acepto recibir información comercial de POLIMAX *
                      </p>
                    </div>
                  </div>

                  {/* Right Column - Selección de Catálogos */}
                  <div className="space-y-3 flex flex-col min-h-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-2">*</span>
                      Selecciona Catálogos
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-2 flex-1 overflow-y-auto max-h-[300px]">
                      {catalogosDisponibles.map((catalogo) => (
                        <div
                          key={catalogo.id}
                          onClick={() => handleCatalogoToggle(catalogo.id)}
                          className={`p-2.5 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${
                            formData.catalogos.includes(catalogo.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-lg">{catalogo.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-gray-900 text-sm">{catalogo.nombre}</h4>
                                {formData.catalogos.includes(catalogo.id) && (
                                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{catalogo.descripcion}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {formData.catalogos.length > 0 && (
                      <div className="p-2 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">
                          ✓ {formData.catalogos.length} catálogo{formData.catalogos.length > 1 ? 's' : ''} seleccionado{formData.catalogos.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Footer - Fixed */}
                <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                        isFormValid && !isSubmitting
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Procesando...</span>
                        </div>
                      ) : (
                        'Descargar Catálogos'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}