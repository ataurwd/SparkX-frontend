'use client';

import React, { useState } from 'react';
import { useServerKeepAlive } from '../../hooks/useServerKeepAlive';

/**
 * ServerWakeUpBanner
 *
 * Renders a non-intrusive top banner when the Render backend is doing a
 * cold-start. Disappears automatically once the server responds.
 * Also keep-alives the server in the background every 9 minutes.
 */
export function ServerWakeUpBanner() {
  const { isWakingUp } = useServerKeepAlive();
  const [dismissed, setDismissed] = useState(false);

  if (!isWakingUp || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '10px 20px',
        background: 'linear-gradient(90deg, #6c5ce7 0%, #0ea5e9 100%)',
        color: '#fff',
        fontSize: '13.5px',
        fontWeight: 600,
        boxShadow: '0 2px 12px rgba(108,92,231,0.35)',
        fontFamily: 'inherit',
      }}
    >
      {/* Animated spinner */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}
      >
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>

      <span>
        🚀 Server is waking up on Render — this may take <strong>10–30 seconds</strong>.
        Everything will load automatically. Please wait…
      </span>

      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#fff',
          fontSize: '14px',
          lineHeight: 1,
          flexShrink: 0,
          marginLeft: '4px',
        }}
      >
        ×
      </button>
    </div>
  );
}
