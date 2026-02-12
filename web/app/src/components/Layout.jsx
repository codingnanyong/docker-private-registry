import { Outlet, NavLink } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/Layout.css';

const FOOTER_CONFIG = {
  author: 'codingnanyong',
  year: '2026',
};

const NAV_ITEMS = [
  { to: '/', labelEn: 'Home', labelKo: '홈', icon: '🏠' },
  { to: '/docs', labelEn: 'Documentation', labelKo: '문서', icon: '📚' },
  { to: '/scripts', labelEn: 'Scripts', labelKo: '스크립트', icon: '📜' },
  { to: '/certs', labelEn: 'Certificates', labelKo: '인증서', icon: '🔐' },
  { to: '/registry-list', labelEn: 'Image List', labelKo: '이미지 목록', icon: '🐳' },
  { to: '/compose-list', labelEn: 'Compose Files', labelKo: '컴포즈 파일', icon: '📦' },
];

export default function Layout() {
  const { lang, setLang } = useLang();
  const { isDark, toggleTheme } = useTheme();

  const toggleLang = () => setLang(lang === 'en' ? 'ko' : 'en');

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-inner">
          <NavLink to="/" className="app-brand">
            <span className="app-brand-icon">🐳</span>
            <div className="app-brand-text">
              <span className="app-brand-title">Docker Guide</span>
              <span className="app-brand-sub">Resources Download Server</span>
            </div>
          </NavLink>
          <nav className="app-header-nav app-header-actions">
            <button
              type="button"
              className="app-lang-toggle"
              onClick={toggleLang}
              aria-label={lang === 'en' ? 'Switch to Korean' : 'Switch to English'}
              title={lang === 'en' ? '한국어로 전환' : 'Switch to English'}
            >
              {lang === 'en' ? 'ENG' : 'KOR'}
            </button>
            <button
              type="button"
              className="app-theme-toggle"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? '라이트 모드' : '다크 모드'}
            >
              {isDark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              )}
            </button>
          </nav>
        </div>
      </header>

      <div className="app-body">
        <aside className="app-sidebar">
          <nav className="sidebar-nav">
            {NAV_ITEMS.map(({ to, labelEn, labelKo, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <span className="sidebar-link-icon" aria-hidden>{icon}</span>
                <span className="sidebar-link-label">{lang === 'en' ? labelEn : labelKo}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="app-main">
          <div className="app-main-inner">
            <Outlet />
          </div>
          <footer className="app-footer">
            <p>{lang === 'en' ? 'Docker Private Registry Resources Server' : 'Docker Private Registry 리소스 서버'}</p>
            <p className="app-footer-credit">
              {lang === 'en' ? 'Created by' : '제작'} <strong>{FOOTER_CONFIG.author}</strong> | {FOOTER_CONFIG.year}
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
