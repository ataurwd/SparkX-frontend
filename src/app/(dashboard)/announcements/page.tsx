'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Pin,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Users,
  Search,
  Filter,
  ShieldAlert,
  Send,
  Sparkles,
  Info
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface AnnouncementItem {
  _id: string;
  authorName: string;
  title: string;
  content: string;
  category: 'general' | 'company_news' | 'policy' | 'event' | 'emergency';
  priority: 'normal' | 'important' | 'urgent';
  targetAudience: 'all' | 'department' | 'leadership';
  pinned: boolean;
  acknowledgedBy: string[];
  createdAt: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<'general' | 'company_news' | 'policy' | 'event' | 'emergency'>('company_news');
  const [formPriority, setFormPriority] = useState<'normal' | 'important' | 'urgent'>('normal');
  const [formPinned, setFormPinned] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get<AnnouncementItem[]>('/api/announcements');
      if (res.data) {
        setAnnouncements(res.data);
      } else {
        // Fallback demo announcements
        setAnnouncements([
          {
            _id: 'ann-1',
            authorName: 'Alex Rivera (CEO)',
            title: 'SparkX Global Q3 All-Hands Meeting & Milestone Celebration',
            content: 'Join the entire executive leadership this Thursday at 3 PM EST as we review our company OKRs, celebrate the successful delivery of Phase 7 & 8, and announce quarterly performance bonuses.',
            category: 'company_news',
            priority: 'urgent',
            targetAudience: 'all',
            pinned: true,
            acknowledgedBy: ['user-1'],
            createdAt: new Date().toISOString()
          },
          {
            _id: 'ann-2',
            authorName: 'HR Leadership Desk',
            title: 'Updated Remote Work & Equipment Reimbursement Policy',
            content: 'Please review the updated 2026 Home Office & Learning Stipend Guidelines in your employee dashboard. Annual allocations have been expanded for all engineering and design staff.',
            category: 'policy',
            priority: 'important',
            targetAudience: 'all',
            pinned: false,
            acknowledgedBy: [],
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      }
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.put(`/api/announcements/${id}/acknowledge`, {});
      fetchData();
    } catch {
      // Optimistic
      setAnnouncements((prev) =>
        prev.map((a) =>
          a._id === id ? { ...a, acknowledgedBy: [...a.acknowledgedBy, 'me'] } : a
        )
      );
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) return;
    try {
      setSubmitting(true);
      await api.post('/api/announcements', {
        title: formTitle,
        content: formContent,
        category: formCategory,
        priority: formPriority,
        pinned: formPinned
      });
      setIsPostModalOpen(false);
      setFormTitle('');
      setFormContent('');
      fetchData();
    } catch {
      setIsPostModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
    const matchesCat = categoryFilter === 'all' || a.category === categoryFilter;
    return matchesQuery && matchesCat;
  });

  const pinnedList = filteredAnnouncements.filter((a) => a.pinned);
  const normalList = filteredAnnouncements.filter((a) => !a.pinned);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#6C5CE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Bell size={20} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Company Announcements & Noticeboard
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Official broadcasts, company-wide executive communiques, holiday schedules, and policy updates.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsPostModalOpen(true)}
          style={{
            backgroundColor: '#6C5CE7',
            borderColor: '#6C5CE7',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={16} />
          Post Announcement
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Notices' },
            { id: 'company_news', label: 'Company News' },
            { id: 'policy', label: 'Policies' },
            { id: 'event', label: 'Events' },
            { id: 'emergency', label: 'Urgent' }
          ].map((tab) => {
            const active = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: active ? '1px solid #6C5CE7' : '1px solid transparent',
                  backgroundColor: active ? '#6C5CE7' : 'var(--bg-elevated)',
                  color: active ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            style={{
              padding: '6px 12px 6px 32px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              minWidth: '220px'
            }}
          />
        </div>
      </div>

      {/* Pinned Announcements Section */}
      {pinnedList.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Pin size={16} color="#D63031" />
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#D63031' }}>
              Pinned Broadcast Notices
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {pinnedList.map((ann) => (
              <Card
                key={ann._id}
                padding="md"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderLeft: '4px solid #D63031',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Badge variant="danger" style={{ backgroundColor: '#D63031', color: '#FFFFFF', fontWeight: 700 }}>
                        URGENT BROADCAST
                      </Badge>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Posted by {ann.authorName} • {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      {ann.title}
                    </h2>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleAcknowledge(ann._id)}
                    style={{ fontSize: '12px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <CheckCircle2 size={13} />
                    Acknowledge
                  </Button>
                </div>

                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {ann.content}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements Stream */}
      <div>
        <div style={{ fontSize: '15px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Noticeboard Feed ({normalList.length})
        </div>

        {normalList.length === 0 ? (
          <Card padding="lg" style={{ textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
            <Bell size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px auto' }} />
            <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: 'var(--text-primary)' }}>No Notices Found</h4>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>All clear! No announcements in this category.</span>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {normalList.map((ann) => (
              <Card key={ann._id} padding="md" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: ann.priority === 'important' ? '#FDCB6E26' : '#6C5CE71A',
                          color: ann.priority === 'important' ? '#D48806' : '#6C5CE7',
                          textTransform: 'uppercase'
                        }}
                      >
                        {ann.category.replace('_', ' ')}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {ann.authorName} • {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {ann.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleAcknowledge(ann._id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={12} />
                    Acknowledge
                  </button>
                </div>

                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {ann.content}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Post Modal */}
      <Modal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} title="Post Company Broadcast">
        <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Broadcast Title *
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Q3 All-Hands & Executive Strategy Briefing"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Notice Content *
            </label>
            <textarea
              rows={4}
              required
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Write notice details..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
              >
                <option value="company_news">Company News</option>
                <option value="policy">Policy Update</option>
                <option value="event">Event / Holiday</option>
                <option value="emergency">Urgent Emergency</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Priority
              </label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as any)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
              >
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <input
              type="checkbox"
              id="pinnedCheck"
              checked={formPinned}
              onChange={(e) => setFormPinned(e.target.checked)}
            />
            <label htmlFor="pinnedCheck" style={{ fontSize: '13px', color: 'var(--text-primary)', cursor: 'pointer' }}>
              Pin this notice to top of noticeboard
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsPostModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting} style={{ backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }}>
              Broadcast Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
