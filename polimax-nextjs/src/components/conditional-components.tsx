"use client";

import { usePathname } from 'next/navigation';
import { Chatbot } from "@/components/chatbot";
import { SimpleCart } from "@/components/simple-cart";

export function ConditionalComponents() {
  const pathname = usePathname();
  
  console.log('ConditionalComponents - pathname:', pathname);
  
  // No mostrar chatbot ni carrito en ciertas páginas
  const hideComponents = pathname === '/login' || pathname === '/coordinador-despacho';
  
  console.log('hideComponents:', hideComponents);
  
  if (hideComponents) {
    return null;
  }
  
  return (
    <>
      <SimpleCart />
      <Chatbot />
    </>
  );
}