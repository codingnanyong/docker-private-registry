import { useState, useEffect, useMemo } from 'react';
import {
  getComposeApiUrl,
  parseComposeFilesFromHtml,
  downloadBlob,
  sortWithPinnedFirst,
} from '../utils/compose';
import { useLang } from '../context/LangContext';
import '../styles/ComposeList.css';

const TOAST_DURATION_MS = 3000;

export default function ComposeList() {
  const { lang } = useLang();
  const t = (en, ko) => (lang === 'en' ? en : ko);
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
          setError('list_unreadable');
        } else {
          setError(null);
        }
        setAllFiles(list);
      })
      .catch((err) => {
        setError('load_failed');
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
      showToast(lang === 'en' ? `Downloaded: ${filename}` : `다운로드됨: ${filename}`, 'success');
    } catch {
      showToast(t('Error downloading file', '파일 다운로드 실패'), 'error');
    }
  };

  const viewCompose = async (url, filename) => {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error('Failed to load file');
      const content = await r.text();
      setViewModal({ filename, content });
    } catch {
      showToast(t('Error loading file', '파일 불러오기 실패'), 'error');
    }
  };

  const copyContent = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast(t('Content copied!', '내용이 복사되었습니다!'), 'success'))
      .catch(() => showToast(t('Copy failed', '복사 실패'), 'error'));
  };

  const errorMessages = {
    list_unreadable: t('Compose file list could not be read. The server may have returned the app page instead of the /docker/ directory.', '컴포즈 파일 목록을 읽을 수 없습니다. 서버가 /docker/ 디렉터리 대신 앱 페이지를 반환했을 수 있습니다.'),
    load_failed: t('Error loading compose files. Make sure the /docker directory is mounted and accessible.', '컴포즈 파일을 불러오는 데 실패했습니다. /docker 디렉터리가 마운트되어 있는지 확인하세요.'),
  };

  if (loading) return <div className="loading">{t('Loading compose files...', '컴포즈 파일 불러오는 중...')}</div>;
  if (error && allFiles.length === 0) return <div className="error">{errorMessages[error] || error}</div>;

  return (
    <>
      <div className="search-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('🔍 Search compose files...', '🔍 컴포즈 파일 검색...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="search-stats">
            {filteredFiles.length} / {allFiles.length} {t('files', '파일')}
          </div>
        </div>
        <div className="env-notice">
          ⚠️ {t('Create a .env file and set required environment variables before use.', '사용 전 .env 파일을 만들고 필요한 환경 변수를 설정하세요.')}
        </div>
      </div>

      <div id="composeList" className="compose-list">
        {filteredFiles.length === 0 ? (
          <div className="no-results">{t('No compose files found matching your search.', '검색 결과에 맞는 컴포즈 파일이 없습니다.')}</div>
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
                    <span className="btn-text">{t('Download', '다운로드')}</span>
                  </button>
                  <button type="button" className="compose-view-btn" onClick={() => viewCompose(file.url, file.name)}>
                    <span className="btn-icon">👁</span>
                    <span className="btn-text">{t('View', '보기')}</span>
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
              <button type="button" className="btn btn-secondary" onClick={() => setViewModal(null)}>{t('Close', '닫기')}</button>
              <button type="button" className="btn btn-primary" onClick={() => copyContent(viewModal.content)}>
                {t('Copy Content', '내용 복사')}
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
    </>
  );
}
