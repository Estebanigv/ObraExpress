"use client";

import React, { useState, useRef } from 'react';

interface Archivo {
  id: string;
  nombre: string;
  tipo: 'imagen' | 'documento' | 'video' | 'otro';
  extension: string;
  tamaño: number;
  fechaSubida: string;
  categoria: string;
  descripcion?: string;
  url: string;
  subidoPor: string;
  esPublico: boolean;
}

export default function AdminDocumentos() {
  const [archivos, setArchivos] = useState<Archivo[]>([
    {
      id: '1',
      nombre: 'catalogo-productos-2024.pdf',
      tipo: 'documento',
      extension: 'pdf',
      tamaño: 2500000, // 2.5MB
      fechaSubida: '2024-01-15',
      categoria: 'Catálogos',
      descripcion: 'Catálogo completo de productos 2024',
      url: '/docs/catalogo-2024.pdf',
      subidoPor: 'admin@obraexpress.cl',
      esPublico: true
    },
    {
      id: '2',
      nombre: 'policarbonato-4mm-ejemplo.jpg',
      tipo: 'imagen',
      extension: 'jpg',
      tamaño: 850000, // 850KB
      fechaSubida: '2024-01-14',
      categoria: 'Productos',
      descripcion: 'Imagen de ejemplo del policarbonato alveolar 4mm',
      url: '/images/productos/policarbonato-4mm.jpg',
      subidoPor: 'admin@obraexpress.cl',
      esPublico: true
    },
    {
      id: '3',
      nombre: 'ficha-tecnica-greca.pdf',
      tipo: 'documento',
      extension: 'pdf',
      tamaño: 1200000, // 1.2MB
      fechaSubida: '2024-01-13',
      categoria: 'Fichas Técnicas',
      descripcion: 'Especificaciones técnicas de greca industrial',
      url: '/docs/fichas/greca-industrial.pdf',
      subidoPor: 'admin@obraexpress.cl',
      esPublico: false
    }
  ]);

  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [vista, setVista] = useState<'lista' | 'cuadricula'>('lista');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [archivosSubiendo, setArchivosSubiendo] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatearTamaño = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / 1048576) + ' MB';
  };

  const obtenerIconoTipo = (tipo: string, extension: string) => {
    switch (tipo) {
      case 'imagen': return '🖼️';
      case 'documento': 
        if (extension === 'pdf') return '📄';
        if (extension === 'doc' || extension === 'docx') return '📝';
        return '📋';
      case 'video': return '🎥';
      default: return '📁';
    }
  };

  const archivosFiltrados = archivos.filter(archivo => {
    const coincideTipo = filtroTipo === 'todos' || archivo.tipo === filtroTipo;
    const coincideCategoria = filtroCategoria === '' || archivo.categoria === filtroCategoria;
    return coincideTipo && coincideCategoria;
  });

  const categorias = Array.from(new Set(archivos.map(a => a.categoria)));

  const manejarSubidaArchivos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setArchivosSubiendo(Array.from(files));
      setMostrarModal(true);
    }
  };

  const estadisticas = {
    totalArchivos: archivos.length,
    totalTamaño: archivos.reduce((sum, a) => sum + a.tamaño, 0),
    imagenes: archivos.filter(a => a.tipo === 'imagen').length,
    documentos: archivos.filter(a => a.tipo === 'documento').length,
    publicos: archivos.filter(a => a.esPublico).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-3xl font-bold">📄 Gestión de Documentos e Imágenes</h1>
        <p className="text-orange-100 mt-2">
          Central de archivos multimedia y documentación empresarial
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Archivos</p>
              <p className="text-xl font-bold text-blue-600">{estadisticas.totalArchivos}</p>
            </div>
            <span className="text-2xl">📁</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Espacio Usado</p>
              <p className="text-xl font-bold text-purple-600">
                {formatearTamaño(estadisticas.totalTamaño)}
              </p>
            </div>
            <span className="text-2xl">💾</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Imágenes</p>
              <p className="text-xl font-bold text-green-600">{estadisticas.imagenes}</p>
            </div>
            <span className="text-2xl">🖼️</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documentos</p>
              <p className="text-xl font-bold text-orange-600">{estadisticas.documentos}</p>
            </div>
            <span className="text-2xl">📄</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-lg border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Públicos</p>
              <p className="text-xl font-bold text-indigo-600">{estadisticas.publicos}</p>
            </div>
            <span className="text-2xl">🌐</span>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="todos">Todos los tipos</option>
              <option value="imagen">Imágenes</option>
              <option value="documento">Documentos</option>
              <option value="video">Videos</option>
            </select>
            
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>

            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setVista('lista')}
                className={`px-3 py-2 ${vista === 'lista' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
              >
                📋
              </button>
              <button
                onClick={() => setVista('cuadricula')}
                className={`px-3 py-2 ${vista === 'cuadricula' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700'}`}
              >
                ▦
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={manejarSubidaArchivos}
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-md"
            >
              📤 Subir Archivos
            </button>
            
            <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 shadow-md">
              📁 Nueva Carpeta
            </button>
          </div>
        </div>
      </div>

      {/* Vista de Archivos */}
      {vista === 'lista' ? (
        /* Vista Lista */
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Archivos ({archivosFiltrados.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {archivosFiltrados.map((archivo) => (
                  <tr key={archivo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {obtenerIconoTipo(archivo.tipo, archivo.extension)}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {archivo.nombre}
                          </div>
                          <div className="text-sm text-gray-500">
                            {archivo.categoria}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        {archivo.extension.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatearTamaño(archivo.tamaño)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(archivo.fechaSubida).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        archivo.esPublico ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {archivo.esPublico ? 'Público' : 'Privado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => window.open(archivo.url, '_blank')}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Ver archivo"
                        >
                          👁️
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Descargar"
                        >
                          ⬇️
                        </button>
                        <button
                          className="text-orange-600 hover:text-orange-900 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vista Cuadrícula */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {archivosFiltrados.map((archivo) => (
            <div key={archivo.id} className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-all">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">
                    {obtenerIconoTipo(archivo.tipo, archivo.extension)}
                  </span>
                </div>
                
                <h3 className="font-medium text-gray-900 mb-1 truncate" title={archivo.nombre}>
                  {archivo.nombre}
                </h3>
                
                <p className="text-sm text-gray-500 mb-2">
                  {archivo.categoria}
                </p>
                
                <div className="flex justify-center space-x-1 mb-3">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {archivo.extension.toUpperCase()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    archivo.esPublico ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {archivo.esPublico ? 'Público' : 'Privado'}
                  </span>
                </div>
                
                <p className="text-xs text-gray-400 mb-3">
                  {formatearTamaño(archivo.tamaño)} • {new Date(archivo.fechaSubida).toLocaleDateString('es-CL')}
                </p>
                
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => window.open(archivo.url, '_blank')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver archivo"
                  >
                    👁️
                  </button>
                  <button
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Descargar"
                  >
                    ⬇️
                  </button>
                  <button
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📸</span>
              <h4 className="font-semibold text-gray-900">Subir Imagen</h4>
              <p className="text-sm text-gray-600">JPG, PNG, GIF</p>
            </div>
          </button>

          <button className="p-4 border-2 border-dashed border-red-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📄</span>
              <h4 className="font-semibold text-gray-900">Subir PDF</h4>
              <p className="text-sm text-gray-600">Documentos</p>
            </div>
          </button>

          <button className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📊</span>
              <h4 className="font-semibold text-gray-900">Subir Excel</h4>
              <p className="text-sm text-gray-600">Hojas de cálculo</p>
            </div>
          </button>

          <button className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all">
            <div className="text-center">
              <span className="text-2xl mb-2 block">🎥</span>
              <h4 className="font-semibold text-gray-900">Subir Video</h4>
              <p className="text-sm text-gray-600">MP4, MOV, AVI</p>
            </div>
          </button>
        </div>
      </div>

      {/* Modal de Subida */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📤 Subir Archivos</h3>
            
            {archivosSubiendo.length > 0 && (
              <div className="space-y-4">
                {archivosSubiendo.map((archivo, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{archivo.name}</span>
                      <span className="text-sm text-gray-500">{formatearTamaño(archivo.size)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Categoría (ej: Productos, Catálogos)"
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="text"
                        placeholder="Descripción (opcional)"
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-orange-600 shadow-sm focus:ring-orange-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Hacer público</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setMostrarModal(false);
                  setArchivosSubiendo([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Subir Archivos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}