'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { isRouteAllowedForRole, normalizeRole } from '@/lib/permissions';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AccessRestrictedView } from './AccessRestrictedView';
import { FloatingLiveChat } from '../chat/FloatingLiveChat';

const DashboardContext = createContext<boolean>(false);

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const { user, isLoading } = useAuth();
  const isAlreadyInLayout = useContext(DashboardContext);

  useEffect(() => {
    if (!isLoading) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('sparkx_access_token') : null;
      if (!user || !token) {
        const redirectUrl = pathname ? `/login?redirect=${encodeURIComponent(pathname)}` : '/login';
        router.replace(redirectUrl);
      } else if (pathname === '/' && normalizeRole(user.role) === 'employee') {
        router.replace('/portal/employee');
      }
    }
  }, [user, isLoading, router, pathname]);

  // If already wrapped in a parent DashboardLayout, don't nest another Sidebar/Header
  if (isAlreadyInLayout) {
    return <>{children}</>;
  }

  // Splash loading screen while checking auth session
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-base)',
          color: 'var(--color-text-primary)'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid var(--color-border)',
            borderTopColor: '#6C5CE7',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px'
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Verifying SparkX Workspace Session...
        </div>
      </div>
    );
  }

  // Block any rendering if unauthenticated (prevents flash of dashboard content)
  if (!user) {
    return null;
  }

  const isAllowed = isRouteAllowedForRole(pathname, user.role);

  return (
    <DashboardContext.Provider value={true}>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-bg-base)' }}>
        {/* Fixed Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div
          style={{
            marginLeft: 'var(--sidebar-width)',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0
          }}
        >
          <Header />
          <main
            style={{
              flex: 1,
              padding: '28px 32px',
              maxWidth: '1600px',
              width: '100%',
              margin: '0 auto'
            }}
          >
            {isAllowed ? children : <AccessRestrictedView pathname={pathname} />}
          </main>
        </div>

        {/* Global Floating Live Chat Widget */}
        <FloatingLiveChat />
      </div>
    </DashboardContext.Provider>
  );
};
