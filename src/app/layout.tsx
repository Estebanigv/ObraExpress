import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import "../styles/responsive-optimizations.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConditionalComponents } from "@/components/conditional-components";
import { AuthGuard } from "@/components/auth-guard";
import { CriticalResourcePreloader } from "@/components/critical-resource-preloader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "ObraExpress Chile - Materiales para Construcción | Policarbonatos, Láminas Alveolares y Sistemas Estructurales",
  description: "Especialistas en materiales para construcción en Chile. Policarbonatos, láminas alveolares, rollos compactos, sistemas estructurales y accesorios profesionales para proyectos de construcción. 15+ años de experiencia, garantía UV 10 años.",
  keywords: "materiales construcción Chile, policarbonato construcción, láminas alveolares construcción, sistemas estructurales construcción, accesorios construcción, cubiertas construcción, cerramientos industriales, techados policarbonato, ObraExpress Chile, construcción sustentable, materiales especializados construcción",
  robots: "index, follow",
  authors: [{ name: "ObraExpress Chile" }],
  creator: "ObraExpress Chile",
  publisher: "ObraExpress Chile",
  category: "Materiales de Construcción",
  openGraph: {
    title: "ObraExpress Chile - Materiales para Construcción | Policarbonatos, Láminas Alveolares y Sistemas Estructurales",
    description: "Especialistas en materiales para construcción en Chile. Policarbonatos, láminas alveolares, rollos compactos, sistemas estructurales y accesorios profesionales para proyectos de construcción. 15+ años de experiencia, garantía UV 10 años.",
    type: "website",
    locale: "es_CL",
    siteName: "ObraExpress Chile",
    url: "https://obraexpress.cl",
    images: [
      {
        url: "https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp",
        width: 1200,
        height: 630,
        alt: "Equipo ObraExpress trabajando con materiales de construcción",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ObraExpress Chile - Materiales para Construcción",
    description: "Especialistas en policarbonatos y materiales para construcción en Chile. Garantía UV 10 años.",
    images: ["https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp"],
    creator: "@obraexpresschile",
    site: "@obraexpresschile",
  },
  alternates: {
    canonical: "https://obraexpress.cl"
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ObraExpress Chile",
      "alternateName": "ObraExpress",
      "description": "Especialistas en materiales para construcción en Chile. Policarbonatos, láminas alveolares, sistemas estructurales y accesorios profesionales.",
      "url": "https://obraexpress.cl",
      "logo": "https://obraexpress.cl/assets/images/Logotipo/isotipo_obraexpress.webp",
      "image": "https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp",
      "foundingDate": "2009",
      "slogan": "Materiales para la construcción de calidad superior",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+56-2-2345-6789",
          "contactType": "customer service",
          "areaServed": "CL",
          "availableLanguage": "Spanish"
        },
        {
          "@type": "ContactPoint",
          "url": "https://wa.me/56963348909",
          "contactType": "customer service",
          "availableLanguage": "Spanish"
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "CL",
        "addressRegion": "Región Metropolitana"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Chile"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Materiales de Construcción",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Láminas Alveolares de Policarbonato",
              "category": "Materiales de Construcción"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Rollos Compactos de Policarbonato",
              "category": "Materiales de Construcción"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Sistemas Estructurales",
              "category": "Materiales de Construcción"
            }
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "200",
        "bestRating": "5"
      },
      "sameAs": [
        "https://www.facebook.com/obraexpresschile",
        "https://www.instagram.com/obraexpresschile"
      ]
    })
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <CriticalResourcePreloader />
            <AuthGuard requireAuth={true} redirectTo="/login">
              {children}
              <ConditionalComponents />
            </AuthGuard>
            {/* Widget Eleven Labs oculto */}
            <div 
              id="elevenlabs-widget-container"
              style={{ 
                display: 'none',
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9998,
                maxWidth: '405px',
                maxHeight: '531px',
                width: '405px',
                height: '531px',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
                background: 'white',
                border: '1px solid rgba(0, 0, 0, 0.1)'
              }}
            >
              <elevenlabs-convai agent-id="agent_4301k2mkrbt4f6c86gj7avhrerq2"></elevenlabs-convai>
              <style>{`
                #elevenlabs-widget-container elevenlabs-convai {
                  width: 100%;
                  height: 100%;
                  background: white !important;
                  border-radius: 16px;
                }
                #elevenlabs-widget-container elevenlabs-convai iframe {
                  background: white !important;
                  border-radius: 16px;
                }
                #elevenlabs-widget-container elevenlabs-convai p,
                #elevenlabs-widget-container elevenlabs-convai h1,
                #elevenlabs-widget-container elevenlabs-convai h2,
                #elevenlabs-widget-container elevenlabs-convai h3,
                #elevenlabs-widget-container elevenlabs-convai .description,
                #elevenlabs-widget-container elevenlabs-convai .text,
                #elevenlabs-widget-container elevenlabs-convai .content,
                #elevenlabs-widget-container elevenlabs-convai .title,
                #elevenlabs-widget-container elevenlabs-convai .subtitle {
                  display: none !important;
                }
                
                /* Estilo para el botón de cortar llamada */
                #elevenlabs-widget-container elevenlabs-convai button[aria-label*="end"],
                #elevenlabs-widget-container elevenlabs-convai button[aria-label*="hang"],
                #elevenlabs-widget-container elevenlabs-convai button[aria-label*="stop"],
                #elevenlabs-widget-container elevenlabs-convai button[title*="end"],
                #elevenlabs-widget-container elevenlabs-convai button[title*="hang"],
                #elevenlabs-widget-container elevenlabs-convai button[title*="stop"],
                #elevenlabs-widget-container elevenlabs-convai button:has(svg[viewBox*="phone"]),
                #elevenlabs-widget-container elevenlabs-convai button:has(path[d*="phone"]) {
                  background-color: #dc2626 !important;
                  background: #dc2626 !important;
                  border-color: #dc2626 !important;
                  color: white !important;
                }
                
                #elevenlabs-widget-container elevenlabs-convai button[aria-label*="end"]:hover,
                #elevenlabs-widget-container elevenlabs-convai button[aria-label*="hang"]:hover,
                #elevenlabs-widget-container elevenlabs-convai button[aria-label*="stop"]:hover,
                #elevenlabs-widget-container elevenlabs-convai button[title*="end"]:hover,
                #elevenlabs-widget-container elevenlabs-convai button[title*="hang"]:hover,
                #elevenlabs-widget-container elevenlabs-convai button[title*="stop"]:hover,
                #elevenlabs-widget-container elevenlabs-convai button:has(svg[viewBox*="phone"]):hover,
                #elevenlabs-widget-container elevenlabs-convai button:has(path[d*="phone"]):hover {
                  background-color: #b91c1c !important;
                  background: #b91c1c !important;
                  border-color: #b91c1c !important;
                  transform: scale(1.05) !important;
                }
              `}</style>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
