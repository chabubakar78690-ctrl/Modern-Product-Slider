import React from 'react';
import BrandLogo from './BrandLogo.jsx';

export default function Loader({ message = 'Loading...', fullScreen = false, isDark = true }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4 select-none">
      {/* Brand animated ring spinner */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer pulsating glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#1E488F] to-sky-400 opacity-20 animate-ping" />
        
        {/* Smooth spinning ring */}
        <div className="w-14 h-14 rounded-full border-3 border-transparent border-t-[#1E488F] border-r-sky-400 animate-spin" />
        
        {/* Center brand dot */}
        <div className="absolute w-6 h-6 rounded-xl bg-gradient-to-br from-[#0C1E3D] to-[#1E488F] border border-sky-400/40 shadow-inner flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
        </div>
      </div>

      {/* Loading message */}
      <div className="text-center space-y-1">
        <p className={`text-xs font-bold tracking-wide uppercase ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {message}
        </p>
        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Modern Product Slider Pro
        </span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md transition-colors duration-200 ${
          isDark ? 'bg-[#050D1A]/85 text-slate-100' : 'bg-white/85 text-slate-900'
        }`}
      >
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-16 flex items-center justify-center">
      {content}
    </div>
  );
}

