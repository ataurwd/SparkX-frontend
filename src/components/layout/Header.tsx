'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Plus, Building, Sun, Moon, CheckCheck, ExternalLink, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../lib/auth-context';
import { useTheme } from '../../lib/theme-context';
import { api } from '../../lib/api';

export interface HeaderProps {
  onOpenCreateProject?: () => void;
}

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCreateProject }) => {
  const router = useRouter();
  const { user, organization } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      _id: 'notif-1',
      title: 'Leave Request Approved',
      message: 'Your 2-day casual leave starting next Monday was approved by Sarah Jenkins.',
      type: 'leave',
      link: '/leave',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      _id: 'notif-2',
      title: 'New Sprint Task Assigned',
      message: 'Alex Rivera assigned you to task SPX-102: Audit WCAG 2.1 Contrast ratios.',
      type: 'task',
      link: '/tasks',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: 'notif-3',
      title: 'September Payroll Generated',
      message: 'Your September 2026 salary breakdown and payslip have been published.',
      type: 'payroll',
      link: '/payroll/my-payslips',
      isRead: false,
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ]);
  const [unreadCount, setUnreadCount] = useState(3);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<any>('/api/notifications');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setNotifications(res.data);
        const unread = (res as any).unreadCount !== undefined ? (res as any).unreadCount : res.data.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch {
      // keep fallback
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  const handleItemClick = async (n: NotificationItem) => {
    try {
      if (!n.isRead) {
        await api.put(`/api/notifications/${n._id}/read`, {});
        setNotifications((prev) =>
          prev.map((item) => (item._id === n._id ? { ...item, isRead: true } : item))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch {
      // ignore
    }
    setIsNotifOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

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

        {/* Notification Bell with interactive Popover */}
        <div style={{ position: 'relative' }} ref={popoverRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notifications"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: isNotifOpen ? 'var(--color-surface-hover)' : 'var(--color-surface-soft)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-main)',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: 'var(--color-danger)',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-pill)',
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--color-surface)'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Dropdown */}
          {isNotifOpen && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '360px',
                maxHeight: '480px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'var(--color-surface-soft)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-main)' }}>Notifications</span>
                  {unreadCount > 0 && <Badge variant="primary">{unreadCount} New</Badge>}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--color-primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Items List */}
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '340px' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleItemClick(n)}
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid var(--color-border-subtle)',
                        backgroundColor: n.isRead ? 'transparent' : 'var(--color-primary-light)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = n.isRead ? 'transparent' : 'var(--color-primary-light)')
                      }
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: n.isRead ? 600 : 700, color: 'var(--color-text-main)' }}>
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '10px 18px', borderTop: '1px solid var(--color-border-subtle)', textAlign: 'center', backgroundColor: 'var(--color-surface-soft)' }}>
                <Link
                  href="/notifications"
                  onClick={() => setIsNotifOpen(false)}
                  style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}
                >
                  View all notification history →
                </Link>
              </div>
            </div>
          )}
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
