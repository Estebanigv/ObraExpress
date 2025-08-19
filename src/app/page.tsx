"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { NavbarSimple } from "@/components/navbar-simple";
import { Chatbot } from "@/components/chatbot";
import AvatarGroup from "@/components/ui/avatar-group";
import DispatchSection from "@/components/dispatch-section";
import { CatalogoDownloadModal } from "@/components/catalogo-download-modal";
import { navigate, safeDocument } from "@/lib/client-utils";
import { ProductImage } from "@/components/optimized-image";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

// Datos de productos (mismos que en la página de productos)
const productos = [
  {
    id: 'ondulado-cristal-6mm',
    nombre: 'Policarbonato Ondulado Cristal 6mm',
    descripcion: 'Lámina ondulada de policarbonato transparente ideal para techos y cubiertas.',
    categoria: 'Policarbonatos',
    subcategoria: 'Onduladas',
    precio: 15900,
    imagen: '/assets/images/Productos/policarbonato_ondulado_cristal_6mm.webp',
    especificaciones: {
      espesor: '6mm',
      colores: ['Cristal', 'Bronce', 'Verde', 'Azul'],
      medidas: '1.05m x 3.0m',
      uv: true,
      garantia: '10 años'
    },
    stock: 50
  },
  {
    id: 'ondulado-bronce-8mm',
    nombre: 'Policarbonato Ondulado Bronce 8mm',
    descripcion: 'Lámina ondulada con filtro UV y color bronce para mayor privacidad.',
    categoria: 'Policarbonatos',
    subcategoria: 'Onduladas',
    precio: 18500,
    imagen: '/assets/images/Productos/policarbonato_ondulado_bronce_8mm.webp',
    especificaciones: {
      espesor: '8mm',
      colores: ['Bronce', 'Cristal', 'Verde'],
      medidas: '1.05m x 3.0m',
      uv: true,
      garantia: '10 años'
    },
    stock: 35,
    nuevo: true
  },
  {
    id: 'alveolar-4mm-cristal',
    nombre: 'Policarbonato Alveolar 4mm Cristal',
    descripcion: 'Estructura celular liviana con excelente aislamiento térmico.',
    categoria: 'Policarbonatos',
    subcategoria: 'Alveolar',
    precio: 12900,
    imagen: '/assets/images/Productos/policarbonato_alveolar_4mm_cristal.webp',
    especificaciones: {
      espesor: '4mm',
      colores: ['Cristal', 'Bronce', 'Azul', 'Verde'],
      medidas: '2.1m x 6.0m',
      uv: true,
      garantia: '10 años'
    },
    stock: 80
  },
  {
    id: 'alveolar-6mm-bronce',
    nombre: 'Policarbonato Alveolar 6mm Bronce',
    descripcion: 'Mayor resistencia estructural con filtro solar integrado.',
    categoria: 'Policarbonatos',
    subcategoria: 'Alveolar',
    precio: 16800,
    imagen: '/assets/images/Productos/policarbonato_alveolar_6mm_bronce.webp',
    especificaciones: {
      espesor: '6mm',
      colores: ['Bronce', 'Cristal', 'Verde'],
      medidas: '2.1m x 6.0m',
      uv: true,
      garantia: '10 años'
    },
    stock: 45
  },
  {
    id: 'compacto-3mm-cristal',
    nombre: 'Policarbonato Compacto 3mm Cristal',
    descripcion: 'Lámina sólida de alta resistencia al impacto y transparencia.',
    categoria: 'Policarbonatos',
    subcategoria: 'Compacto',
    precio: 22500,
    imagen: '/assets/images/Productos/policarbonato_compacto_3mm_cristal.webp',
    especificaciones: {
      espesor: '3mm',
      colores: ['Cristal', 'Bronce', 'Humo'],
      medidas: '1.22m x 2.44m',
      uv: true,
      garantia: '15 años'
    },
    stock: 25,
    descuento: 10
  },
  {
    id: 'rollo-cristal-2mm',
    nombre: 'Rollo Policarbonato 2mm Cristal',
    descripcion: 'Rollo flexible ideal para proyectos curvos y diseños especiales.',
    categoria: 'Rollos',
    subcategoria: 'Plano',
    precio: 35900,
    imagen: '/assets/images/Productos/rollo_policarbonato_2mm_cristal.webp',
    especificaciones: {
      espesor: '2mm',
      colores: ['Cristal', 'Bronce'],
      medidas: '1.0m x 25m',
      uv: true,
      garantia: '8 años'
    },
    stock: 12
  },
  {
    id: 'perfil-h-10mm',
    nombre: 'Perfil H para Unión 10mm',
    descripcion: 'Perfil de unión para láminas alveolares de 10mm.',
    categoria: 'Accesorios',
    subcategoria: 'Perfiles',
    precio: 4500,
    imagen: '/assets/images/Productos/perfil_h_union_10mm.webp',
    especificaciones: {
      medidas: '6m de largo',
      colores: ['Transparente', 'Bronce']
    },
    stock: 100
  },
  {
    id: 'tornillos-autoperforantes',
    nombre: 'Tornillos Autoperforantes con Arandela',
    descripcion: 'Tornillos especiales para fijación de policarbonato.',
    categoria: 'Accesorios',
    subcategoria: 'Fijaciones',
    precio: 890,
    imagen: '/assets/images/Productos/tornillos_autoperforantes_arandela.webp',
    especificaciones: {
      medidas: 'Pack x 25 unidades'
    },
    stock: 200
  }
];

