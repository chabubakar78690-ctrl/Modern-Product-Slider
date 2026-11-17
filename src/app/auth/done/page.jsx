'use client';

// Landing page for the OAuth new-tab flow: Google/Facebook sign-in opens
// in a new tab, and this page closes that tab and sends the original tab
// to the dashboard. If there is no opener (or the tab can't close), it
// just goes to the dashboard itself.
import { useEffect, useState } from 'react';

export default function AuthDone() {
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) { setError(err); return; }
    if (window.opener && !window.opener.closed) {
      try { window.opener.location.href = '/dashboard'; } catch {}
      window.close();
      // If the browser blocks closing, fall back to the dashboard here.
      setTimeout(() => { window.location.href = '/dashboard'; }, 1200);
    } else {
      window.location.href = '/dashboard';
    }
  }, []);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif', background: '#f8fafc', padding: 24 }}>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 32, maxWidth: 420, textAlign: 'center', boxShadow: '0 10px 30px rgba(8,26,61,.08)' }}>
        {error ? (
          <>
            <h1 style={{ fontSize: 20, margin: '0 0 8px', color: '#081a3d' }}>Sign-in failed</h1>
            <p style={{ color: '#b91c1c', margin: '0 0 20px' }}>{error}</p>
            <p style={{ color: '#5b6b82', fontSize: 14, margin: '0 0 20px' }}>Close this tab and try again from the first tab — email sign-in works there too.</p>
            <button onClick={() => window.close()} style={{ background: '#0ea5e9', color: '#fff', border: 0, borderRadius: 10, padding: '11px 20px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Close this tab</button>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 20, margin: '0 0 8px', color: '#081a3d' }}>Signed in ✓</h1>
            <p style={{ color: '#5b6b82', margin: '0 0 20px' }}>Opening your dashboard… you can close this tab.</p>
            <a href="/dashboard" style={{ background: '#0ea5e9', color: '#fff', borderRadius: 10, padding: '11px 20px', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Go to dashboard</a>
          </>
        )}
      </div>
    </main>
  );
}
