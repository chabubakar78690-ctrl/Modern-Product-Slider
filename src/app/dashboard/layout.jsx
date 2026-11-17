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

// One fixed admin account for now. The admin can change name/email/password
// later from Admin → Settings → Admin account.
const NAV = [
  { section: 'Main' },
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/licenses', label: 'Licenses', icon: KeyRound },
  { href: '/dashboard/downloads', label: 'Plugin Upload', icon: Upload },
  { href: '/dashboard/billing', label: 'Payments', icon: CreditCard },
  { section: 'Admin' },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users },
  { href: '/dashboard/admin/pricing', label: 'Pricing', icon: Tag },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState('light');
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [store, setStore] = useState(null);

  useEffect(() => {
    setTheme(window.localStorage.getItem('mps-theme') || 'light');
    window.localStorage.setItem('mps-role', 'admin');
    setStore(loadStore());
    fetch('/api/auth/me').then((r) => r.json()).then((d) => { if (d.user) setStore((s) => ({ ...s, profile: { ...s.profile, name: d.user.name, email: d.user.email } })); }).catch(() => {});
    const onStore = () => setStore(loadStore());
    window.addEventListener('mps-store', onStore);
    return () => window.removeEventListener('mps-store', onStore);
  }, []);

  const changeTheme = () => { const t = theme === 'light' ? 'dark' : 'light'; setTheme(t); window.localStorage.setItem('mps-theme', t); };

  const me = store?.profile || { name: 'Abubakar', email: 'chabubakar78690@gmail.com' };
  const unread = (store?.notifications || []).filter((n) => n.unread).length;
  const titles = { '/dashboard': ['Overview', 'Dashboard / Overview'], '/dashboard/licenses': ['Licenses', 'Dashboard / Licenses'], '/dashboard/downloads': ['Plugin Upload', 'Dashboard / Downloads'], '/dashboard/billing': ['Payments', 'Dashboard / Billing'], '/dashboard/profile': ['Profile', 'Dashboard / Profile'], '/dashboard/admin/users': ['Users', 'Dashboard / Admin / Users'], '/dashboard/admin/pricing': ['Pricing', 'Dashboard / Admin / Pricing'], '/dashboard/admin/settings': ['Settings', 'Dashboard / Admin / Settings'] };
  const [title, crumb] = titles[pathname] || ['Dashboard', 'Dashboard'];

  return (
    <div className="dash" data-theme={theme}>
      {drawer && <div className="dash-backdrop" onClick={() => setDrawer(false)} />}
      <aside className={`dash-side ${collapsed ? 'collapsed' : ''} ${drawer ? 'open' : ''}`}>
        <div className="dash-brand">
          <img src="/logo-mark.svg" alt="Modern Product Slider" className="dash-mark" />
          <div className="b-text"><div className="b-name">Modern Product Slider</div><div className="b-sub">Admin Dashboard</div></div>
        </div>
        <nav className="dash-nav">
          {NAV.map((item, i) => item.section ? <h5 key={i}>{item.section}</h5> : (
            <Link key={item.href} href={item.href} className={pathname === item.href ? 'active' : ''} onClick={() => setDrawer(false)} title={item.label}>
              <item.icon size={21} strokeWidth={2} /><span className="lbl">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="dash-side-foot">
          <div className="dash-avatar">{me.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</div>
          <div className="who"><b>{me.name}</b><span>{me.email}</span></div>
          <Link className="dash-logout" href="/" title="Back to website" aria-label="Back to website"><LogOut size={17} /></Link>
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
          <Link className="dash-icon-btn dash-top-link" href="/dashboard/admin/settings" title="Login & signup keys (OAuth)" aria-label="Login and signup keys"><KeyRound size={18} /></Link>
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
