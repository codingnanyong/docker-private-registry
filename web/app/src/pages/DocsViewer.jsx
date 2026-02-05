import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { marked } from 'marked';
import BackLink from '../components/BackLink';
import '../styles/DocsViewer.css';

const DOCS = [
  { value: 'DOCKER_BASICS_GUIDE.md', label: 'DOCKER_BASICS_GUIDE.md - Docker & Docker Compose Basics' },
  { value: 'DOCKER_INSTALL_GUIDE.md', label: 'DOCKER_INSTALL_GUIDE.md - Docker Installation Guide' },
  { value: 'CERT_DOWNLOAD_GUIDE.md', label: 'CERT_DOWNLOAD_GUIDE.md - Certificate Download Guide' },
  { value: 'EXTERNAL_CLIENT_GUIDE.md', label: 'EXTERNAL_CLIENT_GUIDE.md - External Client Setup' },
  { value: 'REGISTRY_USAGE_GUIDE.md', label: 'REGISTRY_USAGE_GUIDE.md - Private Registry Usage Guide' },
];

export default function DocsViewer() {
  const [searchParams] = useSearchParams();
  const docFromUrl = searchParams.get('doc');
  const [selected, setSelected] = useState(docFromUrl || '');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (docFromUrl) setSelected(docFromUrl);
  }, [docFromUrl]);

  useEffect(() => {
    if (!selected) {
      setContent('');
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const url = `${window.location.origin}/docs/${selected}`;
    (async () => {
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const contentType = r.headers.get('content-type') || '';
        const text = await r.text();
        // SPA가 index.html을 돌려주면 문서가 비어 보임 → 안내
        if (!text || text.trim().length === 0) {
          throw new Error('Document is empty or not found on server.');
        }
        if (contentType.includes('text/html') && (text.trimStart().startsWith('<!') || text.trimStart().startsWith('<html'))) {
          throw new Error('Document not found. Check that the file exists in the server docs folder.');
        }
        const html = typeof marked.parse === 'function' ? await marked.parse(text) : marked(text);
        if (!cancelled) {
          setContent(html);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setContent('');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [selected]);

  return (
    <>
      <div className="doc-select-wrap">
        <select
          id="docSelector"
          className="doc-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          aria-label="Select document"
        >
          <option value="">Select a document...</option>
          {DOCS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
      </div>
      <div>
        {!selected && <p className="loading">Please select a document from the dropdown above.</p>}
        {loading && <p className="loading">Loading document...</p>}
        {error && <div className="error"><strong>Error loading document:</strong><br />{error}</div>}
        {content && !loading && (
          <div className="markdown-wrap">
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </div>
      <BackLink />
    </>
  );
}
