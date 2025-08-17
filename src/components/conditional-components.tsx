"use client";

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Chatbot } from "@/components/chatbot";
import { ElevenLabsWidget } from "@/components/elevenlabs-widget";
import { logger } from "@/lib/logger";

// Dynamic import para evitar hydration issues
const CartModal = dynamic(() => import("@/components/floating-cart").then(mod => ({ default: mod.CartModal })), {
  ssr: false
});

export function ConditionalComponents() {
  const pathname = usePathname();
  
  logger.log('ConditionalComponents - pathname:', pathname);
  
  // No mostrar chatbot ni carrito en ciertas páginas
  const hideComponents = pathname === '/login' || pathname === '/coordinador-despacho' || pathname === '/checkout';
  
  logger.log('hideComponents:', hideComponents);
  
  if (hideComponents) {
    return null;
  }
  
  return (
    <>
      <CartModal />
      <Chatbot />
      <ElevenLabsWidget />
    </>
  );
}