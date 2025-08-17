"use client";

import React from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

export function SimpleCart() {
  const { state, toggleCart } = useCart();
  const router = useRouter();

  return (
    <>
      {/* Botón con imagen personalizada */}
      <button
        onClick={toggleCart}
        style={{
          position: 'fixed',
          top: '120px',
          right: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: 'white',
          border: '2px solid #eab308',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 999999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px'
        }}
      >
        <Image
          src="/img/ico-paso5-carrocompra-q85.webp"
          alt="Carrito de compras"
          width={36}
          height={36}
          style={{ objectFit: 'contain' }}
        />
        {state.items.length > 0 && (
          <span style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '24px',
            height: '24px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
          }}>
            {state.items.reduce((sum, item) => sum + item.cantidad, 0)}
          </span>
        )}
      </button>

      {/* Panel simple del carrito */}
      {state.isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '300px',
          height: '100vh',
          backgroundColor: 'white',
          zIndex: 999998,
          padding: '20px',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.3)',
          overflow: 'auto'
        }}>
          <h2>Carrito de Compras</h2>
          <button 
            onClick={toggleCart}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
          
          {state.items.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <p style={{ marginBottom: '20px', color: '#666' }}>Tu carrito está vacío</p>
              <button
                onClick={() => {
                  toggleCart();
                  router.push('/productos');
                }}
                style={{
                  backgroundColor: '#eab308',
                  color: 'black',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Ver Productos
              </button>
            </div>
          ) : (
            <div>
              {state.items.map((item) => (
                <div key={item.id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ccc' }}>
                  <h4>{item.nombre}</h4>
                  <p>Cantidad: {item.cantidad}</p>
                  <p>Precio: ${item.precioUnitario.toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}