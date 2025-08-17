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
  title: "POLIMAX Chile - Láminas Alveolares y Rollos Compactos",
  description: "Especialistas en láminas alveolares de policarbonato y rollos compactos para cubiertas y estructuras en Chile",
  keywords: "láminas alveolares, policarbonato, rollos compactos, cubiertas, estructuras, Chile",
  robots: "index, follow",
  openGraph: {
    title: "POLIMAX Chile - Láminas Alveolares y Rollos Compactos",
    description: "Especialistas en láminas alveolares de policarbonato y rollos compactos para cubiertas y estructuras en Chile",
    type: "website",
    locale: "es_CL",
  },
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
