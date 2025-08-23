"use client";

import { useState } from 'react';

interface SimpleJellyOrbProps {
  onClick: () => void;
  title?: string;
  isClicked?: boolean;
  isAnimatingOut?: boolean;
}

export default function SimpleJellyOrb({ 
  onClick, 
  title = "💬 Conversemos - Asistente ObraExpress",
  isClicked = false,
  isAnimatingOut = false
}: SimpleJellyOrbProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      {/* Ondas de fondo animadas - etéreas */}
      <div className="absolute inset-0 w-16 h-16">
        {/* Onda 1 - interior suave */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: isHovered 
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 40%, transparent 70%)',
            animation: 'etherealWave1 6s ease-in-out infinite',
            transform: 'scale(1.1)',
            filter: 'blur(1px)',
            transition: 'background 0.4s ease-in-out',
          }}
        />
        
        {/* Onda 2 - media difusa */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: isHovered 
              ? 'radial-gradient(circle, rgba(37, 99, 235, 0.20) 0%, rgba(37, 99, 235, 0.10) 50%, transparent 80%)'
              : 'radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, rgba(37, 99, 235, 0.06) 50%, transparent 80%)',
            animation: 'etherealWave2 8s ease-in-out infinite 1.5s',
            transform: 'scale(1.3)',
            filter: 'blur(2px)',
            transition: 'background 0.4s ease-in-out',
          }}
        />
        
        {/* Onda 3 - exterior etérea */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: isHovered 
              ? 'radial-gradient(circle, rgba(29, 78, 216, 0.15) 0%, rgba(29, 78, 216, 0.07) 60%, transparent 90%)'
              : 'radial-gradient(circle, rgba(29, 78, 216, 0.10) 0%, rgba(29, 78, 216, 0.04) 60%, transparent 90%)',
            animation: 'etherealWave3 10s ease-in-out infinite 3s',
            transform: 'scale(1.5)',
            filter: 'blur(3px)',
            transition: 'background 0.4s ease-in-out',
          }}
        />
        
        {/* Onda 4 - muy sutil y amplia */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: isHovered 
              ? 'radial-gradient(circle, rgba(30, 64, 175, 0.12) 0%, rgba(30, 64, 175, 0.04) 70%, transparent 95%)'
              : 'radial-gradient(circle, rgba(30, 64, 175, 0.08) 0%, rgba(30, 64, 175, 0.02) 70%, transparent 95%)',
            animation: 'etherealWave4 12s ease-in-out infinite 4.5s',
            transform: 'scale(1.8)',
            filter: 'blur(4px)',
            transition: 'background 0.4s ease-in-out',
          }}
        />
      </div>

      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-16 h-16 rounded-full focus:outline-none transition-all duration-300 z-10 transform ${
          isClicked 
            ? 'bg-blue-700/95 border-2 border-blue-500/90 shadow-2xl shadow-blue-500/40 scale-90' 
            : isAnimatingOut
            ? 'bg-blue-500/50 border-2 border-blue-300/50 shadow-md shadow-blue-500/10 scale-75 opacity-50'
            : isHovered 
            ? 'bg-blue-600/95 border-2 border-blue-400/90 shadow-xl shadow-blue-400/30 scale-115' 
            : 'bg-blue-500/90 border-2 border-blue-300/70 shadow-lg shadow-blue-500/20 scale-100'
        }`}
        title={title}
        style={{
          backdropFilter: 'blur(12px)',
          animation: 'gentleFloat 6s ease-in-out infinite',
        }}
      >
      
      {/* Indicador Online */}
      <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-3 border-white shadow-lg shadow-green-600/50 z-10">
        <div className="w-2.5 h-2.5 bg-green-400 rounded-full absolute top-0.5 left-0.5 animate-pulse shadow-sm"></div>
      </div>
      
      {/* Ícono de Chat Central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          stroke="currentColor" 
          className={`w-6 h-6 transition-all duration-300 ${
            isClicked 
              ? 'text-white scale-110 rotate-6' 
              : isAnimatingOut
              ? 'text-white/70 scale-90 rotate-0'
              : isHovered 
              ? 'text-white scale-125 rotate-3' 
              : 'text-white scale-100 rotate-0'
          }`}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" 
          />
        </svg>
      </div>
      </button>
      
      {/* CSS para animaciones etéreas */}
      <style jsx>{`
        @keyframes etherealWave1 {
          0%, 100% { 
            transform: scale(1.1);
            opacity: 1;
          }
          33% { 
            transform: scale(1.25);
            opacity: 0.7;
          }
          66% { 
            transform: scale(1.15);
            opacity: 0.9;
          }
        }
        
        @keyframes etherealWave2 {
          0%, 100% { 
            transform: scale(1.3);
            opacity: 0.8;
          }
          25% { 
            transform: scale(1.45);
            opacity: 0.4;
          }
          75% { 
            transform: scale(1.35);
            opacity: 0.6;
          }
        }
        
        @keyframes etherealWave3 {
          0%, 100% { 
            transform: scale(1.5);
            opacity: 0.6;
          }
          40% { 
            transform: scale(1.7);
            opacity: 0.2;
          }
          80% { 
            transform: scale(1.6);
            opacity: 0.4;
          }
        }
        
        @keyframes etherealWave4 {
          0%, 100% { 
            transform: scale(1.8);
            opacity: 0.4;
          }
          30% { 
            transform: scale(2.1);
            opacity: 0.1;
          }
          70% { 
            transform: scale(1.95);
            opacity: 0.2;
          }
        }
        
        @keyframes gentleFloat {
          0%, 100% { 
            transform: translateY(0px);
          }
          50% { 
            transform: translateY(-1px);
          }
        }
      `}</style>
    </div>
  );
}