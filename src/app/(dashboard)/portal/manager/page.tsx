'use client';

import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { KpiCard } from '@/components/ui/KpiCard';

export default function ManagerOperationsHubPage() {
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'APR-201',
      employee: 'Marcus Vance',
      role: 'Frontend Tech Lead',
      type: 'Casual Leave (2 Days)',
      dates: 'Sep 23 - Sep 24, 2026',
      reason: 'Family event out of town',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    {
      id: 'APR-202',
      employee: 'Sophia Chen',
      role: 'Senior Product Designer',
      type: 'Home Office Equipment Claim',
      dates: 'Sep 19, 2026 ($240.00)',
      reason: 'Ergonomic keyboard and monitor riser stipend',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
    },
    {
      id: 'APR-203',
      employee: 'Alex Rivera',
      role: 'Staff Backend Architect',
      type: 'Medical Leave (1 Day)',
      dates: 'Sep 21, 2026',
      reason: 'Routine annual health checkup',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
    }
  ]);

  const [teamMembers] = useState([
    { name: 'Alex Rivera', role: 'Staff Backend Architect', status: 'PRESENT', tasksDone: 11, blocked: 0, progress: 85 },
    { name: 'Sophia Chen', role: 'Senior Product Designer', status: 'PRESENT', tasksDone: 8, blocked: 0, progress: 92 },
    { name: 'Marcus Vance', role: 'Frontend Tech Lead', status: 'LATE', tasksDone: 7, blocked: 1, progress: 68 },
    { name: 'Elena Rostova', role: 'People Ops Lead', status: 'ON_LEAVE', tasksDone: 5, blocked: 0, progress: 75 }
  ]);

  const handleApprove = (id: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id));
  };

  const handleReject = (id: string) => {
    setPendingApprovals((prev) => prev.filter((a) => a.id !== id));
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

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <KpiCard
          title="Team Present Today"
          value="21 / 24"
          subtitle="87.5% attendance rate"
          trend={{ value: '2 Late • 1 On Leave', isPositive: true }}
          icon={<UserCheck size={22} />}
          progressPercentage={88}
        />
        <KpiCard
          title="Pending Authorizations"
          value={`${pendingApprovals.length} Requests`}
          subtitle="awaiting manager signoff"
          trend={{ value: 'Action Required', isPositive: false }}
          icon={<ShieldCheck size={22} />}
          progressPercentage={60}
        />
        <KpiCard
          title="Active Sprint Velocity"
          value="78.4%"
          subtitle="31 of 40 tasks completed"
          trend={{ value: '+8% vs last sprint', isPositive: true }}
          icon={<TrendingUp size={22} />}
          progressPercentage={78}
        />
        <KpiCard
          title="Active Roadblocks"
          value="1 Blocked"
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
          subtitle="Direct requests requiring your managerial authorization"
          padding="none"
        >
          {pendingApprovals.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              All team authorizations are up to date.
            </div>
          ) : (
            <div>
              {pendingApprovals.map((req) => (
                <div
                  key={req.id}
                  style={{
                    padding: '18px 24px',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px' }}>
                    <img
                      src={req.avatarUrl}
                      alt={req.employee}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                          {req.employee}
                        </span>
                        <Badge variant="primary">{req.type}</Badge>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        {req.role} • {req.dates}
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '6px', margin: 0 }}>
                        "{req.reason}"
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="outline" size="sm" onClick={() => handleReject(req.id)}>
                      Decline
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => handleApprove(req.id)}>
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
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
