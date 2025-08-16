"use client";

import React, { useState, useEffect } from "react";
import { HoveredLink } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";
import { CoordinadorDespacho } from "./coordinador-despacho";
import { UserMenu } from "@/components/user-menu";

export function NavbarSimple() {
  return (
    <div className="relative w-full">
      <Navbar />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [subMenuActive, setSubMenuActive] = useState<string | null>(null);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);
  const [subMenuTimeout, setSubMenuTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (closeTimeout) clearTimeout(closeTimeout);
      if (subMenuTimeout) clearTimeout(subMenuTimeout);
    };
  }, [closeTimeout, subMenuTimeout]);

  const handleMouseEnterMenu = (menu: string) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeaveMenu = () => {
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
      setSubMenuActive(null);
    }, 500);
    setCloseTimeout(timeout);
  };

  const handleMouseEnterSubMenu = (submenu: string) => {
    if (closeTimeout) {
      clearTimeout(closeTimeout);
      setCloseTimeout(null);
    }
    if (subMenuTimeout) {
      clearTimeout(subMenuTimeout);
      setSubMenuTimeout(null);
    }
    setSubMenuActive(submenu);
  };

  const handleMouseLeaveSubMenu = () => {
    const timeout = setTimeout(() => {
      setSubMenuActive(null);
    }, 300);
    setSubMenuTimeout(timeout);
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
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 overflow-hidden">
              <span className="text-black font-medium flex items-center text-xs sm:text-sm">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
                <span className="hidden sm:inline">+56 2 2345 6789</span>
                <span className="sm:hidden">Tel</span>
              </span>
              <span className="text-black flex items-center text-xs sm:text-sm hidden sm:flex">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                <span className="hidden md:inline">info@polimax.cl</span>
                <span className="md:hidden">Email</span>
              </span>
              <span className="text-black hidden lg:block text-xs">🚚 Envío gratis sobre $100.000</span>
            </div>

            {/* Center: Promotions */}
            <div className="hidden lg:block">
              <span className="text-black font-bold text-sm">🔥 30% OFF productos seleccionados</span>
            </div>

            {/* Right: Botón Despacho + UserMenu + Social Media */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              {/* Botón Coordina tu Despacho */}
              <a
                href="/coordinador-despacho"
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-1 sm:space-x-2"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden lg:inline">Coordina tu Despacho</span>
                <span className="lg:hidden">Despacho</span>
              </a>
              
              <div className="h-4 sm:h-6 w-px bg-black/20 hidden sm:block"></div>
              
              {/* UserMenu */}
              <UserMenu />
              
              <div className="h-4 sm:h-6 w-px bg-black/20 hidden lg:block"></div>
              
              <span className="text-black text-xs font-medium hidden lg:inline">Síguenos:</span>
              
              {/* Social Media - Hidden on mobile, visible on larger screens */}
              <div className="hidden xl:flex items-center space-x-2">
                {/* Facebook */}
                <a href="#" className="text-black hover:text-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a href="#" className="text-black hover:text-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.23 20.304c-2.987-.266-5.517-2.796-5.783-5.783-.266-2.987.523-7.251.523-7.251s4.264-.789 7.251-.523c2.987.266 5.517 2.796 5.783 5.783.266 2.987-.523 7.251-.523 7.251s-4.264.789-7.251.523z"/>
                    <path d="M12.017 7.075a4.912 4.912 0 100 9.825 4.912 4.912 0 000-9.825zm0 8.109a3.197 3.197 0 110-6.394 3.197 3.197 0 010 6.394z"/>
                    <circle cx="16.929" cy="7.071" r="1.142"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a href="#" className="text-black hover:text-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a href="#" className="text-black hover:text-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className={`relative transition-all duration-300 ${activeDropdown ? 'z-10' : 'z-40'}`}>
        {/* Desktop Navigation */}
        <div className="hidden lg:flex justify-center pt-16 pb-4">
          <div className="relative">
            {/* Navigation Container */}
            <div className="bg-white/90 backdrop-blur-md rounded-full shadow-xl px-24 py-3 border border-gray-300/40">
              <div className="flex items-center justify-between w-full min-w-[700px] relative">
              {/* Left Navigation */}
              <div className="flex items-center space-x-12">
                <div className="cursor-pointer text-gray-800 font-semibold hover:text-amber-600 transition-colors py-1">
                  <HoveredLink href="/nosotros">Nosotros</HoveredLink>
                </div>
                
                {/* Productos Dropdown */}
                <div 
                  className="relative group"
                  onMouseEnter={() => handleMouseEnterMenu("Productos")}
                  onMouseLeave={handleMouseLeaveMenu}
                >
                  <div className="cursor-pointer text-gray-800 font-semibold hover:text-amber-600 transition-colors py-1 flex items-center">
                    <HoveredLink href="/productos">Productos</HoveredLink>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {/* Productos Dropdown */}
                  {activeDropdown === "Productos" && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-6 w-48 bg-white rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-2 border-gray-400 p-2 z-[99999]">
                      <div 
                        className="relative px-3 py-2 hover:bg-yellow-50 rounded transition-colors cursor-pointer flex items-center justify-between"
                        onMouseEnter={() => handleMouseEnterSubMenu("Policarbonatos")}
                        onMouseLeave={handleMouseLeaveSubMenu}
                      >
                        <span className="text-sm text-gray-800 font-medium hover:text-amber-600">Policarbonatos</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        
                        {/* Extra hover area to the right for easier navigation */}
                        <div className="absolute right-0 top-0 w-8 h-full bg-transparent z-[140]"></div>
                        
                        {/* Policarbonatos Side Submenu */}
                        {subMenuActive === "Policarbonatos" && (
                          <>
                            {/* Invisible bridge to prevent gap issues */}
                            <div className="absolute left-full top-0 w-4 h-full bg-transparent z-[140]"></div>
                            <div 
                              className="absolute left-full top-[-10px] ml-2 w-72 bg-white rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-2 border-gray-400 p-4 z-[99999]"
                              onMouseEnter={() => handleMouseEnterSubMenu("Policarbonatos")}
                              onMouseLeave={handleMouseLeaveSubMenu}
                            >
                              <div className="text-sm font-semibold text-gray-800 mb-3 border-b border-yellow-200 pb-2 flex justify-between items-center">
                                <span>Tipos de Policarbonatos</span>
                                <button 
                                  onClick={() => setSubMenuActive(null)}
                                  className="text-gray-400 hover:text-gray-600 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            <div className="space-y-3">
                              <HoveredLink href="/productos?categoria=Policarbonatos&subcategoria=Onduladas">
                                <div className="p-3 hover:bg-yellow-50 rounded transition-colors border border-transparent hover:border-yellow-200 cursor-pointer">
                                  <div className="text-sm font-medium text-gray-700 hover:text-yellow-600">
                                    Onduladas
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">Láminas onduladas resistentes para techos</p>
                                </div>
                              </HoveredLink>
                              <div className="p-3 hover:bg-yellow-50 rounded transition-colors border border-transparent hover:border-yellow-200 cursor-pointer">
                                <div className="text-sm font-medium text-gray-700 hover:text-yellow-600">
                                  Alveolar
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Estructura celular liviana y aislante</p>
                              </div>
                              <div className="p-3 hover:bg-yellow-50 rounded transition-colors border border-transparent hover:border-yellow-200 cursor-pointer">
                                <div className="text-sm font-medium text-gray-700 hover:text-yellow-600">
                                  Alveolar Compacto
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Mayor resistencia estructural</p>
                              </div>
                              <div className="p-3 hover:bg-yellow-50 rounded transition-colors border border-transparent hover:border-yellow-200 cursor-pointer">
                                <div className="text-sm font-medium text-gray-700 hover:text-yellow-600">
                                  Greca Industrial
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Para aplicaciones industriales</p>
                              </div>
                              <div className="p-3 hover:bg-yellow-50 rounded transition-colors border border-transparent hover:border-yellow-200 cursor-pointer">
                                <div className="text-sm font-medium text-gray-700 hover:text-yellow-600">
                                  Perfiles y Accesorios
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Complementos para instalación</p>
                              </div>
                            </div>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="block px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded transition-colors hover:text-yellow-600 cursor-pointer">Rollos</div>
                      <div className="block px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded transition-colors hover:text-yellow-600 cursor-pointer">Accesorios</div>
                      <div className="block px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded transition-colors hover:text-yellow-600 cursor-pointer">Perfiles</div>
                      
                      {/* Pinturas/Selladores con submenú lateral */}
                      <div 
                        className="relative"
                        onMouseEnter={() => handleMouseEnterSubMenu("Pinturas")}
                        onMouseLeave={handleMouseLeaveSubMenu}
                      >
                        <div className="flex items-center justify-between text-gray-700 hover:text-yellow-600 cursor-pointer py-2 px-3 hover:bg-yellow-50 rounded transition-colors">
                          <span className="text-sm">Pinturas/Selladores</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        
                        {/* Extra hover area to the right for easier navigation */}
                        <div className="absolute right-0 top-0 w-8 h-full bg-transparent z-[140]"></div>
                        
                        {/* Pinturas/Selladores Side Submenu */}
                        {subMenuActive === "Pinturas" && (
                          <>
                            {/* Invisible bridge to prevent gap issues */}
                            <div className="absolute left-full top-0 w-4 h-full bg-transparent z-[140]"></div>
                            <div 
                              className="absolute left-full top-[-10px] ml-2 w-72 bg-white rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-2 border-gray-400 p-4 z-[99999]"
                              onMouseEnter={() => handleMouseEnterSubMenu("Pinturas")}
                              onMouseLeave={handleMouseLeaveSubMenu}
                            >
                              <div className="text-sm font-semibold text-gray-800 mb-3 border-b border-yellow-200 pb-2 flex justify-between items-center">
                                <span>Tipos de Pinturas/Selladores</span>
                                <button 
                                  onClick={() => setSubMenuActive(null)}
                                  className="text-gray-400 hover:text-gray-600 text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="space-y-3">
                                <div className="p-3 hover:bg-yellow-50 rounded transition-colors border border-transparent hover:border-yellow-200 cursor-pointer">
                                  <div className="text-sm font-medium text-gray-700 hover:text-yellow-600">
                                    Barnices de madera
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">Protección y acabado para madera</p>
                                </div>
                                <div className="p-3 hover:bg-yellow-50 rounded transition-colors border border-transparent hover:border-yellow-200 cursor-pointer">
                                  <div className="text-sm font-medium text-gray-700 hover:text-yellow-600">
                                    Pinturas metal
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">Recubrimientos especiales para metal</p>
                                </div>
                                <div className="p-3 hover:bg-yellow-50 rounded transition-colors border border-transparent hover:border-yellow-200 cursor-pointer">
                                  <div className="text-sm font-medium text-gray-700 hover:text-yellow-600">
                                    Selladores
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">Selladores de alta calidad</p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Spacer for center logo */}
              <div className="w-24"></div>

              {/* Right Navigation */}
              <div className="flex items-center space-x-12">
                {/* Fichas Técnicas Dropdown */}
                <div 
                  className="relative group"
                  onMouseEnter={() => handleMouseEnterMenu("Fichas")}
                  onMouseLeave={handleMouseLeaveMenu}
                >
                  <div className="cursor-pointer text-gray-800 font-semibold hover:text-amber-600 transition-colors py-1 flex items-center">
                    <span>Fichas Técnicas</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  {activeDropdown === "Fichas" && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-6 w-48 bg-white rounded-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border-2 border-gray-400 p-2 z-[99999]">
                      <div className="block px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded transition-colors hover:text-yellow-600 cursor-pointer">Alveolar</div>
                      <div className="block px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded transition-colors hover:text-yellow-600 cursor-pointer">Industrial LK4</div>
                      <div className="block px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded transition-colors hover:text-yellow-600 cursor-pointer">Industrial LK825</div>
                      <div className="block px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded transition-colors hover:text-yellow-600 cursor-pointer">Industrial KR18</div>
                      <div className="block px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded transition-colors hover:text-yellow-600 cursor-pointer">Ondulada</div>
                      <div className="block px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded transition-colors hover:text-yellow-600 cursor-pointer">Perfiles</div>
                      <div className="block px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded transition-colors hover:text-yellow-600 cursor-pointer">Rollo plano</div>
                      <div className="block px-3 py-2 text-sm text-gray-700 hover:bg-yellow-50 rounded transition-colors hover:text-yellow-600 cursor-pointer">Accesorios</div>
                    </div>
                  )}
                </div>
                
                <div className="cursor-pointer text-gray-800 font-semibold hover:text-amber-600 transition-colors py-1">
                  <HoveredLink href="/contacto">Contacto</HoveredLink>
                </div>
              </div>
            </div>
          </div>

          {/* Center Logo in Circle - Animated scale and opacity */}
          <div className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 -ml-4 z-[60] transition-all duration-500 ease-in-out ${activeDropdown ? 'opacity-30 scale-[0.85]' : 'opacity-100 scale-100'}`}>
            <HoveredLink href="/" className="block">
              <div className="flex items-center justify-center bg-white rounded-full p-5 shadow-xl border-3 border-amber-500 cursor-pointer transition-transform hover:scale-105">
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
        
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <div className="bg-white/90 backdrop-blur-md shadow-xl border-b border-gray-300/40">
            <div className="flex items-center justify-between px-4 py-3">
              {/* Mobile Logo */}
              <HoveredLink href="/" className="flex items-center">
                <img 
                  src="/assets/images/isotipo.png" 
                  alt="POLIMAX" 
                  className="h-8 w-8 object-contain" 
                />
                <span className="ml-2 text-lg font-bold text-gray-900">POLIMAX</span>
              </HoveredLink>
              
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-800 hover:text-amber-600 transition-colors p-2"
                aria-label="Toggle mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
            
            {/* Mobile Menu Items */}
            {isMobileMenuOpen && (
              <div className="border-t border-gray-200 bg-white">
                <div className="px-4 py-3 space-y-3">
                  <HoveredLink href="/nosotros" className="block text-gray-800 font-medium hover:text-amber-600 transition-colors py-2">
                    Nosotros
                  </HoveredLink>
                  
                  <HoveredLink href="/productos" className="block text-gray-800 font-medium hover:text-amber-600 transition-colors py-2">
                    Productos
                  </HoveredLink>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="text-sm text-gray-600 font-medium mb-2">Categorías</div>
                    <HoveredLink href="/productos?categoria=Policarbonatos" className="block text-gray-700 hover:text-amber-600 transition-colors py-1 pl-4">
                      Policarbonatos
                    </HoveredLink>
                    <HoveredLink href="/productos?categoria=Rollos" className="block text-gray-700 hover:text-amber-600 transition-colors py-1 pl-4">
                      Rollos
                    </HoveredLink>
                    <HoveredLink href="/productos?categoria=Accesorios" className="block text-gray-700 hover:text-amber-600 transition-colors py-1 pl-4">
                      Accesorios
                    </HoveredLink>
                    <HoveredLink href="/productos?categoria=Pinturas/Selladores" className="block text-gray-700 hover:text-amber-600 transition-colors py-1 pl-4">
                      Pinturas/Selladores
                    </HoveredLink>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <HoveredLink href="/contacto" className="block text-gray-800 font-medium hover:text-amber-600 transition-colors py-2">
                      Contacto
                    </HoveredLink>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}