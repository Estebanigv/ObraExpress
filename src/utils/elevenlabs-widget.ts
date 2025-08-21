// Utilidades para controlar el widget de Eleven Labs

let isWidgetOpen = false;
let clickOutsideListener: ((event: MouseEvent) => void) | null = null;
let textHideInterval: NodeJS.Timeout | null = null;
let callMonitorInterval: NodeJS.Timeout | null = null;
let isCallActive = false;
let scrollListener: ((event: Event) => void) | null = null;

export const openElevenLabsWidget = () => {
  try {
    console.log('🚀 Intentando abrir widget de Eleven Labs...');
    
    // LIMPIAR ESTADO ANTERIOR COMPLETAMENTE antes de abrir
    console.log('🧹 Limpiando estado anterior del widget...');
    isWidgetOpen = false;
    isCallActive = false;
    stopTextHideMonitoring();
    stopCallMonitoring();
    stopDOMObserver();
    removeAllInteractionListeners();
    
    // Verificar si el script de Eleven Labs está cargado
    const scriptLoaded = document.querySelector('script[src*="elevenlabs"]');
    console.log('📜 Script de Eleven Labs encontrado:', !!scriptLoaded);
    
    const container = document.getElementById('elevenlabs-widget-container');
    const widget = document.querySelector('elevenlabs-convai') as any;
    
    console.log('🔍 Estados del widget:', { 
      container: !!container, 
      widget: !!widget,
      containerVisible: container ? container.style.display : 'N/A'
    });
    
    if (container && widget) {
      console.log('✅ Widget encontrado, preparando apertura...');
      
      // Dar un pequeño delay después de limpiar el estado para evitar conflictos
      setTimeout(() => {
        console.log('✅ Iniciando apertura del widget después de limpieza...');
        
        // Mostrar el widget con estilos mejorados
        container.style.display = 'block';
        container.style.opacity = '1';
        container.style.transform = 'scale(1)';
        
        // Posicionar el widget encima del chatbot
        const chatbot = document.querySelector('[data-chatbot]') as HTMLElement;
        if (chatbot) {
          console.log('🤖 Chatbot detectado, posicionando widget encima');
          container.style.right = '24px'; // Misma posición que el chatbot (bottom-6 right-6)
          container.style.bottom = '24px'; // Misma posición vertical
          container.style.zIndex = '99999999'; // Más alto que el chatbot para estar encima
        }
        
        // Aplicar estilos adicionales
        setTimeout(() => {
          const widgetElement = widget as HTMLElement;
          if (widgetElement) {
            widgetElement.style.background = 'white';
          }
        }, 100);
        
        console.log('👁️ Container mostrado con opacidad completa');
        
        // Marcar el estado ANTES de iniciar monitoreos
        isWidgetOpen = true;
        isCallActive = true; // Marcar que la llamada está activa
        
        // Ocultar textos y mostrar solo la interfaz de llamada
        setTimeout(() => {
          console.log('🫥 Iniciando ocultación de texto...');
          hideWidgetText(widget);
          
          // Dar más tiempo al widget para cargar completamente antes de activar la llamada
          setTimeout(() => {
            console.log('📞 Intentando activar llamada...');
            activateDirectCall(widget);
          }, 1200); // Aumentar tiempo de espera más
          
          // Monitorear continuamente para ocultar textos que aparezcan dinámicamente
          startTextHideMonitoring(widget);
          
          // Monitorear el estado de la llamada para detectar cuando termine
          startCallMonitoring(widget);
          
          // Agregar observador de mutaciones para detectar cambios en el DOM del widget
          startDOMObserver(widget);
        }, 800); // Aumentar tiempo inicial más
        
        // Agregar listeners para detectar interacciones cuando la llamada no esté activa
        addInteractionListeners(container);
        
        console.log('🔒 Widget configurado - monitoreo activo iniciado');
        
      }, 300); // Delay después de limpiar estado
      
    } else {
      console.warn('❌ Widget de Eleven Labs no encontrado');
      console.log('🔄 Esperando 2 segundos para que cargue el widget...');
      
      // Esperar un poco más para que el widget se cargue
      setTimeout(() => {
        const delayedContainer = document.getElementById('elevenlabs-widget-container');
        const delayedWidget = document.querySelector('elevenlabs-convai') as any;
        
        console.log('🔍 Segunda verificación:', { 
          container: !!delayedContainer, 
          widget: !!delayedWidget 
        });
        
        if (delayedContainer && delayedWidget) {
          console.log('✅ Widget encontrado en segunda verificación');
          openElevenLabsWidget(); // Recursión
        } else {
          console.warn('❌ Widget definitivamente no disponible, usando teléfono');
          window.open('tel:+56963348909', '_self');
        }
      }, 2000);
      return;
    }
  } catch (error) {
    console.error('💥 Error al abrir el widget de Eleven Labs:', error);
    // Solo usar teléfono como último recurso
    console.log('📞 Usando teléfono como fallback');
    try {
      window.open('tel:+56963348909', '_self');
    } catch (phoneError) {
      console.error('Error al abrir teléfono:', phoneError);
    }
  }
};

