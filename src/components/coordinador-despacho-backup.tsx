"use client";

import React, { useState } from 'react';

interface DespachoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Regiones y comunas de Chile - VERSION SIMPLE
const regionesChile = {
  'Región Metropolitana': ['Santiago', 'Las Condes', 'Providencia', 'Ñuñoa', 'Maipú'],
  'Región de Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana'],
  'Región del Biobío': ['Concepción', 'Talcahuano', 'Chillán', 'Los Ángeles']
};

export const CoordinadorDespacho: React.FC<DespachoModalProps> = ({ isOpen, onClose }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedComuna, setSelectedComuna] = useState<string>('');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  });

  if (!isOpen) return null;

  const handleClose = () => {
    // Reset form
    setSelectedRegion('');
    setSelectedComuna('');
    setFormData({ nombre: '', telefono: '', direccion: '' });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Formulario enviado correctamente');
    handleClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>

        <h2 className="text-xl font-bold mb-6">Coordinador de Despacho</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre *</label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full p-3 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Teléfono *</label>
            <input
              type="tel"
              required
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
              className="w-full p-3 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Región *</label>
            <select
              required
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedComuna('');
              }}
              className="w-full p-3 border rounded"
            >
              <option value="">Selecciona una región</option>
              {Object.keys(regionesChile).map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comuna *</label>
            <select
              required
              value={selectedComuna}
              onChange={(e) => setSelectedComuna(e.target.value)}
              className="w-full p-3 border rounded"
              disabled={!selectedRegion}
            >
              <option value="">
                {selectedRegion ? 'Selecciona una comuna' : 'Primero selecciona una región'}
              </option>
              {selectedRegion && regionesChile[selectedRegion as keyof typeof regionesChile]?.map((comuna) => (
                <option key={comuna} value={comuna}>{comuna}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Dirección *</label>
            <input
              type="text"
              required
              value={formData.direccion}
              onChange={(e) => setFormData({...formData, direccion: e.target.value})}
              className="w-full p-3 border rounded"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-500 text-white py-3 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-3 rounded hover:bg-blue-600"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};