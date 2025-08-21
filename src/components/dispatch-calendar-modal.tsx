"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { safeDocument } from '@/lib/client-utils';
import { getNextDispatchDate, formatDispatchDate, getDispatchRuleForProduct, getDispatchDescription } from '@/utils/dispatch-dates';

interface DispatchCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect?: (date: Date) => void;
  productType?: string;
}

export function DispatchCalendarModal({ isOpen, onClose, onDateSelect, productType = "Policarbonato" }: DispatchCalendarModalProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [nextDispatchDate, setNextDispatchDate] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentProductType, setCurrentProductType] = useState(productType);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const nextDate = getNextDispatchDate(currentProductType);
    setNextDispatchDate(nextDate);
    setSelectedDate(nextDate);
  }, [currentProductType]);

  useEffect(() => {
    setCurrentProductType(productType);
  }, [productType]);

  if (!mounted || !isOpen) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDateStatus = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const dayOfWeek = date.getDay();
    const isPast = checkDate < today;
    const isToday = checkDate.getTime() === today.getTime();
    
    if (isToday) return 'today';
    
    // Usar las reglas de despacho configuradas
    const rule = getDispatchRuleForProduct(currentProductType);
    
    if (rule.availableDays.includes(dayOfWeek) && !isPast) {
      return 'available';
    }
    
    return isPast ? 'past' : 'unavailable';
  };

  const formatDate = (date: Date) => {
    const formatted = date.toLocaleDateString('es-CL', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    // Capitalizar la primera letra
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatDateWithHighlightedNumber = (date: Date) => {
    const weekday = date.toLocaleDateString('es-CL', { weekday: 'long' });
    const day = date.getDate();
    const month = date.toLocaleDateString('es-CL', { month: 'long' });
    
    return {
      weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
      day: day,
      month: month
    };
  };

  const handleDateSelect = (date: Date) => {
    const status = getDateStatus(date);
    if (status === 'available') {
      setSelectedDate(date);
      if (onDateSelect) {
        onDateSelect(date);
      }
    }
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  const calendarDays = generateCalendarDays();

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center"
      style={{ 
        zIndex: 9999999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          transform: 'translateY(-10px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Disponibilidad de Despacho</h3>
              <p className="text-emerald-100 text-sm mt-1">
                {getDispatchDescription(currentProductType)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Selector de categoría de producto */}
        <div className="bg-white p-4 border-b border-gray-200">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría de producto
            </label>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400 transition-colors"
            >
              <span className="block truncate font-medium text-gray-900">{currentProductType}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg 
                  className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none border border-gray-200">
                <div
                  onClick={() => {
                    setCurrentProductType('Policarbonato');
                    setIsDropdownOpen(false);
                  }}
                  className="cursor-pointer select-none relative py-3 pl-3 pr-9 hover:bg-emerald-50 group"
                >
                  <span className="block truncate font-medium text-gray-900 group-hover:text-emerald-700">
                    Policarbonato
                  </span>
                  <span className="text-gray-500 text-sm group-hover:text-emerald-600">
                    Solo jueves de 9:00 a 18:00 hrs
                  </span>
                  {currentProductType.includes('Policarbonato') && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
                <div
                  onClick={() => {
                    setCurrentProductType('Herramientas Especializadas');
                    setIsDropdownOpen(false);
                  }}
                  className="cursor-pointer select-none relative py-3 pl-3 pr-9 hover:bg-emerald-50 group"
                >
                  <span className="block truncate font-medium text-gray-900 group-hover:text-emerald-700">
                    Herramientas Especializadas
                  </span>
                  <span className="text-gray-500 text-sm group-hover:text-emerald-600">
                    Lunes a viernes de 9:00 a 18:00 hrs
                  </span>
                  {currentProductType.includes('Herramienta') && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Próximo despacho */}
        {nextDispatchDate && (
          <div className="bg-emerald-50 p-4 border-b">
            <div className="text-center">
              <p className="text-emerald-700 text-sm font-medium">Próximo despacho disponible</p>
              <p className="text-emerald-800 font-bold">{formatDate(nextDispatchDate)}</p>
            </div>
          </div>
        )}

        {/* Navegación del mes */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h4 className="text-lg font-semibold text-gray-800 capitalize">
            {currentMonth.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
          </h4>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            </button>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-1 p-4 pb-2 bg-gray-50">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, index) => (
            <div 
              key={day} 
              className={`text-center text-xs font-medium py-2 ${
                index === 4 ? 'text-emerald-600 font-bold' : 'text-gray-500'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendario */}
        <div className="grid grid-cols-7 gap-1 p-4 pt-0 pb-4">
          {calendarDays.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const status = getDateStatus(date);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            
            let buttonClass = 'h-8 w-8 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center relative ';
            
            if (!isCurrentMonth) {
              buttonClass += 'text-gray-300 cursor-default';
            } else if (status === 'today') {
              buttonClass += 'bg-blue-500 text-white font-bold ring-2 ring-blue-300';
            } else if (status === 'available') {
              if (isSelected) {
                buttonClass += 'bg-emerald-600 text-white font-bold ring-2 ring-emerald-300 shadow-lg transform scale-110';
              } else {
                buttonClass += 'border-2 border-emerald-500 text-emerald-600 hover:border-emerald-600 hover:text-emerald-700 cursor-pointer font-bold hover:shadow-md hover:scale-105 bg-white';
              }
            } else if (status === 'past') {
              buttonClass += 'text-gray-400 cursor-default';
            } else {
              buttonClass += 'text-gray-500 hover:bg-gray-100 cursor-default';
            }

            return (
              <button
                key={index}
                onClick={() => status === 'available' ? handleDateSelect(date) : null}
                disabled={status !== 'available'}
                className={buttonClass}
                title={
                  status === 'today' ? `Hoy - ${date.getDate()}` :
                  status === 'available' ? `Despacho disponible - ${date.getDate()}` :
                  `${date.getDate()} - No disponible`
                }
              >
                {date.getDate()}
                {status === 'available' && !isSelected && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Información seleccionada */}
        {selectedDate && (
          <div className="bg-gradient-to-r from-slate-50 to-gray-100 p-6 border-t border-gray-200">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Tu despacho será</h4>
                <p className="text-xl font-semibold text-gray-900 mb-2">{formatDate(selectedDate)}</p>
                <div className="flex items-center justify-center text-sm text-gray-600 mb-4">
                  <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Entre las {getDispatchRuleForProduct(currentProductType).timeRange.start}:00 y {getDispatchRuleForProduct(currentProductType).timeRange.end}:00 hrs
                </div>
                
                {/* Botón de acción centrado */}
                <button
                  onClick={() => {
                    const dateParam = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
                    onClose(); // Cerrar el modal primero
                    router.push(`/productos?categoria=Policarbonatos&fecha=${dateParam}`);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4l1-12z" />
                  </svg>
                  <span>Ver productos</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leyenda */}
        <div className="bg-gray-50 p-4 border-t">
          <div className="flex items-center justify-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Hoy</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-2 border-emerald-500 rounded bg-white"></div>
              <span className="text-gray-600">Disponible</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-emerald-600 rounded ring-2 ring-emerald-300"></div>
              <span className="text-gray-600 font-medium">Seleccionada</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span className="text-gray-600">No disponible</span>
            </div>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            {getDispatchDescription(currentProductType)}
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}