const hideWidgetText = (widget: any) => {
  try {
    console.log('🫥 Iniciando ocultación de texto del widget');
    
    // Ocultar elementos de texto en shadow DOM
    const shadowRoot = widget.shadowRoot;
    if (shadowRoot) {
      console.log('🫥 Shadow DOM encontrado, ocultando texto');
      
      // Ocultar elementos comunes de texto
      const textSelectors = [
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span',
        '.description', '.text', '.content', '.message', '.title', '.subtitle',
        '[class*="text"]', '[class*="description"]', '[class*="content"]', '[class*="title"]'
      ];
      
      let hiddenCount = 0;
      textSelectors.forEach(selector => {
        const elements = shadowRoot.querySelectorAll(selector);
        elements.forEach((el: HTMLElement) => {
          if (el && !el.closest('button') && !el.classList.contains('sr-only')) {
            const text = el.textContent?.trim() || '';
            if (text.length > 0) {
              console.log(`🫥 Ocultando elemento ${selector}: "${text.substring(0, 30)}..."`);
              el.style.display = 'none !important';
              el.style.visibility = 'hidden !important';
              hiddenCount++;
            }
          }
        });
      });
      
      // Buscar y ocultar divs con solo texto
      const divs = shadowRoot.querySelectorAll('div');
      divs.forEach((div: HTMLElement) => {
        const text = div.textContent?.trim() || '';
        if (div.children.length === 0 && text.length > 5 && !div.closest('button')) {
          console.log(`🫥 Ocultando div con texto: "${text.substring(0, 30)}..."`);
          div.style.display = 'none !important';
          div.style.visibility = 'hidden !important';
          hiddenCount++;
        }
      });
      
      console.log(`🫥 Total elementos ocultos en shadow DOM: ${hiddenCount}`);
    }
    
    // También en el DOM normal
    const textElements = widget.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, .description, .text');
    let regularHiddenCount = 0;
    textElements.forEach((el: HTMLElement) => {
      if (!el.closest('button')) {
        const text = el.textContent?.trim() || '';
        if (text.length > 0) {
          console.log(`🫥 Ocultando elemento regular: "${text.substring(0, 30)}..."`);
          el.style.display = 'none !important';
          el.style.visibility = 'hidden !important';
          regularHiddenCount++;
        }
      }
    });
    
    console.log(`🫥 Total elementos ocultos en DOM regular: ${regularHiddenCount}`);
    
    // Agregar CSS global para ocultar texto común del widget
    if (!document.getElementById('elevenlabs-text-hide-style')) {
      const style = document.createElement('style');
      style.id = 'elevenlabs-text-hide-style';
      style.textContent = `
        #elevenlabs-widget-container p,
        #elevenlabs-widget-container h1,
        #elevenlabs-widget-container h2,
        #elevenlabs-widget-container h3,
        #elevenlabs-widget-container .description,
        #elevenlabs-widget-container .text,
        #elevenlabs-widget-container .content,
        #elevenlabs-widget-container .title,
        #elevenlabs-widget-container .subtitle {
          display: none !important;
          visibility: hidden !important;
        }
      `;
      document.head.appendChild(style);
    }
    
  } catch (error) {
    console.error('Error ocultando texto del widget:', error);
  }
};

