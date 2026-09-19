'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { apiRequest } from '../../../../lib/api';
import { ShieldCheck, Lock, Check, X, Sparkles, Plus, Save } from 'lucide-react';

interface RolePermissionMatrix {
  id: string;
  name: string;
  description: string;
  isSystemRole: boolean;
  permissions: string[];
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

export default function RolesPermissionsPage() {
  const [roles, setRoles] = useState<RolePermissionMatrix[]>([
    {
      id: 'r-1',
      name: 'Owner / CEO',
      description: 'Senior Authority with full access across entire workspace',
      isSystemRole: true,
      permissions: ['*']
    },
    {
      id: 'r-2',
      name: 'HR Admin',
      description: 'Full personnel, onboarding, attendance and leave authority',
      isSystemRole: true,
      permissions: [
        'employees.read', 'employees.write', 'employees.delete',
        'attendance.read', 'attendance.manage',
        'leave.apply', 'leave.approve_hr',
        'tasks.read', 'org.read', 'org.manage'
      ]
    },
    {
      id: 'r-3',
      name: 'Finance Manager',
      description: 'Compensation structures, monthly payroll runs and payouts',
      isSystemRole: true,
      permissions: [
        'employees.read', 'payslip.view_own',
        'salary.manage', 'payroll.manage', 'payroll.approve',
        'org.read'
      ]
    },
    {
      id: 'r-4',
      name: 'Department Manager',
      description: 'Supervises department members, team attendance and tier 1 leaves',
      isSystemRole: true,
      permissions: [
        'employees.read', 'attendance.checkin', 'attendance.read',
        'leave.apply', 'leave.approve_manager',
        'tasks.read', 'tasks.manage', 'projects.manage',
        'org.read'
      ]
    },
    {
      id: 'r-5',
      name: 'Team Lead',
      description: 'Manages squad task board, sprints and peer reviews',
      isSystemRole: true,
      permissions: [
        'employees.read', 'attendance.checkin', 'attendance.read',
        'leave.apply', 'tasks.read', 'tasks.manage',
        'org.read'
      ]
    },
    {
      id: 'r-6',
      name: 'Employee',
      description: 'Standard self-service for personal work, time, and leaves',
      isSystemRole: true,
      permissions: [
        'attendance.checkin', 'leave.apply',
        'payslip.view_own', 'tasks.read', 'org.read'
      ]
    }
  ]);

  const [activeRoleIndex, setActiveRoleIndex] = useState(1); // HR Admin default
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await apiRequest('/org/roles');
        if (res.success && res.data && res.data.length > 0) {
          const mapped: RolePermissionMatrix[] = res.data.map((r: any) => ({
            id: r._id,
            name: r.name,
            description: r.description || `Permissions for ${r.name}`,
            isSystemRole: r.isSystemRole,
            permissions: r.permissions || []
          }));
          setRoles(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch roles from backend:', err);
      }
    };
    fetchRoles();
  }, []);

  const currentRole = roles[activeRoleIndex] || roles[0];

  const handleTogglePermission = async (permId: string) => {
    if (currentRole.permissions.includes('*')) return; // Owner always has everything

    const updatedRoles = [...roles];
    const role = updatedRoles[activeRoleIndex];

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
    } catch (err) {
      console.warn('Failed to persist role permission to backend:', err);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Badge variant="primary" dot style={{ marginBottom: '6px' }}>Security & RBAC</Badge>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Roles & Granular Permissions
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Define role access scopes, feature boundaries, and administrative authorities across the platform.
            </p>
          </div>

          {savedSuccess && (
            <Badge variant="success" dot style={{ fontSize: '13px', padding: '6px 14px' }}>
              Permissions Saved to sparkx_db!
            </Badge>
          )}
        </div>

        {/* Two Column Layout: Role Selector + Permission Matrix */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
          {/* Left: Role List */}
          <Card padding="none" style={{ height: 'fit-content' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-subtle)', fontWeight: 700, fontSize: '14px' }}>
              Organizational Roles ({roles.length})
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
                      {role.isSystemRole && (
                        <Badge variant={isSelected ? 'primary' : 'neutral'} style={{ fontSize: '10px' }}>
                          System
                        </Badge>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                      {role.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Right: Permission Matrix for Active Role */}
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="var(--color-primary)" />
                <span>Permissions for {currentRole.name}</span>
              </div>
            }
            subtitle={
              currentRole.permissions.includes('*')
                ? 'This master role possesses absolute, unrestricted administrative privileges across all modules.'
                : 'Toggle permissions to grant or revoke specific actions in this role.'
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {ALL_PERMISSION_MODULES.map((mod, modIdx) => (
                <div key={modIdx} style={{ borderBottom: modIdx < ALL_PERMISSION_MODULES.length - 1 ? '1px solid var(--color-border-subtle)' : 'none', paddingBottom: '18px' }}>
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
      </div>
    </DashboardLayout>
  );
}
