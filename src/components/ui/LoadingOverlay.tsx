'use client';

import React from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  title?: string;
  message?: string;
  blur?: string;
  minHeight?: string | number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  title = 'Loading...',
  message = 'Please wait a moment...',
  blur = '5px',
  minHeight = '320px',
  children,
  style,
  className = ''
}) => {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        minHeight: isLoading ? minHeight : undefined,
        width: '100%',
        ...style
      }}
    >
      {/* Background Content with Smooth Blur */}
      <div
        style={{
          filter: isLoading ? `blur(${blur})` : 'none',
          opacity: isLoading ? 0.4 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          userSelect: isLoading ? 'none' : 'auto',
          transition: 'filter 0.25s ease, opacity 0.25s ease',
          willChange: 'filter, opacity'
        }}
        aria-hidden={isLoading ? 'true' : 'false'}
      >
        {children}
      </div>

      {/* Clean & Meaningful Minimal Loader Card */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            pointerEvents: 'all'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '24px 32px',
              borderRadius: '16px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow:
                '0 16px 36px -8px rgba(108, 92, 231, 0.16), 0 0 0 1px rgba(108, 92, 231, 0.08)',
              maxWidth: '300px',
              width: 'auto',
              minWidth: '240px',
              animation: 'sparkx-overlay-in 0.2s ease-out forwards'
            }}
          >
            {/* Minimal Modern Spinner */}
            <div
              style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                marginBottom: '14px'
              }}
            >
              {/* Outer Track */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '3px solid var(--color-border-subtle, #E4E7F4)'
                }}
              />
              {/* Spinning Arc */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '3px solid transparent',
                  borderTopColor: 'var(--color-primary, #6C5CE7)',
                  borderRightColor: 'var(--color-primary, #6C5CE7)',
                  animation: 'sparkx-spin 0.8s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite'
                }}
              />
            </div>

            {/* Title */}
            <h4
              style={{
                margin: '0 0 4px 0',
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--color-text-main)',
                letterSpacing: '-0.01em'
              }}
            >
              {title}
            </h4>

            {/* Concise Message */}
            {message && (
              <p
                style={{
                  margin: 0,
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.4
                }}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes sparkx-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes sparkx-overlay-in {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(4px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
