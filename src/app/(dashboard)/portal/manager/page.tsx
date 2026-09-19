'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckSquare,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  UserCheck,
  Building,
  Layers,
  Calendar,
  Sparkles,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { KpiCard } from '@/components/ui/KpiCard';
import { apiRequest } from '@/lib/api';

interface PendingApprovalItem {
  id: string;
  itemType: 'leave' | 'expense';
  employee: string;
  role: string;
  type: string;
  dates: string;
  reason: string;
  avatarUrl: string;
  status: string;
}

interface TeamMemberItem {
  name: string;
  role: string;
  status: string;
  tasksDone: number;
  blocked: number;
  progress: number;
}

export default function ManagerOperationsHubPage() {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApprovalItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberItem[]>([
    { name: 'Alex Rivera', role: 'Staff Backend Architect', status: 'PRESENT', tasksDone: 11, blocked: 0, progress: 85 },
    { name: 'Sophia Chen', role: 'Senior Product Designer', status: 'PRESENT', tasksDone: 8, blocked: 0, progress: 92 },
    { name: 'Marcus Vance', role: 'Frontend Tech Lead', status: 'LATE', tasksDone: 7, blocked: 1, progress: 68 },
    { name: 'Elena Rostova', role: 'People Ops Lead', status: 'ON_LEAVE', tasksDone: 5, blocked: 0, progress: 75 }
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [stats, setStats] = useState({
    teamPresent: '21 / 24',
    attendanceRate: '87.5%',
    pendingAuthorizations: 3,
    activeSprintVelocity: '78.4%',
    activeRoadblocks: '1 Blocked'
  });

  // Load live approvals and stats from MongoDB Atlas
  const loadApprovals = async () => {
    try {
      setIsLoading(true);
      const [apprRes, statsRes] = await Promise.all([
        apiRequest('/portal/manager/approvals'),
        apiRequest('/portal/manager/stats')
      ]);

      if (apprRes.success && Array.isArray(apprRes.data)) {
        setPendingApprovals(apprRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats({
          teamPresent: statsRes.data.teamPresent || '21 / 24',
          attendanceRate: statsRes.data.attendanceRate || '87.5%',
          pendingAuthorizations: apprRes.data ? apprRes.data.length : (statsRes.data.pendingAuthorizations || 0),
          activeSprintVelocity: statsRes.data.activeSprintVelocity || '78.4%',
          activeRoadblocks: statsRes.data.activeRoadblocks || '1 Blocked'
        });
        if (Array.isArray(statsRes.data.teamMembers)) {
          setTeamMembers(statsRes.data.teamMembers);
        }
      }
    } catch (err) {
      console.warn('[Manager Portal] Error fetching live approvals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  // Handle Approve with Real MongoDB Persistence
  const handleApprove = async (req: PendingApprovalItem) => {
    setProcessingId(req.id);
    setFeedbackMessage(null);

    try {
      const res = await apiRequest(`/portal/manager/approvals/${req.itemType}/${req.id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'approve' })
      });

      if (res.success) {
        setPendingApprovals((prev) => prev.filter((a) => a.id !== req.id));
        setStats((prev) => ({
          ...prev,
          pendingAuthorizations: Math.max(0, prev.pendingAuthorizations - 1)
        }));
        setFeedbackMessage({
          type: 'success',
          text: `Approved "${req.employee} - ${req.type}" successfully! Document status updated in MongoDB Atlas.`
        });
      } else {
        setFeedbackMessage({
          type: 'error',
          text: res.message || 'Failed to approve request.'
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Error communicating with database.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Reject with Real MongoDB Persistence
  const handleReject = async (req: PendingApprovalItem) => {
    setProcessingId(req.id);
    setFeedbackMessage(null);

    try {
      const res = await apiRequest(`/portal/manager/approvals/${req.itemType}/${req.id}`, {
        method: 'PUT',
        body: JSON.stringify({ action: 'reject', comment: 'Declined by Manager' })
      });

      if (res.success) {
        setPendingApprovals((prev) => prev.filter((a) => a.id !== req.id));
        setStats((prev) => ({
          ...prev,
          pendingAuthorizations: Math.max(0, prev.pendingAuthorizations - 1)
        }));
        setFeedbackMessage({
          type: 'success',
          text: `Declined "${req.employee} - ${req.type}". Document status updated in MongoDB Atlas.`
        });
      } else {
        setFeedbackMessage({
          type: 'error',
          text: res.message || 'Failed to decline request.'
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Error communicating with database.'
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Reset / Re-seed Demo Queue in MongoDB Atlas
  const handleResetQueue = async () => {
    setIsResetting(true);
    setFeedbackMessage(null);
    try {
      const res = await apiRequest('/portal/manager/approvals/reset', {
        method: 'POST'
      });
      if (res.success) {
        setFeedbackMessage({
          type: 'success',
          text: 'Demo pending approval requests restored in MongoDB Atlas!'
        });
        await loadApprovals();
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Could not reset approvals queue.'
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Badge variant="primary" dot>Manager Hub</Badge>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Department Operations & Approvals (Phase 13)</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            Engineering & Technology Command Hub
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Monitor daily team attendance, review pending leave & expense authorizations, and track active sprint blockers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="outline"
            iconPrefix={isResetting ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
            onClick={handleResetQueue}
            disabled={isResetting}
            title="Re-seed demo approval requests in database"
          >
            {isResetting ? 'Restoring DB...' : 'Reset Demo Queue'}
          </Button>
          <Link href="/work-progress">
            <Button variant="outline" iconPrefix={<TrendingUp size={16} />}>
              Team Velocity
            </Button>
          </Link>
          <Link href="/leave/approvals">
            <Button variant="primary" iconPrefix={<ShieldCheck size={16} />}>
              Leave Approvals Desk
            </Button>
          </Link>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            backgroundColor: feedbackMessage.type === 'success' ? '#00B89415' : '#D6303115',
            border: `1px solid ${feedbackMessage.type === 'success' ? '#00B894' : '#D63031'}`,
            color: feedbackMessage.type === 'success' ? '#00B894' : '#D63031',
            fontSize: '13px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {feedbackMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0 4px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <KpiCard
          title="Team Present Today"
          value={stats.teamPresent}
          subtitle={`${stats.attendanceRate} attendance rate`}
          trend={{ value: '2 Late • 1 On Leave', isPositive: true }}
          icon={<UserCheck size={22} />}
          progressPercentage={88}
        />
        <KpiCard
          title="Pending Authorizations"
          value={`${pendingApprovals.length} Requests`}
          subtitle="awaiting manager signoff"
          trend={{ value: pendingApprovals.length > 0 ? 'Action Required' : 'All Clear', isPositive: pendingApprovals.length === 0 }}
          icon={<ShieldCheck size={22} />}
          progressPercentage={pendingApprovals.length === 0 ? 100 : 60}
        />
        <KpiCard
          title="Active Sprint Velocity"
          value={stats.activeSprintVelocity}
          subtitle="31 of 40 tasks completed"
          trend={{ value: '+8% vs last sprint', isPositive: true }}
          icon={<TrendingUp size={22} />}
          progressPercentage={78}
        />
        <KpiCard
          title="Active Roadblocks"
          value={stats.activeRoadblocks}
          subtitle="Redis cluster socket timeout"
          trend={{ value: 'Under Review', isPositive: false }}
          icon={<AlertTriangle size={22} />}
          progressPercentage={20}
        />
      </div>

      {/* Main Grid: Pending Approvals & Team Attendance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Pending Approvals Queue */}
        <Card
          title="Pending Approval Queue"
          subtitle="Live MongoDB database requests requiring your managerial authorization"
          padding="none"
          action={
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Live DB Sync Active
            </span>
          }
        >
          {isLoading ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 size={18} className="animate-spin" />
              <span>Fetching live approvals from database...</span>
            </div>
          ) : pendingApprovals.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 700 }}>
                <CheckCircle2 size={20} />
                <span>All team authorizations are up to date!</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                All pending items have been approved or resolved in the database.
              </p>
              <Button variant="outline" size="sm" iconPrefix={<RotateCcw size={14} />} onClick={handleResetQueue} disabled={isResetting}>
                {isResetting ? 'Restoring...' : 'Reset Demo Queue in DB'}
              </Button>
            </div>
          ) : (
            <div>
              {pendingApprovals.map((req) => {
                const isItemProcessing = processingId === req.id;
                return (
                  <div
                    key={req.id}
                    style={{
                      padding: '18px 24px',
                      borderBottom: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '16px',
                      opacity: isItemProcessing ? 0.6 : 1,
                      transition: 'opacity 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '14px' }}>
                      <img
                        src={req.avatarUrl}
                        alt={req.employee}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                            {req.employee}
                          </span>
                          <Badge variant="primary">{req.type}</Badge>
                          <Badge variant="neutral">{req.itemType.toUpperCase()}</Badge>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {req.role} • {req.dates}
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '6px', margin: 0 }}>
                          "{req.reason}"
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isItemProcessing}
                        onClick={() => handleReject(req)}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isItemProcessing}
                        onClick={() => handleApprove(req)}
                        iconPrefix={isItemProcessing ? <Loader2 size={14} className="animate-spin" /> : undefined}
                      >
                        {isItemProcessing ? 'Saving...' : 'Approve'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Team Attendance & Workload Status */}
        <Card
          title="Team Attendance & Output Status"
          subtitle="Real-time shift presence and sprint contribution"
          padding="none"
          action={
            <Link href="/attendance/manage">
              <Button variant="ghost" size="sm" iconSuffix={<ArrowRight size={14} />}>
                All Attendance
              </Button>
            </Link>
          }
        >
          <div>
            {teamMembers.map((m) => (
              <div
                key={m.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 24px',
                  borderBottom: '1px solid var(--color-border-subtle)'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>{m.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{m.role}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>{m.progress}% Velocity</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{m.tasksDone} tasks completed</div>
                  </div>
                  <Badge variant={m.status === 'PRESENT' ? 'success' : m.status === 'LATE' ? 'warning' : 'neutral'} dot>
                    {m.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
