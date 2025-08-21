import { Metadata } from 'next'
import { CotizadorIA } from '@/components/cotizador-ia'

export const metadata: Metadata = {
  title: 'Cotizador Guiado por IA | ObraExpress - Policarbonatos Chile',
  description: 'Asistente de Inteligencia Artificial que te guía paso a paso para encontrar la solución perfecta en policarbonatos. Cotización personalizada y recomendaciones inteligentes.',
  keywords: 'cotizador ia policarbonato, asistente inteligencia artificial, cotización guiada, recomendaciones ia, policarbonato chile, polimax ai',
  openGraph: {
    title: 'Cotizador Guiado por IA - Asistente Inteligente | ObraExpress',
    description: 'Inteligencia Artificial especializada en policarbonatos que te ayuda a encontrar la mejor solución para tu proyecto',
    type: 'website',
    images: ['/assets/images/og-cotizador.jpg']
  }
}

export default function CotizadorDetalladoPage() {
  return (
    <CotizadorIA />
  )
}