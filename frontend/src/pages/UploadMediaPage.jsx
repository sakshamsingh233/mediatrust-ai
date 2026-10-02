import { useCallback, useRef, useState } from 'react';
import { PageShell } from './DashboardPage.jsx';
import DropZone from '../components/DropZone.jsx';
import MediaItemCard from '../components/MediaItemCard.jsx';
import UploadResultCard from '../components/UploadResultCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import {
  uploadToCloudinary,
  isUploadConfigured,
  PRESET_NOT_CONFIGURED_MESSAGE,
} from '../services/cloudinaryUpload.js';
import { analyzeImage } from '../services/api.js';

const ACCEPTED_TYPES = 'image/*,video/*';

function makeItem(file) {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    file,
    state: 'ready',
    progress: 0,
    error: null,
    result: null,
  };
}

export default function UploadMediaPage() {
  const [items, setItems] = useState([]);
  const [isBusy, setIsBusy] = useState(false);

  const abortRef = useRef(null);

  const presetConfigured = isUploadConfigured();

  const addFiles = useCallback((files) => {
    const mediaFiles = files.filter(
      (file) =>
        file.type.startsWith('image/') ||
        file.type.startsWith('video/')
    );

    if (mediaFiles.length === 0) {
      return;
    }

    setItems((previousItems) => [
      ...previousItems,
      ...mediaFiles.map(makeItem),
    ]);
  }, []);

  const updateItem = useCallback((id, patch) => {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? {
              ...item,
              ...patch,
            }
          : item
      )
    );
  }, []);

  const startUpload = useCallback(async () => {
    const pendingItems = items.filter(
      (item) => item.state === 'ready'
    );

    if (
      pendingItems.length === 0 ||
      !presetConfigured ||
      isBusy
    ) {
      return;
    }

    const controller = new AbortController();

    abortRef.current = controller;
    setIsBusy(true);

    for (const item of pendingItems) {
      if (controller.signal.aborted) {
        break;
      }

      updateItem(item.id, {
        state: 'uploading',
        progress: 0,
        error: null,
      });

      try {
        // Step 1: Upload media directly to Cloudinary.
        const uploadResult = await uploadToCloudinary(
          item.file,
          {
            onProgress: (percent) => {
              updateItem(item.id, {
                progress: percent,
              });
            },
            signal: controller.signal,
          }
        );

        // Step 2: Retrieve the uploaded resource information
        // from our backend using the Cloudinary public_id.
        const analysisResponse = await analyzeImage(
          uploadResult.public_id
        );

        updateItem(item.id, {
          state: 'done',
          progress: 100,
          result: {
            ...uploadResult,
            analysis: analysisResponse.analysis,
          },
        });
      } catch (error) {
        if (error?.name === 'AbortError') {
          updateItem(item.id, {
            state: 'canceled',
            error: 'Upload canceled.',
          });
        } else {
          updateItem(item.id, {
            state: 'error',
            error:
              error?.message ||
              'Upload or media analysis failed.',
          });
        }
      }
    }

    setIsBusy(false);
    abortRef.current = null;
  }, [
    items,
    presetConfigured,
    isBusy,
    updateItem,
  ]);

  const cancelUpload = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const removeItem = useCallback((id) => {
    setItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    );
  }, []);

  const retryItem = useCallback(
    (id) => {
      updateItem(id, {
        state: 'ready',
        progress: 0,
        error: null,
        result: null,
      });
    },
    [updateItem]
  );

  const clearAll = useCallback(() => {
    if (isBusy) {
      return;
    }

    setItems([]);
  }, [isBusy]);

  const pendingCount = items.filter(
    (item) => item.state === 'ready'
  ).length;

  const uploadedResults = items.filter(
    (item) =>
      item.state === 'done' &&
      item.result
  );

  return (
    <PageShell
      title="Upload Media"
      subtitle="Upload images and videos to Cloudinary"
      actions={
        <span
          className={`badge ${
            presetConfigured
              ? 'badge--success'
              : 'badge--error'
          }`}
        >
          {presetConfigured
            ? 'Upload preset configured'
            : 'Upload preset missing'}
        </span>
      }
    >
      {!presetConfigured && (
        <div
          className="notice notice--warning"
          role="status"
        >
          <strong>
            {PRESET_NOT_CONFIGURED_MESSAGE}
          </strong>

          <p>
            Create an <em>unsigned</em> upload preset in
            the Cloudinary Console under Settings → Upload →
            Upload presets. Then set{' '}
            <code>VITE_CLOUDINARY_UPLOAD_PRESET</code> in{' '}
            <code>frontend/.env</code> and restart the
            frontend.
          </p>
        </div>
      )}

      <DropZone
        onFilesSelected={addFiles}
        accept={ACCEPTED_TYPES}
        multiple
        disabled={!presetConfigured || isBusy}
      />

      {items.length > 0 && (
        <>
          <div className="upload-toolbar">
            <span className="upload-toolbar__summary">
              {items.length}{' '}
              {items.length === 1
                ? 'file'
                : 'files'}{' '}
              selected · {pendingCount} ready
            </span>

            <div className="upload-toolbar__buttons">
              {isBusy ? (
                <button
                  type="button"
                  className="button button--danger"
                  onClick={cancelUpload}
                >
                  Cancel uploads
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="button button--primary"
                    onClick={startUpload}
                    disabled={
                      pendingCount === 0 ||
                      !presetConfigured
                    }
                  >
                    Upload{' '}
                    {pendingCount > 0
                      ? `${pendingCount} ${
                          pendingCount === 1
                            ? 'file'
                            : 'files'
                        }`
                      : ''}
                  </button>

                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={clearAll}
                    disabled={isBusy}
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="media-list">
            {items.map((item) => (
              <MediaItemCard
                key={item.id}
                item={item}
                onRemove={() => removeItem(item.id)}
                onRetry={() => retryItem(item.id)}
              />
            ))}
          </div>
        </>
      )}

      {uploadedResults.length > 0 && (
        <section className="results-section">
          <h2 className="results-section__title">
            Media Analysis Results
          </h2>

          <p className="results-section__subtitle">
            Verified resource information retrieved
            directly from Cloudinary.
          </p>

          {uploadedResults.map((item) => (
            <UploadResultCard
              key={item.id}
              result={item.result}
            />
          ))}
        </section>
      )}

      {uploadedResults.length > 0 && (
        <div className="notice notice--info">
          <StatusBadge tone="processing">
            MEDIA ANALYZED
          </StatusBadge>

          <span>
            Media uploaded successfully and its
            Cloudinary resource information was
            retrieved.
          </span>
        </div>
      )}
    </PageShell>
  );
}