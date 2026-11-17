'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './dashboard.css';
import { loadStore } from './lib/store';

const USER_NAV = [
  { section: 'Main' },
  { href: '/dashboard', label: 'Overview', icon: '▦' },
  { href: '/dashboard/licenses', label: 'My Licenses', icon: '⚿' },
  { href: '/dashboard/downloads', label: 'Downloads', icon: '↓' },
  { href: '/dashboard/billing', label: 'Billing', icon: '▤' },
  { href: '/dashboard/profile', label: 'Profile', icon: '◉' },
];

const ADMIN_NAV = [
  { section: 'Main' },
  { href: '/dashboard', label: 'Overview', icon: '▦' },
  { href: '/dashboard/licenses', label: 'Licenses', icon: '⚿' },
  { href: '/dashboard/downloads', label: 'Plugin Upload', icon: '↑' },
  { href: '/dashboard/billing', label: 'Payments', icon: '▤' },
  { section: 'Admin' },
  { href: '/dashboard/admin/users', label: 'Users', icon: '♟' },
  { href: '/dashboard/admin/pricing', label: 'Pricing', icon: '$' },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: '⚙' },
  { href: '/dashboard/profile', label: 'Profile', icon: '◉' },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [role, setRole] = useState('admin');
  const [theme, setTheme] = useState('light');
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [store, setStore] = useState(null);

  useEffect(() => {
    setRole(window.localStorage.getItem('mps-role') || 'admin');
    setTheme(window.localStorage.getItem('mps-theme') || 'light');
    setStore(loadStore());
    const onStore = () => setStore(loadStore());
    window.addEventListener('mps-store', onStore);
    return () => window.removeEventListener('mps-store', onStore);
  }, []);

  const changeRole = (r) => { setRole(r); window.localStorage.setItem('mps-role', r); };
  const changeTheme = () => { const t = theme === 'light' ? 'dark' : 'light'; setTheme(t); window.localStorage.setItem('mps-theme', t); };

  const nav = role === 'admin' ? ADMIN_NAV : USER_NAV;
  const me = role === 'admin' ? (store?.profile || { name: 'Abubakar', email: 'chabubakar78690@gmail.com' }) : (store?.customer || { name: 'Sara Ahmed', email: 'sara@fashionstore.com' });
  const unread = (store?.notifications || []).filter((n) => n.unread).length;
  const titles = { '/dashboard': ['Overview', 'Dashboard / Overview'], '/dashboard/licenses': [role === 'admin' ? 'Licenses' : 'My Licenses', 'Dashboard / Licenses'], '/dashboard/downloads': [role === 'admin' ? 'Plugin Upload' : 'Downloads', 'Dashboard / Downloads'], '/dashboard/billing': [role === 'admin' ? 'Payments' : 'Billing', 'Dashboard / Billing'], '/dashboard/profile': ['Profile', 'Dashboard / Profile'], '/dashboard/admin/users': ['Users', 'Dashboard / Admin / Users'], '/dashboard/admin/pricing': ['Pricing', 'Dashboard / Admin / Pricing'], '/dashboard/admin/settings': ['Settings', 'Dashboard / Admin / Settings'] };
  const [title, crumb] = titles[pathname] || ['Dashboard', 'Dashboard'];

  return (
    <div className="dash" data-theme={theme}>
      {drawer && <div className="dash-backdrop" onClick={() => setDrawer(false)} />}
      <aside className={`dash-side ${collapsed ? 'collapsed' : ''} ${drawer ? 'open' : ''}`}>
        <div className="dash-brand">
          <img src="/logo.svg" alt="Modern Product Slider" />
          <div><div className="b-name">Modern Product Slider</div><div className="b-sub">{role === 'admin' ? 'Admin Dashboard' : 'Customer Dashboard'}</div></div>
        </div>
        <nav className="dash-nav">
          {nav.map((item, i) => item.section ? <h5 key={i}>{item.section}</h5> : (
            <Link key={item.href} href={item.href} className={pathname === item.href ? 'active' : ''} onClick={() => setDrawer(false)}>
              <span className="ic">{item.icon}</span><span className="lbl">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="dash-side-foot">
          <div className="dash-avatar">{me.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
          <div className="who"><b>{me.name}</b><span>{me.email}</span></div>
          <button className="dash-collapse" onClick={() => setCollapsed(!collapsed)} aria-label="Collapse sidebar" title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? '›' : '‹'}</button>
        </div>
      </aside>

      <div className="dash-main">
        <header className="dash-top">
          <button className="dash-icon-btn dash-menu-btn" onClick={() => setDrawer(true)} aria-label="Open menu">☰</button>
          <div><h1>{title}</h1><p className="crumb">{crumb}</p></div>
          <div className="dash-search"><span>⌕</span><input placeholder="Search licenses, users, payments…" aria-label="Search" /></div>
          <div className="dash-role">
            <button className={role === 'admin' ? 'on' : ''} onClick={() => changeRole('admin')}>Admin</button>
            <button className={role === 'user' ? 'on' : ''} onClick={() => changeRole('user')}>Customer</button>
          </div>
          <button className="dash-icon-btn" onClick={changeTheme} aria-label="Toggle light / dark mode" title="Light / dark mode">{theme === 'light' ? '☾' : '☀'}</button>
          <div className="dash-notif">
            <button className="dash-icon-btn" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications">✉{unread > 0 && <span className="dot" />}</button>
            {notifOpen && (
              <div className="dash-notif-pop">
                <h4>Notifications</h4>
                {(store?.notifications || []).map((n) => (
                  <div key={n.id} className={`n-item ${n.unread ? 'unread' : ''}`}>{n.text}<small>{n.time}</small></div>
                ))}
              </div>
            )}
          </div>
          <div className="dash-avatar" title={me.name}>{me.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
        </header>
        <main className="dash-body">{children}</main>
      </div>
    </div>
  );
}
