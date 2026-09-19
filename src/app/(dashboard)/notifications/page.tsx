'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Filter,
  Calendar,
  Clock,
  ExternalLink,
  ShieldAlert,
  Search,
  RefreshCw,
  FolderKanban,
  DollarSign,
  CalendarDays,
  Target
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'leave' | 'task' | 'payroll' | 'announcement' | 'system' | 'performance';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const DEFAULT_NOTIFS: NotificationItem[] = [
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
    },
    {
      _id: 'notif-4',
      title: 'Company Notice: Q3 All-Hands',
      message: 'Alex Rivera posted: SparkX Global Q3 All-Hands Meeting this Thursday.',
      type: 'announcement',
      link: '/announcements',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      _id: 'notif-5',
      title: 'Performance Review Window Open',
      message: 'Quarterly OKR calibration cycle is now active. Please submit self-appraisal.',
      type: 'performance',
      link: '/performance/reviews',
      isRead: true,
      createdAt: new Date(Date.now() - 172800000).toISOString()
    }
  ];

  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFS);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/api/notifications');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setNotifications(res.data);
      } else {
        setNotifications(DEFAULT_NOTIFS);
      }
    } catch {
      setNotifications(DEFAULT_NOTIFS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleToggleRead = async (id: string, currentRead: boolean) => {
    try {
      if (!currentRead) {
        await api.put(`/api/notifications/${id}/read`, {});
      }
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    const matchesType = selectedType === 'all' || n.type === selectedType;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'leave':
        return <CalendarDays size={18} color="#0EA5E9" />;
      case 'task':
        return <FolderKanban size={18} color="var(--color-primary)" />;
      case 'payroll':
        return <DollarSign size={18} color="#10B981" />;
      case 'announcement':
        return <Bell size={18} color="#F59E0B" />;
      case 'performance':
        return <Target size={18} color="#A29BFE" />;
      default:
        return <Bell size={18} color="var(--color-text-muted)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Badge variant="primary" dot>Notification Engine</Badge>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Central Alerts & Dispatch (Phase 13)</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            Notifications & Company Alerts
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Central notification feed for sprint task assignments, leave approvals, payroll receipts, and team announcements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={fetchNotifications} iconPrefix={<RefreshCw size={14} className={loading ? 'spin' : ''} />}>
            Refresh
          </Button>
          <Button variant="primary" onClick={handleMarkAllRead} iconPrefix={<CheckCheck size={16} />}>
            Mark All as Read
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Alerts' },
            { id: 'task', label: 'Tasks' },
            { id: 'leave', label: 'Leave' },
            { id: 'payroll', label: 'Payroll' },
            { id: 'announcement', label: 'Announcements' },
            { id: 'performance', label: 'Reviews' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: selectedType === tab.id ? 'var(--color-primary)' : 'var(--color-surface-soft)',
                color: selectedType === tab.id ? '#FFFFFF' : 'var(--color-text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ width: '280px' }}>
          <Input
            placeholder="Search notification text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            iconPrefix={<Search size={15} />}
          />
        </div>
      </div>

      {/* Notifications List Card */}
      <Card padding="none">
        {filteredNotifs.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
            No notifications match your current filter.
          </div>
        ) : (
          <div>
            {filteredNotifs.map((n) => (
              <div
                key={n._id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  backgroundColor: n.isRead ? 'transparent' : 'var(--color-primary-light)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-surface-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {getTypeIcon(n.type)}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                        {n.title}
                      </span>
                      {!n.isRead && <Badge variant="primary">New</Badge>}
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px', marginBottom: '8px' }}>
                      {n.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {new Date(n.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span>•</span>
                      <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{n.type}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {n.link && (
                    <Link href={n.link}>
                      <Button variant="ghost" size="sm" iconSuffix={<ExternalLink size={13} />}>
                        View
                      </Button>
                    </Link>
                  )}
                  {!n.isRead && (
                    <Button variant="outline" size="sm" onClick={() => handleToggleRead(n._id, n.isRead)}>
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
