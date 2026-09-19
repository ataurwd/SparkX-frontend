'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { apiRequest } from '../../../../lib/api';
import { Users, Plus, FolderKanban, Shield } from 'lucide-react';

interface TeamItem {
  id: string;
  name: string;
  department: string;
  lead: {
    name: string;
    email: string;
  };
  membersCount: number;
  activeProjects: number;
}

export default function TeamsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [selectedDept, setSelectedDept] = useState('Engineering & Technology');
  const [deptList, setDeptList] = useState<{ id: string; name: string }[]>([]);

  const [teams, setTeams] = useState<TeamItem[]>([
    { id: 't-1', name: 'Core Frontend Platform', department: 'Engineering & Technology', lead: { name: 'David Kim', email: 'david@sparkx.corp' }, membersCount: 12, activeProjects: 3 },
    { id: 't-2', name: 'Backend & Cloud Infra', department: 'Engineering & Technology', lead: { name: 'Alexander Wright', email: 'alex@sparkx.corp' }, membersCount: 14, activeProjects: 4 },
    { id: 't-3', name: 'UI/UX Product Design', department: 'Product & Design', lead: { name: 'Priya Sharma', email: 'priya@sparkx.corp' }, membersCount: 8, activeProjects: 2 },
    { id: 't-4', name: 'Talent Acquisition & People', department: 'Human Resources', lead: { name: 'Elena Rostova', email: 'elena@sparkx.corp' }, membersCount: 6, activeProjects: 1 },
    { id: 't-5', name: 'Growth & Enterprise Sales', department: 'Sales & Revenue', lead: { name: 'Carlos Mendez', email: 'carlos@sparkx.corp' }, membersCount: 15, activeProjects: 2 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, deptsRes] = await Promise.all([
          apiRequest('/org/teams'),
          apiRequest('/org/departments')
        ]);
        if (deptsRes.success && deptsRes.data && deptsRes.data.length > 0) {
          setDeptList(deptsRes.data.map((d: any) => ({ id: d._id, name: d.name })));
          setSelectedDept(deptsRes.data[0]._id);
        }
        if (teamsRes.success && teamsRes.data && teamsRes.data.length > 0) {
          const mapped: TeamItem[] = teamsRes.data.map((t: any) => ({
            id: t._id,
            name: t.name,
            department: t.departmentId?.name || 'General',
            lead: t.leadId
              ? { name: `${t.leadId.firstName} ${t.leadId.lastName}`, email: t.leadId.email }
              : { name: 'Unassigned', email: 'lead@sparkx.corp' },
            membersCount: t.membersCount || 1,
            activeProjects: 2
          }));
          setTeams(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch teams:', err);
      }
    };
    fetchData();
  }, []);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    const matchedDept = deptList.find(d => d.id === selectedDept);
    const newTeam: TeamItem = {
      id: `t-${Date.now()}`,
      name: teamName.trim(),
      department: matchedDept?.name || 'Engineering',
      lead: { name: 'Unassigned', email: 'lead@sparkx.corp' },
      membersCount: 1,
      activeProjects: 0
    };

    try {
      const res = await apiRequest('/org/teams', {
        method: 'POST',
        body: JSON.stringify({
          name: teamName.trim(),
          departmentId: selectedDept
        })
      });
      if (res.success && res.data) {
        newTeam.id = res.data._id;
      }
    } catch (err) {
      console.warn('Created team offline:', err);
    }

    setTeams([newTeam, ...teams]);
    setTeamName('');
    setIsModalOpen(false);
  };

  const columns: Column<TeamItem>[] = [
    {
      key: 'name',
      header: 'Team Name',
      sortable: true,
      render: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{row.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{row.department}</div>
        </div>
      )
    },
    {
      key: 'lead',
      header: 'Team Lead',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11px'
            }}
          >
            {row.lead.name.charAt(0)}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600 }}>{row.lead.name}</span>
        </div>
      )
    },
    {
      key: 'membersCount',
      header: 'Staff Count',
      render: (row) => <Badge variant="neutral">{row.membersCount} Members</Badge>
    },
    {
      key: 'activeProjects',
      header: 'Assigned Projects',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
          {row.activeProjects} Active
        </span>
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
            <Badge variant="info" dot style={{ marginBottom: '6px' }}>Team Squads</Badge>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Operational Teams
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Functional squads executing projects and daily sprints under designated Team Leads.
            </p>
          </div>

          <Button variant="primary" onClick={() => setIsModalOpen(true)} iconPrefix={<Plus size={16} />}>
            Add New Team
          </Button>
        </div>

        <DataTable
          title="All Operational Teams"
          subtitle="Squads across all company divisions"
          columns={columns}
          data={teams}
          pageSize={5}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Operational Team"
          subtitle="Form a new cross-functional team within a department"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateTeam}>Save Team</Button>
            </>
          }
        >
          <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Team Name"
              placeholder="e.g. Mobile iOS Core"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Parent Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
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
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
