import { Outlet } from 'react-router-dom';

const FOOTER_CONFIG = {
  author: 'codingnanyong',
  year: '2026',
};

export default function Layout() {
  return (
    <div className="container">
      <header className="header">
        <h1>🐳 Docker Guide</h1>
        <p>Resources Download Server</p>
        <p>
          <a href="/">← Back to Home</a>
        </p>
      </header>
      <main className="content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>Docker Private Registry Resources Server</p>
        <p style={{ marginTop: '10px', fontSize: '0.9em', opacity: 0.8 }}>
          Created by <strong>{FOOTER_CONFIG.author}</strong> | {FOOTER_CONFIG.year}
        </p>
      </footer>
    </div>
  );
}
