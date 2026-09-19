'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Video,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface CalendarEventItem {
  _id: string;
  title: string;
  description?: string;
  eventType: 'meeting' | 'holiday' | 'company_event' | 'deadline' | 'performance_review';
  startDate: string;
  endDate: string;
  allDay: boolean;
  organizerName: string;
  meetingLink?: string;
  roomLocation?: string;
  color?: string;
}

export default function CompanyCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 20)); // Sep 2026
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'meeting' | 'holiday' | 'company_event' | 'deadline'>('meeting');
  const [formDate, setFormDate] = useState('2026-09-22');
  const [formStart, setFormStart] = useState('14:00');
  const [formEnd, setFormEnd] = useState('15:00');
  const [formLocation, setFormLocation] = useState('Conference Room Alpha / Virtual');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get<CalendarEventItem[]>('/api/calendar/events');
      if (res.data && res.data.length > 0) {
        setEvents(res.data);
        setSelectedEvent(res.data[0]);
      } else {
        // Seed default calendar events
        const demoEvents: CalendarEventItem[] = [
          {
            _id: 'ev-1',
            title: 'Q3 Executive All-Hands & Strategy Reveal',
            description: 'Company-wide quarterly review of revenue, velocity, and bonus announcements.',
            eventType: 'company_event',
            startDate: '2026-09-22T15:00:00.000Z',
            endDate: '2026-09-22T16:30:00.000Z',
            allDay: false,
            organizerName: 'Alex Rivera (CEO)',
            meetingLink: 'https://meet.sparkx.io/all-hands-q3',
            roomLocation: 'Main Auditorium & Live Stream',
            color: '#0984E3'
          },
          {
            _id: 'ev-2',
            title: 'Technical Systems Architecture Review',
            description: 'Sprint planning and microservices resilience review for engineering leads.',
            eventType: 'meeting',
            startDate: '2026-09-24T14:00:00.000Z',
            endDate: '2026-09-24T15:00:00.000Z',
            allDay: false,
            organizerName: 'Marcus Vance',
            meetingLink: 'https://meet.sparkx.io/eng-arch',
            roomLocation: 'Google Meet',
            color: '#6C5CE7'
          },
          {
            _id: 'ev-3',
            title: 'Q3 Performance Appraisals Submission Cutoff',
            description: 'Self-evaluations and direct report manager rubric scores due by midnight.',
            eventType: 'deadline',
            startDate: '2026-09-30T23:59:00.000Z',
            endDate: '2026-09-30T23:59:00.000Z',
            allDay: true,
            organizerName: 'HR Leadership',
            color: '#D63031'
          },
          {
            _id: 'ev-4',
            title: 'National Labor Observance Day',
            description: 'Official corporate paid holiday for all global branches.',
            eventType: 'holiday',
            startDate: '2026-09-07T00:00:00.000Z',
            endDate: '2026-09-07T23:59:00.000Z',
            allDay: true,
            organizerName: 'Corporate Office',
            color: '#00B894'
          }
        ];
        setEvents(demoEvents);
        setSelectedEvent(demoEvents[0]);
      }
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;
    try {
      setSubmitting(true);
      const startDateTime = new Date(`${formDate}T${formStart}:00.000Z`);
      const endDateTime = new Date(`${formDate}T${formEnd}:00.000Z`);

      const eventColor =
        formType === 'meeting'
          ? '#6C5CE7'
          : formType === 'holiday'
          ? '#00B894'
          : formType === 'deadline'
          ? '#D63031'
          : '#0984E3';

      await api.post('/api/calendar/events', {
        title: formTitle,
        description: formDescription,
        eventType: formType,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: false,
        roomLocation: formLocation,
        color: eventColor
      });
      setIsScheduleModalOpen(false);
      setFormTitle('');
      setFormDescription('');
      fetchEvents();
    } catch {
      setIsScheduleModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Calendar math for Sep 2026 (starts Tuesday Sep 1, 30 days)
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i - firstDayIndex + 1;
    if (dayNum > 0 && dayNum <= daysInMonth) return dayNum;
    return null;
  });

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
              <CalendarIcon size={20} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Company Calendar & Meetings
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Schedule cross-department syncs, track milestone deadlines, view corporate holidays, and join video conferences.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            variant="primary"
            onClick={() => setIsScheduleModalOpen(true)}
            style={{
              backgroundColor: '#6C5CE7',
              borderColor: '#6C5CE7',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
            Schedule Meeting
          </Button>
        </div>
      </div>

      {/* Main Grid: Calendar on Left, Event Inspector on Right */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {/* Calendar Area */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          <Card padding="md" style={{ backgroundColor: 'var(--bg-surface)' }}>
            {/* Month Navigator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {monthName} {year}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(2026, 8, 20))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Today
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '8px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day Cells Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px'
              }}
            >
              {daysArray.map((day, idx) => {
                if (!day) {
                  return <div key={idx} style={{ height: '75px', borderRadius: '6px', backgroundColor: 'transparent' }} />;
                }

                // Match events on this day
                const dayEvents = events.filter((ev) => {
                  const evDate = new Date(ev.startDate);
                  return evDate.getDate() === day && evDate.getMonth() === month && evDate.getFullYear() === year;
                });

                const isToday = day === 20;

                return (
                  <div
                    key={idx}
                    style={{
                      minHeight: '75px',
                      borderRadius: '6px',
                      border: isToday ? '2px solid #6C5CE7' : '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)',
                      padding: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: isToday ? 800 : 600, color: isToday ? '#6C5CE7' : 'var(--text-primary)' }}>
                      {day}
                    </span>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {dayEvents.map((ev) => (
                        <div
                          key={ev._id}
                          onClick={() => setSelectedEvent(ev)}
                          title={ev.title}
                          style={{
                            padding: '2px 4px',
                            borderRadius: '3px',
                            backgroundColor: ev.color || '#6C5CE7',
                            color: '#FFFFFF',
                            fontSize: '10px',
                            fontWeight: 700,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer'
                          }}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Area: Selected Event Inspector Drawer */}
        <div style={{ width: '360px', flexShrink: 0 }}>
          <Card padding="md" style={{ backgroundColor: 'var(--bg-surface)', height: '100%' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Event Details & Video Room
            </div>

            {selectedEvent ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: selectedEvent.color || '#6C5CE7',
                        color: '#FFFFFF',
                        textTransform: 'uppercase'
                      }}
                    >
                      {selectedEvent.eventType.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                    {selectedEvent.title}
                  </h3>

                  {selectedEvent.description && (
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {selectedEvent.description}
                    </p>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                    <Clock size={16} color="#6C5CE7" />
                    <span>
                      {new Date(selectedEvent.startDate).toLocaleDateString()} at{' '}
                      {new Date(selectedEvent.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                    <MapPin size={16} color="#6C5CE7" />
                    <span>{selectedEvent.roomLocation || 'Virtual Video Room'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-primary)' }}>
                    <Users size={16} color="#6C5CE7" />
                    <span>Host: {selectedEvent.organizerName}</span>
                  </div>
                </div>

                {selectedEvent.meetingLink && (
                  <div style={{ marginTop: '10px' }}>
                    <a
                      href={selectedEvent.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        backgroundColor: '#6C5CE7',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '13px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Video size={16} />
                      Join Video Conference
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Select an event cell in the calendar to view participants, room schedule, and video conference link.
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      <Modal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} title="Schedule Company Meeting or Event">
        <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Meeting Title *
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Sprint Architecture Sync"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Event Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
              >
                <option value="meeting">Team Meeting</option>
                <option value="company_event">Company Event</option>
                <option value="deadline">Sprint / OKR Deadline</option>
                <option value="holiday">Corporate Holiday</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Event Date
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Start Time
              </label>
              <input
                type="time"
                value={formStart}
                onChange={(e) => setFormStart(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                End Time
              </label>
              <input
                type="time"
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Room Location / Meeting Link
            </label>
            <input
              type="text"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              placeholder="e.g. Conference Room Alpha / Virtual"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting} style={{ backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }}>
              Save & Send Invites
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
