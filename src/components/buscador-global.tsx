"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import productosData from '@/data/productos-policarbonato.json';

interface SearchResult {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  espesor: string;
  color: string;
  precio: number;
  groupId: string;
  imagen?: string;
}

interface BuscadorGlobalProps {
  className?: string;
  placeholder?: string;
}

export const BuscadorGlobal: React.FC<BuscadorGlobalProps> = ({ 
  className = "",
  placeholder = "Buscar..."
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  // Crear índice de búsqueda simplificado
  const searchIndex = useMemo(() => {
    const index: SearchResult[] = [];
    
    productosData.productos_policarbonato.forEach(categoria => {
      if (categoria.variantes) {
        categoria.variantes.forEach(variante => {
          index.push({
            id: variante.codigo,
            codigo: variante.codigo,
            nombre: variante.nombre,
            categoria: variante.categoria,
            espesor: variante.espesor,
            color: variante.color,
            precio: variante.precio_con_iva,
            groupId: categoria.id,
            imagen: (variante as any).imagen || '/assets/images/Productos/policarbonato_alveolar_4mm_cristal.webp'
          });
        });
      }
    });
    
    return index;
  }, []);

  // Función para resaltar texto
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const terms = query.toLowerCase().split(' ').filter(Boolean);
    let highlightedText = text;
    
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  // Función de búsqueda simple
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    const terms = searchQuery.toLowerCase().split(' ').filter(Boolean);
    
    const filtered = searchIndex.filter(item => {
      const searchableText = `${item.nombre} ${item.categoria} ${item.espesor} ${item.color}`.toLowerCase();
      return terms.some(term => searchableText.includes(term));
    });
    
    setResults(filtered.slice(0, 8)); // Máximo 8 resultados
  };

  // Efecto de búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery(''); // Limpiar la query para contraer el buscador
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Manejar selección de resultado
  const handleSelectResult = (result: SearchResult) => {
    console.log('🔍 Producto seleccionado:', {
      nombre: result.nombre,
      groupId: result.groupId,
      codigo: result.codigo
    });
    
    // Navegar inmediatamente
    const url = `/productos/${result.groupId}`;
    console.log('🚀 Navegando a:', url);
    
    // Navegar primero, luego limpiar
    router.push(url);
    
    // Limpiar después de navegar
    setTimeout(() => {
      setQuery('');
      setIsOpen(false);
    }, 50);
  };

  // Manejar entrada de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery(''); // Esto contraerá el buscador al tamaño original
      inputRef.current?.blur();
    }
  };

  return (
    <>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div ref={searchRef} className={`relative ${className}`}>
      {/* Buscador compacto */}
      <div className="relative group">
        <div className={`
          flex items-center transition-all duration-300 ease-out
          ${query || isOpen ? 'w-64' : 'w-10'}
          h-10 bg-white/95 backdrop-blur-sm
          border-2 ${query || isOpen ? 'border-yellow-400 shadow-lg shadow-yellow-200/30' : 'border-gray-200'} 
          hover:border-yellow-300 focus-within:border-yellow-500
          rounded-full ${query || isOpen ? 'shadow-xl' : 'shadow-sm hover:shadow-md'}
          ${query || isOpen ? 'ring-2 ring-yellow-200/50' : ''}
        `}>
          {/* Icono de lupa */}
          <button 
            onClick={() => {
              inputRef.current?.focus();
              setIsOpen(true);
            }}
            className="flex items-center justify-center w-10 h-10 flex-shrink-0 rounded-full hover:bg-yellow-50 transition-colors"
          >
            <svg 
              className="w-5 h-5 text-gray-500 group-hover:text-yellow-500 transition-colors"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </button>
          
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query && setIsOpen(true)}
            placeholder={placeholder}
            className={`
              flex-1 h-full bg-transparent
              text-sm text-gray-800 placeholder-gray-400
              focus:outline-none pr-3
              transition-all duration-300
              ${query || isOpen ? 'opacity-100 w-full' : 'opacity-0 w-0'}
            `}
          />
        </div>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && results.length > 0 && (
        <div 
          className="absolute bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto scrollbar-hide"
          style={{ 
            zIndex: '999999999 !important',
            width: '650px',
            maxWidth: '95vw',
            pointerEvents: 'auto',
            top: 'calc(100% + 20px)',
            left: '0px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          onWheel={(e) => {
            // Prevenir scroll de la página completamente
            e.preventDefault();
            e.stopPropagation();
            
            // Obtener el contenedor del dropdown
            const container = e.currentTarget;
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const height = container.clientHeight;
            const delta = e.deltaY;
            
            // Solo hacer scroll si hay contenido para hacer scroll
            if (delta > 0 && scrollTop + height < scrollHeight) {
              // Scroll hacia abajo
              container.scrollTop = Math.min(scrollTop + delta, scrollHeight - height);
            } else if (delta < 0 && scrollTop > 0) {
              // Scroll hacia arriba
              container.scrollTop = Math.max(scrollTop + delta, 0);
            }
          }}
        >
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelectResult(result);
              }}
              onMouseEnter={(e) => {
                console.log(`🐭 Mouse enter en producto ${index}: ${result.nombre}`);
                e.currentTarget.style.backgroundColor = '#fef3c7';
                e.currentTarget.style.borderLeft = '4px solid #f59e0b';
              }}
              onMouseLeave={(e) => {
                console.log(`🐭 Mouse leave en producto ${index}: ${result.nombre}`);
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.borderLeft = '';
              }}
              className="group w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-all duration-200 cursor-pointer hover:bg-yellow-100 hover:border-l-4 hover:border-l-yellow-500 hover:shadow-md"
              style={{ 
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: '999999999'
              }}
            >
              <div className="flex items-start space-x-3">
                {/* Imagen del producto */}
                <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                  {result.imagen ? (
                    <img
                      src={result.imagen}
                      alt={result.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback a imagen por defecto
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/images/Productos/policarbonato_alveolar_4mm_cristal.webp';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="flex-1 min-w-0 group-hover:text-gray-800">
                  <div 
                    className="font-medium text-gray-900 text-sm group-hover:text-gray-800 transition-colors"
                    dangerouslySetInnerHTML={{ __html: highlightText(result.nombre, query) }}
                  />
                  <div 
                    className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(`${result.categoria} • ${result.espesor} • ${result.color}`, query) 
                    }}
                  />
                </div>

                {/* Precio */}
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-blue-600 text-sm">
                    ${result.precio.toLocaleString('es-CL')}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {isOpen && query && results.length === 0 && (
        <div 
          className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4"
          style={{ 
            zIndex: '999999999 !important',
            width: '650px',
            maxWidth: '95vw'
          }}
        >
          <div className="text-center text-gray-500">
            <div className="text-sm">No se encontraron productos para "{query}"</div>
            <div className="text-xs mt-1">Intenta con otros términos como "6mm", "transparente", "alveolar"</div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

// Hook simplificado para atajos de teclado
export const useSearchShortcut = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="Buscar"]');
        input?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};