import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConditionalComponents } from "@/components/conditional-components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "POLIMAX Chile - Materiales para Construcción | Policarbonatos, Láminas Alveolares y Sistemas Estructurales",
  description: "Especialistas en materiales para construcción en Chile. Policarbonatos, láminas alveolares, rollos compactos, sistemas estructurales y accesorios profesionales para proyectos de construcción. 15+ años de experiencia, garantía UV 10 años.",
  keywords: "materiales construcción Chile, policarbonato construcción, láminas alveolares construcción, sistemas estructurales construcción, accesorios construcción, cubiertas construcción, cerramientos industriales, techados policarbonato, POLIMAX Chile, construcción sustentable, materiales especializados construcción",
  robots: "index, follow",
  authors: [{ name: "POLIMAX Chile" }],
  creator: "POLIMAX Chile",
  publisher: "POLIMAX Chile",
  category: "Materiales de Construcción",
  openGraph: {
    title: "POLIMAX Chile - Materiales para Construcción | Policarbonatos, Láminas Alveolares y Sistemas Estructurales",
    description: "Especialistas en materiales para construcción en Chile. Policarbonatos, láminas alveolares, rollos compactos, sistemas estructurales y accesorios profesionales para proyectos de construcción. 15+ años de experiencia, garantía UV 10 años.",
    type: "website",
    locale: "es_CL",
    siteName: "POLIMAX Chile",
    url: "https://polimax.cl",
    images: [
      {
        url: "https://polimax.cl/assets/images/Nosotros/about-us-team.webp",
        width: 1200,
        height: 630,
        alt: "Equipo POLIMAX trabajando con materiales de construcción",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "POLIMAX Chile - Materiales para Construcción",
    description: "Especialistas en policarbonatos y materiales para construcción en Chile. Garantía UV 10 años.",
    images: ["https://polimax.cl/assets/images/Nosotros/about-us-team.webp"],
    creator: "@polimaxchile",
    site: "@polimaxchile",
  },
  alternates: {
    canonical: "https://polimax.cl"
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "POLIMAX Chile",
      "alternateName": "POLIMAX",
      "description": "Especialistas en materiales para construcción en Chile. Policarbonatos, láminas alveolares, sistemas estructurales y accesorios profesionales.",
      "url": "https://polimax.cl",
      "logo": "https://polimax.cl/assets/images/Logotipo/polimax-isotipo-amarillo-negro.webp",
      "image": "https://polimax.cl/assets/images/Nosotros/about-us-team.webp",
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
        "https://www.facebook.com/polimaxchile",
        "https://www.instagram.com/polimaxchile"
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            {children}
            <ConditionalComponents />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
