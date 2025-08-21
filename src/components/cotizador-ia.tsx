"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import productosData from '@/data/productos-policarbonato.json';

interface Message {
  id: string;
  type: 'bot' | 'user' | 'system';
  content: string;
  timestamp: Date;
  options?: string[];
  data?: any;
}

interface ProjectData {
  tipo_proyecto?: string;
  ubicacion?: string;
  dimensiones?: {
    ancho?: number;
    largo?: number;
    area?: number;
  };
  uso_principal?: string;
  presupuesto?: {
    minimo?: number;
    maximo?: number;
  };
  timeline?: string;
  productos_sugeridos?: any[];
  instalacion?: boolean;
  contacto?: {
    nombre?: string;
    telefono?: string;
    email?: string;
  };
}

const CONVERSATION_STEPS = {
  WELCOME: 'welcome',
  PROJECT_TYPE: 'project_type',
  LOCATION: 'location',
  DIMENSIONS: 'dimensions',
  USE_CASE: 'use_case',
  BUDGET: 'budget',
  TIMELINE: 'timeline',
  PRODUCT_SELECTION: 'product_selection',
  CART_MANAGEMENT: 'cart_management',
  INSTALLATION: 'installation',
  USER_DATA: 'user_data',
  ADDRESS_CONFIRMATION: 'address_confirmation',
  GEOLOCATION: 'geolocation',
  FINAL_BUDGET: 'final_budget',
  CHECKOUT: 'checkout'
};

// Función global para inicializar el mapa Leaflet
const initializeMap = (element: HTMLElement, location: {lat: number, lng: number}, messageId: string) => {
  if (typeof window !== 'undefined' && window.L && !element.hasChildNodes()) {
    // Crear el mapa con controles personalizados
    const map = window.L.map(element, {
      zoomControl: false // Desactivar controles por defecto para agregar personalizados
    }).setView([location.lat, location.lng], 16);
    
    // Agregar tiles de OpenStreetMap
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Controles de zoom personalizados
    window.L.control.zoom({
      position: 'topright'
    }).addTo(map);
    
    // Botón de pantalla completa personalizado
    const fullscreenControl = window.L.Control.extend({
      options: {
        position: 'topright'
      },
      onAdd: function(map: any) {
        const container = window.L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
        container.style.backgroundColor = 'white';
        container.style.width = '30px';
        container.style.height = '30px';
        container.style.cursor = 'pointer';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.justifyContent = 'center';
        container.innerHTML = '⛶';
        container.title = 'Expandir mapa';
        
        container.onclick = function() {
          expandMapModal(location, messageId, map);
        };
        
        return container;
      }
    });
    
    new fullscreenControl().addTo(map);
    
    // Crear marcador arrastrable
    const marker = window.L.marker([location.lat, location.lng], {
      draggable: true,
      title: 'Arrastra para ajustar la ubicación'
    }).addTo(map);
    
    // Actualizar coordenadas y obtener dirección cuando se mueva el marcador
    marker.on('dragend', function(event: any) {
      const position = event.target.getLatLng();
      const coordsElement = document.getElementById(`coords-${messageId}`);
      if (coordsElement) {
        coordsElement.textContent = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
      }
      
      // Obtener dirección via geocoding reverso
      getAddressFromCoords(position.lat, position.lng, messageId);
    });
    
    // Obtener dirección inicial
    getAddressFromCoords(location.lat, location.lng, messageId);
    
    // Agregar popup informativo
    marker.bindPopup(`
      <div style="text-align: center;">
        <strong>📍 Ubicación de tu Proyecto</strong><br>
        <small>Arrastra el marcador para ajustar</small>
      </div>
    `).openPopup();
    
    // Almacenar referencias para uso posterior
    (window as any)[`mapInstance_${messageId}`] = { map, marker };
  }
};

// Función para obtener dirección desde coordenadas (mejorada con múltiples fuentes)
const getAddressFromCoords = async (lat: number, lng: number, messageId: string) => {
  const autoAddressElement = document.getElementById(`auto-address-${messageId}`);
  
  // Mostrar indicador de carga
  if (autoAddressElement) {
    autoAddressElement.innerHTML = `
      <div class="text-sm text-blue-600 animate-pulse">
        🔍 Detectando dirección exacta...
      </div>
    `;
  }
  
  try {
    // Intentar múltiples métodos para obtener la mejor dirección posible
    const results = await Promise.allSettled([
      // Método 1: Búsqueda de alta precisión
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18&extratags=1`),
      // Método 2: Búsqueda más amplia
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=16`),
      // Método 3: Búsqueda en área cercana
      searchNearbyPlaces(lat, lng)
    ]);
    
    let bestAddress = null;
    let addressQuality = 0; // 0-100, mayor es mejor
    
    // Procesar resultados de Nominatim
    for (let i = 0; i < 2; i++) {
      if (results[i].status === 'fulfilled') {
        const response = (results[i] as PromiseFulfilledResult<Response>).value;
        const data = await response.json();
        
        if (data && data.address) {
          const quality = evaluateAddressQuality(data.address);
          if (quality > addressQuality) {
            bestAddress = data;
            addressQuality = quality;
          }
        }
      }
    }
    
    // Procesar resultado de búsqueda cercana
    if (results[2].status === 'fulfilled') {
      const nearbyData = (results[2] as PromiseFulfilledResult<any>).value;
      if (nearbyData && nearbyData.quality > addressQuality) {
        bestAddress = nearbyData.data;
        addressQuality = nearbyData.quality;
      }
    }
    
    if (bestAddress && autoAddressElement) {
      const formattedResult = await formatAddressResult(bestAddress, lat, lng);
      
      autoAddressElement.innerHTML = `
        <div class="text-sm text-gray-900 font-medium">${formattedResult.display}</div>
        <div class="text-xs text-blue-600 mt-1">${formattedResult.precision}</div>
        ${formattedResult.suggestions ? `<div class="text-xs text-gray-500 mt-1">${formattedResult.suggestions}</div>` : ''}
      `;
      
      // Actualizar placeholder del input si está vacío
      const addressInput = document.getElementById(`address-input-${messageId}`) as HTMLInputElement;
      if (addressInput && !addressInput.value.trim()) {
        addressInput.placeholder = formattedResult.display;
      }
      
    } else {
      // Si no se encontró nada, dar alternativas útiles
      if (autoAddressElement) {
        const region = getChileanRegion(lat, lng);
        autoAddressElement.innerHTML = `
          <div class="text-sm text-orange-600">
            📍 Ubicación en ${region} detectada
          </div>
          <div class="text-xs text-gray-500 mt-1">
            No se encontró dirección específica. Por favor ingresa manualmente:
          </div>
          <div class="text-xs text-blue-600 mt-1">
            • Nombre de la calle y número
            • Comuna o localidad
          </div>
        `;
      }
    }
    
  } catch (error) {
    console.log('Error obteniendo dirección:', error);
    if (autoAddressElement) {
      autoAddressElement.innerHTML = `
        <div class="text-sm text-red-600">
          ❌ Error al detectar dirección
        </div>
        <div class="text-xs text-gray-500 mt-1">
          Por favor, ingresa la dirección manualmente en el campo de arriba
        </div>
      `;
    }
  }
};

