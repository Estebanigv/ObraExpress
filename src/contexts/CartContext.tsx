"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Tipos para el carrito
export interface CartItem {
  id: string;
  tipo: 'coordinacion' | 'producto'; // Para diferenciar servicios de productos
  nombre: string;
  descripcion: string;
  especificaciones?: string[];
  cantidad: number;
  precioUnitario: number;
  total: number;
  
  // Para productos específicos del cotizador detallado
  espesor?: string;
  color?: string;
  ancho?: number;
  largo?: number;
  area?: number;
  
  // Para coordinación de despacho
  fechaDespacho?: Date;
  region?: string;
  comuna?: string;
  direccion?: string;
  comentarios?: string;
  
  // Para consultas del formulario principal
  tipoProyecto?: string;
  nombreCliente?: string;
  telefonoCliente?: string;
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  descuento: number;
  total: number;
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; cantidad: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  subtotal: 0,
  descuento: 0,
  total: 0,
  isOpen: false
};

// Función para calcular totales con descuentos
function calculateTotals(items: CartItem[], userDiscountPercentage: number = 0): { subtotal: number; descuento: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const descuento = subtotal * (userDiscountPercentage / 100);
  const total = subtotal - descuento;
  
  return { subtotal, descuento, total };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      
      let newItems: CartItem[];
      if (existingItemIndex > -1) {
        // Si el item ya existe, actualizar cantidad
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          cantidad: newItems[existingItemIndex].cantidad + action.payload.cantidad,
          total: (newItems[existingItemIndex].cantidad + action.payload.cantidad) * newItems[existingItemIndex].precioUnitario
        };
      } else {
        // Si no existe, agregarlo
        newItems = [...state.items, action.payload];
      }
      
      const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
      
      return {
        ...state,
        items: newItems,
        total: newTotal
      };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
      
      return {
        ...state,
        items: newItems,
        total: newTotal
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item => 
        item.id === action.payload.id 
          ? { 
              ...item, 
              cantidad: action.payload.cantidad,
              total: action.payload.cantidad * item.precioUnitario 
            }
          : item
      );
      
      const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
      
      return {
        ...state,
        items: newItems,
        total: newTotal
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0
      };
    
    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen
      };
    
    case 'LOAD_CART':
      const total = action.payload.reduce((sum, item) => sum + item.total, 0);
      return {
        ...state,
        items: action.payload,
        total
      };
    
    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, cantidad: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  
  // Nota: useAuth debe ser importado y usado aquí, pero para evitar dependencias circulares,
  // el descuento se calculará en tiempo real en los componentes que lo necesiten

  // Persistir en localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('polimax-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Guardar en localStorage cuando cambie el carrito
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('polimax-cart', JSON.stringify(state.items));
    } else {
      localStorage.removeItem('polimax-cart');
    }
  }, [state.items]);

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, cantidad } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}