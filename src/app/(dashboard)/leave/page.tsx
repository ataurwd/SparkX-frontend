'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { apiRequest } from '../../../lib/api';
import {
  CalendarDays,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  FileText
} from 'lucide-react';

interface LeaveBalanceCard {
  id: string;
  name: string;
  code: string;
  color: string;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

interface LeaveRequestItem {
  id: string;
  type: string;
  code: string;
  color: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending_manager' | 'pending_hr' | 'approved' | 'rejected' | 'cancelled';
  managerDecision?: string;
  hrDecision?: string;
  rejectionReason?: string;
  appliedOn: string;
}

export default function LeaveSelfServicePage() {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [balances, setBalances] = useState<LeaveBalanceCard[]>([
    { id: 'b-1', name: 'Annual / Paid Vacation', code: 'ANN', color: '#6C5CE7', totalDays: 15, usedDays: 3, pendingDays: 0, remainingDays: 12 },
    { id: 'b-2', name: 'Casual Leave', code: 'CAS', color: '#10B981', totalDays: 10, usedDays: 2, pendingDays: 0, remainingDays: 8 },
    { id: 'b-3', name: 'Medical / Sick Leave', code: 'SCK', color: '#F59E0B', totalDays: 10, usedDays: 1, pendingDays: 0, remainingDays: 9 },
    { id: 'b-4', name: 'Emergency Leave', code: 'EMG', color: '#EF4444', totalDays: 3, usedDays: 0, pendingDays: 0, remainingDays: 3 },
    { id: 'b-5', name: 'Maternity / Paternity', code: 'MAT', color: '#0EA5E9', totalDays: 90, usedDays: 0, pendingDays: 0, remainingDays: 90 },
    { id: 'b-6', name: 'Unpaid Leave (LWP)', code: 'UNP', color: '#5F6480', totalDays: 30, usedDays: 0, pendingDays: 0, remainingDays: 30 }
  ]);

  const [myRequests, setMyRequests] = useState<LeaveRequestItem[]>([
    {
      id: 'req-1',
      type: 'Annual / Paid Vacation',
      code: 'ANN',
      color: '#6C5CE7',
      startDate: '2026-10-01',
      endDate: '2026-10-03',
      totalDays: 3,
      reason: 'Family vacation & personal time off',
      status: 'approved',
      managerDecision: 'Approved by Marcus Sterling',
      hrDecision: 'Approved by Elena Rostova',
      appliedOn: 'Sep 19, 2026'
    },
    {
      id: 'req-2',
      type: 'Casual Leave',
      code: 'CAS',
      color: '#10B981',
      startDate: '2026-08-14',
      endDate: '2026-08-15',
      totalDays: 2,
      reason: 'Personal family event',
      status: 'approved',
      appliedOn: 'Aug 10, 2026'
    }
  ]);

  const calculatedDays = React.useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return 0;
    const diff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  const fetchData = async () => {
    try {
      const [typesRes, balRes, reqRes] = await Promise.all([
        apiRequest('/leave/types'),
        apiRequest('/leave/balances'),
        apiRequest('/leave/my-requests')
      ]);

      if (typesRes.success && typesRes.data && typesRes.data.length > 0) {
        setLeaveTypes(typesRes.data);
        if (!selectedTypeId) setSelectedTypeId(typesRes.data[0]._id);
      }

      if (balRes.success && balRes.data && balRes.data.length > 0) {
        const mapped: LeaveBalanceCard[] = balRes.data.map((b: any) => ({
          id: b._id,
          name: b.leaveTypeId?.name || 'Leave',
          code: b.leaveTypeId?.code || 'LEAVE',
          color: b.leaveTypeId?.color || '#6C5CE7',
          totalDays: b.totalDays,
          usedDays: b.usedDays,
          pendingDays: b.pendingDays,
          remainingDays: b.remainingDays
        }));
        setBalances(mapped);
      }

      if (reqRes.success && reqRes.data && reqRes.data.length > 0) {
        const mappedReq: LeaveRequestItem[] = reqRes.data.map((r: any) => ({
          id: r._id,
          type: r.leaveTypeId?.name || 'Leave',
          code: r.leaveTypeId?.code || 'LV',
          color: r.leaveTypeId?.color || '#6C5CE7',
          startDate: new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          endDate: new Date(r.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          totalDays: r.totalDays,
          reason: r.reason,
          status: r.status,
          appliedOn: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          managerDecision: r.managerApproval?.status === 'approved' ? `Approved by ${r.managerApproval.approverId?.firstName || 'Manager'}` : undefined,
          hrDecision: r.hrApproval?.status === 'approved' ? `Approved by ${r.hrApproval.approverId?.firstName || 'HR'}` : undefined
        }));
        setMyRequests(mappedReq);
      }
    } catch (err) {
      console.warn('Could not load leave records:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeId || !startDate || !endDate || !reason.trim()) {
      setMessage({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await apiRequest('/leave/apply', {
        method: 'POST',
        body: JSON.stringify({
          leaveTypeId: selectedTypeId,
          startDate,
          endDate,
          reason: reason.trim()
        })
      });

      if (res.success) {
        setIsApplyModalOpen(false);
        setMessage({ text: 'Leave application submitted for Manager (Tier 1) review!', type: 'success' });
        setReason('');
        setStartDate('');
        setEndDate('');
        fetchData();
      } else {
        setMessage({ text: res.error || 'Failed to submit leave application', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Network error', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<LeaveRequestItem>[] = [
    {
      key: 'type',
      header: 'Category',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: row.color }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{row.type}</div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>CODE: {row.code}</span>
          </div>
        </div>
      )
    },
    {
      key: 'dates',
      header: 'Leave Duration',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
            {row.startDate} → {row.endDate}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 700 }}>
            {row.totalDays} {row.totalDays === 1 ? 'Day' : 'Days'}
          </div>
        </div>
      )
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (row) => (
        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '280px', display: 'inline-block' }}>
          {row.reason}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Two-Tier Approval Status',
      render: (row) => {
        if (row.status === 'pending_manager') {
          return (
            <div>
              <Badge variant="warning" dot>Tier 1: Pending Manager</Badge>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px' }}>Awaiting Squad Lead</div>
            </div>
          );
        }
        if (row.status === 'pending_hr') {
          return (
            <div>
              <Badge variant="info" dot>Tier 2: Pending HR</Badge>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '3px' }}>Manager Approved ✓</div>
            </div>
          );
        }
        if (row.status === 'approved') {
          return (
            <div>
              <Badge variant="success" dot>Fully Approved</Badge>
              <div style={{ fontSize: '11px', color: 'var(--color-success)', marginTop: '3px' }}>Tier 1 & Tier 2 Validated</div>
            </div>
          );
        }
        return <Badge variant="danger" dot>Rejected</Badge>;
      }
    },
    {
      key: 'appliedOn',
      header: 'Applied Date',
      render: (row) => (
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{row.appliedOn}</span>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Badge variant="primary" dot style={{ marginBottom: '6px' }}>Employee Self-Service</Badge>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Leave Balances & Applications
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Check your yearly statutory leave entitlements, submit time-off requests, and monitor your two-tier approval workflow.
            </p>
          </div>

          <Button
            variant="primary"
            style={{ backgroundColor: 'var(--color-primary)' }}
            iconPrefix={<Plus size={16} strokeWidth={2.5} />}
            onClick={() => setIsApplyModalOpen(true)}
          >
            Apply for Leave
          </Button>
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

        {/* Leave Balances Grid (Solid Crisp Cards, NO Gradients) */}
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '14px' }}>
            Yearly Entitlement Balances ({new Date().getFullYear()})
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {balances.map((b) => {
              const usagePercent = Math.min(100, Math.round((b.usedDays / (b.totalDays || 1)) * 100));
              return (
                <div
                  key={b.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: b.color }} />
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-main)' }}>
                        {b.name}
                      </div>
                    </div>
                    <Badge variant="neutral">{b.code}</Badge>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '32px', fontWeight: 800, color: b.color, letterSpacing: '-0.03em' }}>
                      {b.remainingDays}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      Days Remaining of {b.totalDays}
                    </span>
                  </div>

                  {/* Progress Bar (Solid Color) */}
                  <div style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: 'var(--color-surface-soft)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${usagePercent}%`,
                        height: '100%',
                        backgroundColor: b.color,
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '10px' }}>
                    <span>Used: <strong>{b.usedDays} Days</strong></span>
                    <span>Pending: <strong>{b.pendingDays} Days</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* My Leave Requests Table */}
        <Card
          title="My Leave History & Two-Tier Status"
          subtitle="Tracks submissions from Employee → Manager (Tier 1) → HR (Tier 2) validation"
        >
          <DataTable
            data={myRequests}
            columns={columns}
            emptyMessage="No leave requests applied yet."
          />
        </Card>

        {/* Apply for Leave Modal */}
        <Modal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          title="Apply for Leave"
          subtitle="Submits into the two-tier review pipeline (Manager → HR validation)."
        >
          <form onSubmit={handleApplyLeave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Leave Category
              </label>
              <select
                value={selectedTypeId}
                onChange={(e) => setSelectedTypeId(e.target.value)}
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
                {leaveTypes.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.code}) — {t.daysAllowed} Days/Yr
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            {calculatedDays > 0 && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-soft)',
                  border: '1px solid var(--color-border)',
                  fontSize: '13px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>Calculated Duration:</span>
                <span style={{ fontWeight: 800, color: 'var(--color-primary)', fontSize: '15px' }}>
                  {calculatedDays} {calculatedDays === 1 ? 'Working Day' : 'Working Days'}
                </span>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Reason for Leave
              </label>
              <textarea
                placeholder="Please state the specific reason and handover coverage plan..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
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
              <Button type="button" variant="outline" onClick={() => setIsApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                style={{ backgroundColor: 'var(--color-primary)' }}
                isLoading={isSubmitting}
              >
                Submit Application
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
