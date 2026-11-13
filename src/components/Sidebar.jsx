import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Key,
  Globe,
  CreditCard,
  Receipt,
  Shield,
  Activity,
  BookOpen,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Sun,
  Moon,
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
        { id: 'licenses', label: 'Pro License Key', icon: Key },
        { id: 'domains', label: 'Connected Stores', icon: Globe },
      ],
    },
    {
      group: 'BILLING & TIERS',
      items: [
        { id: 'plans', label: 'Pricing & Upgrades', icon: CreditCard },
        { id: 'transactions', label: 'Invoices & Receipts', icon: Receipt },
      ],
    },
    ...(isAdmin
      ? [
          {
            group: 'ADMIN CONTROL',
            items: [
              { id: 'admin', label: 'User Operations', icon: Shield, badge: 'Admin' },
              { id: 'logs', label: 'Audit & API Logs', icon: Activity },
            ],
          },
        ]
      : []),
    {
      group: 'RESOURCES',
      items: [
        { id: 'docs', label: 'WordPress Guide', icon: BookOpen },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 flex flex-col border-r transition-all duration-300 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${
        isDark
          ? 'bg-[#0B132B] border-slate-800/80 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Sidebar Header / Logo */}
      <div
        className={`h-18 flex items-center border-b px-4 transition-all ${
          isCollapsed ? 'justify-center' : 'justify-between'
        } ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
      >
        <button
          onClick={() => onSelectTab('overview')}
          className="focus:outline-none flex items-center"
        >
          <BrandLogo isCollapsed={isCollapsed} isDark={isDark} className="h-8" />
        </button>

        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            title="Collapse Sidebar"
            className={`p-1.5 rounded-lg border transition ${
              isDark
                ? 'border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                : 'border-slate-200 text-slate-500 hover:text-black hover:bg-slate-100'
            }`}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((g) => (
          <div key={g.group} className="space-y-1">
            {!isCollapsed && (
              <div
                className={`px-3 text-[10px] font-black uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {g.group}
              </div>
            )}
            {g.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-xs font-bold transition-all ${
                    isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5 gap-3'
                  } ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.badge ? 'text-amber-500' : 'text-slate-400'}`} />
                  {!isCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-500">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Sidebar Bottom Controls */}
      <div className={`p-3 border-t space-y-2 ${isDark ? 'border-slate-800 bg-[#0A0F21]' : 'border-slate-200 bg-slate-50'}`}>
        {/* User Info Capsule */}
        {user ? (
          <div
            className={`p-2.5 rounded-2xl border flex items-center gap-2.5 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            } ${isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white'}`}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1 text-left">
                <div className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {user.name}
                </div>
                <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {user.email}
                </div>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={onSignOut}
                title="Sign out"
                className={`p-1.5 rounded-lg transition ${
                  isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-500 hover:text-rose-600'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          !isCollapsed && (
            <button
              onClick={() => onSelectTab('login')}
              className="w-full py-2.5 px-3 rounded-xl bg-sky-500 text-white font-bold text-xs text-center shadow-md shadow-sky-500/20"
            >
              Sign In to Portal
            </button>
          )
        )}

        {/* Footer Buttons (Theme & Collapse Toggle) */}
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-2' : 'justify-between'}`}>
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2 rounded-xl border transition ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Expand Toggle when collapsed */}
          {isCollapsed ? (
            <button
              onClick={onToggleCollapse}
              title="Expand Sidebar"
              className={`p-2 rounded-xl border transition ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-black shadow-sm'
              }`}
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onToggleCollapse}
              className={`text-[11px] font-semibold flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'
              }`}
            >
              <PanelLeftClose className="w-3.5 h-3.5" /> Collapse
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
