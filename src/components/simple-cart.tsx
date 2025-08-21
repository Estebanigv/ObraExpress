"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { EnterpriseCheckout } from './enterprise-checkout';

export function SimpleCart() {
  const { state, toggleCart, removeItem, updateQuantity } = useCart();
  const router = useRouter();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

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
                <div key={item.id} style={{ 
                  marginBottom: '15px', 
                  padding: '12px', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: '#f9fafb'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
                    {item.nombre}
                  </h4>
                  
                  {/* Controles de cantidad */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        style={{
                          width: '24px',
                          height: '24px',
                          backgroundColor: '#22c55e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        +
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    <div>Precio unitario: ${item.precioUnitario.toLocaleString()}</div>
                    <div style={{ fontWeight: 'bold', color: '#1f2937' }}>
                      Total: ${item.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Total del carrito */}
              <div style={{ 
                marginTop: '20px',
                padding: '15px',
                borderTop: '2px solid #e5e7eb',
                backgroundColor: '#f3f4f6'
              }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '15px'
                }}>
                  Total: ${state.total.toLocaleString()}
                </div>
                
                {/* Botón de Checkout Empresarial */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  style={{
                    width: '100%',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                  }}
                >
                  🏢 Facturación Empresarial
                </button>
                
                <div style={{ 
                  fontSize: '11px', 
                  color: '#6b7280',
                  textAlign: 'center',
                  lineHeight: '1.3'
                }}>
                  ✅ Solo facturación empresarial<br />
                  ✅ Pagos seguros con Transbank<br />
                  ✅ Facturación automática
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Modal de Checkout Empresarial */}
      <EnterpriseCheckout 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </>
  );
}