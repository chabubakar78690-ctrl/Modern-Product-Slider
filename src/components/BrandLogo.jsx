import React from 'react';

/**
 * Official Brand Logo Component
 * Uses the exact logo image provided by the user.
 * In collapsed mode, renders the square icon.
 * In expanded mode, renders the full brand logo.
 */
export default function BrandLogo({ className = 'h-9', isCollapsed = false, isDark = true }) {
  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center select-none">
        <img
          src="/favicon.png"
          alt="Modern Product Slider Icon"
          className="w-9 h-9 object-contain rounded-xl shadow-sm"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center select-none">
      <img
        src="/logo.png"
        alt="Modern Product Slider"
        className={`${className} w-auto object-contain max-w-[210px]`}
      />
    </div>
  );
}
