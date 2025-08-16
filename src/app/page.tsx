"use client";

import React, { useState } from "react";
import { NavbarSimple } from "@/components/navbar-simple";
import { Chatbot } from "@/components/chatbot";
import DispatchSection from "@/components/dispatch-section";

export default function Home() {
  const [formData, setFormData] = useState({
    tipoProyecto: '',
    ancho: '',
    largo: '',
    nombre: '',
    telefono: '',
    comentarios: ''
  });

  // Función para obtener fechas del calendario para los próximos 6 meses - Solo jueves
  /* const getCalendarDates = () => {
    const today = new Date();
    const months = [];
    
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
      const targetYear = today.getFullYear();
      const targetMonth = today.getMonth() + monthOffset;
      
      const actualYear = targetYear + Math.floor(targetMonth / 12);
      const actualMonth = targetMonth % 12;
      
      const firstDayOfMonth = new Date(actualYear, actualMonth, 1);
      const lastDayOfMonth = new Date(actualYear, actualMonth + 1, 0);
      
      const monthData = {
        name: firstDayOfMonth.toLocaleDateString('es-CL', { 
          month: 'long', 
          year: 'numeric' 
        }).replace(/^\w/, c => c.toUpperCase()),
        dates: [] as (Date | null)[]
      };
      
      const startingDayOfWeek = firstDayOfMonth.getDay();
      
      for (let i = 0; i < startingDayOfWeek; i++) {
        monthData.dates.push(null);
      }
      
      const daysInMonth = lastDayOfMonth.getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(actualYear, actualMonth, day);
        monthData.dates.push(date);
      }
      
      months.push(monthData);
    }
    
    return months;
  }; */

  /* const getDateStatus = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const dayOfWeek = date.getDay();
    const isThursday = dayOfWeek === 4;
    const isPast = checkDate < today;
    const isToday = checkDate.getTime() === today.getTime();
    
    // Calcular días hasta el jueves
    const daysUntilThursday = checkDate.getTime() - today.getTime();
    const daysDifference = Math.ceil(daysUntilThursday / (24 * 60 * 60 * 1000));
    
    if (isToday) {
      return 'today';
    }
    
    if (isThursday) {
      if (isPast) {
        return 'past-thursday';
      }
      // Solo permitir si faltan más de 2 días (martes o antes para jueves)
      if (daysDifference <= 2) {
        return 'too-late-thursday'; // Muy tarde para pedir
      }
      return 'available-thursday';
    }
    
    return 'unavailable';
  }; */

  /* const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  }; */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.tipoProyecto || !formData.ancho || !formData.largo || !formData.nombre || !formData.telefono) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    // Calcular área
    const ancho = parseFloat(formData.ancho);
    const largo = parseFloat(formData.largo);
    const area = ancho * largo;
    
    // Crear mensaje para WhatsApp
    const mensaje = `🏗️ *SOLICITUD DE ASESORÍA DE PROYECTO - POLIMAX*

👤 *Cliente:* ${formData.nombre}
📱 *Teléfono:* ${formData.telefono}

🔧 *Detalles del Proyecto:*
• *Tipo:* ${formData.tipoProyecto}
• *Dimensiones:* ${ancho}m × ${largo}m
• *Área aproximada:* ${area.toFixed(2)} m²

${formData.comentarios ? `💬 *Comentarios adicionales:*
${formData.comentarios}

