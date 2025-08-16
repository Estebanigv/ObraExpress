'use client';

import React, { useState } from 'react';
import { AIInputField } from './ai-input';

const FloatingChatbot: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(true);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

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