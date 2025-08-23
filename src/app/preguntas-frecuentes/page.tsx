'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function PreguntasFrecuentes() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqs = [
    {
      question: "¿Qué tipos de policarbonato tienen disponible?",
      answer: "Disponemos de tres tipos principales: **Policarbonato Alveolar** (ideal para techos y cerramientos con excelente aislamiento), **Policarbonato Compacto** (máxima resistencia y transparencia), y **Policarbonato Ondulado** (perfecto para cubiertas con diseño arquitectónico). Todos cuentan con protección UV y certificaciones de calidad."
    },
    {
      question: "¿Cómo funciona el sistema de despacho coordinado?",
      answer: "Utilizamos **GPS logística de vanguardia** para coordinar entregas precisas. Nuestro equipo profesional programa el despacho según tu disponibilidad, te notifica en tiempo real sobre el estado del envío, y garantiza la entrega en la fecha acordada con el cuidado especializado que requieren los materiales."
    },
    {
      question: "¿Qué garantías ofrecen en los productos?",
      answer: "Todos nuestros productos cuentan con **certificaciones ISO 9001, UV 10, CE y ECO**. Ofrecemos garantía de fábrica contra defectos de manufactura y protección UV de 10 años. Nuestros materiales están respaldados por rigurosas pruebas de calidad y cumplimiento de estándares internacionales."
    },
    {
      question: "¿Cómo puedo calcular la cantidad de material que necesito?",
      answer: "Tenemos un **Cotizador IA** que te ayuda a calcular exactamente los materiales necesarios para tu proyecto. También ofrecemos asesoría técnica 24/7 con nuestros especialistas. Solo necesitas las medidas de tu área a cubrir y el tipo de aplicación (techo, cerramiento, etc.)."
    },
    {
      question: "¿Realizan instalación o solo venden materiales?",
      answer: "Nos especializamos en la **venta de materiales de construcción de alta calidad**. Proporcionamos guías técnicas detalladas, especificaciones de instalación, y recomendaciones de profesionales certificados en tu zona. Nuestro enfoque está en suministrar los mejores materiales con el soporte técnico necesario."
    },
    {
      question: "¿Cuáles son los tiempos de entrega?",
      answer: "Los tiempos varían según la ubicación y cantidad. En general: **áreas metropolitanas 24-48 horas**, regiones 3-5 días hábiles. Para proyectos grandes coordinamos entregas programadas. Nuestro sistema de GPS te mantiene informado en tiempo real del estado de tu pedido."
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos múltiples métodos de pago: **tarjetas de débito y crédito**, transferencias bancarias, y pago contra entrega en algunos casos. Nuestro sistema de pagos es seguro y cuenta con certificación de seguridad para proteger tus datos financieros."
    },
    {
      question: "¿Ofrecen descuentos por volumen?",
      answer: "Sí, tenemos **descuentos especiales para proyectos grandes** y compras por volumen. También contamos con precios preferenciales para constructoras y profesionales del sector. Contacta a nuestro equipo comercial para obtener una cotización personalizada."
    },
    {
      question: "¿Cómo funciona la garantía y las devoluciones?",
      answer: "Ofrecemos **garantía de 10 años en protección UV** y garantía de fábrica contra defectos. Para devoluciones, tienes 30 días desde la compra. Los productos deben estar en perfectas condiciones y en su embalaje original. Nuestro equipo de atención al cliente te guía en todo el proceso."
    },
    {
      question: "¿Tienen asesoría técnica especializada?",
      answer: "Contamos con **asesoría técnica 24/7** con ingenieros especializados en policarbonato. Nuestro equipo puede ayudarte con cálculos estructurales, recomendaciones de instalación, y solución de problemas técnicos. La consulta inicial es gratuita para todos nuestros clientes."
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Preguntas Frecuentes</h1>
              <p className="text-gray-600">Respuestas generadas por IA para ayudarte de manera inmediata</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Plataforma con IA de vanguardia • Tecnología de última generación</span>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-bold">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transition-transform ${openQuestion === index ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              
              {openQuestion === index && (
                <div className="px-6 pb-4">
                  <div className="pl-11">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {faq.answer.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <div className="mb-6">
            <svg className="w-12 h-12 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿No encontraste tu respuesta?</h3>
            <p className="text-gray-600">Nuestro equipo de especialistas está disponible 24/7 para ayudarte</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contacto" 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Contactar Especialista
            </Link>
            <Link 
              href="/cotizador-detallado" 
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Usar Cotizador IA
            </Link>
          </div>
        </div>

        {/* AI Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span>Respuestas generadas por IA • OBRAEXPRESS - Tecnología de vanguardia</span>
          </div>
        </div>
      </div>
    </main>
  );
}