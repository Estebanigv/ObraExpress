import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'POLIMAX Chile - Materiales para Construcción',
    short_name: 'POLIMAX',
    description: 'Especialistas en policarbonatos y materiales para construcción en Chile',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#eab308',
    categories: ['business', 'construction', 'shopping'],
    icons: [
      {
        src: '/assets/images/Logotipo/polimax-isotipo-amarillo-negro.webp',
        sizes: 'any',
        type: 'image/webp',
      },
    ],
  }
}