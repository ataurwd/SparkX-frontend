'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { apiRequest } from '../../../../lib/api';
import { Plus, Award, Briefcase } from 'lucide-react';

interface DesignationItem {
  id: string;
  title: string;
  department: string;
  level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  employeeCount: number;
}

export default function DesignationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering & Technology');
  const [level, setLevel] = useState<'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive'>('Mid');
  const [deptList, setDeptList] = useState<{ id: string; name: string }[]>([]);

  const [designations, setDesignations] = useState<DesignationItem[]>([
    { id: 'des-1', title: 'VP of Engineering', department: 'Engineering & Technology', level: 'Executive', employeeCount: 1 },
    { id: 'des-2', title: 'Senior Software Engineer', department: 'Engineering & Technology', level: 'Senior', employeeCount: 42 },
    { id: 'des-3', title: 'Fullstack Developer', department: 'Engineering & Technology', level: 'Mid', employeeCount: 68 },
    { id: 'des-4', title: 'Junior Frontend Dev', department: 'Engineering & Technology', level: 'Junior', employeeCount: 24 },
    { id: 'des-5', title: 'Lead Product Designer', department: 'Product & Design', level: 'Lead', employeeCount: 3 },
    { id: 'des-6', title: 'Talent Acquisition Partner', department: 'Human Resources', level: 'Mid', employeeCount: 5 },
    { id: 'des-7', title: 'Payroll Manager', department: 'Finance & Accounting', level: 'Senior', employeeCount: 2 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [desigRes, deptsRes] = await Promise.all([
          apiRequest('/org/designations'),
          apiRequest('/org/departments')
        ]);
        if (deptsRes.success && deptsRes.data && deptsRes.data.length > 0) {
          setDeptList(deptsRes.data.map((d: any) => ({ id: d._id, name: d.name })));
          setDepartment(deptsRes.data[0]._id);
        }
        if (desigRes.success && desigRes.data && desigRes.data.length > 0) {
          const mapped: DesignationItem[] = desigRes.data.map((d: any) => ({
            id: d._id,
            title: d.title,
            department: d.departmentId?.name || 'General',
            level: (d.level?.includes('Executive') ? 'Executive' : d.level?.includes('Lead') ? 'Lead' : d.level?.includes('Senior') ? 'Senior' : 'Mid') as any,
            employeeCount: d.employeeCount || 1
          }));
          setDesignations(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch designations:', err);
      }
    };
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedDept = deptList.find(d => d.id === department);
    const newDesig: DesignationItem = {
      id: `des-${Date.now()}`,
      title: title.trim(),
      department: matchedDept?.name || 'General',
      level,
      employeeCount: 0
    };

    try {
      const res = await apiRequest('/org/designations', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          departmentId: department,
          level
        })
      });
      if (res.success && res.data) {
        newDesig.id = res.data._id;
      }
    } catch (err) {
      console.warn('Created designation offline:', err);
    }

    setDesignations([newDesig, ...designations]);
    setTitle('');
    setIsModalOpen(false);
  };

  const columns: Column<DesignationItem>[] = [
    {
      key: 'title',
      header: 'Job Title / Designation',
      sortable: true,
      render: (row) => (
        <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{row.title}</div>
      )
    },
    { key: 'department', header: 'Department', sortable: true },
    {
      key: 'level',
      header: 'Seniority Level',
      render: (row) => {
        const variantMap = {
          'Executive': 'primary',
          'Lead': 'info',
          'Senior': 'success',
          'Mid': 'warning',
          'Junior': 'neutral'
        } as const;
        return <Badge variant={variantMap[row.level]} dot>{row.level}</Badge>;
      }
    },
    {
      key: 'employeeCount',
      header: 'Assigned Staff',
      render: (row) => (
        <span style={{ fontWeight: 600 }}>{row.employeeCount} Employees</span>
      )
    },
    {
      key: 'actions',
      header: 'Action',
      render: () => (
        <Button variant="ghost" size="sm" style={{ color: 'var(--color-primary)' }}>
          Edit
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <Badge variant="primary" dot style={{ marginBottom: '6px' }}>Job Taxonomy</Badge>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Designations & Roles
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Standardize job titles, seniority bands, and organizational designations.
            </p>
          </div>

          <Button variant="primary" onClick={() => setIsModalOpen(true)} iconPrefix={<Plus size={16} />}>
            Add Designation
          </Button>
        </div>

        <DataTable
          title="Company Job Designations"
          subtitle="Taxonomy of corporate positions and career bands"
          columns={columns}
          data={designations}
          pageSize={6}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Job Designation"
          subtitle="Add a corporate title to your organization's hierarchy"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreate}>Save Title</Button>
            </>
          }
        >
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Position Title"
              placeholder="e.g. Solutions Architect"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  padding: '0 14px',
                  backgroundColor: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="Engineering & Technology">Engineering & Technology</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Sales & Revenue">Sales & Revenue</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance & Accounting">Finance & Accounting</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Seniority Level Band
              </label>
              <select
                value={level}
                onChange={(e: any) => setLevel(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  padding: '0 14px',
                  backgroundColor: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
