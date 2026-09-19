'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { KpiCard } from '../../../../components/ui/KpiCard';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { apiRequest } from '../../../../lib/api';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
  Search,
  Plus,
  Edit3,
  FileSpreadsheet
} from 'lucide-react';

interface AttendanceRow {
  employeeId: string;
  code: string;
  name: string;
  email: string;
  department: string;
  checkIn: string;
  checkOut: string;
  workingHours: string;
  status: 'present' | 'late' | 'half_day' | 'absent' | 'on_leave';
  isAdjusted?: boolean;
}

export default function ManageAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  // Manual Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjEmployeeId, setAdjEmployeeId] = useState('');
  const [adjCheckIn, setAdjCheckIn] = useState('09:00');
  const [adjCheckOut, setAdjCheckOut] = useState('18:00');
  const [adjStatus, setAdjStatus] = useState<'present' | 'late' | 'half_day' | 'absent'>('present');
  const [adjReason, setAdjReason] = useState('');

  const [stats, setStats] = useState({
    totalEmployees: 24,
    present: 19,
    late: 2,
    halfDay: 1,
    onLeave: 1,
    absent: 1
  });

  const [rows, setRows] = useState<AttendanceRow[]>([
    {
      employeeId: 'emp-1',
      code: 'SPX-001',
      name: 'Amelia Demane',
      email: 'amelia.admin@sparkx.corp',
      department: 'Executive Leadership',
      checkIn: '09:02 AM',
      checkOut: '06:15 PM',
      workingHours: '9h 13m',
      status: 'present'
    },
    {
      employeeId: 'emp-2',
      code: 'SPX-002',
      name: 'Marcus Sterling',
      email: 'marcus@sparkx.corp',
      department: 'Engineering & Technology',
      checkIn: '09:15 AM',
      checkOut: '06:30 PM',
      workingHours: '9h 15m',
      status: 'present'
    },
    {
      employeeId: 'emp-3',
      code: 'SPX-003',
      name: 'Sarah Jenkins',
      email: 'sarah@sparkx.corp',
      department: 'Product & Design',
      checkIn: '09:42 AM',
      checkOut: '06:00 PM',
      workingHours: '8h 18m',
      status: 'late'
    },
    {
      employeeId: 'emp-4',
      code: 'SPX-004',
      name: 'David Kim',
      email: 'david@sparkx.corp',
      department: 'Engineering & Technology',
      checkIn: '09:08 AM',
      checkOut: '05:55 PM',
      workingHours: '8h 47m',
      status: 'present'
    },
    {
      employeeId: 'emp-5',
      code: 'SPX-005',
      name: 'Elena Rostova',
      email: 'elena@sparkx.corp',
      department: 'Human Resources',
      checkIn: '—',
      checkOut: '—',
      workingHours: '—',
      status: 'on_leave'
    }
  ]);

  const fetchDailyAttendance = async () => {
    setIsLoading(true);
    try {
      const res = await apiRequest(`/attendance/all?date=${selectedDate}`);
      if (res.success && res.data && res.data.length > 0) {
        const mapped: AttendanceRow[] = res.data.map((item: any) => {
          const emp = item.employee;
          const att = item.attendance;
          const hours = att?.workingMinutes ? Math.floor(att.workingMinutes / 60) : 0;
          const mins = att?.workingMinutes ? att.workingMinutes % 60 : 0;
          return {
            employeeId: emp._id,
            code: emp.employeeCode || 'SPX',
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email || '',
            department: emp.departmentId?.name || 'General',
            checkIn: att?.checkIn ? new Date(att.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
            checkOut: att?.checkOut ? new Date(att.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—',
            workingHours: att?.workingMinutes ? `${hours}h ${mins}m` : '—',
            status: item.status,
            isAdjusted: att?.isManualAdjustment
          };
        });
        setRows(mapped);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.warn('Could not fetch daily attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyAttendance();
  }, [selectedDate]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjEmployeeId || !adjReason.trim()) {
      alert('Please select an employee and provide an adjustment reason.');
      return;
    }

    try {
      const res = await apiRequest('/attendance/adjust', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: adjEmployeeId,
          date: selectedDate,
          checkInTime: adjCheckIn,
          checkOutTime: adjCheckOut,
          status: adjStatus,
          adjustmentReason: adjReason.trim()
        })
      });

      if (res.success) {
        setIsAdjustModalOpen(false);
        setAdjReason('');
        fetchDailyAttendance();
      } else {
        alert(res.error || 'Failed to adjust attendance');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    }
  };

  const filteredRows = rows.filter((r) => {
    const matchesSearch =
      !searchQuery.trim() ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<AttendanceRow>[] = [
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{row.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{row.code} • {row.department}</div>
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
      header: 'Hours Worked',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          {row.workingHours}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
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
            {row.isAdjusted && (
              <Badge variant="neutral" style={{ fontSize: '10px' }}>Adjusted</Badge>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          style={{ color: 'var(--color-primary)' }}
          iconPrefix={<Edit3 size={14} />}
          onClick={() => {
            setAdjEmployeeId(row.employeeId);
            setAdjStatus(row.status === 'on_leave' ? 'present' : row.status);
            setIsAdjustModalOpen(true);
          }}
        >
          Adjust
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Badge variant="primary" dot style={{ marginBottom: '6px' }}>Manager & HR Oversight</Badge>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Daily Attendance Overview
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Inspect organization-wide attendance roll call, late arrival trends, and perform authorized timesheet adjustments.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFFFFF', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <Calendar size={15} color="var(--color-primary)" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)' }}
              />
            </div>

            <Button
              variant="primary"
              style={{ backgroundColor: 'var(--color-primary)' }}
              iconPrefix={<Plus size={16} />}
              onClick={() => {
                if (rows.length > 0) setAdjEmployeeId(rows[0].employeeId);
                setIsAdjustModalOpen(true);
              }}
            >
              Adjust Record
            </Button>
          </div>
        </div>

        {/* 5-Card Roll Call KPI Grid (Solid Clean Borders, NO Gradients) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
          <KpiCard
            title="Total Headcount"
            value={stats.totalEmployees}
            subtitle="Configured personnel"
            icon={<Users size={20} color="var(--color-primary)" />}
          />
          <KpiCard
            title="Present Today"
            value={stats.present}
            subtitle="Logged in & working"
            icon={<CheckCircle2 size={20} color="#10B981" />}
          />
          <KpiCard
            title="Late Arrivals"
            value={stats.late}
            subtitle="After 09:30 AM cutoff"
            icon={<Clock size={20} color="#F59E0B" />}
          />
          <KpiCard
            title="On Leave"
            value={stats.onLeave}
            subtitle="Approved leave"
            icon={<Calendar size={20} color="#0EA5E9" />}
          />
          <KpiCard
            title="Absent"
            value={stats.absent}
            subtitle="No punch record"
            icon={<AlertCircle size={20} color="#EF4444" />}
          />
        </div>

        {/* Search & Filter Bar */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
            <div style={{ width: '320px' }}>
              <Input
                placeholder="Search staff by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconPrefix={<Search size={16} />}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'present', 'late', 'half_day', 'on_leave', 'absent'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: statusFilter === st ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: statusFilter === st ? 'var(--color-primary)' : '#FFFFFF',
                    color: statusFilter === st ? '#FFFFFF' : 'var(--color-text-secondary)',
                    transition: 'all 0.15s ease',
                    textTransform: 'capitalize'
                  }}
                >
                  {st === 'all' ? 'All Records' : st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            data={filteredRows}
            columns={columns}
            emptyMessage={`No attendance records found for ${selectedDate}.`}
          />
        </Card>

        {/* Manual Adjustment Modal */}
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title="Manual Attendance Adjustment"
          subtitle="Authorized HR modification. All adjustment logs are permanently timestamped."
        >
          <form onSubmit={handleAdjustSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Select Employee
              </label>
              <select
                value={adjEmployeeId}
                onChange={(e) => setAdjEmployeeId(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  padding: '0 12px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-main)'
                }}
                required
              >
                {rows.map((r) => (
                  <option key={r.employeeId} value={r.employeeId}>
                    {r.name} ({r.code} - {r.department})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label="Check In Time"
                type="time"
                value={adjCheckIn}
                onChange={(e) => setAdjCheckIn(e.target.value)}
              />
              <Input
                label="Check Out Time"
                type="time"
                value={adjCheckOut}
                onChange={(e) => setAdjCheckOut(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Status Designation
              </label>
              <select
                value={adjStatus}
                onChange={(e) => setAdjStatus(e.target.value as any)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  padding: '0 12px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-text-main)'
                }}
              >
                <option value="present">Present (Standard)</option>
                <option value="late">Late Arrival</option>
                <option value="half_day">Half Day</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Mandatory Reason for Adjustment
              </label>
              <textarea
                placeholder="e.g. Employee biometric scanner glitch or approved client field visit..."
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  color: 'var(--color-text-main)',
                  resize: 'vertical'
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <Button type="button" variant="outline" onClick={() => setIsAdjustModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" style={{ backgroundColor: 'var(--color-primary)' }}>
                Commit Adjustment
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
