import { useState, useRef, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import { showToast } from './Toast';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
  size?: 'main' | 'gallery';
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const BUCKET = 'product-images';

export function ImageUploader({ onUpload, currentUrl, size = 'main' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Height of the drop zone varies by size prop
  const zoneHeight = size === 'main' ? 120 : 80;

  // Upload a File object to Supabase Storage and call onUpload with the public URL
  const uploadFile = useCallback(async (file: File) => {
    if (!supabase) {
      showToast('Supabase no configurado', 'error');
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      showToast('Formato no válido. Usa JPG, PNG o WebP.', 'error');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast('La imagen supera los 5 MB máximos.', 'error');
      return;
    }

    setUploading(true);

    const path = `products/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      const bucketMissing =
        uploadError.message?.toLowerCase().includes('bucket') ||
        uploadError.message?.toLowerCase().includes('not found');
      if (bucketMissing) {
        showToast("Error al subir imagen. Verifica que el bucket 'product-images' existe en Supabase Storage.", 'error');
      } else {
        showToast('Error al subir imagen: ' + uploadError.message, 'error');
      }
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onUpload(data.publicUrl);
    setUploading(false);
  }, [onUpload]);

  // Handle file selected via the hidden <input>
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so same file can be re-selected if needed
    e.target.value = '';
  }

  // Drag & drop handlers
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  // Drop zone dynamic styles
  const zoneStyle: React.CSSProperties = {
    height: zoneHeight,
    border: `2px dashed ${dragOver ? 'var(--hot)' : 'var(--border2)'}`,
    borderRadius: 10,
    background: dragOver ? 'rgba(235,25,130,0.05)' : 'var(--cream)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    cursor: uploading ? 'default' : 'pointer',
    transition: 'border-color 0.15s, background 0.15s',
    overflow: 'hidden',
    position: 'relative',
  };

  // If there's a preview image, show it as background inside the zone
  const showPreview = !!currentUrl && !uploading;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-label="Seleccionar imagen"
      />

      {/* Drop zone */}
      <div
        style={zoneStyle}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Zona de carga de imagen"
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        {uploading ? (
          // Upload in progress indicator
          <span style={{ fontSize: 13, color: 'var(--hot)', fontWeight: 600 }}>
            Subiendo...
          </span>
        ) : showPreview ? (
          // Preview of current image
          <>
            <img
              src={currentUrl}
              alt="Vista previa"
              onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              style={{
                position: 'absolute', inset: 0,
                width: '100%', height: '100%',
                objectFit: 'cover', borderRadius: 8,
                opacity: 0.85,
              }}
            />
            {/* Overlay hint */}
            <div style={{
              position: 'relative', zIndex: 1,
              background: 'rgba(255,255,255,0.85)',
              borderRadius: 6, padding: '3px 10px',
              fontSize: 11, fontWeight: 600,
              color: 'var(--deep)',
            }}>
              Cambiar imagen
            </div>
          </>
        ) : (
          // Empty state
          <>
            {/* Upload icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.4 }}>
              Subir imagen
              <br />
              <span style={{ fontSize: 10, opacity: 0.7 }}>o arrastra aquí · JPG, PNG, WebP · máx 5 MB</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
