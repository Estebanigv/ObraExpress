"use client";

import { useEffect, useState } from 'react';
import Script from 'next/script';

export function ElevenLabsWidget() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    // Verificar si el script ya fue cargado y ajustar posición
    if (typeof window !== 'undefined') {
      console.log('ElevenLabs Widget initialized');
      
      // Función para controlar la visibilidad según el scroll
      const controlVisibility = () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down y pasó los 100px
          setIsVisible(false);
        } else {
          // Scrolling up o en la parte superior
          setIsVisible(true);
        }
        
        setLastScrollY(currentScrollY);
      };

      // Agregar listener de scroll
      window.addEventListener('scroll', controlVisibility, { passive: true });
      
      // Cleanup del listener
      const cleanup = () => {
        window.removeEventListener('scroll', controlVisibility);
      };
      
      // Función para reposicionar el widget
      const repositionWidget = () => {
        const widget = document.querySelector('elevenlabs-convai');
        if (widget) {
          // Aplicar estilos CSS para posicionar paralelo al menú de navegación
          (widget as HTMLElement).style.position = 'fixed';
          (widget as HTMLElement).style.top = '60px'; // Aún más arriba, nivel del menú
          (widget as HTMLElement).style.left = '20px'; // Lado izquierdo para no interferir
          (widget as HTMLElement).style.zIndex = '9999';
        }
        
        // Ocultar agresivamente el "powered by" y todo el texto
        const elementsToHide = document.querySelectorAll(`
          elevenlabs-convai *[class*="powered"],
          elevenlabs-convai *[class*="footer"],
          elevenlabs-convai *[class*="branding"],
          elevenlabs-convai *[class*="credit"],
          elevenlabs-convai *[data-testid*="powered"],
          elevenlabs-convai *[data-testid*="footer"],
          elevenlabs-convai *[data-testid*="branding"],
          elevenlabs-convai span,
          elevenlabs-convai p,
          elevenlabs-convai div[class*="text"],
          elevenlabs-convai .powered-by
        `);
        elementsToHide.forEach(element => {
          (element as HTMLElement).style.display = 'none !important';
          (element as HTMLElement).style.visibility = 'hidden !important';
          (element as HTMLElement).style.opacity = '0 !important';
          (element as HTMLElement).style.height = '0 !important';
          (element as HTMLElement).style.overflow = 'hidden !important';
        });
        
        // También usar setTimeout para elementos que se cargan tarde
        setTimeout(() => {
          const lateElements = document.querySelectorAll('elevenlabs-convai *');
          lateElements.forEach(element => {
            const text = element.textContent?.toLowerCase() || '';
            if (text.includes('powered') || text.includes('elevenlabs') || text.includes('by')) {
              (element as HTMLElement).style.display = 'none !important';
              (element as HTMLElement).style.visibility = 'hidden !important';
              (element as HTMLElement).style.opacity = '0 !important';
              (element as HTMLElement).style.height = '0 !important';
              (element as HTMLElement).style.width = '0 !important';
              (element as HTMLElement).style.position = 'absolute !important';
              (element as HTMLElement).style.left = '-9999px !important';
              (element as HTMLElement).remove();
            }
          });
        }, 2000);
        
        // Intervalo continuo para eliminar elementos persistentes
        setInterval(() => {
          const persistentElements = document.querySelectorAll('elevenlabs-convai *');
          persistentElements.forEach(element => {
            const text = element.textContent?.toLowerCase() || '';
            if (text.includes('powered') || text.includes('elevenlabs') || text.includes('by')) {
              (element as HTMLElement).remove();
            }
          });
        }, 3000);
      };

      // Intentar reposicionar después de que se cargue
      setTimeout(repositionWidget, 1000);
      
      // Observer para detectar cuando se carga el widget
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const widget = document.querySelector('elevenlabs-convai');
            if (widget && !(widget as HTMLElement).style.top) {
              repositionWidget();
            }
          }
        });
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => {
        observer.disconnect();
        cleanup();
      };
    }
  }, [lastScrollY]);

  return (
    <>
      {/* Script de ElevenLabs */}
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
        async
        onLoad={() => {
          console.log('ElevenLabs script loaded successfully');
        }}
        onError={(e) => {
          console.error('Error loading ElevenLabs script:', e);
        }}
      />
      
      {/* Widget de conversación con estilos CSS personalizados */}
      <div style={{ position: 'relative' }}>
        <elevenlabs-convai 
          agent-id="agent_4301k2mkrbt4f6c86gj7avhrerq2"
          style={{
            position: 'fixed !important',
            top: '60px !important',
            left: '20px !important',
            zIndex: '9999 !important',
            opacity: isVisible ? '1' : '0',
            visibility: isVisible ? 'visible' : 'hidden',
            transform: `translateY(${isVisible ? '0' : '-20px'})`,
            transition: 'opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease'
          } as any}
        />
      </div>
      
      {/* CSS adicional para forzar la posición y ocultar powered by */}
      <style jsx global>{`
        elevenlabs-convai {
          position: fixed !important;
          top: 60px !important;
          left: 20px !important;
          z-index: 9999 !important;
          transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease !important;
        }
        
        elevenlabs-convai > * {
          position: relative !important;
        }
        
        /* Ocultar agresivamente "powered by" y todo texto */
        /* Eliminar TODO texto y branding de ElevenLabs */
        elevenlabs-convai *[class*="powered"],
        elevenlabs-convai *[class*="footer"],
        elevenlabs-convai *[class*="branding"],
        elevenlabs-convai *[class*="credit"],
        elevenlabs-convai *[data-testid*="powered"],
        elevenlabs-convai *[data-testid*="footer"],
        elevenlabs-convai *[data-testid*="branding"],
        elevenlabs-convai *[data-testid*="credit"],
        elevenlabs-convai span,
        elevenlabs-convai p,
        elevenlabs-convai div[class*="text"],
        elevenlabs-convai .powered-by,
        elevenlabs-convai *:contains("powered"),
        elevenlabs-convai *:contains("ElevenLabs"),
        elevenlabs-convai *:contains("Powered"),
        elevenlabs-convai *:contains("by"),
        elevenlabs-convai *:contains("By") {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          left: -9999px !important;
          margin: 0 !important;
          padding: 0 !important;
          font-size: 0 !important;
          line-height: 0 !important;
        }
        
        /* Ocultar cualquier contenedor que tenga texto de branding */
        elevenlabs-convai div:has(*:contains("powered")),
        elevenlabs-convai div:has(*:contains("ElevenLabs")),
        elevenlabs-convai div:has(*:contains("by")) {
          display: none !important;
        }
        
        /* Ajustar el contenedor del widget */
        elevenlabs-convai iframe {
          border-radius: 12px !important;
        }
      `}</style>
    </>
  );
}