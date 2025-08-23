"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { logger } from '@/lib/logger';
import { safeWindow } from '@/lib/client-utils';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import SimpleJellyOrb from './simple-jelly-orb';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const WEBHOOK_URL = 'https://n8n.srv865688.hstgr.cloud/webhook/60a0fb64-995b-450e-8a36-cfb498269c30';

export const Chatbot: React.FC = () => {
  const { state: cartState } = useCart(); // Obtener estado del carrito
  const { user, login, register, logout, loginWithGoogle } = useAuth(); // Hook de autenticación
  const [isOpen, setIsOpen] = useState(false); // Iniciar cerrado
  const [isMinimized, setIsMinimized] = useState(true); // Iniciar como pelotita
  const [isExpanded, setIsExpanded] = useState(false); // Estado de expansión
  const [hasUserInteracted, setHasUserInteracted] = useState(false); // Detectar primera interacción
  const [showCalendar, setShowCalendar] = useState(false); // Mostrar calendario
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Fecha seleccionada
  const [scrollY, setScrollY] = useState(0);
  const [quickResponsesOpen, setQuickResponsesOpen] = useState(true);
  const [quickResponsesMinimized, setQuickResponsesMinimized] = useState(false);
  const [accountMenuExpanded, setAccountMenuExpanded] = useState(false);
  const [hoveredQuickResponse, setHoveredQuickResponse] = useState<string | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [isChatGroupHovered, setIsChatGroupHovered] = useState(false);
  const [showExpandArrow, setShowExpandArrow] = useState(false);
  
  // Estados para autenticación en el chat
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    telefono: ''
  });
  const [authError, setAuthError] = useState('');
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string>(''); // Nombre para usuarios no autenticados
  const [isWaitingForName, setIsWaitingForName] = useState<boolean>(false); // Si estamos esperando el nombre
  // Mensaje inicial dinámico basado en el estado del usuario
  const getInitialMessage = () => {
    if (user) {
      return `¡Hola ${user.nombre}! 👋 Me da mucho gusto verte de nuevo. Soy parte del equipo de ObraExpress y estoy aquí para ayudarte con lo que necesites. ¿En qué proyecto estás trabajando hoy?`;
    } else if (guestName) {
      return `¡Hola ${guestName}! 👋 Me da mucho gusto conocerte. Soy parte del equipo de ObraExpress y estoy aquí para ayudarte con lo que necesites. ¿En qué puedo ayudarte hoy?`;
    } else {
      return '¡Hola! 👋 Me da mucho gusto que estés aquí. Soy parte del equipo de ObraExpress y estoy para ayudarte con lo que necesites. Para brindarte una mejor atención personalizada, **¿podrías decirme tu nombre?**';
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: getInitialMessage(),
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Funciones de autenticación
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (authMode === 'login') {
      const success = await login(authFormData.email, authFormData.password);
      if (success) {
        setShowAuthForm(false);
        setAccountMenuExpanded(false);
        
        // Agregar mensaje de bienvenida del bot
        const welcomeMessage = {
          id: Date.now().toString(),
          text: `¡Hola ${authFormData.email.split('@')[0]}! 👋 Has iniciado sesión correctamente. Ahora puedo ayudarte con tu pedido y procesar tu compra directamente. ¿En qué puedo ayudarte?`,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, welcomeMessage]);
        
        // Limpiar formulario
        setAuthFormData({ email: '', password: '', nombre: '', telefono: '' });
      } else {
        setAuthError('Email o contraseña incorrectos. Prueba con: polimax.store / polimax2025$$');
      }
    } else {
      // Registro
      if (!authFormData.nombre.trim()) {
        setAuthError('El nombre es requerido');
        return;
      }
      
      const success = await register({
        email: authFormData.email,
        password: authFormData.password,
        nombre: authFormData.nombre,
        telefono: authFormData.telefono
      });
      
      if (success) {
        setShowAuthForm(false);
        setAccountMenuExpanded(false);
        
        // Agregar mensaje de bienvenida del bot
        const welcomeMessage = {
          id: Date.now().toString(),
          text: `¡Bienvenido ${authFormData.nombre}! 🎉 Tu cuenta ha sido creada exitosamente. Como nuevo cliente tienes un descuento especial. Ahora puedo ayudarte con tu pedido y procesar tu compra directamente. ¿Qué productos necesitas?`,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, welcomeMessage]);
        
        // Limpiar formulario
        setAuthFormData({ email: '', password: '', nombre: '', telefono: '' });
      } else {
        setAuthError('El email ya está registrado o hay un error');
      }
    }
  };

  const handleLogout = () => {
    logout();
    setAccountMenuExpanded(false);
    
    // Agregar mensaje de despedida
    const logoutMessage = {
      id: Date.now().toString(),
      text: 'Has cerrado sesión. Si quieres hacer un pedido, no olvides identificarte nuevamente para poder procesar tu compra. ¿En qué más puedo ayudarte?',
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, logoutMessage]);
  };

  // Función para crear o actualizar conversación
  const saveConversationToSupabase = async (newMessages: Message[]) => {
    // En modo desarrollo/vercel, usar localStorage en lugar de Supabase
    const authMode = process.env.NEXT_PUBLIC_AUTH_MODE || 'localStorage';
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment || authMode === 'vercel') {
      // Guardar en localStorage para desarrollo
      try {
        const conversationData = {
          session_id: sessionId,
          messages: newMessages,
          timestamp: new Date().toISOString(),
          conversation_id: conversationId || `local_${Date.now()}`
        };
        
        localStorage.setItem(`chat_conversation_${sessionId}`, JSON.stringify(conversationData));
        
        if (!conversationId) {
          setConversationId(conversationData.conversation_id);
        }
      } catch (error) {
        console.error('Error guardando conversación en localStorage:', error);
      }
      return;
    }

    // Código original de Supabase para producción
    try {
      const userAgent = navigator.userAgent;
      const referrer = document.referrer;

      if (!conversationId) {
        // Crear nueva conversación
        const { data, error } = await supabase
          .from('conversaciones_chatbot')
          .insert({
            session_id: sessionId,
            mensajes: newMessages,
            estado_conversacion: 'activa',
            ip_address: null, // No disponible en el cliente
            user_agent: userAgent,
            referrer: referrer || null,
            webhook_enviado: false,
            coordinacion_creada: false
          })
          .select()
          .single();

        if (error) {
          console.error('Error creando conversación:', error);
        } else if (data) {
          setConversationId(data.id);
        }
      } else {
        // Actualizar conversación existente
        const { error } = await supabase
          .from('conversaciones_chatbot')
          .update({
            mensajes: newMessages,
            fecha_despacho_seleccionada: selectedDate ? selectedDate.toISOString().split('T')[0] : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', conversationId);

        if (error) {
          console.error('Error actualizando conversación:', error);
        }
      }
    } catch (error) {
      console.error('Error con Supabase:', error);
    }
  };

  // Función para calcular próximos jueves disponibles para despacho
  const getAvailableDispatchDates = () => {
    const today = new Date();
    const thursdays = [];
    
    // Buscar próximos jueves disponibles
    for (let i = 0; i < 30; i++) { // Buscar en los próximos 30 días
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (date.getDay() === 4) { // 4 = jueves
        // Si es miércoles después de las 15:00, el jueves de mañana no está disponible
        const isWednesdayAfternoon = today.getDay() === 3 && today.getHours() >= 15;
        if (isWednesdayAfternoon && i === 1) {
          continue;
        }
        
        // Si es jueves después de las 12:00, no está disponible para el mismo día
        const isTodayThursdayAfternoon = today.getDay() === 4 && today.getHours() >= 12 && i === 0;
        if (isTodayThursdayAfternoon) {
          continue;
        }
        
        thursdays.push(new Date(date));
        
        // Solo necesitamos 6 fechas disponibles
        if (thursdays.length >= 6) break;
      }
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
    const formattedText = text
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
      
      // Procesar markdown básico para texto en negrita
      const processedLine = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      return (
        <div 
          key={index} 
          className={`w-full ${
            // Estilo especial para líneas numeradas (solo si empiezan con número.)
            /^\d+\.\s/.test(trimmedLine) ? 'font-medium mt-3 mb-1 first:mt-0' : ''
          } ${
            // Estilo para viñetas (pero NO para texto con **)
            /^[•\-\*]/.test(trimmedLine) && !/\*\*.*\*\*/.test(trimmedLine) ? 'ml-3 mt-1.5 pl-2' : ''
          } ${
            // Espaciado normal para párrafos
            !/^(\d+\.|[•\-\*])/.test(trimmedLine) || /\*\*.*\*\*/.test(trimmedLine) ? 'mt-2 leading-relaxed' : ''
          }`}
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Actualizar mensaje inicial cuando cambia el estado del usuario o el nombre del invitado
  useEffect(() => {
    setMessages(prevMessages => {
      const updatedMessages = [...prevMessages];
      updatedMessages[0] = {
        ...updatedMessages[0],
        text: getInitialMessage()
      };
      return updatedMessages;
    });
  }, [user, guestName]);

  // Limpiar clase global cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('chat-is-open');
      }
    };
  }, []);

  // Cerrar menú de cuenta cuando se abre formulario de auth
  useEffect(() => {
    if (showAuthForm) {
      setAccountMenuExpanded(false);
    }
  }, [showAuthForm]);

  // Función para cerrar chat y volver al estado inicial
  const closeChat = useCallback(() => {
    // Quitar clase global del body
    if (typeof document !== 'undefined') {
      document.body.classList.remove('chat-is-open');
    }
    
    // INMEDIATAMENTE volver al estado inicial sin animaciones
    flushSync(() => {
      setIsOpen(false);
      setIsMinimized(true);
      setIsAnimatingOut(false);
      setShowExpandArrow(false);
      setAccountMenuExpanded(false);
      setIsExpanded(false);
      setShowCalendar(false);
      setIsButtonClicked(false);
    });
  }, []);

  // Detectar clics fuera del chat para cerrarlo con animación suave
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatContainerRef.current && 
          !chatContainerRef.current.contains(event.target as Node) && 
          !isMinimized && isOpen && !isAnimatingOut) {
        // Pequeño delay para evitar conflictos con otros eventos
        requestAnimationFrame(() => {
          closeChat();
        });
      }
    };

    // Solo escuchar clics si el chat está abierto
    if (!isMinimized && isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMinimized, isOpen]);

  // El chat mantiene su calendario independiente para usuarios que lo usen directamente

  // Debug effect para verificar cambios de estado
  useEffect(() => {
    logger.log('🔄 Estado cambió:', { isMinimized, isOpen });
  }, [isMinimized, isOpen]);

  // Detectar scroll para minimizar chat si está muy abajo
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = safeWindow.getScrollY();
      setScrollY(currentScrollY);
      
      // Si el chat está abierto y hace mucho scroll, retraer al círculo
      if (!isMinimized && isOpen && currentScrollY > 300) {
        closeChat();
      }
    };

    safeWindow.addEventListener('scroll', handleScroll, { passive: true });
    return () => safeWindow.removeEventListener('scroll', handleScroll);
  }, [isMinimized, isOpen]);

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Cerrar calendario si está abierto al enviar mensaje
    if (showCalendar) {
      setShowCalendar(false);
    }

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

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    
    // Lógica inteligente para capturar nombre de usuarios no autenticados
    if (!user && !guestName && !isWaitingForName) {
      // Primer mensaje: solicitar el nombre
      setIsWaitingForName(true);
      const nameRequestBot: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Perfecto, antes de continuar, **¿podrías decirme tu nombre?** Así podremos personalizar mejor nuestra conversación y brindarte un servicio más cercano. 😊',
        isUser: false,
        timestamp: new Date()
      };
      
      setTimeout(() => {
        const finalMessages = [...updatedMessages, nameRequestBot];
        setMessages(finalMessages);
        saveConversationToSupabase(finalMessages);
      }, 1000);
      return;
    }
    
    // Si estamos esperando el nombre y el usuario no está autenticado
    if (!user && !guestName && isWaitingForName) {
      // Extraer nombre del mensaje (asumir que es solo el nombre)
      const extractedName = message.trim().split(' ')[0]; // Tomar primera palabra como nombre
      
      if (extractedName.length >= 2) {
        setGuestName(extractedName);
        setIsWaitingForName(false);
        
        const welcomeBot: Message = {
          id: (Date.now() + 1).toString(),
          text: `¡Excelente, ${extractedName}! 🎉 Me da mucho gusto conocerte. \n\nAhora que nos conocemos mejor, puedo ayudarte con:\n\n🏗️ **Asesoría técnica** personalizada\n📦 **Cotizaciones** detalladas para tu proyecto\n🚚 **Coordinación de despachos** \n📞 **Seguimiento** de tu pedido\n\n¿En qué proyecto estás trabajando o qué necesitas para tu obra?`,
          isUser: false,
          timestamp: new Date()
        };
        
        setTimeout(() => {
          const finalMessages = [...updatedMessages, welcomeBot];
          setMessages(finalMessages);
          saveConversationToSupabase(finalMessages);
          
          // Después de un momento, ofrecer registro/login para mejorar el servicio
          setTimeout(() => {
            const registrationInvite: Message = {
              id: (Date.now() + 2).toString(),
              text: `💡 **Tip para ${extractedName}:** Si creas una cuenta con nosotros podrás:\n\n✅ **Guardar cotizaciones** y consultar historial\n🎯 **Descuentos exclusivos** para clientes registrados\n📱 **Seguimiento en tiempo real** de tus pedidos\n🚀 **Proceso de compra más rápido**\n\n¿Te gustaría crear una cuenta rápida o ya tienes una cuenta y prefieres iniciar sesión?`,
              isUser: false,
              timestamp: new Date()
            };
            
            setMessages(prev => {
              const newMessages = [...prev, registrationInvite];
              saveConversationToSupabase(newMessages);
              return newMessages;
            });
          }, 3000);
        }, 1500);
        return;
      } else {
        // Nombre muy corto, pedir de nuevo
        const retryBot: Message = {
          id: (Date.now() + 1).toString(),
          text: 'Me puedes decir tu nombre completo, por favor? Así podremos tener una conversación más personalizada. 😊',
          isUser: false,
          timestamp: new Date()
        };
        
        setTimeout(() => {
          const finalMessages = [...updatedMessages, retryBot];
          setMessages(finalMessages);
          saveConversationToSupabase(finalMessages);
        }, 1000);
        return;
      }
    }
    
    // Detectar intenciones de registro o login para usuarios con nombre pero sin cuenta
    if (!user && guestName && !isWaitingForName) {
      const messageText = message.toLowerCase();
      
      // Palabras clave para crear cuenta
      const createAccountKeywords = ['crear cuenta', 'registr', 'nueva cuenta', 'abrir cuenta', 'si', 'sí', 'dale', 'perfecto', 'excelente', 'buena idea'];
      const loginKeywords = ['iniciar sesión', 'login', 'ya tengo', 'tengo cuenta', 'ingres', 'entrar'];
      
      const wantsToCreateAccount = createAccountKeywords.some(keyword => messageText.includes(keyword));
      const wantsToLogin = loginKeywords.some(keyword => messageText.includes(keyword));
      
      if (wantsToCreateAccount) {
        // Ofrecer registro directo
        const registrationBot: Message = {
          id: (Date.now() + 1).toString(),
          text: `¡Perfecto, ${guestName}! 🎉 Crear tu cuenta es súper rápido y te dará acceso a muchos beneficios.\n\n¿Te gustaría que abra el formulario de registro para que puedas crear tu cuenta ahora mismo? Solo necesitamos algunos datos básicos y estarás listo para disfrutar de todos los beneficios.`,
          isUser: false,
          timestamp: new Date()
        };
        
        setTimeout(() => {
          const finalMessages = [...updatedMessages, registrationBot];
          setMessages(finalMessages);
          saveConversationToSupabase(finalMessages);
        }, 1000);
        return;
      }
      
      // Detectar confirmación para abrir formularios
      const confirmationKeywords = ['abr', 'sí', 'si', 'dale', 'perfecto', 'ok', 'está bien', 'por favor', 'hazlo'];
      const wantsToOpenForm = confirmationKeywords.some(keyword => messageText.includes(keyword));
      
      if (wantsToOpenForm) {
        // Buscar en el historial reciente si se ofreció registro o login
        const recentMessages = messages.slice(-3);
        const wasRegistrationOffered = recentMessages.some(msg => 
          !msg.isUser && msg.text.includes('formulario de registro')
        );
        const wasLoginOffered = recentMessages.some(msg => 
          !msg.isUser && msg.text.includes('formulario de inicio de sesión')
        );
        
        if (wasRegistrationOffered) {
          // Redirigir a página de registro
          const openingRegistrationBot: Message = {
            id: (Date.now() + 1).toString(),
            text: `¡Perfecto! Te voy a redirigir a nuestra página de registro donde podrás crear tu cuenta de forma segura. En un momento se abrirá la página... 🚀`,
            isUser: false,
            timestamp: new Date()
          };
          
          setTimeout(() => {
            const finalMessages = [...updatedMessages, openingRegistrationBot];
            setMessages(finalMessages);
            saveConversationToSupabase(finalMessages);
            
            // Redirigir después de mostrar el mensaje
            setTimeout(() => {
              window.open('/register', '_blank');
            }, 1500);
          }, 500);
          return;
        }
        
        if (wasLoginOffered) {
          // Redirigir a página de login
          const openingLoginBot: Message = {
            id: (Date.now() + 1).toString(),
            text: `¡Perfecto! Te voy a redirigir a nuestra página de inicio de sesión para que accedas a tu cuenta de forma segura. En un momento se abrirá la página... 🔐`,
            isUser: false,
            timestamp: new Date()
          };
          
          setTimeout(() => {
            const finalMessages = [...updatedMessages, openingLoginBot];
            setMessages(finalMessages);
            saveConversationToSupabase(finalMessages);
            
            // Redirigir después de mostrar el mensaje
            setTimeout(() => {
              window.open('/login', '_blank');
            }, 1500);
          }, 500);
          return;
        }
      }
      
      if (wantsToLogin) {
        // Ofrecer login directo
        const loginBot: Message = {
          id: (Date.now() + 1).toString(),
          text: `¡Excelente, ${guestName}! 👍 Si ya tienes una cuenta, puedo abrir el formulario de inicio de sesión para ti.\n\n¿Te gustaría que abra la ventana de login para que puedas acceder a tu cuenta?`,
          isUser: false,
          timestamp: new Date()
        };
        
        setTimeout(() => {
          const finalMessages = [...updatedMessages, loginBot];
          setMessages(finalMessages);
          saveConversationToSupabase(finalMessages);
        }, 1000);
        return;
      }
    }
    
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
          source: 'obraexpress_website',
          session_id: sessionId,
          conversation_id: conversationId,
          context: {
            page_url: window.location.href,
            page_title: document.title,
            cart_items: cartState.items.length,
            cart_total: cartState.total,
            user_agent: navigator.userAgent,
            referrer: document.referrer,
            user_name: user ? user.nombre : guestName || 'Usuario anónimo',
            user_type: user ? 'authenticated' : (guestName ? 'guest_with_name' : 'anonymous'),
            selected_dispatch_date: selectedDate ? {
              date: selectedDate.toISOString().split('T')[0],
              formatted: formatDate(selectedDate),
              day_of_week: 'jueves',
              confirmed: true
            } : null,
            conversation_history: messages.slice(-5).map(msg => ({
              text: msg.text,
              isUser: msg.isUser,
              timestamp: msg.timestamp
            })),
            business_info: {
              company: 'ObraExpress / Polimax Chile',
              products: 'Policarbonatos, accesorios, herramientas',
              services: 'Venta, instalación, asesoría técnica',
              contact: {
                phone: '+56963348909',
                email: 'info@obraexpress.cl',
                whatsapp: '+56223456789'
              },
              dispatch: 'Solo jueves de 9:00 a 18:00 hrs',
              dispatch_rules: {
                minimum_order: '10 unidades',
                dispatch_days: 'Solo jueves',
                dispatch_hours: '9:00 a 18:00 hrs',
                coverage: 'Región Metropolitana sin costo adicional'
              }
            }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Mejorar el manejo de la respuesta para conversación más fluida
        let botResponseText = '';
        
        if (data.response) {
          botResponseText = data.response;
        } else if (data.message) {
          botResponseText = data.message;
        } else if (data.reply) {
          botResponseText = data.reply;
        } else if (data.answer) {
          botResponseText = data.answer;
        } else {
          // Respuesta de fallback más natural
          const fallbackResponses = [
            'Gracias por tu consulta. ¿Podrías darme más detalles sobre lo que necesitas?',
            'Entiendo tu pregunta. Déjame ayudarte con eso. ¿Puedes contarme más específicamente qué buscas?',
            'Perfecto, estoy aquí para ayudarte. ¿Te interesa algún producto en particular?',
            'Me da mucho gusto poder asistirte. ¿En qué proyecto estás trabajando?'
          ];
          botResponseText = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }
        
        // Add bot response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          isUser: false,
          timestamp: new Date()
        };

        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);
        
        // Guardar conversación en Supabase
        await saveConversationToSupabase(finalMessages);
        
        // Actualizar conversation_id si viene en la respuesta
        if (data.conversation_id && !conversationId) {
          setConversationId(data.conversation_id);
        }
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      logger.error('Error sending message:', error);
      
      // Add error message más natural
      const errorResponses = [
        'Ups, parece que tengo una pequeña dificultad técnica. ¿Podrías intentar escribirme nuevamente? También puedes llamarnos al +56963348909 si es urgente.',
        'Disculpa, estoy teniendo algunos problemitas de conexión. Mientras tanto, ¿te gustaría que te contacte uno de nuestros asesores directamente?',
        'Lo siento, algo no está funcionando bien de mi lado. Pero no te preocupes, puedes escribirme por WhatsApp al +56223456789 y te atiendo de inmediato.',
        'Ay no, creo que me desconecté un momento. ¿Podrías repetir tu consulta? O si prefieres, puedes llamarnos y hablamos directamente.'
      ];
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorResponses[Math.floor(Math.random() * errorResponses.length)],
        isUser: false,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      // Guardar conversación en Supabase incluso con error
      await saveConversationToSupabase(finalMessages);
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
  logger.log('🔍 Estados actuales:', { isMinimized, isOpen, scrollY });

  // Ocultar chat si el carrito está abierto
  if (cartState.isOpen) {
    return null;
  }

  // CASO 1: Solo botón flotante cuando NO está abierto
  if (!isOpen) {
    logger.log('🔵 Renderizando SOLO BOTÓN FLOTANTE - isOpen:', isOpen);
    return (
      <>
        {/* Estilos para el botón flotante */}
        <style jsx>{`
          .premium-button-float {
            background: linear-gradient(135deg, #64748b 0%, #475569 50%, #334155 100%);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .premium-button-float:hover {
            transform: translateY(-2px) scale(1.05);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        `}</style>

        <div className="fixed bottom-20 right-6 z-[9999999]" data-chatbot>
          <div className="flex items-center gap-3">
            {/* Texto al lado del botón */}
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200 px-3 py-2 rounded-lg shadow-md">
              <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                ¡Pregúntame lo que necesites!
              </p>
            </div>
            
            {/* Botón del chatbot */}
            <SimpleJellyOrb
              onClick={() => {
                // Transformar a chat con animación
                flushSync(() => {
                  setIsOpen(true);
                  setIsMinimized(false);
                  
                  if (hasUserInteracted) {
                    setIsExpanded(true);
                  }
                });
              }}
              title="💬 Hablar con Asistente - ObraExpress"
              isClicked={isButtonClicked}
              isAnimatingOut={isAnimatingOut}
            />
          </div>
        </div>
      </>
    );
  }

  // CASO 2: Chat abierto con overlay oscuro - ocultar TODO lo demás
  if (isOpen) {
    logger.log('💬 Renderizando SOLO CHAT + OVERLAY - isOpen:', isOpen);
    logger.log('💬 TODOS LOS ELEMENTOS FLOTANTES DEBEN ESTAR OCULTOS');
    
    // Agregar clase global al body para ocultar otros elementos flotantes
    if (typeof document !== 'undefined') {
      document.body.classList.add('chat-is-open');
    }
    
    return (
      <>
        {/* Overlay con desenfoque tipo cámara - mantiene la imagen visible pero desenfocada */}
        <div className="fixed inset-0 backdrop-blur-[2px] bg-black/30 z-[999999] transition-all duration-500 ease-out chat-overlay" />
        
        {/* Estilos globales para ocultar TODOS los elementos flotantes cuando el chat está abierto */}
        <style jsx global>{`
          /* Ocultar el propio botón flotante del chatbot */
          body.chat-is-open [data-chatbot] .flex.items-center.gap-3 {
            display: none !important;
          }
          
          /* Ocultar elementos flotantes por atributos data */
          body.chat-is-open [data-floating]:not([data-chatbot]) {
            display: none !important;
          }
          
          /* Ocultar elementos flotantes por clases */
          body.chat-is-open .floating-element:not(.chatbot-element) {
            display: none !important;
          }
          
          /* Ocultar cualquier elemento con clases que contengan "float" */
          body.chat-is-open [class*="float"]:not([data-chatbot]) {
            display: none !important;
          }
          
          /* Ocultar elementos fixed que no sean el chat o el overlay */
          body.chat-is-open [class*="fixed"]:not([data-chatbot]):not(.chat-overlay) {
            display: none !important;
          }
          
          /* Ocultar específicamente elementos comunes de UI flotantes */
          body.chat-is-open .fixed.bottom-0,
          body.chat-is-open .fixed.top-0,
          body.chat-is-open .fixed.right-0,
          body.chat-is-open .fixed.left-0 {
            display: none !important;
          }
          
          /* Ocultar menús de navegación flotantes */
          body.chat-is-open nav:not([data-chatbot]),
          body.chat-is-open .nav:not([data-chatbot]),
          body.chat-is-open .menu:not([data-chatbot]),
          body.chat-is-open .dropdown:not([data-chatbot]) {
            display: none !important;
          }
          
          /* Ocultar botones flotantes de acción */
          body.chat-is-open .fab,
          body.chat-is-open .floating-action-button,
          body.chat-is-open button.fixed:not([data-chatbot]) {
            display: none !important;
          }
          
          /* Ocultar todo lo que tenga z-index alto excepto el chat */
          body.chat-is-open [style*="z-index"]:not([data-chatbot]):not(.chat-overlay) {
            display: none !important;
          }
        `}</style>
        
        {/* Estilos para animaciones premium de vanguardia */}
        <style jsx>{`
        @keyframes premium-expand {
          0% {
            transform: scale(1) translateY(0) rotate(0deg);
            opacity: 1;
            filter: blur(0px) brightness(1);
          }
          25% {
            transform: scale(1.1) translateY(-5px) rotate(1deg);
            opacity: 0.9;
            filter: blur(0.5px) brightness(1.1);
          }
          50% {
            transform: scale(0.95) translateY(-10px) rotate(-0.5deg);
            opacity: 0.7;
            filter: blur(1px) brightness(1.2);
          }
          75% {
            transform: scale(1.05) translateY(-8px) rotate(0.3deg);
            opacity: 0.8;
            filter: blur(0.3px) brightness(1.05);
          }
          100% {
            transform: scale(1) translateY(0) rotate(0deg);
            opacity: 1;
            filter: blur(0px) brightness(1);
          }
        }
        
        @keyframes premium-collapse {
          0% {
            transform: scale(1) translateY(0);
            opacity: 1;
            filter: blur(0px);
          }
          50% {
            transform: scale(1.02) translateY(-3px);
            opacity: 0.8;
            filter: blur(0.5px);
          }
          100% {
            transform: scale(0.98) translateY(2px);
            opacity: 0;
            filter: blur(1px);
          }
        }
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(100, 116, 139, 0.3), 0 0 40px rgba(100, 116, 139, 0.1);
          }
          50% {
            box-shadow: 0 0 30px rgba(100, 116, 139, 0.5), 0 0 60px rgba(100, 116, 139, 0.2);
          }
        }
        
        @keyframes slide-in-elegant {
          0% {
            transform: translateY(20px) scale(0.95);
            opacity: 0;
            filter: blur(3px);
          }
          60% {
            transform: translateY(-2px) scale(1.01);
            opacity: 0.8;
            filter: blur(1px);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
            filter: blur(0px);
          }
        }
        
        .premium-expand {
          animation: premium-expand 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        .premium-collapse {
          animation: premium-collapse 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        
        .chat-glow {
          animation: glow-pulse 2s ease-in-out infinite;
        }
        
        .slide-in-elegant {
          animation: slide-in-elegant 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .glass-morphism {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .premium-button {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(37, 99, 235, 0.2);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .premium-button:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4), 0 4px 12px rgba(37, 99, 235, 0.3);
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%);
        }
      `}</style>

        <div className="fixed bottom-20 right-6 z-[9999999]" data-chatbot>
          {/* Chat general - solo cuando está abierto */}
          {isOpen && (
          <div className="slide-in-elegant chat-glow">
            <div 
              className={`mb-4 glass-morphism bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 flex flex-col transition-all duration-500 ease-out ${
                showCalendar ? 'origin-bottom' : 'origin-bottom-right'
              } ${
                isAnimatingOut 
                  ? 'opacity-0 scale-95' 
                  : 'opacity-100 scale-100'
              } ${
                showCalendar
                  ? 'w-[800px] h-[950px]'
                  : accountMenuExpanded
                  ? 'w-[800px] h-[850px]'
                  : isExpanded 
                  ? 'w-[750px] h-[900px]' 
                  : 'w-[600px] h-[800px]'
              }`}
            >
              {/* Header - Color azul elegante y profesional */}
              <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white p-6 rounded-t-2xl flex items-center justify-between border-b border-slate-600/30">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/30">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" 
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  Especialista ObraExpress
                </h3>
                <div className="flex items-center space-x-1.5 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-300">En línea • Asistente Profesional</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                title="Seleccionar fecha de despacho"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              
              {/* Botón de cuenta en header */}
              <button 
                onClick={() => setAccountMenuExpanded(!accountMenuExpanded)}
                className={`text-gray-300 hover:text-white transition-all p-2 rounded-lg transform ${
                  accountMenuExpanded 
                    ? 'bg-white/20 text-white scale-105' 
                    : 'hover:bg-white/10'
                }`}
                title="Mi cuenta"
              >
                <svg 
                  className={`w-5 h-5 transition-transform duration-300 ${accountMenuExpanded ? 'rotate-12 scale-110' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
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
            </div>
          </div>

          {/* Messages */}
          {/* Menú expandido de cuenta dentro del chat */}
          {accountMenuExpanded && (
            <div className="bg-white border-b border-gray-200 p-3">
              {user ? (
                // Usuario logueado
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-green-800">{user.nombre}</p>
                        <p className="text-xs text-green-600">{user.email}</p>
                        {user.tieneDescuento && (
                          <span className="inline-block mt-1 text-yellow-700 text-xs bg-yellow-200 px-2 py-0.5 rounded-full">
                            🎉 {user.porcentajeDescuento}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full bg-red-50 hover:bg-red-100 p-3 rounded-lg transition-colors flex items-center justify-center gap-2 group"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium text-red-700">Cerrar Sesión</span>
                  </button>
                </div>
              ) : (
                // Usuario no logueado
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => {
                      setAuthMode('login');
                      setShowAuthForm(true);
                      setAccountMenuExpanded(false);
                    }}
                    className="bg-blue-50 hover:bg-blue-100 p-3 rounded-lg transition-colors flex flex-col items-center gap-2 group"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-xs font-medium text-blue-700">Iniciar Sesión</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setAuthMode('register');
                      setShowAuthForm(true);
                      setAccountMenuExpanded(false);
                    }}
                    className="bg-blue-50 hover:bg-blue-100 p-3 rounded-lg transition-colors flex flex-col items-center gap-2 group"
                  >
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="text-xs font-medium text-blue-700">Crear Cuenta</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {(
            <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-gray-50/90 scrollbar-hide">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'} ${isExpanded ? 'max-w-[85%]' : 'max-w-[75%]'}`}>
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-sm ${
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm shadow-md'
                    }`}
                  >
                    <div className="text-sm leading-relaxed w-full break-words">{formatMessageText(message.text)}</div>
                  </div>
                  <div className={`flex items-center mt-1 px-2 ${message.isUser ? 'flex-row' : 'flex-row'}`}>
                    <p className="text-xs text-white font-bold">
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
            
            {/* Calendar Component - Elegant Date Selection */}
            {showCalendar && (
              <div className="flex-1">
                {/* Título elegante en una línea */}
                <div className="text-center py-4 px-8">
                  <h3 className="text-xl font-light text-slate-800 tracking-wide">
                    Fechas de Despacho <span className="font-medium text-slate-900">Disponibles</span>
                  </h3>
                </div>
                
                {/* Grid de fechas adaptativo */}
                <div className="p-6">
                  {(() => {
                    const dates = getAvailableDispatchDates();
                    const gridCols = dates.length <= 4 ? 'grid-cols-4' : 'grid-cols-3';
                    
                    return (
                      <>
                        <div className={`grid ${gridCols} gap-3 mb-4`}>
                          {dates.map((thursday, index) => {
                            const dayNumber = thursday.getDate();
                            const monthName = thursday.toLocaleDateString('es-CL', { month: 'short' });
                            
                            return (
                              <button
                                key={index}
                                onClick={async () => {
                                  setSelectedDate(thursday);
                                  setShowCalendar(false);
                                  
                                  // Agregar mensaje del cliente confirmando la fecha
                                  const userDateSelection = {
                                    id: Date.now().toString(),
                                    text: `Quiero coordinar mi despacho para el ${formatDate(thursday)}`,
                                    isUser: true,
                                    timestamp: new Date()
                                  };
                                  
                                  // Agregar respuesta automática del chatbot
                                  const dateMessage = {
                                    id: (Date.now() + 1).toString(),
                                    text: `✅ ¡Perfecto! Fecha de despacho confirmada: **${formatDate(thursday)}**

Esta fecha quedará registrada en tu pedido. Ahora cuéntame qué productos necesitas y te ayudo con todo el proceso.`,
                                    isUser: false,
                                    timestamp: new Date()
                                  };
                                  
                                  const updatedMessages = [...messages, userDateSelection, dateMessage];
                                  setMessages(updatedMessages);
                                  
                                  // Guardar conversación con fecha seleccionada
                                  await saveConversationToSupabase(updatedMessages);
                                }}
                                className={`group relative p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${
                                  selectedDate && selectedDate.getTime() === thursday.getTime()
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-500 shadow-xl shadow-blue-500/30'
                                    : 'bg-white/80 text-slate-800 border-slate-200 hover:bg-white hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/20'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="text-2xl font-light mb-1 transition-all group-hover:scale-110">
                                    {dayNumber}
                                  </div>
                                  <div className="text-xs font-medium uppercase tracking-wider opacity-75">
                                    {monthName}
                                  </div>
                                  {index === 0 && (
                                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg shadow-emerald-500/40">
                                      Próximo
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Opción para elegir más fechas */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-gray-600 mb-3 text-center">
                            ¿Necesitas una fecha diferente? Puedes solicitar fechas especiales
                          </p>
                          <button
                            onClick={() => {
                              const newMessage = {
                                text: 'Me gustaría consultar otras fechas de despacho disponibles o solicitar una fecha especial.',
                                isUser: true,
                                timestamp: new Date()
                              };
                              const updatedMessages = [...messages, newMessage];
                              setMessages(updatedMessages);
                              
                              setTimeout(() => {
                                const botResponse = {
                                  text: 'Por supuesto, entiendo que necesitas flexibilidad en las fechas. Te puedo ayudar con:\n\n📅 **Fechas especiales:** Podemos coordinar entregas en días diferentes\n🚚 **Entregas urgentes:** Con costo adicional\n📞 **Coordinación directa:** Para casos específicos\n\n¿Qué tipo de fecha necesitas? Puedes escribirme los detalles y coordinamos la mejor opción para ti.',
                                  isUser: false,
                                  timestamp: new Date()
                                };
                                const finalMessages = [...updatedMessages, botResponse];
                                setMessages(finalMessages);
                                saveConversationToSupabase(finalMessages);
                              }, 1000);
                              
                              setShowCalendar(false);
                            }}
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                          >
                            💬 Solicitar Fecha Especial
                          </button>
                        </div>
                        
                        {/* Línea decorativa del ancho del contenido */}
                        <div className="flex justify-center mt-4">
                          <div className="w-full max-w-sm h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
            </div>
          )}

          {/* Formulario de Autenticación - Pantalla Completa */}
          {showAuthForm && (
            <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {authMode === 'login' 
                      ? 'Ingresa tus datos para identificarte y procesar tu pedido'
                      : 'Crea tu cuenta para recibir descuentos y procesar pedidos'
                    }
                  </p>
                </div>

                {authError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm mb-4">
                    {authError}
                  </div>
                )}

                {/* Botón de Google */}
                <button
                    type="button"
                    onClick={async () => {
                      const result = await loginWithGoogle();
                      if (result.success) {
                        // Google redirigirá, no necesitamos hacer nada más aquí
                        console.log('Redirigiendo a Google OAuth...');
                        setShowAuthForm(false); // Cerrar formulario
                        setAccountMenuExpanded(false); // Cerrar menú
                      } else {
                        setAuthError(result.error || 'Error al autenticarse con Google');
                      }
                    }}
                    className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 mb-4 font-medium"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {authMode === 'login' ? 'Continuar con Google' : 'Crear cuenta con Google'}
                  </button>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">O continúa con email</span>
                  </div>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={authFormData.email}
                      onChange={(e) => setAuthFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder={authMode === 'login' ? 'polimax.store' : 'tu@email.com'}
                      required
                    />
                  </div>

                  {authMode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                      <input
                        type="text"
                        value={authFormData.nombre}
                        onChange={(e) => setAuthFormData(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Tu nombre completo"
                        required
                      />
                    </div>
                  )}

                  {authMode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
                      <input
                        type="tel"
                        value={authFormData.telefono}
                        onChange={(e) => setAuthFormData(prev => ({ ...prev, telefono: e.target.value }))}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={authFormData.password}
                      onChange={(e) => setAuthFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder={authMode === 'login' ? 'polimax2025$$' : 'Mínimo 6 caracteres'}
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAuthForm(false);
                        setAuthFormData({ email: '', password: '', nombre: '', telefono: '' });
                        setAuthError('');
                      }}
                      className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {authMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                    </button>
                  </div>
                </form>

                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'register' : 'login');
                      setAuthError('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {authMode === 'login' 
                      ? '¿No tienes cuenta? Créate una aquí' 
                      : '¿Ya tienes cuenta? Inicia sesión aquí'
                    }
                  </button>
                </div>

                {/* Credenciales de prueba */}
                {authMode === 'login' && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-4">
                    <p className="text-xs text-gray-600 mb-1">Credenciales de prueba:</p>
                    <p className="text-xs text-gray-800"><strong>Email:</strong> polimax.store</p>
                    <p className="text-xs text-gray-800"><strong>Password:</strong> polimax2025$$</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Response Icons - Always Animated */}
          {(
            <div className="px-5 py-4 border-t border-gray-100 bg-white">
            <div className="flex gap-3 justify-center">
              {/* Icono Productos */}
              <button
                onClick={() => sendMessage('¿Qué tipos de policarbonato tienen disponible?')}
                onMouseEnter={() => setHoveredQuickResponse('productos')}
                onMouseLeave={() => setHoveredQuickResponse(null)}
                className={`relative group transition-all duration-300 text-xs rounded-xl border border-gray-200 flex items-center gap-2 shadow-sm hover:shadow-lg transform hover:scale-110 ${
                  hoveredQuickResponse === 'productos' 
                    ? 'bg-blue-500 border-blue-500 text-white px-4 py-3 shadow-lg' 
                    : 'bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 p-3'
                }`}
                title="Consultar productos disponibles"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                </svg>
                {hoveredQuickResponse === 'productos' && (
                  <span className="whitespace-nowrap animate-in slide-in-from-right-2 duration-200 font-medium">Productos</span>
                )}
              </button>
              
              {/* Icono Despacho */}
              <button
                onClick={() => sendMessage('¿Cuándo pueden hacer el despacho?')}
                onMouseEnter={() => setHoveredQuickResponse('despacho')}
                onMouseLeave={() => setHoveredQuickResponse(null)}
                className={`relative group transition-all duration-300 text-xs rounded-xl border border-gray-200 flex items-center gap-2 shadow-sm hover:shadow-lg transform hover:scale-110 ${
                  hoveredQuickResponse === 'despacho' 
                    ? 'bg-green-500 border-green-500 text-white px-4 py-3 shadow-lg' 
                    : 'bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 p-3'
                }`}
                title="Consultar fechas de despacho"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                {hoveredQuickResponse === 'despacho' && (
                  <span className="whitespace-nowrap animate-in slide-in-from-right-2 duration-200 font-medium">Despacho</span>
                )}
              </button>
              
              {/* Icono Cotizar */}
              <button
                onClick={() => sendMessage('Necesito cotizar para mi proyecto')}
                onMouseEnter={() => setHoveredQuickResponse('cotizar')}
                onMouseLeave={() => setHoveredQuickResponse(null)}
                className={`relative group transition-all duration-300 text-xs rounded-xl border border-gray-200 flex items-center gap-2 shadow-sm hover:shadow-lg transform hover:scale-110 ${
                  hoveredQuickResponse === 'cotizar' 
                    ? 'bg-orange-500 border-orange-500 text-white px-4 py-3 shadow-lg' 
                    : 'bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-700 p-3'
                }`}
                title="Solicitar cotización"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                {hoveredQuickResponse === 'cotizar' && (
                  <span className="whitespace-nowrap animate-in slide-in-from-right-2 duration-200 font-medium">Cotizar</span>
                )}
              </button>
              
              {/* Icono Asesoría */}
              <button
                onClick={() => sendMessage('¿Me pueden asesorar técnicamente?')}
                onMouseEnter={() => setHoveredQuickResponse('asesoria')}
                onMouseLeave={() => setHoveredQuickResponse(null)}
                className={`relative group transition-all duration-300 text-xs rounded-xl border border-gray-200 flex items-center gap-2 shadow-sm hover:shadow-lg transform hover:scale-110 ${
                  hoveredQuickResponse === 'asesoria' 
                    ? 'bg-purple-500 border-purple-500 text-white px-4 py-3 shadow-lg' 
                    : 'bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 p-3'
                }`}
                title="Solicitar asesoría técnica"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
                </svg>
                {hoveredQuickResponse === 'asesoria' && (
                  <span className="whitespace-nowrap animate-in slide-in-from-right-2 duration-200 font-medium">Asesoría</span>
                )}
              </button>
            </div>
            </div>
          )}

          {/* Input */}
          {!showAuthForm && (
            <div className="p-5 border-t border-gray-100 bg-white rounded-b-2xl">
            <form onSubmit={handleSubmit} className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Cuéntame, ¿en qué te puedo ayudar?"
                className="flex-1 px-4 py-3 bg-gray-50 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-sm text-gray-900 placeholder-gray-500 transition-all"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            </div>
          )}
            </div>
            
            {/* Botón para minimizar - debajo del chat */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeChat}
                className="premium-button text-white p-4 rounded-full transition-all duration-300 group relative overflow-hidden"
                title="Minimizar chat"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-slate-800/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          )}
        </div>
      </>
    );
  }

  // CASO 3: Estado inesperado - no debería pasar
  logger.log('❌ ESTADO INESPERADO - isOpen:', isOpen, 'isMinimized:', isMinimized);
  return null;
};