const activateDirectCall = (widget: any) => {
  try {
    // Debug: Log available elements in the widget
    console.log('🔍 Analizando widget:', widget);
    
    if (widget.shadowRoot) {
      console.log('🔍 Shadow DOM encontrado');
      const allButtons = widget.shadowRoot.querySelectorAll('button');
      console.log('🔍 Botones en shadow DOM:', allButtons.length);
      allButtons.forEach((btn, i) => {
        console.log(`🔍 Botón ${i}:`, {
          text: btn.textContent,
          className: btn.className,
          ariaLabel: btn.getAttribute('aria-label'),
          innerHTML: btn.innerHTML.substring(0, 100)
        });
      });
    }
    
    const regularButtons = widget.querySelectorAll('button');
    console.log('🔍 Botones regulares:', regularButtons.length);
    regularButtons.forEach((btn, i) => {
      console.log(`🔍 Botón regular ${i}:`, {
        text: btn.textContent,
        className: btn.className,
        ariaLabel: btn.getAttribute('aria-label')
      });
    });
    
    // Estrategias múltiples para activar la llamada directamente
    const callStrategies = [
      // Estrategia 1: Buscar botón de teléfono/llamada por iconos SVG
      () => {
        const shadowRoot = widget.shadowRoot;
        const containers = [shadowRoot, widget];
        
        for (const container of containers) {
          if (!container) continue;
          
          // Debug: Log all SVGs found
          const allSvgs = container.querySelectorAll('svg');
          console.log(`🔍 SVGs encontrados en container:`, allSvgs.length);
          allSvgs.forEach((svg, i) => {
            const paths = svg.querySelectorAll('path');
            paths.forEach((path, j) => {
              console.log(`🔍 SVG ${i} Path ${j}:`, path.getAttribute('d')?.substring(0, 50));
            });
          });
          
          // Buscar botones que contengan SVG de teléfono
          const buttons = container.querySelectorAll('button');
          for (const button of buttons) {
            const svg = button.querySelector('svg');
            if (svg) {
              const pathD = svg.querySelector('path')?.getAttribute('d') || '';
              const svgContent = svg.outerHTML.toLowerCase();
              
              console.log(`🔍 Analizando botón con SVG:`, {
                pathD: pathD.substring(0, 50),
                svgContent: svgContent.substring(0, 100),
                buttonText: button.textContent,
                buttonClass: button.className
              });
              
              // Detectar iconos de teléfono por múltiples criterios
              if (pathD.includes('M2 3a1 1 0') || // Icono de teléfono común
                  pathD.includes('phone') ||
                  pathD.includes('call') ||
                  svgContent.includes('phone') ||
                  svgContent.includes('call') ||
                  svgContent.includes('microphone') ||
                  svgContent.includes('mic') ||
                  button.innerHTML.toLowerCase().includes('phone') ||
                  button.innerHTML.toLowerCase().includes('call') ||
                  button.innerHTML.toLowerCase().includes('start')) {
                console.log('🎯 Botón de llamada encontrado, haciendo clic');
                button.click();
                return true;
              }
            }
          }
        }
        return false;
      },
      
      // Estrategia 2: Buscar por data attributes específicos
      () => {
        const selectors = [
          '[data-testid*="call"]',
          '[data-testid*="phone"]',
          '[data-testid*="start"]',
          '[aria-label*="call"]',
          '[aria-label*="phone"]',
          '[aria-label*="start call"]'
        ];
        
        const containers = [widget.shadowRoot, widget].filter(Boolean);
        for (const container of containers) {
          for (const selector of selectors) {
            const element = container.querySelector(selector);
            if (element && typeof element.click === 'function') {
              element.click();
              return true;
            }
          }
        }
        return false;
      },
      
      // Estrategia 3: Buscar botones por clases y texto
      () => {
        const containers = [widget.shadowRoot, widget].filter(Boolean);
        for (const container of containers) {
          const buttons = container.querySelectorAll('button');
          for (const button of buttons) {
            const text = button.textContent?.toLowerCase() || '';
            const className = button.className?.toLowerCase() || '';
            const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
            
            if (text.includes('call') || text.includes('start') ||
                className.includes('call') || className.includes('phone') ||
                ariaLabel.includes('call') || ariaLabel.includes('phone')) {
              button.click();
              return true;
            }
          }
        }
        return false;
      },
      
      // Estrategia 4: Métodos programáticos del widget
      () => {
        const methods = ['startCall', 'call', 'startConversation', 'begin', 'start'];
        for (const method of methods) {
          if (typeof widget[method] === 'function') {
            widget[method]();
            return true;
          }
        }
        return false;
      },
      
      // Estrategia 5: Simular eventos
      () => {
        if (typeof widget.dispatchEvent === 'function') {
          const event = new CustomEvent('startCall', { bubbles: true });
          widget.dispatchEvent(event);
          return true;
        }
        return false;
      },
      
      // Estrategia 6: Buscar cualquier elemento clickeable que pueda iniciar llamada
      () => {
        const containers = [widget.shadowRoot, widget].filter(Boolean);
        for (const container of containers) {
          // Buscar elementos con roles específicos
          const clickables = container.querySelectorAll('[role="button"], [tabindex="0"], .clickable, .btn, .button');
          for (const clickable of clickables) {
            const element = clickable as HTMLElement;
            const text = element.textContent?.toLowerCase() || '';
            const className = element.className?.toLowerCase() || '';
            const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
            
            if (text.includes('start') || text.includes('begin') || text.includes('call') ||
                className.includes('start') || className.includes('call') || className.includes('mic') ||
                ariaLabel.includes('start') || ariaLabel.includes('call')) {
              console.log('🎯 Elemento clickeable encontrado:', {text, className, ariaLabel});
              element.click();
              return true;
            }
          }
        }
        return false;
      }
    ];
    
    // Ejecutar estrategias con delay progresivo y reintentos
    let callActivated = false;
    
    const tryStrategies = (attempt = 1) => {
      if (callActivated || attempt > 3) return;
      
      console.log(`🔄 Intento ${attempt} de activar llamada`);
      
      callStrategies.forEach((strategy, index) => {
        if (callActivated) return;
        
        setTimeout(() => {
          try {
            if (!callActivated && strategy()) {
              console.log(`✅ Llamada iniciada con estrategia ${index + 1} en intento ${attempt}`);
              callActivated = true;
            }
          } catch (e) {
            console.log(`❌ Estrategia ${index + 1} falló en intento ${attempt}:`, e);
          }
        }, index * 100);
      });
      
      // Reintentar después de un tiempo si no se activó
      setTimeout(() => {
        if (!callActivated) {
          tryStrategies(attempt + 1);
        }
      }, 1000);
    };
    
    tryStrategies();
    
  } catch (error) {
    console.error('Error activando llamada directa:', error);
  }
};