// Función para buscar lugares cercanos como alternativa
const searchNearbyPlaces = async (lat: number, lng: number) => {
  try {
    // Buscar en un radio pequeño alrededor del punto
    const radius = 0.002; // Aproximadamente 200 metros
    const bbox = `${lng - radius},${lat - radius},${lng + radius},${lat + radius}`;
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&bbox=${bbox}&addressdetails=1&limit=10&extratags=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      // Buscar el lugar más cercano con buena información
      let bestMatch = null;
      let bestDistance = Infinity;
      
      for (const place of data) {
        if (place.address && (place.address.road || place.address.amenity)) {
          const distance = calculateDistance(lat, lng, parseFloat(place.lat), parseFloat(place.lon));
          if (distance < bestDistance) {
            bestMatch = place;
            bestDistance = distance;
          }
        }
      }
      
      if (bestMatch && bestDistance < 100) { // Menos de 100 metros
        return {
          data: bestMatch,
          quality: 60 + (bestMatch.address.house_number ? 20 : 0),
          distance: bestDistance
        };
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// Función para evaluar la calidad de una dirección (0-100)
const evaluateAddressQuality = (address: any): number => {
  let quality = 0;
  
  if (address.house_number && address.road) quality += 50; // Dirección completa
  else if (address.road) quality += 30; // Solo calle
  
  if (address.suburb || address.neighbourhood) quality += 15; // Comuna/sector
  if (address.city || address.town) quality += 10; // Ciudad
  if (address.postcode) quality += 5; // Código postal
  if (address.state || address.state_district) quality += 5; // Región
  
  // Bonificaciones especiales
  if (address.amenity) quality += 10; // Lugar conocido
  if (address.shop) quality += 8; // Tienda/comercio
  if (address.building) quality += 5; // Edificio específico
  
  return Math.min(quality, 100);
};

// Función para formatear el resultado de dirección
const formatAddressResult = async (addressData: any, lat: number, lng: number) => {
  const addr = addressData.address || {};
  let display = '';
  let precision = '';
  let suggestions = '';
  
  // Construir dirección principal
  if (addr.road) {
    display = addr.road;
    
    if (addr.house_number) {
      display += ` ${addr.house_number}`;
      precision = '📍 Dirección exacta detectada';
    } else {
      // Buscar números cercanos para dar contexto
      const nearbyInfo = await findNearbyReferences(lat, lng, addr.road);
      if (nearbyInfo) {
        display += ` (${nearbyInfo})`;
        precision = '📍 Ubicación aproximada en la calle';
        suggestions = '💡 Ajusta el marcador o escribe el número exacto';
      } else {
        display += ' (ubicación en la calle)';
        precision = '📍 Calle identificada - especifica el número';
        suggestions = '💡 Escribe el número de casa en el campo de arriba';
      }
    }
    
    // Agregar contexto geográfico
    if (addr.suburb || addr.neighbourhood) {
      display += `, ${addr.suburb || addr.neighbourhood}`;
    }
    if (addr.city || addr.town) {
      display += `, ${addr.city || addr.town}`;
    }
    
  } else if (addr.amenity) {
    display = `Cerca de ${addr.amenity}`;
    if (addr.name) display += ` (${addr.name})`;
    if (addr.suburb) display += `, ${addr.suburb}`;
    precision = '📍 Referencia cercana detectada';
    suggestions = '💡 Especifica la dirección exacta de tu proyecto';
    
  } else if (addr.shop) {
    display = `Cerca de ${addr.shop}`;
    if (addr.name) display += ` ${addr.name}`;
    if (addr.suburb) display += `, ${addr.suburb}`;
    precision = '📍 Comercio cercano identificado';
    suggestions = '💡 Ingresa la dirección específica de tu proyecto';
    
  } else if (addr.building) {
    display = `Edificio ${addr.building}`;
    if (addr.suburb) display += `, ${addr.suburb}`;
    precision = '📍 Edificio identificado';
    suggestions = '💡 Agrega calle y número si es necesario';
    
  } else {
    // Último recurso: usar información geográfica disponible
    if (addr.suburb || addr.neighbourhood) {
      display = `Zona de ${addr.suburb || addr.neighbourhood}`;
      if (addr.city) display += `, ${addr.city}`;
      precision = '📍 Área general identificada';
      suggestions = '💡 Por favor especifica la calle y número';
    } else if (addr.city || addr.town) {
      display = `${addr.city || addr.town}`;
      const region = getChileanRegion(lat, lng);
      if (region) display += `, ${region}`;
      precision = '📍 Ciudad identificada';
      suggestions = '💡 Ingresa la dirección completa: calle, número, comuna';
    } else {
      const region = getChileanRegion(lat, lng);
      display = `Ubicación en ${region}`;
      precision = '📍 Solo región identificada';
      suggestions = '💡 Ingresa la dirección completa manualmente';
    }
  }
  
  return { display, precision, suggestions };
};

// Función para calcular distancia entre dos puntos
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Función para encontrar referencias cercanas cuando no hay número de casa
const findNearbyReferences = async (lat: number, lng: number, roadName: string) => {
  try {
    // Buscar en un radio pequeño alrededor del punto
    const radius = 0.001; // Aproximadamente 100 metros
    const bbox = `${lng - radius},${lat - radius},${lng + radius},${lat + radius}`;
    
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(roadName)}&bbox=${bbox}&addressdetails=1&limit=10`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      // Buscar números de casa cercanos
      const numberedAddresses = data.filter(item => 
        item.address && 
        item.address.house_number && 
        item.address.road === roadName
      ).map(item => parseInt(item.address.house_number)).filter(num => !isNaN(num)).sort((a, b) => a - b);
      
      if (numberedAddresses.length > 0) {
        const min = Math.min(...numberedAddresses);
        const max = Math.max(...numberedAddresses);
        
        if (min === max) {
          return `cerca del ${min}`;
        } else if (numberedAddresses.length === 1) {
          return `cerca del ${numberedAddresses[0]}`;
        } else {
          return `entre ${min} y ${max} aprox.`;
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// Función para calcular información de precisión
const calculatePrecisionInfo = (result: any) => {
  if (!result) return null;
  
  const address = result.address || {};
  
  // Determinar nivel de precisión basado en los datos disponibles
  if (address.house_number && address.road) {
    return '📍 Dirección exacta';
  } else if (address.road) {
    return '📍 Calle identificada - ajusta el número si es necesario';
  } else if (address.suburb || address.neighbourhood) {
    return '📍 Zona aproximada - especifica la calle y número';
  } else {
    return '📍 Ubicación general - requiere dirección completa';
  }
};

// Función mejorada para buscar direcciones en Chile con manejo inteligente de números
const searchAddressInChile = async (address: string, messageId: string) => {
  try {
    const addressInput = document.getElementById(`address-input-${messageId}`) as HTMLInputElement;
    
    // Analizar la dirección ingresada para extraer componentes
    const addressParts = parseAddressInput(address);
    
    // Estrategias de búsqueda múltiples con diferentes aproximaciones para toda Chile
    const chileanRegions = [
      'Región de Ñuble', 'Región del Biobío', 'Región de la Araucanía', 
      'Región de Los Ríos', 'Región de Los Lagos', 'Región de Aysén',
      'Región de Magallanes', 'Región de Tarapacá', 'Región de Antofagasta',
      'Región de Atacama', 'Región de Coquimbo', 'Región de Valparaíso',
      'Región Metropolitana', 'Región del Libertador General Bernardo O\'Higgins',
      'Región del Maule', 'Región de Arica y Parinacota'
    ];
    
    const majorCities = [
      'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta',
      'Temuco', 'Rancagua', 'Talca', 'Arica', 'Chillán', 'Valdivia',
      'Osorno', 'Punta Arenas', 'Calama', 'Copiapó', 'Quilpué',
      'Villa Alemana', 'Curicó', 'Linares', 'Los Ángeles', 'Angol'
    ];
    
    const searchStrategies = [
      // Búsqueda exacta
      `${address}, Chile`,
      
      // Búsqueda con región específica si está en la dirección
      ...(address.toLowerCase().includes('ñuble') ? [`${address}, Región de Ñuble, Chile`] : []),
      ...(address.toLowerCase().includes('chillán') ? [`${address}, Chillán, Región de Ñuble, Chile`] : []),
      
      // Si hay número, buscar la calle en diferentes contextos
      ...(addressParts.number ? [
        `${addressParts.street}, ${addressParts.commune || ''}, Chile`,
        `${addressParts.street}, Chile`,
        // Buscar en ciudades principales si no especifica comuna
        ...(!addressParts.commune ? majorCities.slice(0, 8).map(city => 
          `${addressParts.street}, ${city}, Chile`
        ) : [])
      ] : []),
      
      // Búsquedas regionales expandidas
      ...chileanRegions.slice(0, 5).map(region => `${address}, ${region}, Chile`),
      
      // Búsqueda solo por calle/ubicación
      `${addressParts.street || address}, Chile`
    ];
    
    let bestResult = null;
    let foundExactNumber = false;
    
    for (const query of searchStrategies) {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1&countrycodes=cl&bounded=1&viewbox=-77,-30,-66,-56`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Filtrar resultados válidos de Chile
        const chileResults = data.filter(result => 
          result.address && 
          (result.address.country === 'Chile' || result.address.country_code === 'cl') &&
          result.lat > -56 && result.lat < -17 && 
          result.lon > -77 && result.lon < -66
        );
        
        if (chileResults.length > 0) {
          // Priorizar resultados con número exacto
          const exactMatch = chileResults.find(result => 
            result.address.house_number === addressParts.number &&
            result.address.road && result.address.road.toLowerCase().includes(addressParts.street.toLowerCase())
          );
          
          if (exactMatch) {
            bestResult = exactMatch;
            foundExactNumber = true;
            break;
          }
          
          // Si no hay match exacto, tomar el mejor resultado de la calle
          if (!bestResult) {
            bestResult = chileResults[0];
          }
        }
      }
    }
    
    if (bestResult) {
      const lat = parseFloat(bestResult.lat);
      const lng = parseFloat(bestResult.lon);
      
      // Validar coordenadas
      if (lat < -56 || lat > -17 || lng < -77 || lng > -66) {
        throw new Error('Ubicación fuera de Chile');
      }
      
      // Si no encontramos número exacto, intentar interpolación
      if (!foundExactNumber && addressParts.number && bestResult.address.road) {
        const interpolatedLocation = await interpolateHouseNumber(
          bestResult.address.road, 
          addressParts.number, 
          lat, 
          lng,
          bestResult.address.suburb || bestResult.address.city
        );
        
        if (interpolatedLocation) {
          interpolatedLocation.isInterpolated = true;
          bestResult = interpolatedLocation;
        }
      }
      
      // Actualizar mapa
      const mapData = (window as any)[`mapInstance_${messageId}`];
      if (mapData) {
        mapData.marker.setLatLng([lat, lng]);
        mapData.map.setView([lat, lng], foundExactNumber ? 18 : 16);
      }
      
      // Actualizar coordenadas
      const coordsElement = document.getElementById(`coords-${messageId}`);
      if (coordsElement) {
        coordsElement.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
      
      // Mostrar información sobre la precisión de la búsqueda
      if (!foundExactNumber && addressParts.number) {
        showSearchResultInfo(messageId, 'approximate', addressParts.number, bestResult.address.road);
      } else if (foundExactNumber) {
        showSearchResultInfo(messageId, 'exact', addressParts.number, bestResult.address.road);
      }
      
      // Actualizar dirección detectada automáticamente
      await getAddressFromCoords(lat, lng, messageId);
      
      // Feedback visual
      if (addressInput) {
        addressInput.style.borderColor = foundExactNumber ? '#10b981' : '#f59e0b';
        addressInput.style.backgroundColor = foundExactNumber ? '#f0fdf4' : '#fffbeb';
        setTimeout(() => {
          addressInput.style.borderColor = '';
          addressInput.style.backgroundColor = '';
        }, 3000);
      }
      
    } else {
      // Sugerir búsquedas alternativas
      showSearchSuggestions(messageId, address);
    }
  } catch (error) {
    console.log('Error buscando dirección:', error);
    alert('Error al buscar la dirección. Verifica que sea una dirección válida en Chile.');
  }
};

// Función para analizar la dirección ingresada
const parseAddressInput = (address: string) => {
  const parts = address.trim().split(/[,\s]+/);
  let street = '';
  let number = '';
  let commune = '';
  
  // Buscar número en la dirección
  const numberMatch = address.match(/\b(\d+)\b/);
  if (numberMatch) {
    number = numberMatch[1];
    // Extraer calle (parte antes del número)
    street = address.substring(0, address.indexOf(number)).trim();
    // Extraer comuna (parte después del número)
    const afterNumber = address.substring(address.indexOf(number) + number.length).trim();
    if (afterNumber.startsWith(',')) {
      commune = afterNumber.substring(1).trim().split(',')[0];
    }
  } else {
    // Sin número, tratar como calle
    street = parts[0] || address;
    commune = parts[1] || '';
  }
  
  return { street, number, commune, original: address };
};

// Función para interpolar número de casa
const interpolateHouseNumber = async (street: string, targetNumber: string, baseLat: number, baseLng: number, area: string) => {
  try {
    // Buscar otros números en la misma calle
    const searchQuery = `${street}, ${area}, Chile`;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=20&addressdetails=1&countrycodes=cl`);
    const data = await response.json();
    
    if (data && data.length > 0) {
      // Filtrar direcciones con números en la misma calle
      const numberedAddresses = data
        .filter(item => 
          item.address && 
          item.address.house_number && 
          item.address.road === street
        )
        .map(item => ({
          number: parseInt(item.address.house_number),
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          original: item
        }))
        .filter(item => !isNaN(item.number))
        .sort((a, b) => a.number - b.number);
      
      if (numberedAddresses.length >= 2) {
        const target = parseInt(targetNumber);
        
        // Encontrar los números más cercanos
        let lower = null, upper = null;
        
        for (let i = 0; i < numberedAddresses.length; i++) {
          if (numberedAddresses[i].number <= target) {
            lower = numberedAddresses[i];
          }
          if (numberedAddresses[i].number >= target && !upper) {
            upper = numberedAddresses[i];
          }
        }
        
        if (lower && upper && lower.number !== upper.number) {
          // Interpolar coordenadas
          const ratio = (target - lower.number) / (upper.number - lower.number);
          const interpolatedLat = lower.lat + (upper.lat - lower.lat) * ratio;
          const interpolatedLng = lower.lng + (upper.lng - lower.lng) * ratio;
          
          return {
            lat: interpolatedLat.toString(),
            lon: interpolatedLng.toString(),
            address: {
              road: street,
              house_number: targetNumber,
              suburb: area,
              country: 'Chile'
            },
            interpolated: true,
            interpolation_info: `Ubicación estimada entre ${street} ${lower.number} y ${street} ${upper.number}`
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.log('Error en interpolación:', error);
    return null;
  }
};

// Función para mostrar información sobre el resultado de búsqueda
const showSearchResultInfo = (messageId: string, type: 'exact' | 'approximate', number: string, street: string) => {
  const autoAddressElement = document.getElementById(`auto-address-${messageId}`);
  if (!autoAddressElement) return;
  
  const infoDiv = document.createElement('div');
  infoDiv.className = 'mt-2 p-2 rounded-lg border text-xs';
  
  if (type === 'exact') {
    infoDiv.className += ' bg-green-50 border-green-200 text-green-800';
    infoDiv.innerHTML = `✅ <strong>Dirección exacta encontrada:</strong> ${street} ${number}`;
  } else {
    infoDiv.className += ' bg-yellow-50 border-yellow-200 text-yellow-800';
    infoDiv.innerHTML = `📍 <strong>Ubicación aproximada:</strong> ${street} cerca del número ${number}<br>
                        💡 <em>Puedes ajustar el marcador en el mapa para mayor precisión</em>`;
  }
  
  // Remover info anterior si existe
  const existingInfo = autoAddressElement.parentElement?.querySelector('.search-result-info');
  if (existingInfo) existingInfo.remove();
  
  infoDiv.classList.add('search-result-info');
  autoAddressElement.parentElement?.appendChild(infoDiv);
  
  // Remover después de 10 segundos
  setTimeout(() => {
    if (infoDiv.parentElement) {
      infoDiv.parentElement.removeChild(infoDiv);
    }
  }, 10000);
};

// Función para mostrar sugerencias cuando no se encuentra nada
const showSearchSuggestions = (messageId: string, originalAddress: string) => {
  const addressInput = document.getElementById(`address-input-${messageId}`) as HTMLInputElement;
  if (addressInput) {
    addressInput.style.borderColor = '#ef4444';
    addressInput.style.backgroundColor = '#fef2f2';
    setTimeout(() => {
      addressInput.style.borderColor = '';
      addressInput.style.backgroundColor = '';
    }, 3000);
  }
  
  const suggestions = [
    '• Incluye el número de la calle (ej: "Providencia 1234")',
    '• Agrega la comuna (ej: "Providencia 1234, Las Condes")',
    '• Verifica la ortografía del nombre de la calle',
    '• Prueba con nombres alternativos de la calle',
    '• Usa referencias conocidas (ej: "cerca del Metro Providencia")'
  ];
  
  alert(`No se encontró "${originalAddress}" en Chile.\n\nSugerencias para mejorar la búsqueda:\n${suggestions.join('\n')}`);
};

// Variables para debounce
let autocompleteTimeout: NodeJS.Timeout;

// Función para autocompletado con debounce
const debounceAutocomplete = (query: string, messageId: string) => {
  clearTimeout(autocompleteTimeout);
  autocompleteTimeout = setTimeout(() => {
    getAddressSuggestions(query, messageId);
  }, 300);
};

// Función para obtener sugerencias de direcciones
const getAddressSuggestions = async (query: string, messageId: string) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Chile')}&limit=8&addressdetails=1&countrycodes=cl`);
    const data = await response.json();
    
    const suggestionsList = document.getElementById(`suggestions-list-${messageId}`);
    if (!suggestionsList) return;
    
    suggestionsList.innerHTML = '';
    
    if (data && data.length > 0) {
      // Filtrar y formatear sugerencias
      const suggestions = data
        .filter(item => 
          item.address && 
          (item.address.country === 'Chile' || item.address.country_code === 'cl') &&
          item.lat > -56 && item.lat < -17 && // Límites de Chile
          item.lon > -77 && item.lon < -66
        )
        .slice(0, 6)
        .map(item => {
          const addr = item.address;
          let displayName = '';
          
          if (addr.road) {
            displayName += addr.road;
            if (addr.house_number) displayName += ` ${addr.house_number}`;
          }
          if (addr.suburb) displayName += `, ${addr.suburb}`;
          if (addr.city || addr.town) displayName += `, ${addr.city || addr.town}`;
          
          return {
            display: displayName || item.display_name.split(',').slice(0, 3).join(', '),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            full: item.display_name
          };
        });
      
      suggestions.forEach(suggestion => {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'p-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 text-sm';
        suggestionDiv.innerHTML = `
          <div class="font-medium text-gray-800">${suggestion.display}</div>
          <div class="text-xs text-gray-500 truncate">${suggestion.full}</div>
        `;
        
        suggestionDiv.onclick = () => {
          // Actualizar input
          const addressInput = document.getElementById(`address-input-${messageId}`) as HTMLInputElement;
          if (addressInput) {
            addressInput.value = suggestion.display;
          }
          
          // Actualizar mapa
          const mapData = (window as any)[`mapInstance_${messageId}`];
          if (mapData) {
            mapData.marker.setLatLng([suggestion.lat, suggestion.lng]);
            mapData.map.setView([suggestion.lat, suggestion.lng], 16);
          }
          
          // Actualizar coordenadas
          const coordsElement = document.getElementById(`coords-${messageId}`);
          if (coordsElement) {
            coordsElement.textContent = `${suggestion.lat.toFixed(6)}, ${suggestion.lng.toFixed(6)}`;
          }
          
          // Actualizar dirección detectada
          getAddressFromCoords(suggestion.lat, suggestion.lng, messageId);
          
          // Ocultar sugerencias
          hideSuggestions(messageId);
        };
        
        suggestionsList.appendChild(suggestionDiv);
      });
      
      showSuggestions(messageId);
    } else {
      hideSuggestions(messageId);
    }
  } catch (error) {
    console.log('Error obteniendo sugerencias:', error);
    hideSuggestions(messageId);
  }
};

