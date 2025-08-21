"use client";

import React, { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { NavbarSimple } from "@/components/navbar-simple";
import { navigate, safeDocument } from "@/lib/client-utils";
import { ProductImage } from "@/components/optimized-image";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { getDispatchMessage, formatDispatchDate, getNextDispatchDate } from "@/utils/dispatch-dates";

// Lazy loading de componentes no críticos
const Chatbot = dynamic(() => import("@/components/chatbot").then(mod => ({ default: mod.Chatbot })), {
  ssr: false,
  loading: () => null
});

const AvatarGroup = dynamic(() => import("@/components/ui/avatar-group"), {
  ssr: false,
  loading: () => <div className="flex space-x-2"><div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div></div>
});

const DispatchSection = dynamic(() => import("@/components/dispatch-section"), {
  ssr: false,
  loading: () => <div className="h-20 bg-gray-100 animate-pulse rounded"></div>
});

const CatalogoDownloadModal = dynamic(() => import("@/components/catalogo-download-modal").then(mod => ({ default: mod.CatalogoDownloadModal })), {
  ssr: false
});

const DispatchCalendarModal = dynamic(() => import("@/components/dispatch-calendar-modal").then(mod => ({ default: mod.DispatchCalendarModal })), {
  ssr: false
});

const LocationBanner = dynamic(() => import("@/components/location-banner").then(mod => ({ default: mod.LocationBanner })), {
  ssr: false,
  loading: () => <div className="h-16 bg-yellow-100 animate-pulse rounded"></div>
});

const ProductConfiguratorSimple = dynamic(() => import("@/components/product-configurator-simple").then(mod => ({ default: mod.ProductConfiguratorSimple })), {
  loading: () => <div className="bg-white rounded-lg border p-4 h-96 animate-pulse"><div className="bg-gray-200 h-48 rounded mb-4"></div><div className="bg-gray-200 h-4 rounded mb-2"></div><div className="bg-gray-200 h-4 rounded w-3/4"></div></div>
});

// Función para cargar grupos de productos principales
const getProductosDestacados = () => {
  try {
    const productosData = require('@/data/productos-policarbonato.json');
    const grupos = productosData.productos_policarbonato || [];
    
    // Productos más económicos de cada categoría principal
    const productosEconomicos = [
      {
        categoria: "Policarbonato Ondulado",
        codigo_variante: "111001101",
        precio_objetivo: 8952
      },
      {
        categoria: "Policarbonato Alveolar", 
        codigo_variante: "113216401",
        precio_objetivo: 16432
      },
      {
        categoria: "Policarbonato Compacto",
        codigo_variante: "517106401", 
        precio_objetivo: 211005
      }
    ];
    
    const productosDestacados = [];
    
    // Buscar los grupos que contienen estos productos económicos
    for (const economico of productosEconomicos) {
      const grupoEncontrado = grupos.find(grupo => 
        grupo.variantes && grupo.variantes.some(variante => 
          variante.codigo === economico.codigo_variante
        )
      );
      
      if (grupoEncontrado) {
        // Encontrar la variante específica
        const varianteEconomica = grupoEncontrado.variantes.find(v => 
          v.codigo === economico.codigo_variante
        );
        
        if (varianteEconomica) {
          // Crear un grupo simplificado con solo la variante más económica
          const grupoSimplificado = {
            ...grupoEncontrado,
            nombre: economico.categoria, // Nombre simplificado
            variantes: [varianteEconomica], // Solo la variante más económica
            precio_desde: varianteEconomica.precio_con_iva,
            stock_total: varianteEconomica.stock,
            variantes_count: 1,
            colores: [varianteEconomica.color]
          };
          
          productosDestacados.push(grupoSimplificado);
        }
      }
    }
    
    return productosDestacados;
  } catch (error) {
    console.warn('Error cargando productos:', error);
    return [];
  }
};

// Productos destacados simplificados
const productosDestacados = getProductosDestacados();

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, state } = useCart();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    materialBuscado: '',
    nombre: '',
    telefono: '',
    comentarios: ''
  });

  const [isCatalogoModalOpen, setIsCatalogoModalOpen] = useState(false);
  const [isDispatchCalendarOpen, setIsDispatchCalendarOpen] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [nextDispatchDate, setNextDispatchDate] = useState<Date | null>(null);
  const [dispatchMessage, setDispatchMessage] = useState<string>("");
  const [selectedDispatchDate, setSelectedDispatchDate] = useState<string>('');

  // Filtrar productos basado en categoría y búsqueda
  const productosFiltrados = useMemo(() => {
    let resultado = productosDestacados;

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

  // Leer fecha de despacho de los search params
  useEffect(() => {
    const fechaParam = searchParams.get('fecha');
    if (fechaParam) {
      setSelectedDispatchDate(fechaParam);
    }
  }, [searchParams]);

  // Calcular próxima fecha de despacho
  useEffect(() => {
    const calculateNextDispatch = () => {
      const nextDate = getNextDispatchDate();
      const message = formatDispatchDate(nextDate);
      setNextDispatchDate(nextDate);
      setDispatchMessage(message);
    };

    calculateNextDispatch();
    
    // Actualizar cada minuto para mantener la información actualizada
    const interval = setInterval(calculateNextDispatch, 60000);
    
    return () => clearInterval(interval);
  }, []);

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

  // Función para manejar la selección de fecha de despacho
  const handleDispatchDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDispatchDate(dateString);
    
    // Actualizar la URL sin recargar la página ni cambiar la posición
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('fecha', dateString);
    window.history.replaceState({}, '', currentUrl.pathname + currentUrl.search);
    
    setIsDispatchCalendarOpen(false);
  };

  // Función para obtener la cantidad de un producto en el carrito
  const getCartQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.cantidad : 0;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.materialBuscado || !formData.nombre || !formData.telefono) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    // Crear mensaje para WhatsApp
    const mensaje = `🏗️ *CONSULTA ASESORÍA PERSONAL - ObraExpress*

👤 *Cliente:* ${formData.nombre}
📱 *Teléfono:* ${formData.telefono}

🔍 *Material de interés:*
• ${formData.materialBuscado}

${formData.comentarios ? `💬 *Información adicional:*
${formData.comentarios}

