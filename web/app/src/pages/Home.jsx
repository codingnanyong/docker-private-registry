import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { getRegistryUrl, getCurlBaseUrl } from '../utils/urls';
import '../styles/Home.css';

const COPY_LABELS = { copy: { en: 'Copy', ko: '복사' }, copied: { en: 'Copied!', ko: '복사됨!' }, failed: { en: 'Failed', ko: '실패' } };

export default function Home() {
  const { lang } = useLang();
  const [copyKey, setCopyKey] = useState('copy');
  const [stats, setStats] = useState({
    totalImages: '-',
    estimatedSize: '-',
    totalTags: '-',
    largestImage: '-',
    loading: true,
    error: null,
  });

  const registryUrl = getRegistryUrl();
  const curlBase = getCurlBaseUrl();

  const copyRegistryUrl = async (e) => {
    e?.preventDefault();
    const onSuccess = () => {
      setCopyKey('copied');
      setTimeout(() => setCopyKey('copy'), 2000);
    };
    const onFailure = () => {
      setCopyKey('failed');
      setTimeout(() => setCopyKey('copy'), 2000);
    };
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(registryUrl);
        onSuccess();
        return;
      }
      const textarea = document.createElement('textarea');
      textarea.value = registryUrl;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, registryUrl.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (ok) onSuccess();
      else onFailure();
    } catch {
      onFailure();
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/v2/_catalog');
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        const repositories = data.repositories || [];
        if (cancelled) return;

        const totalImages = repositories.length;
        const estimatedSizeGB = (totalImages * 150 / 1024).toFixed(1);
        let totalTags = 0;
        const tagCounts = await Promise.all(
          repositories.map(async (repo) => {
            try {
              const r = await fetch(`/api/v2/${repo}/tags/list`);
              if (!r.ok) return 0;
              const d = await r.json();
              return (d.tags && d.tags.length) || 0;
            } catch {
              return 0;
            }
          })
        );
        totalTags = tagCounts.reduce((s, c) => s + c, 0);
        const largestImage = repositories.reduce((a, b) => (a.length > b.length ? a : b), '') || 'N/A';

        setStats({
          totalImages,
          estimatedSize: `~${estimatedSizeGB} GB`,
          totalTags,
          largestImage,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (!cancelled) setStats((s) => ({ ...s, loading: false, error: err.message }));
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const t = (en, ko) => (lang === 'en' ? en : ko);

  return (
    <div className="home-page">
      <div className="info-box home-intro">
        <strong>{t('Welcome.', '환영합니다.')}</strong>{' '}
        {t(
          'This server provides certificates, scripts, and docs for the Docker Private Registry. Use the sidebar to get started.',
          '이 서버는 Docker Private Registry용 인증서, 스크립트, 문서를 제공합니다. 사이드바에서 시작하세요.'
        )}
      </div>

      <div className="home-links" role="navigation" aria-label={t('Quick links', '바로가기')}>
        <Link to="/docs" className="home-link-tile" title={t('Documentation', '문서')}>
          <span className="home-link-icon" aria-hidden>📚</span>
          <span className="home-link-label">{t('Documentation', '문서')}</span>
        </Link>
        <Link to="/scripts" className="home-link-tile" title={t('Scripts', '스크립트')}>
          <span className="home-link-icon" aria-hidden>📜</span>
          <span className="home-link-label">{t('Scripts', '스크립트')}</span>
        </Link>
        <Link to="/certs" className="home-link-tile" title={t('Certificates', '인증서')}>
          <span className="home-link-icon" aria-hidden>🔐</span>
          <span className="home-link-label">{t('Certificates', '인증서')}</span>
        </Link>
        <Link to="/registry-list" className="home-link-tile" title={t('Image List', '이미지 목록')}>
          <span className="home-link-icon" aria-hidden>🐳</span>
          <span className="home-link-label">{t('Image List', '이미지 목록')}</span>
        </Link>
        <Link to="/compose-list" className="home-link-tile" title={t('Compose Files', '컴포즈 파일')}>
          <span className="home-link-icon" aria-hidden>📦</span>
          <span className="home-link-label">{t('Compose Files', '컴포즈 파일')}</span>
        </Link>
      </div>

      {stats.error == null && (
        <div className="registry-stats">
          <h2 className="registry-stats-title">{t('Registry Statistics', '레지스트리 통계')}</h2>
          {stats.loading ? (
            <div className="stats-loading"><p>{t('Loading...', '불러오는 중...')}</p></div>
          ) : (
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-label">{t('Images', '이미지')}</div>
                <div className="stat-number">{stats.totalImages}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">{t('Size', '용량')}</div>
                <div className="stat-number">{stats.estimatedSize}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">{t('Tags', '태그')}</div>
                <div className="stat-number">{stats.totalTags}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">{t('Largest Repo', '최대 저장소')}</div>
                <div className="stat-number">{stats.largestImage}</div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="registry-url-box">
        <span className="registry-url-label">
          <span className="registry-url-icon" aria-hidden>🔗</span>
          <strong>{t('Registry URL', '레지스트리 URL')}</strong>
        </span>
        <div className="registry-url-copy">
          <code className="registry-url-value">{registryUrl}</code>
          <button type="button" className="btn-copy" onClick={copyRegistryUrl}>
            {COPY_LABELS[copyKey][lang]}
          </button>
        </div>
      </div>
    </div>
  );
}
