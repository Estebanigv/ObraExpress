"use client";

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { NavbarSimple } from '@/components/navbar-simple';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProductImage } from '@/components/optimized-image';

interface ProductVariant {
  sku: string;
  nombre_completo: string;
  color: string;
  dimensiones: string;
  espesor?: string;
  precio_neto: number;
  precio_iva: number;
  peso: number;
  usos: string;
}

// Datos de ejemplo basados en el Excel procesado
const PRODUCTOS_DATA: Record<string, { 
  nombre: string; 
  descripcion: string; 
  categoria: string; 
  variantes: ProductVariant[];
  imagen_principal: string;
}> = {
  'policarbonato-ondulado-delgado': {
    nombre: 'Policarbonato Ondulado Delgado',
    descripcion: 'Láminas onduladas livianas de policarbonato de 0.5mm, ideales para techos residenciales, tragaluces y cubiertas livianas.',
    categoria: 'Policarbonatos',
    imagen_principal: '/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp',
    variantes: [
      {
        sku: '111001101',
        nombre_completo: 'Policarbonato ondulado delgado clear 0,81x2,00',
        color: 'Clear',
        dimensiones: '0.81m x 2.00m',
        espesor: '0.5mm',
        precio_neto: 7523,
        precio_iva: 8952,
        peso: 1.0,
        usos: 'Techos, tragaluces, cubiertas de piscinas, invernaderos, centros deportivos, centros comerciales, supermercados, diseños arquitectónicos, divisiones de espacios, paredes translúcidas, marquesinas y proyectos de diseño.'
      },
      {
        sku: '111002101',
        nombre_completo: 'Policarbonato ondulado delgado clear 0,81x2,50',
        color: 'Clear',
        dimensiones: '0.81m x 2.50m',
        espesor: '0.5mm',
        precio_neto: 9404,
        precio_iva: 11191,
        peso: 1.25,
        usos: 'Techos, tragaluces, cubiertas de piscinas, invernaderos, centros deportivos, centros comerciales, supermercados, diseños arquitectónicos, divisiones de espacios, paredes translúcidas, marquesinas y proyectos de diseño.'
      },
      {
        sku: '111001102',
        nombre_completo: 'Policarbonato ondulado delgado bronce 0,81x2,00',
        color: 'Bronce',
        dimensiones: '0.81m x 2.00m',
        espesor: '0.5mm',
        precio_neto: 7523,
        precio_iva: 8952,
        peso: 1.0,
        usos: 'Techos, tragaluces, cubiertas de piscinas, invernaderos, centros deportivos, centros comerciales, supermercados, diseños arquitectónicos, divisiones de espacios, paredes translúcidas, marquesinas y proyectos de diseño.'
      },
      {
        sku: '111002102',
        nombre_completo: 'Policarbonato ondulado delgado bronce 0,81x2,50',
        color: 'Bronce',
        dimensiones: '0.81m x 2.50m',
        espesor: '0.5mm',
        precio_neto: 9404,
        precio_iva: 11191,
        peso: 1.25,
        usos: 'Techos, tragaluces, cubiertas de piscinas, invernaderos, centros deportivos, centros comerciales, supermercados, diseños arquitectónicos, divisiones de espacios, paredes translúcidas, marquesinas y proyectos de diseño.'
      }
    ]
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, state } = useCart();
  const { user } = useAuth();
  
  const productId = params.id as string;
  const product = PRODUCTOS_DATA[productId];

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedDimension, setSelectedDimension] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(10);

  const availableColors = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set(product.variantes.map(v => v.color))).sort();
  }, [product]);

  const availableDimensions = useMemo(() => {
    if (!product) return [];
    const filtered = selectedColor 
      ? product.variantes.filter(v => v.color === selectedColor)
      : product.variantes;
    return Array.from(new Set(filtered.map(v => v.dimensiones))).sort();
  }, [product, selectedColor]);

  const selectedVariant = useMemo(() => {
    if (!product || !selectedColor || !selectedDimension) return null;
    return product.variantes.find(v => 
      v.color === selectedColor && v.dimensiones === selectedDimension
    ) || null;
  }, [product, selectedColor, selectedDimension]);

  React.useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  React.useEffect(() => {
    if (availableDimensions.length > 0 && !selectedDimension) {
      setSelectedDimension(availableDimensions[0]);
    }
  }, [availableDimensions, selectedDimension]);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    const item = {
      id: selectedVariant.sku,
      tipo: 'producto' as const,
      nombre: selectedVariant.nombre_completo,
      descripcion: product.descripcion,
      cantidad: quantity,
      precioUnitario: selectedVariant.precio_iva,
      total: selectedVariant.precio_iva * quantity,
      imagen: product.imagen_principal,
      especificaciones: [
        `SKU: ${selectedVariant.sku}`,
        `Color: ${selectedVariant.color}`,
        `Dimensiones: ${selectedVariant.dimensiones}`,
        `Peso: ${selectedVariant.peso} kg`
      ]
    };
    
    addItem(item);
  };

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50">
        <NavbarSimple />
        <div className="pt-56 pb-20">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
            <button
              onClick={() => router.push('/productos')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3 px-6 rounded-xl"
            >
              Ver todos los productos
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <NavbarSimple />
      
      <div className="pt-56 pb-20">
        <div className="container mx-auto px-6">
          <div className="mb-8">
            <nav className="flex space-x-2 text-sm">
              <button onClick={() => router.push('/')} className="text-gray-500 hover:text-gray-700">Inicio</button>
              <span className="text-gray-400">/</span>
              <button onClick={() => router.push('/productos')} className="text-gray-500 hover:text-gray-700">Productos</button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{product.nombre}</span>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <ProductImage
                src={product.imagen_principal}
                alt={product.nombre}
                className="w-full h-96 object-cover"
              />
            </div>

            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.nombre}</h1>
                <p className="text-xl text-gray-600">{product.descripcion}</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 border-b pb-4">Configurar Producto</h2>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">Color</label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`p-4 rounded-xl border font-medium transition-all ${
                          selectedColor === color
                            ? 'border-yellow-500 bg-yellow-50 text-yellow-900'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">Dimensiones</label>
                  <select
                    value={selectedDimension}
                    onChange={(e) => setSelectedDimension(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 text-lg"
                  >
                    {availableDimensions.map(dim => (
                      <option key={dim} value={dim}>{dim}</option>
                    ))}
                  </select>
                </div>

                {selectedVariant && (
                  <div className="bg-yellow-50 rounded-xl p-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">SKU:</span>
                        <span className="font-semibold">{selectedVariant.sku}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Precio neto:</span>
                        <span className="font-semibold">${selectedVariant.precio_neto.toLocaleString()} CLP</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-900 font-medium">Precio c/IVA:</span>
                        <span className="text-2xl font-bold text-yellow-600">
                          ${selectedVariant.precio_iva.toLocaleString()} CLP
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">Cantidad (mínimo 10 unidades)</label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setQuantity(Math.max(10, quantity - 10))}
                      className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-semibold"
                    >
                      -10
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(10, parseInt(e.target.value) || 10))}
                      min="10"
                      step="10"
                      className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 text-center font-semibold text-xl"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 10)}
                      className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-semibold"
                    >
                      +10
                    </button>
                  </div>
                  {selectedVariant && (
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Total: ${(selectedVariant.precio_iva * quantity).toLocaleString()} CLP
                    </p>
                  )}
                </div>

                {selectedVariant && (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold py-5 px-8 rounded-xl transition-all transform hover:scale-[1.02] text-lg"
                  >
                    Agregar {quantity} al Carrito
                  </button>
                )}
              </div>

              {selectedVariant && selectedVariant.usos && (
                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Usos y Aplicaciones</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedVariant.usos}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
