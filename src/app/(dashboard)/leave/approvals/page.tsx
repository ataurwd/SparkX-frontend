'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { apiRequest } from '../../../../lib/api';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  ArrowRight,
  Filter,
  Check,
  X,
  MessageSquare
} from 'lucide-react';

interface ApprovalRequest {
  id: string;
  employee: {
    id: string;
    name: string;
    code: string;
    department: string;
    avatarUrl?: string;
  };
  leaveType: {
    name: string;
    code: string;
    color: string;
  };
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending_manager' | 'pending_hr' | 'approved' | 'rejected';
  managerApproval?: {
    status: string;
    approverName?: string;
    comment?: string;
  };
  hrApproval?: {
    status: string;
    approverName?: string;
    comment?: string;
  };
  appliedAt: string;
}

export default function LeaveApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending_manager' | 'pending_hr' | 'approved' | 'rejected'>('all');
  const [requests, setRequests] = useState<ApprovalRequest[]>([
    {
      id: 'req-101',
      employee: {
        id: 'emp-2',
        name: 'David Kim',
        code: 'SPX-004',
        department: 'Engineering & Technology',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
      },
      leaveType: { name: 'Annual / Paid Vacation', code: 'ANN', color: '#6C5CE7' },
      startDate: 'Oct 05, 2026',
      endDate: 'Oct 09, 2026',
      totalDays: 5,
      reason: 'Attending annual tech conference and taking personal rest days.',
      status: 'pending_manager',
      appliedAt: 'Sep 19, 2026'
    },
    {
      id: 'req-102',
      employee: {
        id: 'emp-3',
        name: 'Sarah Jenkins',
        code: 'SPX-003',
        department: 'Product & Design',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
      },
      leaveType: { name: 'Casual Leave', code: 'CAS', color: '#10B981' },
      startDate: 'Sep 24, 2026',
      endDate: 'Sep 25, 2026',
      totalDays: 2,
      reason: 'Urgent domestic personal commitments.',
      status: 'pending_hr',
      managerApproval: {
        status: 'approved',
        approverName: 'Marcus Sterling',
        comment: 'Work covered by Priya Sharma'
      },
      appliedAt: 'Sep 18, 2026'
    },
    {
      id: 'req-103',
      employee: {
        id: 'emp-4',
        name: 'Liam O\'Connor',
        code: 'SPX-007',
        department: 'Engineering & Technology'
      },
      leaveType: { name: 'Medical / Sick Leave', code: 'SCK', color: '#F59E0B' },
      startDate: 'Sep 10, 2026',
      endDate: 'Sep 11, 2026',
      totalDays: 2,
      reason: 'Viral fever rest period as advised by physician.',
      status: 'approved',
      managerApproval: { status: 'approved', approverName: 'Marcus Sterling' },
      hrApproval: { status: 'approved', approverName: 'Elena Rostova' },
      appliedAt: 'Sep 09, 2026'
    }
  ]);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<ApprovalRequest | null>(null);
  const [decisionType, setDecisionType] = useState<'approve' | 'reject'>('approve');
  const [commentText, setCommentText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchApprovals = async () => {
    try {
      const res = await apiRequest('/leave/approvals');
      if (res.success && res.data && res.data.length > 0) {
        const mapped: ApprovalRequest[] = res.data.map((r: any) => ({
          id: r._id,
          employee: {
            id: r.employeeId?._id || 'emp',
            name: `${r.employeeId?.firstName || 'Staff'} ${r.employeeId?.lastName || 'Member'}`,
            code: r.employeeId?.employeeCode || 'SPX',
            department: r.employeeId?.departmentId?.name || 'Engineering',
            avatarUrl: r.employeeId?.avatarUrl
          },
          leaveType: {
            name: r.leaveTypeId?.name || 'Leave',
            code: r.leaveTypeId?.code || 'LV',
            color: r.leaveTypeId?.color || '#6C5CE7'
          },
          startDate: new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          endDate: new Date(r.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          totalDays: r.totalDays,
          reason: r.reason,
          status: r.status,
          appliedAt: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          managerApproval: r.managerApproval ? {
            status: r.managerApproval.status,
            approverName: r.managerApproval.approverId ? `${r.managerApproval.approverId.firstName} ${r.managerApproval.approverId.lastName}` : undefined,
            comment: r.managerApproval.comment
          } : undefined,
          hrApproval: r.hrApproval ? {
            status: r.hrApproval.status,
            approverName: r.hrApproval.approverId ? `${r.hrApproval.approverId.firstName} ${r.hrApproval.approverId.lastName}` : undefined,
            comment: r.hrApproval.comment
          } : undefined
        }));
        setRequests(mapped);
      }
    } catch (err) {
      console.warn('Could not load leave approvals:', err);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleReviewAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setIsProcessing(true);
    setActionSuccess(null);

    try {
      const res = await apiRequest(`/leave/approvals/${selectedReq.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          decision: decisionType,
          comment: commentText.trim()
        })
      });

      if (res.success) {
        setReviewModalOpen(false);
        setCommentText('');
        setActionSuccess(`Leave request successfully ${decisionType === 'approve' ? 'approved' : 'rejected'}!`);
        setTimeout(() => setActionSuccess(null), 3000);
        fetchApprovals();
      } else {
        alert(res.error || 'Failed to submit decision');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'all') return true;
    return r.status === activeTab;
  });

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Badge variant="primary" dot style={{ marginBottom: '6px' }}>Workflow Engine</Badge>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Two-Tier Leave Approvals Queue
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Multi-tier validation pipeline: Tier 1 (Department Manager / Team Lead) → Tier 2 (HR Admin / Executive Authority).
            </p>
          </div>

          {actionSuccess && (
            <Badge variant="success" dot style={{ padding: '8px 14px', fontSize: '13px' }}>
              {actionSuccess}
            </Badge>
          )}
        </div>

        {/* Tab Filter Navigation (Solid Clean Buttons) */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
          {[
            { id: 'all', label: 'All Requests', count: requests.length },
            { id: 'pending_manager', label: 'Tier 1: Manager Review', count: requests.filter((r) => r.status === 'pending_manager').length },
            { id: 'pending_hr', label: 'Tier 2: HR Final Review', count: requests.filter((r) => r.status === 'pending_hr').length },
            { id: 'approved', label: 'Approved', count: requests.filter((r) => r.status === 'approved').length },
            { id: 'rejected', label: 'Rejected', count: requests.filter((r) => r.status === 'rejected').length }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: activeTab === tab.id ? 'var(--color-primary)' : '#FFFFFF',
                color: activeTab === tab.id ? '#FFFFFF' : 'var(--color-text-secondary)',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: activeTab === tab.id ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-surface-soft)',
                  color: activeTab === tab.id ? '#FFFFFF' : 'var(--color-text-main)'
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Approval Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredRequests.length === 0 ? (
            <Card>
              <div style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <CheckCircle2 size={36} color="var(--color-success)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  All Caught Up!
                </div>
                <div style={{ fontSize: '13px', marginTop: '4px' }}>
                  No leave requests currently pending in this queue.
                </div>
              </div>
            </Card>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  padding: '20px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Top Row: Employee Profile + Category Badge + Total Days */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {req.employee.avatarUrl ? (
                      <img
                        src={req.employee.avatarUrl}
                        alt={req.employee.name}
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '14px'
                        }}
                      >
                        {req.employee.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                        {req.employee.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {req.employee.code} • {req.employee.department} • Applied on {req.appliedAt}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-border)' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: req.leaveType.color }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)' }}>{req.leaveType.name}</span>
                    </div>

                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {req.totalDays} {req.totalDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                </div>

                {/* Middle: Duration & Reason */}
                <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} color="var(--color-primary)" />
                    <span>LEAVE DATES: {req.startDate} → {req.endDate}</span>
                  </div>
                  <div style={{ fontSize: '13.5px', color: 'var(--color-text-main)', lineHeight: 1.5 }}>
                    "{req.reason}"
                  </div>
                </div>

                {/* Bottom Row: 2-Tier Pipeline Tracker & Decision Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '14px' }}>
                  {/* Two-Tier Status Pipeline Indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Tier 1 Manager */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: req.status === 'pending_manager' ? '#F59E0B' : '#10B981',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        1
                      </div>
                      <span style={{ color: 'var(--color-text-main)' }}>
                        Tier 1 (Manager): {req.status === 'pending_manager' ? 'Awaiting Review' : 'Approved ✓'}
                      </span>
                    </div>

                    <ArrowRight size={14} color="var(--color-text-muted)" />

                    {/* Tier 2 HR */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: req.status === 'approved' ? '#10B981' : req.status === 'pending_hr' ? '#0EA5E9' : '#CBD5E1',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        2
                      </div>
                      <span style={{ color: req.status === 'approved' ? 'var(--color-success)' : req.status === 'pending_hr' ? 'var(--color-info)' : 'var(--color-text-muted)' }}>
                        Tier 2 (HR): {req.status === 'approved' ? 'Finalized ✓' : req.status === 'pending_hr' ? 'Awaiting HR' : 'Queued'}
                      </span>
                    </div>
                  </div>

                  {/* Actions for Pending Requests */}
                  {(req.status === 'pending_manager' || req.status === 'pending_hr') && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
                        iconPrefix={<X size={14} />}
                        onClick={() => {
                          setSelectedReq(req);
                          setDecisionType('reject');
                          setReviewModalOpen(true);
                        }}
                      >
                        Reject
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        style={{ backgroundColor: 'var(--color-success)' }}
                        iconPrefix={<Check size={14} strokeWidth={2.5} />}
                        onClick={() => {
                          setSelectedReq(req);
                          setDecisionType('approve');
                          setReviewModalOpen(true);
                        }}
                      >
                        {req.status === 'pending_manager' ? 'Approve Tier 1' : 'Grant Final HR Approval'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Confirmation Modal */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={decisionType === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
          subtitle={
            selectedReq?.status === 'pending_manager'
              ? 'Tier 1 Review: Manager Approval forwards request to HR validation.'
              : 'Tier 2 Review: HR Validation will officially finalize and deduct employee balance.'
          }
        >
          <form onSubmit={handleReviewAction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-soft)',
                border: '1px solid var(--color-border)',
                fontSize: '13px'
              }}
            >
              <div>Applicant: <strong>{selectedReq?.employee.name}</strong> ({selectedReq?.employee.code})</div>
              <div>Duration: <strong>{selectedReq?.startDate} → {selectedReq?.endDate}</strong> ({selectedReq?.totalDays} Days)</div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Review Comment / Feedback (Optional)
              </label>
              <textarea
                placeholder={decisionType === 'approve' ? 'e.g. Work coverage approved...' : 'e.g. Due to ongoing critical release...'}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
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
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <Button type="button" variant="outline" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                style={{
                  backgroundColor: decisionType === 'approve' ? 'var(--color-success)' : 'var(--color-danger)'
                }}
                isLoading={isProcessing}
              >
                Confirm {decisionType === 'approve' ? 'Approval' : 'Rejection'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
