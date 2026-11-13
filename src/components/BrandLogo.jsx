import React from 'react';

/**
 * Official Brand Logo for Modern Product Slider
 * Uses the user's provided logo mark with dual-mode responsive styling.
 */
export default function BrandLogo({ className = 'h-9', showSubtitle = true, isDark = true }) {
  return (
    <div className="flex items-center gap-3 select-none">
      {/* Brand Icon (3D Cards Carousel + Shopping Bag) */}
      <div className="relative flex items-center justify-center shrink-0">
        <img
          src="/logo.png"
          alt="Modern Product Slider Logo"
          className={`${className} w-auto object-contain drop-shadow-sm`}
          onError={(e) => {
            // Fallback SVG if image is blocked or loading
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
        {/* Crisp vector fallback icon matching the uploaded logo mark */}
        <div
          style={{ display: 'none' }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white items-center justify-center shadow-md shadow-sky-500/20"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
      </div>

      {/* Brand Typography (Hidden on mobile if desired, or styled for crisp light/dark contrast) */}
      <div className="hidden sm:block text-left">
        <div className="text-base font-extrabold tracking-tight leading-none">
          <span className={isDark ? 'text-white' : 'text-slate-900'}>Modern </span>
          <span className="text-sky-500">Product </span>
          <span className={isDark ? 'text-white' : 'text-slate-900'}>Slider</span>
        </div>
        {showSubtitle && (
          <span className={`text-[10px] tracking-wider uppercase font-semibold block mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            WooCommerce 3D Showroom Pro
          </span>
        )}
      </div>
    </div>
  );
}
