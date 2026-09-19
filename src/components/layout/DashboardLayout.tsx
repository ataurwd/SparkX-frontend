'use client';

import React, { createContext, useContext } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const DashboardContext = createContext<boolean>(false);

export interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isAlreadyInLayout = useContext(DashboardContext);

  // If already wrapped in a parent DashboardLayout (e.g. from (dashboard)/layout.tsx), don't nest another Sidebar/Header
  if (isAlreadyInLayout) {
    return <>{children}</>;
  }

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
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
};
