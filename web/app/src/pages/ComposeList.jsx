import { useState, useEffect, useMemo } from 'react';
import {
  getComposeApiUrl,
  parseComposeFilesFromHtml,
  downloadBlob,
  sortWithPinnedFirst,
} from '../utils/compose';
import BackLink from '../components/BackLink';
import '../styles/ComposeList.css';

const TOAST_DURATION_MS = 3000;

export default function ComposeList() {
  const [allFiles, setAllFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const baseUrl = getComposeApiUrl();
    fetch(baseUrl)
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.text();
      })
      .then((html) => {
        const list = parseComposeFilesFromHtml(html, baseUrl);
        if (list.length === 0 && html.includes('<!')) {
          setError('Compose file list could not be read. The server may have returned the app page instead of the /docker/ directory.');
        } else {
          setError(null);
        }
        setAllFiles(list);
      })
      .catch((err) => {
        setError('Error loading compose files. Make sure the /docker directory is mounted and accessible.');
        setAllFiles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredFiles = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return [...allFiles];
    return sortWithPinnedFirst(
      allFiles.filter((f) => f.name.toLowerCase().includes(term))
    );
  }, [allFiles, search]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  };

  const downloadCompose = async (url, filename) => {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('Download failed');
      const blob = await r.blob();
      downloadBlob(blob, filename);
      showToast(`Downloaded: ${filename}`, 'success');
    } catch {
      showToast('Error downloading file', 'error');
    }
  };

  const viewCompose = async (url, filename) => {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('Failed to load file');
      const content = await r.text();
      setViewModal({ filename, content });
    } catch {
      showToast('Error loading file', 'error');
    }
  };

  const copyContent = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast('Content copied!', 'success'))
      .catch(() => showToast('Copy failed', 'error'));
  };

  if (loading) return <div className="loading">Loading compose files...</div>;
  if (error && allFiles.length === 0) return <div className="error">{error}</div>;

  return (
    <>
      <div className="search-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search compose files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="search-stats">
            {filteredFiles.length} / {allFiles.length} files
          </div>
        </div>
        <div className="env-notice">
          ⚠️ Create a <strong>.env</strong> file and set required environment variables before use.
        </div>
      </div>

      <div id="composeList" className="compose-list">
        {filteredFiles.length === 0 ? (
          <div className="no-results">No compose files found matching your search.</div>
        ) : (
          filteredFiles.map((file) => (
            <div key={file.name} className="compose-card">
              <div className="compose-card-header">
                <div className="compose-icon">📦</div>
                <div className="compose-card-content">
                  <div className="compose-name" title={file.name}>{file.name}</div>
                  <div className="compose-path">{file.path}</div>
                </div>
              </div>
              <div className="compose-card-actions-wrap">
                <div className="compose-actions">
                  <button type="button" className="compose-download-btn" onClick={() => downloadCompose(file.url, file.name)}>
                    <span className="btn-icon">⬇</span>
                    <span className="btn-text">Download</span>
                  </button>
                  <button type="button" className="compose-view-btn" onClick={() => viewCompose(file.url, file.name)}>
                    <span className="btn-icon">👁</span>
                    <span className="btn-text">View</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {viewModal && (
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && setViewModal(null)}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h3>{viewModal.filename}</h3>
              <button type="button" className="modal-close" onClick={() => setViewModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <pre><code>{viewModal.content}</code></pre>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setViewModal(null)}>Close</button>
              <button type="button" className="btn btn-primary" onClick={() => copyContent(viewModal.content)}>
                Copy Content
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.msg}
        </div>
      )}

      <BackLink />
    </>
  );
}
