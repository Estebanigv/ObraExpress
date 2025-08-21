import { Metadata } from "next";
import React from "react";
import { NavbarSimple } from "@/components/navbar-simple";
import { Chatbot } from "@/components/chatbot";

export const metadata: Metadata = {
  title: "Nosotros - ObraExpress Chile | 15+ Años Especializados en Materiales de Construcción",
  description: "Conoce la historia y experiencia de ObraExpress Chile. Más de 15 años liderando el mercado de policarbonatos y materiales de construcción con garantía UV de 10 años y servicio especializado.",
  keywords: "empresa ObraExpress, historia ObraExpress Chile, experiencia materiales construcción, policarbonatos Chile, garantía UV 10 años, especialistas construcción",
  openGraph: {
    title: "Nosotros - ObraExpress Chile | Especialistas en Materiales de Construcción",
    description: "Más de 15 años de experiencia en policarbonatos y materiales de construcción. Conoce nuestra historia, valores y compromiso con la calidad.",
    type: "website",
    images: [
      {
        url: "https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp",
        width: 1200,
        height: 630,
        alt: "Equipo ObraExpress trabajando con materiales de construcción",
      }
    ],
  },
  alternates: {
    canonical: "https://obraexpress.cl/nosotros"
  }
};

export default function Nosotros() {
  return (
    <main className="min-h-screen bg-white">
      <NavbarSimple />
      
      {/* Hero Section - Your Trusted Partner */}
      <section className="pt-56 pb-20 bg-gradient-to-br from-green-50 to-green-100">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Acerca ObraExpress
                </div>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Tu Socio de Confianza en{" "}
                  <span className="text-green-600">Materiales de Construcción</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Especialistas en láminas alveolares, rollos compactos y soluciones de policarbonato 
                  de alta calidad para la construcción moderna en Chile.
                </p>

                {/* Product Features */}
                <div className="pt-8">
                  <p className="text-sm text-gray-500 mb-4">Nuestras Especialidades</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/80 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">🏗️</div>
                      <span className="text-xs font-medium text-gray-700">Láminas Alveolares</span>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">🔄</div>
                      <span className="text-xs font-medium text-gray-700">Rollos Compactos</span>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">☀️</div>
                      <span className="text-xs font-medium text-gray-700">Protección UV</span>
                    </div>
                    <div className="bg-white/80 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">🛠️</div>
                      <span className="text-xs font-medium text-gray-700">Instalación</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Image */}
              <div className="relative">
                <div className="bg-green-100 rounded-3xl p-8 aspect-[4/3] flex items-center justify-center">
                  <img 
                    src="/assets/images/Nosotros/about-us-team.webp" 
                    alt="Equipo ObraExpress trabajando con materiales de construcción" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Driven by Innovation Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                  Impulsados por la Innovación, Potenciados por las Personas.
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  En ObraExpress combinamos materiales de alta calidad con experiencia técnica especializada. 
                  Nuestro equipo profesional trabaja cada día para ofrecer soluciones constructivas que transformen 
                  proyectos y superen las expectativas más exigentes.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">15+</div>
                    <div className="text-sm text-gray-600">Años Exp.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">800+</div>
                    <div className="text-sm text-gray-600">Proyectos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">97%</div>
                    <div className="text-sm text-gray-600">Satisfacción</div>
                  </div>
                </div>
              </div>
              
              {/* Right Content - Image Collage */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {/* Main large image */}
                  <div className="col-span-2 relative rounded-2xl overflow-hidden">
                    <img 
                      src="/assets/images/Nosotros/about-us-team.webp" 
                      alt="Equipo ObraExpress trabajando con materiales de construcción" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                      Nuestro Equipo
                    </div>
                  </div>
                  
                  {/* Small images */}
                  <div className="relative rounded-xl overflow-hidden">
                    <img 
                      src="/assets/images/bannerB-q82.webp" 
                      alt="Productos de policarbonato" 
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-green-500/10"></div>
                  </div>
                  
                  <div className="relative rounded-xl overflow-hidden">
                    <img 
                      src="/assets/images/bannerB-q82.webp" 
                      alt="Instalación profesional" 
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-500/10"></div>
                  </div>
                </div>
                
                {/* Floating stats card */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">4.8</div>
                      <div className="text-xs text-gray-600">+150 clientes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-8xl font-bold text-gray-900 mb-2">95%</div>
                <div className="text-gray-600">Satisfacción del Cliente</div>
              </div>
              <div>
                <div className="text-8xl font-bold text-gray-900 mb-2">800+</div>
                <div className="text-gray-600">Proyectos Completados</div>
              </div>
              <div>
                <div className="text-8xl font-bold text-gray-900 mb-2">15+</div>
                <div className="text-gray-600">Años de Experiencia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built on Trust Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Image */}
              <div className="relative">
                <img 
                  src="/assets/images/Nosotros/about-us-team.webp" 
                  alt="Equipo ObraExpress trabajando con materiales de construcción" 
                  className="w-full rounded-2xl shadow-lg"
                />
                <div className="absolute bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Equipo ObraExpress
                </div>
              </div>
              
              {/* Right Content */}
              <div className="space-y-8">
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  Construido en Confianza, Impulsado por Resultados
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Garantía UV 10 Años</h3>
                      <p className="text-gray-600 text-sm">Protección garantizada contra rayos ultravioleta</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Materiales Certificados</h3>
                      <p className="text-gray-600 text-sm">Cumplimiento de normativas internacionales de construcción</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Asesoría Técnica Especializada</h3>
                      <p className="text-gray-600 text-sm">Soporte profesional en diseño e instalación</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border">
                  <p className="text-gray-600 text-sm">
                    De acuerdo con el Reglamento, constituirán infracciones administrativas las conductas tipificadas como tales en este texto de manera expresa por violar las obligaciones establecidas en la normativa aplicable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
                Conoce a las Personas Detrás de la Innovación
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="relative mb-4">
                  <img 
                    src="/assets/images/Review/avatar1.webp" 
                    alt="Team Member" 
                    className="w-32 h-32 object-cover rounded-2xl mx-auto"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">María González</h3>
                <p className="text-gray-600 text-sm">Directora de Proyectos</p>
              </div>
              
              <div className="text-center">
                <div className="relative mb-4">
                  <img 
                    src="/assets/images/Review/avatar2.webp" 
                    alt="Team Member" 
                    className="w-32 h-32 object-cover rounded-2xl mx-auto"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">Carlos Mendoza</h3>
                <p className="text-gray-600 text-sm">Ingeniero Senior</p>
              </div>
              
              <div className="text-center">
                <div className="relative mb-4">
                  <img 
                    src="/assets/images/Review/avatar3.webp" 
                    alt="Team Member" 
                    className="w-32 h-32 object-cover rounded-2xl mx-auto"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">Ana Rodríguez</h3>
                <p className="text-gray-600 text-sm">Especialista en Calidad</p>
              </div>
              
              <div className="text-center">
                <div className="relative mb-4">
                  <img 
                    src="/assets/images/Review/avatar4.webp" 
                    alt="Team Member" 
                    className="w-32 h-32 object-cover rounded-2xl mx-auto"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">Luis Hernández</h3>
                <p className="text-gray-600 text-sm">Consultor Técnico</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-green-600 font-medium mb-2">Testimonios</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Reviews que Hablan por Volúmenes
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Review 1 */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Los materiales de ObraExpress han sido fundamentales en nuestros proyectos. La calidad del policarbonato y el soporte técnico son excepcionales."
                </p>
                <div className="flex items-center">
                  <img 
                    src="/assets/images/Review/avatar1.webp" 
                    alt="Client" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">María González</h4>
                    <p className="text-gray-600 text-sm">Arquitecta Principal</p>
                  </div>
                </div>
              </div>
              
              {/* Review 2 */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Los productos de policarbonato que ofrecen son de primera calidad. La atención al cliente y el soporte técnico son excepcionales."
                </p>
                <div className="flex items-center">
                  <img 
                    src="/assets/images/Review/avatar2.webp" 
                    alt="Client" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">Carlos Mendoza</h4>
                    <p className="text-gray-600 text-sm">Director de Construcción</p>
                  </div>
                </div>
              </div>
              
              {/* Review 3 */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "La durabilidad y resistencia de sus láminas alveolares es notable. Han transformado completamente nuestros proyectos de techado."
                </p>
                <div className="flex items-center">
                  <img 
                    src="/assets/images/Review/avatar3.webp" 
                    alt="Client" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">Ana Rodríguez</h4>
                    <p className="text-gray-600 text-sm">Ingeniera Estructural</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insights & Updates Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-green-600 font-medium mb-2">Blog</p>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Insights & Actualizaciones
              </h2>
              <p className="text-gray-600 mt-4">Mantente al día con las últimas tendencias y consejos.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Blog Post 1 */}
              <div className="group">
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img 
                    src="/assets/images/bannerB-q82.webp" 
                    alt="Blog Post" 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm text-gray-600">
                    01 jul 2024
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Innovaciones en Láminas Alveolares de Policarbonato
                </h3>
              </div>
              
              {/* Blog Post 2 */}
              <div className="group">
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img 
                    src="/assets/images/bannerB-q82.webp" 
                    alt="Blog Post" 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm text-gray-600">
                    15 jun 2024
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Guía de Instalación para Techados Industriales
                </h3>
              </div>
              
              {/* Blog Post 3 */}
              <div className="group">
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img 
                    src="/assets/images/bannerB-q82.webp" 
                    alt="Blog Post" 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full text-sm text-gray-600">
                    28 may 2024
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Ventajas del Policarbonato en Construcción Sustentable
                </h3>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Ver Más
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-green-600">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              ¿Listo para Transformar tu Proyecto con Materiales de Primera Calidad?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Únete a cientos de constructores que ya están transformando sus obras con nuestros materiales especializados.
            </p>
            <button className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
              Obtén Una Consulta Gratuita
            </button>
          </div>
        </div>
      </section>

      {/* Chatbot Component */}
      <Chatbot />
    </main>
  );
}