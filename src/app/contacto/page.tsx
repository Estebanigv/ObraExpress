"use client";

import React, { useState } from "react";
import { NavbarSimple } from "@/components/navbar-simple";
import { Chatbot } from "@/components/chatbot";
import { navigate } from "@/lib/client-utils";
import { supabase } from "@/lib/supabase";

export default function Contacto() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    empresa: '',
    rut: '',
    cargo: '',
    region: '',
    comuna: '',
    direccion: '',
    tipoContacto: 'cliente',
    tipoConsulta: 'cotizacion',
    prioridad: 'normal',
    mensaje: '',
    presupuesto: '',
    tiempoProyecto: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Regiones y comunas de Chile
  const regionesChile = {
    'Región Metropolitana': ['Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'Maipú', 'La Florida'],
    'Región de Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Casablanca'],
    'Región del Biobío': ['Concepción', 'Talcahuano', 'Chillán', 'Los Ángeles', 'Coronel'],
    'Región de la Araucanía': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Nueva Imperial'],
    'Región de Los Lagos': ['Puerto Montt', 'Osorno', 'Castro', 'Ancud', 'Puerto Varas'],
    'Región de Antofagasta': ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones'],
    'Región de Atacama': ['Copiapó', 'Vallenar', 'Chañaral', 'Diego de Almagro'],
    'Región de Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña'],
    'Región del Libertador Bernardo O\'Higgins': ['Rancagua', 'San Fernando', 'Pichilemu', 'Santa Cruz'],
    'Región del Maule': ['Talca', 'Curicó', 'Linares', 'Cauquenes', 'Constitución'],
    'Región de Los Ríos': ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli'],
    'Región de Aysén': ['Coyhaique', 'Puerto Aysén', 'Chile Chico', 'Cochrane'],
    'Región de Magallanes': ['Punta Arenas', 'Puerto Natales', 'Porvenir'],
    'Región de Arica y Parinacota': ['Arica', 'Putre'],
    'Región de Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte']
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'Nombre es requerido';
    if (!formData.email.trim()) newErrors.email = 'Email es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.telefono.trim()) newErrors.telefono = 'Teléfono es requerido';
    if (!formData.mensaje.trim()) newErrors.mensaje = 'Mensaje es requerido';
    
    // Empresa es requerida para proveedores y distribuidores
    if ((formData.tipoContacto === 'proveedor' || formData.tipoContacto === 'distribuidor') && !formData.empresa.trim()) {
      newErrors.empresa = `Empresa es requerida para ${formData.tipoContacto}s`;
    }
    
    // RUT es requerido para proveedores y distribuidores
    if ((formData.tipoContacto === 'proveedor' || formData.tipoContacto === 'distribuidor') && !formData.rut.trim()) {
      newErrors.rut = `RUT de empresa es requerido para ${formData.tipoContacto}s`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Mapear los valores del form a los tipos de la base de datos
      const tipoConsultaMapping: Record<string, 'cotizacion' | 'soporte' | 'reclamo' | 'sugerencia'> = {
        'cotizacion': 'cotizacion',
        'soporte': 'soporte',
        'producto-especifico': 'soporte',
        'reclamo': 'reclamo',
        'informacion': 'sugerencia',
        'proveedor-insumos': 'sugerencia',
        'proveedor-factura': 'soporte',
        'proveedor-partnership': 'sugerencia',
        'proveedor-rut': 'sugerencia',
        'distribucion': 'sugerencia',
        'distribuidor-regional': 'sugerencia',
        'distribuidor-partnership': 'sugerencia',
        'distribuidor-territorial': 'sugerencia'
      };

      const prioridadMapping: Record<string, 'normal' | 'alta' | 'urgente'> = {
        'baja': 'normal',
        'normal': 'normal',
        'alta': 'alta',
        'urgente': 'urgente'
      };

      // Guardar en Supabase
      const { data, error } = await supabase
        .from('contactos')
        .insert({
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          empresa: formData.empresa || null,
          rut: formData.rut || null,
          cargo: formData.cargo || null,
          region: formData.region || null,
          comuna: formData.comuna || null,
          direccion: formData.direccion || null,
          tipo_contacto: formData.tipoContacto as 'cliente' | 'proveedor' | 'distribuidor',
          tipo_consulta: tipoConsultaMapping[formData.tipoConsulta] || 'sugerencia',
          prioridad: prioridadMapping[formData.prioridad] || 'normal',
          mensaje: formData.mensaje,
          presupuesto: formData.presupuesto || null,
          tiempo_proyecto: formData.tiempoProyecto || null,
          estado: 'pendiente'
        });

      if (error) {
        console.error('Error guardando contacto:', error);
        // Continuar con el email aunque falle Supabase
      }

      // Crear mensaje detallado para email
      const tipoContactoLabels = {
        'cliente': 'Cliente',
        'proveedor': 'Proveedor de Insumos',
        'distribuidor': 'Posible Distribuidor'
      };

      const tipoConsultaLabels = {
        // Cliente
        'cotizacion': 'Solicitar Cotización',
        'soporte': 'Problemas con Despacho/Soporte',
        'producto-especifico': 'Producto Específico no Encontrado',
        'reclamo': 'Reclamo o Problema',
        'informacion': 'Información General',
        // Proveedor
        'proveedor-insumos': 'Oferta de Productos/Servicios',
        'proveedor-factura': 'Consulta sobre Facturación',
        'proveedor-partnership': 'Propuesta de Partnership',
        'proveedor-rut': 'Información Empresarial/RUT',
        // Distribuidor
        'distribucion': 'Oportunidad de Distribución',
        'distribuidor-regional': 'Distribución Regional',
        'distribuidor-partnership': 'Partnership Comercial',
        'distribuidor-territorial': 'Distribución Territorial'
      };

      const prioridadLabels = {
        'baja': '🟢 Normal',
        'normal': '🟡 Medio',
        'alta': '🟠 Alto',
        'urgente': '🔴 URGENTE'
      };

      let mensaje = `🏢 *CONTACTO DESDE WEB POLIMAX*

👤 *DATOS DEL CONTACTO:*
• Nombre: ${formData.nombre}
• Email: ${formData.email}
• Teléfono: ${formData.telefono}
• Tipo: ${tipoContactoLabels[formData.tipoContacto as keyof typeof tipoContactoLabels]}`;

      if (formData.empresa) mensaje += `\n• Empresa: ${formData.empresa}`;
      if (formData.rut) mensaje += `\n• RUT: ${formData.rut}`;
      if (formData.cargo) mensaje += `\n• Cargo: ${formData.cargo}`;
      if (formData.region) mensaje += `\n• Ubicación: ${formData.comuna}, ${formData.region}`;
      if (formData.direccion) mensaje += `\n• Dirección: ${formData.direccion}`;

      mensaje += `

📋 *CONSULTA:*
• Tipo: ${tipoConsultaLabels[formData.tipoConsulta as keyof typeof tipoConsultaLabels]}
• Prioridad: ${prioridadLabels[formData.prioridad as keyof typeof prioridadLabels]}`;

      if (formData.presupuesto) mensaje += `\n• Presupuesto: ${formData.presupuesto}`;
      if (formData.tiempoProyecto) mensaje += `\n• Tiempo del proyecto: ${formData.tiempoProyecto}`;

      mensaje += `

💬 *MENSAJE:*
${formData.mensaje}

🌐 *Enviado desde:* Formulario web POLIMAX`;

      // Crear mailto con el mensaje
      const subject = `Nueva consulta de ${tipoContactoLabels[formData.tipoContacto as keyof typeof tipoContactoLabels]} - ${formData.nombre}`;
      const emailBody = mensaje.replace(/\*/g, '').replace(/📋|👤|💬|🌐|🟢|🟡|🟠|🔴/g, '');
      const mailtoUrl = `mailto:contacto@polimax.cl?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      navigate.openInNewTab(mailtoUrl);

      // Mostrar mensaje de éxito
      setShowSuccess(true);
      
      // Limpiar formulario después de 2 segundos
      setTimeout(() => {
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          empresa: '',
          rut: '',
          cargo: '',
          region: '',
          comuna: '',
          direccion: '',
          tipoContacto: 'cliente',
          tipoConsulta: 'cotizacion',
          prioridad: 'normal',
          mensaje: '',
          presupuesto: '',
          tiempoProyecto: ''
        });
        setShowSuccess(false);
        setIsSubmitting(false);
      }, 3000);

    } catch (error) {
      console.error('Error en el envío:', error);
      setIsSubmitting(false);
    }
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
      
      {/* Hero Section con Formulario Overlay */}
      <section 
        className="pt-56 pb-20 relative overflow-hidden min-h-screen"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.3) 100%), url('/assets/images/DespachoA-q82.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Texto introductorio */}
            <div className="text-center mb-8">
              <p className="text-xl md:text-2xl mb-8 text-white leading-relaxed max-w-2xl mx-auto font-medium drop-shadow-lg">
                Estamos aquí para ayudarte con tu proyecto. Completa el formulario y nos contactaremos contigo a la brevedad.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm mb-12">
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800 font-medium">Respuesta rápida</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800 font-medium">Información segura</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md">
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-800 font-medium">Atención personalizada</span>
                </div>
              </div>
            </div>

            {/* Formulario de Contacto Overlay */}
            <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12 border border-white/30">
              {showSuccess && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">¡Consulta enviada!</h3>
                      <p className="text-green-700">Se ha abierto tu cliente de email. Responderemos pronto.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Tipo de Contacto */}
                <div className="bg-yellow-50/80 p-6 rounded-xl border border-yellow-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    ¿Quién eres?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'cliente', label: 'Cliente', desc: 'Venta y post-venta', icon: '🏢' },
                      { value: 'proveedor', label: 'Proveedor', desc: 'Ofrecer productos/servicios', icon: '🚚' },
                      { value: 'distribuidor', label: 'Distribuidor', desc: 'Partner comercial', icon: '🤝' }
                    ].map((tipo) => (
                      <label key={tipo.value} className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                        formData.tipoContacto === tipo.value 
                          ? 'border-yellow-500 bg-yellow-100 shadow-md' 
                          : 'border-yellow-200 hover:border-yellow-300 bg-white/50'
                      }`}>
                        <input
                          type="radio"
                          name="tipoContacto"
                          value={tipo.value}
                          checked={formData.tipoContacto === tipo.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className="text-2xl mb-2">{tipo.icon}</div>
                          <div className="font-semibold text-gray-800">{tipo.label}</div>
                          <div className="text-xs text-gray-600 mt-1">{tipo.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Información Personal */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {formData.tipoContacto === 'cliente' ? 'Información de Contacto' : 
                     formData.tipoContacto === 'proveedor' ? 'Información de la Empresa Proveedora' :
                     'Información del Distribuidor'}
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95 ${
                          errors.nombre ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="Tu nombre completo"
                      />
                      {errors.nombre && <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                          errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="tu@email.com"
                      />
                      {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95 ${
                          errors.telefono ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="+56 9 XXXX XXXX"
                      />
                      {errors.telefono && <p className="text-red-600 text-sm mt-1">{errors.telefono}</p>}
                    </div>

                    <div>
                      <label htmlFor="empresa" className="block text-sm font-semibold text-gray-700 mb-2">
                        {formData.tipoContacto === 'cliente' ? 'Empresa (opcional)' :
                         formData.tipoContacto === 'proveedor' ? 'Empresa *' :
                         'Empresa/Organización *'}
                      </label>
                      <input
                        type="text"
                        id="empresa"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95 ${
                          errors.empresa ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder={formData.tipoContacto === 'cliente' ? 'Nombre de tu empresa (opcional)' :
                                   formData.tipoContacto === 'proveedor' ? 'Razón social de la empresa' :
                                   'Nombre de la distribuidora'}
                      />
                      {errors.empresa && <p className="text-red-600 text-sm mt-1">{errors.empresa}</p>}
                    </div>
                  </div>

                  {/* Campo RUT para proveedores y distribuidores */}
                  {(formData.tipoContacto === 'proveedor' || formData.tipoContacto === 'distribuidor') && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="rut" className="block text-sm font-semibold text-gray-700 mb-2">
                          RUT de la Empresa *
                        </label>
                        <input
                          type="text"
                          id="rut"
                          name="rut"
                          value={formData.rut}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95 ${
                            errors.rut ? 'border-red-400 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="12.345.678-9"
                        />
                        {errors.rut && <p className="text-red-600 text-sm mt-1">{errors.rut}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="cargo" className="block text-sm font-semibold text-gray-700 mb-2">
                          {formData.tipoContacto === 'cliente' ? 'Cargo/Posición (opcional)' :
                           formData.tipoContacto === 'proveedor' ? 'Cargo en la Empresa' :
                           'Cargo/Función'}
                        </label>
                        <input
                          type="text"
                          id="cargo"
                          name="cargo"
                          value={formData.cargo}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95"
                          placeholder={formData.tipoContacto === 'cliente' ? 'Ej: Arquitecto, Ingeniero, Propietario' :
                                     formData.tipoContacto === 'proveedor' ? 'Ej: Gerente Comercial, Representante' :
                                     'Ej: Gerente Regional, Director Comercial'}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {(formData.tipoContacto === 'cliente') && (
                      <div>
                        <label htmlFor="cargo" className="block text-sm font-semibold text-gray-700 mb-2">
                          {formData.tipoContacto === 'cliente' ? 'Cargo/Posición (opcional)' :
                           formData.tipoContacto === 'proveedor' ? 'Cargo en la Empresa' :
                           'Cargo/Función'}
                        </label>
                        <input
                          type="text"
                          id="cargo"
                          name="cargo"
                          value={formData.cargo}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95"
                          placeholder={formData.tipoContacto === 'cliente' ? 'Ej: Arquitecto, Ingeniero, Propietario' :
                                     formData.tipoContacto === 'proveedor' ? 'Ej: Gerente Comercial, Representante' :
                                     'Ej: Gerente Regional, Director Comercial'}
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="region" className="block text-sm font-semibold text-gray-700 mb-2">
                        Región
                      </label>
                      <select
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95"
                      >
                        <option value="">Selecciona una región</option>
                        {Object.keys(regionesChile).map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {formData.region && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="comuna" className="block text-sm font-semibold text-gray-700 mb-2">
                          Comuna
                        </label>
                        <select
                          id="comuna"
                          name="comuna"
                          value={formData.comuna}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95"
                        >
                          <option value="">Selecciona una comuna</option>
                          {regionesChile[formData.region as keyof typeof regionesChile]?.map(comuna => (
                            <option key={comuna} value={comuna}>{comuna}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="direccion" className="block text-sm font-semibold text-gray-700 mb-2">
                          Dirección (opcional)
                        </label>
                        <input
                          type="text"
                          id="direccion"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95"
                          placeholder="Dirección completa"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Detalles de la Consulta */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formData.tipoContacto === 'cliente' ? 'Detalles de tu Consulta' :
                     formData.tipoContacto === 'proveedor' ? 'Información de tu Propuesta' :
                     'Información de Distribución'}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="tipoConsulta" className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de Consulta *
                      </label>
                      <select
                        id="tipoConsulta"
                        name="tipoConsulta"
                        value={formData.tipoConsulta}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95"
                      >
                        {formData.tipoContacto === 'cliente' && [
                          <option key="cotizacion" value="cotizacion">💰 Solicitar Cotización</option>,
                          <option key="soporte" value="soporte">🚛 Problemas con Despacho/Soporte</option>,
                          <option key="producto-especifico" value="producto-especifico">🔍 Producto Específico no Encontrado</option>,
                          <option key="reclamo" value="reclamo">⚠️ Reclamo o Problema</option>,
                          <option key="informacion" value="informacion">ℹ️ Información General</option>
                        ]}
                        {formData.tipoContacto === 'proveedor' && [
                          <option key="proveedor-insumos" value="proveedor-insumos">📦 Oferta de Productos/Servicios</option>,
                          <option key="proveedor-factura" value="proveedor-factura">🧾 Consulta sobre Facturación</option>,
                          <option key="proveedor-partnership" value="proveedor-partnership">🤝 Propuesta de Partnership</option>,
                          <option key="proveedor-rut" value="proveedor-rut">🏢 Información Empresarial/RUT</option>
                        ]}
                        {formData.tipoContacto === 'distribuidor' && [
                          <option key="distribucion" value="distribucion">🤝 Oportunidad de Distribución</option>,
                          <option key="distribuidor-regional" value="distribuidor-regional">🌎 Distribución Regional</option>,
                          <option key="distribuidor-partnership" value="distribuidor-partnership">💼 Partnership Comercial</option>,
                          <option key="distribuidor-territorial" value="distribuidor-territorial">📍 Distribución Territorial</option>
                        ]}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="prioridad" className="block text-sm font-semibold text-gray-700 mb-2">
                        Prioridad
                      </label>
                      <select
                        id="prioridad"
                        name="prioridad"
                        value={formData.prioridad}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95"
                      >
                        <option value="baja">🟢 Normal</option>
                        <option value="normal">🟡 Medio</option>
                        <option value="alta">🟠 Alto</option>
                        <option value="urgente">🔴 URGENTE</option>
                      </select>
                    </div>
                  </div>

                  {(formData.tipoConsulta === 'cotizacion' || formData.tipoConsulta === 'producto-especifico') && (
                    <div className="grid md:grid-cols-2 gap-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <div>
                        <label htmlFor="presupuesto" className="block text-sm font-semibold text-gray-700 mb-2">
                          Presupuesto Aproximado
                        </label>
                        <select
                          id="presupuesto"
                          name="presupuesto"
                          value={formData.presupuesto}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95"
                        >
                          <option value="">Selecciona un rango</option>
                          <option value="Menos de $100.000">Menos de $100.000</option>
                          <option value="$100.000 - $500.000">$100.000 - $500.000</option>
                          <option value="$500.000 - $1.000.000">$500.000 - $1.000.000</option>
                          <option value="$1.000.000 - $5.000.000">$1.000.000 - $5.000.000</option>
                          <option value="Más de $5.000.000">Más de $5.000.000</option>
                          <option value="A convenir">A convenir</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="tiempoProyecto" className="block text-sm font-semibold text-gray-700 mb-2">
                          Tiempo del Proyecto
                        </label>
                        <select
                          id="tiempoProyecto"
                          name="tiempoProyecto"
                          value={formData.tiempoProyecto}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 bg-white/95"
                        >
                          <option value="">Selecciona un tiempo</option>
                          <option value="Inmediato (esta semana)">Inmediato (esta semana)</option>
                          <option value="Este mes">Este mes</option>
                          <option value="Próximos 3 meses">Próximos 3 meses</option>
                          <option value="Próximos 6 meses">Próximos 6 meses</option>
                          <option value="Más de 6 meses">Más de 6 meses</option>
                          <option value="Sin fecha definida">Sin fecha definida</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-semibold text-gray-700 mb-2">
                      {formData.tipoContacto === 'cliente' ? 'Descripción del Proyecto/Consulta *' :
                       formData.tipoContacto === 'proveedor' ? 'Detalle de tu Propuesta *' :
                       'Descripción de la Oportunidad *'}
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 resize-vertical bg-white/95 ${
                        errors.mensaje ? 'border-red-400 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder={formData.tipoContacto === 'cliente' ? 'Describe tu proyecto: tipo de construcción, ubicación, especificaciones técnicas, cantidades estimadas, etc.' :
                                 formData.tipoContacto === 'proveedor' ? 'Describe los productos/servicios que ofreces, experiencia, referencias, condiciones comerciales, etc.' :
                                 'Describe tu propuesta de distribución: zona geográfica, experiencia, red comercial, proyecciones de ventas, etc.'}
                    />
                    {errors.mensaje && <p className="text-red-600 text-sm mt-1">{errors.mensaje}</p>}
                    <p className="text-sm text-gray-500 mt-2">
                      💡 {formData.tipoContacto === 'cliente' ? 'Incluye detalles técnicos y ubicación del proyecto' :
                          formData.tipoContacto === 'proveedor' ? 'Incluye certificaciones, referencias y condiciones comerciales' :
                          'Incluye experiencia previa y zona de cobertura deseada'}
                    </p>
                  </div>
                </div>

                <div className="text-center pt-8 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-12 py-4 rounded-xl text-lg font-bold transition-all duration-300 transform shadow-lg ${
                      isSubmitting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black hover:scale-105 hover:shadow-xl'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      'Enviar Consulta por Email'
                    )}
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    🔒 Información segura • 📧 Se abrirá tu cliente de email • ⚡ Respuesta rápida garantizada
                  </p>
                </div>
              </form>
            </div>
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