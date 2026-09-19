'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  CheckCircle2,
  UserPlus,
  Loader2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface MemberItem {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  employeeCode?: string;
}

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
  members: MemberItem[];
  budgetUtilization: number;
}

interface EmployeeOption {
  _id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  email: string;
  departmentId?: any;
}

export default function DepartmentsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptColor, setNewDeptColor] = useState('#6C5CE7');
  const [isCreatingDept, setIsCreatingDept] = useState(false);

  // Assign staff modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDeptForAssign, setSelectedDeptForAssign] = useState<DepartmentItem | null>(null);
  const [allEmployees, setAllEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmpIdToAssign, setSelectedEmpIdToAssign] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Toast feedback
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await apiRequest('/org/departments');
      if (res.success && Array.isArray(res.data)) {
        const mapped: DepartmentItem[] = res.data.map((d: any) => ({
          id: d._id,
          name: d.name,
          code: d.code || 'GEN',
          color: d.color || '#6C5CE7',
          manager: d.managerId
            ? { name: `${d.managerId.firstName} ${d.managerId.lastName}`, email: d.managerId.email, avatarUrl: d.managerId.avatarUrl }
            : { name: 'Unassigned', email: 'hod@sparkx.corp' },
          teamsCount: d.teamsCount || d.teamCount || 1,
          employeesCount: typeof d.employeesCount === 'number' ? d.employeesCount : (d.members?.length || 0),
          members: Array.isArray(d.members) ? d.members : [],
          budgetUtilization: 75
        }));
        setDepartments(mapped);
      }
    } catch (err) {
      console.warn('Could not fetch departments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeesList = async () => {
    try {
      const res = await apiRequest('/employees?limit=100');
      if (res.success && Array.isArray(res.data)) {
        setAllEmployees(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch employees for assignment:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployeesList();
  }, []);

  // Handle creating new department
  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    setIsCreatingDept(true);
    setFeedback(null);

    try {
      const res = await apiRequest('/org/departments', {
        method: 'POST',
        body: JSON.stringify({
          name: newDeptName.trim(),
          code: newDeptCode.trim().toUpperCase() || undefined,
          color: newDeptColor
        })
      });

      if (res.success && res.data) {
        setFeedback({
          type: 'success',
          text: `Department "${res.data.name}" successfully created in MongoDB Atlas and available across all modules!`
        });
        setNewDeptName('');
        setNewDeptCode('');
        setIsAddModalOpen(false);
        await fetchDepartments();
      } else {
        setFeedback({
          type: 'error',
          text: res.error || res.message || 'Failed to create department.'
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Failed to communicate with database.'
      });
    } finally {
      setIsCreatingDept(false);
    }
  };

  // Open assign staff modal
  const handleOpenAssignModal = (dept: DepartmentItem) => {
    setSelectedDeptForAssign(dept);
    setSelectedEmpIdToAssign('');
    setIsAssignModalOpen(true);
  };

  // Handle assigning employee to department
  const handleAssignEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptForAssign || !selectedEmpIdToAssign) return;

    setIsAssigning(true);
    setFeedback(null);

    try {
      const res = await apiRequest(`/org/departments/${selectedDeptForAssign.id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ employeeId: selectedEmpIdToAssign })
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          text: res.message || `Employee assigned to ${selectedDeptForAssign.name} in MongoDB Atlas!`
        });
        setIsAssignModalOpen(false);
        await fetchDepartments();
        await fetchEmployeesList();
      } else {
        setFeedback({
          type: 'error',
          text: res.error || res.message || 'Failed to assign employee.'
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Error assigning employee to department.'
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const totalAssignedStaff = departments.reduce((acc, d) => acc + d.employeesCount, 0);
  const avgTeamSize = departments.length > 0 ? (totalAssignedStaff / departments.length).toFixed(1) : '0';

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
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
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
      header: 'Real-Time Members',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '13px' }}>
            {row.employeesCount} Staff
          </span>
          {row.members && row.members.length > 0 && (
            <div style={{ display: 'flex', marginLeft: '4px' }}>
              {row.members.slice(0, 3).map((m, idx) => (
                <img
                  key={m._id || idx}
                  src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50'}
                  alt={m.firstName}
                  title={`${m.firstName} ${m.lastName}`}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.5px solid #FFFFFF',
                    marginLeft: idx > 0 ? '-6px' : '0'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenAssignModal(row)}
            iconPrefix={<UserPlus size={14} />}
          >
            Assign Staff
          </Button>
        </div>
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
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Real-Time MongoDB Departments & Staffing</span>
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
              Manage all company branches, view real-time member headcounts from MongoDB Atlas, and assign employees directly.
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

        {/* Feedback Banner */}
        {feedback && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              backgroundColor: feedback.type === 'success' ? '#00B89415' : '#D6303115',
              border: `1px solid ${feedback.type === 'success' ? '#00B894' : '#D63031'}`,
              color: feedback.type === 'success' ? '#00B894' : '#D63031',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <ShieldAlert size={18} />}
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
            >
              ×
            </button>
          </div>
        )}

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
            trend={{ value: 'Live MongoDB', isPositive: true }}
            subtitle="active units"
            icon={<Building2 size={22} />}
            progressPercentage={100}
          />
          <KpiCard
            title="Assigned Staff"
            value={totalAssignedStaff}
            trend={{ value: 'Real-Time Sync', isPositive: true }}
            subtitle="employees in departments"
            icon={<Users size={22} />}
            progressPercentage={98}
          />
          <KpiCard
            title="Average Team Size"
            value={avgTeamSize}
            trend={{ value: 'Calculated from DB', isPositive: true }}
            subtitle="members / dept"
            icon={<Layers size={22} />}
            progressPercentage={75}
          />
        </div>

        {/* Department Data Table */}
        <DataTable
          title="All Company Departments"
          subtitle="Live department roster with real-time employee counts and member allocation"
          columns={columns}
          data={departments}
          pageSize={10}
        />

        {/* Add Department Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create New Department"
          subtitle="Define a new organizational division and save to MongoDB Atlas"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateDepartment}
                disabled={isCreatingDept || !newDeptName.trim()}
                iconPrefix={isCreatingDept ? <Loader2 size={15} className="animate-spin" /> : undefined}
              >
                {isCreatingDept ? 'Saving...' : 'Save Department'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateDepartment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Department Name"
              placeholder="e.g. Mobile Engineering or DevOps"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              required
            />

            <Input
              label="Department Code (Abbreviation)"
              placeholder="e.g. MOB or DVP"
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

        {/* Assign Employee to Department Modal */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Staff to ${selectedDeptForAssign?.name || 'Department'}`}
          subtitle="Select an employee to allocate to this department in MongoDB Atlas"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAssignEmployee}
                disabled={isAssigning || !selectedEmpIdToAssign}
                iconPrefix={isAssigning ? <Loader2 size={15} className="animate-spin" /> : undefined}
              >
                {isAssigning ? 'Assigning...' : 'Assign to Department'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleAssignEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Target Department
              </label>
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-border)', fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                {selectedDeptForAssign?.name} ({selectedDeptForAssign?.code})
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Select Employee
              </label>
              <select
                value={selectedEmpIdToAssign}
                onChange={(e) => setSelectedEmpIdToAssign(e.target.value)}
                required
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  padding: '0 12px',
                  backgroundColor: 'var(--color-surface)',
                  fontSize: '14px',
                  outline: 'none',
                  color: 'var(--color-text-main)'
                }}
              >
                <option value="">-- Choose an employee --</option>
                {allEmployees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeCode}) {emp.email}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
