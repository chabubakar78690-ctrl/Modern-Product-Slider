'use client';

import { useState } from 'react';
import { useDashboard, useRole } from '../lib/useStore';

export default function DownloadsPage() {
  const { data, update } = useDashboard();
  const role = useRole();
  const isAdmin = role === 'admin';
  const hasActive = data.licenses.some((l) => l.status === 'Active' && l.domain === 'saras-fashion.com');
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [msg, setMsg] = useState('');

  const upload = (e) => {
    e.preventDefault();
    if (!version.trim() || !fileName) { setMsg('Enter a version number and choose a ZIP file.'); return; }
    update((d) => ({
      ...d,
      versions: [
        { version: version.trim(), date: new Date().toISOString().slice(0, 10), file: fileName, size: '—', current: true, notes: notes.trim() || 'Pro release.' },
        ...d.versions.map((v) => ({ ...v, current: false })),
      ],
    }));
    setMsg(`Version ${version.trim()} published. Stores with an active license will now see this update in WordPress.`);
    setVersion(''); setNotes(''); setFileName('');
  };

  const download = (v) => {
    if (!isAdmin && !hasActive) return;
    setMsg(`Demo download: ${v.file} — in the live app this serves the real Pro ZIP from secure storage. Your license is checked first.`);
  };

  return (
    <>
      {msg && <p className="dash-note green">{msg}</p>}
      {!isAdmin && !hasActive && (
        <p className="dash-note amber">Your license is not active, so Pro downloads are locked. Activate a license on the Licenses page, or upgrade your plan on the Billing page — then the Pro ZIP unlocks here.</p>
      )}
      {isAdmin && (
        <div className="dash-card" style={{ marginBottom: 20 }}>
          <h3>Upload a new Pro version</h3>
          <p style={{ marginBottom: 16 }}>Upload the Pro add-on ZIP. It becomes the current version immediately — only stores with an active license can download it or update from WordPress. (Demo: the file metadata is saved; real file storage is a server step.)</p>
          <form onSubmit={upload}>
            <div className="dash-row">
              <div className="dash-field"><label htmlFor="ver">Version</label><input id="ver" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="2.2.0" /></div>
              <div className="dash-field"><label htmlFor="zip">Pro ZIP file</label><input id="zip" type="file" accept=".zip" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} /></div>
            </div>
            <div className="dash-field"><label htmlFor="notes">Release notes</label><textarea id="notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What changed in this version?" /></div>
            <button className="dash-btn blue" type="submit">Publish version</button>
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