` : ''}📋 *Solicito:*
✅ Asesoría personalizada con ejecutivo
✅ Información detallada del material
✅ Precios y disponibilidad

¡Gracias por contactarnos!`;

    // Número de WhatsApp de ObraExpress
    const numeroWhatsApp = "56963348909";
    
    // Crear URL de WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    // Abrir WhatsApp
    navigate.openInNewTab(urlWhatsApp);
    
    // Mostrar confirmación
    alert('✅ Conectando con nuestro ejecutivo por WhatsApp...');
    
    // Limpiar formulario
    setFormData({
      materialBuscado: '',
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
        className="min-h-screen flex items-start text-white relative pt-32 md:pt-40 laptop-13:pt-44 lg:pt-48 xl:pt-56 pb-8 md:pb-16 laptop-13:pb-18 lg:pb-20 overflow-hidden hero-section"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4 laptop-13:gap-5 lg:gap-6 xl:gap-8 items-center">
            <div className="xl:col-span-7 text-center xl:text-left">
              <div className="mb-4 md:mb-6 animate-fade-in">
                <p className="text-lg md:text-xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto xl:mx-0" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                  Especialistas en <span className="text-yellow-400 font-bold">policarbonatos premium</span> y 
                  sistemas estructurales para construcción con <span className="text-yellow-400 font-bold">15+ años de experiencia</span>
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
                    // Abrir el cotizador guiado por IA en una nueva ventana
                    navigate.openInNewTab('/cotizador-detallado');
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg text-sm md:text-base transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Cotizador Guiado por IA
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
                  Productos Destacados
                </button>
              </div>

              {/* Badge líder - posicionado a mitad de altura del formulario */}
              <div className="mb-6 md:mb-8 animate-slide-up-delay">
                <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-full">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full mr-3 animate-pulse"></span>
                  <p className="text-sm md:text-base text-yellow-100 font-semibold uppercase tracking-wide">
                    Líder en Materiales de Construcción
                  </p>
                </div>
              </div>

              {/* Rating Section con avatares */}
              <div className="mb-6 md:mb-8 animate-slide-up-delay">
                <button 
                  onClick={() => {
                    const reviewsElement = safeDocument.getElementById('reviews');
                    if (reviewsElement) {
                      reviewsElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-black/20 backdrop-blur-md rounded-2xl p-4 md:p-6 inline-block w-full sm:w-auto hover:bg-black/30 transition-all duration-300 cursor-pointer hover:scale-105 transform"
                >
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
                      <p className="text-sm md:text-base text-gray-200 drop-shadow-md font-medium">+150 clientes satisfechos</p>
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
                </button>
              </div>
              
            </div>

            <div className="xl:col-span-5">
              <div id="cotizador-rapido" className="bg-white/80 backdrop-blur-md rounded-3xl p-3 sm:p-4 lg:p-6 shadow-2xl border border-gray-200/30 animate-slide-up-delay relative z-10 form-container">
                {/* Banner de Ubicación */}
                <LocationBanner className="mb-4" showDeliveryInfo={true} />
                
                <div className="text-center mb-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    Consulta & Asesórate
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-2">
                    Consulta y asesórate con nuestros ejecutivos de forma personal
                  </p>
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-green-600 text-sm sm:text-base">Respuesta inmediata</span>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">¿Qué material está buscando?</label>
                    <select 
                      name="materialBuscado"
                      value={formData.materialBuscado}
                      onChange={handleChange}
                      className="w-full p-2 sm:p-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium shadow-sm transition-all backdrop-blur-sm text-sm"
                      required
                    >
                      <option value="">Seleccionar material...</option>
                      <option value="Láminas Alveolares">Láminas Alveolares (Policarbonato)</option>
                      <option value="Rollos Compactos">Rollos Compactos (Policarbonato)</option>
                      <option value="Policarbonato Ondulado">Policarbonato Ondulado</option>
                      <option value="Accesorios">Accesorios de Instalación</option>
                      <option value="Sistemas Estructurales">Sistemas Estructurales</option>
                      <option value="No estoy seguro">No estoy seguro / Necesito asesoría</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">Nombre Completo</label>
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
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">Teléfono WhatsApp</label>
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
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">Comentarios adicionales (opcional)</label>
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
                  <div className="flex items-center justify-center mt-3 sm:mt-4 space-x-2 sm:space-x-4 text-sm text-gray-600">
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

      {/* Productos Destacados Section - Diseño Moderno */}
      <section id="productos-section" className="py-16 md:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Fondo minimalista */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-amber-50/30"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-amber-100/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Header Moderno */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-amber-100 rounded-full mb-6">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
              <span className="text-amber-800 font-semibold text-sm uppercase tracking-wider">
                Productos Destacados
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Policarbonatos
              </span>
              <br />
              <span className="text-gray-700 text-3xl md:text-4xl lg:text-5xl font-medium">
                de Calidad Premium
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Descubre nuestras tres categorías principales especializadas para cada tipo de proyecto, 
              todas con garantía UV de 10 años y certificación de calidad internacional.
            </p>
            
            {/* Stats minimalistas */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">15+</div>
                <div className="text-sm text-gray-500">Años</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-500">Proyectos</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10</div>
                <div className="text-sm text-gray-500">Años Garantía</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-gray-500">Calidad</div>
              </div>
            </div>

            {/* Banner de Próximo Despacho - Moderno */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-2xl mx-auto">
              <div className="text-center mb-4">
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-blue-700 font-semibold text-sm">Próximo Despacho</span>
                </div>
                
                {/* Fecha clickeable */}
                <button
                  onClick={() => setIsDispatchCalendarOpen(true)}
                  className="group w-full bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl p-4 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left flex-1">
                      <div className="text-gray-900 font-semibold text-lg mb-1">
                        {selectedDispatchDate ? (
                          new Date(selectedDispatchDate + 'T00:00:00').toLocaleDateString('es-CL', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long' 
                          })
                        ) : (
                          dispatchMessage || 'Calculando próxima fecha...'
                        )}
                      </div>
                      <div className="text-gray-600 text-sm">
                        9:00 - 18:00 hrs • {selectedDispatchDate ? 'Fecha personalizada' : 'Fecha más próxima'}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      {selectedDispatchDate && (
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      )}
                      <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                        <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                      </div>
                    </div>
                  </div>
                </button>
                
                <div className="mt-3 text-sm text-gray-500">
                  {selectedDispatchDate ? (
                    <div className="flex items-center justify-center space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedDispatchDate('');
                          // Remover el parámetro de fecha de la URL sin recargar
                          const currentUrl = new URL(window.location.href);
                          currentUrl.searchParams.delete('fecha');
                          window.history.replaceState({}, '', currentUrl.pathname + currentUrl.search);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Solicitar fecha más próxima
                      </button>
                      <span>•</span>
                      <span>Click para cambiar</span>
                    </div>
                  ) : (
                    <div>
                      Solo los jueves • Click para elegir fecha específica
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Productos Configurables - Página de Inicio */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 laptop-13:gap-7 lg:gap-8 max-w-7xl mx-auto products-grid products-grid-mobile products-grid-mobile-md products-grid-tablet products-grid-tablet-lg items-stretch">
            {productosDestacados.map((producto) => (
              <ProductConfiguratorSimple 
                key={producto.id}
                productGroup={producto}
                className=""
              />
            ))}
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
                    Conversar con Nuestros Ejecutivos
                  </button>
                  <button 
                    onClick={() => {
                      console.log('🎯 Botón "Llámanos Ahora" clickeado - abriendo widget Eleven Labs');
                      // Importar dinámicamente la función para evitar errores de SSR
                      import('@/utils/elevenlabs-widget').then(({ openElevenLabsWidget }) => {
                        openElevenLabsWidget();
                      }).catch(error => {
                        console.error('Error cargando widget:', error);
                        // Fallback solo si hay error al cargar el módulo
                        window.open('tel:+56963348909', '_self');
                      });
                    }}
                    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-black hover:text-white hover:border-black transition-all hover:scale-105"
                  >
                    Llámanos Ahora
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

      {/* Catálogo Completo Section - Removido temporalmente para migración */}
      {/* Customer Reviews Section */}
      <section id="reviews" className="py-16 bg-gray-50">
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
              <span className="text-2xl font-bold text-blue-900">4.8</span>
              <span className="text-gray-600">de 5 estrellas (más de 150 clientes satisfechos)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 laptop-13:gap-7 lg:gap-8">
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
                "Excelente calidad en todos los productos de policarbonato. El equipo de ObraExpress nos asesoró perfectamente para nuestro proyecto de techado industrial. Los materiales han resistido perfectamente las condiciones climáticas extremas. Muy recomendados."
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
                "Entrega puntual y asesoría técnica excepcional. ObraExpress superó nuestras expectativas en todos los aspectos. La durabilidad y transparencia de sus láminas alveolares es impresionante. Sin duda volveremos a trabajar con ellos en futuros proyectos."
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
                "Increíble relación calidad-precio. Las estructuras metálicas que instalaron en nuestro galpón son de primera calidad y el diseño personalizado se adaptó perfectamente a nuestras necesidades. El equipo de ObraExpress es muy profesional y confiable."
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
            <button className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-900 to-black hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] shadow-2xl hover:shadow-emerald-500/25 border border-slate-700 hover:border-emerald-400 group">
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {/* Contenido del botón */}
              <span className="relative z-10 flex items-center justify-center text-lg">
                <svg className="w-6 h-6 mr-3 transition-transform group-hover:rotate-12 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="tracking-wide">
                  Obtener Cotización
                  <span className="block text-sm font-normal opacity-90 -mt-1">Sin Costo • Sin Compromiso</span>
                </span>
                <svg className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              
              {/* Partículas brillantes */}
              <div className="absolute top-2 right-4 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
              <div className="absolute bottom-3 left-6 w-1.5 h-1.5 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500 delay-100"></div>
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
            <h2 className="text-4xl font-bold text-blue-900 mb-4">¿Por Qué Elegir ObraExpress?</h2>
            <p className="text-gray-600 text-lg">Características que nos hacen únicos en el mercado</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 laptop-13:gap-7 lg:gap-8">
            <div className="bg-white rounded-xl p-6 lg:p-8 text-center hover:transform hover:translateY(-5px) transition-all shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Resistencia UV</h3>
              <p className="text-gray-600">Protección garantizada contra rayos ultravioleta y degradación solar por 10 años.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 lg:p-8 text-center hover:transform hover:translateY(-5px) transition-all shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Fabricación Nacional</h3>
              <p className="text-gray-600">Productos fabricados localmente con los más altos estándares de calidad.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 lg:p-8 text-center hover:transform hover:translateY(-5px) transition-all shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Alta Calidad</h3>
              <p className="text-gray-600">Materiales premium que garantizan durabilidad y excelente rendimiento.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 lg:p-8 text-center hover:transform hover:translateY(-5px) transition-all shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Protección Solar</h3>
              <p className="text-gray-600">Filtrado eficiente de radiación solar manteniendo la luminosidad natural.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 lg:p-8 text-center hover:transform hover:translateY(-5px) transition-all shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-2">Envío Rápido</h3>
              <p className="text-gray-600">Logística eficiente para entregas puntuales en todo el territorio nacional.</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 lg:p-8 text-center hover:transform hover:translateY(-5px) transition-all shadow-lg">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img src="/assets/images/Logotipo/isotipo_obraexpress.webp" alt="ObraExpress" className="h-12 w-auto" />
                <img src="/assets/images/Logotipo/imagotipo_obraexpress.webp" alt="ObraExpress" className="h-8 w-auto filter brightness-0 invert" />
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
                  <span>info@obraexpress.cl</span>
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
                  <span>Av. Industrial 1234, Región Metropolitana</span>
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
                  <div className="bg-white/10 rounded p-2 text-center text-sm">
                    <div className="text-yellow-400 font-bold">ISO 9001</div>
                    <div>Calidad</div>
                  </div>
                  <div className="bg-white/10 rounded p-2 text-center text-sm">
                    <div className="text-yellow-400 font-bold">CE</div>
                    <div>Europa</div>
                  </div>
                  <div className="bg-white/10 rounded p-2 text-center text-sm">
                    <div className="text-yellow-400 font-bold">UV 10</div>
                    <div>Garantía</div>
                  </div>
                  <div className="bg-white/10 rounded p-2 text-center text-sm">
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
                &copy; 2024 ObraExpress - Todos los derechos reservados. Policarbonato de calidad premium.
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

      {/* Modal de Calendario de Despacho */}
      <DispatchCalendarModal
        isOpen={isDispatchCalendarOpen}
        onClose={() => setIsDispatchCalendarOpen(false)}
        productType="Policarbonato"
        onDateSelect={handleDispatchDateSelect}
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando página principal...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
