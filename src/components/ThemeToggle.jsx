import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      type="button"
      aria-label="Toggle light and dark theme"
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      className={`p-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800 hover:border-slate-700'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
      }`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
