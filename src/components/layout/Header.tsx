'use client';

import React from 'react';
import { Search, Bell, Plus, Building, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../lib/auth-context';

export interface HeaderProps {
  onOpenCreateProject?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateProject }) => {
  const { user, organization } = useAuth();

  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 40
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* + Create Project Gradient Button (from design reference!) */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenCreateProject}
          iconPrefix={<Plus size={15} strokeWidth={2.5} />}
        >
          Create Project
        </Button>

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
              border: '2px solid #FFFFFF'
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
