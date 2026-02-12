import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  REGISTRY_HOST,
  reconstructDockerfile,
  downloadFile,
  buildCommands,
} from '../utils/registry';
import { useLang } from '../context/LangContext';
import '../styles/RegistryList.css';

export default function RegistryList() {
  const { lang } = useLang();
  const t = (en, ko) => (lang === 'en' ? en : ko);
  const [repos, setRepos] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [commandsModal, setCommandsModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const loadRepositories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v2/_catalog');
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      const names = data.repositories || [];
      const withTags = await Promise.all(
        names.map(async (name) => {
          try {
            const r = await fetch(`/api/v2/${name}/tags/list`);
            if (!r.ok) return null;
            const d = await r.json();
            if (!d.tags || d.tags.length === 0) return null;
            const sorted = [...d.tags].sort((a, b) => {
              if (a === 'latest' && b !== 'latest') return -1;
              if (a !== 'latest' && b === 'latest') return 1;
              return a.localeCompare(b);
            });
            return { name, tags: sorted };
          } catch {
            return null;
          }
        })
      );
      const valid = withTags.filter(Boolean);
      const initialTags = {};
      valid.forEach((r) => {
        initialTags[r.name] = r.tags.includes('latest') ? 'latest' : r.tags[0];
      });
      setRepos(valid);
      setSelectedTags((prev) => ({ ...initialTags, ...prev }));
    } catch (err) {
      setError(err.message);
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRepositories();
  }, [loadRepositories]);

  const filteredRepos = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return repos;
    return repos.filter((r) => r.name.toLowerCase().includes(term));
  }, [repos, search]);

  const getTag = (repoName) => selectedTags[repoName] || 'latest';

  const setTag = (repoName, tag) => {
    setSelectedTags((prev) => ({ ...prev, [repoName]: tag }));
  };

  const downloadDockerfile = async (repoName) => {
    const tag = getTag(repoName);
    try {
      const manifestRes = await fetch(`/api/v2/${repoName}/manifests/${tag}`, {
        headers: { Accept: 'application/vnd.docker.distribution.manifest.v2+json' },
      });
      if (!manifestRes.ok) throw new Error(manifestRes.status);
      const manifest = await manifestRes.json();
      const configDigest = manifest.config?.digest;
      if (!configDigest) throw new Error('Config digest not found');
      const configRes = await fetch(`/api/v2/${repoName}/blobs/${configDigest}`);
      if (!configRes.ok) throw new Error(configRes.status);
      const config = await configRes.json();
      const content = reconstructDockerfile(config, repoName, tag);
      downloadFile(content, 'Dockerfile');
    } catch (err) {
      alert(lang === 'en' ? `Error downloading Dockerfile: ${err.message}` : `Dockerfile 다운로드 오류: ${err.message}`);
    }
  };

  const showCommands = (repoName) => {
    const tag = getTag(repoName);
    setCommandsModal({ repoName, tag, commands: buildCommands(repoName, tag) });
  };

  const copyCommands = (repoName) => {
    const tag = getTag(repoName);
    const line = `docker pull ${REGISTRY_HOST}/${repoName}:${tag}`;
    navigator.clipboard.writeText(line).then(() => alert(lang === 'en' ? '✅ Commands copied to clipboard!' : '✅ 명령이 클립보드에 복사되었습니다!'));
  };

  const copyAllCommands = (repoName) => {
    const tag = getTag(repoName);
    navigator.clipboard.writeText(buildCommands(repoName, tag)).then(() => alert(lang === 'en' ? '✅ Commands copied to clipboard!' : '✅ 명령이 클립보드에 복사되었습니다!'));
  };

  const deleteTag = async (repoName, tag) => {
    if (!window.confirm(lang === 'en' ? `⚠️ Delete tag "${repoName}:${tag}" only? This cannot be undone.` : `⚠️ 태그 "${repoName}:${tag}"만 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setDeleting(repoName);
    try {
      const mRes = await fetch(`/api/v2/${repoName}/manifests/${tag}`, {
        headers: { Accept: 'application/vnd.docker.distribution.manifest.v2+json' },
      });
      if (!mRes.ok) throw new Error(mRes.status);
      const digest = mRes.headers.get('docker-content-digest');
      if (!digest) throw new Error('Manifest digest not found');
      const delRes = await fetch(`/api/v2/${repoName}/manifests/${digest}`, { method: 'DELETE' });
      if (!delRes.ok && delRes.status !== 202) throw new Error(delRes.status);
      alert(lang === 'en' ? `Tag "${tag}" deleted. Run Garbage Collection to free disk space.` : `태그 "${tag}"가 삭제되었습니다. 디스크 정리를 위해 Garbage Collection을 실행하세요.`);
      setTimeout(loadRepositories, 500);
    } catch (err) {
      alert(lang === 'en' ? `Delete failed: ${err.message}` : `삭제 실패: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const runGC = () => {
    const cmd = 'docker exec registry registry garbage-collect /etc/docker/registry/config.yml';
    alert(lang === 'en' ? `Run Garbage Collection:\n\n${cmd}` : `가비지 컬렉션 실행:\n\n${cmd}`);
    navigator.clipboard.writeText(cmd).catch(() => {});
  };

  if (loading) return <div className="loading">{t('Loading repositories...', '저장소 불러오는 중...')}</div>;
  if (error) return <div className="error"><strong>{t('Error:', '오류:')}</strong> {error}</div>;

  return (
    <>
      <div className="search-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('🔍 Search repositories...', '🔍 저장소 검색...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="search-stats">
            <span id="searchCount">{filteredRepos.length}</span> / <span id="totalCount">{repos.length}</span> {t('repositories', '저장소')}
          </div>
        </div>
      </div>

      <div className="top-controls">
        <div className="control-buttons">
          <button type="button" className="refresh-btn-icon" onClick={() => loadRepositories()} title={t('Refresh', '새로고침')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" /><path d="M1 20v-6h6" />
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
            </svg>
          </button>
          <button type="button" className="gc-btn-icon" onClick={runGC} title="Run Garbage Collection">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      <div id="repoList" className="repo-list">
        {filteredRepos.length === 0 ? (
          <div className="no-repos">{t('No repositories found.', '저장소가 없습니다.')}</div>
        ) : (
          filteredRepos.map((repo) => (
            <div key={repo.name} className="repo-card">
              <div className="repo-card-header">
                <div className="repo-card-content">
                  <div className="repo-name" title={repo.name}>{repo.name}</div>
                  <div className="repo-tags-row">
                    <span className="tag-label">Tag</span>
                    <select
                      className="tag-select-native"
                      value={getTag(repo.name)}
                      onChange={(e) => setTag(repo.name, e.target.value)}
                    >
                      {repo.tags.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="repo-card-actions">
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => deleteTag(repo.name, getTag(repo.name))}
                    disabled={deleting === repo.name}
                    title={t('Delete this tag only', '이 태그만 삭제')}
                  >
                    {deleting === repo.name ? '...' : `🗑️ ${t('Delete', '삭제')}`}
                  </button>
                </div>
              </div>
              <div className="repo-card-actions-wrap">
                <div className="download-buttons">
                  <button type="button" className="download-btn dockerfile-btn" onClick={() => downloadDockerfile(repo.name)}>
                    <span className="btn-icon">🐳</span>
                    <span className="btn-text">Dockerfile</span>
                  </button>
                  <button type="button" className="command-btn" onClick={() => showCommands(repo.name)}>
                    <span className="btn-icon">💻</span>
                    <span className="btn-text">{t('Commands', '명령어')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {commandsModal && (
        <div
          className="command-modal"
          style={{ display: 'flex' }}
          onClick={(e) => e.target === e.currentTarget && setCommandsModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="command-modal-content">
            <div className="command-modal-header">
              <h3>💻 {t('Download Commands', '다운로드 명령어')}</h3>
              <button type="button" className="command-modal-close" onClick={() => setCommandsModal(null)}>×</button>
            </div>
            <div className="command-modal-body">
              <pre className="command-code">{commandsModal.commands}</pre>
              <div className="command-actions">
                <button type="button" className="copy-btn" onClick={() => copyCommands(commandsModal.repoName)}>
                  📋 {t('Copy Commands', '명령어 복사')}
                </button>
                <button type="button" className="copy-btn" onClick={() => copyAllCommands(commandsModal.repoName)}>
                  📋 {t('Copy All', '전체 복사')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
