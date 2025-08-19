"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import TransbankService from '@/lib/transbank';
import Image from 'next/image';
import { CartThumbnail } from '@/components/optimized-image';

interface CheckoutFormData {
  nombre: string;
  telefono: string;
  email: string;
  region: string;
  comuna: string;
  direccion: string;
  comentarios: string;
}

const regiones = [
  'Región Metropolitana',
  'Región de Valparaíso',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Lagos',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región del Maule',
  'Región de Ñuble',
  'Región de Los Ríos',
  'Región de Aysén',
  'Región de Magallanes',
  'Región de Tarapacá',
  'Región de Arica y Parinacota'
];

const comunasPorRegion: Record<string, string[]> = {
  'Región Metropolitana': [
    'Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú', 'La Florida', 'Puente Alto',
    'San Bernardo', 'Quilicura', 'Peñalolén', 'La Pintana', 'San Miguel', 'Renca',
    'Cerro Navia', 'Conchalí', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Granja',
    'La Reina', 'Macul', 'Pedro Aguirre Cerda', 'Quinta Normal', 'Recoleta', 'San Joaquín',
    'San Ramón', 'Vitacura', 'Lo Barnechea', 'Estación Central', 'Cerrillos', 'Lo Espejo',
    'Lo Prado', 'El Bosque', 'Pudahuel', 'Melipilla', 'Talagante', 'Peñaflor', 'Curacaví',
    'María Pinto', 'San Pedro', 'Alhué', 'Colina', 'Lampa', 'Tiltil', 'Pirque', 'San José de Maipo',
    'Calera de Tango', 'Buin', 'Paine', 'Isla de Maipo', 'Padre Hurtado'
  ],
  'Región de Valparaíso': [
    'Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana', 'Casablanca',
    'San Antonio', 'Cartagena', 'El Tabo', 'El Quisco', 'Algarrobo', 'Santo Domingo',
    'Los Andes', 'San Esteban', 'Calle Larga', 'Rinconada', 'San Felipe', 'Llaillay',
    'Panquehue', 'Catemu', 'Santa María', 'Putaendo', 'La Ligua', 'Cabildo', 'Papudo',
    'Zapallar', 'Petorca', 'Chincolco', 'Hijuelas', 'La Calera', 'Nogales', 'Limache',
    'Olmué', 'Quillota'
  ],
  'Región del Biobío': [
    'Concepción', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz', 'Hualpén', 'Penco',
    'Tomé', 'Coronel', 'Lota', 'Santa Juana', 'Hualqui', 'Florida', 'Los Ángeles',
    'Cabrero', 'Yumbel', 'Tucapel', 'Antuco', 'Quilleco', 'Santa Bárbara', 'Quilaco',
    'Mulchén', 'Negrete', 'Nacimiento', 'Laja', 'San Rosendo', 'Chillán', 'Chillán Viejo',
    'El Carmen', 'Pemuco', 'Yungay', 'Bulnes', 'Quillón', 'Ránquil', 'Portezuelo',
    'Coelemu', 'Trehuaco', 'Cobquecura', 'Quirihue', 'Ninhue', 'San Carlos', 'Ñiquén',
    'San Fabián', 'Coihueco', 'Pinto', 'San Ignacio', 'Arauco', 'Curanilahue', 'Los Álamos',
    'Lebu', 'Cañete', 'Contulmo', 'Tirúa'
  ],
  'Región de La Araucanía': [
    'Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Freire', 'Pitrufquén', 'Gorbea',
    'Loncoche', 'Toltén', 'Teodoro Schmidt', 'Saavedra', 'Carahue', 'Nueva Imperial',
    'Galvarino', 'Perquenco', 'Lautaro', 'Angol', 'Renaico', 'Collipulli', 'Los Sauces',
    'Purén', 'Ercilla', 'Lumaco', 'Traiguén', 'Victoria', 'Curacautín', 'Lonquimay',
    'Melipeuco', 'Cunco', 'Curarrehue'
  ],
  'Región de Los Lagos': [
    'Puerto Montt', 'Puerto Varas', 'Osorno', 'Castro', 'Ancud', 'Quemchi', 'Dalcahue',
    'Curaco de Vélez', 'Quinchao', 'Puqueldón', 'Chonchi', 'Queilén', 'Quellón',
    'La Unión', 'Río Bueno', 'Lago Ranco', 'Futrono', 'Llifén', 'Los Lagos', 'Frutillar',
    'Fresia', 'Llanquihue', 'Maullín', 'Calbuco', 'Cochamó', 'Puelo', 'Chaitén',
    'Futaleufú', 'Hualaihué', 'Palena'
  ],
  'Región de Antofagasta': [
    'Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama', 'Tocopilla', 'María Elena'
  ],
  'Región de Atacama': [
    'Copiapó', 'Caldera', 'Tierra Amarilla', 'Vallenar', 'Alto del Carmen', 'Freirina', 'Huasco', 'Chañaral', 'Diego de Almagro'
  ],
  'Región de Coquimbo': [
    'La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paiguano', 'Vicuña', 'Ovalle',
    'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado', 'Illapel', 'Canela',
    'Los Vilos', 'Salamanca'
  ],
  'Región del Maule': [
    'Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue',
    'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue',
    'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Romeral', 'Sagrada Familia',
    'Teno', 'Vichuquén', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro',
    'San Javier', 'Villa Alegre', 'Yerbas Buenas'
  ],
  'Región de Ñuble': [
    'Chillán', 'Chillán Viejo', 'Bulnes', 'El Carmen', 'Pemuco', 'Pinto', 'Quillón',
    'Yungay', 'Cobquecura', 'Coelemu', 'Ninhue', 'Portezuelo', 'Quirihue', 'Ránquil',
    'Trehuaco', 'Coihueco', 'Ñiquén', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás'
  ],
  'Región de Los Ríos': [
    'Valdivia', 'Corral', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco',
    'Panguipulli', 'La Unión', 'Futrono', 'Lago Ranco', 'Río Bueno'
  ],
  'Región de Aysén': [
    'Coyhaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Cochrane', 'O\'Higgins',
    'Tortel', 'Chile Chico', 'Río Ibáñez'
  ],
  'Región de Magallanes': [
    'Punta Arenas', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Puerto Natales',
    'Torres del Paine', 'Porvenir', 'Primavera', 'Timaukel', 'Cabo de Hornos', 'Antártica'
  ],
  'Región de Tarapacá': [
    'Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica'
  ],
  'Región de Arica y Parinacota': [
    'Arica', 'Camarones', 'Putre', 'General Lagos'
  ]
};

