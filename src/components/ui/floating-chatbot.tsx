'use client';

import React, { useState } from 'react';
import { AIInputField } from './ai-input';
import { useCart } from '@/contexts/CartContext';

const FloatingChatbot: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const { state } = useCart();

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Ocultar chatbot cuando el carrito está abierto
  if (state.isOpen) {
    return null;
  }

  return (
    <AIInputField 
      isFloating={true}
      isMinimized={isMinimized}
      onToggleMinimize={toggleMinimize}
    />
  );
};

export { FloatingChatbot };
export default FloatingChatbot;