const startTextHideMonitoring = (widget: any) => {
  // Limpiar monitoreo anterior si existe
  if (textHideInterval) {
    clearInterval(textHideInterval);
  }
  
  // Monitorear cada 500ms para ocultar textos que aparezcan dinámicamente
  textHideInterval = setInterval(() => {
    if (isWidgetOpen) {
      hideWidgetText(widget);
    } else {
      clearInterval(textHideInterval!);
      textHideInterval = null;
    }
  }, 500);
};

const stopTextHideMonitoring = () => {
  if (textHideInterval) {
    clearInterval(textHideInterval);
    textHideInterval = null;
  }
};

export const closeElevenLabsWidget = () => {
  try {
    console.log('🚪 Cerrando widget de Eleven Labs COMPLETAMENTE');
    
    // MARCAR ESTADO COMO CERRADO INMEDIATAMENTE para evitar conflictos
    isWidgetOpen = false;
    isCallActive = false;
    
    const container = document.getElementById('elevenlabs-widget-container');
    const widget = document.querySelector('elevenlabs-convai') as any;
    
    // Detener todos los monitoreos INMEDIATAMENTE
    console.log('🛑 Deteniendo todos los monitoreos...');
    stopTextHideMonitoring();
    stopCallMonitoring();
    stopDOMObserver();
    removeAllInteractionListeners();
    
    if (container) {
      console.log('🚪 Ocultando container del widget');
      container.style.display = 'none';
      container.style.opacity = '0';
      container.style.transform = 'scale(0.8)';
      
      // Restaurar posición y z-index original
      container.style.right = '20px';
      container.style.bottom = '20px';
      container.style.zIndex = '9998';
    }
    
    if (widget) {
      console.log('🚪 Terminando llamada FORZADAMENTE en el widget');
      
      // ESTRATEGIA 1: Buscar y hacer clic en el botón de colgar/terminar llamada
      const shadowRoot = widget.shadowRoot;
      const containers = [shadowRoot, widget].filter(Boolean);
      let callEnded = false;
      
      for (const container of containers) {
        // Buscar botón de terminar llamada por múltiples criterios
        const buttons = container.querySelectorAll('button');
        for (const button of buttons) {
          const buttonText = button.textContent?.toLowerCase() || '';
          const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
          const title = button.getAttribute('title')?.toLowerCase() || '';
          const className = button.className?.toLowerCase() || '';
          
          // Buscar botones que terminen la llamada
          if (buttonText.includes('end') || 
              buttonText.includes('hang') ||
              buttonText.includes('stop') ||
              buttonText.includes('finish') ||
              buttonText.includes('terminate') ||
              buttonText.includes('disconnect') ||
              ariaLabel.includes('end') ||
              ariaLabel.includes('hang') ||
              ariaLabel.includes('stop') ||
              title.includes('end') ||
              title.includes('hang') ||
              className.includes('end') ||
              className.includes('hang') ||
              className.includes('stop')) {
            
            console.log('🎯 ENCONTRADO BOTÓN DE TERMINAR LLAMADA:', {
              text: buttonText,
              ariaLabel,
              title,
              className
            });
            
            try {
              button.click();
              callEnded = true;
              console.log('✅ Botón de terminar llamada CLICKEADO');
              break;
            } catch (e) {
              console.log('❌ Error clickeando botón de terminar:', e);
            }
          }
        }
        
        // Si no encontró botón específico, buscar botones con iconos de teléfono
        if (!callEnded) {
          const allButtons = container.querySelectorAll('button');
          for (const button of allButtons) {
            const svg = button.querySelector('svg');
            if (svg) {
              const svgContent = svg.outerHTML.toLowerCase();
              const pathElements = svg.querySelectorAll('path');
              
              // Buscar iconos de teléfono colgado/rojo
              pathElements.forEach(path => {
                const d = path.getAttribute('d') || '';
                if (d.includes('phone') || svgContent.includes('phone') || 
                    button.style.backgroundColor?.includes('red') ||
                    button.style.color?.includes('red')) {
                  console.log('🎯 ENCONTRADO BOTÓN CON ICONO DE TELÉFONO:', svgContent.substring(0, 100));
                  try {
                    button.click();
                    callEnded = true;
                    console.log('✅ Botón con icono de teléfono CLICKEADO');
                  } catch (e) {
                    console.log('❌ Error clickeando botón con icono:', e);
                  }
                }
              });
            }
            
            if (callEnded) break;
          }
        }
        
        if (callEnded) break;
      }
      
      // ESTRATEGIA 2: Intentar métodos nativos del widget para terminar la llamada
      console.log('🚪 Intentando métodos nativos del widget...');
      const methods = ['endCall', 'hangUp', 'hangup', 'disconnect', 'stop', 'terminate', 'close', 'destroy', 'reset', 'clear'];
      let methodCalled = false;
      
      methods.forEach(method => {
        if (typeof widget[method] === 'function' && !methodCalled) {
          console.log(`🚪 Llamando método ${method} del widget`);
          try {
            widget[method]();
            methodCalled = true;
            console.log(`✅ Método ${method} ejecutado`);
          } catch (e) {
            console.log(`❌ Error llamando método ${method}:`, e);
          }
        }
      });
      
      // ESTRATEGIA 3: Disparar eventos de finalización
      console.log('🚪 Disparando eventos de finalización...');
      const events = ['endCall', 'hangUp', 'disconnect', 'stop', 'terminate'];
      events.forEach(eventName => {
        try {
          const event = new CustomEvent(eventName, { bubbles: true, cancelable: true });
          widget.dispatchEvent(event);
          console.log(`📡 Evento ${eventName} disparado`);
        } catch (e) {
          console.log(`❌ Error disparando evento ${eventName}:`, e);
        }
      });
      
      // ESTRATEGIA 4: Simular tecla ESC para cerrar
      console.log('🚪 Simulando tecla ESC...');
      try {
        const escEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          keyCode: 27,
          which: 27,
          bubbles: true
        });
        widget.dispatchEvent(escEvent);
        document.dispatchEvent(escEvent);
        console.log('⌨️ Tecla ESC simulada');
      } catch (e) {
        console.log('❌ Error simulando ESC:', e);
      }
      
      // ESTRATEGIA 5: Terminar streams de audio/video forzadamente
      console.log('🚪 Terminando streams de media...');
      try {
        const audioElements = widget.querySelectorAll('audio, video');
        audioElements.forEach((media: any, index) => {
          try {
            if (media.srcObject && media.srcObject.getTracks) {
              media.srcObject.getTracks().forEach((track: any) => {
                track.stop();
                console.log(`🔇 Track ${index} detenido`);
              });
            }
            if (media.pause) {
              media.pause();
              console.log(`⏸️ Media ${index} pausado`);
            }
            if (media.currentTime !== undefined) {
              media.currentTime = 0;
            }
            media.src = '';
            media.srcObject = null;
          } catch (e) {
            console.log(`❌ Error deteniendo media ${index}:`, e);
          }
        });
        
        // También buscar en shadow DOM
        if (shadowRoot) {
          const shadowAudioElements = shadowRoot.querySelectorAll('audio, video');
          shadowAudioElements.forEach((media: any, index) => {
            try {
              if (media.srcObject && media.srcObject.getTracks) {
                media.srcObject.getTracks().forEach((track: any) => {
                  track.stop();
                  console.log(`🔇 Shadow track ${index} detenido`);
                });
              }
              if (media.pause) {
                media.pause();
                console.log(`⏸️ Shadow media ${index} pausado`);
              }
              media.src = '';
              media.srcObject = null;
            } catch (e) {
              console.log(`❌ Error deteniendo shadow media ${index}:`, e);
            }
          });
        }
      } catch (e) {
        console.log('❌ Error terminando streams de media:', e);
      }
      
      // ESTRATEGIA 6: Terminar conexiones WebRTC si las hay
      console.log('🚪 Terminando conexiones WebRTC...');
      try {
        // Buscar objetos RTCPeerConnection en el widget
        if (widget._peerConnection) {
          widget._peerConnection.close();
          console.log('🔌 Conexión WebRTC cerrada (widget._peerConnection)');
        }
        
        // Buscar en propiedades del widget
        Object.keys(widget).forEach(key => {
          const value = widget[key];
          if (value && typeof value === 'object' && value.close && key.toLowerCase().includes('peer')) {
            try {
              value.close();
              console.log(`🔌 Conexión WebRTC cerrada (${key})`);
            } catch (e) {
              console.log(`❌ Error cerrando ${key}:`, e);
            }
          }
        });
        
        // Terminar getUserMedia streams globales
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          // No podemos acceder directamente a streams activos, pero podemos intentar detener el micrófono
          console.log('🎤 Intentando liberar acceso al micrófono...');
        }
        
      } catch (e) {
        console.log('❌ Error terminando WebRTC:', e);
      }
      
      if (!callEnded && !methodCalled) {
        console.log('⚠️ No se pudo terminar la llamada automáticamente con botones/métodos');
        console.log('🔇 Sin embargo, se han detenido los streams de media y conexiones');
      }
      
      // Forzar reinicio COMPLETO del widget 
      setTimeout(() => {
        try {
          console.log('🔄 Iniciando recreación completa del widget...');
          
          // Remover completamente el widget anterior
          if (container && widget.parentNode === container) {
            // Primero intentar limpiar cualquier evento o listener del widget
            try {
              widget.remove();
              console.log('🗑️ Widget anterior removido completamente');
            } catch (e) {
              console.log('❌ Error removiendo widget:', e);
              container.removeChild(widget);
            }
            
            // Esperar un momento antes de recrear
            setTimeout(() => {
              try {
                // Crear widget completamente nuevo
                const newWidget = document.createElement('elevenlabs-convai');
                newWidget.setAttribute('agent-id', 'agent_4301k2mkrbt4f6c86gj7avhrerq2');
                
                // Asegurarse de que esté completamente limpio
                newWidget.style.cssText = '';
                
                container.appendChild(newWidget);
                console.log('✨ Widget recreado completamente y limpio');
                
                // Forzar que el navegador reinicialice el widget
                setTimeout(() => {
                  try {
                    newWidget.style.display = 'block';
                    newWidget.setAttribute('data-reset', Date.now().toString());
                    console.log('🔄 Widget forzado a reinicializarse');
                  } catch (e) {
                    console.log('❌ Error reinicializando widget:', e);
                  }
                }, 50);
                
              } catch (e) {
                console.log('❌ Error creando nuevo widget:', e);
              }
            }, 100);
          }
        } catch (e) {
          console.log('❌ Error en recreación del widget:', e);
        }
      }, 200);
    }
    
    // Remover botón de cerrar si existe
    const closeButton = document.getElementById('widget-close-button');
    if (closeButton) {
      closeButton.remove();
      console.log('🗑️ Botón de cerrar removido');
    }
    
    // Limpiar estilos globales si existen
    const globalStyle = document.getElementById('elevenlabs-text-hide-style');
    if (globalStyle) {
      globalStyle.remove();
      console.log('🗑️ Estilos globales removidos');
    }
    
    console.log('🚪 Widget cerrado y limpiado COMPLETAMENTE');
    
  } catch (error) {
    console.error('Error al cerrar el widget de Eleven Labs:', error);
  }
};

