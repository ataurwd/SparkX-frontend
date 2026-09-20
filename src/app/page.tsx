'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { KpiCard } from '../components/ui/KpiCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DataTable, Column } from '../components/ui/DataTable';
import { useAuth } from '@/lib/auth-context';
import { normalizeRole } from '@/lib/permissions';
import {
  Users,
  Briefcase,
  UserCheck,
  Clock,
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Sparkles,
  DollarSign
} from 'lucide-react';

interface RecentApp {
  id: string;
  name: string;
  role: string;
  department: string;
  appliedDate: string;
  status: 'Interview' | 'Screening' | 'Offer Sent' | 'Hired';
  rating: number;
}

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user && normalizeRole(user.role) === 'employee') {
      router.replace('/portal/employee');
    }
  }, [user, isLoading, router]);

  if (!isLoading && user && normalizeRole(user.role) === 'employee') {
    return null;
  }

  const recentApplications: RecentApp[] = [
    { id: 'APP-101', name: 'Michael Johnson', role: 'Senior Software Engineer', department: 'Engineering', appliedDate: 'Today, 10:30 AM', status: 'Offer Sent', rating: 4.8 },
    { id: 'APP-102', name: 'Sarah Lin', role: 'Product Marketing Manager', department: 'Marketing', appliedDate: 'Yesterday', status: 'Interview', rating: 4.5 },
    { id: 'APP-103', name: 'Alexander Wright', role: 'DevOps & Cloud Specialist', department: 'Infrastructure', appliedDate: 'Sep 18, 2026', status: 'Screening', rating: 4.2 },
    { id: 'APP-104', name: 'Priya Sharma', role: 'UI/UX Product Designer', department: 'Product Design', appliedDate: 'Sep 17, 2026', status: 'Hired', rating: 4.9 },
    { id: 'APP-105', name: 'Carlos Mendez', role: 'Payroll & Tax Accountant', department: 'Finance', appliedDate: 'Sep 16, 2026', status: 'Interview', rating: 4.3 }
  ];

  const columns: Column<RecentApp>[] = [
    {
      key: 'name',
      header: 'Candidate',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px'
            }}
          >
            {row.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{row.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{row.appliedDate}</div>
          </div>
        </div>
      )
    },
    { key: 'role', header: 'Applied Role' },
    { key: 'department', header: 'Department' },
    {
      key: 'status',
      header: 'Pipeline Stage',
      render: (row) => {
        const variantMap = {
          'Offer Sent': 'primary',
          'Interview': 'info',
          'Screening': 'warning',
          'Hired': 'success'
        } as const;
        return <Badge variant={variantMap[row.status] || 'neutral'} dot>{row.status}</Badge>;
      }
    },
    {
      key: 'rating',
      header: 'Score',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
          ★ {row.rating.toFixed(1)}
        </span>
      )
    }
  ];

  const departmentStats = [
    { name: 'Engineering', count: 184, percent: 88, color: '#6C5CE7' },
    { name: 'Product & Design', count: 52, percent: 76, color: '#4FD1FF' },
    { name: 'Sales & Revenue', count: 96, percent: 94, color: '#10B981' },
    { name: 'Human Resources', count: 28, percent: 82, color: '#F59E0B' },
    { name: 'Finance & Legal', count: 22, percent: 70, color: '#0EA5E9' }
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Top Hero Banner */}
        <div
          style={{
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px 32px',
            color: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 30px -5px rgba(108, 92, 231, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          {/* Subtle background glow circles */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              pointerEvents: 'none'
            }}
          />

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '12px',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                marginBottom: '10px'
              }}
            >
              <Sparkles size={14} color="#FFF" />
              <span>Phase 1 Verified & Live</span>
            </div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.2
              }}
            >
              Welcome to SparkX Command Center
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '6px', maxWidth: '580px' }}>
              Your complete multi-tenant Company Operating System is active. Review real-time employee attendance,
              recruitment funnels, project health, and monthly payroll.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/design-system">
              <Button
                variant="secondary"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: 'var(--color-primary)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                }}
                iconSuffix={<ArrowUpRight size={16} />}
              >
                Explore Design System
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Core KPI Metric Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          <KpiCard
            title="Total Headcount"
            value="5,625"
            trend={{ value: '+12.5%', isPositive: true }}
            subtitle="vs prior quarter"
            icon={<Users size={22} />}
            progressPercentage={88}
          />
          <KpiCard
            title="Open Positions"
            value="56"
            trend={{ value: '+8 Active', isPositive: true }}
            subtitle="in 6 departments"
            icon={<Briefcase size={22} />}
            progressPercentage={62}
          />
          <KpiCard
            title="Onboarding Active"
            value="66"
            trend={{ value: '94% On Track', isPositive: true }}
            subtitle="checklists moving"
            icon={<UserCheck size={22} />}
            progressPercentage={94}
          />
          <KpiCard
            title="Attendance Rate"
            value="96.15%"
            trend={{ value: '+1.4%', isPositive: true }}
            subtitle="today across teams"
            icon={<Clock size={22} />}
            progressPercentage={96}
          />
        </div>

        {/* Middle Two-Column Grid: Department Headcounts + Attendance Rate Analytics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '24px'
          }}
        >
          {/* Department Headcount Breakdown */}
          <Card
            title="Headcount by Department"
            subtitle="Distribution of full-time and active team members"
            action={
              <Link href="/organization/departments">
                <Button variant="ghost" size="sm" style={{ color: 'var(--color-primary)' }}>
                  View All
                </Button>
              </Link>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {departmentStats.map((dept, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{dept.name}</span>
                    <span style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      {dept.count} members ({dept.percent}%)
                    </span>
                  </div>
                  <div
                    style={{
                      height: '8px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--color-surface-soft)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${dept.percent}%`,
                        backgroundColor: dept.color,
                        borderRadius: 'var(--radius-pill)'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Attendance Trend & Quick Actions */}
          <Card
            title="Daily Attendance & Quick Actions"
            subtitle="Operational shortcuts and check-in overview"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Stat Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-soft)',
                    padding: '14px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-success)' }}>
                    5,408
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Present
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-surface-soft)',
                    padding: '14px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-warning)' }}>
                    142
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    Late Arrivals
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--color-surface-soft)',
                    padding: '14px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-info)' }}>
                    75
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    On Leave
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Frequently Used Workflows
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Link href="/employees">
                    <Button variant="secondary" style={{ width: '100%' }} iconPrefix={<Users size={16} />}>
                      Add Employee
                    </Button>
                  </Link>
                  <Link href="/attendance">
                    <Button variant="secondary" style={{ width: '100%' }} iconPrefix={<Clock size={16} />}>
                      Clock In / Out
                    </Button>
                  </Link>
                  <Link href="/payroll">
                    <Button variant="secondary" style={{ width: '100%' }} iconPrefix={<DollarSign size={16} />}>
                      Run Payroll
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button variant="secondary" style={{ width: '100%' }} iconPrefix={<FolderKanban size={16} />}>
                      Task Board
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Live Data Table: Recent Applications */}
        <DataTable
          title="Recent Applications Pipeline"
          subtitle="Latest candidate submissions transitioning through hiring stages"
          columns={columns}
          data={recentApplications}
          pageSize={5}
          action={
            <Link href="/recruitment/jobs">
              <Button variant="primary" size="sm" iconPrefix={<Plus size={14} />}>
                Post New Job
              </Button>
            </Link>
          }
        />
      </div>
    </DashboardLayout>
  );
}
