'use client';

import { useState } from 'react';
import { useDashboard, useRole } from '../lib/useStore';
import Loader, { BtnSpinner } from '../lib/Loader';

export default function DownloadsPage() {
  const { data, update, refreshServer, serverLoading } = useDashboard();
  const role = useRole();
  const isAdmin = role === 'admin';
  const myActive = data.licenses.find((l) => l.status === 'Active');
  const hasActive = !!myActive;
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const upload = async (e) => {
    e.preventDefault();
    if (!version.trim() || !fileName) { setMsg('Enter a version number and choose a ZIP file.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/versions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: version.trim(), file: fileName, notes: notes.trim() || 'Pro release.' }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'publish failed');
      await refreshServer();
      setMsg(`Version ${version.trim()} published on the server. Stores with an active license will now see this update in WordPress. Remember: the ZIP file itself must also be in the downloads/ folder of the repo, or the download will 404.`);
    } catch (err) {
      update((d) => ({
        ...d,
        versions: [
          { version: version.trim(), date: new Date().toISOString().slice(0, 10), file: fileName, size: '—', current: true, notes: notes.trim() || 'Pro release.' },
          ...d.versions.map((v) => ({ ...v, current: false })),
        ],
      }));
      setMsg(`Version ${version.trim()} saved locally only (${err.message}). Publish it again once the server is reachable.`);
    } finally {
      setBusy(false);
      setVersion(''); setNotes(''); setFileName('');
    }
  };

  const download = (v) => {
    if (isAdmin) { window.location.href = '/api/download'; return; }
    if (!hasActive) return;
    window.location.href = `/api/download?key=${encodeURIComponent(myActive.key)}&domain=${encodeURIComponent(myActive.domain)}`;
  };

  if (serverLoading) return <Loader text="Loading versions…" />;

  return (
    <>
      {msg && <p className="dash-note green">{msg}</p>}
      {!isAdmin && !hasActive && (
        <p className="dash-note amber">Your license is not active, so Pro downloads are locked. Activate a license on the Licenses page, or upgrade your plan on the Billing page — then the Pro ZIP unlocks here.</p>
      )}
      {isAdmin && (
        <div className="dash-card" style={{ marginBottom: 20 }}>
          <h3>Upload a new Pro version</h3>
          <p style={{ marginBottom: 16 }}>Publish a Pro version. It becomes the current version immediately — only stores with an active license can download it or update from WordPress. The ZIP file itself must be in the <code>downloads/</code> folder of the repo (same file name as below), otherwise the download returns 404.</p>
          <form onSubmit={upload}>
            <div className="dash-row">
              <div className="dash-field"><label htmlFor="ver">Version</label><input id="ver" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="2.2.0" /></div>
              <div className="dash-field"><label htmlFor="zip">Pro ZIP file</label><input id="zip" type="file" accept=".zip" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} /></div>
            </div>
            <div className="dash-field"><label htmlFor="notes">Release notes</label><textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What changed in this version?" /></div>
            <button className="dash-btn blue" type="submit" disabled={busy}>{busy ? <><BtnSpinner />Publishing…</> : 'Publish version'}</button>
          </form>
        </div>
      )}

      <div className="dash-card">
        <div className="card-head"><h3>Plugin versions</h3><span className="badge blue">{data.versions.length} releases</span></div>
        <div className="dash-table-wrap"><table className="dash-table"><thead><tr><th>Version</th><th>Released</th><th>File</th><th>Size</th><th>Release notes</th><th></th></tr></thead><tbody>
          {data.versions.map((v) => (
            <tr key={v.version}>
              <td><b>v{v.version}</b> {v.current && <span className="badge blue">Current</span>}</td><td>{v.date}</td><td className="mono">{v.file}</td><td>{v.size}</td><td style={{ maxWidth: 260 }}>{v.notes}</td>
              <td>{(isAdmin || hasActive) ? <button className="dash-btn blue sm" onClick={() => download(v)}>Download</button> : <span className="badge grey">Locked</span>}</td>
            </tr>
          ))}
        </tbody></table></div>
      </div>
    </>
  );
}
