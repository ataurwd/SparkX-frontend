'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface ProjectItem {
  _id: string;
  name: string;
  code: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: number;
  currency: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  startDate: string;
  endDate: string;
  departmentId?: { name: string; code: string };
  managerId?: { firstName: string; lastName: string; avatarUrl?: string };
  members: { firstName: string; lastName: string; avatarUrl?: string }[];
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    _id: 'proj-demo-1',
    name: 'SparkX Cloud Native Infrastructure Modernization',
    code: 'INFRA-2026',
    description: 'Migrating multi-tenant microservices to auto-scaling Kubernetes cluster with 99.99% uptime SLA.',
    status: 'active',
    priority: 'high',
    budget: 85000,
    currency: 'USD',
    progress: 72,
    totalTasks: 28,
    completedTasks: 20,
    startDate: '2026-08-01',
    endDate: '2026-11-30',
    departmentId: { name: 'Engineering & Technology', code: 'ENG' },
    managerId: { firstName: 'Marcus', lastName: 'Sterling' },
    members: [
      { firstName: 'Alex', lastName: 'Rivera' },
      { firstName: 'Sophia', lastName: 'Chen' },
      { firstName: 'Marcus', lastName: 'Vance' }
    ]
  },
  {
    _id: 'proj-demo-2',
    name: 'Enterprise Payroll & Tax Automation Engine 2.0',
    code: 'FIN-PAY',
    description: 'Automated 30-day payroll batch calculation, statutory deduction rules, and PDF payslip delivery.',
    status: 'active',
    priority: 'urgent',
    budget: 62000,
    currency: 'USD',
    progress: 58,
    totalTasks: 19,
    completedTasks: 11,
    startDate: '2026-08-15',
    endDate: '2026-12-15',
    departmentId: { name: 'Finance & Accounting', code: 'FIN' },
    managerId: { firstName: 'Tariq', lastName: 'Hassan' },
    members: [
      { firstName: 'Elena', lastName: 'Rostova' },
      { firstName: 'Sarah', lastName: 'Lin' }
    ]
  },
  {
    _id: 'proj-demo-3',
    name: 'Unified Design System & Dark/Light Accessibility Suite',
    code: 'DS-ACC',
    description: 'Comprehensive design tokens, high contrast WCAG 2.1 AAA dark mode and responsive layout engine.',
    status: 'completed',
    priority: 'medium',
    budget: 34000,
    currency: 'USD',
    progress: 100,
    totalTasks: 14,
    completedTasks: 14,
    startDate: '2026-07-01',
    endDate: '2026-09-10',
    departmentId: { name: 'Product & Design', code: 'PRD' },
    managerId: { firstName: 'Sarah', lastName: 'Jenkins' },
    members: [
      { firstName: 'Sophia', lastName: 'Chen' },
      { firstName: 'Michael', lastName: 'Johnson' }
    ]
  }
];

