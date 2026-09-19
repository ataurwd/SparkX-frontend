'use client';

import React from 'react';
import { Search, Bell, Plus, Building, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';

export interface HeaderProps {
  onOpenCreateProject?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateProject }) => {
  const { user, organization } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="no-print"
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'background-color 0.2s ease, border-color 0.2s ease'
      }}
    >
      {/* Left: Global Search & Organization Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Org Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-surface-soft)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-main)',
            cursor: 'pointer'
          }}
        >
          <Building size={14} color="var(--color-primary)" />
          <span>{organization?.name || 'SparkX Global Tech'}</span>
          <span
            style={{
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              fontSize: '10px',
              padding: '1px 6px',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 700
            }}
          >
            Enterprise
          </span>
        </div>

        {/* Global Search Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-bg-base)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-pill)',
            padding: '0 14px',
            height: '38px',
            width: '280px'
          }}
        >
          <Search size={15} color="var(--color-text-muted)" />
          <input
            placeholder="Quick search (Ctrl+K)..."
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              width: '100%',
              color: 'var(--color-text-main)'
            }}
          />
        </div>
      </div>

      {/* Right: Actions & User Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Theme Toggle Button (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-surface-soft)',
            border: '1px solid var(--color-border)',
            color: theme === 'dark' ? '#F59E0B' : 'var(--color-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary)';
            e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.backgroundColor = 'var(--color-surface-soft)';
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <Button variant="icon" size="sm" title="Notifications">
            <Bell size={17} />
          </Button>
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-secondary)',
              border: '2px solid var(--color-surface)'
            }}
          />
        </div>

        {/* User Profile Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 6px',
            borderRadius: 'var(--radius-pill)',
            cursor: 'pointer'
          }}
        >
          <img
            src={user?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"}
            alt="User avatar"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--color-primary-light)'
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {user ? `${user.firstName} ${user.lastName}` : 'Amelia Demane'}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {user?.role || 'Owner / CEO'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
