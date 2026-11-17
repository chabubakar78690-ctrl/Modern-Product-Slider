'use client';

import { useEffect, useState } from 'react';
import { useDashboard, useRole } from '../lib/useStore';
import { usePagination, Pagination } from '../lib/Pagination';
import Loader, { BtnSpinner } from '../lib/Loader';

export default function DownloadsPage() {
  const { data, update, refreshServer, serverLoading, session } = useDashboard();
  const role = useRole();
  const isAdmin = role === 'admin';
  const myActive = data.licenses.find((l) => l.status === 'Active');
  const hasActive = !!myActive;
  const freeV = data.freeVersion || { version: '1.0.0', file: 'modern-product-slider-free.zip', size: '—', date: '', notes: 'Free version: WooCommerce product sliders via shortcode and Gutenberg block.' };
  const { pageItems: versionPage, page: versionPageNo, setPage: setVersionPage, pages: versionPages } = usePagination(data.versions, 8);
  const [version, setVersion] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  // Real ZIP upload (admin): the file is stored in the database and served
  // by /api/download / /api/free-download, so no repo or FTP step is needed.
  const [zipKind, setZipKind] = useState('pro');
  const [zipVersion, setZipVersion] = useState('');
  const [zipFile, setZipFile] = useState(null);
  const [zipMsg, setZipMsg] = useState('');
  const [zipBusy, setZipBusy] = useState(false);
  const [storedZips, setStoredZips] = useState(null);

  const loadStoredZips = async () => {
    if (!isAdmin) return;
    try {
      const d = await (await fetch('/api/admin/uploads')).json();
      setStoredZips(d);
    } catch {}
  };
  useEffect(() => { loadStoredZips(); }, [isAdmin]);

  const uploadZip = async (e) => {
    e.preventDefault();
    if (!zipFile) { setZipMsg('Please choose a .zip file first.'); return; }
    setZipBusy(true);
    setZipMsg('');
    try {
      const form = new FormData();
      form.append('kind', zipKind);
      form.append('version', zipVersion.trim());
      form.append('file', zipFile);
      const res = await fetch('/api/admin/upload-plugin', { method: 'POST', body: form });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'upload failed');
      setZipMsg(`${zipKind === 'pro' ? 'Pro' : 'Free'} ZIP uploaded: ${d.file} (v${d.version}, ${d.size}). ${zipKind === 'pro' ? 'It is now the current Pro version — downloads work right away.' : 'The free download now serves this file.'}`);
      setZipFile(null);
      setZipVersion('');
      e.target.reset();
      await loadStoredZips();
      await refreshServer();
    } catch (err) {
      setZipMsg('Upload failed: ' + err.message);
    } finally { setZipBusy(false); }
  };

  const upload = async (e) => {
    e.preventDefault();
    if (!version.trim() || !fileName) { setMsg('Enter a version number and choose a ZIP file.'); return; }
    setBusy(true);
    try {
      const res = await fetch('/api/admin/versions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: version.trim(), file: fileName, notes: notes.trim() || 'Pro release.' }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'publish failed');
      await refreshServer();
      setMsg(`Version ${version.trim()} published on the server. Stores with an active license will now see this update in WordPress. The download serves the Pro ZIP built from the repo on deploy — or the ZIP you uploaded above, if you uploaded one for this version.`);
    } catch (err) {
      if (!session.demo) { setMsg('Could not publish on the server: ' + err.message); return; }
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
          <h3>Upload plugin ZIP</h3>
          <p style={{ marginBottom: 16 }}>Upload the actual ZIP file here — Free or Pro. It is stored on the server and served straight away: the Pro ZIP becomes the current version for license-gated downloads, the Free ZIP replaces the free download. (The Pro ZIP is also built automatically from the repo on every deploy, so this is only needed when you want a different file.) Max ~4 MB.</p>
          {storedZips && (
            <p style={{ marginBottom: 14, fontSize: 13, color: '#5b6b82' }}>
              Stored now: Free — {storedZips.free ? `${storedZips.free.file} (v${storedZips.free.version}, ${storedZips.free.size})` : 'built from repo'} · Pro — {storedZips.pro ? `${storedZips.pro.file} (v${storedZips.pro.version}, ${storedZips.pro.size})` : 'built from repo'}
            </p>
          )}
          {zipMsg && <p className="dash-note green">{zipMsg}</p>}
          <form onSubmit={uploadZip}>
            <div className="dash-row">
              <div className="dash-field"><label htmlFor="zipkind">Which plugin</label>
                <select id="zipkind" value={zipKind} onChange={(e) => setZipKind(e.target.value)} style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid #dbe7f3', fontSize: 14, fontFamily: 'inherit', width: '100%' }}>
                  <option value="pro">Pro plugin</option>
                  <option value="free">Free plugin</option>
                </select>
              </div>
              <div className="dash-field"><label htmlFor="zipver">Version</label><input id="zipver" value={zipVersion} onChange={(e) => setZipVersion(e.target.value)} placeholder={zipKind === 'pro' ? '2.2.3' : '1.0.0'} /></div>
              <div className="dash-field"><label htmlFor="zipfile">ZIP file</label><input id="zipfile" type="file" accept=".zip" onChange={(e) => setZipFile(e.target.files?.[0] || null)} /></div>
            </div>
            <button className="dash-btn blue" type="submit" disabled={zipBusy}>{zipBusy ? <><BtnSpinner />Uploading…</> : 'Upload ZIP'}</button>
          </form>
        </div>
      )}

      {isAdmin && (
        <div className="dash-card" style={{ marginBottom: 20 }}>
          <h3>Publish a new Pro version</h3>
          <p style={{ marginBottom: 16 }}>Publish a Pro version number. It becomes the current version immediately — only stores with an active license can download it or update from WordPress. The ZIP itself is built from the repo on every deploy, or use the Upload plugin ZIP card above to upload a specific file.</p>
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

      {!isAdmin && (
        <div className="dash-card" style={{ marginBottom: 20 }}>
          <div className="card-head"><h3>Free version</h3><span className="badge blue">No license needed</span></div>
          <p style={{ marginBottom: 6 }}><b>Free v{freeV.version}</b> — {freeV.notes}</p>
          <p style={{ marginBottom: 14 }}>Released {freeV.date} · {freeV.size} · {freeV.file}</p>
          <a className="dash-btn blue sm" href="/api/free-download">Download Free v{freeV.version}</a>
        </div>
      )}

      <div className="dash-card">
        <div className="card-head"><h3>Pro versions</h3><span className="badge blue">{data.versions.length} releases</span></div>
        <div className="dash-table-wrap"><table className="dash-table"><thead><tr><th>Version</th><th>Released</th><th>File</th><th>Size</th><th>Release notes</th><th></th></tr></thead><tbody>
          {versionPage.map((v) => (
            <tr key={v.version}>
              <td><b>v{v.version}</b> {v.current && <span className="badge blue">Current</span>}</td><td>{v.date}</td><td className="mono">{v.file}</td><td>{v.size}</td><td style={{ maxWidth: 260 }}>{v.notes}</td>
              <td>{(isAdmin || hasActive) ? <button className="dash-btn blue sm" onClick={() => download(v)}>Download</button> : <span className="badge grey">Locked</span>}</td>
            </tr>
          ))}
        </tbody></table></div>
        <Pagination page={versionPageNo} pages={versionPages} onPage={setVersionPage} />
      </div>
    </>
  );
}