export default function Home() {
  const router = useRouter();
  const { addItem, state } = useCart();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    tipoProyecto: '',
    ancho: '',
    largo: '',
    nombre: '',
    telefono: '',
    comentarios: ''
  });

  const [isCatalogoModalOpen, setIsCatalogoModalOpen] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');

  // Filtrar productos basado en categoría y búsqueda
  const productosFiltrados = useMemo(() => {
    let resultado = productos;

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por categoría
    if (filtroCategoria !== 'Todos') {
      if (filtroCategoria === 'Alveolar') {
        resultado = resultado.filter(p => p.subcategoria === 'Alveolar');
      } else {
        resultado = resultado.filter(p => p.categoria === filtroCategoria);
      }
    }

    return resultado;
  }, [busqueda, filtroCategoria]);

  // Función para agregar producto al carrito
  const agregarAlCarrito = (producto, cantidad = 10) => {
    const item = {
      id: producto.id,
      tipo: 'producto' as const,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagen: producto.imagen,
      cantidad: cantidad,
      precioUnitario: producto.precio,
      total: producto.precio * cantidad,
      especificaciones: Object.entries(producto.especificaciones).map(([key, value]) => 
        `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
      )
    };
    
    addItem(item);
  };

  // Función para verificar si un producto está en el carrito
  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  // Función para obtener la cantidad de un producto en el carrito
  const getCartQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.cantidad : 0;
  };

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
    navigate.openInNewTab(urlWhatsApp);
    
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
        className="min-h-screen flex items-start text-white relative pt-40 md:pt-48 lg:pt-56 pb-10 md:pb-20 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.05) 100%), url('/assets/images/bannerB-q82.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'scroll'
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-12 items-start">
            <div className="xl:col-span-7 text-center xl:text-left">
              <div className="mb-6 animate-fade-in">
                <p className="text-base md:text-lg text-white font-medium uppercase tracking-wider drop-shadow-2xl" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.7)'}}>
                  Los Mejores Materiales para la Construcción en un solo lugar
                </p>
              </div>
              
              <div className="mb-6 md:mb-8 animate-slide-up">
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight">
                  <span className="block text-white drop-shadow-2xl mb-1 md:mb-2" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)'}}>
                    <span className="text-yellow-400 glow-text">Dando forma</span> a tu
                  </span>
                  <span className="block text-white drop-shadow-2xl mb-1 md:mb-2" style={{textShadow: '3px 3px 6px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7)'}}>
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
                <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed drop-shadow-lg" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.5)'}}>
                  Brindamos soluciones de construcción fundamentadas en 
                  compromiso, comunicación, colaboración y cumplimiento.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8 animate-slide-up-delay">
                <button 
                  onClick={() => {
                    // Abrir el cotizador detallado en una nueva ventana o modal
                    navigate.openInNewTab('/cotizador-detallado');
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg text-sm md:text-base transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Cotizador en Detalle
                </button>
                <button 
                  onClick={() => {
                    const productosElement = safeDocument.getElementById('productos-section');
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
                          image: "/assets/images/Review/avatar1.webp",
                        },
                        {
                          id: 2,
                          name: "Carlos Mendoza",
                          designation: "Constructor",
                          image: "/assets/images/Review/avatar2.webp",
                        },
                        {
                          id: 3,
                          name: "Ana Rodríguez",
                          designation: "Ingeniera",
                          image: "/assets/images/Review/avatar4.webp",
                        },
                        {
                          id: 4,
                          name: "Luis Hernández",
                          designation: "Arquitecto",
                          image: "/assets/images/Review/avatar3.webp",
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

      {/* Productos Destacados Section - Diseño Prominente */}
      <section id="productos-section" className="py-20 bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-green-600 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-yellow-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 rounded-full text-white text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
              PRODUCTOS DESTACADOS
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-semibold text-gray-900 mb-6 leading-tight tracking-wide uppercase">
              <span className="block text-blue-900">MATERIALES</span>
              <span className="block text-gray-700 text-4xl md:text-5xl lg:text-6xl mt-2 tracking-wider font-light">
                PARA LA CONSTRUCCIÓN
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed font-medium">
              Soluciones premium en materiales especializados para construcción. Policarbonatos de alta calidad, 
              sistemas estructurales, accesorios profesionales y tecnología avanzada para tus proyectos.
            </p>
            
            {/* Stats Bar */}
            <div className="flex flex-wrap justify-center items-center gap-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">15+</div>
                <div className="text-sm text-gray-600 font-medium">Años Experiencia</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">500+</div>
                <div className="text-sm text-gray-600 font-medium">Proyectos Completados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">10</div>
                <div className="text-sm text-gray-600 font-medium">Años Garantía UV</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-900">100%</div>
                <div className="text-sm text-gray-600 font-medium">Calidad Premium</div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10">
            {/* Láminas Alveolares - Featured */}
            <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl p-8 border-2 border-transparent hover:border-blue-500 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              {/* Premium Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                MÁS VENDIDO
              </div>
              
              {/* Enhanced Image Container */}
              <div className="relative h-56 rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200">
                <img 
                  src="/assets/images/Productos Destacados/policarbonato-multicelda.webp" 
                  alt="Láminas Alveolares de Policarbonato para Construcción" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-blue-900 mb-3 group-hover:text-blue-700 transition-colors">
                Láminas Alveolares
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Perfectas para techos y cerramientos de construcción. Excelente aislamiento térmico y máxima resistencia UV.
              </p>
              
              {/* Enhanced Features */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-blue-700 font-semibold">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Espesores: 4mm, 6mm, 8mm, 10mm
                </div>
                <div className="flex items-center text-sm text-blue-700 font-semibold">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Garantía UV: 10 años
                </div>
                <div className="flex items-center text-sm text-blue-700 font-semibold">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Transmisión luz: 82%
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white py-3 rounded-xl hover:from-blue-800 hover:to-blue-600 transition-all duration-300 font-semibold hover:shadow-lg transform hover:scale-105">
                Ver Especificaciones
              </button>
            </div>
            
            {/* Rollos Compactos */}
            <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl p-8 border-2 border-transparent hover:border-green-500 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              {/* Premium Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                RESISTENCIA
              </div>
              
              <div className="relative h-56 rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-green-100 to-green-200">
                <img 
                  src="/assets/images/Productos Destacados/rollo_compacto.webp" 
                  alt="Rollos Compactos de Policarbonato para Industria" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-blue-900 mb-3 group-hover:text-green-700 transition-colors">
                Rollos Compactos
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Máxima resistencia y claridad óptica. Ideal para aplicaciones industriales y comerciales exigentes.
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-green-700 font-semibold">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Espesores: 2mm, 3mm, 4mm, 6mm
                </div>
                <div className="flex items-center text-sm text-green-700 font-semibold">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Resistencia impacto: 250x vidrio
                </div>
                <div className="flex items-center text-sm text-green-700 font-semibold">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Claridad óptica: 90%
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all duration-300 font-semibold hover:shadow-lg transform hover:scale-105">
                Ver Especificaciones
              </button>
            </div>
            
            {/* Accesorios de Instalación */}
            <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl p-8 border-2 border-transparent hover:border-purple-500 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              {/* Premium Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                PROFESIONAL
              </div>
              
              <div className="relative h-56 rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200">
                <img 
                  src="/assets/images/Productos Destacados/accesorios.webp" 
                  alt="Accesorios y Perfiles para Policarbonato" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-blue-900 mb-3 group-hover:text-purple-700 transition-colors">
                Accesorios Pro
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Perfiles, tornillería y accesorios de montaje profesionales para instalaciones perfectas y duraderas.
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-purple-700 font-semibold">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Perfiles de unión y cierre
                </div>
                <div className="flex items-center text-sm text-purple-700 font-semibold">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Tornillería especializada
                </div>
                <div className="flex items-center text-sm text-purple-700 font-semibold">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  Cintas y selladores premium
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 font-semibold hover:shadow-lg transform hover:scale-105">
                Ver Especificaciones
              </button>
            </div>
            
            {/* Sistemas Estructurales */}
            <div className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl p-8 border-2 border-transparent hover:border-orange-500 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              {/* Premium Badge */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                ESTRUCTURAL
              </div>
              
              <div className="relative h-56 rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-200">
                <img 
                  src="/assets/images/Productos Destacados/sistemas_estructurales.webp" 
                  alt="Sistemas Estructurales para Construcción" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-blue-900 mb-3 group-hover:text-orange-700 transition-colors">
                Sistemas Estructurales
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Estructuras de soporte diseñadas para máxima durabilidad y resistencia en proyectos de construcción.
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-orange-700 font-semibold">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Acero galvanizado premium
                </div>
                <div className="flex items-center text-sm text-orange-700 font-semibold">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Diseño personalizado
                </div>
                <div className="flex items-center text-sm text-orange-700 font-semibold">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  Cálculo estructural incluido
                </div>
              </div>
              
              <button className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 rounded-xl hover:from-orange-500 hover:to-red-500 transition-all duration-300 font-semibold hover:shadow-lg transform hover:scale-105">
                Ver Especificaciones
              </button>
            </div>
          </div>
          
          {/* Call to Action Bar */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-green-700 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  ¿Necesitas asesoramiento técnico especializado?
                </h2>
                <p className="text-xl mb-8 text-blue-100">
                  Nuestros ingenieros te ayudan a elegir la solución perfecta para tu proyecto de construcción
                </p>
                <div className="flex flex-col lg:flex-row gap-4 justify-center items-center flex-wrap">
                  <button 
                    onClick={() => {
                      window.open('https://wa.me/56223456789?text=Hola, necesito asesoramiento técnico especializado para mi proyecto de construcción. ¿Podrían ayudarme?', '_blank');
                    }}
                    className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                  >
                    Consulta Técnica Gratuita
                  </button>
                  <button 
                    onClick={() => router.push('/productos')}
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-900 transition-all hover:scale-105"
                  >
                    Ver Catálogo Completo
                  </button>
                  <button 
                    onClick={() => setIsCatalogoModalOpen(true)}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-lg"
                  >
                    Descargar Catálogos PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catálogo Completo Section - Diseño Potente con Menú Lateral */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative">
        <div className="container mx-auto px-4">
          {/* Header mejorado */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
              CATÁLOGO PROFESIONAL
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Explora Nuestro
              <span className="block text-blue-900">Catálogo Completo</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Descubre toda nuestra línea de productos profesionales con especificaciones técnicas detalladas 
              y herramientas de selección inteligente.
            </p>
          </div>

          {/* Layout con Menú Lateral y Grid de Productos */}
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Menú Lateral con Iconos */}
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  Categorías
                </h3>
                
                {/* Filtros con Iconos */}
                <div className="space-y-4">
                  <button 
                    onClick={() => setFiltroCategoria('Todos')}
                    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 shadow-lg group ${
                      filtroCategoria === 'Todos' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                        : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-gray-700 hover:text-blue-700 border-2 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform ${
                      filtroCategoria === 'Todos' ? 'bg-white/20' : 'bg-blue-100'
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2-2 2m-14 0l-2-2 2-2" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Todos los Productos</div>
                      <div className={`text-sm ${filtroCategoria === 'Todos' ? 'text-blue-100' : 'text-gray-500'}`}>Ver catálogo completo</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setFiltroCategoria('Alveolar')}
                    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group ${
                      filtroCategoria === 'Alveolar' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' 
                        : 'bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 text-gray-700 hover:text-blue-700 border-2 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform ${
                      filtroCategoria === 'Alveolar' ? 'bg-white/20' : 'bg-blue-100'
                    }`}>
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Láminas Alveolares</div>
                      <div className={`text-sm ${filtroCategoria === 'Alveolar' ? 'text-blue-100' : 'text-gray-500'}`}>Aislamiento térmico</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setFiltroCategoria('Rollos')}
                    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group ${
                      filtroCategoria === 'Rollos' 
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' 
                        : 'bg-white hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 text-gray-700 hover:text-green-700 border-2 border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform ${
                      filtroCategoria === 'Rollos' ? 'bg-white/20' : 'bg-green-100'
                    }`}>
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Rollos Compactos</div>
                      <div className={`text-sm ${filtroCategoria === 'Rollos' ? 'text-green-100' : 'text-gray-500'}`}>Máxima resistencia</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setFiltroCategoria('Accesorios')}
                    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group ${
                      filtroCategoria === 'Accesorios' 
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' 
                        : 'bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 text-gray-700 hover:text-purple-700 border-2 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform ${
                      filtroCategoria === 'Accesorios' ? 'bg-white/20' : 'bg-purple-100'
                    }`}>
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Accesorios Pro</div>
                      <div className={`text-sm ${filtroCategoria === 'Accesorios' ? 'text-purple-100' : 'text-gray-500'}`}>Instalación profesional</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setFiltroCategoria('Policarbonatos')}
                    className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group ${
                      filtroCategoria === 'Policarbonatos' 
                        ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg' 
                        : 'bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 text-gray-700 hover:text-orange-700 border-2 border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform ${
                      filtroCategoria === 'Policarbonatos' ? 'bg-white/20' : 'bg-orange-100'
                    }`}>
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold">Policarbonatos</div>
                      <div className={`text-sm ${filtroCategoria === 'Policarbonatos' ? 'text-orange-100' : 'text-gray-500'}`}>Todas las láminas</div>
                    </div>
                  </button>
                </div>

                {/* Stats del Catálogo */}
                <div className="mt-8 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                  <h4 className="font-bold text-gray-900 mb-4">Estadísticas del Catálogo</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Productos disponibles</span>
                      <span className="font-bold text-blue-600">150+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Categorías</span>
                      <span className="font-bold text-green-600">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">En stock</span>
                      <span className="font-bold text-orange-600">98%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de Productos Mejorado */}
            <div className="flex-1">
              {/* Barra de búsqueda y filtros */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative flex-1 max-w-md">
                    <input 
                      type="text" 
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar productos..." 
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                    <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="flex gap-3">
                    <div className="text-sm text-gray-600 flex items-center">
                      Mostrando <span className="font-bold text-blue-600 mx-1">{productosFiltrados.length}</span> productos
                    </div>
                    <button 
                      onClick={() => router.push('/productos')}
                      className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Ver Todos
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid de Productos Dinámico */}
              {productosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No se encontraron productos
                  </h3>
                  <p className="text-gray-600">
                    Intenta ajustar los filtros o términos de búsqueda
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {productosFiltrados.map((producto) => {
                    // Definir colores según categoría
                    const getBackgroundColor = () => {
                      switch (producto.categoria) {
                        case 'Policarbonatos':
                          return producto.subcategoria === 'Alveolar' 
                            ? 'bg-gradient-to-br from-blue-50 to-blue-100' 
                            : 'bg-gradient-to-br from-indigo-50 to-indigo-100';
                        case 'Rollos':
                          return 'bg-gradient-to-br from-green-50 to-green-100';
                        case 'Accesorios':
                          return 'bg-gradient-to-br from-purple-50 to-purple-100';
                        default:
                          return 'bg-gradient-to-br from-gray-50 to-gray-100';
                      }
                    };
                    
                    const getCategoryColor = () => {
                      switch (producto.categoria) {
                        case 'Policarbonatos':
                          return producto.subcategoria === 'Alveolar' 
                            ? 'text-blue-700' 
                            : 'text-indigo-700';
                        case 'Rollos':
                          return 'text-green-700';
                        case 'Accesorios':
                          return 'text-purple-700';
                        default:
                          return 'text-gray-700';
                      }
                    };

                    return (
                      <div key={producto.id} className={`${getBackgroundColor()} rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 group flex flex-col h-full hover:-translate-y-1`}>
                        {/* Badges */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col space-y-2 h-12">
                            {producto.nuevo && (
                              <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full w-fit shadow-md">
                                ✨ Nuevo
                              </span>
                            )}
                            {producto.descuento && (
                              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full w-fit shadow-md">
                                🔥 -{producto.descuento}% OFF
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-bold ${getCategoryColor()}`}>{producto.categoria}</div>
                            {producto.subcategoria && (
                              <div className="text-sm text-gray-600 font-medium">{producto.subcategoria}</div>
                            )}
                          </div>
                        </div>

                        {/* Imagen */}
                        <div className="bg-white rounded-xl h-48 mb-4 overflow-hidden shadow-sm">
                        <ProductImage
                          src={producto.imagen}
                          alt={producto.nombre}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Información */}
                      <div className="flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors mb-3 h-16 line-clamp-2 leading-tight">
                          {producto.nombre}
                        </h3>
                        
                        <p className="text-base text-gray-700 mb-4 h-12 line-clamp-2 leading-relaxed font-medium">
                          {producto.descripcion}
                        </p>

                        <div className="text-sm text-gray-600 space-y-1 mb-4 h-16 font-medium">
                          {producto.especificaciones.espesor && (
                            <div>Espesor: <span className="text-gray-800 font-semibold">{producto.especificaciones.espesor}</span></div>
                          )}
                          {producto.especificaciones.medidas && (
                            <div>Medidas: <span className="text-gray-800 font-semibold">{producto.especificaciones.medidas}</span></div>
                          )}
                          {producto.especificaciones.uv && (
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              <span className="text-green-700 font-semibold">Protección UV</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 mb-4 h-4">
                          <div className={`w-2 h-2 rounded-full ${producto.stock > 10 ? 'bg-green-500' : producto.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                          <span className="text-xs text-gray-600">
                            {producto.stock > 10 ? 'En stock' : producto.stock > 0 ? `Solo ${producto.stock} disponibles` : 'Sin stock'}
                          </span>
                        </div>

                        <div className="flex-grow">
                          <div className="space-y-2 mb-6">
                            <div className="flex items-baseline space-x-2">
                              {producto.descuento ? (
                                <>
                                  <span className="text-lg font-bold text-yellow-600">
                                    ${Math.round(producto.precio * (1 - producto.descuento / 100)).toLocaleString()}
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    ${producto.precio.toLocaleString()}
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg font-bold text-gray-900">
                                  ${producto.precio.toLocaleString()}
                                </span>
                              )}
                            </div>
                            
                            {user?.tieneDescuento && (
                              <div className="text-xs text-green-600">
                                Tu precio: ${Math.round(producto.precio * (1 - (producto.descuento || 0) / 100) * (1 - user.porcentajeDescuento / 100)).toLocaleString()}
                                <span className="ml-1">(-{user.porcentajeDescuento}%)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {isInCart(producto.id) ? (
                          <div className="space-y-3 mt-auto">
                            <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 py-2 px-4 rounded-xl">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">En el carrito ({getCartQuantity(producto.id)} uds)</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => removeItem(producto.id)}
                                className="bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-3 rounded-xl transition-all text-sm"
                              >
                                Quitar
                              </button>
                              <button
                                onClick={() => agregarAlCarrito(producto, 10)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-3 rounded-xl transition-all text-sm"
                              >
                                +10 más
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2 mt-auto">
                            <div className="text-xs text-gray-500 text-center bg-yellow-50 py-2 px-3 rounded-lg">
                              📦 Venta mínima: 10 unidades
                            </div>
                            <button
                              onClick={() => agregarAlCarrito(producto, 10)}
                              disabled={producto.stock === 0}
                              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-medium py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                              {producto.stock === 0 ? 'Sin Stock' : 'Agregar 10 al Carrito'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}

              {/* Call to Action Premium */}
              <div className="mt-12 text-center">
                <div className="bg-black rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                      ¿Necesitas ver más productos?
                    </h3>
                    <p className="text-xl mb-8 text-gray-300">
                      Explora nuestro catálogo completo con más de 150 productos especializados
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button 
                        onClick={() => router.push('/productos')}
                        className="bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                      >
                        Ver Catálogo Completo
                      </button>
                      <button 
                        onClick={() => setIsCatalogoModalOpen(true)}
                        className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-black transition-all hover:scale-105"
                      >
                        Descargar Catálogos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/assets/images/Logotipo/polimax-isotipo-amarillo-negro.webp" alt="POLIMAX" className="h-12 w-auto" />
                <img src="/assets/images/Logotipo/polimax-logotipo.webp" alt="POLIMAX" className="h-8 w-auto filter brightness-0 invert" />
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

      {/* Modal de Descarga de Catálogos */}
      <CatalogoDownloadModal 
        isOpen={isCatalogoModalOpen}
        onClose={() => setIsCatalogoModalOpen(false)}
      />
    </main>
  );
}
