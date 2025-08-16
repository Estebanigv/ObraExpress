"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const WEBHOOK_URL = 'https://n8n.srv865688.hstgr.cloud/webhook/60a0fb64-995b-450e-8a36-cfb498269c30';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Iniciar cerrado
  const [isMinimized, setIsMinimized] = useState(true); // Iniciar como pelotita
  const [isExpanded, setIsExpanded] = useState(false); // Estado de expansión
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // Detectar primera interacción
  const [showCalendar, setShowCalendar] = useState(false); // Mostrar calendario
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Fecha seleccionada
  const [scrollY, setScrollY] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Hola! Soy la asistente virtual de POLIMAX. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Función para calcular próximos jueves disponibles
  const getAvailableThursdays = () => {
    const today = new Date();
    const thursdays = [];
    
    for (let i = 0; i < 8; i++) { // Próximos 8 jueves
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date.getDay() === 4) { // 4 = jueves
        // Si es miércoles y el jueves es mañana, saltarlo
        if (today.getDay() === 3 && i === 1) {
          continue;
        }
        thursdays.push(new Date(date));
      }
    }
    
    // Si no encontramos suficientes jueves, buscar más
    let searchDate = new Date(today);
    searchDate.setDate(today.getDate() + 8);
    
    while (thursdays.length < 6) {
      if (searchDate.getDay() === 4) {
        thursdays.push(new Date(searchDate));
      }
      searchDate.setDate(searchDate.getDate() + 1);
    }
    
    return thursdays;
  };

  // Función para formatear fecha en español
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Función para formatear texto con numeración y saltos de línea
  const formatMessageText = (text: string) => {
    // Primero normalizar y proteger medidas y datos técnicos que no deben separarse
    let formattedText = text
      // Normalizar abreviaciones: milímetros → mm, centímetros → cm, metros → m
      .replace(/milímetros?/gi, 'mm')
      .replace(/centímetros?/gi, 'cm')
      .replace(/metros cuadrados?/gi, 'm²')
      .replace(/\bmetros?\b/gi, 'm')
      // Proteger medidas simples sin unidades (como "2x1", "3 x 2")
      .replace(/\b(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\b/gi, '{{MEDIDA_SIMPLE:$&}}')
      // Proteger medidas complejas con múltiples dimensiones
      .replace(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*(mm|cm|m|m²|m³)/gi, '{{MEDIDA3D:$&}}')
      // Proteger medidas con "de" (ej: "2 x 1 de 6 mm")
      .replace(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*de\s*(\d+\.?\d*)\s*(mm|cm|m|m²)/gi, '{{MEDIDA_DE:$&}}')
      // Proteger medidas bidimensionales con unidades (ej: "10mm x 5mm", "3.5 x 2.1 cm")
      .replace(/(\d+\.?\d*)\s*(mm|cm|m|m²)?\s*x\s*(\d+\.?\d*)\s*(mm|cm|m|m²)/gi, '{{MEDIDA2D:$&}}')
      // Proteger metraje y unidades de área/volumen
      .replace(/(\d+\.?\d*)\s+(m²|m³|metraje|metro lineal|metros lineales|ml)/gi, '{{UNIDAD_AREA:$&}}')
      // Proteger todas las dimensiones individuales con unidades
      .replace(/(\d+\.?\d*)\s+(mm|cm|m|kg|gr?|lb|oz|"|unidades|unidad|ud|uds)/gi, '{{UNIDAD:$&}}')
      // Proteger dimensiones pegadas sin espacio
      .replace(/(\d+\.?\d*)(mm|cm|m|m²|m³|kg|gr|lb|oz|"|ud)/gi, '{{UNIDAD_PEGADA:$&}}')
      // Proteger rangos de medidas
      .replace(/(entre|de)\s+(\d+\.?\d*)\s+(y|a)\s+(\d+\.?\d*)\s+(mm|cm|m|m²|unidades)/gi, '{{RANGO:$&}}')
      // Proteger cantidades mínimas y reglas de negocio
      .replace(/(mínimo|mín|desde)\s+(\d+)\s+(unidades|unidad|ud|uds)/gi, '{{MINIMO:$&}}')
      // Saltos de línea solo antes de números seguidos de punto (listas numeradas reales)
      .replace(/([.!?])\s*(\d+\.)\s*([A-Z])/g, '$1\n\n$2 $3')
      // Saltos de línea antes de viñetas
      .replace(/([.!?])\s*([•\-\*])\s*/g, '$1\n$2 ')
      // Salto de línea después de dos puntos si viene una oración completa
      .replace(/:\s*([A-Z][^.!?]*[.!?])/g, ':\n$1')
      // Remover saltos iniciales y espacios extra
      .replace(/^[\n\s]+/, '')
      .replace(/\n{3,}/g, '\n\n') // Máximo 2 saltos consecutivos
      // Restaurar todas las medidas y unidades protegidas
      .replace(/\{\{MEDIDA_SIMPLE:(.*?)\}\}/g, '$1')
      .replace(/\{\{MEDIDA3D:(.*?)\}\}/g, '$1')
      .replace(/\{\{MEDIDA_DE:(.*?)\}\}/g, '$1')
      .replace(/\{\{MEDIDA2D:(.*?)\}\}/g, '$1')
      .replace(/\{\{UNIDAD_AREA:(.*?)\}\}/g, '$1')
      .replace(/\{\{RANGO:(.*?)\}\}/g, '$1')
      .replace(/\{\{MINIMO:(.*?)\}\}/g, '$1')
      .replace(/\{\{UNIDAD:(.*?)\}\}/g, '$1')
      .replace(/\{\{UNIDAD_PEGADA:(.*?)\}\}/g, '$1')
      .trim();

    const lines = formattedText.split('\n');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={index} style={{ height: '0.5rem' }} />; // Espaciado para líneas vacías
      
      return (
        <div key={index} className={`${
          // Estilo especial para líneas numeradas (solo si empiezan con número.)
          /^\d+\.\s/.test(trimmedLine) ? 'font-medium mt-2 first:mt-0' : ''
        } ${
          // Estilo para viñetas
          /^[•\-\*]/.test(trimmedLine) ? 'ml-2 mt-1' : ''
        }`}>
          {trimmedLine}
        </div>
      );
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // El chat mantiene su calendario independiente para usuarios que lo usen directamente

  // Debug effect para verificar cambios de estado
  useEffect(() => {
    console.log('🔄 Estado cambió:', { isMinimized, isOpen });
  }, [isMinimized, isOpen]);

  // Detectar scroll para minimizar chat si está muy abajo
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Si el chat está abierto y hace mucho scroll, retraer al círculo
      if (!isMinimized && isOpen && currentScrollY > 300) {
        setIsMinimized(true);
        setIsOpen(false);
        setIsExpanded(false); // También contraer si estaba expandido
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMinimized, isOpen]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Si es la primera interacción del usuario, expandir automáticamente
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
      setIsExpanded(true);
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          timestamp: new Date().toISOString(),
          user_id: 'web_user',
          source: 'polimax_website'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add bot response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response || data.message || 'Gracias por tu mensaje. Te responderemos pronto.',
          isUser: false,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Lo siento, hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente o contáctanos directamente.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  // LÓGICA SIMPLE: Solo pelotita o chat abierto
  console.log('🔍 Estados actuales:', { isMinimized, isOpen, scrollY });

  // CASO 1: Pelotita flotante (por defecto)
  if (isMinimized) {
    console.log('⚫ Renderizando PELOTITA');
    return (
      <div className="fixed bottom-6 right-6 z-50" data-chatbot>
        <button
          onClick={() => {
            setIsOpen(true); 
            setIsMinimized(false);
            // Si el usuario ya interactuó antes, abrir expandido
            if (hasUserInteracted) {
              setIsExpanded(true);
            }
          }}
          className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-gray-800/90 to-black/90 hover:from-gray-700/90 hover:to-gray-900/90 backdrop-blur-sm text-white shadow-2xl hover:shadow-black/50 transition-all duration-300 hover:scale-110 border border-gray-600/50"
          title="Abrir chat con POLIMAX"
        >
          <svg className="w-8 h-8 mx-auto text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    );
  }

  // CASO 2: Chat conversacional abierto
  if (!isMinimized && isOpen) {
    console.log('💬 Renderizando CHAT CONVERSACIONAL');
    return (
      <div className="fixed bottom-6 right-6 z-50" data-chatbot>
        {/* Chat Window */}
        {isOpen && (
        <div className={`mb-4 bg-gradient-to-br from-gray-900/85 to-black/85 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-600/50 flex flex-col animate-in slide-in-from-bottom-5 duration-300 transition-all ${
          isExpanded 
            ? 'w-[500px] h-[650px]' 
            : 'w-96 h-[500px]'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800/90 to-black/90 backdrop-blur-sm text-white p-4 rounded-t-2xl flex items-center justify-between border-b border-gray-600/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-sm">Asistente POLIMAX</h3>
                <p className="text-xs text-gray-300">En línea</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-gray-300 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
                title="Fechas de despacho disponibles"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-300 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
                title={isExpanded ? "Contraer chat" : "Expandir chat"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isExpanded ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  )}
                </svg>
              </button>
              <button
                onClick={() => {setIsOpen(false); setIsMinimized(true); setIsExpanded(false);}}
                className="text-gray-300 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
                title="Minimizar chat"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-900/30 to-black/30 backdrop-blur-sm">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'} ${isExpanded ? 'max-w-[85%]' : 'max-w-[75%]'}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-lg ${
                      message.isUser
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                        : 'bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-sm text-gray-800 border border-gray-200/60 rounded-bl-md'
                    }`}
                  >
                    <div className="text-sm leading-relaxed">{formatMessageText(message.text)}</div>
                  </div>
                  <div className={`flex items-center mt-1 px-2 ${message.isUser ? 'flex-row' : 'flex-row'}`}>
                    <p className={`text-xs ${
                      message.isUser ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {message.isUser && (
                      <div className="ml-2 flex items-center space-x-1">
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <svg className="w-4 h-4 text-blue-400 -ml-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className={`flex flex-col items-start ${isExpanded ? 'max-w-[85%]' : 'max-w-[75%]'}`}>
                  <div className="bg-gradient-to-br from-white/95 to-gray-50/95 backdrop-blur-sm text-gray-800 border border-gray-200/60 px-4 py-3 rounded-2xl rounded-bl-md shadow-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Calendar Component */}
            {showCalendar && (
              <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50/95 to-teal-50/95 backdrop-blur-sm border border-emerald-200/60 rounded-2xl shadow-lg">
                <div className="text-center mb-4">
                  <h4 className="text-sm font-bold text-emerald-900">🛍️ Sistema de Compras POLIMAX</h4>
                  <p className="text-xs text-emerald-700 mt-1">Coordina tu despacho y finaliza tu pedido</p>
                </div>
                
                {/* Información del Sistema de Compras */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 mb-4 border border-emerald-100">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="text-emerald-800">Venta mínima: 10 unidades</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-blue-800">Solo despacho a domicilio</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span className="text-orange-800">Medidas especificadas</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      <span className="text-purple-800">Despachos solo jueves</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center mb-3">
                  <h5 className="text-sm font-bold text-emerald-900">📅 Fechas de Despacho Disponibles</h5>
                  <p className="text-xs text-emerald-700 mt-1">Selecciona tu fecha preferida para coordinar el despacho:</p>
                  <p className="text-xs text-orange-700 font-medium mt-1">⚠️ Pedidos del miércoles van para el jueves siguiente</p>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getAvailableThursdays().map((thursday, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedDate(thursday);
                        setShowCalendar(false);
                        // Agregar mensaje automático con fecha seleccionada
                        const dateMessage = {
                          id: (Date.now() + Math.random()).toString(),
                          text: `✅ ¡Perfecto! Fecha de despacho coordinada para: ${formatDate(thursday)}

🛍️ PRÓXIMOS PASOS PARA TU COMPRA:
1. Especifica los productos y medidas exactas (mm, cm, m, m²)
2. Confirma la cantidad (mínimo 10 unidades)
3. Proporciona dirección de despacho
4. Coordinamos el pago y confirmación final

📦 INFORMACIÓN DE DESPACHO:
• Fecha programada: ${formatDate(thursday)}
• Horario: Disponible todo el jueves
• Tipo: Despacho a domicilio exclusivo
• Sin costo adicional en la Región Metropolitana

💬 ¿Qué productos necesitas? Puedes describir tu proyecto y te ayudaremos con las especificaciones técnicas.`,
                          isUser: false,
                          timestamp: new Date()
                        };
                        setMessages(prev => [...prev, dateMessage]);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                        selectedDate && selectedDate.getTime() === thursday.getTime()
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                          : 'bg-white/80 text-emerald-900 border-emerald-300/60 hover:bg-emerald-50 hover:border-emerald-400'
                      }`}
                    >
                      <div className="font-medium">
                        {formatDate(thursday)}
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        {index === 0 ? 'Próximo despacho disponible' : `En ${Math.ceil((thursday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días`}
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-emerald-200/60">
                  <p className="text-xs text-emerald-600 text-center">
                    💡 Al seleccionar una fecha, confirmaremos tu pedido para ese jueves
                  </p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-600/50 bg-gradient-to-r from-gray-800/90 to-black/90 backdrop-blur-sm rounded-b-2xl">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm text-white placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
        )}
      </div>
    );
  }

  // CASO 3: Fallback - no debería pasar
  console.log('❌ Estado no válido');
  return null;
};