` : ''}📋 *Solicito:*
✅ Asesoría técnica especializada
✅ Cotización formal detallada
✅ Recomendaciones de materiales

¡Gracias por su atención!`;

    // Número de WhatsApp de POLIMAX
    const numeroWhatsApp = "56963348909";
    
    // Crear URL de WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    // Abrir WhatsApp
    window.open(urlWhatsApp, '_blank');
    
    // Mostrar confirmación
    alert('✅ Redirigiendo a WhatsApp para enviar tu consulta...');
    
    // Limpiar formulario
    setFormData({
      tipoProyecto: '',
      ancho: '',
      largo: '',
      nombre: '',
      telefono: '',
      comentarios: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <NavbarSimple />
      
      {/* Hero Section */}
      <section 
        className="min-h-screen flex items-center text-white relative pt-20 md:pt-32 lg:pt-56 pb-10 md:pb-20 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(245, 245, 245, 0.2) 50%, rgba(255, 255, 255, 0.3) 100%), url('/assets/images/bannerB.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundAttachment: 'scroll'
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-12 items-start xl:items-center">
            <div className="xl:col-span-7 text-center xl:text-left">
              <div className="mb-6 animate-fade-in">
                <p className="text-base md:text-lg text-white font-medium uppercase tracking-wider drop-shadow-lg">
                  Los Mejores Materiales para la Construccion en un solo lugar
                </p>
              </div>
              
              <div className="mb-6 md:mb-8 animate-slide-up">
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight">
                  <span className="block text-white drop-shadow-2xl mb-1 md:mb-2">
                    <span className="text-yellow-400 glow-text">Dando forma</span> a tu
                  </span>
                  <span className="block text-white drop-shadow-2xl mb-1 md:mb-2">
                    visión <span className="text-yellow-400 glow-text">Con</span>
                  </span>
                  <span className="block text-yellow-400 glow-text">
                    precisión
                  </span>
                </h1>
              </div>
              
              <style jsx>{`
                .glow-text {
                  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5), 0 0 40px rgba(251, 191, 36, 0.3);
                }
                .animate-fade-in {
                  animation: fadeIn 1s ease-out;
                }
                .animate-slide-up {
                  animation: slideUp 1s ease-out 0.3s both;
                }
                .animate-slide-up-delay {
                  animation: slideUp 1s ease-out 0.6s both;
                }
                .animate-spin-slow {
                  animation: spinSlow 4s linear infinite;
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                  from { opacity: 0; transform: translateY(30px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spinSlow {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
              
              <div className="mb-6 md:mb-8 max-w-lg animate-slide-up-delay">
                <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed drop-shadow-lg">
                  Brindamos soluciones de construcción fundamentadas en 
                  compromiso, comunicación, colaboración y cumplimiento.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8 animate-slide-up-delay">
                <button 
                  onClick={() => {
                    // Abrir el cotizador detallado en una nueva ventana o modal
                    window.open('/cotizador-detallado', '_blank');
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg text-sm md:text-base transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Cotizador en Detalle
                </button>
                <button 
                  onClick={() => {
                    const productosElement = document.getElementById('productos-section');
                    if (productosElement) {
                      productosElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg text-sm md:text-base transition-all hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Nuestros Productos
                </button>
              </div>

              {/* Rating Section con avatares */}
              <div className="mb-6 md:mb-8 animate-slide-up-delay">
                <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 md:p-6 inline-block w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Rating y estrellas */}
                    <div className="text-white text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
                        <span className="text-xl md:text-2xl font-bold">4.8</span>
                        <div className="flex">
                          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                      </div>
                      <p className="text-xs md:text-sm text-gray-200 drop-shadow-md">+200 clientes satisfechos</p>
                    </div>
                    
                    {/* Avatares */}
                    <AvatarGroup
                      items={[
                        {
                          id: 1,
                          name: "María González",
                          designation: "Arquitecta",
                          image: "/assets/images/Review/avatar1.png",
                        },
                        {
                          id: 2,
                          name: "Carlos Mendoza",
                          designation: "Constructor",
                          image: "/assets/images/Review/avatar2.png",
                        },
                        {
                          id: 3,
                          name: "Ana Rodríguez",
                          designation: "Ingeniera",
                          image: "/assets/images/Review/avatar3.png",
                        },
                        {
                          id: 4,
                          name: "Luis Hernández",
                          designation: "Arquitecto",
                          image: "/assets/images/Review/avatar4.png",
                        },
                      ]}
                      maxVisible={4}
                      size="lg"
                    />
                  </div>
                </div>
              </div>
              
            </div>

            <div className="xl:col-span-5">
              <div id="cotizador-rapido" className="bg-white/70 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-2xl border border-gray-200/30 animate-slide-up-delay relative z-10">
                <div className="text-center mb-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    Asesoría de Proyecto
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Cotización formal personalizada - Respuesta en menos de 1 hora
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Tipo de Proyecto</label>
                    <select 
                      name="tipoProyecto"
                      value={formData.tipoProyecto}
                      onChange={handleChange}
                      className="w-full p-2 sm:p-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium shadow-sm transition-all backdrop-blur-sm text-sm"
                      required
                    >
                      <option value="">Seleccionar tipo de proyecto...</option>
                      <option value="Techado Residencial">Techado Residencial</option>
                      <option value="Techado Industrial">Techado Industrial</option>
                      <option value="Cerramientos Laterales">Cerramientos Laterales</option>
                      <option value="Muros con Policarbonato">Muros con Policarbonato</option>
                      <option value="Pérgolas y Terrazas">Pérgolas y Terrazas</option>
                      <option value="Invernaderos">Invernaderos</option>
                      <option value="Galerías Comerciales">Galerías Comerciales</option>
                      <option value="Estructuras Especiales">Estructuras Especiales</option>
                      <option value="Otro (especificar en comentarios)">Otro (especificar en comentarios)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Ancho aproximado (m)</label>
                      <input 
                        type="number" 
                        name="ancho"
                        value={formData.ancho}
                        onChange={handleChange}
                        placeholder="5.0" 
                        step="0.1"
                        className="w-full p-2 sm:p-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium shadow-sm transition-all backdrop-blur-sm text-sm" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Largo aproximado (m)</label>
                      <input 
                        type="number" 
                        name="largo"
                        value={formData.largo}
                        onChange={handleChange}
                        placeholder="8.0" 
                        step="0.1"
                        className="w-full p-2 sm:p-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium shadow-sm transition-all backdrop-blur-sm text-sm" 
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Metros cuadrados aproximados *</label>
                    <input 
                      type="number" 
                      name="metrosCuadrados"
                      value={formData.ancho && formData.largo ? (parseFloat(formData.ancho) * parseFloat(formData.largo)).toFixed(2) : ''}
                      placeholder="Área total aproximada" 
                      step="0.1"
                      className="w-full p-2 sm:p-3 bg-gray-100 border border-gray-300/50 rounded-xl text-gray-800 font-medium shadow-sm text-sm" 
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Se calcula automáticamente: {formData.ancho && formData.largo ? `${formData.ancho} × ${formData.largo} = ${(parseFloat(formData.ancho) * parseFloat(formData.largo)).toFixed(2)} m²` : 'Ingresa ancho y largo'}</p>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                    <input 
                      type="text" 
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ingresa tu nombre" 
                      className="w-full p-2 sm:p-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium shadow-sm transition-all backdrop-blur-sm text-sm" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Teléfono WhatsApp</label>
                    <input 
                      type="tel" 
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+56 9 xxxx xxxx" 
                      className="w-full p-2 sm:p-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium shadow-sm transition-all backdrop-blur-sm text-sm" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Comentarios adicionales (opcional)</label>
                    <textarea 
                      name="comentarios"
                      value={formData.comentarios || ''}
                      onChange={handleChange}
                      placeholder="Describe detalles específicos de tu proyecto, ubicación, plazos, o cualquier requerimiento especial..." 
                      rows={3}
                      className="w-full p-2 sm:p-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium shadow-sm transition-all backdrop-blur-sm resize-none text-sm"
                    />
                  </div>
                  
                  
                  <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm sm:text-base">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.479 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.304 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span className="hidden sm:inline">Consultar por WhatsApp</span>
                    <span className="sm:hidden">WhatsApp</span>
                  </button>
                  <div className="flex items-center justify-center mt-3 sm:mt-4 space-x-2 sm:space-x-4 text-xs text-gray-600">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Asesoría gratuita
                    </span>
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Respuesta &lt; 1 hora
                    </span>
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Cotización formal
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productos Section */}
      <section id="productos-section" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Nuestros Productos Destacados</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Descubre nuestra amplia gama de soluciones en policarbonato de la más alta calidad
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Láminas Alveolares */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:transform hover:scale-105 transition-all border-2 border-transparent hover:border-blue-900">
              <div className="h-48 rounded-lg mb-4 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="Láminas Alveolares de Policarbonato" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Láminas Alveolares</h3>
              <p className="text-gray-600 mb-3">Perfectas para techos y cerramientos. Excelente aislamiento térmico y resistencia UV.</p>
              <div className="mb-4">
                <span className="text-sm text-blue-600 font-semibold">• Espesores: 4mm, 6mm, 8mm, 10mm</span><br/>
                <span className="text-sm text-blue-600 font-semibold">• Garantía UV: 10 años</span><br/>
                <span className="text-sm text-blue-600 font-semibold">• Transmisión luz: 82%</span>
              </div>
              <button className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors">
                Ver Detalles
              </button>
            </div>
            
            {/* Rollos Compactos */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:transform hover:scale-105 transition-all border-2 border-transparent hover:border-blue-900">
              <div className="h-48 rounded-lg mb-4 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="Rollos Compactos de Policarbonato" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Rollos Compactos</h3>
              <p className="text-gray-600 mb-3">Máxima resistencia y claridad óptica. Ideal para aplicaciones industriales y comerciales.</p>
              <div className="mb-4">
                <span className="text-sm text-blue-600 font-semibold">• Espesores: 2mm, 3mm, 4mm, 6mm</span><br/>
                <span className="text-sm text-blue-600 font-semibold">• Resistencia impacto: 250x vidrio</span><br/>
                <span className="text-sm text-blue-600 font-semibold">• Claridad óptica: 90%</span>
              </div>
              <button className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors">
                Ver Detalles
              </button>
            </div>
            
            {/* Accesorios */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:transform hover:scale-105 transition-all border-2 border-transparent hover:border-blue-900">
              <div className="h-48 rounded-lg mb-4 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="Accesorios y Perfiles" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Accesorios</h3>
              <p className="text-gray-600 mb-3">Perfiles, tornillería y accesorios de montaje profesionales para instalaciones perfectas.</p>
              <div className="mb-4">
                <span className="text-sm text-blue-600 font-semibold">• Perfiles de unión y cierre</span><br/>
                <span className="text-sm text-blue-600 font-semibold">• Tornillería especializada</span><br/>
                <span className="text-sm text-blue-600 font-semibold">• Cintas y selladores</span>
              </div>
              <button className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors">
                Ver Detalles
              </button>
            </div>
            
            {/* Estructuras Metálicas */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:transform hover:scale-105 transition-all border-2 border-transparent hover:border-blue-900">
              <div className="h-48 rounded-lg mb-4 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="Estructuras Metálicas" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Estructuras Metálicas</h3>
              <p className="text-gray-600 mb-3">Sistemas de soporte y estructuras diseñadas para máxima durabilidad y resistencia.</p>
              <div className="mb-4">
                <span className="text-sm text-blue-600 font-semibold">• Acero galvanizado</span><br/>
                <span className="text-sm text-blue-600 font-semibold">• Diseño personalizado</span><br/>
                <span className="text-sm text-blue-600 font-semibold">• Cálculo estructural incluido</span>
              </div>
              <button className="w-full bg-blue-900 text-white py-2 rounded-lg hover:bg-blue-800 transition-colors">
                Ver Detalles
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo de Productos Section - Estilo Leker */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Catálogo Completo</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explora nuestra línea completa de productos en policarbonato con especificaciones detalladas
            </p>
          </div>

          {/* Filtros de Categoría */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button className="bg-yellow-400 text-black px-6 py-2 rounded-full font-medium hover:bg-yellow-500 transition-colors">
              Todos
            </button>
            <button className="bg-white text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors border">
              Láminas Alveolares
            </button>
            <button className="bg-white text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors border">
              Rollos Compactos
            </button>
            <button className="bg-white text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors border">
              Accesorios
            </button>
            <button className="bg-white text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors border">
              Estructuras
            </button>
          </div>

          {/* Grid de Productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {/* Producto 1 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  OFERTA
                </div>
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Láminas
                </div>
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-blue-800 font-bold text-lg">6mm</span>
                    </div>
                    <span className="text-blue-800 font-semibold">2.10m x 6m</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Policarbonato Alveolar 6mm</h3>
                <p className="text-sm text-gray-600 mb-3">Transparente • 2.10m x 6.00m • Protección UV</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-900">$45.990</span>
                  <span className="text-sm text-gray-500 line-through">$52.990</span>
                </div>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-lg transition-colors">
                  Vista Rápida
                </button>
              </div>
            </div>

            {/* Producto 2 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-64 bg-gradient-to-br from-green-100 to-green-200 overflow-hidden">
                <div className="absolute top-3 right-3 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  Rollos
                </div>
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-green-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-green-800 font-bold text-lg">3mm</span>
                    </div>
                    <span className="text-green-800 font-semibold">1.25m x 50m</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Policarbonato Compacto 3mm</h3>
                <p className="text-sm text-gray-600 mb-3">Transparente • Rollo 50m • Alta resistencia</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-900">$189.990</span>
                </div>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-lg transition-colors">
                  Vista Rápida
                </button>
              </div>
            </div>

            {/* Producto 3 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-64 bg-gradient-to-br from-purple-100 to-purple-200 overflow-hidden">
                <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                  NUEVO
                </div>
                <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  Accesorios
                </div>
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-purple-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-purple-800 font-bold text-lg">H</span>
                    </div>
                    <span className="text-purple-800 font-semibold">6 metros</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Perfil H de Unión 10mm</h3>
                <p className="text-sm text-gray-600 mb-3">Transparente • 6 metros • Para láminas 10mm</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-900">$12.990</span>
                </div>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-lg transition-colors">
                  Vista Rápida
                </button>
              </div>
            </div>

            {/* Producto 4 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <div className="absolute top-3 right-3 bg-gray-600 text-white text-xs px-2 py-1 rounded">
                  Estructuras
                </div>
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-gray-800 font-bold text-lg">C</span>
                    </div>
                    <span className="text-gray-800 font-semibold">100x50mm</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Perfil C Galvanizado</h3>
                <p className="text-sm text-gray-600 mb-3">100x50x2mm • 6 metros • Galvanizado Z350</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-900">$28.990</span>
                </div>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-lg transition-colors">
                  Vista Rápida
                </button>
              </div>
            </div>

            {/* Producto 5 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Láminas
                </div>
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-blue-800 font-bold text-lg">10mm</span>
                    </div>
                    <span className="text-blue-800 font-semibold">2.10m x 6m</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Policarbonato Alveolar 10mm</h3>
                <p className="text-sm text-gray-600 mb-3">Transparente • 2.10m x 6.00m • Mayor aislamiento</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-900">$78.990</span>
                </div>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-lg transition-colors">
                  Vista Rápida
                </button>
              </div>
            </div>

            {/* Producto 6 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-64 bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  OFERTA
                </div>
                <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  Accesorios
                </div>
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-orange-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-orange-800 font-bold text-lg">🔩</span>
                    </div>
                    <span className="text-orange-800 font-semibold">Pack x50</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Tornillos Autorroscantes</h3>
                <p className="text-sm text-gray-600 mb-3">32mm • Con arandela • Pack 50 unidades</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-900">$8.990</span>
                  <span className="text-sm text-gray-500 line-through">$12.990</span>
                </div>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-lg transition-colors">
                  Vista Rápida
                </button>
              </div>
            </div>

            {/* Producto 7 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
                <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Láminas
                </div>
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-blue-800 font-bold text-lg">16mm</span>
                    </div>
                    <span className="text-blue-800 font-semibold">2.10m x 6m</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Policarbonato Alveolar 16mm</h3>
                <p className="text-sm text-gray-600 mb-3">Transparente • 2.10m x 6.00m • Máximo aislamiento</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-900">$124.990</span>
                </div>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-lg transition-colors">
                  Vista Rápida
                </button>
              </div>
            </div>

            {/* Producto 8 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-64 bg-gradient-to-br from-teal-100 to-teal-200 overflow-hidden">
                <div className="absolute top-3 left-3 bg-yellow-500 text-black text-xs px-2 py-1 rounded">
                  NUEVO
                </div>
                <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  Accesorios
                </div>
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-teal-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-teal-800 font-bold text-lg">📏</span>
                    </div>
                    <span className="text-teal-800 font-semibold">25m rollo</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Cinta Hermética Aluminio</h3>
                <p className="text-sm text-gray-600 mb-3">50mm • 25 metros • Adhesivo UV resistente</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-blue-900">$18.990</span>
                </div>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-2 rounded-lg transition-colors">
                  Vista Rápida
                </button>
              </div>
            </div>

          </div>

          {/* Botón Ver Más */}
          <div className="text-center mt-12">
            <button 
              onClick={() => router.push('/productos')}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-8 py-3 rounded-lg transition-colors"
            >
              Ver Todos los Productos
            </button>
          </div>

        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Lo Que Dicen Nuestros Clientes</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Testimonios reales de clientes satisfechos que confían en la calidad de nuestros productos
            </p>
            <div className="flex items-center justify-center mt-6 space-x-2">
              <div className="flex text-yellow-500">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-blue-900">4.9</span>
              <span className="text-gray-600">de 5 estrellas (152 reseñas)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500 mr-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Hace 2 semanas</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "Excelente calidad en todos los productos de policarbonato. El equipo de POLIMAX nos asesoró perfectamente para nuestro proyecto de techado industrial. Los materiales han resistido perfectamente las condiciones climáticas extremas. Muy recomendados."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  CM
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">Carlos Mendoza</h4>
                  <p className="text-sm text-gray-600">Ingeniero Civil, Constructora Mendoza</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500 mr-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Hace 1 mes</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "Servicio impecable y productos de calidad garantizada. La instalación de nuestro cerramiento fue perfecta y el equipo técnico muy profesional. Los precios son competitivos y la atención al cliente excepcional. Definitivamente los recomiendo."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  AR
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">Ana Rodríguez</h4>
                  <p className="text-sm text-gray-600">Arquitecta, Estudio AR Arquitectos</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500 mr-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Hace 3 semanas</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "Entrega puntual y asesoría técnica excepcional. POLIMAX superó nuestras expectativas en todos los aspectos. La durabilidad y transparencia de sus láminas alveolares es impresionante. Sin duda volveremos a trabajar con ellos en futuros proyectos."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  MT
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">Miguel Torres</h4>
                  <p className="text-sm text-gray-600">Gerente de Obras, Torres Construcción</p>
                </div>
              </div>
            </div>

            {/* Review 4 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500 mr-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Hace 1 semana</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "Increíble relación calidad-precio. Las estructuras metálicas que instalaron en nuestro galpón son de primera calidad y el diseño personalizado se adaptó perfectamente a nuestras necesidades. El equipo de POLIMAX es muy profesional y confiable."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  LC
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">Laura Castro</h4>
                  <p className="text-sm text-gray-600">Propietaria, Industrias Castro Ltda.</p>
                </div>
              </div>
            </div>

            {/* Review 5 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500 mr-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Hace 4 días</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "Excelente experiencia de principio a fin. La cotización fue clara y detallada, la instalación rápida y limpia, y el resultado final superó nuestras expectativas. El equipo de soporte post-venta también es muy atento. ¡Totalmente recomendados!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  RH
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">Roberto Hernández</h4>
                  <p className="text-sm text-gray-600">Director, Colegio San Andrés</p>
                </div>
              </div>
            </div>

            {/* Review 6 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500 mr-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Hace 5 días</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "La calidad del policarbonato es excepcional y la resistencia al clima ha sido probada durante dos años sin ningún problema. El servicio técnico siempre disponible y muy conocedor del producto. Una empresa seria y confiable que cumple lo que promete."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  JM
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">José Morales</h4>
                  <p className="text-sm text-gray-600">Administrador, Centro Comercial Plaza Norte</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">¿Quieres ser parte de nuestros clientes satisfechos?</p>
            <button className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg">
              Solicita tu Cotización Gratis
            </button>
          </div>
        </div>
      </section>

      {/* Dispatch Section */}
      <DispatchSection />

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">¿Por Qué Elegir POLIMAX?</h2>
            <p className="text-gray-600 text-lg">Características que nos hacen únicos en el mercado</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center hover:transform hover:translateY(-5px) transition-all shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Resistencia UV</h3>
              <p className="text-gray-600">Protección garantizada contra rayos ultravioleta y degradación solar por 10 años.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 text-center hover:transform hover:translateY(-5px) transition-all shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Fabricación Nacional</h3>
              <p className="text-gray-600">Productos fabricados localmente con los más altos estándares de calidad.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 text-center hover:transform hover:translateY(-5px) transition-all shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Alta Calidad</h3>
              <p className="text-gray-600">Materiales premium que garantizan durabilidad y excelente rendimiento.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 text-center hover:transform hover:translateY(-5px) transition-all shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Protección Solar</h3>
              <p className="text-gray-600">Filtrado eficiente de radiación solar manteniendo la luminosidad natural.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 text-center hover:transform hover:translateY(-5px) transition-all shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Envío Rápido</h3>
              <p className="text-gray-600">Logística eficiente para entregas puntuales en todo el territorio nacional.</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 text-center hover:transform hover:translateY(-5px) transition-all shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Soporte 24/7</h3>
              <p className="text-gray-600">Asesoría técnica profesional disponible cuando la necesites.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/assets/images/isotipo.png" alt="POLIMAX" className="h-12 w-auto" />
                <img src="/assets/images/POLIMAX_logo.png" alt="POLIMAX" className="h-8 w-auto filter brightness-0 invert" />
              </div>
              <p className="text-gray-300 mb-4">
                Líderes en fabricación y distribución de productos de policarbonato premium en Chile. 
                Más de 15 años de experiencia respaldando la calidad de nuestros productos.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.751-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z.017 0z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Contact Info */}
            <div>
              <h3 className="text-xl font-bold mb-4">Contacto</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@polimax.cl</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+56 2 2345 6789</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Av. Industrial 1234, Santiago</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Lun - Vie: 8:00 - 18:00</span>
                </div>
              </div>
            </div>
            
            {/* Products */}
            <div>
              <h3 className="text-xl font-bold mb-4">Productos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Láminas Alveolares</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Rollos Compactos</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Accesorios</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Estructuras Metálicas</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Perfiles y Selladores</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Sistemas Completos</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="text-xl font-bold mb-4">Empresa</h3>
              <ul className="space-y-2 mb-6">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Nosotros</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Calidad</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Garantía</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Certificaciones</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Proyectos</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Blog</a></li>
              </ul>
              
              {/* Certifications */}
              <div>
                <h4 className="font-bold mb-3">Certificaciones</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/10 rounded p-2 text-center text-xs">
                    <div className="text-yellow-400 font-bold">ISO 9001</div>
                    <div>Calidad</div>
                  </div>
                  <div className="bg-white/10 rounded p-2 text-center text-xs">
                    <div className="text-yellow-400 font-bold">CE</div>
                    <div>Europa</div>
                  </div>
                  <div className="bg-white/10 rounded p-2 text-center text-xs">
                    <div className="text-yellow-400 font-bold">UV 10</div>
                    <div>Garantía</div>
                  </div>
                  <div className="bg-white/10 rounded p-2 text-center text-xs">
                    <div className="text-yellow-400 font-bold">ECO</div>
                    <div>Reciclable</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-600 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-300 mb-4 md:mb-0">
                &copy; 2024 POLIMAX - Todos los derechos reservados. Policarbonato de calidad premium.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="hover:text-yellow-400 transition-colors">Política de Privacidad</a>
                <a href="#" className="hover:text-yellow-400 transition-colors">Términos de Servicio</a>
                <a href="#" className="hover:text-yellow-400 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </main>
  );
}
