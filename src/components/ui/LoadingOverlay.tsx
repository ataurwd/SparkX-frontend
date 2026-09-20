'use client';

import React from 'react';
import { Sparkles, Database } from 'lucide-react';

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
  title = 'Loading Workspace Data...',
  message = 'Connecting to database and synchronizing live records...',
  blur = '6px',
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
      {/* Content with Blur Transition */}
      <div
        style={{
          filter: isLoading ? `blur(${blur})` : 'none',
          opacity: isLoading ? 0.38 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          userSelect: isLoading ? 'none' : 'auto',
          transition: 'filter 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
          willChange: 'filter, opacity'
        }}
        aria-hidden={isLoading ? 'true' : 'false'}
      >
        {children}
      </div>

      {/* Frosted Glass Floating Loader */}
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            pointerEvents: 'all'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '32px 36px',
              borderRadius: '20px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border-accent, rgba(108, 92, 231, 0.25))',
              boxShadow:
                '0 24px 50px -12px rgba(108, 92, 231, 0.28), 0 0 0 1px rgba(108, 92, 231, 0.15)',
              maxWidth: '420px',
              width: '90%',
              animation: 'sparkx-overlay-in 0.25s ease-out forwards'
            }}
          >
            {/* Animated Ring Spinner with Center Spark */}
            <div
              style={{
                position: 'relative',
                width: '64px',
                height: '64px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Spinning Gradient Ring */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '3px solid transparent',
                  borderTopColor: 'var(--color-primary, #6C5CE7)',
                  borderRightColor: '#A29BFE',
                  borderBottomColor: '#4FD1FF',
                  animation: 'sparkx-spin 0.9s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite'
                }}
              />
              {/* Outer Subtle Pulse */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-6px',
                  borderRadius: '50%',
                  border: '1px dashed var(--color-border-accent, rgba(108, 92, 231, 0.3))',
                  animation: 'sparkx-spin-reverse 6s linear infinite'
                }}
              />
              {/* Inner Glowing Icon */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-light, #F0EFFF)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary, #6C5CE7)',
                  boxShadow: '0 0 16px rgba(108, 92, 231, 0.35)',
                  animation: 'sparkx-pulse 1.8s ease-in-out infinite'
                }}
              >
                <Sparkles size={18} />
              </div>
            </div>

            {/* Title */}
            <h3
              style={{
                margin: '0 0 6px 0',
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                letterSpacing: '-0.01em'
              }}
            >
              {title}
            </h3>

            {/* Message */}
            <p
              style={{
                margin: '0 0 16px 0',
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.5
              }}
            >
              {message}
            </p>

            {/* Pulsing Status Chip */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-bg-subtle, rgba(108, 92, 231, 0.08))',
                border: '1px solid var(--color-border-accent, rgba(108, 92, 231, 0.2))',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-primary, #6C5CE7)'
              }}
            >
              <Database size={12} />
              <span>Synchronizing with MongoDB Atlas</span>
              <span
                style={{
                  display: 'inline-flex',
                  gap: '3px',
                  marginLeft: '2px'
                }}
              >
                <span className="sparkx-dot-pulse" style={{ animationDelay: '0ms' }}>•</span>
                <span className="sparkx-dot-pulse" style={{ animationDelay: '200ms' }}>•</span>
                <span className="sparkx-dot-pulse" style={{ animationDelay: '400ms' }}>•</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Animations */}
      <style jsx>{`
        @keyframes sparkx-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes sparkx-spin-reverse {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        @keyframes sparkx-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.85;
          }
        }
        @keyframes sparkx-overlay-in {
          0% {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .sparkx-dot-pulse {
          animation: sparkx-dot 1.2s infinite ease-in-out;
          font-weight: 800;
        }
        @keyframes sparkx-dot {
          0%, 80%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1.3);
          }
        }
      `}</style>
    </div>
  );
};
