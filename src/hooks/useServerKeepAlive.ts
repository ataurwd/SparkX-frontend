/**
 * useServerKeepAlive
 *
 * Pings the Render backend every PING_INTERVAL_MS to prevent it from
 * sleeping due to inactivity on the free tier.
 *
 * Also detects when the server is "cold" (slow first response) and
 * exposes `isWakingUp` so the UI can show a friendly banner.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const PING_INTERVAL_MS = 9 * 60 * 1000; // 9 minutes (Render sleeps after 15 min)
const WAKEUP_TIMEOUT_MS = 4000;          // consider "waking up" if > 4 s
const PING_URL =
  (process.env.NEXT_PUBLIC_API_URL || '') + '/api/health';

interface KeepAliveState {
  isWakingUp: boolean;   // true while server is slow to respond
  lastPingMs: number | null;  // round-trip of last successful ping
}

export function useServerKeepAlive(): KeepAliveState {
  const [state, setState] = useState<KeepAliveState>({
    isWakingUp: false,
    lastPingMs: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wakingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ping = useCallback(async () => {
    const start = Date.now();

    // Mark as "waking up" if no response within WAKEUP_TIMEOUT_MS
    wakingTimerRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, isWakingUp: true }));
    }, WAKEUP_TIMEOUT_MS);

    try {
      await fetch(PING_URL, {
        method: 'GET',
        cache: 'no-store',
        signal: AbortSignal.timeout(30_000), // give Render up to 30 s to wake
      });
      const ms = Date.now() - start;
      clearTimeout(wakingTimerRef.current!);
      setState({ isWakingUp: false, lastPingMs: ms });
    } catch {
      clearTimeout(wakingTimerRef.current!);
      setState((prev) => ({ ...prev, isWakingUp: false }));
    }
  }, []);

  useEffect(() => {
    // Immediate ping on mount
    ping();

    // Then ping every PING_INTERVAL_MS
    intervalRef.current = setInterval(ping, PING_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (wakingTimerRef.current) clearTimeout(wakingTimerRef.current);
    };
  }, [ping]);

  return state;
}
