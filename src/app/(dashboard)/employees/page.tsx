'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { KpiCard } from '../../../components/ui/KpiCard';
import { DataTable, Column } from '../../../components/ui/DataTable';
import { apiRequest } from '../../../lib/api';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  LayoutGrid,
  List,
  Building,
  Mail,
  Phone,
  ArrowUpRight,
  Shield,
  FileText,
  Loader2,
  X
} from 'lucide-react';

interface EmployeeRecord {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  role?: string;
  status: 'Active' | 'Probation' | 'Notice' | 'Terminated';
  location: 'Office' | 'Remote' | 'Hybrid';
  avatarUrl?: string;
  joiningDate: string;
}

export default function EmployeesPage() {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  // Real-time Database state only - no dummy fallback
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeesAndDepts = async () => {
      try {
        setIsLoading(true);
        const [empRes, deptRes, roleRes] = await Promise.all([
          apiRequest('/employees'),
          apiRequest('/org/departments'),
          apiRequest('/org/roles')
        ]);

        if (deptRes.success && Array.isArray(deptRes.data)) {
          setDepartmentsList(deptRes.data);
        }

        if (roleRes.success && Array.isArray(roleRes.data)) {
          setRolesList(roleRes.data);
        }

        if (empRes.success && Array.isArray(empRes.data)) {
          const liveList: EmployeeRecord[] = empRes.data.map((emp: any) => ({
            id: emp._id,
            code: emp.employeeCode || 'SPX-0000',
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Unnamed Employee',
            email: emp.email || '',
            phone: emp.phone || 'N/A',
            department: emp.departmentId?.name || 'Unassigned',
            designation: emp.designationId?.title || 'Staff Member',
            role: emp.role || 'Employee',
            status: (emp.employmentStatus ? (emp.employmentStatus.charAt(0).toUpperCase() + emp.employmentStatus.slice(1)) : 'Active') as any,
            location: (emp.workLocation ? (emp.workLocation.charAt(0).toUpperCase() + emp.workLocation.slice(1)) : 'Office') as any,
            avatarUrl: emp.avatarUrl,
            joiningDate: new Date(emp.joiningDate || emp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }));

          setEmployees(liveList);
        } else {
          setEmployees([]);
        }
      } catch (err) {
        console.warn('Could not fetch employees or departments:', err);
        setEmployees([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployeesAndDepts();
  }, []);

  // Filtered employees from real data
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchQuery.trim() ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesRole = roleFilter === 'All' || emp.role === roleFilter;

    return matchesSearch && matchesStatus && matchesDept && matchesRole;
  });

  // Dynamic real-time metrics calculated purely from database records
  const totalHeadcount = employees.length;
  const activeEmployees = employees.filter((e) => e.status === 'Active').length;
  const onProbation = employees.filter((e) => e.status === 'Probation').length;
  const remoteHybridCount = employees.filter((e) => e.location === 'Remote' || e.location === 'Hybrid').length;
  const remoteHybridPercent = totalHeadcount > 0 ? Math.round((remoteHybridCount / totalHeadcount) * 100) : 0;
  const activePercent = totalHeadcount > 0 ? ((activeEmployees / totalHeadcount) * 100).toFixed(1) : '0';

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'All' || deptFilter !== 'All' || roleFilter !== 'All';

  const columns: Column<EmployeeRecord>[] = [
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
            <Link
              href={`/employees/${row.id}`}
              style={{ fontWeight: 700, color: 'var(--color-text-main)', display: 'block' }}
            >
              {row.name}
            </Link>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{row.code}</span>
          </div>
        </div>
      )
    },
    { key: 'department', header: 'Department', sortable: true },
    {
      key: 'role' as any,
      header: 'Role (RBAC)',
      sortable: true,
      render: (row) => (
        <Badge variant={row.role === 'Owner / CEO' ? 'warning' : row.role?.includes('Manager') || row.role?.includes('Admin') ? 'primary' : 'neutral'}>
          {row.role || 'Employee'}
        </Badge>
      )
    },
    { key: 'designation', header: 'Designation' },
    {
      key: 'location',
      header: 'Location',
      render: (row) => <Badge variant="neutral">{row.location}</Badge>
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variant =
          row.status === 'Active'
            ? 'success'
            : row.status === 'Probation'
            ? 'primary'
            : row.status === 'Notice'
            ? 'warning'
            : 'danger';
        return <Badge variant={variant} dot>{row.status}</Badge>;
      }
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <Link href={`/employees/${row.id}`}>
          <Button variant="ghost" size="sm" iconSuffix={<ArrowUpRight size={14} />}>
            Profile
          </Button>
        </Link>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Badge variant="primary" dot>Personnel Management</Badge>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Live MongoDB Atlas Registry</span>
            </div>
            <h1
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                letterSpacing: '-0.02em'
              }}
            >
              Employee Directory
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Complete central registry of team members, employment lifecycle, and digital document vaults.
            </p>
          </div>

          <Link href="/employees/new">
            <Button variant="primary" iconPrefix={<UserPlus size={16} />}>
              Add New Employee
            </Button>
          </Link>
        </div>

        {/* Top 4 KPI Metrics - 100% Calculated from Live Database */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          <KpiCard
            title="Total Headcount"
            value={totalHeadcount}
            trend={{ value: `${totalHeadcount} records`, isPositive: true }}
            subtitle="in database"
            icon={<Users size={22} />}
            progressPercentage={totalHeadcount > 0 ? 100 : 0}
          />
          <KpiCard
            title="Active Employees"
            value={activeEmployees}
            trend={{ value: `${activePercent}% Active`, isPositive: true }}
            subtitle="regular status"
            icon={<Shield size={22} />}
            progressPercentage={totalHeadcount > 0 ? Math.round((activeEmployees / totalHeadcount) * 100) : 0}
          />
          <KpiCard
            title="On Probation"
            value={onProbation}
            trend={{ value: onProbation > 0 ? `${onProbation} in review` : '0 pending', isPositive: onProbation === 0 }}
            subtitle="under evaluation"
            icon={<FileText size={22} />}
            progressPercentage={totalHeadcount > 0 ? Math.round((onProbation / totalHeadcount) * 100) : 0}
          />
          <KpiCard
            title="Remote / Hybrid"
            value={`${remoteHybridPercent}%`}
            trend={{ value: `${remoteHybridCount} of ${totalHeadcount}`, isPositive: true }}
            subtitle="flexible locations"
            icon={<Building size={22} />}
            progressPercentage={remoteHybridPercent}
          />
        </div>

        {/* Polished, Unified Filter Toolbar */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Left: Search input + 3 Dropdown filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: '1 1 auto' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  pointerEvents: 'none'
                }}
              />
              <input
                type="text"
                placeholder="Search by name, email, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '38px',
                  padding: '0 12px 0 34px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                height: '38px',
                padding: '0 12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '13px',
                backgroundColor: 'var(--color-surface)',
                outline: 'none',
                color: 'var(--color-text-main)',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Probation">Probation</option>
              <option value="Notice">Notice Period</option>
              <option value="Terminated">Terminated</option>
            </select>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{
                height: '38px',
                padding: '0 12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '13px',
                backgroundColor: 'var(--color-surface)',
                outline: 'none',
                color: 'var(--color-text-main)',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Departments ({departmentsList.length})</option>
              {departmentsList.map((d) => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                height: '38px',
                padding: '0 12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '13px',
                backgroundColor: 'var(--color-surface)',
                outline: 'none',
                color: 'var(--color-text-main)',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Roles ({rolesList.length})</option>
              {rolesList.map((r) => (
                <option key={r._id || r.id} value={r.name}>{r.name}</option>
              ))}
            </select>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setDeptFilter('All');
                  setRoleFilter('All');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                <X size={14} />
                Reset
              </button>
            )}
          </div>

          {/* Right: Showing count & Segmented View Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginLeft: 'auto' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
              Showing <strong>{filteredEmployees.length}</strong> of {totalHeadcount}
            </span>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface-soft)',
                borderRadius: 'var(--radius-md)',
                padding: '3px',
                border: '1px solid var(--color-border-subtle)'
              }}
            >
              <button
                onClick={() => setViewMode('table')}
                title="Table View"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '30px',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: viewMode === 'table' ? 'var(--color-surface)' : 'transparent',
                  color: viewMode === 'table' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '30px',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? 'var(--color-surface)' : 'transparent',
                  color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* View Content: Table, Grid or Empty State */}
        {isLoading ? (
          <Card padding="lg" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--color-primary)' }} />
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Loading real-time employee data from MongoDB Atlas...
            </p>
          </Card>
        ) : employees.length === 0 ? (
          /* Empty Database State */
          <Card padding="lg" style={{ textAlign: 'center', padding: '60px 24px' }}>
            <Users size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              No Employees Found in Database
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', maxWidth: '420px', margin: '6px auto 20px auto', lineHeight: 1.5 }}>
              There are currently no employee records registered in MongoDB Atlas. Click below to register the first employee.
            </p>
            <Link href="/employees/new">
              <Button variant="primary" iconPrefix={<UserPlus size={16} />}>
                Add First Employee
              </Button>
            </Link>
          </Card>
        ) : filteredEmployees.length === 0 ? (
          /* No search matches */
          <Card padding="lg" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Search size={40} color="var(--color-text-muted)" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              No matching employees found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px', marginBottom: '16px' }}>
              No staff members match the current search or filter combination.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
                setDeptFilter('All');
                setRoleFilter('All');
              }}
            >
              Reset All Filters
            </Button>
          </Card>
        ) : viewMode === 'table' ? (
          <DataTable
            columns={columns}
            data={filteredEmployees}
            searchable={false}
            pageSize={10}
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}
          >
            {filteredEmployees.map((emp) => (
              <Card key={emp.id} padding="md" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {emp.avatarUrl ? (
                      <img
                        src={emp.avatarUrl}
                        alt={emp.name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-primary)',
                          color: '#FFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '18px'
                        }}
                      >
                        {emp.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <Link href={`/employees/${emp.id}`} style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-text-main)' }}>
                        {emp.name}
                      </Link>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {emp.designation}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{emp.code}</div>
                    </div>
                  </div>

                  <Badge variant={emp.status === 'Active' ? 'success' : 'primary'} dot>
                    {emp.status}
                  </Badge>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: 'var(--color-text-secondary)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={13} color="var(--color-text-muted)" />
                    <span>{emp.department}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={13} color="var(--color-text-muted)" />
                    <span>{emp.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} color="var(--color-text-muted)" />
                    <span>{emp.phone}</span>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <Link href={`/employees/${emp.id}`} style={{ flex: 1 }}>
                    <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                      View Profile
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
