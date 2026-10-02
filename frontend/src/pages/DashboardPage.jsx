import { useEffect, useState } from 'react';
import StatusCard from '../components/StatusCard.jsx';
import { checkHealth, checkCloudinaryStatus } from '../services/api.js';
import { isUploadConfigured } from '../services/cloudinaryUpload.js';

/**
 * DashboardPage — system status overview.
 * Shows only what the backend and environment actually report.
 */
export default function DashboardPage() {
  const [backend, setBackend] = useState({ state: 'checking', detail: 'Checking…' });
  const [cloudinary, setCloudinary] = useState({ state: 'checking', detail: 'Checking…' });

  useEffect(() => {
    let cancelled = false;

    checkHealth()
      .then((data) => {
        if (cancelled) return;
        setBackend({ state: 'ok', detail: data.service || 'connected' });
      })
      .catch((err) => {
        if (cancelled) return;
        setBackend({ state: 'fail', detail: err.message });
      });

    checkCloudinaryStatus()
      .then((data) => {
        if (cancelled) return;
        if (data.configured) {
          setCloudinary({ state: 'ok', detail: 'Credentials configured' });
        } else {
          setCloudinary({
            state: 'fail',
            detail: `Missing: ${data.missingVariables.join(', ')}`,
          });
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setCloudinary({ state: 'fail', detail: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const uploadPresetCard = isUploadConfigured()
    ? { label: 'Upload preset', state: 'ok', detail: 'Configured (unsigned uploads)' }
    : { label: 'Upload preset', state: 'fail', detail: 'Not configured yet' };

  return (
    <PageShell
      title="Dashboard"
      subtitle="MediaTrust AI system status"
    >
      <div className="status-list">
        <StatusCard label="Backend connection" detail={backend.detail} state={backend.state} />
        <StatusCard label="Cloudinary connection" detail={cloudinary.detail} state={cloudinary.state} />
        <StatusCard label={uploadPresetCard.label} detail={uploadPresetCard.detail} state={uploadPresetCard.state} />
      </div>

      {backend.state === 'fail' && (
        <div className="notice notice--error">
          Cannot reach the backend. Start it with <code>npm run dev</code> inside <code>backend/</code>.
        </div>
      )}
    </PageShell>
  );
}

export function PageShell({ title, subtitle, actions, children }) {
  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="page__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page__actions">{actions}</div>}
      </header>
      {children}
    </div>
  );
}
