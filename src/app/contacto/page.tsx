"use client";

import React, { useState } from "react";
import { NavbarSimple } from "@/components/navbar-simple";
import { Chatbot } from "@/components/chatbot";
import { navigate } from "@/lib/client-utils";

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    mensaje: '',
    tipoConsulta: 'cotizacion'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Crear mensaje para WhatsApp
    const mensaje = `Hola! Tengo una consulta desde la página web:

*Tipo:* ${formData.tipoConsulta === 'cotizacion' ? 'Cotización' : 
              formData.tipoConsulta === 'soporte' ? 'Soporte Técnico' : 'Información General'}
*Nombre:* ${formData.nombre}
*Email:* ${formData.email}
*Teléfono:* ${formData.telefono}
*Empresa:* ${formData.empresa || 'No especificada'}

*Mensaje:*
${formData.mensaje}

Desde: Página web POLIMAX - Formulario de Contacto`;

    const whatsappUrl = `https://wa.me/56933334444?text=${encodeURIComponent(mensaje)}`;
    navigate.openInNewTab(whatsappUrl);

    // Limpiar formulario
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      empresa: '',
      mensaje: '',
      tipoConsulta: 'cotizacion'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <NavbarSimple />
      
      {/* Hero Section */}
      <section 
        className="min-h-screen flex items-center text-white relative pt-32 pb-20 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 50%, rgba(0, 0, 0, 0.7) 100%), url('/assets/images/bannerA.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              Contacto
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
              Estamos aquí para ayudarte con tu proyecto
            </p>
          </div>
        </div>
      </section>

      {/* Información de Contacto */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-6 text-gray-800">¿Cómo puedes contactarnos?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Nuestro equipo está listo para atenderte y brindarte la mejor asesoría para tu proyecto
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {/* WhatsApp */}
              <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-green-200">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.594z"/>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">WhatsApp</h3>
                <p className="text-gray-600 mb-4">Respuesta inmediata</p>
                <a 
                  href="https://wa.me/56933334444" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-500 text-white px-6 py-3 rounded-full font-bold hover:bg-green-600 transition-colors duration-300"
                >
                  +56 9 3333 4444
                </a>
              </div>

              {/* Email */}
              <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-blue-200">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Email</h3>
                <p className="text-gray-600 mb-4">Consultas detalladas</p>
                <a 
                  href="mailto:contacto@polimax.cl"
                  className="inline-block bg-blue-500 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors duration-300"
                >
                  contacto@polimax.cl
                </a>
              </div>

              {/* Teléfono */}
              <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:shadow-lg transition-all duration-300 border border-purple-200">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Teléfono</h3>
                <p className="text-gray-600 mb-4">Llamada directa</p>
                <a 
                  href="tel:+56933334444"
                  className="inline-block bg-purple-500 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-600 transition-colors duration-300"
                >
                  +56 9 3333 4444
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulario de Contacto */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-6 text-gray-800">Envíanos tu consulta</h2>
              <p className="text-lg text-gray-600">
                Completa el formulario y nos contactaremos contigo a la brevedad
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      placeholder="+56 9 XXXX XXXX"
                    />
                  </div>

                  <div>
                    <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      id="empresa"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tipoConsulta" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Consulta *
                  </label>
                  <select
                    id="tipoConsulta"
                    name="tipoConsulta"
                    value={formData.tipoConsulta}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                  >
                    <option value="cotizacion">Solicitar Cotización</option>
                    <option value="soporte">Soporte Técnico</option>
                    <option value="informacion">Información General</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 resize-vertical"
                    placeholder="Describe tu consulta o proyecto con el mayor detalle posible..."
                  />
                </div>

                <div className="text-center pt-6">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Enviar Consulta
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    Te redirigiremos a WhatsApp para finalizar el envío
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Horarios de Atención */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">Horarios de Atención</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-800 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 text-blue-400">Lunes a Viernes</h3>
                <p className="text-xl text-gray-300">09:00 - 18:00 hrs</p>
              </div>
              <div className="bg-gray-800 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold mb-4 text-green-400">Sábados</h3>
                <p className="text-xl text-gray-300">09:00 - 14:00 hrs</p>
              </div>
            </div>
            <p className="text-gray-400 mt-8">
              Para consultas fuera del horario de atención, envíanos un WhatsApp y te responderemos a primera hora.
            </p>
          </div>
        </div>
      </section>

      <Chatbot />
    </main>
  );
}