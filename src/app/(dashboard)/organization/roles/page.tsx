'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { KpiCard } from '../../../../components/ui/KpiCard';
import { LoadingOverlay } from '../../../../components/ui/LoadingOverlay';
import { apiRequest } from '../../../../lib/api';
import {
  ShieldCheck,
  Lock,
  Check,
  X,
  Plus,
  Users,
  Search,
  Building2,
  UserCheck,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface RolePermissionMatrix {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissions: string[];
  membersCount?: number;
}

interface RoleAssignmentMember {
  id: string;
  code: string;
  name: string;
  email: string;
  avatarUrl?: string;
  department: string;
  departmentId?: string;
  departmentColor?: string;
  designation: string;
  role: string;
  status: string;
}

const ALL_PERMISSION_MODULES = [
  {
    module: 'Employee Management',
    permissions: [
      { id: 'employees.read', label: 'View Employee Directory' },
      { id: 'employees.write', label: 'Create & Edit Employees' },
      { id: 'employees.delete', label: 'Terminate & Delete Employees' }
    ]
  },
  {
    module: 'Time & Attendance',
    permissions: [
      { id: 'attendance.checkin', label: 'Personal Clock In / Out' },
      { id: 'attendance.read', label: 'View Team Attendance' },
      { id: 'attendance.manage', label: 'Adjust Manual Attendance' }
    ]
  },
  {
    module: 'Leave Management',
    permissions: [
      { id: 'leave.apply', label: 'Apply for Leave' },
      { id: 'leave.approve_manager', label: 'Tier 1 Manager Approval' },
      { id: 'leave.approve_hr', label: 'Tier 2 Final HR Approval' }
    ]
  },
  {
    module: 'Salary & Payroll',
    permissions: [
      { id: 'payslip.view_own', label: 'View Own Payslip' },
      { id: 'salary.manage', label: 'Manage Salary Structures' },
      { id: 'payroll.manage', label: 'Run Monthly Payroll' },
      { id: 'payroll.approve', label: 'Disburse Payroll Funds' }
    ]
  },
  {
    module: 'Work & Projects',
    permissions: [
      { id: 'tasks.read', label: 'View Assigned Tasks' },
      { id: 'tasks.manage', label: 'Create & Assign Tasks' },
      { id: 'projects.manage', label: 'Create & Configure Projects' }
    ]
  },
  {
    module: 'Organization & Platform',
    permissions: [
      { id: 'org.read', label: 'View Org Tree & Hierarchy' },
      { id: 'org.manage', label: 'Configure Departments & Roles' },
      { id: 'audit.view', label: 'Inspect Security Audit Logs' }
    ]
  }
];

export default function RolesManagementPage() {
  const [activeTab, setActiveTab] = useState<'assignments' | 'matrix'>('assignments');
  const [roles, setRoles] = useState<RolePermissionMatrix[]>([]);
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);
  const [assignments, setAssignments] = useState<RoleAssignmentMember[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters for Tab 1
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterDept, setFilterDept] = useState('All');

  // Change Role Modal
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState(false);
  const [selectedMemberForRole, setSelectedMemberForRole] = useState<RoleAssignmentMember | null>(null);
  const [targetRoleName, setTargetRoleName] = useState('');
  const [isAssigningRole, setIsAssigningRole] = useState(false);

  // Change Dept Modal
  const [isChangeDeptModalOpen, setIsChangeDeptModalOpen] = useState(false);
  const [selectedMemberForDept, setSelectedMemberForDept] = useState<RoleAssignmentMember | null>(null);
  const [targetDeptId, setTargetDeptId] = useState('');
  const [isAssigningDept, setIsAssigningDept] = useState(false);

  // Add Custom Role Modal
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([
    'employees.read',
    'attendance.checkin',
    'leave.apply',
    'tasks.read',
    'org.read'
  ]);
  const [isCreatingRole, setIsCreatingRole] = useState(false);

  // Toast feedback
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [rolesRes, assignRes, deptsRes] = await Promise.all([
        apiRequest('/org/roles'),
        apiRequest('/org/roles/assignments'),
        apiRequest('/org/departments')
      ]);

      if (rolesRes.success && Array.isArray(rolesRes.data)) {
        const mappedRoles: RolePermissionMatrix[] = rolesRes.data.map((r: any) => ({
          id: r._id,
          name: r.name,
          description: r.description || `Permissions scope for ${r.name}`,
          isSystemRole: Boolean(r.isSystemRole),
          permissions: r.permissions || [],
          membersCount: r.membersCount || 0
        }));
        setRoles(mappedRoles);
      }

      if (assignRes.success && Array.isArray(assignRes.data)) {
        setAssignments(assignRes.data);
      }

      if (deptsRes.success && Array.isArray(deptsRes.data)) {
        setDepartmentsList(deptsRes.data);
      }
    } catch (err) {
      console.warn('Could not load roles and assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const currentRole = roles[activeRoleIndex] || roles[0] || {
    id: '',
    name: 'Employee',
    description: 'Standard access',
    isSystemRole: true,
    permissions: []
  };

  // Toggle permission in matrix
  const handleTogglePermission = async (permId: string) => {
    if (currentRole.permissions.includes('*')) return; // Owner has wildcard access

    const updatedRoles = [...roles];
    const role = updatedRoles[activeRoleIndex];
    if (!role) return;

    let newPermissions: string[];
    if (role.permissions.includes(permId)) {
      newPermissions = role.permissions.filter((p) => p !== permId);
    } else {
      newPermissions = [...role.permissions, permId];
    }
    role.permissions = newPermissions;
    setRoles(updatedRoles);

    try {
      await apiRequest(`/org/roles/${role.id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: newPermissions })
      });
      setFeedback({
        type: 'success',
        text: `Permissions for "${role.name}" successfully updated in MongoDB Atlas!`
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        text: 'Failed to update role permissions in database.'
      });
    }
  };

  // Create new custom role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsCreatingRole(true);
    setFeedback(null);

    try {
      const res = await apiRequest('/org/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: newRoleName.trim(),
          description: newRoleDesc.trim() || undefined,
          permissions: newRolePermissions
        })
      });

      if (res.success && res.data) {
        setFeedback({
          type: 'success',
          text: `Role "${res.data.name}" created in MongoDB Atlas and available across all dropdowns!`
        });
        setNewRoleName('');
        setNewRoleDesc('');
        setIsAddRoleModalOpen(false);
        await fetchAllData();
      } else {
        setFeedback({
          type: 'error',
          text: res.error || 'Failed to create role'
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Server error creating role'
      });
    } finally {
      setIsCreatingRole(false);
    }
  };

  // Open Change Role Modal
  const handleOpenChangeRole = (member: RoleAssignmentMember) => {
    setSelectedMemberForRole(member);
    setTargetRoleName(member.role || (roles[0] ? roles[0].name : 'Employee'));
    setIsChangeRoleModalOpen(true);
  };

  // Submit Change Role
  const handleSubmitChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForRole || !targetRoleName) return;

    setIsAssigningRole(true);
    setFeedback(null);

    try {
      const res = await apiRequest('/org/roles/assign', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: selectedMemberForRole.id,
          roleName: targetRoleName
        })
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          text: `Assigned role "${targetRoleName}" to ${selectedMemberForRole.name} in MongoDB Atlas!`
        });
        setIsChangeRoleModalOpen(false);
        await fetchAllData();
      } else {
        setFeedback({
          type: 'error',
          text: res.error || 'Failed to assign role'
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Server error assigning role'
      });
    } finally {
      setIsAssigningRole(false);
    }
  };

  // Open Change Department Modal
  const handleOpenChangeDept = (member: RoleAssignmentMember) => {
    setSelectedMemberForDept(member);
    const currDept = departmentsList.find((d) => d.name === member.department);
    setTargetDeptId(currDept ? currDept._id : (departmentsList[0]?._id || ''));
    setIsChangeDeptModalOpen(true);
  };

  // Submit Change Department
  const handleSubmitChangeDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberForDept || !targetDeptId) return;

    setIsAssigningDept(true);
    setFeedback(null);

    try {
      const res = await apiRequest(`/org/departments/${targetDeptId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ employeeId: selectedMemberForDept.id })
      });

      if (res.success) {
        const targetDept = departmentsList.find((d) => d._id === targetDeptId);
        setFeedback({
          type: 'success',
          text: `Transferred ${selectedMemberForDept.name} to ${targetDept?.name || 'Department'} in MongoDB Atlas!`
        });
        setIsChangeDeptModalOpen(false);
        await fetchAllData();
      } else {
        setFeedback({
          type: 'error',
          text: res.error || 'Failed to reassign department'
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || 'Server error reassigning department'
      });
    } finally {
      setIsAssigningDept(false);
    }
  };

  // Filtered members for Tab 1
  const filteredAssignments = assignments.filter((m) => {
    const matchesSearch =
      !searchQuery.trim() ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = filterRole === 'All' || m.role === filterRole;
    const matchesDept = filterDept === 'All' || m.department === filterDept;

    return matchesSearch && matchesRole && matchesDept;
  });

  const assignmentColumns: Column<RoleAssignmentMember>[] = [
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {row.avatarUrl ? (
            <img
              src={row.avatarUrl}
              alt={row.name}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              {row.name.charAt(0)}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{row.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{row.code} • {row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: row.departmentColor || 'var(--color-primary)'
            }}
          />
          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-main)' }}>
            {row.department || 'Unassigned'}
          </span>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Assigned Role',
      sortable: true,
      render: (row) => {
        const isOwner = row.role === 'Owner / CEO';
        const isSenior = row.role?.includes('Manager') || row.role?.includes('Admin');
        return (
          <Badge
            variant={isOwner ? 'warning' : isSenior ? 'primary' : 'neutral'}
            style={{ fontWeight: 700 }}
          >
            {row.role || 'Employee'}
          </Badge>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          variant={row.status === 'active' || row.status === 'Active' ? 'success' : 'neutral'}
          dot
        >
          {row.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Manage Assignments',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChangeRole(row)}
            iconPrefix={<ShieldCheck size={14} />}
          >
            Change Role
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenChangeDept(row)}
            iconPrefix={<Building2 size={14} />}
          >
            Change Dept
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Top Header Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Badge variant="primary" dot>Access Control & RBAC</Badge>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Real-Time MongoDB Atlas Roles & Staff Placement</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
              Roles, Permissions & Staff Assignments
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Create custom roles, define granular authority matrices, track who is assigned to each role & department, and reassign roles in real-time.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              variant="primary"
              onClick={() => setIsAddRoleModalOpen(true)}
              iconPrefix={<Plus size={16} />}
            >
              Add New Role
            </Button>
          </div>
        </div>

        {/* Feedback Notification */}
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

        {/* Dynamic Content with Blur Loading State */}
        <LoadingOverlay
          isLoading={loading}
          title="Loading Roles & Permissions"
          message="Fetching role assignments, access matrices, and permissions from MongoDB Atlas..."
          minHeight="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* KPI Cards Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <KpiCard
            title="Total Assigned Staff"
            value={assignments.length}
            trend={{ value: 'Live MongoDB', isPositive: true }}
            subtitle="personnel tracked"
            icon={<Users size={22} />}
            progressPercentage={100}
          />
          <KpiCard
            title="Defined Roles"
            value={roles.length}
            trend={{ value: `${roles.filter((r) => !r.isSystemRole).length} Custom`, isPositive: true }}
            subtitle="system & custom tiers"
            icon={<ShieldCheck size={22} />}
            progressPercentage={85}
          />
          <KpiCard
            title="Active Departments"
            value={departmentsList.length}
            trend={{ value: 'Live Sync', isPositive: true }}
            subtitle="organizational units"
            icon={<Building2 size={22} />}
            progressPercentage={90}
          />
        </div>

        {/* Tab Navigation Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '2px'
          }}
        >
          <button
            onClick={() => setActiveTab('assignments')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              borderBottom: activeTab === 'assignments' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
              backgroundColor: activeTab === 'assignments' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'assignments' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={16} />
            <span>Staff Role & Department Directory</span>
            <Badge variant="neutral" style={{ fontSize: '11px', marginLeft: '4px' }}>
              {assignments.length}
            </Badge>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px 8px 0 0',
              border: 'none',
              borderBottom: activeTab === 'matrix' ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
              backgroundColor: activeTab === 'matrix' ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === 'matrix' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={16} />
            <span>Roles & Permissions Matrix</span>
            <Badge variant="neutral" style={{ fontSize: '11px', marginLeft: '4px' }}>
              {roles.length}
            </Badge>
          </button>
        </div>

        {/* TAB 1: Staff Role & Department Directory */}
        {activeTab === 'assignments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Filter Bar */}
            <Card padding="sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                <div style={{ width: '280px' }}>
                  <Input
                    placeholder="Search staff by name, email, code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    iconPrefix={<Search size={15} />}
                  />
                </div>

                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '13px',
                    backgroundColor: 'var(--color-surface)',
                    outline: 'none',
                    color: 'var(--color-text-main)'
                  }}
                >
                  <option value="All">All Roles ({roles.length})</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>

                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    fontSize: '13px',
                    backgroundColor: 'var(--color-surface)',
                    outline: 'none',
                    color: 'var(--color-text-main)'
                  }}
                >
                  <option value="All">All Departments ({departmentsList.length})</option>
                  {departmentsList.map((d) => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Assignments Table */}
            <DataTable
              title="Staff Members & Role Placements"
              subtitle="Real-time listing of who is assigned to which role and department"
              columns={assignmentColumns}
              data={filteredAssignments}
              pageSize={10}
            />
          </div>
        )}

        {/* TAB 2: Roles & Permissions Matrix */}
        {activeTab === 'matrix' && (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
            {/* Left: Roles List */}
            <Card padding="none" style={{ height: 'fit-content' }}>
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>Organizational Roles ({roles.length})</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddRoleModalOpen(true)}
                  iconPrefix={<Plus size={14} />}
                >
                  New
                </Button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', padding: '8px' }}>
                {roles.map((role, idx) => {
                  const isSelected = activeRoleIndex === idx;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setActiveRoleIndex(idx)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                        border: `1px solid ${isSelected ? 'rgba(108, 92, 231, 0.3)' : 'transparent'}`,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        marginBottom: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: isSelected ? 'var(--color-primary)' : 'var(--color-text-main)' }}>
                          {role.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {role.membersCount !== undefined && (
                            <span
                              style={{
                                fontSize: '11px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--color-surface-soft)',
                                color: 'var(--color-text-secondary)',
                                fontWeight: 600
                              }}
                            >
                              {role.membersCount} staff
                            </span>
                          )}
                          <Badge variant={role.isSystemRole ? (isSelected ? 'primary' : 'neutral') : 'success'} style={{ fontSize: '10px' }}>
                            {role.isSystemRole ? 'System' : 'Custom'}
                          </Badge>
                        </div>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        {role.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Right: Permission Matrix */}
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} color="var(--color-primary)" />
                  <span>Permissions for {currentRole.name}</span>
                  {currentRole.isSystemRole && (
                    <Badge variant="neutral" style={{ fontSize: '11px' }}>System Standard</Badge>
                  )}
                </div>
              }
              subtitle={
                currentRole.permissions.includes('*')
                  ? 'This master role possesses absolute, unrestricted administrative privileges across all modules.'
                  : 'Toggle actions to grant or revoke specific operational privileges for this role.'
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {ALL_PERMISSION_MODULES.map((mod, modIdx) => (
                  <div
                    key={modIdx}
                    style={{
                      borderBottom: modIdx < ALL_PERMISSION_MODULES.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                      paddingBottom: '18px'
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '12px' }}>
                      {mod.module}
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                      {mod.permissions.map((perm) => {
                        const hasPerm = currentRole.permissions.includes('*') || currentRole.permissions.includes(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => handleTogglePermission(perm.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-md)',
                              backgroundColor: hasPerm ? 'var(--color-surface-soft)' : 'transparent',
                              border: `1px solid ${hasPerm ? 'rgba(108, 92, 231, 0.2)' : 'var(--color-border)'}`,
                              cursor: currentRole.permissions.includes('*') ? 'default' : 'pointer',
                              userSelect: 'none'
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                                {perm.label}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                {perm.id}
                              </div>
                            </div>

                            <div
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
                                backgroundColor: hasPerm ? 'var(--color-primary)' : 'var(--color-surface-soft)',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {hasPerm ? <Check size={14} strokeWidth={3} /> : <X size={12} color="var(--color-text-muted)" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
          </div>
        </LoadingOverlay>

        {/* Change Role Modal */}
        <Modal
          isOpen={isChangeRoleModalOpen}
          onClose={() => setIsChangeRoleModalOpen(false)}
          title={`Change Role: ${selectedMemberForRole?.name}`}
          subtitle="Assign a new role to this employee. Permissions and access will update immediately."
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsChangeRoleModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleSubmitChangeRole}
                disabled={isAssigningRole || !targetRoleName}
                iconPrefix={isAssigningRole ? <Loader2 size={15} className="animate-spin" /> : undefined}
              >
                {isAssigningRole ? 'Assigning...' : 'Confirm Role Assignment'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmitChangeRole} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Employee Details
              </label>
              <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-border)', fontSize: '13.5px' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{selectedMemberForRole?.name} ({selectedMemberForRole?.code})</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                  Department: <strong>{selectedMemberForRole?.department}</strong> • Current Role: <Badge variant="primary" style={{ fontSize: '11px' }}>{selectedMemberForRole?.role}</Badge>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Select New Role (Live from MongoDB Atlas)
              </label>
              <select
                value={targetRoleName}
                onChange={(e) => setTargetRoleName(e.target.value)}
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
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} {r.isSystemRole ? '(System Role)' : '(Custom Role)'}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal>

        {/* Change Department Modal */}
        <Modal
          isOpen={isChangeDeptModalOpen}
          onClose={() => setIsChangeDeptModalOpen(false)}
          title={`Transfer Department: ${selectedMemberForDept?.name}`}
          subtitle="Select a new department division for this employee in MongoDB Atlas"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsChangeDeptModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleSubmitChangeDept}
                disabled={isAssigningDept || !targetDeptId}
                iconPrefix={isAssigningDept ? <Loader2 size={15} className="animate-spin" /> : undefined}
              >
                {isAssigningDept ? 'Transferring...' : 'Transfer Department'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmitChangeDept} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Employee Details
              </label>
              <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-border)', fontSize: '13.5px' }}>
                <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{selectedMemberForDept?.name} ({selectedMemberForDept?.code})</div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                  Current Department: <strong>{selectedMemberForDept?.department}</strong> • Current Role: {selectedMemberForDept?.role}
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Target Department (Live from MongoDB Atlas)
              </label>
              <select
                value={targetDeptId}
                onChange={(e) => setTargetDeptId(e.target.value)}
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
                {departmentsList.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code || 'DEPT'})
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal>

        {/* Add Role Modal */}
        <Modal
          isOpen={isAddRoleModalOpen}
          onClose={() => setIsAddRoleModalOpen(false)}
          title="Create New Custom Role"
          subtitle="Define a custom organizational role and choose its initial permission boundaries"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsAddRoleModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleCreateRole}
                disabled={isCreatingRole || !newRoleName.trim()}
                iconPrefix={isCreatingRole ? <Loader2 size={15} className="animate-spin" /> : undefined}
              >
                {isCreatingRole ? 'Creating Role...' : 'Save & Publish Role'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateRole} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Role Title"
              placeholder="e.g. Senior Security Architect, Talent Lead, etc."
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              required
            />

            <Input
              label="Role Description"
              placeholder="e.g. Oversees compliance, security audits and enterprise infrastructure."
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
            />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  Included Module Permissions
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const all = ALL_PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.id));
                      setNewRolePermissions(all);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRolePermissions([])}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '220px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
                {ALL_PERMISSION_MODULES.map((mod, idx) => (
                  <div key={idx} style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--color-surface-soft)', border: '1px solid var(--color-border-subtle)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '8px' }}>
                      {mod.module}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {mod.permissions.map((p) => {
                        const isChecked = newRolePermissions.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '12px',
                              color: 'var(--color-text-main)',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewRolePermissions([...newRolePermissions, p.id]);
                                } else {
                                  setNewRolePermissions(newRolePermissions.filter((x) => x !== p.id));
                                }
                              }}
                              style={{ accentColor: 'var(--color-primary)' }}
                            />
                            <span>{p.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