export default function ProjectsDirectoryPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(DEFAULT_PROJECTS);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [formBudget, setFormBudget] = useState(35000);
  const [formEndDate, setFormEndDate] = useState(
    new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<ProjectItem[]>('/api/projects');
      if (res.data && res.data.length > 0) {
        setProjects(res.data);
      } else {
        setProjects(DEFAULT_PROJECTS);
      }
    } catch {
      setProjects(DEFAULT_PROJECTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setError(null);
      await api.post('/api/projects', {
        name: formName,
        code: formCode || undefined,
        description: formDescription,
        priority: formPriority,
        budget: Number(formBudget),
        endDate: formEndDate
      });
      setIsCreateModalOpen(false);
      setFormName('');
      setFormCode('');
      setFormDescription('');
      await fetchProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalActive = projects.filter((p) => p.status === 'active').length;
  const totalCompleted = projects.filter((p) => p.status === 'completed').length;
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

  const getStatusBadge = (status: ProjectItem['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'completed':
        return <Badge variant="info">Completed</Badge>;
      case 'planning':
        return <Badge variant="neutral">Planning</Badge>;
      case 'on_hold':
        return <Badge variant="warning">On Hold</Badge>;
      default:
        return <Badge variant="danger">Cancelled</Badge>;
    }
  };

  const getPriorityBadge = (priority: ProjectItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="danger">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="info">Medium</Badge>;
      default:
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & New Project Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Projects & Initiatives
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Portfolio tracking, milestone schedules, budgets, and delivery velocity.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/tasks">
            <Button variant="outline">
              Task Board
            </Button>
          </Link>
          <Link href="/work-progress">
            <Button variant="outline" iconPrefix={<TrendingUp size={16} />}>
              Team Velocity
            </Button>
          </Link>
          <Button
            variant="primary"
            iconPrefix={<Plus size={16} />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Project
          </Button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards (Clean Solid Surfaces) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}
            >
              <FolderKanban size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Active Projects
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {totalActive}
              </div>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-success)'
              }}
            >
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Completed
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {totalCompleted}
              </div>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-info-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-info)'
              }}
            >
              <DollarSign size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Total Allocated Budget
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                ${totalBudget.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warning-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-warning)'
              }}
            >
              <TrendingUp size={20} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Total Portfolio Runs
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {projects.length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and View Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 12px',
              height: '38px',
              width: '100%',
              maxWidth: '320px'
            }}
          >
            <Search size={15} color="var(--color-text-muted)" />
            <input
              placeholder="Search by project name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                width: '100%',
                color: 'var(--color-text-main)'
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              height: '38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-main)',
              padding: '0 12px',
              fontSize: '13px'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--color-surface-soft)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'grid' ? 'var(--color-surface)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'table' ? 'var(--color-surface)' : 'transparent',
              color: viewMode === 'table' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '18px'
          }}
        >
          {filteredProjects.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No projects found matching your criteria.
            </div>
          ) : (
            filteredProjects.map((prj) => (
              <Card key={prj._id} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-surface-soft)',
                      color: 'var(--color-primary)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--color-border)'
                    }}
                  >
                    {prj.code}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {getPriorityBadge(prj.priority)}
                    {getStatusBadge(prj.status)}
                  </div>
                </div>

                <div>
                  <Link href={`/projects/${prj._id}`}>
                    <h3
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: 'var(--color-text-main)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-main)')}
                    >
                      {prj.name}
                    </h3>
                  </Link>
                  <p
                    style={{
                      fontSize: '12.5px',
                      color: 'var(--color-text-secondary)',
                      marginTop: '4px',
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {prj.description || 'No project description provided.'}
                  </p>
                </div>

                {/* Progress Bar (Solid Colors Only) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      Tasks: {prj.completedTasks} / {prj.totalTasks}
                    </span>
                    <strong style={{ color: 'var(--color-text-main)' }}>{prj.progress}%</strong>
                  </div>
                  <div
                    style={{
                      height: '7px',
                      borderRadius: 'var(--radius-pill)',
                      backgroundColor: 'var(--color-surface-soft)',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${prj.progress}%`,
                        height: '100%',
                        backgroundColor: prj.progress === 100 ? 'var(--color-success)' : 'var(--color-primary)',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Meta details footer */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--color-border-subtle)',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} />
                    <span>Due {new Date(prj.endDate).toLocaleDateString()}</span>
                  </div>

                  <Link href={`/projects/${prj._id}`}>
                    <Button variant="ghost" size="sm">
                      Workspace <ArrowRight size={13} style={{ marginLeft: '4px' }} />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-soft)' }}>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Project</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Priority</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Progress</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Budget</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Due Date</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', color: 'var(--color-text-muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((prj) => (
                  <tr
                    key={prj._id}
                    style={{ borderBottom: '1px solid var(--color-border-subtle)', transition: 'background-color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <Link href={`/projects/${prj._id}`}>
                        <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{prj.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{prj.code}</div>
                      </Link>
                    </td>
                    <td style={{ padding: '14px 18px' }}>{getStatusBadge(prj.status)}</td>
                    <td style={{ padding: '14px 18px' }}>{getPriorityBadge(prj.priority)}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '80px', height: '6px', borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--color-surface-soft)', overflow: 'hidden' }}>
                          <div style={{ width: `${prj.progress}%`, height: '100%', backgroundColor: 'var(--color-primary)' }} />
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{prj.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 600 }}>${(prj.budget || 0).toLocaleString()}</td>
                    <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: '12.5px' }}>
                      {new Date(prj.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <Link href={`/projects/${prj._id}`}>
                        <Button variant="outline" size="sm">
                          Workspace
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        subtitle="Initialize a new project workspace with budget, milestones, and task board"
      >
        <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
              Project Name
            </label>
            <input
              type="text"
              placeholder="e.g. NextGen Mobile Applications"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                padding: '0 12px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Project Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. PRJ-MBL"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  padding: '0 12px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Priority Level
              </label>
              <select
                value={formPriority}
                onChange={(e: any) => setFormPriority(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  padding: '0 12px',
                  fontSize: '14px'
                }}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Allocated Budget ($)
              </label>
              <input
                type="number"
                value={formBudget}
                onChange={(e) => setFormBudget(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  padding: '0 12px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Target Deadline
              </label>
              <input
                type="date"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  padding: '0 12px',
                  fontSize: '14px'
                }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
              Project Description & Goals
            </label>
            <textarea
              rows={3}
              placeholder="Outline project objectives, key deliverables, and scope..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              style={{
                width: '100%',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                padding: '10px 12px',
                fontSize: '13.5px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={creating}>
              Create Project Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