export default function CheckoutPage() {
  const router = useRouter();
  const { state: cartState, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
    email: user?.email || '',
    region: '',
    comuna: '',
    direccion: '',
    comentarios: ''
  });

  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (cartState.items.length === 0) {
      router.push('/');
    }
  }, [cartState.items, router]);

  // Calcular totales
  const subtotal = cartState.items.reduce((sum, item) => sum + item.total, 0);
  const descuentoPorcentaje = user?.porcentajeDescuento || 0;
  const descuentoMonto = subtotal * (descuentoPorcentaje / 100);
  const total = Math.round(subtotal - descuentoMonto);

  // Validar monto mínimo de Transbank
  const amountValidation = TransbankService.validateAmount(total);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Si cambia la región, resetear la comuna
      if (name === 'region') {
        return { ...prev, [name]: value, comuna: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  // Obtener comunas disponibles según la región seleccionada
  const comunasDisponibles = formData.region ? comunasPorRegion[formData.region] || [] : [];

  const validateForm = (): boolean => {
    const required = ['nombre', 'telefono', 'email', 'region', 'comuna', 'direccion'];
    
    for (const field of required) {
      if (!formData[field as keyof CheckoutFormData].trim()) {
        setError(`El campo ${field} es obligatorio`);
        return false;
      }
    }

    if (!formData.email.includes('@')) {
      setError('Email inválido');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    console.log('🚀 Iniciando proceso de pago...');
    setError('');
    
    console.log('📝 Validando formulario...');
    if (!validateForm()) {
      console.log('❌ Formulario inválido');
      return;
    }
    console.log('✅ Formulario válido');
    
    // Debug: Mostrar items del carrito
    console.log('📦 Items del carrito:', cartState.items.map(item => ({ 
      id: item.id, 
      tipo: item.tipo, 
      fechaDespacho: item.fechaDespacho 
    })));
    
    // Validación opcional: solo advertir si faltan fechas, pero no bloquear
    const productosSinFecha = cartState.items.filter(item => 
      item.tipo === 'producto' && !item.fechaDespacho
    );
    
    if (productosSinFecha.length > 0) {
      console.log('⚠️ Productos sin fecha:', productosSinFecha);
      // Solo advertir, no bloquear
      console.log('⚠️ Advertencia: Algunos productos podrían no tener fecha de despacho');
    }
    console.log('✅ Continuando con el proceso de pago');
    
    console.log('💰 Validando monto:', { total, valid: amountValidation.valid, error: amountValidation.error });
    if (!amountValidation.valid) {
      console.log('❌ Monto inválido:', amountValidation.error);
      setError(amountValidation.error!);
      return;
    }
    console.log('✅ Monto válido');

    console.log('⏳ Iniciando procesamiento...');
    setIsProcessing(true);

    try {
      // Crear sesión única para la transacción
      const sessionId = `polimax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔑 Session ID creado:', sessionId);

      // Preparar datos para la API
      const paymentData = {
        amount: total,
        cartItems: cartState.items,
        customerData: {
          userId: user?.id || null,
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email,
          region: formData.region,
          comuna: formData.comuna,
          direccion: formData.direccion,
          comentarios: formData.comentarios
        },
        sessionId
      };

      console.log('📤 Enviando datos a la API:', paymentData);

      // Crear transacción con Transbank
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      console.log('📥 Respuesta de la API:', response.status, response.statusText);
      const result = await response.json();
      console.log('📄 Resultado:', result);

      if (response.ok && result.success) {
        // Limpiar carrito antes de redirigir
        clearCart();
        
        // Redirigir a Webpay Plus
        window.location.href = `${result.url}?token_ws=${result.token}`;
      } else {
        setError(result.error || 'Error al procesar el pago');
        setIsProcessing(false);
      }

    } catch (error) {
      console.error('Error en checkout:', error);
      setError('Error de conexión. Intenta nuevamente.');
      setIsProcessing(false);
    }
  };

  if (cartState.items.length === 0) {
    return null; // El useEffect ya manejará la redirección
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header for Checkout */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile layout - justified */}
          <div className="flex items-center justify-between md:hidden">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src="/assets/images/Logotipo/polimax-isotipo-amarillo-negro.webp" 
                  alt="POLIMAX" 
                  className="h-10 w-10 object-contain" 
                />
                <span className="ml-3 text-xl font-bold text-gray-900">POLIMAX</span>
              </Link>
              <div className="ml-8 text-sm text-gray-600">
                Datos de Entrega
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Proceso de Pago Seguro
            </div>
          </div>

          {/* Desktop layout - centered */}
          <div className="hidden md:flex items-center justify-center">
            <div className="flex items-center space-x-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <img 
                    src="/assets/images/Logotipo/polimax-isotipo-amarillo-negro.webp" 
                    alt="POLIMAX" 
                    className="h-10 w-10 object-contain" 
                  />
                  <span className="ml-3 text-xl font-bold text-gray-900">POLIMAX</span>
                </Link>
                <div className="ml-8 text-sm text-gray-600">
                  Datos de Entrega
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Proceso de Pago Seguro
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Finalizar Compra
            </h1>
            
            {/* Opciones de navegación */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <Link 
                href="/" 
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Volver al Inicio
              </Link>
              
              <div className="h-4 w-px bg-gray-300"></div>
              
              <Link 
                href="/productos"
                className="flex items-center text-amber-600 hover:text-amber-800 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6" />
                </svg>
                Ver Productos
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Formulario de Datos */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Datos de Entrega
              </h2>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="+56 9 1234 5678"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Región *
                    </label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    >
                      <option value="">Seleccionar región</option>
                      {regiones.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comuna *
                    </label>
                    <select
                      name="comuna"
                      value={formData.comuna}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                      disabled={!formData.region}
                    >
                      <option value="">
                        {formData.region ? 'Seleccionar comuna' : 'Primero selecciona una región'}
                      </option>
                      {comunasDisponibles.map(comuna => (
                        <option key={comuna} value={comuna}>{comuna}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección Completa *
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Calle, número, depto/casa, referencias"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comentarios Adicionales
                  </label>
                  <textarea
                    name="comentarios"
                    value={formData.comentarios}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    placeholder="Instrucciones especiales de entrega, horarios preferidos, etc."
                  />
                </div>
              </div>
            </div>

            {/* Resumen de Compra */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Resumen de Compra
              </h2>

              {/* Items del Carrito */}
              <div className="space-y-4 mb-6">
                {cartState.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    {item.imagen && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <CartThumbnail
                          src={item.imagen}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.nombre}</h3>
                      {item.descripcion && (
                        <p className="text-sm text-gray-600">{item.descripcion}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.cantidad} × {TransbankService.formatChileanAmount(item.precioUnitario)}
                      </p>
                      {item.tipo === 'producto' && item.fechaDespacho && (
                        <p className="text-xs text-green-600 mt-1">
                          📅 Despacho: {new Date(item.fechaDespacho).toLocaleDateString('es-CL')}
                        </p>
                      )}
                      {item.tipo === 'producto' && !item.fechaDespacho && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Sin fecha de despacho
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {TransbankService.formatChileanAmount(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{TransbankService.formatChileanAmount(subtotal)}</span>
                </div>
                
                {user?.tieneDescuento && descuentoPorcentaje > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Descuento ({descuentoPorcentaje}%):</span>
                    <span>-{TransbankService.formatChileanAmount(descuentoMonto)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span>{TransbankService.formatChileanAmount(total)}</span>
                </div>
              </div>

              {/* Información de Pago */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-medium text-blue-900">Pago Seguro con Transbank</span>
                </div>
                <p className="text-sm text-blue-800">
                  Aceptamos tarjetas de débito y crédito. Tu información está protegida con encriptación SSL.
                </p>
              </div>

              {/* Validación de Monto */}
              {!amountValidation.valid && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ {amountValidation.error}
                  </p>
                </div>
              )}

              {/* Botón de Pago */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || !amountValidation.valid}
                className={`w-full mt-6 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                  isProcessing || !amountValidation.valid
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </div>
                ) : (
                  `Pagar ${TransbankService.formatChileanAmount(total)}`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-2">
                Al hacer clic en "Pagar", serás redirigido a Webpay Plus para completar tu pago de forma segura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}