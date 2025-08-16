"use client";

import React from 'react';

export function DebugCart() {
  return (
    <div 
      className="fixed top-20 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-[99999] cursor-pointer"
      onClick={() => alert('Cart clicked!')}
      style={{
        position: 'fixed',
        top: '80px',
        right: '16px',
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        zIndex: 99999,
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold'
      }}
    >
      DEBUG CART 🛒
    </div>
  );
}