// Funciones para mostrar/ocultar sugerencias
const showSuggestions = (messageId: string) => {
  const suggestions = document.getElementById(`suggestions-${messageId}`);
  if (suggestions) {
    suggestions.classList.remove('hidden');
  }
};

const hideSuggestions = (messageId: string) => {
  const suggestions = document.getElementById(`suggestions-${messageId}`);
  if (suggestions) {
    suggestions.classList.add('hidden');
  }
};

// Función para obtener ubicación actual con alta precisión mejorada
const getCurrentLocationPrecise = (messageId: string) => {
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización. Por favor ingresa tu dirección manualmente.');
    return;
  }
  
  const addressInput = document.getElementById(`address-input-${messageId}`) as HTMLInputElement;
  if (addressInput) {
    addressInput.placeholder = '🎯 Detectando tu ubicación exacta...';
    addressInput.disabled = true;
  }
  
  // Mostrar indicador de carga
  const autoAddressElement = document.getElementById(`auto-address-${messageId}`);
  if (autoAddressElement) {
    autoAddressElement.innerHTML = `
      <div class="text-sm text-blue-600 animate-pulse">
        🛰️ Obteniendo ubicación GPS de alta precisión...
      </div>
      <div class="text-xs text-gray-500 mt-1">
        Esto puede tardar unos segundos para mayor exactitud
      </div>
    `;
  }
  
  // Intentar múltiples veces para mejor precisión
  let attemptCount = 0;
  const maxAttempts = 3;
  let bestAccuracy = Infinity;
  let bestPosition = null;
  
  const tryGetLocation = () => {
    attemptCount++;
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        // Verificar que esté en Chile con mejor detección regional
        if (lat < -56 || lat > -17 || lng < -77 || lng > -66) {
          if (addressInput) {
            addressInput.placeholder = 'Ubicación fuera de Chile - ingresa dirección...';
            addressInput.disabled = false;
          }
          if (autoAddressElement) {
            autoAddressElement.innerHTML = `
              <div class="text-sm text-orange-600">
                ⚠️ Tu ubicación GPS parece estar fuera de Chile
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Por favor, ingresa tu dirección manualmente
              </div>
            `;
          }
          return;
        }
        
        // Guardar el mejor resultado basado en precisión
        if (accuracy < bestAccuracy) {
          bestAccuracy = accuracy;
          bestPosition = position;
        }
        
        // Si tenemos buena precisión o hemos alcanzado el máximo de intentos
        if (accuracy <= 50 || attemptCount >= maxAttempts) {
          await processLocationResult(bestPosition || position, messageId);
        } else if (attemptCount < maxAttempts) {
          // Intentar nuevamente para mejor precisión
          setTimeout(tryGetLocation, 2000);
          if (autoAddressElement) {
            autoAddressElement.innerHTML = `
              <div class="text-sm text-blue-600 animate-pulse">
                🎯 Mejorando precisión... (intento ${attemptCount + 1}/${maxAttempts})
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Precisión actual: ±${Math.round(accuracy)}m
              </div>
            `;
          }
        } else {
          await processLocationResult(bestPosition || position, messageId);
        }
      },
      (error) => {
        console.log('Error de geolocalización:', error);
        
        let errorMessage = '';
        let suggestions = '';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '🚫 Permiso de ubicación denegado';
            suggestions = 'Habilita la ubicación en tu navegador y recarga la página';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '📡 Ubicación no disponible';
            suggestions = 'Verifica tu conexión GPS o wifi';
            break;
          case error.TIMEOUT:
            errorMessage = '⏱️ Tiempo de detección agotado';
            suggestions = 'La señal GPS puede estar débil en tu área';
            break;
          default:
            errorMessage = '❌ Error de geolocalización';
            suggestions = 'Problema técnico desconocido';
            break;
        }
        
        if (addressInput) {
          addressInput.placeholder = 'Ingresa tu dirección manualmente...';
          addressInput.disabled = false;
        }
        
        if (autoAddressElement) {
          autoAddressElement.innerHTML = `
            <div class="text-sm text-red-600">
              ${errorMessage}
            </div>
            <div class="text-xs text-gray-500 mt-1">
              ${suggestions}
            </div>
          `;
        }
        
        // No mostrar alert para mejor UX, solo feedback visual
      },
      {
        enableHighAccuracy: true,
        timeout: attemptCount === 1 ? 20000 : 10000, // Más tiempo en el primer intento
        maximumAge: 0
      }
    );
  };
  
  tryGetLocation();
};

