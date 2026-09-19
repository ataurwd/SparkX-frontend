'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
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
  FileText
} from 'lucide-react';

interface EmployeeRecord {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
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

  const sampleEmployees: EmployeeRecord[] = [
    {
      id: 'emp-1',
      code: 'SPX-001',
      name: 'Amelia Demane',
      email: 'amelia.admin@sparkx.corp',
      phone: '+1 (555) 234-5678',
      department: 'Executive Leadership',
      designation: 'CEO & Founder',
      status: 'Active',
      location: 'Office',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      joiningDate: 'Jan 15, 2024'
    },
    {
      id: 'emp-2',
      code: 'SPX-002',
      name: 'Marcus Sterling',
      email: 'marcus@sparkx.corp',
      phone: '+1 (555) 345-6789',
      department: 'Engineering & Technology',
      designation: 'VP of Engineering',
      status: 'Active',
      location: 'Hybrid',
      joiningDate: 'Mar 01, 2024'
    },
    {
      id: 'emp-3',
      code: 'SPX-003',
      name: 'Sarah Jenkins',
      email: 'sarah@sparkx.corp',
      phone: '+1 (555) 456-7890',
      department: 'Product & Design',
      designation: 'Head of Product',
      status: 'Active',
      location: 'Remote',
      joiningDate: 'Apr 10, 2024'
    },
    {
      id: 'emp-4',
      code: 'SPX-004',
      name: 'David Kim',
      email: 'david@sparkx.corp',
      phone: '+1 (555) 567-8901',
      department: 'Engineering & Technology',
      designation: 'Lead Frontend Developer',
      status: 'Active',
      location: 'Office',
      joiningDate: 'May 20, 2024'
    },
    {
      id: 'emp-5',
      code: 'SPX-005',
      name: 'Elena Rostova',
      email: 'elena@sparkx.corp',
      phone: '+1 (555) 678-9012',
      department: 'Human Resources',
      designation: 'People Ops Director',
      status: 'Active',
      location: 'Hybrid',
      joiningDate: 'Jun 12, 2024'
    },
    {
      id: 'emp-6',
      code: 'SPX-006',
      name: 'Tariq Hassan',
      email: 'tariq@sparkx.corp',
      phone: '+1 (555) 789-0123',
      department: 'Finance & Accounting',
      designation: 'VP of Finance',
      status: 'Active',
      location: 'Office',
      joiningDate: 'Jul 01, 2024'
    },
    {
      id: 'emp-7',
      code: 'SPX-007',
      name: 'Liam O\'Connor',
      email: 'liam@sparkx.corp',
      phone: '+1 (555) 890-1234',
      department: 'Engineering & Technology',
      designation: 'Junior Fullstack Dev',
      status: 'Probation',
      location: 'Remote',
      joiningDate: 'Aug 15, 2026'
    }
  ];

  const [employees, setEmployees] = useState<EmployeeRecord[]>(sampleEmployees);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);

  useEffect(() => {
    const fetchEmployeesAndDepts = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          apiRequest('/employees'),
          apiRequest('/org/departments')
        ]);

        if (deptRes.success && Array.isArray(deptRes.data)) {
          setDepartmentsList(deptRes.data);
        }

        if (empRes.success && empRes.data && empRes.data.length > 0) {
          const liveList: EmployeeRecord[] = empRes.data.map((emp: any) => ({
            id: emp._id,
            code: emp.employeeCode,
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            phone: emp.phone || '+1 (555) 000-1122',
            department: emp.departmentId?.name || 'Unassigned',
            designation: emp.designationId?.title || 'Engineer',
            status: (emp.employmentStatus ? (emp.employmentStatus.charAt(0).toUpperCase() + emp.employmentStatus.slice(1)) : 'Active') as any,
            location: (emp.workLocation ? (emp.workLocation.charAt(0).toUpperCase() + emp.workLocation.slice(1)) : 'Office') as any,
            avatarUrl: emp.avatarUrl,
            joiningDate: new Date(emp.joiningDate || emp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }));

          setEmployees([...liveList, ...sampleEmployees.filter(s => !liveList.some(l => l.code === s.code))]);
        }
      } catch (err) {
        console.warn('Could not fetch employees or departments:', err);
      }
    };
    fetchEmployeesAndDepts();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchQuery.trim() ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

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
                objectFit: 'cover',
                border: '2px solid var(--color-primary-light)'
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
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <Link href={`/employees/${row.id}`}>
          <Button variant="ghost" size="sm" style={{ color: 'var(--color-primary)' }} iconSuffix={<ArrowUpRight size={14} />}>
            Profile
          </Button>
        </Link>
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
              <Badge variant="primary" dot>Personnel Management</Badge>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Phase 4 Directory & Vault</span>
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

        {/* Top 4 KPI Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px'
          }}
        >
          <KpiCard
            title="Total Headcount"
            value="382"
            trend={{ value: '+8 this month', isPositive: true }}
            subtitle="active records"
            icon={<Users size={22} />}
            progressPercentage={95}
          />
          <KpiCard
            title="Active Employees"
            value="368"
            trend={{ value: '96.3% Active', isPositive: true }}
            subtitle="regular full-time"
            icon={<Shield size={22} />}
            progressPercentage={96}
          />
          <KpiCard
            title="On Probation"
            value="14"
            trend={{ value: 'Review Due', isPositive: true }}
            subtitle="under 90 days"
            icon={<FileText size={22} />}
            progressPercentage={25}
          />
          <KpiCard
            title="Remote / Hybrid"
            value="64%"
            trend={{ value: 'Flexible Work', isPositive: true }}
            subtitle="of entire company"
            icon={<Building size={22} />}
            progressPercentage={64}
          />
        </div>

        {/* Filter Toolbar */}
        <Card padding="sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
            <div style={{ width: '280px' }}>
              <Input
                placeholder="Search by name, email, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconPrefix={<Search size={15} />}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                height: '42px',
                padding: '0 12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                color: 'var(--color-text-main)'
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Probation">Probation</option>
              <option value="Notice">Notice Period</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{
                height: '42px',
                padding: '0 12px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--color-border)',
                fontSize: '13px',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                color: 'var(--color-text-main)'
              }}
            >
              <option value="All">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d._id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </Button>
          </div>
        </Card>

        {/* View Content: Table or Grid */}
        {viewMode === 'table' ? (
          <DataTable
            columns={columns}
            data={filteredEmployees}
            searchable={false}
            pageSize={6}
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
                          background: 'var(--gradient-primary)',
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
