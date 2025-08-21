"use client";

import React, { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { TechnicalSpecsModal } from './technical-specs-modal';
import { getProductSpecifications } from '@/utils/product-specifications';
import { DispatchCalendarModal } from './dispatch-calendar-modal';
import { formatCurrency } from '@/utils/format-currency';

interface ProductVariant {
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  tipo: string;
  precio_neto: number;
  precio_con_iva: number;
  espesor: string;
  dimensiones: string;
  color: string;
  uso: string;
  stock: number;
  uv_protection: boolean;
  garantia: string;
}

interface ProductGroup {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  variantes: ProductVariant[];
  colores: string[];
  precio_desde: number;
  stock_total: number;
  variantes_count: number;
  imagen: string;
}

interface ProductConfiguratorSimpleProps {
  productGroup: ProductGroup;
  className?: string;
}

export function ProductConfiguratorSimple({ productGroup, className = '' }: ProductConfiguratorSimpleProps) {
  const { addItem, removeItem, state } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSpecsModalOpen, setIsSpecsModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [selectedDispatchDate, setSelectedDispatchDate] = useState<string>('');
  
  // Estados para las selecciones del usuario
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    productGroup.variantes?.[0] || {} as ProductVariant
  );
  // Determinar cantidad mínima e inicial basada en el precio
  const getMinQuantity = () => {
    const precio = selectedVariant.precio_con_iva || productGroup.precio_desde;
    return precio > 100000 ? 1 : 10; // Si el precio supera $100.000, cantidad mínima es 1
  };

  const [quantity, setQuantity] = useState(getMinQuantity());
  
  // Estados para filtros dinámicos
  const [selectedColor, setSelectedColor] = useState<string>(productGroup.variantes?.[0]?.color || '');
  const [selectedEspesor, setSelectedEspesor] = useState<string>(productGroup.variantes?.[0]?.espesor || '');
  const [selectedDimension, setSelectedDimension] = useState<string>(productGroup.variantes?.[0]?.dimensiones || '');
  
  // Verificar si el producto está en el carrito
  const isInCart = state.items.some(item => item.id === selectedVariant.codigo);

  // Efecto para leer la fecha de despacho de los searchParams
  useEffect(() => {
    const fechaParam = searchParams.get('fecha');
    if (fechaParam) {
      setSelectedDispatchDate(fechaParam);
    }
  }, [searchParams]);

  // Efecto para ajustar cantidad inicial cuando cambie la variante
  useEffect(() => {
    if (selectedVariant.precio_con_iva) {
      const newMinQuantity = selectedVariant.precio_con_iva > 100000 ? 1 : 10;
      setQuantity(newMinQuantity);
    }
  }, [selectedVariant.codigo]); // Solo cuando cambie el código de variante

  // Función para formatear la fecha de despacho
  const getDispatchDateText = () => {
    if (selectedDispatchDate) {
      const date = new Date(selectedDispatchDate + 'T00:00:00');
      return date.toLocaleDateString('es-CL', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'short' 
      });
    }
    return null;
  };

  // Función para manejar la selección de fecha de despacho
  const handleDispatchDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDispatchDate(dateString);
    
    // Actualizar la URL con la nueva fecha
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('fecha', dateString);
    router.push(currentUrl.pathname + currentUrl.search);
    
    setIsCalendarModalOpen(false);
  };

  const handleViewDetails = () => {
    router.push(`/productos/${productGroup.id}`);
  };

  const handleShowSpecs = () => {
    setIsSpecsModalOpen(true);
  };

  const handleAddToCart = () => {
    if (selectedVariant && selectedVariant.codigo) {
      const item = {
        id: selectedVariant.codigo,
        tipo: 'producto' as const,
        nombre: selectedVariant.nombre,
        descripcion: selectedVariant.descripcion,
        cantidad: quantity,
        precioUnitario: selectedVariant.precio_con_iva,
        total: selectedVariant.precio_con_iva * quantity,
        imagen: productGroup.imagen,
        especificaciones: [
          `Código: ${selectedVariant.codigo}`,
          `Espesor: ${selectedVariant.espesor}`,
          `Dimensiones: ${selectedVariant.dimensiones}`,
          `Color: ${selectedVariant.color}`,
          `Protección UV: ${selectedVariant.uv_protection ? 'Sí' : 'No'}`,
          `Garantía: ${selectedVariant.garantia}`
        ]
      };
      addItem(item);
    }
  };

  const productSpecs = getProductSpecifications(productGroup);

  // Obtener opciones únicas de las variantes
  const uniqueColors = [...new Set(productGroup.variantes?.map(v => v.color) || [])];
  const uniqueThicknesses = [...new Set(productGroup.variantes?.map(v => v.espesor) || [])];
  const uniqueDimensions = [...new Set(productGroup.variantes?.map(v => v.dimensiones) || [])];

  // Función para encontrar variante compatible
  const findVariant = (color: string, espesor: string, dimension: string) => {
    return productGroup.variantes?.find(v => 
      v.color === color && 
      v.espesor === espesor && 
      v.dimensiones === dimension
    ) || selectedVariant;
  };

  // Handlers para cambios de configuración
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const newVariant = findVariant(color, selectedEspesor, selectedDimension);
    setSelectedVariant(newVariant);
    // Actualizar cantidad si el nuevo precio requiere cantidad mínima diferente
    const newMinQuantity = newVariant.precio_con_iva > 100000 ? 1 : 10;
    if (quantity < newMinQuantity) {
      setQuantity(newMinQuantity);
    }
  };

  const handleEspesorChange = (espesor: string) => {
    setSelectedEspesor(espesor);
    const newVariant = findVariant(selectedColor, espesor, selectedDimension);
    setSelectedVariant(newVariant);
    // Actualizar cantidad si el nuevo precio requiere cantidad mínima diferente
    const newMinQuantity = newVariant.precio_con_iva > 100000 ? 1 : 10;
    if (quantity < newMinQuantity) {
      setQuantity(newMinQuantity);
    }
  };

  const handleDimensionChange = (dimension: string) => {
    setSelectedDimension(dimension);
    const newVariant = findVariant(selectedColor, selectedEspesor, dimension);
    setSelectedVariant(newVariant);
    // Actualizar cantidad si el nuevo precio requiere cantidad mínima diferente
    const newMinQuantity = newVariant.precio_con_iva > 100000 ? 1 : 10;
    if (quantity < newMinQuantity) {
      setQuantity(newMinQuantity);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden ${className} flex flex-col product-card-mobile product-card-mobile-md product-card-tablet`}>
      <div className="p-4 sm:p-5 lg:p-6 flex-1">
        {/* Imagen */}
        <div className="bg-gray-100 rounded-xl h-48 mb-3 overflow-hidden product-image img-mobile">
          <img
            src={productGroup.imagen}
            alt={`${productGroup.nombre} - ${productGroup.descripcion}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Información básica */}
        <div className="mb-3 flex items-center justify-between">
          <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
            {productGroup.categoria}
          </span>
          {isInCart && (
            <div className="relative">
              <div className="flex items-center bg-white border-2 border-emerald-500 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                <div className="w-4 h-4 bg-emerald-500 rounded-sm flex items-center justify-center mr-1">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                En carrito
              </div>
              {/* Globito rojo con cantidad */}
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
                {state.items.filter(item => item.id === selectedVariant.codigo).reduce((sum, item) => sum + item.cantidad, 0)}
              </div>
            </div>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {productGroup.nombre}
        </h3>
        
        <div className="mb-3 h-10 flex items-start">
          <p className="text-gray-600 text-sm line-clamp-2">
            {productGroup.descripcion}
          </p>
        </div>

        {/* Información del producto seleccionado */}
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm w-full">
            <div>
              <span className="text-gray-500">Color:</span>
              <span className="font-medium ml-1">{selectedVariant.color || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500">Espesor:</span>
              <span className="font-medium ml-1">{selectedVariant.espesor || 'N/A'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Dimensiones:</span>
              <span className="font-medium ml-1">{selectedVariant.dimensiones || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Precio y Stock */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-2xl font-bold text-gray-900">
              ${formatCurrency(selectedVariant.precio_con_iva || productGroup.precio_desde)}
            </div>
            <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">IVA incluido</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-green-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Stock: {selectedVariant.stock || productGroup.stock_total}</span>
            </div>
            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors cursor-pointer hover:bg-blue-50 px-2 py-1 rounded touch-target flex items-center"
            >
              <span>🚚 {getDispatchDateText() || 'Elegir día despacho'}</span>
              {selectedDispatchDate && (
                <svg className="w-4 h-4 ml-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {/* Configuración de Producto */}
        <div className="space-y-4">
          {/* Selección de Color */}
          {uniqueColors.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color: <span className="text-yellow-600 font-semibold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      selectedColor === color 
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-800 shadow-sm' 
                        : 'border-gray-200 hover:border-yellow-300 bg-white hover:bg-yellow-50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selección de Espesor */}
          {uniqueThicknesses.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Espesor: <span className="text-yellow-600 font-semibold">{selectedEspesor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueThicknesses.map((espesor) => (
                  <button
                    key={espesor}
                    onClick={() => handleEspesorChange(espesor)}
                    className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      selectedEspesor === espesor 
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-800 shadow-sm' 
                        : 'border-gray-200 hover:border-yellow-300 bg-white hover:bg-yellow-50'
                    }`}
                  >
                    {espesor}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selección de Dimensiones */}
          {uniqueDimensions.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensiones: <span className="text-yellow-600 font-semibold">{selectedDimension}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueDimensions.map((dimension) => (
                  <button
                    key={dimension}
                    onClick={() => handleDimensionChange(dimension)}
                    className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                      selectedDimension === dimension 
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-800 shadow-sm' 
                        : 'border-gray-200 hover:border-yellow-300 bg-white hover:bg-yellow-50'
                    }`}
                  >
                    {dimension}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cantidad - Optimizada para móvil */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-600 mb-2 form-label-mobile">
              <svg className="w-4 h-4 inline mr-1 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Cantidad: 
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full ml-2">
                {selectedVariant.precio_con_iva > 100000 ? '(mín. 1 unidad)' : '(mín. 10 unidades)'}
              </span>
            </label>
            <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg p-2 touch-target">
              <button
                onClick={() => {
                  const minQty = selectedVariant.precio_con_iva > 100000 ? 1 : 10;
                  const increment = selectedVariant.precio_con_iva > 100000 ? 1 : 10;
                  setQuantity(Math.max(minQty, quantity - increment));
                }}
                className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                disabled={quantity <= (selectedVariant.precio_con_iva > 100000 ? 1 : 10)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                </svg>
              </button>
              <div className="flex-1 text-center">
                <div className="text-lg font-bold text-gray-900">
                  {quantity}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedVariant.precio_con_iva > 100000 ? 'unidades' : 'metros'}
                </div>
              </div>
              <button
                onClick={() => {
                  const increment = selectedVariant.precio_con_iva > 100000 ? 1 : 10;
                  setQuantity(quantity + increment);
                }}
                className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-100 rounded-lg transition-colors shadow-sm touch-target"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Total calculado */}
          <div className="text-right mb-4">
            <div className="text-sm text-gray-600">Total:</div>
            <div className="text-xl font-bold text-green-600">
              ${formatCurrency((selectedVariant.precio_con_iva || 0) * quantity)}
            </div>
          </div>
        </div>

      </div>
      
      {/* Contenedor de botones - posición fija en la parte inferior */}
      <div className="p-4 sm:p-5 lg:p-6 bg-white border-t border-gray-100 flex-shrink-0">
        {/* Botón de compra directo */}
        <div className="relative">
          {!isInCart ? (
            <button
              onClick={handleAddToCart}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 px-4 rounded-lg transition-colors mb-3 flex items-center justify-center btn-mobile btn-touch touch-target"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M16 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              Agregar al Carrito
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Botón Agregar Más - Verde para acción positiva */}
              <button
                onClick={handleAddToCart}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center btn-mobile btn-touch touch-target"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="hidden sm:inline">Más</span>
                <span className="sm:hidden">+</span>
              </button>
              
              {/* Botón Quitar - Rojo para acción de eliminación */}
              <button
                onClick={() => {
                  removeItem(selectedVariant.codigo);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center btn-mobile btn-touch touch-target"
                title="Quitar producto del carrito"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Quitar</span>
                <span className="sm:hidden">✕</span>
              </button>
            </div>
          )}
        </div>

        {/* Botones de acción principal */}
        <div className="flex gap-3 btn-group-mobile btn-group-mobile-md">
          <button
            onClick={handleViewDetails}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center btn-mobile-md btn-touch touch-target"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Ver Detalles
          </button>
          <button
            onClick={handleShowSpecs}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center min-w-[50px] btn-touch touch-target"
            title="Especificaciones técnicas"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal de Especificaciones Técnicas */}
      <TechnicalSpecsModal
        isOpen={isSpecsModalOpen}
        onClose={() => setIsSpecsModalOpen(false)}
        productName={productSpecs.name}
        productType={productSpecs.type}
        specifications={productSpecs.specifications}
        applications={productSpecs.applications}
        advantages={productSpecs.advantages}
      />

      {/* Modal de Calendario de Despacho */}
      <DispatchCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        productType={productGroup.categoria}
        onDateSelect={handleDispatchDateSelect}
      />
    </div>
  );
}