'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Users,
  FileText,
  CheckSquare,
  AlertCircle,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import api from '@/lib/api';

interface ActionItem {
  task: string;
  assignee: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
}

interface Attendee {
  name: string;
  role: string;
  present: boolean;
}

interface MeetingSession {
  _id: string;
  title: string;
  department: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  location: string;
  meetingLink?: string;
  organizerName: string;
  agenda: string[];
  notes?: string;
  attendees: Attendee[];
  actionItems: ActionItem[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

interface Metrics {
  totalMeetings: number;
  totalActionItems: number;
  pendingActionItems: number;
  completedActionItems: number;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingSession[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingSession | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    totalMeetings: 0,
    totalActionItems: 0,
    pendingActionItems: 0,
    completedActionItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modals & form
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newActionItem, setNewActionItem] = useState({
    task: '',
    assignee: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    department: 'Engineering',
    meetingDate: '',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    location: 'Executive Boardroom Alpha / Google Meet',
    meetingLink: 'https://meet.google.com/spk-live-syn',
    organizerName: 'Ataur Rahman',
    agenda: '1. Sprint Retro\n2. Architecture Review\n3. Q4 Key Deliverables',
    notes: ''
  });

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/meetings', {
        params: { department: departmentFilter, search: searchTerm }
      });
      if (res.data) {
        setMeetings(res.data);
        if (res.metrics) setMetrics(res.metrics);
        if (!selectedMeeting && res.data.length > 0) {
          setSelectedMeeting(res.data[0]);
        } else if (selectedMeeting) {
          const updated = res.data.find((m: any) => m._id === selectedMeeting._id);
          if (updated) setSelectedMeeting(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch meetings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [departmentFilter, searchTerm]);

  const handleToggleActionItem = async (meetingId: string, itemIndex: number) => {
    try {
      const res: any = await api.put(`/meetings/${meetingId}/action-items/${itemIndex}/toggle`, {});
      if (res.data) {
        setSelectedMeeting(res.data);
        setMeetings((prev) => prev.map((m) => (m._id === res.data._id ? res.data : m)));
      }
    } catch (err) {
      alert('Failed to update action item');
    }
  };

  const handleAddActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting || !newActionItem.task) return;

    try {
      const res: any = await api.post(`/meetings/${selectedMeeting._id}/action-items`, newActionItem);
      if (res.data) {
        setSelectedMeeting(res.data);
        setMeetings((prev) => prev.map((m) => (m._id === res.data._id ? res.data : m)));
        setNewActionItem({ task: '', assignee: '' });
      }
    } catch (err) {
      alert('Failed to add action item');
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.post('/meetings', formData);
      setIsNewModalOpen(false);
      setFormData({
        title: '',
        department: 'Engineering',
        meetingDate: '',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        location: 'Executive Boardroom Alpha / Google Meet',
        meetingLink: 'https://meet.google.com/spk-live-syn',
        organizerName: 'Ataur Rahman',
        agenda: '',
        notes: ''
      });
      fetchMeetings();
      if (res.data) setSelectedMeeting(res.data);
    } catch (err) {
      alert('Failed to schedule meeting');
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Calendar size={24} style={{ color: '#6C5CE7' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              Meeting Minutes & Action Items Hub
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Structured meeting agendas, collaborative notes, participant rosters, and actionable task deliverables.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#6C5CE7',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 18px',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Schedule Sync Session
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>TOTAL SESSIONS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{metrics.totalMeetings}</div>
          <div style={{ fontSize: '0.78rem', color: '#6C5CE7', marginTop: '4px', fontWeight: 500 }}>Standups & syncs logged</div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>PENDING ACTION ITEMS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#D97706' }}>{metrics.pendingActionItems}</div>
          <div style={{ fontSize: '0.78rem', color: '#D97706', marginTop: '4px', fontWeight: 500 }}>Assigned deliverables open</div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>COMPLETED TAKEAWAYS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#059669' }}>{metrics.completedActionItems}</div>
          <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>Resolved by attendees</div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>ACTION COMPLETION RATE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2563EB' }}>
            {metrics.totalActionItems > 0 ? Math.round((metrics.completedActionItems / metrics.totalActionItems) * 100) : 0}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Sprint accountability metric</div>
        </div>
      </div>

      {/* Main Dual-Column Interface */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Meeting Sessions List */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              MEETINGS & STANDUPS ({meetings.length})
            </span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.78rem'
              }}
            >
              <option value="all">All Depts</option>
              <option value="Executive">Executive</option>
              <option value="Engineering">Engineering</option>
              <option value="All Company">All Company</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
            ) : meetings.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No meetings found.</div>
            ) : (
              meetings.map((m) => {
                const isSelected = selectedMeeting?._id === m._id;
                const dateFormatted = new Date(m.meetingDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <div
                    key={m._id}
                    onClick={() => setSelectedMeeting(m)}
                    style={{
                      padding: '14px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: isSelected ? '#6C5CE7' : 'var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-surface-subtle)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                        {m.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          backgroundColor: m.status === 'completed' ? '#D1FAE5' : '#DBEAFE',
                          color: m.status === 'completed' ? '#065F46' : '#1E40AF',
                          textTransform: 'capitalize'
                        }}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {dateFormatted} • {m.startTime}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                      <span>{m.department}</span>
                      <span style={{ fontWeight: 600, color: '#6C5CE7' }}>
                        {m.actionItems.length} action items
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Meeting Session Desk */}
        {selectedMeeting ? (
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px' }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '18px', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                  {selectedMeeting.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', fontSize: '0.84rem', color: 'var(--color-text-secondary)' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} style={{ color: '#6C5CE7' }} /> {new Date(selectedMeeting.meetingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {selectedMeeting.startTime} - {selectedMeeting.endTime}
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} style={{ color: '#2563EB' }} /> {selectedMeeting.location}
                  </span>
                </div>
              </div>

              {selectedMeeting.meetingLink && (
                <a
                  href={selectedMeeting.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    padding: '8px 14px',
                    borderRadius: '6px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <Video size={15} /> Join Live Meet <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Agenda section */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', textTransform: 'uppercase' }}>
                Meeting Agenda
              </h3>
              <div style={{ backgroundColor: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '14px' }}>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.86rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedMeeting.agenda.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Minutes & Notes */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', textTransform: 'uppercase' }}>
                Minutes & Summary Notes
              </h3>
              <div style={{ backgroundColor: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '14px', fontSize: '0.86rem', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
                {selectedMeeting.notes || 'No notes taken during this session.'}
              </div>
            </div>

            {/* Action Items Checklist Section */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, textTransform: 'uppercase' }}>
                  Action Items & Task Deliverables ({selectedMeeting.actionItems.filter(a => a.completed).length}/{selectedMeeting.actionItems.length})
                </h3>
              </div>

              {/* Action items list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {selectedMeeting.actionItems.length === 0 ? (
                  <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>
                    No action items created yet for this meeting.
                  </div>
                ) : (
                  selectedMeeting.actionItems.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleToggleActionItem(selectedMeeting._id, idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: item.completed ? '#10B981' : 'var(--color-border)',
                        backgroundColor: item.completed ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {}}
                        style={{ width: '16px', height: '16px', accentColor: '#10B981', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1, fontSize: '0.86rem', fontWeight: 600, color: item.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)', textDecoration: item.completed ? 'line-through' : 'none' }}>
                        {item.task}
                      </div>
                      <span style={{ fontSize: '0.76rem', color: '#6C5CE7', fontWeight: 600, backgroundColor: 'rgba(108, 92, 231, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        {item.assignee}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Add Action Item Inline Form */}
              <form onSubmit={handleAddActionItem} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  required
                  placeholder="New action item takeaway..."
                  value={newActionItem.task}
                  onChange={(e) => setNewActionItem({ ...newActionItem, task: e.target.value })}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.84rem'
                  }}
                />
                <input
                  type="text"
                  required
                  placeholder="Assignee (e.g. Alex Morgan)"
                  value={newActionItem.assignee}
                  onChange={(e) => setNewActionItem({ ...newActionItem, assignee: e.target.value })}
                  style={{
                    width: '180px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.84rem'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#6C5CE7',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </form>
            </div>

            {/* Attendees roster */}
            <div>
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '10px', textTransform: 'uppercase' }}>
                Attendees Roster ({selectedMeeting.attendees.length})
              </h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedMeeting.attendees.map((attendee, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '0.78rem',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    {attendee.name} ({attendee.role})
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Select a meeting session from the list.
          </div>
        )}
      </div>

      {/* Schedule Meeting Modal */}
      {isNewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '520px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Schedule Sync Session
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateMeeting}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Sprint Architecture Review"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Executive">Executive</option>
                    <option value="Sales">Sales</option>
                    <option value="All Company">All Company</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.meetingDate}
                    onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Start Time
                  </label>
                  <input
                    type="text"
                    placeholder="10:00 AM"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    End Time
                  </label>
                  <input
                    type="text"
                    placeholder="11:00 AM"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Video / Meeting Link
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Agenda (Line by line)
                </label>
                <textarea
                  rows={3}
                  placeholder="Item 1&#10;Item 2"
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#6C5CE7',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Create Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
