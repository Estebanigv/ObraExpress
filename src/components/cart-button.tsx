"use client";

import React from 'react';
import { useCart } from '@/contexts/CartContext';

export function CartButton() {
  const { state, toggleCart } = useCart();

  const totalItems = state.items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <button
      onClick={toggleCart}
      className="relative flex items-center space-x-2 text-black hover:text-gray-700 transition-colors py-1 px-2 rounded-lg hover:bg-black/5"
      title="Ver carrito de compras"
    >
      {/* Icono del carrito */}
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5H17M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6M7 13H5M17 13h2" />
      </svg>
      
      {/* Texto (oculto en móviles) */}
      <span className="hidden sm:inline text-sm font-medium">Carrito</span>
      
      {/* Badge de cantidad */}
      {totalItems > 0 && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg">
          {totalItems}
        </div>
      )}
    </button>
  );
}