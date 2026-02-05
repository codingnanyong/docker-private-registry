import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { marked } from 'marked';
import BackLink from '../components/BackLink';
import '../styles/DocsViewer.css';

const DOCS = [
  { id: 'docker-basics', file: 'DOCKER_BASICS_GUIDE.md', labelKo: 'Docker & Docker Compose 기본', labelEn: 'Docker & Docker Compose Basics' },
  { id: 'docker-install', file: 'DOCKER_INSTALL_GUIDE.md', labelKo: 'Docker 설치 가이드', labelEn: 'Docker Installation Guide' },
  { id: 'cert-download', file: 'CERT_DOWNLOAD_GUIDE.md', labelKo: '인증서 다운로드 가이드', labelEn: 'Certificate Download Guide' },
  { id: 'external-client', file: 'EXTERNAL_CLIENT_GUIDE.md', labelKo: '외부 클라이언트 설정', labelEn: 'External Client Setup' },
  { id: 'registry-usage', file: 'REGISTRY_USAGE_GUIDE.md', labelKo: 'Private Registry 사용 가이드', labelEn: 'Private Registry Usage Guide' },
];

const DOCS_DIR = { ko: 'KOR', en: 'ENG' };

// Legacy URL params (old _KR/_EN filenames or base name) → id + lang
const LEGACY_FILE_TO_ID = {
  'DOCKER_BASICS_GUIDE.md': 'docker-basics',
  'DOCKER_BASICS_GUIDE_KR.md': 'docker-basics',
  'DOCKER_BASICS_GUIDE_EN.md': 'docker-basics',
  'DOCKER_INSTALL_GUIDE.md': 'docker-install',
  'DOCKER_INSTALL_GUIDE_KR.md': 'docker-install',
  'DOCKER_INSTALL_GUIDE_EN.md': 'docker-install',
  'CERT_DOWNLOAD_GUIDE.md': 'cert-download',
  'CERT_DOWNLOAD_GUIDE_KR.md': 'cert-download',
  'CERT_DOWNLOAD_GUIDE_EN.md': 'cert-download',
  'EXTERNAL_CLIENT_GUIDE.md': 'external-client',
  'EXTERNAL_CLIENT_GUIDE_KR.md': 'external-client',
  'EXTERNAL_CLIENT_GUIDE_EN.md': 'external-client',
  'REGISTRY_USAGE_GUIDE.md': 'registry-usage',
  'REGISTRY_USAGE_GUIDE_KR.md': 'registry-usage',
  'REGISTRY_USAGE_GUIDE_EN.md': 'registry-usage',
};

function getInitialState(searchParams) {
  const docParam = searchParams.get('doc') || '';
  const langParam = searchParams.get('lang') || 'ko';
  const lang = langParam === 'en' ? 'en' : 'ko';
  if (LEGACY_FILE_TO_ID[docParam]) {
    const id = LEGACY_FILE_TO_ID[docParam];
    const l = docParam.endsWith('_EN.md') ? 'en' : 'ko';
    return { id, lang: l };
  }
  const byId = DOCS.find((d) => d.id === docParam);
  if (byId) return { id: docParam, lang };
  return { id: '', lang };
}

export default function DocsViewer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState(() => getInitialState(searchParams));
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { id: selectedId, lang: selectedLang } = state;
  const selectedDoc = DOCS.find((d) => d.id === selectedId);
  const filename = selectedDoc
    ? `${DOCS_DIR[selectedLang]}/${selectedDoc.file}`
    : '';

  useEffect(() => {
    const next = getInitialState(searchParams);
    setState((prev) => (prev.id !== next.id || prev.lang !== next.lang ? next : prev));
  }, [searchParams]);

  useEffect(() => {
    if (!filename) {
      setContent('');
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    const url = `${window.location.origin}/docs/${filename}`;
    (async () => {
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const contentType = r.headers.get('content-type') || '';
        const text = await r.text();
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
  }, [filename]);

  const setDoc = (id) => {
    const next = { ...state, id };
    setState(next);
    setSearchParams({ doc: id, lang: next.lang }, { replace: true });
  };

  const setLang = (lang) => {
    const next = { ...state, lang };
    setState(next);
    setSearchParams({ doc: state.id, lang }, { replace: true });
  };

  const label = (d) => (selectedLang === 'en' ? d.labelEn : d.labelKo);

  return (
    <>
      <div className="doc-controls">
        <div className="doc-lang-wrap">
          <span className="doc-lang-label">Language / 언어:</span>
          <div className="doc-lang-buttons">
            <button
              type="button"
              className={`doc-lang-btn ${selectedLang === 'en' ? 'active' : ''}`}
              onClick={() => setLang('en')}
              aria-pressed={selectedLang === 'en'}
            >
              English
            </button>
            <button
              type="button"
              className={`doc-lang-btn ${selectedLang === 'ko' ? 'active' : ''}`}
              onClick={() => setLang('ko')}
              aria-pressed={selectedLang === 'ko'}
            >
              한국어
            </button>
          </div>
        </div>
        <div className="doc-select-wrap">
          <select
            id="docSelector"
            className="doc-select"
            value={selectedId}
            onChange={(e) => setDoc(e.target.value)}
            aria-label={selectedLang === 'en' ? 'Select document' : '문서 선택'}
          >
            <option value="">{selectedLang === 'en' ? 'Select a document...' : '문서를 선택하세요...'}</option>
            {DOCS.map((d) => (
              <option key={d.id} value={d.id}>{label(d)}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        {!selectedId && <p className="loading">{selectedLang === 'en' ? 'Please select a document from the dropdown above.' : '위에서 문서를 선택하세요.'}</p>}
        {loading && <p className="loading">{selectedLang === 'en' ? 'Loading document...' : '문서 로딩 중...'}</p>}
        {error && (
          <div className="error">
            <strong>{selectedLang === 'en' ? 'Error loading document:' : '문서 로드 오류:'}</strong>
            <br />{error}
          </div>
        )}
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
