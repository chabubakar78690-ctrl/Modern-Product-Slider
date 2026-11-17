'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, KeyRound, Upload, CreditCard, Users, Tag, Settings, User,
  Moon, Sun, Mail, Menu, ChevronLeft, ChevronRight, LogOut, X,
} from 'lucide-react';
import './dashboard.css';
import { loadStore } from './lib/store';
import { useSession, useDashboard } from './lib/useStore';
import { useNotifications } from './lib/notifications';
import Loader from './lib/Loader';

// One fixed admin account. Everyone who signs up is a customer; the admin
// section below only renders for the signed-in admin.
const NAV = [
  { section: 'Main' },
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/licenses', label: 'Licenses', icon: KeyRound },
  { href: '/dashboard/downloads', label: 'Downloads', icon: Upload },
  { href: '/dashboard/billing', label: 'Payments', icon: CreditCard },
  { section: 'Admin', admin: true },
  { href: '/dashboard/admin/users', label: 'Users', icon: Users, admin: true },
  { href: '/dashboard/admin/pricing', label: 'Pricing', icon: Tag, admin: true },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings, admin: true },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [store, setStore] = useState(null);
  const session = useSession();
  const isAdmin = session.user?.role === 'admin';
  const { data, role } = useDashboard();
  const notifs = useNotifications(data, role, session.user?.email || '');

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
    setConfirmLogout(false);
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch {}
    window.localStorage.removeItem('mps-role');
    window.location.href = '/';
  };

  if (session.loading) {
    return <div className="dash" data-theme={theme}><Loader text="Checking your session…" /></div>;
  }
  if (!session.user && !session.demo) return null;

  const changeTheme = () => { const t = theme === 'light' ? 'dark' : 'light'; setTheme(t); window.localStorage.setItem('mps-theme', t); };

  const me = session.user ? { name: session.user.name, email: session.user.email } : (store?.profile || { name: 'Abubakar', email: 'chabubakar78690@gmail.com' });
  const titles = { '/dashboard': 'Overview', '/dashboard/licenses': 'Licenses', '/dashboard/downloads': 'Downloads', '/dashboard/billing': 'Payments', '/dashboard/profile': 'Profile', '/dashboard/admin/users': 'Users', '/dashboard/admin/pricing': 'Pricing', '/dashboard/admin/settings': 'Settings' };
  const title = titles[pathname] || 'Dashboard';

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
          <button className="dash-logout" onClick={() => setConfirmLogout(true)} title="Log out" aria-label="Log out"><LogOut size={17} /></button>
        </div>
        <button className="dash-collapse-float" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
        </button>
      </aside>

      <div className="dash-main">
        <header className="dash-top">
          <button className="dash-icon-btn dash-menu-btn" onClick={() => setDrawer(true)} aria-label="Open menu"><Menu size={19} /></button>
          <div className="dash-title"><h1>{title}</h1></div>
          <div className="dash-top-right">
            {isAdmin && <Link className="dash-icon-btn dash-top-link" href="/dashboard/admin/settings" title="Login & signup keys (OAuth)" aria-label="Login and signup keys"><KeyRound size={18} /></Link>}
            <button className="dash-icon-btn" onClick={changeTheme} aria-label="Toggle light / dark mode" title="Light / dark mode">{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
            <div className="dash-notif">
              <button className="dash-icon-btn" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications" title="Notifications"><Mail size={18} />{notifs.unread > 0 && <span className="dot" />}</button>
              {notifOpen && (
                <div className="dash-notif-pop">
                  <div className="n-head"><h4>Notifications</h4>{notifs.unread > 0 && <button onClick={() => notifs.markAllRead()}>Mark all read</button>}</div>
                  {notifs.items.length === 0 && <p className="n-empty">No notifications yet — activity on your account will show up here.</p>}
                  {notifs.items.map((n) => (
                    <div key={n.id} className={`n-item ${n.unread ? 'unread' : ''}`} onClick={() => { notifs.markRead(n.id); setNotifOpen(false); router.push(n.href); }}>
                      <span className="n-text">{n.text}<small>{n.when}</small></span>
                      <button className="n-del" aria-label="Delete notification" title="Delete" onClick={(e) => { e.stopPropagation(); notifs.dismiss(n.id); }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Link className="dash-avatar" href="/dashboard/profile" title={me.name}>{me.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</Link>
          </div>
        </header>
        <main className="dash-body">{children}</main>
      </div>

      {confirmLogout && (
        <div className="dash-modal-backdrop" onClick={() => setConfirmLogout(false)}>
          <div className="dash-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Log out?</h3>
            <p>You will be signed out of your dashboard. You can sign back in anytime from the website.</p>
            <div className="dash-modal-actions">
              <button className="dash-btn ghost" onClick={() => setConfirmLogout(false)}>Cancel</button>
              <button className="dash-btn danger" onClick={logout}>Log out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
