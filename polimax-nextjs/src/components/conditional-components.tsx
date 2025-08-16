"use client";

import { usePathname } from 'next/navigation';
import { Chatbot } from "@/components/chatbot";
import { FloatingCart } from "@/components/floating-cart";

export function ConditionalComponents() {
  const pathname = usePathname();
  
  // No mostrar chatbot ni carrito en la página de login
  const hideComponents = pathname === '/login';
  
  if (hideComponents) {
    return null;
  }
  
  return (
    <>
      <FloatingCart />
      <Chatbot />
    </>
  );
}