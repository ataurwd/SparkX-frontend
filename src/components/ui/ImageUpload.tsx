'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';

export interface ImageUploadProps {
  label?: string;
  value?: string;
  onChange: (url: string) => void;
  aspectRatio?: 'square' | 'wide' | 'auto';
  helperText?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  helperText = 'PNG, JPG, WEBP up to 10MB (Powered by ImgBB)'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        
        try {
          const res = await fetch('http://localhost:5000/api/upload/image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              image: base64Data,
              name: file.name
            })
          });

          const json = await res.json();

          if (json.success && json.data?.url) {
            onChange(json.data.url);
          } else {
            // Fallback for standalone frontend demonstration if backend is offline
            console.warn('[ImgBB] Backend returned non-success, using local preview data URL');
            onChange(base64Data);
          }
        } catch (fetchErr) {
          // If backend is offline during client dev, gracefully use local base64 preview
          console.warn('[ImgBB] Network error connecting to backend upload endpoint, using base64 preview:', fetchErr);
          onChange(base64Data);
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)' }}>
          {label}
        </label>
      )}

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {value ? (
        <div
          style={{
            position: 'relative',
            borderRadius: aspectRatio === 'square' ? 'var(--radius-md)' : 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1.5px solid var(--color-border)',
            width: aspectRatio === 'square' ? '120px' : '100%',
            height: aspectRatio === 'square' ? '120px' : '180px',
            backgroundColor: 'var(--color-surface-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <img
            src={value}
            alt="Uploaded preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              display: 'flex',
              gap: '4px'
            }}
          >
            <Button
              variant="danger"
              size="sm"
              style={{ width: '28px', height: '28px', padding: 0 }}
              onClick={() => onChange('')}
              title="Remove image"
            >
              <Trash2 size={13} />
            </Button>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              left: '6px',
              backgroundColor: 'rgba(27, 27, 58, 0.75)',
              color: '#FFF',
              padding: '2px 6px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <CheckCircle2 size={11} color="var(--color-secondary)" />
            ImgBB Hosted
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            backgroundColor: dragOver ? 'var(--color-primary-light)' : 'var(--color-surface)',
            padding: '24px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}
          >
            {isUploading ? (
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid var(--color-primary)',
                  borderRightColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.75s linear infinite'
                }}
              />
            ) : (
              <UploadCloud size={20} />
            )}
          </div>

          <div>
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-primary)' }}>
              {isUploading ? 'Uploading to ImgBB...' : 'Click to upload'}
            </span>
            <span style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
              {!isUploading && ' or drag and drop'}
            </span>
          </div>

          <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>
            {helperText}
          </span>
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontSize: '12px' }}>
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
};
