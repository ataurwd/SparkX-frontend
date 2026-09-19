'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  Target,
  Bell,
  ArrowRight,
  TrendingUp,
  FileText,
  UserCheck,
  Plus,
  Play,
  Square,
  Sparkles
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { KpiCard } from '@/components/ui/KpiCard';
import { useAuth } from '@/lib/auth-context';

export default function EmployeeSelfServiceCockpitPage() {
  const { user } = useAuth();

  const [isClockedIn, setIsClockedIn] = useState(true);
  const [clockInTime, setClockInTime] = useState('09:02 AM');
  const [activeTasks, setActiveTasks] = useState([
    { id: 'SPX-101', title: 'Architect multi-tenant schema isolation & JWT claims', priority: 'urgent', status: 'completed' },
    { id: 'SPX-102', title: 'Audit WCAG 2.1 Contrast ratios across Dark & Light themes', priority: 'high', status: 'in_progress' },
    { id: 'SPX-104', title: 'Sync real-time biometric terminal logs with MongoDB', priority: 'medium', status: 'todo' }
  ]);

  const leaveBalances = [
    { type: 'Annual Leave', available: 14, total: 18, color: '#6C5CE7' },
    { type: 'Casual Leave', available: 5, total: 10, color: '#0EA5E9' },
    { type: 'Sick Leave', available: 8, total: 12, color: '#10B981' }
  ];

  const handleToggleClock = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
    } else {
      setIsClockedIn(true);
      setClockInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Welcome Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Badge variant="primary" dot>Employee Self-Service (ESS)</Badge>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Personal Operational Cockpit</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            Welcome back, {user ? user.firstName : 'Ataur'}!
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/leave">
            <Button variant="outline" iconPrefix={<Calendar size={16} />}>
              Request Leave
            </Button>
          </Link>
          <Link href="/payroll/my-payslips">
            <Button variant="outline" iconPrefix={<DollarSign size={16} />}>
              View Payslips
            </Button>
          </Link>
        </div>
      </div>

      {/* Top 4 Cockpit KPI Widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <KpiCard
          title="Daily Attendance Status"
          value={isClockedIn ? 'CLOCKED IN' : 'OFF DUTY'}
          subtitle={isClockedIn ? `Since ${clockInTime}` : 'Not checked in today'}
          trend={{ value: isClockedIn ? 'Active Shift' : 'Punch Required', isPositive: isClockedIn }}
          icon={<Clock size={22} />}
          progressPercentage={isClockedIn ? 65 : 0}
        />
        <KpiCard
          title="Pending Tasks"
          value="2 Tasks"
          subtitle="due this sprint cycle"
          trend={{ value: '1 High Priority', isPositive: false }}
          icon={<CheckCircle2 size={22} />}
          progressPercentage={75}
        />
        <KpiCard
          title="Paid Leave Available"
          value="27 Days"
          subtitle="across 3 leave buckets"
          trend={{ value: 'Good Balance', isPositive: true }}
          icon={<Calendar size={22} />}
          progressPercentage={82}
        />
        <KpiCard
          title="Next Payroll Payout"
          value="Sep 30, 2026"
          subtitle="Direct deposit scheduled"
          trend={{ value: 'On Track', isPositive: true }}
          icon={<DollarSign size={22} />}
          progressPercentage={90}
        />
      </div>

      {/* Main Row: Check-in Widget & Active Tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Attendance Punch Control */}
        <Card title="Today's Time & Attendance" subtitle="Web-based biometric punch and shift duration meter" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-soft)',
                border: '1px solid var(--color-border-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>SHIFT SCHEDULE</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '2px' }}>
                  09:00 AM — 06:00 PM (Regular)
                </div>
              </div>
              <Badge variant={isClockedIn ? 'success' : 'warning'} dot>
                {isClockedIn ? 'Active (5h 32m)' : 'Checked Out'}
              </Badge>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant={isClockedIn ? 'danger' : 'primary'}
                onClick={handleToggleClock}
                iconPrefix={isClockedIn ? <Square size={16} /> : <Play size={16} />}
                style={{ flex: 1 }}
              >
                {isClockedIn ? 'Clock Out Shift' : 'Clock In Now'}
              </Button>
              <Link href="/attendance">
                <Button variant="outline">Attendance Logs</Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* My Tasks Snapshot */}
        <Card
          title="My Sprint Workload"
          subtitle="Tasks assigned directly to you"
          padding="none"
          action={
            <Link href="/tasks">
              <Button variant="ghost" size="sm" iconSuffix={<ArrowRight size={14} />}>
                Task Board
              </Button>
            </Link>
          }
        >
          <div>
            {activeTasks.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 24px',
                  borderBottom: '1px solid var(--color-border-subtle)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)' }}>{t.id}</span>
                    <Badge variant={t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : 'neutral'}>
                      {t.priority}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '4px' }}>
                    {t.title}
                  </div>
                </div>

                <Badge variant={t.status === 'completed' ? 'success' : t.status === 'in_progress' ? 'info' : 'neutral'}>
                  {t.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Second Row: Leave Balances & Quarterly Goals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        {/* Leave Balances */}
        <Card title="My Leave Quota Ledgers" subtitle="Annual allocation and current available balance" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {leaveBalances.map((l) => (
              <div key={l.type}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{l.type}</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    <strong>{l.available}</strong> / {l.total} days remaining
                  </span>
                </div>
                <div style={{ height: '7px', width: '100%', backgroundColor: 'var(--color-surface-soft)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(l.available / l.total) * 100}%`,
                      height: '100%',
                      backgroundColor: l.color,
                      borderRadius: 'var(--radius-pill)'
                    }}
                  />
                </div>
              </div>
            ))}

            <Link href="/leave" style={{ marginTop: '8px' }}>
              <Button variant="outline" style={{ width: '100%' }} iconPrefix={<Plus size={15} />}>
                Submit Leave Application
              </Button>
            </Link>
          </div>
        </Card>

        {/* Goals / OKRs */}
        <Card
          title="Quarterly Key Results"
          subtitle="Progress toward Q3 engineering & performance OKRs"
          padding="lg"
          action={
            <Link href="/performance/goals">
              <Button variant="ghost" size="sm" iconSuffix={<ArrowRight size={14} />}>
                All Goals
              </Button>
            </Link>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Migrate Core Cluster to Kubernetes</span>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>85%</span>
              </div>
              <div style={{ height: '7px', width: '100%', backgroundColor: 'var(--color-surface-soft)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-pill)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>WCAG 2.1 Contrast & Accessibility Suite</span>
                <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>100%</span>
              </div>
              <div style={{ height: '7px', width: '100%', backgroundColor: 'var(--color-surface-soft)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-success)', borderRadius: 'var(--radius-pill)' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>30-Day Automated Payroll Engine Rollout</span>
                <span style={{ fontWeight: 700, color: 'var(--color-info)' }}>65%</span>
              </div>
              <div style={{ height: '7px', width: '100%', backgroundColor: 'var(--color-surface-soft)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', backgroundColor: '#0EA5E9', borderRadius: 'var(--radius-pill)' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