const addClickOutsideListener = (container: HTMLElement) => {
  removeClickOutsideListener(); // Asegurar que no hay listeners duplicados
  
  clickOutsideListener = (event: MouseEvent) => {
    const target = event.target as Node;
    
    console.log('🖱️ Click detectado, verificando si es fuera del widget');
    console.log('🖱️ Widget abierto:', isWidgetOpen);
    console.log('🖱️ Click dentro del container:', container.contains(target));
    
    // Verificar si el clic fue fuera del widget
    if (!container.contains(target) && isWidgetOpen) {
      console.log('🖱️ Click fuera del widget, cerrando');
      closeElevenLabsWidget();
    }
  };
  
  // Agregar listener con un pequeño delay para evitar que se cierre inmediatamente
  setTimeout(() => {
    console.log('🖱️ Agregando listener de click fuera del widget');
    document.addEventListener('click', clickOutsideListener!);
  }, 300);
};

const removeClickOutsideListener = () => {
  if (clickOutsideListener) {
    document.removeEventListener('click', clickOutsideListener);
    clickOutsideListener = null;
  }
};

// Función para verificar si el widget está disponible
export const isElevenLabsWidgetAvailable = (): boolean => {
  return !!document.querySelector('elevenlabs-convai');
};

// Función para verificar si el widget está abierto
export const isElevenLabsWidgetOpen = (): boolean => {
  return isWidgetOpen;
};

