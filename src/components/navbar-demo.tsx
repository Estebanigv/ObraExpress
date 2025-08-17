"use client";

import React, { useState, useEffect } from "react";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

export function NavbarDemo() {
  return (
    <div className="relative w-full">
      <Navbar />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [subMenuActive, setSubMenuActive] = useState<string | null>(null);
  const [subMenuTimeoutId, setSubMenuTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Enhanced setActive function with timeout management
  const handleSetActive = (item: string | null) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    
    if (item === null) {
      // Add delay before closing menu
      const id = setTimeout(() => {
        setActive(null);
        setSubMenuActive(null);
      }, 150);
      setTimeoutId(id);
    } else {
      setActive(item);
    }
  };

  // Handle submenu activation with proper timeout management
  const handleSubMenuActive = (item: string | null) => {
    logger.log('🔄 Submenu state changing to:', item);
    // Clear any existing timeout
    if (subMenuTimeoutId) {
      clearTimeout(subMenuTimeoutId);
      setSubMenuTimeoutId(null);
    }
    
    if (item === null) {
      // Delay closing submenu
      const id = setTimeout(() => {
        logger.log('⏰ Closing submenu after timeout');
        setSubMenuActive(null);
      }, 200);
      setSubMenuTimeoutId(id);
    } else {
      logger.log('✅ Setting submenu active:', item);
      setSubMenuActive(item);
    }
  };
  
  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
      className
    )}>
      {/* Top Info Bar */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            {/* Left: Contact Info */}
            <div className="flex items-center space-x-6">
              <span className="text-black font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                +56 2 2345 6789
              </span>
              <span className="text-black flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                info@polimax.cl
              </span>
              <span className="text-black hidden lg:block">🚚 Envío gratis sobre $100.000</span>
            </div>

            {/* Center: Promotions */}
            <div className="hidden md:block">
              <span className="text-black font-bold">🔥 30% OFF productos seleccionados</span>
            </div>

            {/* Right: Social Media */}
            <div className="flex items-center space-x-3">
              <span className="text-black text-xs font-medium mr-2">Síguenos:</span>
              
              {/* Facebook */}
              <a href="#" className="text-black hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a href="#" className="text-black hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.23 20.304c-2.987-.266-5.517-2.796-5.783-5.783-.266-2.987.523-7.251.523-7.251s4.264-.789 7.251-.523c2.987.266 5.517 2.796 5.783 5.783.266 2.987-.523 7.251-.523 7.251s-4.264.789-7.251.523z"/>
                  <path d="M12.017 7.075a4.912 4.912 0 100 9.825 4.912 4.912 0 000-9.825zm0 8.109a3.197 3.197 0 110-6.394 3.197 3.197 0 010 6.394z"/>
                  <circle cx="16.929" cy="7.071" r="1.142"/>
                </svg>
              </a>

              {/* YouTube */}
              <a href="#" className="text-black hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* TikTok */}
              <a href="#" className="text-black hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation - Custom Design with Menu Component */}
      <div className="flex justify-center pt-16 pb-4 relative z-40">
        <div className="relative">
          {/* Custom Menu Container */}
          <div className="bg-white/30 backdrop-blur-md rounded-full shadow-xl px-24 py-3 border border-gray-200/20">
            <div 
              onMouseLeave={() => handleSetActive(null)}
              className="flex items-center justify-between w-full min-w-[700px] relative"
            >
              {/* Left Navigation */}
              <div className="flex items-center space-x-12">
                <div className="cursor-pointer text-gray-700 font-medium hover:text-yellow-600 transition-colors py-1">
                  <HoveredLink href="/nosotros">Nosotros</HoveredLink>
                </div>
                {/* Products Menu Item with Animation */}
                <div 
                  onMouseEnter={() => handleSetActive("Productos")}
                  onMouseLeave={() => handleSetActive(null)}
                  className="relative"
                >
                  <MenuItem setActive={handleSetActive} active={active} item="Productos">
                    <div className="flex flex-col space-y-1 text-sm min-w-[200px] relative">
                      {/* Policarbonatos with side submenu */}
                      <div 
                        className="relative group"
                        onMouseEnter={() => {
                          logger.log('🖱️ Mouse enter Policarbonatos');
                          setSubMenuActive("Policarbonatos");
                        }}
                        onMouseLeave={() => {
                          logger.log('🖱️ Mouse leave Policarbonatos');
                          setSubMenuActive(null);
                        }}
                      >
                        <div className="flex items-center justify-between text-gray-700 hover:text-yellow-600 cursor-pointer py-2 px-3 hover:bg-yellow-50/30 rounded transition-colors">
                          <span>Policarbonatos ({subMenuActive})</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        
                        {/* Side submenu - Debug: current state: {subMenuActive} */}
                        {logger.log('🔍 Rendering condition check:', subMenuActive === "Policarbonatos", 'Current state:', subMenuActive)}
                        {subMenuActive === "Policarbonatos" && (
                          <div className="absolute left-full top-0 ml-2 w-64 bg-white/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-200/50 p-4 z-[70]">
                            <div className="text-sm font-semibold text-gray-800 mb-3 border-b border-yellow-200 pb-2">Tipos de Policarbonatos</div>
                            <div className="space-y-2">
                              <div className="p-2 hover:bg-yellow-50 rounded transition-colors">
                                <HoveredLink href="/policarbonatos/onduladas" className="text-sm font-medium text-gray-700 hover:text-yellow-600 !p-0">Onduladas</HoveredLink>
                                <p className="text-xs text-gray-500 mt-1">Láminas onduladas resistentes</p>
                              </div>
                              <div className="p-2 hover:bg-yellow-50 rounded transition-colors">
                                <HoveredLink href="/policarbonatos/alveolar" className="text-sm font-medium text-gray-700 hover:text-yellow-600 !p-0">Alveolar</HoveredLink>
                                <p className="text-xs text-gray-500 mt-1">Estructura celular liviana</p>
                              </div>
                              <div className="p-2 hover:bg-yellow-50 rounded transition-colors">
                                <HoveredLink href="/policarbonatos/alveolar-compacto" className="text-sm font-medium text-gray-700 hover:text-yellow-600 !p-0">Alveolar Compacto</HoveredLink>
                                <p className="text-xs text-gray-500 mt-1">Mayor resistencia estructural</p>
                              </div>
                              <div className="p-2 hover:bg-yellow-50 rounded transition-colors">
                                <HoveredLink href="/policarbonatos/greca-industrial" className="text-sm font-medium text-gray-700 hover:text-yellow-600 !p-0">Greca Industrial</HoveredLink>
                                <p className="text-xs text-gray-500 mt-1">Para aplicaciones industriales</p>
                              </div>
                              <div className="p-2 hover:bg-yellow-50 rounded transition-colors">
                                <HoveredLink href="/policarbonatos/perfiles-accesorios" className="text-sm font-medium text-gray-700 hover:text-yellow-600 !p-0">Perfiles y Accesorios</HoveredLink>
                                <p className="text-xs text-gray-500 mt-1">Complementos para instalación</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Other main menu items - stay fixed */}
                      <HoveredLink href="/rollos">Rollos</HoveredLink>
                      <HoveredLink href="/accesorios">Accesorios</HoveredLink>
                      <HoveredLink href="/perfiles">Perfiles</HoveredLink>
                      <HoveredLink href="/pinturas-selladores">Pinturas Selladores</HoveredLink>
                    </div>
                  </MenuItem>
                </div>
              </div>

              {/* Spacer for center logo */}
              <div className="w-24"></div>

              {/* Right Navigation */}
              <div className="flex items-center space-x-12">
                <div 
                  onMouseEnter={() => handleSetActive("Fichas Técnicas")}
                  onMouseLeave={() => handleSetActive(null)}
                  className="relative"
                >
                  <MenuItem setActive={handleSetActive} active={active} item="Fichas Técnicas">
                    <div className="flex flex-col space-y-1 text-sm min-w-[160px]">
                      <HoveredLink href="/fichas-tecnicas/alveolar">Alveolar</HoveredLink>
                      <HoveredLink href="/fichas-tecnicas/industrial-lk4">Industrial LK4</HoveredLink>
                      <HoveredLink href="/fichas-tecnicas/industrial-lk825">Industrial LK825</HoveredLink>
                      <HoveredLink href="/fichas-tecnicas/industrial-kr18">Industrial KR18</HoveredLink>
                      <HoveredLink href="/fichas-tecnicas/ondulada">Ondulada</HoveredLink>
                      <HoveredLink href="/fichas-tecnicas/perfiles">Perfiles</HoveredLink>
                      <HoveredLink href="/fichas-tecnicas/rollo-plano">Rollo plano</HoveredLink>
                      <HoveredLink href="/fichas-tecnicas/accesorios">Accesorios</HoveredLink>
                    </div>
                  </MenuItem>
                </div>
                <div className="cursor-pointer text-gray-700 font-medium hover:text-yellow-600 transition-colors py-1">
                  <HoveredLink href="/contacto">Contacto</HoveredLink>
                </div>
              </div>
            </div>
          </div>

          {/* Center Logo in Circle - Perfectly centered over the menu */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 -ml-4 z-10">
            <HoveredLink href="/" className="block">
              <div className="flex items-center justify-center bg-white rounded-full p-5 shadow-lg border-2 border-yellow-400 cursor-pointer transition-transform hover:scale-105">
                <img 
                  src="/assets/images/isotipo.png" 
                  alt="POLIMAX" 
                  className="h-20 w-20 object-contain" 
                />
              </div>
            </HoveredLink>
          </div>
        </div>
      </div>
    </div>
  );
}