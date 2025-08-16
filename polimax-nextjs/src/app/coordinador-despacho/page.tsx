"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';

export default function CoordinadorDespachoPage() {
  const router = useRouter();
  const { addItem } = useCart();
  
  const [formData, setFormData] = useState({
    nombreCliente: '',
    telefonoCliente: '',
    emailCliente: '',
    region: '',
    comuna: '',
    direccion: '',
    fechaDespacho: '',
    comentarios: '',
    tipoProducto: '',
    cantidad: 1,
    descripcionProducto: ''
  });

  const regiones = [
    'Región Metropolitana',
    'Región de Valparaíso',
    'Región del Libertador Bernardo O\'Higgins',
    'Región del Maule',
    'Región del Biobío',
    'Región de La Araucanía',
    'Región de Los Ríos',
    'Región de Los Lagos',
    'Región de Aysén',
    'Región de Magallanes',
    'Región de Tarapacá',
    'Región de Antofagasta',
    'Región de Atacama',
    'Región de Coquimbo',
    'Región de Arica y Parinacota'
  ];

  const tiposProducto = [
    'Policarbonato Alveolar',
    'Policarbonato Ondulado', 
    'Policarbonato Compacto',
    'Greca Industrial',
    'Rollos de Policarbonato',
    'Perfiles y Accesorios',
    'Pinturas y Selladores'
  ];

  // Función para obtener el estado de cada día
  const getDateStatus = (date: Date): 'available' | 'past' | 'too-soon' => {
    const today = new Date();
    const daysDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'past';
    if (daysDiff < 2) return 'too-soon';
    return 'available';
  };

  // Obtener próximo jueves disponible
  const getNextAvailableThursday = (): Date => {
    const today = new Date();
    const daysUntilThursday = (4 - today.getDay() + 7) % 7;
    const nextThursday = new Date(today);
    nextThursday.setDate(today.getDate() + daysUntilThursday);
    
    // Si el jueves está dentro de los próximos 2 días, pasar al siguiente
    if (getDateStatus(nextThursday) !== 'available') {
      nextThursday.setDate(nextThursday.getDate() + 7);
    }
    
    return nextThursday;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear item para el carrito
    const cartItem = {
      id: `coordinacion-${Date.now()}`,
      tipo: 'coordinacion' as const,
      nombre: `Coordinación de Despacho - ${formData.tipoProducto}`,
      descripcion: formData.descripcionProducto,
      cantidad: formData.cantidad,
      precioUnitario: 0, // Coordinación sin costo
      total: 0,
      fechaDespacho: new Date(formData.fechaDespacho),
      region: formData.region,
      comuna: formData.comuna,
      direccion: formData.direccion,
      comentarios: formData.comentarios,
      nombreCliente: formData.nombreCliente,
      telefonoCliente: formData.telefonoCliente
    };
    
    addItem(cartItem);
    router.push('/');
  };

  const nextThursday = getNextAvailableThursday();

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center bg-white rounded-full p-4 shadow-xl border-3 border-yellow-400 w-20 h-20 mx-auto">
              <img 
                src="/assets/images/isotipo.png" 
                alt="POLIMAX" 
                className="h-10 w-10 object-contain" 
              />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coordinador de Despacho</h1>
          <p className="text-gray-600">Para clientes que ya tienen claro su producto y necesitan coordinar la entrega</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Cliente */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Información del Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombreCliente}
                    onChange={(e) => setFormData({ ...formData, nombreCliente: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefonoCliente}
                    onChange={(e) => setFormData({ ...formData, telefonoCliente: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.emailCliente}
                    onChange={(e) => setFormData({ ...formData, emailCliente: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Información del Producto */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Producto a Despachar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Producto *
                  </label>
                  <select
                    value={formData.tipoProducto}
                    onChange={(e) => setFormData({ ...formData, tipoProducto: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="">Selecciona un producto</option>
                    {tiposProducto.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción del Producto *
                  </label>
                  <textarea
                    value={formData.descripcionProducto}
                    onChange={(e) => setFormData({ ...formData, descripcionProducto: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    rows={3}
                    placeholder="Describe las especificaciones del producto (medidas, color, espesor, etc.)"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Información de Despacho */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Dirección de Despacho
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Región *
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  >
                    <option value="">Selecciona una región</option>
                    {regiones.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Comuna *
                  </label>
                  <input
                    type="text"
                    value={formData.comuna}
                    onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección Completa *
                  </label>
                  <input
                    type="text"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Calle, número, departamento, etc."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Fecha de Despacho */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                Fecha de Despacho
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">
                    Los despachos se realizan solo los jueves de 9:00 AM a 6:00 PM
                  </span>
                </div>
                <p className="text-green-700 text-sm mt-2">
                  Se requiere al menos 2 días de anticipación para coordinar el despacho
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha de Despacho *
                </label>
                <input
                  type="date"
                  value={formData.fechaDespacho}
                  onChange={(e) => setFormData({ ...formData, fechaDespacho: e.target.value })}
                  min={nextThursday.toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  Próximo jueves disponible: {nextThursday.toLocaleDateString('es-CL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Comentarios */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comentarios Adicionales
              </label>
              <textarea
                value={formData.comentarios}
                onChange={(e) => setFormData({ ...formData, comentarios: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                rows={3}
                placeholder="Instrucciones especiales para el despacho, horarios preferidos, etc."
              />
            </div>

            {/* Botones */}
            <div className="flex space-x-4 pt-6">
              <Link
                href="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium transition-colors text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                Coordinar Despacho
              </button>
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-3">¿Necesitas ayuda con tu producto?</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• Si no tienes claro qué producto necesitas, usa nuestro <Link href="/" className="underline font-medium">formulario de asesoría</Link></p>
            <p>• Para cotizaciones detalladas con múltiples productos, visita nuestro <Link href="/cotizador-detallado" className="underline font-medium">cotizador detallado</Link></p>
            <p>• Para consultas técnicas, contáctanos por WhatsApp: +56 9 6334-8909</p>
          </div>
        </div>
      </div>
    </div>
  );
}