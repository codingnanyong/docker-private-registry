import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import '../styles/AutoRefreshToggle.css';

const DEFAULT_INTERVAL_MS = 60 * 1000; /* 1분 */

export default function AutoRefreshToggle({ onRefresh, intervalMs = DEFAULT_INTERVAL_MS }) {
  const { lang } = useLang();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!enabled || typeof onRefresh !== 'function') return;
    const id = setInterval(onRefresh, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, onRefresh]);

  const t = (en, ko) => (lang === 'en' ? en : ko);

  return (
    <label className="auto-refresh-toggle">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => setEnabled(e.target.checked)}
        aria-label={t('Auto Refresh (every 1 min)', '자동 새로고침 (1분마다)')}
        className="auto-refresh-toggle-input"
      />
      <span className="toggle-track" aria-hidden>
        <span className="toggle-thumb" />
      </span>
      <span className="auto-refresh-label">{t('Auto-refresh', '자동 새로고침')}</span>
    </label>
  );
}