// Función para monitorear el estado de la llamada
const startCallMonitoring = (widget: any) => {
  // Limpiar monitoreo anterior si existe
  if (callMonitorInterval) {
    clearInterval(callMonitorInterval);
  }
  
  console.log('📞 Iniciando monitoreo del estado de la llamada');
  
  // Monitorear cada 1 segundo para detectar si la llamada ha terminado (más frecuente)
  callMonitorInterval = setInterval(() => {
    if (!isWidgetOpen) {
      clearInterval(callMonitorInterval!);
      callMonitorInterval = null;
      return;
    }
    
    try {
      // Estrategias para detectar si la llamada ha terminado
      const container = document.getElementById('elevenlabs-widget-container');
      
      if (!container || container.style.display === 'none') {
        return;
      }
      
      // Buscar indicadores de que la llamada ha terminado
      const shadowRoot = widget.shadowRoot;
      const containers = [shadowRoot, widget].filter(Boolean);
      
      let callEnded = false;
      
      for (const cont of containers) {
        // Buscar texto que indique que la llamada terminó (más opciones)
        const textElements = cont.querySelectorAll('*');
        for (const element of textElements) {
          const text = element.textContent?.toLowerCase() || '';
          if (text.includes('call ended') || 
              text.includes('disconnected') || 
              text.includes('call finished') ||
              text.includes('conversation ended') ||
              text.includes('llamada terminada') ||
              text.includes('desconectado') ||
              text.includes('ended') ||
              text.includes('finished') ||
              text.includes('terminated') ||
              text.includes('completed') ||
              text.includes('goodbye') ||
              text.includes('thank you') ||
              text.includes('gracias') ||
              text.includes('adiós')) {
            console.log('📞 TEXTO DE FINALIZACION DETECTADO:', text);
            callEnded = true;
            break;
          }
        }
        
        // Buscar botones que indiquen reinicio de llamada o estado inactivo
        const buttons = cont.querySelectorAll('button');
        for (const button of buttons) {
          const buttonText = button.textContent?.toLowerCase() || '';
          const ariaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
          const title = button.getAttribute('title')?.toLowerCase() || '';
          
          if (buttonText.includes('start call') || 
              buttonText.includes('call again') ||
              buttonText.includes('restart') ||
              buttonText.includes('begin') ||
              buttonText.includes('new call') ||
              ariaLabel.includes('start') ||
              ariaLabel.includes('begin') ||
              title.includes('start') ||
              buttonText.includes('iniciar llamada') ||
              buttonText.includes('nueva llamada')) {
            console.log('📞 BOTON DE REINICIO DETECTADO:', buttonText || ariaLabel || title);
            callEnded = true;
            break;
          }
        }
        
        // Detectar si no hay actividad de audio/video
        const audioElements = cont.querySelectorAll('audio, video');
        let hasActiveMedia = false;
        audioElements.forEach((media: any) => {
          if (media && !media.paused && !media.ended) {
            hasActiveMedia = true;
          }
        });
        
        // Si había una llamada activa y ya no hay media activo
        if (isCallActive && audioElements.length > 0 && !hasActiveMedia) {
          console.log('📞 MEDIA INACTIVO DETECTADO - llamada probablemente terminada');
          callEnded = true;
        }
        
        if (callEnded) break;
      }
      
      if (callEnded && isCallActive) {
        console.log('📞 LLAMADA TERMINADA DETECTADA - cerrando widget automáticamente');
        isCallActive = false; // Marcar que la llamada ya no está activa
        
        // Cerrar widget automáticamente cuando la llamada termine (más rápido)
        setTimeout(() => {
          console.log('📞 EJECUTANDO CIERRE AUTOMATICO DEL WIDGET');
          closeElevenLabsWidget();
        }, 500); // Reducir tiempo a 0.5 segundos
      }
      
    } catch (error) {
      console.error('Error monitoreando estado de llamada:', error);
    }
  }, 1000); // Monitorear cada 1 segundo en lugar de 2
};

