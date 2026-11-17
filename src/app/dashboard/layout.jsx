'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, KeyRound, Upload, CreditCard, Users, Tag, Settings, User,
  Search, Moon, Sun, Mail, Menu, ChevronLeft, ChevronRight, LogOut,
} from 'lucide-react';
import './dashboard.css';
import { loadStore } from './lib/store';
import { useSession } from './lib/useStore';

// One fixed admin account. Everyone who signs up is a customer; the admin
// section below only renders for the signed-in admin.
const NAV = [
  { section: 'Main' },
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/licenses', label: 'Licenses', icon: KeyRound },
  { href: '/dashboard/downloads', label: 'Plugin Upload', icon: Upload },
  { href: '/dashboard/billing', label: 'Payments', icon: CreditCard },
  { section: 'Admin', admin: true },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users, admin: true },
  { href: '/dashboard/admin/pricing', label: 'Pricing', icon: Tag, admin: true },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings, admin: true },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState('light');
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [store, setStore] = useState(null);
  const session = useSession();
  const isAdmin = session.user?.role === 'admin';

  useEffect(() => {
    setTheme(window.localStorage.getItem('mps-theme') || 'light');
    window.localStorage.removeItem('mps-role');
    setStore(loadStore());
    const onStore = () => setStore(loadStore());
    window.addEventListener('mps-store', onStore);
    return () => window.removeEventListener('mps-store', onStore);
  }, []);

  // Auth guard: in real (database) mode the dashboard needs a signed-in
  // user. Demo mode (no database configured) still lets visitors explore.
  useEffect(() => {
    if (session.loading) return;
    if (!session.user && !session.demo) window.location.href = '/?auth=login';
    else if (session.user && !isAdmin && pathname.startsWith('/dashboard/admin')) window.location.href = '/dashboard';
  }, [session, isAdmin, pathname]);

  const logout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    window.localStorage.removeItem('mps-role');
    window.location.href = '/';
  };

  if (session.loading) {
    return <div className="dash" data-theme={theme}><div className="dash-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#5b6b82' }}>Checking your session…</div></div>;
  }
  if (!session.user && !session.demo) return null;

  const changeTheme = () => { const t = theme === 'light' ? 'dark' : 'light'; setTheme(t); window.localStorage.setItem('mps-theme', t); };

  const me = session.user ? { name: session.user.name, email: session.user.email } : (store?.profile || { name: 'Abubakar', email: 'chabubakar78690@gmail.com' });
  const unread = (store?.notifications || []).filter((n) => n.unread).length;
  const titles = { '/dashboard': ['Overview', 'Dashboard / Overview'], '/dashboard/licenses': ['Licenses', 'Dashboard / Licenses'], '/dashboard/downloads': ['Plugin Upload', 'Dashboard / Downloads'], '/dashboard/billing': ['Payments', 'Dashboard / Billing'], '/dashboard/profile': ['Profile', 'Dashboard / Profile'], '/dashboard/admin/users': ['Users', 'Dashboard / Admin / Users'], '/dashboard/admin/pricing': ['Pricing', 'Dashboard / Admin / Pricing'], '/dashboard/admin/settings': ['Settings', 'Dashboard / Admin / Settings'] };
  const [title, crumb] = titles[pathname] || ['Dashboard', 'Dashboard'];

  return (
    <div className="dash" data-theme={theme}>
      {drawer && <div className="dash-backdrop" onClick={() => setDrawer(false)} />}
      <aside className={`dash-side ${collapsed ? 'collapsed' : ''} ${drawer ? 'open' : ''}`}>
        <div className="dash-brand">
          <img src="/logo-mark.svg" alt="Modern Product Slider" className="dash-mark" />
          <div className="b-text"><div className="b-name">Modern Product Slider</div><div className="b-sub">{isAdmin ? 'Admin Dashboard' : 'Customer Dashboard'}</div></div>
        </div>
        <nav className="dash-nav">
          {NAV.filter((item) => !item.admin || isAdmin).map((item, i) => item.section ? <h5 key={i}>{item.section}</h5> : (
            <Link key={item.href} href={item.href} className={pathname === item.href ? 'active' : ''} onClick={() => setDrawer(false)} title={item.label}>
              <item.icon size={21} strokeWidth={2} /><span className="lbl">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="dash-side-foot">
          <div className="dash-avatar">{me.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
          <div className="who"><b>{me.name}</b><span>{me.email}</span></div>
          <button className="dash-logout" onClick={logout} title="Log out" aria-label="Log out"><LogOut size={17} /></button>
        </div>
        <button className="dash-collapse-float" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
        </button>
      </aside>

      <div className="dash-main">
        <header className="dash-top">
          <button className="dash-icon-btn dash-menu-btn" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu size={19} /></button>
          <div className="dash-title"><h1>{title}</h1><p className="crumb">{crumb}</p></div>
          <div className="dash-search"><Search size={17} /><input placeholder="Search licenses, users, payments…" aria-label="Search" /></div>
          {isAdmin && <Link className="dash-icon-btn dash-top-link" href="/dashboard/admin/settings" title="Login & signup keys (OAuth)" aria-label="Login and signup keys"><KeyRound size={18} /></Link>}
          <button className="dash-icon-btn" onClick={changeTheme} aria-label="Toggle light / dark mode" title="Light / dark mode">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
          <div className="dash-notif">
            <button className="dash-icon-btn" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications"><Mail size={18} />{unread > 0 && <span className="dot" />}</button>
            {notifOpen && (
              <div className="dash-notif-pop">
                <h4>Notifications</h4>
                {(store?.notifications || []).map((n) => (
                  <div key={n.id} className={`n-item ${n.unread ? 'unread' : ''}`}>{n.text}<small>{n.time}</small></div>
                ))}
              </div>
            )}
          </div>
          <Link className="dash-avatar" href="/dashboard/profile" title={me.name}>{me.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</Link>
        </header>
        <main className="dash-body">{children}</main>
      </div>
    </div>
  );
}
