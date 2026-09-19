'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { KpiCard } from '../../../components/ui/KpiCard';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { apiRequest } from '../../../lib/api';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock4,
  MapPin,
  TrendingUp,
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';

interface AttendanceLog {
  id: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workingHours: string;
  status: 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';
  notes?: string;
  isManual?: boolean;
}

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [checkInTimeStr, setCheckInTimeStr] = useState<string | null>(null);
  const [checkOutTimeStr, setCheckOutTimeStr] = useState<string | null>(null);
  const [todayStatus, setTodayStatus] = useState<string>('Not Clocked In');
  const [workNotes, setWorkNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [history, setHistory] = useState<AttendanceLog[]>([
    { id: '1', date: '2026-09-18', checkIn: '09:12 AM', checkOut: '06:05 PM', workingHours: '8h 53m', status: 'present', notes: 'Office HQ' },
    { id: '2', date: '2026-09-17', checkIn: '09:44 AM', checkOut: '06:30 PM', workingHours: '8h 46m', status: 'late', notes: 'Traffic delay' },
    { id: '3', date: '2026-09-16', checkIn: '09:05 AM', checkOut: '05:45 PM', workingHours: '8h 40m', status: 'present' },
    { id: '4', date: '2026-09-15', checkIn: '09:15 AM', checkOut: '01:30 PM', workingHours: '4h 15m', status: 'half_day', notes: 'Personal doctor visit' },
    { id: '5', date: '2026-09-12', checkIn: '09:00 AM', checkOut: '06:00 PM', workingHours: '9h 00m', status: 'present' }
  ]);

  // Live Digital Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's status & user history
  const fetchAttendance = async () => {
    try {
      const [todayRes, historyRes] = await Promise.all([
        apiRequest('/attendance/today'),
        apiRequest('/attendance/my-history')
      ]);

      if (todayRes.success && todayRes.data) {
        const d = todayRes.data;
        if (d.checkIn) {
          setIsCheckedIn(true);
          setCheckInTimeStr(new Date(d.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
          setTodayStatus(d.status === 'late' ? 'Late Arrival' : 'Present');
        }
        if (d.checkOut) {
          setIsCheckedOut(true);
          setCheckOutTimeStr(new Date(d.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
          setTodayStatus('Clocked Out');
        }
      }

      if (historyRes.success && historyRes.data && historyRes.data.length > 0) {
        const mapped: AttendanceLog[] = historyRes.data.map((r: any) => {
          const hours = Math.floor((r.workingMinutes || 0) / 60);
          const mins = (r.workingMinutes || 0) % 60;
          return {
            id: r._id,
            date: r.date,
            checkIn: r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
            checkOut: r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
            workingHours: r.workingMinutes ? `${hours}h ${mins}m` : '-',
            status: r.status,
            notes: r.notes || (r.isManualAdjustment ? `Adjusted: ${r.adjustmentReason}` : ''),
            isManual: r.isManualAdjustment
          };
        });
        setHistory(mapped);
      }
    } catch (err) {
      console.warn('Could not load attendance:', err);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleClockIn = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await apiRequest('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({ notes: workNotes })
      });
      if (res.success) {
        setIsCheckedIn(true);
        setMessage({ text: res.message || 'Successfully clocked in!', type: 'success' });
        fetchAttendance();
        setWorkNotes('');
      } else {
        setMessage({ text: res.error || 'Failed to clock in', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Network error', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await apiRequest('/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify({ notes: workNotes })
      });
      if (res.success) {
        setIsCheckedOut(true);
        setMessage({ text: res.message || 'Successfully clocked out!', type: 'success' });
        fetchAttendance();
        setWorkNotes('');
      } else {
        setMessage({ text: res.error || 'Failed to clock out', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Network error', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<AttendanceLog>[] = [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={15} color="var(--color-primary)" />
          <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{row.date}</span>
        </div>
      )
    },
    {
      key: 'checkIn',
      header: 'Clock In',
      render: (row) => (
        <span style={{ fontWeight: 600, color: row.status === 'late' ? 'var(--color-warning)' : 'var(--color-text-main)' }}>
          {row.checkIn}
        </span>
      )
    },
    {
      key: 'checkOut',
      header: 'Clock Out',
      render: (row) => (
        <span style={{ color: 'var(--color-text-secondary)' }}>{row.checkOut}</span>
      )
    },
    {
      key: 'workingHours',
      header: 'Logged Hours',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          {row.workingHours}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Daily Status',
      render: (row) => {
        const variantMap = {
          present: 'success',
          late: 'warning',
          half_day: 'info',
          absent: 'danger',
          on_leave: 'neutral'
        } as const;

        const labelMap = {
          present: 'Present',
          late: 'Late Arrival',
          half_day: 'Half Day',
          absent: 'Absent',
          on_leave: 'On Leave'
        };

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Badge variant={variantMap[row.status] || 'neutral'} dot>
              {labelMap[row.status] || row.status}
            </Badge>
            {row.isManual && (
              <Badge variant="neutral" style={{ fontSize: '10px' }}>HR Adjusted</Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'notes',
      header: 'Notes & Context',
      render: (row) => (
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
          {row.notes || '—'}
        </span>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Badge variant="primary" dot style={{ marginBottom: '6px' }}>Time & Attendance</Badge>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              My Attendance & Time Log
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Real-time web check-in, automated shift tracking, working hours, and personal attendance history.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="secondary"
              iconPrefix={<FileSpreadsheet size={16} />}
              onClick={() => alert('Exporting monthly attendance log...')}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: message.type === 'success' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
              color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
              border: `1px solid ${message.type === 'success' ? '#A7F3D0' : '#FECACA'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Punch In / Out Card + KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
          {/* Main Clock-In Card (Solid Modern Theme, NO Gradients) */}
          <Card
            title="Daily Attendance Punch"
            subtitle={currentDateStr || 'Today'}
            style={{ borderTop: '4px solid var(--color-primary)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Digital Clock Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  backgroundColor: 'var(--color-surface-soft)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)'
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Current System Time
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em', marginTop: '2px' }}>
                    {currentTime || '09:00:00 AM'}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                    Shift Window
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '4px' }}>
                    09:00 AM – 06:00 PM (1h Break)
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ flex: 1, padding: '12px 16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Today's Clock In</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
                    {checkInTimeStr || 'Not Clocked In'}
                  </div>
                </div>

                <div style={{ flex: 1, padding: '12px 16px', backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Today's Clock Out</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)', marginTop: '2px' }}>
                    {checkOutTimeStr || 'Pending'}
                  </div>
                </div>
              </div>

              {/* Work Notes Input */}
              <Input
                placeholder="Optional work notes or task summary for today..."
                value={workNotes}
                onChange={(e) => setWorkNotes(e.target.value)}
                disabled={isCheckedOut}
              />

              {/* Action Buttons: Solid Colors */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {!isCheckedIn ? (
                  <Button
                    variant="primary"
                    size="lg"
                    style={{ flex: 1, backgroundColor: 'var(--color-primary)' }}
                    iconPrefix={<LogIn size={18} />}
                    onClick={handleClockIn}
                    isLoading={isLoading}
                  >
                    Clock In for Today
                  </Button>
                ) : !isCheckedOut ? (
                  <Button
                    variant="danger"
                    size="lg"
                    style={{ flex: 1, backgroundColor: 'var(--color-danger)' }}
                    iconPrefix={<LogOut size={18} />}
                    onClick={handleClockOut}
                    isLoading={isLoading}
                  >
                    Clock Out for Today
                  </Button>
                ) : (
                  <div
                    style={{
                      width: '100%',
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-success-bg)',
                      color: 'var(--color-success)',
                      fontWeight: 700,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Completed Attendance for Today</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Quick Attendance Summary Radar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <KpiCard
              title="Present This Month"
              value="18 Days"
              trend={{ value: '100%', isPositive: true }}
              subtitle="Total logged work days"
              icon={<CheckCircle2 size={20} color="var(--color-primary)" />}
            />
            <KpiCard
              title="On-Time Arrival"
              value="94.4%"
              trend={{ value: '+2.1%', isPositive: true }}
              subtitle="Within 09:30 AM shift cutoff"
              icon={<Clock size={20} color="#10B981" />}
            />
            <KpiCard
              title="Avg. Daily Hours"
              value="8h 42m"
              subtitle="Productive office time"
              icon={<TrendingUp size={20} color="#0EA5E9" />}
            />
            <KpiCard
              title="Late Arrivals"
              value="1 Time"
              subtitle="Current calendar month"
              icon={<AlertCircle size={20} color="#F59E0B" />}
            />
          </div>
        </div>

        {/* Attendance Log Table */}
        <Card
          title="Attendance History & Timesheets"
          subtitle="Chronological record of daily check-in, check-out, and calculated working duration"
        >
          <DataTable
            data={history}
            columns={columns}
            searchable
            searchPlaceholder="Search attendance records by date or notes..."
            emptyMessage="No attendance records found for this period."
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
