import { useEffect, useRef, useState } from 'react';
import StatusBadge from './StatusBadge.jsx';

/**
 * MediaItemCard — one selected file: preview, metadata, upload progress,
 * and result / error / removal states.
 *
 * States: 'ready' → 'uploading' → 'done' | 'error' | 'canceled'
 */
export default function MediaItemCard({ item, onRemove, onRetry }) {
  const { file, state, progress, error, result } = item;
  const [previewUrl, setPreviewUrl] = useState(null);
  const previewKindRef = useRef(null);

  // Local preview for images/videos; revoked on change/unmount to avoid leaks.
  useEffect(() => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    previewKindRef.current = file.type.startsWith('video/') ? 'video' : 'image';
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      previewKindRef.current = null;
    };
  }, [file]);

  const isBusy = state === 'uploading';

  return (
    <article className={`media-card media-card--${state}`}>
      <div className="media-card__preview">
        {previewUrl && previewKindRef.current === 'image' && (
          <img src={previewUrl} alt={file.name} />
        )}
        {previewUrl && previewKindRef.current === 'video' && (
          <video src={previewUrl} muted controls={false} />
        )}
        {!previewUrl && <span className="media-card__placeholder">📄</span>}
        {previewKindRef.current === 'video' && (
          <span className="media-card__video-tag">VIDEO</span>
        )}
      </div>

      <div className="media-card__body">
        <div className="media-card__title-row">
          <span className="media-card__name" title={file.name}>
            {file.name}
          </span>
          <StatusBadge
            tone={
              state === 'done' ? 'success'
                : state === 'error' ? 'error'
                  : state === 'uploading' ? 'processing'
                    : 'neutral'
            }
          >
            {state === 'uploading' && `UPLOADING ${progress ?? 0}%`}
            {state === 'done' && 'SUCCESS'}
            {state === 'error' && 'ERROR'}
            {state === 'ready' && 'READY'}
            {state === 'canceled' && 'CANCELED'}
          </StatusBadge>
        </div>

        <div className="media-card__meta">
          <span>{file.type || 'unknown type'}</span>
          <span>·</span>
          <span>{formatBytes(file.size)}</span>
        </div>

        {isBusy && (
          <div
            className="progress"
            role="progressbar"
            aria-valuenow={progress ?? 0}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="progress__bar" style={{ width: `${progress ?? 0}%` }} />
          </div>
        )}

        {state === 'error' && error && (
          <p className="media-card__error" role="alert">{error}</p>
        )}

        {state === 'done' && result && (
          <p className="media-card__done-note">
            Uploaded — public ID <code>{result.public_id}</code>
          </p>
        )}

        <div className="media-card__actions">
          {state === 'ready' && (
            <button type="button" className="button button--ghost button--small" onClick={onRemove}>
              Remove
            </button>
          )}
          {state === 'error' && (
            <>
              <button type="button" className="button button--ghost button--small" onClick={onRetry}>
                Retry
              </button>
              <button type="button" className="button button--ghost button--small" onClick={onRemove}>
                Remove
              </button>
            </>
          )}
          {state === 'done' && (
            <button type="button" className="button button--ghost button--small" onClick={onRemove}>
              Clear
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function formatBytes(bytes) {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
