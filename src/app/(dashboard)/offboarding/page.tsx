'use client';

import React, { useState, useEffect } from 'react';
import {
  UserMinus,
  CheckCircle2,
  Clock,
  Laptop,
  Briefcase,
  DollarSign,
  HeartHandshake,
  Search,
  Plus,
  AlertCircle,
  FileCheck,
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/api';

interface ClearanceItem {
  department: 'it' | 'hr' | 'finance' | 'manager';
  title: string;
  description?: string;
  cleared: boolean;
  clearedBy?: string;
  clearedAt?: string;
}

interface OffboardingWorkflow {
  _id: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  role: string;
  resignationDate: string;
  noticePeriodDays: number;
  lastWorkingDay: string;
  reason: string;
  status: 'initiated' | 'in_progress' | 'cleared' | 'archived';
  progress: number;
  clearanceItems: ClearanceItem[];
  exitInterview?: {
    conducted: boolean;
    rating: number;
    notes?: string;
    conductedBy?: string;
    conductedAt?: string;
  };
  notes?: string;
}

export default function OffboardingPage() {
  const [workflows, setWorkflows] = useState<OffboardingWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<OffboardingWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // New offboarding modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeEmail: '',
    department: 'Engineering',
    role: '',
    noticePeriodDays: 30,
    reason: 'Career Growth',
    notes: ''
  });

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/offboarding', {
        params: { status: statusFilter, search: searchTerm }
      });
      if (res.data) {
        setWorkflows(res.data);
        if (!selectedWorkflow && res.data.length > 0) {
          setSelectedWorkflow(res.data[0]);
        } else if (selectedWorkflow) {
          const updated = res.data.find((w: any) => w._id === selectedWorkflow._id);
          if (updated) setSelectedWorkflow(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch offboardings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [statusFilter, searchTerm]);

  const handleToggleTask = async (workflowId: string, itemIndex: number) => {
    try {
      const res: any = await api.put(`/offboarding/${workflowId}/clearance/${itemIndex}/toggle`, {
        clearedBy: 'Operations Admin'
      });
      if (res.data) {
        setSelectedWorkflow(res.data);
        setWorkflows((prev) =>
          prev.map((w) => (w._id === res.data._id ? res.data : w))
        );
      }
    } catch (err) {
      alert('Failed to update clearance item');
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.post('/offboarding', formData);
      setIsNewModalOpen(false);
      setFormData({
        employeeName: '',
        employeeEmail: '',
        department: 'Engineering',
        role: '',
        noticePeriodDays: 30,
        reason: 'Career Growth',
        notes: ''
      });
      fetchWorkflows();
      if (res.data) setSelectedWorkflow(res.data);
    } catch (err) {
      alert('Failed to initiate offboarding');
    }
  };

  const getDepartmentIcon = (dept: string) => {
    switch (dept) {
      case 'it': return <Laptop size={15} style={{ color: '#6C5CE7' }} />;
      case 'manager': return <Briefcase size={15} style={{ color: '#2563EB' }} />;
      case 'finance': return <DollarSign size={15} style={{ color: '#059669' }} />;
      case 'hr': return <HeartHandshake size={15} style={{ color: '#D97706' }} />;
      default: return <FileCheck size={15} />;
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <UserMinus size={24} style={{ color: '#EF4444' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              Employee Offboarding & Exit Clearance
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Orchestrate IT asset retrieval, manager handovers, finance settlements, and formal exit interviews.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 18px',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Initiate Offboarding
        </button>
      </div>

      {/* Main Dual-Pane Console */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left: Departing Employees Sidebar */}
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              DEPARTING EMPLOYEES ({workflows.length})
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.78rem'
              }}
            >
              <option value="all">All</option>
              <option value="in_progress">In Progress</option>
              <option value="cleared">Cleared</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</div>
            ) : workflows.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No departing records found.</div>
            ) : (
              workflows.map((wf) => {
                const isSelected = selectedWorkflow?._id === wf._id;
                const daysRemaining = Math.max(
                  0,
                  Math.ceil((new Date(wf.lastWorkingDay).getTime() - Date.now()) / (1000 * 3600 * 24))
                );

                return (
                  <div
                    key={wf._id}
                    onClick={() => setSelectedWorkflow(wf)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: isSelected ? '#6C5CE7' : 'var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-surface-subtle)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>
                        {wf.employeeName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          backgroundColor: wf.status === 'cleared' ? '#D1FAE5' : '#FEF3C7',
                          color: wf.status === 'cleared' ? '#065F46' : '#92400E'
                        }}
                      >
                        {wf.status === 'cleared' ? 'Cleared' : `${daysRemaining}d left`}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                      {wf.role} • {wf.department}
                    </div>

                    {/* Progress Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${wf.progress}%`,
                            height: '100%',
                            backgroundColor: wf.progress === 100 ? '#10B981' : '#6C5CE7',
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {wf.progress}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Detailed Departmental Clearance Desk */}
        {selectedWorkflow ? (
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '24px' }}>
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '18px', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    {selectedWorkflow.employeeName}
                  </h2>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      backgroundColor: selectedWorkflow.status === 'cleared' ? '#D1FAE5' : '#DBEAFE',
                      color: selectedWorkflow.status === 'cleared' ? '#065F46' : '#1E40AF',
                      textTransform: 'uppercase'
                    }}
                  >
                    {selectedWorkflow.status.replace('_', ' ')}
                  </span>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  {selectedWorkflow.role} • {selectedWorkflow.department} • Notice: {selectedWorkflow.noticePeriodDays} Days
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>LAST WORKING DAY</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#EF4444' }}>
                  {new Date(selectedWorkflow.lastWorkingDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Clearance Items by Department */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
                Department Clearance Checklist ({selectedWorkflow.clearanceItems.filter(i => i.cleared).length}/{selectedWorkflow.clearanceItems.length} Cleared)
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedWorkflow.clearanceItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleToggleTask(selectedWorkflow._id, idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: item.cleared ? '#10B981' : 'var(--color-border)',
                      backgroundColor: item.cleared ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={item.cleared}
                      onChange={() => {}} // handled by parent onClick
                      style={{ width: '18px', height: '18px', accentColor: '#10B981', cursor: 'pointer' }}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '90px' }}>
                      {getDepartmentIcon(item.department)}
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                        {item.department}
                      </span>
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem', color: item.cleared ? 'var(--color-text-muted)' : 'var(--color-text-primary)', textDecoration: item.cleared ? 'line-through' : 'none' }}>
                        {item.title}
                      </div>
                      {item.description && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                          {item.description}
                        </div>
                      )}
                    </div>

                    {item.cleared && (
                      <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                        ✓ {item.clearedBy}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Exit Interview Snapshot */}
            <div style={{ backgroundColor: 'var(--color-surface-subtle)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  EXIT INTERVIEW & SENTIMENT
                </span>
                <span
                  style={{
                    fontSize: '0.74rem',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 600,
                    backgroundColor: selectedWorkflow.exitInterview?.conducted ? '#D1FAE5' : '#F3F4F6',
                    color: selectedWorkflow.exitInterview?.conducted ? '#065F46' : '#4B5563'
                  }}
                >
                  {selectedWorkflow.exitInterview?.conducted ? 'Interview Completed' : 'Pending Interview'}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                {selectedWorkflow.exitInterview?.notes || 'No notes submitted yet. Conduct exit survey to capture team feedback.'}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Select an employee to view their exit clearance status.
          </div>
        )}
      </div>

      {/* New Offboarding Modal */}
      {isNewModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '500px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Initiate Employee Offboarding
              </h3>
              <button onClick={() => setIsNewModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateWorkflow}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Employee Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jonathan Bell"
                  value={formData.employeeName}
                  onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Sales">Sales</option>
                    <option value="HR & Operations">HR & Operations</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Dev"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Notice Period (Days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.noticePeriodDays}
                    onChange={(e) => setFormData({ ...formData, noticePeriodDays: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Departure Reason
                  </label>
                  <select
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  >
                    <option value="Career Growth">Career Growth</option>
                    <option value="Relocation">Relocation</option>
                    <option value="Higher Studies">Higher Studies</option>
                    <option value="Personal / Family">Personal / Family</option>
                    <option value="Compensation">Compensation</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Launch Exit Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
