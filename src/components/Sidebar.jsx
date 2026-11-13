import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  KeyRound,
  Globe2,
  CreditCard,
  Receipt,
  ShieldCheck,
  Activity,
  BookOpen,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Sun,
  Moon,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import BrandLogo from './BrandLogo.jsx';

export default function Sidebar({
  activeTab,
  onSelectTab,
  user,
  onSignOut,
  isDark,
  onToggleTheme,
  isCollapsed,
  onToggleCollapse,
  onGoToLanding,
}) {
  const isAdmin = user?.role === 'admin';

  const navGroups = [
    {
      group: 'WORKSPACE',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      group: 'LICENSING & DOMAINS',
      items: [
        { id: 'licenses', label: 'Pro License Key', icon: KeyRound },
        { id: 'domains', label: 'Connected Stores', icon: Globe2 },
      ],
    },
    {
      group: 'BILLING & PAYMENTS',
      items: [
        { id: 'plans', label: 'Pricing & Upgrades', icon: CreditCard },
        { id: 'transactions', label: 'Invoices & Receipts', icon: Receipt },
      ],
    },
    {
      group: 'SUPER ADMIN',
      items: [
        { id: 'admin', label: 'Operations & APIs', icon: ShieldCheck, badge: 'Admin' },
        { id: 'logs', label: 'Audit & API Logs', icon: Activity },
      ],
    },
    {
      group: 'RESOURCES',
      items: [
        { id: 'docs', label: 'WordPress Guide', icon: BookOpen },
        { id: 'settings', label: 'Account Settings', icon: Settings },
        { id: 'landing', label: 'Website Landing Page', icon: ExternalLink },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r transition-all duration-300 select-none bg-[#071126] border-[#102244] text-slate-100 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Header / Logo */}
      <div
        className={`h-16 flex items-center border-b px-4 transition-all border-[#102244] ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <button
          onClick={() => onSelectTab('overview')}
          className="focus:outline-none flex items-center"
          title="Modern Product Slider Dashboard"
        >
          <BrandLogo isCollapsed={isCollapsed} isDark={true} className="h-8" />
        </button>

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            title="Collapse Sidebar"
            className="p-1.5 rounded-xl border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Groups List */}
      <div
        className={`flex-1 px-3 py-4 space-y-6 ${
          isCollapsed ? 'overflow-visible' : 'overflow-y-auto'
        }`}
      >
        {navGroups.map((g) => (
          <div key={g.group} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 text-[10px] font-black uppercase tracking-wider mb-1.5 text-slate-400">
                {g.group}
              </div>
            )}
            {g.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      if (item.id === 'landing' && onGoToLanding) {
                        onGoToLanding();
                      } else {
                        onSelectTab(item.id);
                      }
                    }}
                    className={`w-full flex items-center rounded-xl text-xs font-bold transition-all ${
                      isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5 gap-3'
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-[#0C1E3D] to-[#142F60] text-white shadow-lg shadow-[#0C1E3D]/40 border border-[#1E4380]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : item.badge ? 'text-amber-400' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Tooltip on Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#0C1E3D] text-white text-xs font-semibold rounded-xl shadow-2xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 drop-shadow-2xl">
                      {item.label}
                      {item.badge && (
                        <span className="ml-2 text-[9px] font-bold text-amber-400 uppercase">
                          ({item.badge})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Bottom Controls */}
      <div className="p-3 border-t border-[#102244] bg-[#050D1C] space-y-2">
        {/* User Info Capsule */}
        {user ? (
          <div
            className={`p-2 rounded-2xl border border-[#14264A] bg-[#0A162F] flex items-center gap-2.5 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0C1E3D] to-[#1E488F] border border-[#2555A8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1 text-left">
                <div className="text-xs font-bold truncate text-white">
                  {user.name}
                </div>
                <div className="text-[10px] truncate text-slate-400">
                  {user.email}
                </div>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={onSignOut}
                title="Sign out of account"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          !isCollapsed && (
            <button
              onClick={() => onSelectTab('login')}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0C1E3D] to-[#142F60] hover:from-[#102750] hover:to-[#1B3F7D] text-white font-bold text-xs text-center shadow-md shadow-[#0C1E3D]/30 border border-[#1E4380] transition"
            >
              Sign In to Portal
            </button>
          )
        )}

        {/* Footer Buttons (Theme & Collapse Toggle) */}
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-between'}`}>
          {/* Theme Toggle */}
          <div className="relative group">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl border border-slate-700/60 bg-[#0A162F] text-amber-400 hover:bg-[#0E2044] transition"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-slate-300" />}
            </button>
            {isCollapsed && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#0C1E3D] text-white text-[11px] font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
                {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </div>
            )}
          </div>

          {/* Expand Toggle when collapsed */}
          {isCollapsed ? (
            <div className="relative group">
              <button
                onClick={onToggleCollapse}
                className="p-2 rounded-xl border border-slate-700/60 bg-[#0A162F] text-slate-400 hover:text-white hover:bg-[#0E2044] transition"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-[#0C1E3D] text-white text-[11px] font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50">
                Expand Sidebar
              </div>
            </div>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="text-[11px] font-semibold flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
            >
              <PanelLeftClose className="w-3.5 h-3.5" /> Collapse
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
