import { useEffect, useState } from 'react';
import DashboardPage from './pages/DashboardPage.jsx';
import UploadMediaPage from './pages/UploadMediaPage.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard /> },
  { id: 'upload', label: 'Upload Media', icon: <IconUpload /> },
];

/**
 * App — SaaS dashboard shell with sidebar navigation.
 * Pages are simple local state for now; no router needed yet.
 */
export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('mt-theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('mt-theme', theme);
  }, [theme]);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__logo" aria-hidden="true">M</span>
          <div className="sidebar__brand-text">
            <span className="sidebar__title">MediaTrust AI</span>
            <span className="sidebar__subtitle">Media intelligence</span>
        </div>
        </div>

        <nav className="sidebar__nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar__link ${activePage === item.id ? 'sidebar__link--active' : ''}`}
              onClick={() => setActivePage(item.id)}
              aria-current={activePage === item.id ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button
            type="button"
            className="button button--ghost button--small sidebar__theme-toggle"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
        </div>
      </aside>

      <main className="main">
        {activePage === 'dashboard' && <DashboardPage />}
        {activePage === 'upload' && <UploadMediaPage />}
      </main>
    </div>
  );
}

function IconDashboard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
