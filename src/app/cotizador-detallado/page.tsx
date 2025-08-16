"use client";

import React, { useState } from "react";
import { NavbarSimple } from "@/components/navbar-simple";
import { Chatbot } from "@/components/chatbot";
import { useCart } from "@/contexts/CartContext";
import type { CartItem } from "@/contexts/CartContext";

// Interface local para productos específicos del cotizador
interface LocalCartItem {
  id: string;
  producto: string;
  espesor: string;
  color: string;
  ancho: number;
  largo: number;
  cantidad: number;
  area: number;
  precioUnitario: number;
  total: number;
}

export default function CotizadorDetallado() {
  const { addItem, state: cartState } = useCart();
  const [localCart, setLocalCart] = useState<LocalCartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedComuna, setSelectedComuna] = useState("");
  const [direccionEspecifica, setDireccionEspecifica] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState({
    producto: false,
    espesor: false,
    color: false,
    ancho: false,
    largo: false,
    region: false,
    comuna: false,
    direccion: false,
    fecha: false
  });
  const [currentProduct, setCurrentProduct] = useState({
    producto: "",
    espesor: "",
    color: "",
    ancho: 0,
    largo: 0,
    cantidad: 10
  });

  // Regiones y comunas de Chile
  const regionesChile = {
    'Región Metropolitana': [
      'Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'Maipú', 'La Florida', 'Peñalolén', 
      'Puente Alto', 'San Bernardo', 'Melipilla', 'Pudahuel', 'Quilicura', 'Renca', 
      'Independencia', 'Recoleta', 'Conchalí', 'Huechuraba', 'Vitacura', 'Lo Barnechea', 
      'La Reina', 'Macul', 'San Joaquín', 'San Miguel', 'San Ramón', 'La Granja', 
      'La Pintana', 'El Bosque', 'Pedro Aguirre Cerda', 'Lo Espejo', 'Estación Central', 
      'Cerrillos', 'Maipú', 'Quinta Normal', 'Lo Prado', 'Cerro Navia', 'Colina', 
      'Lampa', 'Tiltil', 'María Pinto', 'Curacaví', 'Melipilla', 'San Pedro', 
      'Alhué', 'Buin', 'Paine', 'Calera de Tango', 'Pirque', 'San José de Maipo', 
      'Padre Hurtado', 'Peñaflor', 'Talagante', 'El Monte', 'Isla de Maipo'
    ],
    'Región de Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Casablanca', 'San Antonio'],
    'Región del Biobío': ['Concepción', 'Talcahuano', 'Chillán', 'Los Ángeles', 'Coronel', 'San Pedro de la Paz'],
    'Región de la Araucanía': ['Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Nueva Imperial', 'Angol'],
    'Región de Los Lagos': ['Puerto Montt', 'Osorno', 'Castro', 'Ancud', 'Puerto Varas', 'Frutillar'],
    'Región de Antofagasta': ['Antofagasta', 'Calama', 'Tocopilla', 'Mejillones', 'San Pedro de Atacama'],
    'Región de Atacama': ['Copiapó', 'Vallenar', 'Chañaral', 'Diego de Almagro', 'Tierra Amarilla'],
    'Región de Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle', 'Illapel', 'Vicuña', 'Monte Patria'],
    'Región del Libertador Bernardo O\'Higgins': ['Rancagua', 'San Fernando', 'Pichilemu', 'Santa Cruz', 'Rengo'],
    'Región del Maule': ['Talca', 'Curicó', 'Linares', 'Cauquenes', 'Constitución', 'Molina'],
    'Región de Ñuble': ['Chillán', 'Chillán Viejo', 'San Carlos', 'Bulnes', 'Yungay', 'Quirihue', 'Cobquecura', 'Coelemu', 'El Carmen', 'Ninhue', 'Ñiquén', 'Pemuco', 'Pinto', 'Portezuelo', 'Quillón', 'Ranquil', 'San Fabián', 'San Ignacio', 'San Nicolás', 'Treguaco', 'Coihueco'],
    'Región de Los Ríos': ['Valdivia', 'La Unión', 'Río Bueno', 'Panguipulli', 'Lanco'],
    'Región de Aysén': ['Coyhaique', 'Puerto Aysén', 'Chile Chico', 'Cochrane'],
    'Región de Magallanes': ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Cabo de Hornos'],
    'Región de Arica y Parinacota': ['Arica', 'Putre', 'General Lagos'],
    'Región de Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Pica']
  };

  const productos = {
    "Láminas Alveolares": {
      espesores: ["4mm", "6mm", "8mm", "10mm"],
      colores: ["Transparente", "Bronce", "Azul", "Verde", "Opal"],
      precios: {
        "4mm": 12000,
        "6mm": 15000,
        "8mm": 18000,
        "10mm": 22000
      }
    },
    "Rollos Compactos": {
      espesores: ["2mm", "3mm", "4mm", "5mm"],
      colores: ["Transparente", "Bronce", "Azul", "Fumé"],
      precios: {
        "2mm": 18000,
        "3mm": 22000,
        "4mm": 26000,
        "5mm": 30000
      }
    }
  };

  // Función para obtener fechas del calendario para los próximos 6 meses - Solo jueves
  const getCalendarDates = () => {
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
  };

  const getDateStatus = (date: Date) => {
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
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  };

  const addToCart = () => {
    // Validar campos y marcar errores
    const errors = {
      producto: !currentProduct.producto,
      espesor: !currentProduct.espesor,
      color: !currentProduct.color,
      ancho: currentProduct.ancho <= 0,
      largo: currentProduct.largo <= 0,
      region: false,
      comuna: false,
      direccion: false,
      fecha: false
    };

    setValidationErrors(errors);

    // Si hay errores, no continuar
    if (Object.values(errors).some(error => error)) {
      return;
    }

    const area = (currentProduct.ancho * currentProduct.largo);
    const precioUnitario = productos[currentProduct.producto as keyof typeof productos]?.precios[currentProduct.espesor as keyof typeof productos["Láminas Alveolares"]["precios"]] || 0;
    const total = area * precioUnitario * currentProduct.cantidad;

    // Crear item para el carrito global
    const globalCartItem: CartItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      tipo: 'producto',
      nombre: `${currentProduct.producto} - ${currentProduct.espesor}`,
      descripcion: `${currentProduct.color}, ${currentProduct.ancho}m x ${currentProduct.largo}m`,
      cantidad: currentProduct.cantidad,
      precioUnitario,
      total,
      // Campos específicos del producto
      espesor: currentProduct.espesor,
      color: currentProduct.color,
      ancho: currentProduct.ancho,
      largo: currentProduct.largo,
      area
    };

    // Agregar al carrito global
    addItem(globalCartItem);
    
    // También mantener en carrito local para la vista actual
    const localItem: LocalCartItem = {
      id: globalCartItem.id,
      ...currentProduct,
      area,
      precioUnitario,
      total
    };

    setLocalCart([...localCart, localItem]);
    
    // Limpiar formulario para permitir agregar otro producto diferente
    setCurrentProduct({
      producto: "",
      espesor: "",
      color: "",
      ancho: 0,
      largo: 0,
      cantidad: 10
    });

    // Limpiar errores de validación
    setValidationErrors({
      producto: false,
      espesor: false,
      color: false,
      ancho: false,
      largo: false,
      region: false,
      comuna: false,
      direccion: false,
      fecha: false
    });
  };

  const removeFromCart = (id: string) => {
    setLocalCart(localCart.filter(item => item.id !== id));
  };

  const getTotalCart = () => {
    return localCart.reduce((sum, item) => sum + item.total, 0);
  };

  const goToCheckout = () => {
    // Validar campos de dirección y fecha
    const errors = {
      producto: false,
      espesor: false,
      color: false,
      ancho: false,
      largo: false,
      region: !selectedRegion,
      comuna: !selectedComuna,
      direccion: !direccionEspecifica.trim(),
      fecha: !selectedDate
    };

    setValidationErrors(errors);

    // Si hay errores en la dirección o fecha, no continuar
    if (errors.region || errors.comuna || errors.direccion || errors.fecha) {
      return;
    }

    // Si hay productos en el carrito, ir al checkout
    if (cartState.items.length > 0) {
      window.location.href = '/checkout';
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <NavbarSimple />
      
      {/* Hero Section */}
      <section className="pt-40 pb-16 bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm text-gray-600 mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              Cotizador Avanzado
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Carro de Compras{" "}
              <span className="text-emerald-600">POLIMAX</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Agrega múltiples productos a tu carrito, ajusta cantidades y medidas, 
              y obtén una cotización completa al instante.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Product Form */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-3xl p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">
                        Agregar Producto al Carrito
                      </h2>
                      <p className="text-sm text-gray-600 mt-2">
                        💡 Puedes agregar múltiples productos diferentes. Completa el formulario y haz clic en "Agregar al Carrito" para cada producto.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCart(!showCart)}
                      className="lg:hidden bg-emerald-500 text-white px-4 py-2 rounded-xl font-medium"
                    >
                      Ver Carrito ({localCart.length})
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Tipo de Producto */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de Producto *
                      </label>
                      <select
                        value={currentProduct.producto}
                        onChange={(e) => {
                          setCurrentProduct({...currentProduct, producto: e.target.value, espesor: "", color: ""});
                          setValidationErrors({...validationErrors, producto: false});
                        }}
                        className={`w-full p-4 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                          validationErrors.producto ? 'border-red-500 bg-red-50' : 'border-gray-200'
                        }`}
                      >
                        <option value="">Selecciona un producto</option>
                        {Object.keys(productos).map(producto => (
                          <option key={producto} value={producto}>{producto}</option>
                        ))}
                      </select>
                    </div>

                    {/* Espesor */}
                    {currentProduct.producto && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Espesor *
                        </label>
                        <select
                          value={currentProduct.espesor}
                          onChange={(e) => {
                            setCurrentProduct({...currentProduct, espesor: e.target.value});
                            setValidationErrors({...validationErrors, espesor: false});
                          }}
                          className={`w-full p-4 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                            validationErrors.espesor ? 'border-red-500 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Selecciona espesor</option>
                          {productos[currentProduct.producto as keyof typeof productos]?.espesores.map(espesor => (
                            <option key={espesor} value={espesor}>{espesor}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Color */}
                    {currentProduct.espesor && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Color *
                        </label>
                        <select
                          value={currentProduct.color}
                          onChange={(e) => {
                            setCurrentProduct({...currentProduct, color: e.target.value});
                            setValidationErrors({...validationErrors, color: false});
                          }}
                          className={`w-full p-4 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                            validationErrors.color ? 'border-red-500 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Selecciona color</option>
                          {productos[currentProduct.producto as keyof typeof productos]?.colores.map(color => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Medidas */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ancho (metros) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={currentProduct.ancho || ""}
                          onChange={(e) => {
                            setCurrentProduct({...currentProduct, ancho: parseFloat(e.target.value) || 0});
                            setValidationErrors({...validationErrors, ancho: false});
                          }}
                          className={`w-full p-4 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                            validationErrors.ancho ? 'border-red-500 bg-red-50' : 'border-gray-200'
                          }`}
                          placeholder="2.1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Largo (metros) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={currentProduct.largo || ""}
                          onChange={(e) => {
                            setCurrentProduct({...currentProduct, largo: parseFloat(e.target.value) || 0});
                            setValidationErrors({...validationErrors, largo: false});
                          }}
                          className={`w-full p-4 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                            validationErrors.largo ? 'border-red-500 bg-red-50' : 'border-gray-200'
                          }`}
                          placeholder="6.0"
                        />
                      </div>
                    </div>

                    {/* Cantidad */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cantidad de Piezas *
                      </label>
                      <input
                        type="number"
                        min="10"
                        value={currentProduct.cantidad}
                        onChange={(e) => setCurrentProduct({...currentProduct, cantidad: Math.max(10, parseInt(e.target.value) || 10)})}
                        className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>

                    {/* Dirección de Despacho */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        📍 Dirección de Despacho
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Región *
                          </label>
                          <select
                            value={selectedRegion}
                            onChange={(e) => {
                              setSelectedRegion(e.target.value);
                              setSelectedComuna(''); // Reset comuna when region changes
                              setValidationErrors({...validationErrors, region: false});
                            }}
                            className={`w-full p-4 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                              validationErrors.region ? 'border-red-500 bg-red-50' : 'border-gray-200'
                            }`}
                          >
                            <option value="">Selecciona tu región</option>
                            {Object.keys(regionesChile).map((region) => (
                              <option key={region} value={region}>
                                {region}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Comuna *
                          </label>
                          <select
                            value={selectedComuna}
                            onChange={(e) => {
                              setSelectedComuna(e.target.value);
                              setValidationErrors({...validationErrors, comuna: false});
                            }}
                            className={`w-full p-4 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                              validationErrors.comuna ? 'border-red-500 bg-red-50' : 'border-gray-200'
                            }`}
                            disabled={!selectedRegion}
                          >
                            <option value="">
                              {selectedRegion ? 'Selecciona tu comuna' : 'Primero selecciona una región'}
                            </option>
                            {selectedRegion && regionesChile[selectedRegion as keyof typeof regionesChile]?.map((comuna) => (
                              <option key={comuna} value={comuna}>
                                {comuna}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Dirección específica *
                        </label>
                        <textarea
                          value={direccionEspecifica}
                          onChange={(e) => {
                            setDireccionEspecifica(e.target.value);
                            setValidationErrors({...validationErrors, direccion: false});
                          }}
                          placeholder="Calle, número, depto/casa, referencias adicionales"
                          rows={2}
                          className={`w-full p-4 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none ${
                            validationErrors.direccion ? 'border-red-500 bg-red-50' : 'border-gray-200'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Calendario de Despacho */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                        📅 Fecha de Despacho
                      </h3>
                      
                      <div className={`p-4 rounded-xl border-2 ${
                        validationErrors.fecha ? 'border-red-500 bg-red-50' : 'border-yellow-400/50 bg-yellow-50/50'
                      }`}>
                        <p className="text-sm text-yellow-800 mb-3">
                          <strong>🚚 Solo realizamos despachos los días jueves de 9:00 AM a 18:00 PM</strong>
                        </p>
                        <p className="text-xs text-yellow-700 mb-2">
                          • Solo despacho a domicilio - No hay retiro en tienda<br/>
                          • Pedidos hasta 2 días antes del despacho (máximo martes para jueves)
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded">🗓️ Hoy</span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">✅ Disponible</span>
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded">❌ Muy tarde</span>
                        </div>
                      </div>

                      {selectedDate && (
                        <div className="text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg font-medium">
                          Fecha seleccionada: {formatDate(selectedDate)}
                        </div>
                      )}

                      <div className="space-y-6 max-h-96 overflow-y-auto">
                        {getCalendarDates().map((month, monthIndex) => (
                          <div key={monthIndex} className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            
                            {/* Cabecera del Mes */}
                            <div className="bg-emerald-600 text-white p-4">
                              <h4 className="text-lg font-bold text-center">
                                {month.name}
                              </h4>
                            </div>

                            {/* Días de la semana */}
                            <div className="grid grid-cols-7 bg-gray-50">
                              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 border-r border-gray-200 last:border-r-0">
                                  {day}
                                </div>
                              ))}
                            </div>

                            {/* Calendario */}
                            <div className="grid grid-cols-7">
                              {month.dates.map((date, dateIndex) => {
                                if (!date) {
                                  return <div key={dateIndex} className="h-12 border-r border-b border-gray-200 last:border-r-0"></div>;
                                }

                                const status = getDateStatus(date);
                                const isSelected = selectedDate && selectedDate.getTime() === date.getTime();
                                
                                let buttonClass = 'w-full h-12 border-r border-b border-gray-200 last:border-r-0 flex items-center justify-center text-sm font-medium transition-all';
                                
                                if (status === 'today') {
                                  buttonClass += ' bg-blue-200 text-blue-900 font-bold border-2 border-blue-400';
                                } else if (status === 'available-thursday') {
                                  buttonClass += ' bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer';
                                } else if (status === 'urgent-thursday') {
                                  buttonClass += ' bg-green-200 text-green-900 hover:bg-green-300 cursor-pointer';
                                } else if (status === 'too-late-thursday') {
                                  buttonClass += ' bg-red-100 text-red-800 cursor-not-allowed line-through';
                                } else if (status === 'past-thursday') {
                                  buttonClass += ' bg-gray-100 text-gray-400 cursor-not-allowed';
                                } else {
                                  buttonClass += ' bg-gray-50 text-gray-300 cursor-not-allowed';
                                }
                                
                                if (isSelected) {
                                  buttonClass += ' ring-4 ring-green-500 ring-opacity-75';
                                }
                                
                                return (
                                  <button
                                    key={dateIndex}
                                    onClick={() => {
                                      if (status === 'available-thursday' || status === 'urgent-thursday') {
                                        setSelectedDate(date);
                                        setValidationErrors({...validationErrors, fecha: false});
                                      }
                                    }}
                                    disabled={status !== 'available-thursday' && status !== 'urgent-thursday'}
                                    className={buttonClass}
                                  >
                                    {date.getDate()}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Leyenda */}
                            <div className="p-3 bg-gray-50 border-t">
                              <div className="flex items-center justify-center space-x-3 text-xs">
                                <div className="flex items-center space-x-1">
                                  <div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded"></div>
                                  <span>Hoy</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                                  <span>Disponible</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                                  <span>Muy tarde</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                                  <span>No disponible</span>
                                </div>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    {currentProduct.producto && currentProduct.espesor && currentProduct.ancho > 0 && currentProduct.largo > 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                        <h3 className="font-semibold text-emerald-800 mb-3">Vista Previa:</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Área por pieza:</span>
                            <span className="font-medium">{(currentProduct.ancho * currentProduct.largo).toFixed(2)} m²</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Área total:</span>
                            <span className="font-medium">{(currentProduct.ancho * currentProduct.largo * currentProduct.cantidad).toFixed(2)} m²</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Precio estimado:</span>
                            <span className="font-bold text-emerald-600">
                              ${(currentProduct.ancho * currentProduct.largo * currentProduct.cantidad * 
                                (productos[currentProduct.producto as keyof typeof productos]?.precios[currentProduct.espesor as keyof typeof productos["Láminas Alveolares"]["precios"]] || 0)
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={addToCart}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Agregar este Producto al Carrito</span>
                    </button>
                    
                    {localCart.length > 0 && (
                      <div className="text-center">
                        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
                          ✅ Ya tienes {localCart.length} producto{localCart.length > 1 ? 's' : ''} en el carrito. 
                          Puedes agregar más productos diferentes rellenando el formulario nuevamente.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shopping Cart */}
              <div className={`lg:block ${showCart ? 'block' : 'hidden'}`}>
                <div className="bg-white border border-gray-200 rounded-3xl p-6 sticky top-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Carrito ({localCart.length})
                    </h3>
                    <span className="text-2xl">🛒</span>
                  </div>

                  {localCart.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">📦</div>
                      <p>Tu carrito está vacío</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                        {localCart.map((item) => (
                          <div key={item.id} className="border border-gray-200 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {item.producto} - {item.espesor}
                              </h4>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="space-y-1 text-xs text-gray-600">
                              <div>Color: {item.color}</div>
                              <div>{item.ancho}m × {item.largo}m = {item.area.toFixed(2)} m²</div>
                              <div>Cantidad: {item.cantidad}</div>
                              <div className="font-bold text-emerald-600">
                                ${item.total.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-lg font-bold text-gray-900">Total:</span>
                          <span className="text-2xl font-bold text-emerald-600">
                            ${getTotalCart().toLocaleString()}
                          </span>
                        </div>
                        
                        <button
                          onClick={goToCheckout}
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15.5M7 13h10m0 0l1.5 6H7" />
                          </svg>
                          Ir al Checkout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🛒</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Carrito Inteligente</h3>
                <p className="text-gray-600">
                  Agrega múltiples productos, ajusta cantidades y ve el total en tiempo real
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📐</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Medidas Exactas</h3>
                <p className="text-gray-600">
                  Calcula automáticamente las áreas y precios según tus medidas específicas
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Envío Directo</h3>
                <p className="text-gray-600">
                  Tu cotización se envía directamente por WhatsApp con todos los detalles
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Chatbot />
    </main>
  );
}