// Función separada para procesar el resultado de ubicación
const processLocationResult = async (position: GeolocationPosition, messageId: string) => {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const accuracy = position.coords.accuracy;
  
  // Determinar región aproximada para mejor contexto
  const region = getChileanRegion(lat, lng);
  
  // Actualizar mapa
  const mapData = (window as any)[`mapInstance_${messageId}`];
  if (mapData) {
    mapData.marker.setLatLng([lat, lng]);
    mapData.map.setView([lat, lng], accuracy <= 100 ? 18 : 16);
  }
  
  // Actualizar coordenadas
  const coordsElement = document.getElementById(`coords-${messageId}`);
  if (coordsElement) {
    coordsElement.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
  
  // Mostrar información de precisión
  const autoAddressElement = document.getElementById(`auto-address-${messageId}`);
  if (autoAddressElement) {
    autoAddressElement.innerHTML = `
      <div class="text-sm text-green-600">
        ✅ Ubicación GPS obtenida
      </div>
      <div class="text-xs text-gray-500 mt-1">
        📍 Precisión: ±${Math.round(accuracy)}m • Región: ${region}
      </div>
    `;
  }
  
  // Obtener dirección detallada
  await getAddressFromCoords(lat, lng, messageId);
  
  const addressInput = document.getElementById(`address-input-${messageId}`) as HTMLInputElement;
  if (addressInput) {
    addressInput.placeholder = 'Verifica o ajusta tu dirección...';
    addressInput.disabled = false;
    addressInput.style.borderColor = '#10b981';
    addressInput.style.backgroundColor = '#f0fdf4';
    setTimeout(() => {
      addressInput.style.borderColor = '';
      addressInput.style.backgroundColor = '';
    }, 4000);
  }
};

// Función para determinar región chilena aproximada
const getChileanRegion = (lat: number, lng: number): string => {
  if (lat > -18.5) return 'Arica y Parinacota';
  if (lat > -21) return 'Tarapacá';
  if (lat > -26) return 'Antofagasta';
  if (lat > -29) return 'Atacama';
  if (lat > -32.5) return 'Coquimbo';
  if (lat > -35) return 'Valparaíso';
  if (lat > -35.5) return 'Metropolitana';
  if (lat > -36.5) return 'O\'Higgins';
  if (lat > -37.5) return 'Maule';
  if (lat > -38.5) return 'Ñuble';
  if (lat > -40) return 'Biobío';
  if (lat > -41) return 'Araucanía';
  if (lat > -43.5) return 'Los Ríos';
  if (lat > -46.5) return 'Los Lagos';
  if (lat > -49) return 'Aysén';
  return 'Magallanes';
};

// Función para expandir mapa en modal
const expandMapModal = (location: {lat: number, lng: number}, messageId: string, originalMap: any) => {
  // Crear modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    width: 90%;
    height: 90%;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;
  
  // Header del modal
  const modalHeader = document.createElement('div');
  modalHeader.style.cssText = `
    padding: 15px;
    background: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  modalHeader.innerHTML = `
    <h3 style="margin: 0; font-size: 18px; font-weight: bold;">🗺️ Ajustar Ubicación del Proyecto</h3>
    <button id="closeModal" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
  `;
  
  // Container del mapa expandido
  const expandedMapContainer = document.createElement('div');
  expandedMapContainer.id = `expanded-map-${messageId}`;
  expandedMapContainer.style.cssText = `
    flex: 1;
    width: 100%;
  `;
  
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(expandedMapContainer);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Crear mapa expandido
  setTimeout(() => {
    const expandedMap = window.L.map(expandedMapContainer).setView([location.lat, location.lng], 16);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(expandedMap);
    
    const expandedMarker = window.L.marker([location.lat, location.lng], {
      draggable: true,
      title: 'Arrastra para ajustar la ubicación'
    }).addTo(expandedMap);
    
    expandedMarker.on('dragend', function(event: any) {
      const position = event.target.getLatLng();
      // Actualizar también el mapa original
      const originalData = (window as any)[`mapInstance_${messageId}`];
      if (originalData) {
        originalData.marker.setLatLng(position);
        originalData.map.setView(position, 16);
      }
      
      const coordsElement = document.getElementById(`coords-${messageId}`);
      if (coordsElement) {
        coordsElement.textContent = `${position.lat.toFixed(6)}, ${position.lng.toFixed(6)}`;
      }
      
      getAddressFromCoords(position.lat, position.lng, messageId);
    });
    
    // Cerrar modal
    document.getElementById('closeModal')!.onclick = () => {
      document.body.removeChild(modal);
    };
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    };
  }, 100);
};

// Declarar el tipo para Leaflet en window
declare global {
  interface Window {
    L: any;
  }
}

export const CotizadorIA: React.FC = () => {
  const { addItem, state: cartState } = useCart();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState(CONVERSATION_STEPS.WELCOME);
  const [isTyping, setIsTyping] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>({});
  const [userInput, setUserInput] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userData, setUserData] = useState<{nombre?: string, telefono?: string, email?: string, direccion?: string}>({});
  const [waitingForManualAddress, setWaitingForManualAddress] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Prevenir inicialización doble con useRef
    if (!isInitialized.current) {
      isInitialized.current = true;
      initializeConversation();
    }
    
    // Detectar tamaño de pantalla
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 640);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const initializeConversation = () => {
    const welcomeMessage: Message = {
      id: `welcome-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'bot',
      content: '¡Hola! 👋 Soy tu Asistente Inteligente de ObraExpress. Estoy aquí para ayudarte a encontrar la solución perfecta en policarbonatos para tu proyecto.',
      timestamp: new Date()
    };

    const introMessage: Message = {
      id: `intro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'bot',
      content: 'Te voy a hacer algunas preguntas para entender exactamente lo que necesitas y darte la mejor recomendación posible. ¿Empezamos?',
      timestamp: new Date(),
      options: ['¡Perfecto, empecemos! 🚀', 'Tengo dudas, necesito ayuda 🤔']
    };

    setTimeout(() => {
      setMessages([welcomeMessage]);
      setTimeout(() => {
        setMessages(prev => [...prev, introMessage]);
      }, 1500);
    }, 1000);
  };

  const simulateTyping = (callback: () => void, delay = 2000) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  };

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUserResponse = (response: string) => {
    // Agregar mensaje del usuario
    addMessage({
      type: 'user',
      content: response
    });

    // Procesar respuesta según el paso actual
    processUserResponse(response);
  };

  const processUserResponse = (response: string) => {
    simulateTyping(() => {
      switch (currentStep) {
        case CONVERSATION_STEPS.WELCOME:
          if (response.includes('empecemos')) {
            handleProjectTypeQuestion();
          } else {
            handleNeedHelp();
          }
          break;
        
        case CONVERSATION_STEPS.PROJECT_TYPE:
          handleProjectTypeResponse(response);
          break;
          
        case CONVERSATION_STEPS.LOCATION:
          handleLocationResponse(response);
          break;
          
        case CONVERSATION_STEPS.DIMENSIONS:
          handleDimensionsResponse(response);
          break;
          
        case CONVERSATION_STEPS.USE_CASE:
          handleUseCaseResponse(response);
          break;
          
        case CONVERSATION_STEPS.BUDGET:
          handleBudgetResponse(response);
          break;
          
        case CONVERSATION_STEPS.TIMELINE:
          handleTimelineResponse(response);
          break;
          
        case CONVERSATION_STEPS.INSTALLATION:
          handleInstallationResponse(response);
          break;

        case CONVERSATION_STEPS.CART_MANAGEMENT:
          handleCartManagement(response);
          break;

        case CONVERSATION_STEPS.USER_DATA:
          handleUserDataInput(response);
          break;

        case CONVERSATION_STEPS.GEOLOCATION:
          handleGeolocation(response);
          break;

        case CONVERSATION_STEPS.FINAL_BUDGET:
          showFinalBudget();
          break;

        case CONVERSATION_STEPS.CHECKOUT:
          handleCheckout(response);
          break;
          
        case CONVERSATION_STEPS.CONTACT_INFO:
          handleContactResponse(response);
          break;
          
        default:
          handleGeneralResponse(response);
      }
    });
  };

  const handleProjectTypeQuestion = () => {
    addMessage({
      type: 'bot',
      content: 'Perfecto! 🎯 Primero, cuéntame qué tipo de proyecto estás planificando:',
      options: [
        '🏠 Techado Residencial',
        '🏭 Techado Industrial',
        '🔒 Cerramientos',
        '🌱 Invernadero',
        '⚽ Cubierta Deportiva',
        '📋 Otro proyecto'
      ]
    });
    setCurrentStep(CONVERSATION_STEPS.PROJECT_TYPE);
  };

  const handleProjectTypeResponse = (response: string) => {
    const projectType = response.replace(/[🏠🏭🔒🌱⚽📋]/g, '').trim();
    setProjectData(prev => ({ ...prev, tipo_proyecto: projectType }));
    
    addMessage({
      type: 'bot',
      content: `Excelente! Un ${projectType.toLowerCase()} suena genial. 🏗️ Ahora, ¿dónde se ubicará tu proyecto?`
    });
    
    setTimeout(() => {
      addMessage({
        type: 'bot',
        content: 'Para recomendarte los mejores productos según tu zona, ¿dónde se ubicará tu proyecto?',
        options: [
          '📍 Detectar mi ubicación automáticamente',
          '🏙️ Santiago', 
          '⛰️ Valparaíso', 
          '🌊 Concepción', 
          '🏜️ La Serena', 
          '✏️ Escribir otra ciudad'
        ]
      });
    }, 1500);
    
    setCurrentStep(CONVERSATION_STEPS.LOCATION);
  };

  const handleLocationResponse = (response: string) => {
    // Si estamos esperando entrada manual de dirección, procesar como tal
    if (waitingForManualAddress && !response.includes('✏️') && !response.includes('🔄') && !response.includes('🏙️')) {
      setProjectData(prev => ({ ...prev, ubicacion: response.trim() }));
      setWaitingForManualAddress(false); // Desactivar modo de entrada manual
      
      addMessage({
        type: 'bot',
        content: `✅ Perfecto! Tu dirección registrada es: **${response.trim()}**. 📐 Ahora hablemos de las dimensiones de tu proyecto.`
      });
      
      setTimeout(() => {
        proceedToDimensions();
      }, 1500);
      return;
    }
    
    if (response.includes('Detectar mi ubicación automáticamente')) {
      setWaitingForManualAddress(false); // Desactivar modo manual
      handleProjectLocationGeolocation();
    } else if (response.includes('Escribir otra ciudad')) {
      setWaitingForManualAddress(false); // Desactivar modo manual
      addMessage({
        type: 'bot',
        content: '✏️ Por favor escribe la ciudad o comuna donde realizarás el proyecto:'
      });
      // El próximo input del usuario será procesado como ubicación manual
    } else if (response.includes('usar esta ubicación GPS') || response.includes('Si, esta es mi ubicación') || response.includes('Sí, esta es mi ubicación')) {
      // Confirmación de ubicación GPS detectada
      setWaitingForManualAddress(false); // Desactivar modo manual
      addMessage({
        type: 'bot',
        content: '✅ ¡Perfecto! Ubicación GPS confirmada. 📐 Ahora hablemos de las dimensiones de tu proyecto.'
      });
      setTimeout(() => {
        proceedToDimensions();
      }, 1500);
    } else if (response.includes('Ingresar dirección exacta del proyecto') || response.includes('Ingresa dirección exacta del proyecto')) {
      addMessage({
        type: 'bot',
        content: '📝 Perfecto. Por favor ingresa la dirección exacta donde realizarás el proyecto (calle, número, comuna):'
      });
      setWaitingForManualAddress(true); // Activar modo de entrada manual
    } else if (response.includes('Detectar ubicación nuevamente')) {
      setWaitingForManualAddress(false); // Desactivar modo manual
      addMessage({
        type: 'bot',
        content: '🔄 Intentando detectar tu ubicación nuevamente...'
      });
      setTimeout(() => {
        handleProjectLocationGeolocation();
      }, 1000);
    } else if (response.includes('Seleccionar ciudad manualmente')) {
      setWaitingForManualAddress(false); // Desactivar modo manual
      addMessage({
        type: 'bot',
        content: '🏙️ Selecciona tu ciudad o región:',
        options: ['🏙️ Santiago', '⛰️ Valparaíso', '🌊 Concepción', '🏜️ La Serena', '✏️ Escribir otra ciudad']
      });
    } else if (response.includes('Escribir dirección exacta')) {
      addMessage({
        type: 'bot',
        content: '📝 Perfecto. Por favor escribe la dirección exacta de tu proyecto:\n\n📍 **Ejemplo:** Av. Providencia 1234, Providencia, Santiago\n\nIncluye calle, número, comuna y ciudad si es posible:'
      });
      // El siguiente input será la dirección manual
    } else if (response.includes('Usar coordenadas específicas')) {
      addMessage({
        type: 'bot',
        content: '🎯 Puedes ingresar coordenadas específicas si las tienes.\n\n📍 **Formato:** Latitud, Longitud\n**Ejemplo:** -33.4489, -70.6693\n\nPor favor ingresa las coordenadas:'
      });
      // El siguiente input serán coordenadas
    } else if (response.includes('Seleccionar zona/comuna')) {
      addMessage({
        type: 'bot',
        content: '🏘️ Selecciona la zona o comuna donde se realizará tu proyecto:',
        options: [
          '🏙️ Las Condes', '🏢 Providencia', '🌳 Ñuñoa', '🏘️ Maipú',
          '⛰️ La Reina', '🌊 Viña del Mar', '🏭 Puente Alto', '📝 Otra zona'
        ]
      });
    } else if (response.includes('Escribir mi dirección exacta')) {
      addMessage({
        type: 'bot',
        content: '✏️ Perfecto. Escribe la dirección completa de tu proyecto.\n\n📍 **Ejemplo:** Av. O\'Higgins 1234, Centro, Chillán\n\nPor favor incluye calle, número y comuna:'
      });
      setWaitingForManualAddress(true); // Activar modo de entrada manual
    } else if (response.includes('Intentar detectar ubicación nuevamente')) {
      addMessage({
        type: 'bot',
        content: '🔄 Intentaremos detectar tu ubicación nuevamente con mayor precisión...'
      });
      setTimeout(() => {
        addMessage({
          type: 'bot',
          content: 'Para recomendarte los mejores productos según tu zona, ¿dónde se ubicará tu proyecto?',
          options: [
            '📍 Detectar mi ubicación automáticamente',
            '🏙️ Santiago', 
            '⛰️ Valparaíso', 
            '🌊 Concepción', 
            '🏜️ La Serena', 
            '✏️ Escribir otra ciudad'
          ]
        });
      }, 1000);
    } else if (response.includes('Seleccionar ciudad primero')) {
      addMessage({
        type: 'bot',
        content: '🏙️ Selecciona tu ciudad o región para ayudarte mejor:',
        options: [
          '🏙️ Santiago', '⛰️ Valparaíso', '🌊 Concepción', '🏜️ La Serena',
          '🏔️ Chillán', '🌲 Temuco', '🏞️ Valdivia', '✏️ Otra ciudad'
        ]
      });
    } else if (response.includes('la ubicación no es correcta') || 
               response.includes('No, no es correcta') || 
               response.includes('no es correcta') ||
               response.includes('ubicación incorrecta') ||
               response.includes('está mal') ||
               response.includes('no es la correcta')) {
      // Usuario rechazó la ubicación detectada - manejar corrección
      setWaitingForManualAddress(false); // Asegurar que no esté en modo manual
      addMessage({
        type: 'bot',
        content: 'Sin problema! 📝 Veo que el mapa no detectó correctamente tu ubicación. Para asegurar la precisión, por favor ingresa manualmente la dirección exacta de tu proyecto:'
      });
      setTimeout(() => {
        addMessage({
          type: 'bot',
          content: 'Escribe tu dirección completa con calle, número y comuna:',
          options: [
            '✏️ Escribir mi dirección exacta',
            '🔄 Intentar detectar ubicación nuevamente',
            '🏙️ Seleccionar ciudad primero'
          ]
        });
      }, 1500);
      return; // Importante: no continuar con el flujo normal
    } else if (response.includes('ajustar la ubicación manualmente') || response.includes('Quiero ajustar')) {
      // Ya se maneja en el botón, no necesita procesamiento adicional
      return;
    } else {
      // Ciudad predefinida o dirección manual
      const city = response.replace(/🏙️|⛰️|🌊|🏜️/g, '').trim();
      setProjectData(prev => ({ ...prev, ubicacion: city }));
      
      addMessage({
        type: 'bot',
        content: `Perfecto! ${city} es una excelente ubicación. 📐 Ahora hablemos de las dimensiones de tu proyecto.`
      });
      
      setTimeout(() => {
        proceedToDimensions();
      }, 1500);
    }
  };

  // Función para manejar geolocalización del proyecto
  const handleProjectLocationGeolocation = () => {
    if (navigator.geolocation) {
      addMessage({
        type: 'bot',
        content: '📡 Obteniendo tu ubicación exacta...'
      });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setUserLocation({ lat, lng });
          
          const locationName = `Coordenadas: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          setProjectData(prev => ({ 
            ...prev, 
            ubicacion: locationName,
            coordenadas: { lat, lng }
          }));

          addMessage({
            type: 'bot',
            content: '📍 ¡Ubicación detectada! Aquí puedes ver la ubicación exacta de tu proyecto:',
            data: {
              type: 'map',
              location: {
                lat,
                lng,
                name: locationName
              }
            }
          });

          setTimeout(() => {
            addMessage({
              type: 'bot',
              content: '¿Es esta la ubicación correcta para tu proyecto, o prefieres especificar la dirección exacta?',
              options: [
                '✅ Sí, usar esta ubicación GPS', 
                '📝 Ingresar dirección exacta del proyecto',
                '🔄 Detectar ubicación nuevamente',
                '🏙️ Seleccionar ciudad manualmente'
              ]
            });
          }, 2500);
        },
        (error) => {
          addMessage({
            type: 'bot',
            content: '❌ No pude obtener tu ubicación automáticamente. No te preocupes, puedes seleccionar tu ciudad:',
            options: ['🏙️ Santiago', '⛰️ Valparaíso', '🌊 Concepción', '✏️ Escribir otra ciudad']
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      addMessage({
        type: 'bot',
        content: '❌ Tu navegador no soporta geolocalización. Selecciona tu ciudad:',
        options: ['🏙️ Santiago', '⛰️ Valparaíso', '🌊 Concepción', '✏️ Escribir otra ciudad']
      });
    }
  };

  // Función para continuar a dimensiones
  const proceedToDimensions = () => {
    addMessage({
      type: 'bot',
      content: '¿Cuáles son las dimensiones aproximadas que necesitas cubrir?',
      options: [
        '📏 Pequeño (menos de 50 m²)',
        '📐 Mediano (50-150 m²)', 
        '🏗️ Grande (150-500 m²)',
        '🏭 Extra Grande (más de 500 m²)',
        '💭 No estoy seguro'
      ]
    });
    setCurrentStep(CONVERSATION_STEPS.DIMENSIONS);
  };

  const handleDimensionsResponse = (response: string) => {
    let areaRange = response;
    setProjectData(prev => ({ 
      ...prev, 
      dimensiones: { area_descripcion: areaRange } 
    }));
    
    addMessage({
      type: 'bot',
      content: `Entendido! ${areaRange.replace(/[📏📐🏗️🏭💭]/g, '').trim()}. 🎯 Ahora, ¿cuál será el uso principal de este espacio?`
    });
    
    setTimeout(() => {
      addMessage({
        type: 'bot',
        content: 'Selecciona el uso que mejor describe tu proyecto:',
        options: [
          '☀️ Protección solar',
          '🌧️ Protección contra lluvia',
          '🌡️ Control de temperatura',
          '👥 Espacio de trabajo',
          '🚗 Estacionamiento',
          '🎯 Uso decorativo'
        ]
      });
    }, 1500);
    
    setCurrentStep(CONVERSATION_STEPS.USE_CASE);
  };

  const handleUseCaseResponse = (response: string) => {
    const useCase = response.replace(/[☀️🌧️🌡️👥🚗🎯]/g, '').trim();
    setProjectData(prev => ({ ...prev, uso_principal: useCase }));
    
    addMessage({
      type: 'bot',
      content: `Perfecto! ${useCase} es un uso muy común. 💰 Para poder recomendarte la mejor opción, ¿tienes un presupuesto aproximado en mente?`
    });
    
    setTimeout(() => {
      addMessage({
        type: 'bot',
        content: 'Selecciona el rango que mejor se ajuste a tu presupuesto:',
        options: [
          '💵 Hasta $500.000',
          '💸 $500.000 - $1.000.000',
          '💳 $1.000.000 - $3.000.000',
          '💎 Más de $3.000.000',
          '🤷 Prefiero ver opciones primero'
        ]
      });
    }, 1500);
    
    setCurrentStep(CONVERSATION_STEPS.BUDGET);
  };

  const handleBudgetResponse = (response: string) => {
    const budget = response.replace(/[💵💸💳💎🤷]/g, '').trim();
    setProjectData(prev => ({ ...prev, presupuesto: { descripcion: budget } }));
    
    addMessage({
      type: 'bot',
      content: `Genial! ${budget}. ⏰ Una última pregunta antes de preparar tu cotización: ¿Para cuándo necesitas tener listo tu proyecto?`
    });
    
    setTimeout(() => {
      addMessage({
        type: 'bot',
        content: 'Selecciona el tiempo que mejor se ajuste:',
        options: [
          '🚀 Lo más pronto posible',
          '📅 En las próximas 2-4 semanas',
          '🗓️ En 1-2 meses',
          '⏳ En más de 2 meses',
          '🤔 Aún no estoy seguro'
        ]
      });
    }, 1500);
    
    setCurrentStep(CONVERSATION_STEPS.TIMELINE);
  };

  const handleTimelineResponse = (response: string) => {
    const timeline = response.replace(/[🚀📅🗓️⏳🤔]/g, '').trim();
    setProjectData(prev => ({ ...prev, timeline }));
    
    addMessage({
      type: 'bot',
      content: '¡Excelente! 🎯 Ya tengo toda la información que necesito. Déjame analizar tus requerimientos y preparar una recomendación personalizada...'
    });
    
    setTimeout(() => {
      generateRecommendations();
    }, 3000);
  };

  const generateRecommendations = () => {
    addMessage({
      type: 'system',
      content: '🤖 Analizando tus requerimientos...'
    });
    
    setTimeout(() => {
      addMessage({
        type: 'bot',
        content: '🎉 ¡Listo! Basándome en tu proyecto, he seleccionado las mejores opciones de policarbonato para ti:'
      });
      
      setTimeout(() => {
        showProductRecommendations();
      }, 1500);
    }, 2000);
  };

  const showProductRecommendations = () => {
    // Lógica inteligente para seleccionar productos basándose en projectData
    let recommendedProducts = [];
    
    try {
      // Filtrar productos según el tipo de proyecto y presupuesto
      const allProducts = productosData.productos_policarbonato || [];
      
      // Lógica de recomendación basada en el proyecto
      const projectType = projectData.tipo_proyecto?.toLowerCase() || '';
      const budget = projectData.presupuesto?.descripcion?.toLowerCase() || '';
      const useCase = projectData.uso_principal?.toLowerCase() || '';
      
      // Seleccionar productos según el tipo de proyecto
      let filteredProducts = allProducts.filter(group => {
        if (projectType.includes('residencial') || projectType.includes('techado residencial')) {
          return group.categoria === 'Policarbonato Alveolar' || group.categoria === 'Policarbonato Ondulado';
        } else if (projectType.includes('industrial')) {
          return group.categoria === 'Policarbonato Ondulado' || group.subcategoria === 'Industrial';
        } else if (projectType.includes('invernadero')) {
          return group.categoria === 'Policarbonato Alveolar';
        } else if (projectType.includes('cerramiento')) {
          return group.categoria === 'Policarbonato Compacto' || group.categoria === 'Policarbonato Alveolar';
        }
        return true; // Si no hay coincidencia específica, mostrar todos
      });
      
      // Si no hay productos filtrados, usar todos
      if (filteredProducts.length === 0) {
        filteredProducts = allProducts;
      }
      
      // Seleccionar las mejores opciones (máximo 3)
      const selectedProducts = filteredProducts.slice(0, 3).map(group => {
        // Seleccionar la mejor variante de cada grupo
        const bestVariant = group.variantes && group.variantes.length > 0 
          ? group.variantes.reduce((prev, current) => {
              // Priorizar por stock y precio
              if (current.stock > 0 && (prev.stock === 0 || current.precio_con_iva < prev.precio_con_iva)) {
                return current;
              }
              return prev;
            })
          : null;
        
        if (bestVariant) {
          return {
            id: group.id || `${group.categoria}-${Math.random()}`,
            name: group.nombre || group.categoria,
            image: group.imagen || bestVariant.imagen,
            price: bestVariant.precio_con_iva,
            variant: bestVariant,
            category: group.categoria,
            description: group.descripcion || `${group.categoria} de alta calidad`,
            benefits: [
              `Stock disponible: ${bestVariant.stock} unidades`,
              `Espesor: ${bestVariant.espesor || 'Variable'}`,
              `Color: ${bestVariant.color || 'Disponible'}`,
              'Entrega rápida disponible'
            ],
            reason: getProductReason(group.categoria, projectData)
          };
        }
        return null;
      }).filter(Boolean);
      
      recommendedProducts = selectedProducts;
    } catch (error) {
      console.error('Error al cargar productos:', error);
      // Fallback a productos predeterminados
      recommendedProducts = [
        {
          id: 'fallback-1',
          name: 'Policarbonato Alveolar 10mm',
          price: 22500,
          image: '/assets/images/Productos/policarbonato_alveolar_4mm_cristal.webp',
          reason: 'Ideal para tu proyecto por su versatilidad',
          benefits: ['Excelente aislamiento', 'Fácil instalación', 'Garantía extendida']
        }
      ];
    }
    
    // Mostrar productos con información completa
    recommendedProducts.forEach((product, index) => {
      setTimeout(() => {
        addMessage({
          type: 'bot',
          content: '🎯 Aquí tienes mi recomendación personalizada:',
          data: {
            type: 'product',
            product: product
          }
        });
      }, index * 2500);
    });
    
    setTimeout(() => {
      addMessage({
        type: 'bot',
        content: '🔧 ¿Te gustaría que incluya el servicio de instalación profesional en tu cotización?',
        options: ['✅ Sí, incluir instalación', '❌ Solo el material']
      });
      setCurrentStep(CONVERSATION_STEPS.INSTALLATION);
    }, recommendedProducts.length * 2500 + 1000);
  };

  // Función auxiliar para generar razones personalizadas
  const getProductReason = (categoria: string, projectData: any) => {
    const project = projectData.tipo_proyecto?.toLowerCase() || '';
    const use = projectData.uso_principal?.toLowerCase() || '';
    
    if (categoria === 'Policarbonato Alveolar') {
      if (use.includes('temperatura')) return 'Perfecto para control térmico con excelente aislamiento';
      if (project.includes('invernadero')) return 'Ideal para invernaderos, permite el paso de luz y mantiene temperatura';
      return 'Excelente opción por su aislamiento térmico y resistencia';
    } else if (categoria === 'Policarbonato Ondulado') {
      if (use.includes('lluvia')) return 'Perfecta protección contra lluvia con máxima durabilidad';
      if (project.includes('industrial')) return 'Resistencia industrial para grandes superficies';
      return 'Ideal para cubrir grandes áreas con excelente relación costo-beneficio';
    } else if (categoria === 'Policarbonato Compacto') {
      if (use.includes('decorativo')) return 'Perfecto para uso decorativo con máxima transparencia';
      if (project.includes('cerramiento')) return 'Ideal para cerramientos con alta resistencia al impacto';
      return 'Máxima resistencia y durabilidad para proyectos exigentes';
    }
    
    return 'Recomendado especialmente para tu tipo de proyecto';
  };

  // Función para agregar producto al carrito
  const handleAddToCart = (product: any) => {
    try {
      // Calcular área estimada para la cantidad
      const ancho = parseFloat(projectData.dimensiones?.ancho || '10');
      const largo = parseFloat(projectData.dimensiones?.largo || '10');
      const area = ancho * largo;
      
      const cartItem = {
        id: product.id,
        tipo: 'producto' as const,
        nombre: product.name,
        descripcion: product.description || `${product.category} - Recomendado por IA`,
        imagen: product.image,
        cantidad: Math.ceil(area), // Cantidad en m²
        precioUnitario: product.price,
        total: product.price * Math.ceil(area),
        especificaciones: [
          `Categoría: ${product.category}`,
          `Área estimada: ${area.toFixed(2)} m²`,
          `Recomendado por IA para: ${product.reason}`
        ]
      };

      addItem(cartItem);
      setSelectedProducts(prev => [...prev, product]);

      // Mensaje de confirmación detallado
      addMessage({
        type: 'system',
        content: `✅ ¡${product.name} agregado al carrito!\n\n📐 **Detalles del cálculo:**\n• Dimensiones de tu proyecto: ${ancho}m × ${largo}m\n• Área total: ${area.toFixed(2)} m²\n• Cantidad agregada: ${Math.ceil(area)} m² (redondeado)\n• Precio unitario: $${product.price.toLocaleString()} por m²\n💰 **Subtotal: $${(product.price * Math.ceil(area)).toLocaleString()}**`
      });

      // Preguntar si quiere agregar más productos
      setTimeout(() => {
        addMessage({
          type: 'bot',
          content: '🛒 ¿Te gustaría agregar más productos a tu carrito o continuamos con los datos de entrega?',
          options: ['➕ Ver más productos', '📝 Continuar con datos de entrega']
        });
        setCurrentStep(CONVERSATION_STEPS.CART_MANAGEMENT);
      }, 1500);

    } catch (error) {
      addMessage({
        type: 'system',
        content: '❌ Error al agregar el producto. Por favor intenta nuevamente.'
      });
    }
  };

  // Función para manejar la gestión del carrito
  const handleCartManagement = (response: string) => {
    if (response.includes('más productos')) {
      addMessage({
        type: 'bot',
        content: '🔄 Te muestro otras excelentes opciones para tu proyecto:'
      });
      setTimeout(() => {
        showProductRecommendations();
      }, 1000);
    } else {
      addMessage({
        type: 'bot',
        content: '📋 Perfecto. Ahora necesito algunos datos tuyos para preparar la entrega.'
      });
      setTimeout(() => {
        handleUserDataCollection();
      }, 1000);
    }
  };

  // Función para recopilar datos del usuario
  const handleUserDataCollection = () => {
    addMessage({
      type: 'bot',
      content: '👤 Para procesar tu pedido, necesito los siguientes datos:\n\n📝 **Información personal:**\n• Nombre completo\n• Teléfono de contacto\n• Email\n• Dirección de entrega\n\nComencemos con tu nombre completo:'
    });
    setCurrentStep(CONVERSATION_STEPS.USER_DATA);
  };

  // Función para manejar la recopilación de datos
  const handleUserDataInput = (input: string) => {
    if (!userData.nombre) {
      setUserData(prev => ({ ...prev, nombre: input }));
      addMessage({
        type: 'bot',
        content: `👋 ¡Hola ${input}! Ahora necesito tu número de teléfono:`
      });
    } else if (!userData.telefono) {
      setUserData(prev => ({ ...prev, telefono: input }));
      addMessage({
        type: 'bot',
        content: '📧 Perfecto. ¿Cuál es tu email?'
      });
    } else if (!userData.email) {
      setUserData(prev => ({ ...prev, email: input }));
      addMessage({
        type: 'bot',
        content: '🏠 Por último, necesito la dirección de entrega (calle, número, comuna):'
      });
    } else if (!userData.direccion) {
      setUserData(prev => ({ ...prev, direccion: input }));
      addMessage({
        type: 'bot',
        content: '✅ ¡Datos completos! Ahora vamos a verificar la ubicación exacta para la entrega.',
        options: ['📍 Obtener mi ubicación automáticamente', '📝 Ingresar dirección manualmente']
      });
      setCurrentStep(CONVERSATION_STEPS.GEOLOCATION);
    }
  };

  // Función para manejar geolocalización
  const handleGeolocation = (option: string) => {
    if (option.includes('automáticamente')) {
      if (navigator.geolocation) {
        addMessage({
          type: 'bot',
          content: '📡 Obteniendo tu ubicación...'
        });
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            
            addMessage({
              type: 'system',
              content: `📍 ¡Ubicación detectada!\n📊 Coordenadas: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
            });
            
            setTimeout(() => {
              showFinalBudget();
            }, 1500);
          },
          (error) => {
            addMessage({
              type: 'bot',
              content: '❌ No pude obtener tu ubicación automáticamente. Usaremos la dirección que ingresaste.',
              options: ['📋 Ver presupuesto final']
            });
            setCurrentStep(CONVERSATION_STEPS.FINAL_BUDGET);
          }
        );
      } else {
        addMessage({
          type: 'bot',
          content: '❌ Tu navegador no soporta geolocalización. Usaremos la dirección ingresada.',
          options: ['📋 Ver presupuesto final']
        });
        setCurrentStep(CONVERSATION_STEPS.FINAL_BUDGET);
      }
    } else {
      showFinalBudget();
    }
  };

  // Función para mostrar presupuesto final
  const showFinalBudget = () => {
    const totalCarrito = cartState.items.reduce((sum, item) => sum + item.total, 0);
    const instalacionCosto = projectData.instalacion ? totalCarrito * 0.15 : 0; // 15% por instalación
    const totalFinal = totalCarrito + instalacionCosto;

    addMessage({
      type: 'bot',
      content: '💼 **PRESUPUESTO FINAL**',
      data: {
        type: 'budget',
        budget: {
          subtotal: totalCarrito,
          instalacion: instalacionCosto,
          total: totalFinal,
          items: cartState.items,
          userData: userData,
          location: userLocation,
          projectData: projectData
        }
      }
    });

    setTimeout(() => {
      addMessage({
        type: 'bot',
        content: '¿Estás conforme con el presupuesto? ¿Te gustaría proceder con la compra?',
        options: ['✅ Sí, proceder con la compra', '📝 Modificar pedido', '💬 Consultar por WhatsApp']
      });
      setCurrentStep(CONVERSATION_STEPS.CHECKOUT);
    }, 2000);
  };

  // Función para manejar el checkout
  const handleCheckout = (response: string) => {
    if (response.includes('proceder con la compra')) {
      addMessage({
        type: 'bot',
        content: '🎉 ¡Perfecto! Te voy a redirigir al proceso de pago seguro de ObraExpress.'
      });
      
      setTimeout(() => {
        addMessage({
          type: 'system',
          content: '🔄 Redirigiendo al checkout...'
        });
        
        // Redirigir al checkout con todos los datos
        const params = new URLSearchParams();
        if (userData.direccion) params.set('direccion', userData.direccion);
        if (userLocation) {
          params.set('lat', userLocation.lat.toString());
          params.set('lng', userLocation.lng.toString());
        }
        
        setTimeout(() => {
          window.location.href = `/checkout?${params.toString()}`;
        }, 1500);
      }, 2000);
    } else if (response.includes('Modificar pedido')) {
      addMessage({
        type: 'bot',
        content: '📝 ¿Qué te gustaría modificar?',
        options: ['🛒 Cambiar productos', '📋 Actualizar datos personales', '🏠 Cambiar dirección']
      });
    } else if (response.includes('WhatsApp')) {
      const whatsappMessage = generateComprehensiveWhatsAppMessage();
      addMessage({
        type: 'bot',
        content: '💬 Te redirijo a WhatsApp con toda la información de tu cotización personalizada.'
      });
      setTimeout(() => {
        window.open(`https://wa.me/56933334444?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
      }, 1500);
    }
  };

  // Función para generar mensaje completo de WhatsApp
  const generateComprehensiveWhatsAppMessage = () => {
    const totalCarrito = cartState.items.reduce((sum, item) => sum + item.total, 0);
    const instalacionCosto = projectData.instalacion ? totalCarrito * 0.15 : 0;
    const totalFinal = totalCarrito + instalacionCosto;

    return `🤖 *COTIZACIÓN GENERADA POR IA - ObraExpress*

👤 *DATOS DEL CLIENTE:*
• Nombre: ${userData.nombre || 'No especificado'}
• Teléfono: ${userData.telefono || 'No especificado'}
• Email: ${userData.email || 'No especificado'}
• Dirección: ${userData.direccion || 'No especificado'}

🏗️ *DETALLES DEL PROYECTO:*
• Tipo: ${projectData.tipo_proyecto || 'No especificado'}
• Dimensiones: ${projectData.dimensiones?.ancho || 'N/A'} x ${projectData.dimensiones?.largo || 'N/A'} metros
• Uso principal: ${projectData.uso_principal || 'No especificado'}
• Instalación: ${projectData.instalacion ? 'Sí requerida' : 'No requerida'}

🛒 *PRODUCTOS SELECCIONADOS:*
${cartState.items.map(item => 
  `• ${item.nombre}\n  Cantidad: ${item.cantidad} m²\n  Precio unitario: $${item.precioUnitario.toLocaleString()}\n  Subtotal: $${item.total.toLocaleString()}`
).join('\n\n')}

💰 *RESUMEN FINANCIERO:*
• Subtotal productos: $${totalCarrito.toLocaleString()}
${instalacionCosto > 0 ? `• Instalación (15%): $${instalacionCosto.toLocaleString()}` : ''}
• *TOTAL: $${totalFinal.toLocaleString()}*

📍 *UBICACIÓN:*
${userLocation ? `• Coordenadas: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}` : '• Según dirección proporcionada'}

🤖 *Esta cotización fue generada por nuestro Asistente IA basado en las necesidades específicas del cliente.*

¿Podrían confirmar disponibilidad y coordinar la entrega?

*Generado desde Cotizador IA ObraExpress*`;
  };

  const handleInstallationResponse = (response: string) => {
    const needsInstallation = response.includes('Sí');
    setProjectData(prev => ({ ...prev, instalacion: needsInstallation }));
    
    if (needsInstallation) {
      addMessage({
        type: 'bot',
        content: '🔧 Perfecto! Incluiré nuestro servicio de instalación profesional. Esto asegura la correcta instalación y garantía completa.'
      });
    } else {
      addMessage({
        type: 'bot',
        content: '👍 Entendido! Solo incluiré el material. Recuerda que ofrecemos guías de instalación detalladas.'
      });
    }
    
    setTimeout(() => {
      addMessage({
        type: 'bot',
        content: '📞 Para finalizar tu cotización personalizada, necesito tus datos de contacto. ¿Podrías compartir tu nombre y teléfono?',
        options: ['📝 Escribir mis datos', '📱 Llamarme después']
      });
      setCurrentStep(CONVERSATION_STEPS.CONTACT_INFO);
    }, 2000);
  };

  const handleContactResponse = (response: string) => {
    if (response.includes('Escribir')) {
      addMessage({
        type: 'bot',
        content: 'Perfecto! Por favor escribe tu nombre y número de teléfono:'
      });
    } else {
      generateFinalQuote();
    }
  };

  const handleGeneralResponse = (response: string) => {
    if (response.trim().length > 0 && currentStep === CONVERSATION_STEPS.CONTACT_INFO) {
      // Procesar información de contacto
      setProjectData(prev => ({ 
        ...prev, 
        contacto: { info: response } 
      }));
      
      addMessage({
        type: 'bot',
        content: '¡Gracias! 🎉 Ya tengo toda la información. Preparando tu cotización final...'
      });
      
      setTimeout(() => {
        generateFinalQuote();
      }, 2000);
    }
  };

  const generateFinalQuote = () => {
    addMessage({
      type: 'system',
      content: '🚀 Generando cotización personalizada...'
    });
    
    setTimeout(() => {
      const whatsappMessage = generateWhatsAppMessage();
      addMessage({
        type: 'bot',
        content: '✅ ¡Tu cotización está lista! He preparado un resumen completo con todas las recomendaciones personalizadas para tu proyecto.',
        options: ['📱 Enviar por WhatsApp', '📧 Enviar por Email', '📄 Ver resumen completo']
      });
    }, 3000);
  };

  const generateWhatsAppMessage = () => {
    return `🏗️ *COTIZACIÓN INTELIGENTE ObraExpress*

📋 *RESUMEN DEL PROYECTO:*
• Tipo: ${projectData.tipo_proyecto}
• Ubicación: ${projectData.ubicacion}
• Dimensiones: ${projectData.dimensiones?.area_descripcion}
• Uso: ${projectData.uso_principal}
• Presupuesto: ${projectData.presupuesto?.descripcion}
• Timeline: ${projectData.timeline}
• Instalación: ${projectData.instalacion ? 'Incluida' : 'Solo material'}

💎 *PRODUCTOS RECOMENDADOS:*
• Policarbonato Alveolar Premium 10mm - $22,500/m²
• Policarbonato Ondulado Transparente - $8,950/m²

🤖 Cotización generada con IA - ObraExpress
📅 ${new Date().toLocaleDateString('es-CL')}`;
  };

  const handleNeedHelp = () => {
    addMessage({
      type: 'bot',
      content: 'No te preocupes! 😊 Estoy aquí para guiarte paso a paso. Te voy a hacer preguntas muy sencillas y tú solo tienes que elegir la opción que mejor se ajuste a tu caso.',
      options: ['👍 Perfecto, empecemos ahora', '🤙 Prefiero hablar con un humano']
    });
  };

  const handleContactExecutive = () => {
    addMessage({
      type: 'bot',
      content: '👥 ¡Por supuesto! Te conectamos directamente con nuestro equipo de ejecutivos especializados en policarbonatos. Ellos podrán ayudarte de forma personalizada.',
    });
    
    setTimeout(() => {
      addMessage({
        type: 'bot',
        content: '📞 Elige la forma de contacto que prefieras:',
        options: [
          '📱 WhatsApp con Ejecutivo',
          '☎️ Solicitar llamada telefónica',
          '📧 Enviar consulta por email',
          '🤖 Mejor sigamos con el asistente IA'
        ]
      });
    }, 1500);
  };

  const handleSendMessage = () => {
    if (userInput.trim()) {
      handleUserResponse(userInput);
      setUserInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleOptionClick = (option: string) => {
    if (option.includes('WhatsApp') && option.includes('Ejecutivo')) {
      // WhatsApp con Ejecutivo
      const executiveMessage = `👋 Hola! Vengo del Cotizador IA de ObraExpress y necesito ayuda personalizada de un ejecutivo para mi proyecto de policarbonatos.

🤖 El asistente IA me dirigió aquí porque prefiero hablar directamente con una persona.

¿Podrían ayudarme con mi consulta?`;
      window.open(`https://wa.me/56933334444?text=${encodeURIComponent(executiveMessage)}`, '_blank');
      
      addMessage({
        type: 'system',
        content: '✅ Te hemos redirigido a WhatsApp con nuestro ejecutivo. ¡En breve te contactarán!'
      });
    } else if (option.includes('WhatsApp') && !option.includes('Ejecutivo')) {
      // WhatsApp con cotización
      const message = generateWhatsAppMessage();
      window.open(`https://wa.me/56933334444?text=${encodeURIComponent(message)}`, '_blank');
    } else if (option.includes('llamada telefónica')) {
      // Solicitar llamada
      addMessage({
        type: 'bot',
        content: '📞 ¡Perfecto! Para coordinar la llamada, comparte tu número de teléfono y nuestro ejecutivo te contactará en el horario hábil más próximo.',
      });
      
      setTimeout(() => {
        addMessage({
          type: 'bot',
          content: 'Por favor escribe tu número de teléfono:'
        });
      }, 1000);
    } else if (option.includes('email')) {
      // Email
      const emailBody = `Consulta desde Cotizador IA ObraExpress

Hola equipo ObraExpress,

Me dirijo a ustedes desde el Cotizador IA porque necesito ayuda personalizada con mi proyecto de policarbonatos.

Información de mi proyecto:
- Generada desde el Asistente IA
- Fecha: ${new Date().toLocaleDateString('es-CL')}

Por favor, contactenme para brindarme asesoría personalizada.

Saludos cordiales.`;

      window.location.href = `mailto:contacto@obraexpress.cl?subject=Consulta desde Cotizador IA&body=${encodeURIComponent(emailBody)}`;
      
      addMessage({
        type: 'system',
        content: '✅ Se ha abierto tu cliente de email con la consulta preparada.'
      });
    } else if (option.includes('humano')) {
      handleContactExecutive();
    } else if (option.includes('sigamos con el asistente')) {
      addMessage({
        type: 'bot',
        content: '🤖 ¡Perfecto! Sigamos con el cotizador inteligente. Te haré algunas preguntas para entender tu proyecto.',
      });
      setTimeout(() => {
        handleProjectTypeQuestion();
      }, 1000);
    } else {
      handleUserResponse(option);
    }
  };

  return (
    <div className="min-h-screen relative" style={{
      background: `linear-gradient(135deg, #ffffff 0%, #f8faff 30%, #e8f2ff 70%, #f0f8ff 100%),
                   url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e3f2fd' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
    }}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-lg">
        <div className="w-full max-w-[1140px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Botón Volver Rediseñado */}
            <button
              onClick={() => window.location.href = '/'}
              className="group relative flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-md hover:shadow-lg border-2 border-gray-200 hover:border-gray-300 overflow-hidden"
            >
              {/* Efecto hover de fondo */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Contenido del botón */}
              <div className="relative flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 group-hover:bg-blue-100 rounded-full transition-colors duration-300">
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span className="hidden sm:inline font-medium">Volver al Inicio</span>
                <span className="sm:hidden font-medium">Inicio</span>
              </div>
            </button>
            
            {/* Título Responsivo */}
            <div className="text-center flex-1 mx-4">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">🤖 Asistente IA ObraExpress</h1>
              <p className="text-gray-600 text-xs sm:text-sm hidden sm:block">Cotizador Guiado por Inteligencia Artificial</p>
            </div>
            
            {/* Status Online */}
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">Online</span>
              <span className="text-xs sm:text-sm font-medium sm:hidden">●</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container Optimizado */}
      <div className="w-full max-w-[1140px] mx-auto px-2 sm:px-4 pt-4 sm:pt-6 pb-4 sm:pb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-blue-200/50 overflow-hidden" style={{
          marginTop: '1rem'
        }}>
          {/* Chat Messages */}
          <div 
            className="overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4"
            style={{
              background: `linear-gradient(to bottom, rgba(248, 250, 255, 0.3), rgba(255, 255, 255, 0.8))`,
              height: isDesktop 
                ? 'calc(100vh - 180px)' // Escritorio: más alto para mejor visualización
                : 'calc(100vh - 300px)', // Móvil: ajustado para espacio disponible
              minHeight: isDesktop ? '650px' : '400px',
              maxHeight: isDesktop ? '950px' : '600px'
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                      : message.type === 'system'
                      ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border border-yellow-200 shadow-md'
                      : 'bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg border border-blue-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  
                  {/* Mostrar tarjeta de producto si existe */}
                  {message.data?.type === 'product' && message.data.product && (
                    <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="flex flex-col sm:flex-row">
                        {/* Imagen del producto */}
                        {message.data.product.image && (
                          <div className="w-full sm:w-32 h-24 sm:h-32 bg-gray-100 flex-shrink-0">
                            <img
                              src={message.data.product.image}
                              alt={message.data.product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/assets/images/Productos/policarbonato_alveolar_4mm_cristal.webp';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Información del producto */}
                        <div className="flex-1 p-4">
                          <h3 className="font-bold text-gray-900 text-base mb-2">
                            {message.data.product.name}
                          </h3>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold text-green-600">
                              ${(message.data.product.price || 0).toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500">por m²</span>
                          </div>
                          
                          {/* Mostrar cantidad calculada */}
                          {(() => {
                            const ancho = parseFloat(projectData.dimensiones?.ancho || '10');
                            const largo = parseFloat(projectData.dimensiones?.largo || '10');
                            const area = ancho * largo;
                            const cantidad = Math.ceil(area);
                            const totalPrice = (message.data.product.price || 0) * cantidad;
                            
                            return (
                              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                <div className="text-sm text-blue-800 space-y-1">
                                  <div className="flex justify-between">
                                    <span>📐 Tu proyecto:</span>
                                    <span className="font-medium">{ancho}m × {largo}m</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>📦 Cantidad necesaria:</span>
                                    <span className="font-medium">{cantidad} m²</span>
                                  </div>
                                  <div className="flex justify-between border-t border-blue-200 pt-1">
                                    <span className="font-semibold">💰 Total estimado:</span>
                                    <span className="font-bold text-green-600">${totalPrice.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                          
                          <p className="text-sm text-blue-600 mb-3 italic">
                            ✨ {message.data.product.reason}
                          </p>
                          
                          {/* Beneficios */}
                          {message.data.product.benefits && (
                            <div className="space-y-1">
                              {message.data.product.benefits.slice(0, 3).map((benefit, idx) => (
                                <div key={idx} className="flex items-center text-xs text-gray-600">
                                  <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                                  {benefit}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Botones de acción */}
                          <div className="mt-4 flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleAddToCart(message.data.product)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                            >
                              {(() => {
                                const ancho = parseFloat(projectData.dimensiones?.ancho || '10');
                                const largo = parseFloat(projectData.dimensiones?.largo || '10');
                                const area = ancho * largo;
                                const cantidad = Math.ceil(area);
                                return `🛒 Agregar ${cantidad} m² al Carrito`;
                              })()}
                            </button>
                            <button
                              onClick={() => {
                                addMessage({
                                  type: 'user',
                                  content: `Más información sobre ${message.data.product.name}`
                                });
                                setTimeout(() => {
                                  addMessage({
                                    type: 'bot',
                                    content: `📋 **Información detallada de ${message.data.product.name}:**\n\n💰 **Precio:** $${(message.data.product.price || 0).toLocaleString()} por m²\n📦 **Categoría:** ${message.data.product.category}\n🎯 **Ideal para:** ${message.data.product.reason}\n\n¿Te gustaría agregarlo al carrito o ver otras opciones?`
                                  });
                                }, 1000);
                              }}
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                            >
                              ℹ️ Más Info
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mostrar mapa de ubicación si existe */}
                  {message.data?.type === 'map' && message.data.location && (
                    <div className="mt-4 border border-blue-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 overflow-hidden">
                      <div className="space-y-0">
                        <h3 className="text-lg font-bold text-blue-800 text-center py-3">
                          🗺️ Ubicación Detectada
                        </h3>
                        
                        {/* Mapa interactivo a todo el ancho */}
                        <div className="bg-white overflow-hidden shadow-sm border-y">
                          <div className="bg-gray-100 px-4 py-2 text-center border-b">
                            <span className="text-xs font-medium text-gray-700">
                              🗺️ Puedes escribir tu dirección abajo o arrastrar el marcador • Zoom con +/- • Botón ⛶ para expandir
                            </span>
                          </div>
                          
                          <div 
                            id={`map-${message.id}`}
                            className="w-full"
                            style={{ height: '350px' }}
                            ref={(el) => {
                              if (el && !el.hasChildNodes()) {
                                // Cargar Leaflet dinámicamente
                                if (typeof window !== 'undefined' && !window.L) {
                                  // Cargar CSS
                                  const cssLink = document.createElement('link');
                                  cssLink.rel = 'stylesheet';
                                  cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                                  document.head.appendChild(cssLink);
                                  
                                  // Cargar JS
                                  const script = document.createElement('script');
                                  script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                                  script.onload = () => initializeMap(el, message.data.location, message.id);
                                  document.head.appendChild(script);
                                } else if (window.L) {
                                  setTimeout(() => initializeMap(el, message.data.location, message.id), 100);
                                }
                              }
                            }}
                          />
                          
                          {/* Información de ubicación */}
                          <div className="bg-gray-50 px-4 py-3 border-t">
                            <div className="space-y-3">
                              {/* Campo de dirección con autocompletado */}
                              <div className="bg-white rounded-lg p-3 border">
                                <div className="text-xs font-medium text-gray-700 mb-2">📍 Dirección del proyecto:</div>
                                <div className="relative">
                                  <div className="flex gap-2">
                                    <div className="flex-1 relative">
                                      <input
                                        type="text"
                                        id={`address-input-${message.id}`}
                                        placeholder="Empieza a escribir tu dirección..."
                                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        onInput={(e) => {
                                          const input = e.target as HTMLInputElement;
                                          if (input.value.length >= 3) {
                                            debounceAutocomplete(input.value, message.id);
                                          } else {
                                            hideSuggestions(message.id);
                                          }
                                        }}
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            const input = e.target as HTMLInputElement;
                                            searchAddressInChile(input.value, message.id);
                                            hideSuggestions(message.id);
                                          }
                                        }}
                                        onFocus={(e) => {
                                          const input = e.target as HTMLInputElement;
                                          if (input.value.length >= 3) {
                                            showSuggestions(message.id);
                                          }
                                        }}
                                        onBlur={() => {
                                          setTimeout(() => hideSuggestions(message.id), 200);
                                        }}
                                      />
                                      
                                      {/* Lista de sugerencias */}
                                      <div 
                                        id={`suggestions-${message.id}`}
                                        className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto hidden"
                                      >
                                        <div className="p-2 text-xs text-gray-500 bg-blue-50 border-b">
                                          💡 Selecciona una opción o escribe la dirección completa
                                        </div>
                                        <div id={`suggestions-list-${message.id}`}></div>
                                      </div>
                                    </div>
                                    
                                    <button
                                      onClick={() => {
                                        const input = document.getElementById(`address-input-${message.id}`) as HTMLInputElement;
                                        if (input && input.value.trim()) {
                                          searchAddressInChile(input.value, message.id);
                                          hideSuggestions(message.id);
                                        }
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                                    >
                                      📍 Buscar
                                    </button>
                                    
                                    <button
                                      onClick={() => {
                                        getCurrentLocationPrecise(message.id);
                                      }}
                                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
                                      title="Detectar mi ubicación actual"
                                    >
                                      🎯 Mi Ubicación
                                    </button>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-2 space-y-1">
                                  <div>💡 <strong>Sugerencias:</strong></div>
                                  <div>• Escribe al menos 3 caracteres para ver sugerencias</div>
                                  <div>• Incluye número, calle, comuna (ej: "Providencia 1234, Providencia")</div>
                                  <div>• Usa el botón "🎯 Mi Ubicación" para detectar tu posición actual</div>
                                </div>
                              </div>
                              
                              {/* Dirección detectada automáticamente */}
                              <div className="bg-white rounded-lg p-2 border">
                                <div className="text-xs font-medium text-gray-700 mb-1">🤖 Dirección detectada automáticamente:</div>
                                <div 
                                  id={`auto-address-${message.id}`}
                                  className="text-sm text-gray-600 italic"
                                >
                                  Cargando...
                                </div>
                              </div>
                              
                              {/* Coordenadas */}
                              <div className="text-center">
                                <div className="text-xs text-gray-600">
                                  <strong>Coordenadas:</strong> <span id={`coords-${message.id}`}>
                                    {message.data.location.lat.toFixed(6)}, {message.data.location.lng.toFixed(6)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pregunta de confirmación */}
                        <div className="px-4 py-3 bg-white border-t">
                          <div className="text-center mb-3">
                            <div className="text-sm font-semibold text-gray-800 mb-2">
                              ¿Es correcta esta ubicación para tu proyecto?
                            </div>
                            <div className="text-xs text-gray-600">
                              Puedes ajustar el marcador en el mapa o escribir la dirección manualmente
                            </div>
                          </div>
                          
                          {/* Botones de respuesta */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const coordsElement = document.getElementById(`coords-${message.id}`);
                                const currentCoords = coordsElement?.textContent || '';
                                const [lat, lng] = currentCoords.split(',').map(c => parseFloat(c.trim()));
                                
                                // Obtener dirección final del usuario o la detectada automáticamente
                                const addressInput = document.getElementById(`address-input-${message.id}`) as HTMLInputElement;
                                const autoAddressElement = document.getElementById(`auto-address-${message.id}`);
                                
                                // Priorizar la dirección escrita por el usuario
                                let finalAddress = '';
                                if (addressInput?.value.trim()) {
                                  finalAddress = addressInput.value.trim();
                                } else {
                                  // Extraer solo el texto principal de la dirección detectada (sin emojis ni texto extra)
                                  const autoText = autoAddressElement?.querySelector('div')?.textContent || '';
                                  finalAddress = autoText || `Coordenadas: ${currentCoords}`;
                                }
                                
                                // Guardar datos finales completos
                                setProjectData(prev => ({ 
                                  ...prev, 
                                  ubicacion: finalAddress,
                                  coordenadas: { lat: lat || message.data.location.lat, lng: lng || message.data.location.lng }
                                }));
                                
                                addMessage({
                                  type: 'user',
                                  content: 'Sí, la ubicación está correcta'
                                });
                                setTimeout(() => {
                                  addMessage({
                                    type: 'bot',
                                    content: `✅ Perfecto! Entonces tu dirección es: **${finalAddress}**, ubicación confirmada. 📐 Ahora hablemos de las dimensiones de tu proyecto.`
                                  });
                                  setTimeout(() => {
                                    proceedToDimensions();
                                  }, 1500);
                                }, 1000);
                              }}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                              ✅ Sí, es correcta
                            </button>
                            <button
                              onClick={() => {
                                // Usar handleMessage para procesar correctamente la respuesta de rechazo
                                handleMessage('No, la ubicación no es correcta');
                              }}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                            >
                              ❌ No, no es correcta
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mostrar presupuesto final si existe */}
                  {message.data?.type === 'budget' && message.data.budget && (
                    <div className="mt-4 border border-green-200 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-green-800 text-center mb-3">
                          💼 Presupuesto Final
                        </h3>
                        
                        {/* Items del presupuesto */}
                        <div className="space-y-2">
                          {message.data.budget.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center py-2 px-3 bg-white/60 rounded-lg">
                              <div>
                                <span className="font-medium text-gray-800">{item.nombre}</span>
                                <span className="text-sm text-gray-600 ml-2">({item.cantidad} m²)</span>
                              </div>
                              <span className="font-semibold text-gray-900">
                                ${item.total.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Resumen financiero */}
                        <div className="border-t pt-3 space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal:</span>
                            <span>${message.data.budget.subtotal.toLocaleString()}</span>
                          </div>
                          
                          {message.data.budget.instalacion > 0 && (
                            <div className="flex justify-between text-sm text-blue-600">
                              <span>Instalación (15%):</span>
                              <span>${message.data.budget.instalacion.toLocaleString()}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between text-lg font-bold text-green-700 border-t pt-2">
                            <span>TOTAL:</span>
                            <span>${message.data.budget.total.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Información del cliente */}
                        <div className="bg-white/40 rounded-lg p-3 text-sm">
                          <h4 className="font-semibold text-gray-800 mb-2">📋 Información del pedido:</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><strong>Cliente:</strong> {message.data.budget.userData.nombre}</div>
                            <div><strong>Teléfono:</strong> {message.data.budget.userData.telefono}</div>
                            <div className="col-span-2"><strong>Email:</strong> {message.data.budget.userData.email}</div>
                            <div className="col-span-2"><strong>Dirección:</strong> {message.data.budget.userData.direccion}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {message.options && (
                    <div className="mt-3 sm:mt-4 grid gap-2">
                      {message.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleOptionClick(option)}
                          className="text-left p-2 sm:p-3 text-sm sm:text-base bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-lg sm:rounded-xl transition-all duration-200 transform hover:scale-[1.02] text-blue-800 font-medium shadow-sm hover:shadow-md"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg border border-blue-100 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">Asistente está escribiendo...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area Optimizada */}
          <div className="border-t border-blue-100 p-3 sm:p-4 bg-white/95 backdrop-blur-sm">
            <div className="flex gap-2 sm:gap-3">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 p-3 sm:p-4 text-sm sm:text-base border border-blue-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/90 backdrop-blur-sm transition-all shadow-sm focus:shadow-md"
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim()}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-sm"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Info Cards Responsivas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-all duration-200">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">🤖</div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">IA Personalizada</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Recomendaciones basadas en tu proyecto específico</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-all duration-200">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">⚡</div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">Respuesta Inmediata</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Cotización lista en menos de 5 minutos</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-all duration-200">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2">🎯</div>
              <h3 className="font-bold text-gray-900 text-sm sm:text-base">100% Preciso</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Productos perfectos para tu necesidad</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};