'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Building,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Laptop,
  BookOpen,
  Mail,
  RefreshCw
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { KpiCard } from '@/components/ui/KpiCard';
import { api } from '@/lib/api';

interface OnboardingTask {
  _id?: string;
  title: string;
  category: 'it_setup' | 'documentation' | 'introduction' | 'training' | 'compliance';
  completed: boolean;
}

interface OnboardingChecklist {
  _id: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  role: string;
  startDate: string;
  targetCompletionDate: string;
  tasks: OnboardingTask[];
  progress: number;
  status: 'in_progress' | 'completed' | 'overdue';
}

export default function OnboardingLifecyclePage() {
  const DEFAULT_CHECKLISTS: OnboardingChecklist[] = [
    {
      _id: 'onb-1',
      employeeName: 'Elena Rostova',
      employeeEmail: 'elena@sparkx.corp',
      department: 'Human Resources & People Ops',
      role: 'Senior People Operations Specialist',
      startDate: '2026-09-01',
      targetCompletionDate: '2026-09-25',
      progress: 71,
      status: 'in_progress',
      tasks: [
        { title: 'Upload Government Photo ID & Tax Forms', category: 'documentation', completed: true },
        { title: 'Provision Corporate Email & Slack Account', category: 'it_setup', completed: true },
        { title: 'Configure Multi-Factor Authentication (2FA)', category: 'it_setup', completed: true },
        { title: 'Review & Sign SparkX Employee Handbook', category: 'compliance', completed: true },
        { title: 'Attend 1-on-1 Welcome Sync with Team Lead', category: 'introduction', completed: true },
        { title: 'Complete Security & Data Privacy Training Module', category: 'training', completed: false },
        { title: 'Setup Development Environment / Workstation Assets', category: 'it_setup', completed: false }
      ]
    },
    {
      _id: 'onb-2',
      employeeName: 'Marcus Vance',
      employeeEmail: 'marcus.vance@sparkx.corp',
      department: 'Engineering & Technology',
      role: 'Frontend Tech Lead',
      startDate: '2026-09-08',
      targetCompletionDate: '2026-09-30',
      progress: 43,
      status: 'in_progress',
      tasks: [
        { title: 'Upload Government Photo ID & Tax Forms', category: 'documentation', completed: true },
        { title: 'Provision Corporate Email & Slack Account', category: 'it_setup', completed: true },
        { title: 'Configure Multi-Factor Authentication (2FA)', category: 'it_setup', completed: true },
        { title: 'Review & Sign SparkX Employee Handbook', category: 'compliance', completed: false },
        { title: 'Attend 1-on-1 Welcome Sync with Team Lead', category: 'introduction', completed: false },
        { title: 'Complete Security & Data Privacy Training Module', category: 'training', completed: false },
        { title: 'Setup Development Environment / Workstation Assets', category: 'it_setup', completed: false }
      ]
    },
    {
      _id: 'onb-3',
      employeeName: 'Chloe Dupont',
      employeeEmail: 'chloe.dupont@sparkx.corp',
      department: 'Product & Design',
      role: 'Lead UX Researcher',
      startDate: '2026-09-15',
      targetCompletionDate: '2026-10-05',
      progress: 14,
      status: 'in_progress',
      tasks: [
        { title: 'Upload Government Photo ID & Tax Forms', category: 'documentation', completed: true },
        { title: 'Provision Corporate Email & Slack Account', category: 'it_setup', completed: false },
        { title: 'Configure Multi-Factor Authentication (2FA)', category: 'it_setup', completed: false },
        { title: 'Review & Sign SparkX Employee Handbook', category: 'compliance', completed: false },
        { title: 'Attend 1-on-1 Welcome Sync with Team Lead', category: 'introduction', completed: false },
        { title: 'Complete Security & Data Privacy Training Module', category: 'training', completed: false },
        { title: 'Setup Development Environment / Workstation Assets', category: 'it_setup', completed: false }
      ]
    }
  ];

  const [checklists, setChecklists] = useState<OnboardingChecklist[]>(DEFAULT_CHECKLISTS);
  const [selectedHire, setSelectedHire] = useState<OnboardingChecklist>(DEFAULT_CHECKLISTS[0]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New hire form
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDept, setFormDept] = useState('Engineering & Technology');
  const [formRole, setFormRole] = useState('');

  const fetchChecklists = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/api/onboarding');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setChecklists(res.data);
        setSelectedHire(res.data[0]);
      }
    } catch {
      // keep fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklists();
  }, []);

  const handleToggleTask = async (taskIndex: number) => {
    // Optimistic update
    const updatedTasks = [...selectedHire.tasks];
    updatedTasks[taskIndex].completed = !updatedTasks[taskIndex].completed;
    const completedCount = updatedTasks.filter((t) => t.completed).length;
    const newProgress = Math.round((completedCount / updatedTasks.length) * 100);

    const updatedHire = {
      ...selectedHire,
      tasks: updatedTasks,
      progress: newProgress,
      status: (newProgress === 100 ? 'completed' : 'in_progress') as any
    };

    setSelectedHire(updatedHire);
    setChecklists((prev) => prev.map((c) => (c._id === updatedHire._id ? updatedHire : c)));

    try {
      await api.put(`/api/onboarding/${selectedHire._id}/tasks/${taskIndex}/toggle`, {});
    } catch {
      // already updated optimistically
    }
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post<any>('/api/onboarding', {
        employeeName: formName,
        employeeEmail: formEmail,
        department: formDept,
        role: formRole
      });
      if (res.data) {
        setChecklists((prev) => [res.data, ...prev]);
        setSelectedHire(res.data);
      }
      setIsModalOpen(false);
      setFormName('');
      setFormEmail('');
      setFormRole('');
    } catch {
      setIsModalOpen(false);
    }
  };

  const getCategoryBadge = (cat: OnboardingTask['category']) => {
    switch (cat) {
      case 'it_setup':
        return <Badge variant="primary">IT & Workstation</Badge>;
      case 'documentation':
        return <Badge variant="info">Legal & Tax</Badge>;
      case 'compliance':
        return <Badge variant="warning">Compliance</Badge>;
      case 'introduction':
        return <Badge variant="success">Team Intro</Badge>;
      case 'training':
        return <Badge variant="neutral">Training</Badge>;
      default:
        return <Badge variant="neutral">{cat}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Badge variant="primary" dot>Employee Lifecycle</Badge>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Structured Onboarding Workflows (Phase 13)</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            New Hire Onboarding & Ramp-Up Console
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Coordinate hardware provisioning, compliance handbooks, team welcomes, and 14-day milestone readiness.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={fetchChecklists} iconPrefix={<RefreshCw size={14} className={loading ? 'spin' : ''} />}>
            Refresh
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(true)} iconPrefix={<Plus size={16} />}>
            Initiate Onboarding
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <KpiCard
          title="Active Onboarding Hires"
          value={checklists.length}
          subtitle="new joiners in progress"
          trend={{ value: '3 Active Candidates', isPositive: true }}
          icon={<UserCheck size={22} />}
          progressPercentage={75}
        />
        <KpiCard
          title="Avg Ramp-Up Velocity"
          value="42.6%"
          subtitle="task completion velocity"
          trend={{ value: 'Healthy Progression', isPositive: true }}
          icon={<Clock size={22} />}
          progressPercentage={43}
        />
        <KpiCard
          title="IT Provisioning Rate"
          value="83.3%"
          subtitle="workstations & logins deployed"
          trend={{ value: 'Hardware Ready', isPositive: true }}
          icon={<Laptop size={22} />}
          progressPercentage={83}
        />
        <KpiCard
          title="Policy Acknowledgment"
          value="100%"
          subtitle="zero compliance flags"
          trend={{ value: 'Compliant', isPositive: true }}
          icon={<ShieldCheck size={22} />}
          progressPercentage={100}
        />
      </div>

      {/* Main Split View: Hire List & Checklist Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Left: New Joiners Pipeline */}
        <Card title="New Joiners Pipeline" subtitle="Select an employee to inspect checklist progress" padding="none">
          <div>
            {checklists.map((c) => {
              const isSelected = selectedHire._id === c._id;
              return (
                <div
                  key={c._id}
                  onClick={() => setSelectedHire(c)}
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    backgroundColor: isSelected ? 'var(--color-surface-soft)' : 'transparent',
                    borderLeft: isSelected ? '4px solid var(--color-primary)' : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                        {c.employeeName}
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        {c.role} • {c.department}
                      </div>
                    </div>
                    <Badge variant={c.progress === 100 ? 'success' : 'primary'}>
                      {c.progress}% Ready
                    </Badge>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${c.progress}%`,
                          height: '100%',
                          backgroundColor: c.progress === 100 ? 'var(--color-success)' : 'var(--color-primary)',
                          borderRadius: 'var(--radius-pill)',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Selected Hire Task Checklist */}
        <Card
          title={`${selectedHire.employeeName} — Onboarding Roadmap`}
          subtitle={`${selectedHire.role} (${selectedHire.tasks.filter((t) => t.completed).length} of ${selectedHire.tasks.length} tasks completed)`}
          padding="none"
        >
          <div>
            {selectedHire.tasks.map((task, idx) => (
              <div
                key={idx}
                onClick={() => handleToggleTask(idx)}
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: task.completed ? 'transparent' : 'var(--color-surface-soft)',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => {}} // handled by row click
                    style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                  />
                  <div>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: task.completed ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                        textDecoration: task.completed ? 'line-through' : 'none'
                      }}
                    >
                      {task.title}
                    </span>
                  </div>
                </div>

                <div>{getCategoryBadge(task.category)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Initiate Onboarding Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initiate Employee Onboarding"
        subtitle="Generate a 7-step provisioning checklist for a new joiner"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateChecklist}>Start Onboarding Roadmap</Button>
          </>
        }
      >
        <form onSubmit={handleCreateChecklist} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Employee Full Name"
            placeholder="e.g. Jessica Adams"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />
          <Input
            label="Corporate Email Address"
            type="email"
            placeholder="e.g. jessica.adams@sparkx.corp"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            required
          />
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', display: 'block', marginBottom: '8px' }}>
              Target Department
            </label>
            <select
              value={formDept}
              onChange={(e) => setFormDept(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                padding: '0 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                fontSize: '14px',
                outline: 'none'
              }}
            >
              <option value="Engineering & Technology">Engineering & Technology</option>
              <option value="Product & Design">Product & Design</option>
              <option value="Sales & Revenue">Sales & Revenue</option>
              <option value="Human Resources & People Ops">Human Resources & People Ops</option>
              <option value="Finance & Accounting">Finance & Accounting</option>
            </select>
          </div>
          <Input
            label="Designation / Role"
            placeholder="e.g. Senior Security Architect"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
