"use client";

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Chatbot } from "@/components/chatbot";
import { logger } from "@/lib/logger";
import { useAuth } from '@/contexts/AuthContext';

// Dynamic import para evitar hydration issues
const CartModal = dynamic(() => import("@/components/floating-cart").then(mod => ({ default: mod.CartModal })), {
  ssr: false
});

export function ConditionalComponents() {
  const pathname = usePathname();
  const { isLoading: authLoading } = useAuth();
  
  logger.log('ConditionalComponents - pathname:', pathname);
  logger.log('ConditionalComponents - authLoading:', authLoading);
  
  // No mostrar chatbot ni carrito en ciertas páginas o durante autenticación
  const hideComponents = pathname === '/login' || 
                        pathname === '/register' ||
                        pathname === '/perfil' ||
                        pathname === '/mis-compras' ||
                        pathname === '/coordinador-despacho' || 
                        pathname === '/checkout' ||
                        pathname.startsWith('/admin') ||
                        pathname.startsWith('/auth') ||
                        pathname.includes('/callback') ||
                        pathname.includes('/oauth') ||
                        pathname.includes('/google') ||
                        pathname.includes('/microsoft') ||
                        pathname.includes('/facebook') ||
                        authLoading; // Ocultar también durante procesos de autenticación
  
  logger.log('ConditionalComponents - hideComponents:', hideComponents);
  logger.log('ConditionalComponents - pathname.startsWith(/auth):', pathname.startsWith('/auth'));
  
  if (hideComponents) {
    return null;
  }
  
  return (
    <>
      <CartModal />
      <Chatbot />
    </>
  );
}