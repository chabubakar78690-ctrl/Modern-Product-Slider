'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useDashboard, useRole } from '../lib/useStore';
import { useNotifications } from '../lib/notifications';
import { usePagination, Pagination } from '../lib/Pagination';
import Loader from '../lib/Loader';

export default function NotificationsPage() {
  const { data, serverLoading, session } = useDashboard();
  const role = useRole();
  const router = useRouter();
  const [tab, setTab] = useState('all');
  const notifs = useNotifications(data, role, session.user?.email || '');
  const shown = tab === 'unread' ? notifs.items.filter((n) => n.unread) : notifs.items;
  const { pageItems, page, setPage, pages } = usePagination(shown, 10);

  if (serverLoading) return <Loader text="Loading notifications…" />;

  return (
    <>
      <div className="dash-card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <h3><Bell size={16} style={{ verticalAlign: -2, marginRight: 6 }} />All notifications</h3>
          <span className="badge blue">{notifs.unread} unread</span>
        </div>
        <p style={{ marginBottom: 16 }}>Everything about your account — licenses, payments and plugin updates. Click one to open it, or delete the ones you don&apos;t need.</p>
        <div className="dash-tabs" style={{ marginBottom: 0 }}>
          <button className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>All ({notifs.items.length})</button>
          <button className={tab === 'unread' ? 'on' : ''} onClick={() => setTab('unread')}>Unread ({notifs.unread})</button>
          <button onClick={() => notifs.markAllRead()} disabled={notifs.unread === 0}><CheckCheck size={14} style={{ verticalAlign: -2, marginRight: 4 }} />Mark all read</button>
        </div>
      </div>

      <div className="dash-card">
        {pageItems.length === 0 && <p className="dash-empty">{tab === 'unread' ? 'No unread notifications — you are all caught up.' : 'No notifications yet — activity on your account will show up here.'}</p>}
        {pageItems.map((n) => (
          <div key={n.id} className={`n-item ${n.unread ? 'unread' : ''}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px', borderRadius: 10, cursor: 'pointer', marginBottom: 4 }} onClick={() => { notifs.markRead(n.id); router.push(n.href); }}>
            <span className="n-text" style={{ flex: 1, fontSize: 14, lineHeight: 1.55 }}>{n.text}<small style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginTop: 2 }}>{n.when}</small></span>
            {n.unread && <span className="badge blue">New</span>}
            <button className="n-del" aria-label="Delete notification" title="Delete" style={{ border: 0, background: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4, borderRadius: 6, flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); notifs.dismiss(n.id); }}><Trash2 size={15} /></button>
          </div>
        ))}
        <Pagination page={page} pages={pages} onPage={setPage} />
      </div>
    </>
  );
}
