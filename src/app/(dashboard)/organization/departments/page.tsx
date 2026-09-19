'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { KpiCard } from '../../../../components/ui/KpiCard';
import { apiRequest } from '../../../../lib/api';
import {
  Building2,
  Users,
  Plus,
  Layers,
  Sparkles,
  TrendingUp,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

interface DepartmentItem {
  id: string;
  name: string;
  code: string;
  color: string;
  manager: {
    name: string;
    avatarUrl?: string;
    email: string;
  };
  teamsCount: number;
  employeesCount: number;
  budgetUtilization: number;
}

export default function DepartmentsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptColor, setNewDeptColor] = useState('#6C5CE7');

  const [departments, setDepartments] = useState<DepartmentItem[]>([
    {
      id: 'dept-1',
      name: 'Engineering & Technology',
      code: 'ENG',
      color: '#6C5CE7',
      manager: { name: 'Marcus Sterling', email: 'marcus@sparkx.corp' },
      teamsCount: 4,
      employeesCount: 184,
      budgetUtilization: 82
    },
    {
      id: 'dept-2',
      name: 'Product & Design',
      code: 'PRD',
      color: '#4FD1FF',
      manager: { name: 'Sarah Jenkins', email: 'sarah@sparkx.corp' },
      teamsCount: 2,
      employeesCount: 52,
      budgetUtilization: 74
    },
    {
      id: 'dept-3',
      name: 'Sales & Revenue',
      code: 'SLS',
      color: '#10B981',
      manager: { name: 'David Kim', email: 'david@sparkx.corp' },
      teamsCount: 3,
      employeesCount: 96,
      budgetUtilization: 91
    },
    {
      id: 'dept-4',
      name: 'Human Resources & People Ops',
      code: 'HRO',
      color: '#F59E0B',
      manager: { name: 'Elena Rostova', email: 'elena@sparkx.corp' },
      teamsCount: 2,
      employeesCount: 28,
      budgetUtilization: 68
    },
    {
      id: 'dept-5',
      name: 'Finance & Accounting',
      code: 'FIN',
      color: '#0EA5E9',
      manager: { name: 'Tariq Hassan', email: 'tariq@sparkx.corp' },
      teamsCount: 2,
      employeesCount: 22,
      budgetUtilization: 85
    }
  ]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await apiRequest('/org/departments');
        if (res.success && res.data && res.data.length > 0) {
          const mapped: DepartmentItem[] = res.data.map((d: any) => ({
            id: d._id,
            name: d.name,
            code: d.code || 'GEN',
            color: d.color || '#6C5CE7',
            manager: d.managerId
              ? { name: `${d.managerId.firstName} ${d.managerId.lastName}`, email: d.managerId.email }
              : { name: 'Unassigned', email: 'hod@sparkx.corp' },
            teamsCount: d.teamsCount || 1,
            employeesCount: d.employeesCount || 0,
            budgetUtilization: 75
          }));
          setDepartments(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch departments:', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    const newDept: DepartmentItem = {
      id: `dept-${Date.now()}`,
      name: newDeptName.trim(),
      code: newDeptCode.trim().toUpperCase() || 'GEN',
      color: newDeptColor,
      manager: { name: 'Unassigned', email: 'hod@sparkx.corp' },
      teamsCount: 1,
      employeesCount: 0,
      budgetUtilization: 0
    };

    try {
      const res = await apiRequest('/org/departments', {
        method: 'POST',
        body: JSON.stringify({
          name: newDeptName.trim(),
          code: newDeptCode.trim().toUpperCase() || 'GEN',
          color: newDeptColor
        })
      });
      if (res.success && res.data) {
        newDept.id = res.data._id;
      }
    } catch (err) {
      console.warn('Created department offline:', err);
    }

    setDepartments([newDept, ...departments]);
    setNewDeptName('');
    setNewDeptCode('');
    setIsAddModalOpen(false);
  };

  const columns: Column<DepartmentItem>[] = [
    {
      key: 'name',
      header: 'Department Name',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '4px',
              backgroundColor: row.color,
              flexShrink: 0
            }}
          />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{row.name}</div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                letterSpacing: '0.04em'
              }}
            >
              CODE: {row.code}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'manager',
      header: 'Head of Department',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px'
            }}
          >
            {row.manager.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{row.manager.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{row.manager.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'teamsCount',
      header: 'Active Teams',
      render: (row) => (
        <Badge variant="neutral">{row.teamsCount} Teams</Badge>
      )
    },
    {
      key: 'employeesCount',
      header: 'Total Members',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
          {row.employeesCount} Staff
        </span>
      )
    },
    {
      key: 'budgetUtilization',
      header: 'Budget Velocity',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '80px',
              height: '6px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-surface-soft)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${row.budgetUtilization}%`,
                height: '100%',
                backgroundColor: row.color,
                borderRadius: 'var(--radius-pill)'
              }}
            />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600 }}>{row.budgetUtilization}%</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      render: () => (
        <Button variant="ghost" size="sm" style={{ color: 'var(--color-primary)' }}>
          Manage
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Page Top Header */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Badge variant="primary" dot>Organization Unit</Badge>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Phase 3 RBAC</span>
            </div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                letterSpacing: '-0.02em'
              }}
            >
              Departments & Divisions
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Organize company business units, assign department managers, and monitor staffing quotas.
            </p>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            iconPrefix={<Plus size={16} />}
          >
            Add Department
          </Button>
        </div>

        {/* 3 Overview KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          <KpiCard
            title="Total Departments"
            value={departments.length}
            trend={{ value: '+1 New', isPositive: true }}
            subtitle="active units"
            icon={<Building2 size={22} />}
            progressPercentage={100}
          />
          <KpiCard
            title="Assigned Staff"
            value="382"
            trend={{ value: '98.5% Allocated', isPositive: true }}
            subtitle="across departments"
            icon={<Users size={22} />}
            progressPercentage={98}
          />
          <KpiCard
            title="Average Team Size"
            value="29.4"
            trend={{ value: 'Optimal Balance', isPositive: true }}
            subtitle="members / dept"
            icon={<Layers size={22} />}
            progressPercentage={75}
          />
        </div>

        {/* Department Data Table */}
        <DataTable
          title="All Company Departments"
          subtitle="Complete list of company branches with leadership and active metrics"
          columns={columns}
          data={departments}
          pageSize={5}
        />

        {/* Add Department Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Department"
          subtitle="Define a new organizational division and leadership"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateDepartment}>
                Save Department
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateDepartment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Department Name"
              placeholder="e.g. Legal & Compliance"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              required
            />

            <Input
              label="Department Code (Abbreviation)"
              placeholder="e.g. LGL"
              value={newDeptCode}
              onChange={(e) => setNewDeptCode(e.target.value)}
              helperText="2-4 uppercase characters used in employee IDs"
            />

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '8px', display: 'block' }}>
                Brand Theme Color
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['#6C5CE7', '#4FD1FF', '#10B981', '#F59E0B', '#EF4444', '#0EA5E9'].map((c) => (
                  <div
                    key={c}
                    onClick={() => setNewDeptColor(c)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      cursor: 'pointer',
                      border: newDeptColor === c ? '3px solid #FFFFFF' : 'none',
                      boxShadow: newDeptColor === c ? '0 0 0 2px var(--color-primary)' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
