import { useRef, useState } from 'react';

/**
 * DropZone — drag & drop area with a "Choose Files" button.
 * Purely presentational; file handling is delegated via onFilesSelected.
 */
export default function DropZone({ onFilesSelected, accept, multiple = true, disabled = false }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const emitFiles = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    onFilesSelected(Array.from(fileList));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(false);
    emitFiles(event.dataTransfer?.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  return (
    <div
      className={`dropzone ${isDragging ? 'dropzone--dragging' : ''} ${disabled ? 'dropzone--disabled' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      role="region"
      aria-label="Upload media"
    >
      <div className="dropzone__icon" aria-hidden="true">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <p className="dropzone__title">Drag &amp; drop images or videos here</p>
      <p className="dropzone__hint">or</p>
      <button
        type="button"
        className="button button--primary"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Choose Files
      </button>
      <p className="dropzone__meta">Images and videos only</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(event) => {
          emitFiles(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
}