// Función para detener el monitoreo de llamadas
const stopCallMonitoring = () => {
  if (callMonitorInterval) {
    clearInterval(callMonitorInterval);
    callMonitorInterval = null;
    console.log('📞 Monitoreo de llamada detenido');
  }
};

// Función para agregar botón de cerrar cuando la llamada termine
const addCloseButton = (container: HTMLElement) => {
  // Verificar si ya existe el botón
  if (container.querySelector('#widget-close-button')) {
    return;
  }
  
  const closeButton = document.createElement('button');
  closeButton.id = 'widget-close-button';
  closeButton.innerHTML = '✕';
  closeButton.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 50%;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.2s ease;
  `;
  
  // Efectos hover
  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.background = 'rgba(255, 0, 0, 0.8)';
    closeButton.style.transform = 'scale(1.1)';
  });
  
  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.background = 'rgba(0, 0, 0, 0.7)';
    closeButton.style.transform = 'scale(1)';
  });
  
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('❌ Botón cerrar clickeado');
    closeElevenLabsWidget();
  });
  
  container.appendChild(closeButton);
  console.log('➕ Botón de cerrar agregado al widget');
};

// Función para agregar listener de scroll cuando la llamada termine
const addScrollListener = (container: HTMLElement) => {
  removeScrollListener(); // Asegurar que no hay listeners duplicados
  
  scrollListener = (event: Event) => {
    if (!isCallActive && isWidgetOpen) {
      console.log('📜 Scroll detectado con llamada inactiva, cerrando widget');
      closeElevenLabsWidget();
    }
  };
  
  // Agregar listener de scroll al documento
  setTimeout(() => {
    console.log('📜 Agregando listener de scroll para cerrar widget');
    document.addEventListener('scroll', scrollListener!, { passive: true });
    window.addEventListener('scroll', scrollListener!, { passive: true });
  }, 100);
};

// Función para remover listener de scroll
const removeScrollListener = () => {
  if (scrollListener) {
    document.removeEventListener('scroll', scrollListener);
    window.removeEventListener('scroll', scrollListener);
    scrollListener = null;
    console.log('📜 Listener de scroll removido');
  }
};

// Función para agregar listeners de interacción (scroll y clic fuera)
const addInteractionListeners = (container: HTMLElement) => {
  // Listener de scroll que actúa inmediatamente cuando la llamada NO está activa
  const scrollHandler = () => {
    if (!isCallActive && isWidgetOpen) {
      console.log('📜 Scroll detectado - llamada no activa, cerrando widget INMEDIATAMENTE');
      closeElevenLabsWidget();
    }
  };
  
  // Listener de clic fuera que actúa inmediatamente cuando la llamada NO está activa
  const clickHandler = (event: MouseEvent) => {
    const target = event.target as Node;
    if (!container.contains(target) && !isCallActive && isWidgetOpen) {
      console.log('🖱️ Clic fuera detectado - llamada no activa, cerrando widget INMEDIATAMENTE');
      closeElevenLabsWidget();
    }
  };
  
  // Agregar listeners inmediatamente con prioridad alta
  document.addEventListener('scroll', scrollHandler, { passive: true, capture: true });
  window.addEventListener('scroll', scrollHandler, { passive: true, capture: true });
  document.addEventListener('click', clickHandler, { capture: true });
  
  // También agregar listeners en la fase de bubbling para mayor cobertura
  document.addEventListener('scroll', scrollHandler, { passive: true });
  window.addEventListener('scroll', scrollHandler, { passive: true });
  document.addEventListener('click', clickHandler);
  
  // Guardar referencias para poder removerlos después
  scrollListener = scrollHandler;
  clickOutsideListener = clickHandler;
  
  console.log('👂 Listeners de interacción agregados con MÁXIMA PRIORIDAD (cerrar inmediatamente cuando llamada no esté activa)');
};

// Función para remover todos los listeners de interacción
const removeAllInteractionListeners = () => {
  try {
    if (scrollListener) {
      // Remover listeners de capture phase
      document.removeEventListener('scroll', scrollListener, { capture: true });
      window.removeEventListener('scroll', scrollListener, { capture: true });
      // Remover listeners de bubbling phase
      document.removeEventListener('scroll', scrollListener);
      window.removeEventListener('scroll', scrollListener);
      scrollListener = null;
    }
    
    if (clickOutsideListener) {
      // Remover listeners de capture phase
      document.removeEventListener('click', clickOutsideListener, { capture: true });
      // Remover listeners de bubbling phase
      document.removeEventListener('click', clickOutsideListener);
      clickOutsideListener = null;
    }
    
    // Forzar limpieza adicional por si hay listeners huérfanos
    const allScrollListeners = ['scroll', 'touchmove', 'wheel'];
    const allClickListeners = ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend'];
    
    allScrollListeners.forEach(event => {
      try {
        document.removeEventListener(event, scrollListener as any);
        window.removeEventListener(event, scrollListener as any);
        document.removeEventListener(event, scrollListener as any, { capture: true });
        window.removeEventListener(event, scrollListener as any, { capture: true });
      } catch (e) {
        // Ignorar errores de limpieza
      }
    });
    
    allClickListeners.forEach(event => {
      try {
        document.removeEventListener(event, clickOutsideListener as any);
        document.removeEventListener(event, clickOutsideListener as any, { capture: true });
      } catch (e) {
        // Ignorar errores de limpieza
      }
    });
    
    console.log('🗑️ Todos los listeners de interacción removidos COMPLETAMENTE');
  } catch (error) {
    console.error('Error removiendo listeners:', error);
  }
};

// Variables para el observador de mutaciones
let domObserver: MutationObserver | null = null;

// Función para iniciar observador de mutaciones del DOM del widget
const startDOMObserver = (widget: any) => {
  // Limpiar observador anterior si existe
  if (domObserver) {
    domObserver.disconnect();
    domObserver = null;
  }
  
  console.log('👁️ Iniciando observador de mutaciones del DOM del widget');
  
  // Crear observador de mutaciones
  domObserver = new MutationObserver((mutations) => {
    if (!isWidgetOpen || !isCallActive) return;
    
    mutations.forEach((mutation) => {
      // Verificar cambios en el contenido del widget
      if (mutation.type === 'childList' || mutation.type === 'subtree') {
        const target = mutation.target as HTMLElement;
        
        // Buscar cambios que indiquen finalización de llamada
        const textContent = target.textContent?.toLowerCase() || '';
        
        // Detectar si aparecieron nuevos elementos que indican fin de llamada
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as HTMLElement;
            const text = element.textContent?.toLowerCase() || '';
            
            // Buscar indicadores de llamada terminada en nuevos elementos
            if (text.includes('call ended') || 
                text.includes('disconnected') || 
                text.includes('conversation ended') ||
                text.includes('ended') ||
                text.includes('finished') ||
                text.includes('goodbye') ||
                text.includes('thank you') ||
                text.includes('start call') ||
                text.includes('call again')) {
              console.log('👁️ CAMBIO DOM DETECTADO - posible fin de llamada:', text);
              
              // Verificar después de un pequeño delay
              setTimeout(() => {
                if (isCallActive) {
                  console.log('👁️ CONFIRMANDO FIN DE LLAMADA VIA DOM OBSERVER');
                  isCallActive = false;
                  setTimeout(() => {
                    closeElevenLabsWidget();
                  }, 300);
                }
              }, 500);
            }
          }
        });
      }
      
      // Verificar cambios en atributos que puedan indicar estado
      if (mutation.type === 'attributes') {
        const target = mutation.target as HTMLElement;
        const className = target.className?.toLowerCase() || '';
        const style = target.style?.cssText?.toLowerCase() || '';
        
        // Detectar cambios de estado por clases o estilos
        if (className.includes('ended') || 
            className.includes('finished') || 
            className.includes('inactive') ||
            style.includes('display: none')) {
          console.log('👁️ CAMBIO DE ATRIBUTO DETECTADO - posible fin de llamada');
          
          setTimeout(() => {
            if (isCallActive) {
              console.log('👁️ CONFIRMANDO FIN DE LLAMADA VIA CAMBIO DE ATRIBUTOS');
              isCallActive = false;
              setTimeout(() => {
                closeElevenLabsWidget();
              }, 300);
            }
          }, 500);
        }
      }
    });
  });
  
  // Observar el widget y su shadow DOM
  const observeTarget = widget.shadowRoot || widget;
  domObserver.observe(observeTarget, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'style', 'data-state', 'aria-label']
  });
  
  console.log('👁️ Observador de mutaciones del DOM iniciado');
};

// Función para detener el observador de mutaciones
const stopDOMObserver = () => {
  if (domObserver) {
    domObserver.disconnect();
    domObserver = null;
    console.log('👁️ Observador de mutaciones del DOM detenido');
  }
};