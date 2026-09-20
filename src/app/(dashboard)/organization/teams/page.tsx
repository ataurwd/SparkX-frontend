'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { KpiCard } from '../../../../components/ui/KpiCard';
import { LoadingOverlay } from '../../../../components/ui/LoadingOverlay';
import { apiRequest } from '../../../../lib/api';
import {
  Users,
  Plus,
  Crown,
  UserPlus,
  Trash2,
  Building2,
  Mail,
  Shield,
  Briefcase,
  Search,
  CheckCircle2,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface TeamMember {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  avatarUrl?: string;
  designation: string;
  designationLevel?: string;
  department: string;
  role: string;
  status: string;
  joiningDate?: string;
}

interface TeamLead {
  _id?: string;
  id?: string;
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  designation?: string;
  designationId?: {
    title?: string;
    level?: string;
  };
}

interface TeamItem {
  _id: string;
  id: string;
  name: string;
  description?: string;
  departmentId?: {
    _id: string;
    name: string;
    color?: string;
    code?: string;
  };
  department?: string;
  leadId?: TeamLead;
  lead?: {
    id?: string;
    name: string;
    email: string;
    designation: string;
    avatarUrl?: string;
    employeeCode?: string;
  };
  membersCount: number;
  members: TeamMember[];
}

interface RawEmployee {
  _id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  departmentId?: {
    _id: string;
    name: string;
  };
  designationId?: {
    _id: string;
    title: string;
  };
  teamId?: {
    _id: string;
    name: string;
  } | string;
}

export default function TeamManagementPage() {
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<RawEmployee[]>([]);
  const [deptList, setDeptList] = useState<{ id: string; name: string }[]>([]);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isChangeLeadModalOpen, setIsChangeLeadModalOpen] = useState(false);

  // Form states
  const [teamName, setTeamName] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [teamDescription, setTeamDescription] = useState('');

  const [memberToAssignId, setMemberToAssignId] = useState('');
  const [newLeadId, setNewLeadId] = useState('');
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Notification helper
  const showToast = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // Fetch all initial data from MongoDB Atlas
  const loadData = async () => {
    try {
      setLoading(true);
      const [teamsRes, deptsRes, empsRes] = await Promise.all([
        apiRequest('/org/teams'),
        apiRequest('/org/departments'),
        apiRequest('/employees?limit=100')
      ]);

      if (deptsRes.success && deptsRes.data && deptsRes.data.length > 0) {
        const dList = deptsRes.data.map((d: any) => ({ id: d._id, name: d.name }));
        setDeptList(dList);
        if (!selectedDept) setSelectedDept(dList[0].id);
      }

      if (empsRes.success && empsRes.data) {
        const empArray: RawEmployee[] = empsRes.data;
        setEmployees(empArray);
      }

      if (teamsRes.success && teamsRes.data) {
        const mappedTeams: TeamItem[] = teamsRes.data.map((t: any) => {
          const leadObj = t.leadId;
          const leadDesignation = leadObj?.designationId?.title || leadObj?.role || 'Team Leader';
          const leadName = leadObj
            ? `${leadObj.firstName || ''} ${leadObj.lastName || ''}`.trim()
            : 'Unassigned';

          return {
            _id: t._id,
            id: t._id,
            name: t.name,
            description: t.description,
            departmentId: t.departmentId,
            department: t.departmentId?.name || 'General',
            leadId: t.leadId,
            lead: {
              id: leadObj?._id,
              name: leadName || 'Unassigned Leader',
              email: leadObj?.email || 'unassigned@sparkx.corp',
              designation: leadDesignation,
              avatarUrl: leadObj?.avatarUrl,
              employeeCode: leadObj?.employeeCode || 'LEAD'
            },
            membersCount: t.members?.length || 0,
            members: t.members || []
          };
        });

        setTeams(mappedTeams);
        if (mappedTeams.length > 0 && !selectedTeamId) {
          setSelectedTeamId(mappedTeams[0]._id);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch teams data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeTeam = teams.find((t) => t._id === selectedTeamId) || teams[0];

  // Handler: Create New Team
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !selectedDept) return;

    try {
      const res = await apiRequest('/org/teams', {
        method: 'POST',
        body: JSON.stringify({
          name: teamName.trim(),
          departmentId: selectedDept,
          leadId: selectedLeadId || undefined,
          description: teamDescription.trim() || undefined
        })
      });

      if (res.success) {
        showToast(`Team "${teamName}" created successfully!`);
        setTeamName('');
        setTeamDescription('');
        setSelectedLeadId('');
        setIsCreateModalOpen(false);
        await loadData();
      } else {
        alert(res.error || 'Failed to create team');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating team');
    }
  };

  // Handler: Assign Member to Team
  const handleAssignMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam || !memberToAssignId) return;

    try {
      const res = await apiRequest(`/org/teams/${activeTeam._id}/members`, {
        method: 'POST',
        body: JSON.stringify({ employeeId: memberToAssignId })
      });

      if (res.success) {
        showToast('Member assigned to team successfully!');
        setMemberToAssignId('');
        setIsAssignModalOpen(false);
        await loadData();
      } else {
        alert(res.error || 'Failed to assign member');
      }
    } catch (err: any) {
      alert(err.message || 'Error assigning member');
    }
  };

  // Handler: Remove Member from Team
  const handleRemoveMember = async (employeeId: string, memberName: string) => {
    if (!activeTeam) return;
    if (!confirm(`Are you sure you want to remove ${memberName} from "${activeTeam.name}"?`)) return;

    try {
      const res = await apiRequest(`/org/teams/${activeTeam._id}/members/${employeeId}`, {
        method: 'DELETE'
      });

      if (res.success) {
        showToast(`Removed ${memberName} from team.`);
        await loadData();
      } else {
        alert(res.error || 'Failed to remove member');
      }
    } catch (err: any) {
      alert(err.message || 'Error removing member');
    }
  };

  // Handler: Change Team Leader
  const handleChangeLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam || !newLeadId) return;

    try {
      const res = await apiRequest(`/org/teams/${activeTeam._id}/lead`, {
        method: 'PATCH',
        body: JSON.stringify({ leadId: newLeadId })
      });

      if (res.success) {
        showToast('Team Leader updated successfully!');
        setNewLeadId('');
        setIsChangeLeadModalOpen(false);
        await loadData();
      } else {
        alert(res.error || 'Failed to update team leader');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating team leader');
    }
  };

  // Filter employees available to be assigned to active team
  const availableEmployeesToAssign = employees.filter((emp) => {
    // Exclude if already in this team
    const isAlreadyInTeam = activeTeam?.members.some((m) => m.id === emp._id);
    if (isAlreadyInTeam) return false;

    // Search filter
    if (searchMemberQuery.trim()) {
      const query = searchMemberQuery.toLowerCase();
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const desig = emp.designationId?.title?.toLowerCase() || '';
      return fullName.includes(query) || desig.includes(query) || emp.employeeCode.toLowerCase().includes(query);
    }
    return true;
  });

  // Calculate statistics
  const totalTeams = teams.length;
  const totalLeadsWithAssignment = teams.filter((t) => t.leadId && t.lead?.name !== 'Unassigned').length;
  const totalAssignedMembers = teams.reduce((acc, t) => acc + (t.membersCount || 0), 0);
  const unassignedStaffCount = employees.filter((emp) => !emp.teamId).length;

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Toast Alert */}
        {actionSuccessMessage && (
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: '#ECFDF5',
              border: '1px solid #10B981',
              borderRadius: 'var(--radius-md)',
              color: '#065F46',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontWeight: 600,
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
            }}
          >
            <CheckCircle2 size={18} color="#10B981" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Badge variant="primary" dot>Organization Squads</Badge>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Live MongoDB Hierarchy</span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
              Team Management
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Manage operational teams, appoint Team Leaders, and view all team members and their designations.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              iconPrefix={<Plus size={16} />}
            >
              Create New Team
            </Button>
          </div>
        </div>

        {/* Dynamic Content with Blur Loading State */}
        <LoadingOverlay
          isLoading={loading}
          title="Loading Teams..."
          message="Please wait a moment"
          minHeight="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* KPI Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <KpiCard
            title="Total Teams"
            value={totalTeams.toString()}
            subtitle="Operational Squads"
            icon={<Users size={20} color="var(--color-primary)" />}
          />
          <KpiCard
            title="Designated Team Leads"
            value={totalLeadsWithAssignment.toString()}
            subtitle="Leading Squads"
            icon={<Crown size={20} color="#F59E0B" />}
          />
          <KpiCard
            title="Deployed Squad Members"
            value={totalAssignedMembers.toString()}
            subtitle="Active Staff"
            icon={<UserCheck size={20} color="#10B981" />}
          />
          <KpiCard
            title="Unassigned Staff"
            value={unassignedStaffCount.toString()}
            subtitle="Available to Deploy"
            icon={<Briefcase size={20} color="#6366F1" />}
          />
        </div>

        {/* Main Content Area: Left Squad Selector + Right Roster & Team Leader View */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Left Column: Teams List */}
          <Card padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--color-text-main)' }}>
                Company Teams ({teams.length})
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={14} /> Add
              </Button>
            </div>

            {teams.length === 0 && !loading && (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No operational teams created yet. Click "Create New Team" to begin!
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {teams.map((t) => {
                const isSelected = activeTeam?._id === t._id;
                return (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTeamId(t._id)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.05)' : 'var(--color-surface)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--color-text-main)' }}>
                        {t.name}
                      </span>
                      <Badge variant={isSelected ? 'primary' : 'neutral'} size="sm">
                        {t.membersCount} Members
                      </Badge>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      <Building2 size={13} color="var(--color-text-muted)" />
                      <span>{t.department}</span>
                    </div>

                    {/* Team Leader Mini Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed var(--color-border-subtle)' }}>
                      <Crown size={13} color="#F59E0B" />
                      <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                        Lead: {t.lead?.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Right Column: Selected Team Details (Team Leader + Squad Members Roster) */}
          {activeTeam ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Team Leader Profile Card */}
              <Card padding="lg" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFF 100%)', border: '1.5px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: '#FEF3C7',
                        color: '#B45309',
                        fontSize: '12px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Crown size={15} color="#D97706" />
                      DESIGNATED TEAM LEADER
                    </div>
                    <Badge variant="primary">{activeTeam.department}</Badge>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewLeadId(activeTeam.leadId?._id || '');
                      setIsChangeLeadModalOpen(true);
                    }}
                    iconPrefix={<Crown size={14} />}
                  >
                    Change Team Leader
                  </Button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                  {activeTeam.lead?.avatarUrl ? (
                    <img
                      src={activeTeam.lead.avatarUrl}
                      alt={activeTeam.lead.name}
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid #F59E0B',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '68px',
                        height: '68px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '24px',
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
                      }}
                    >
                      {activeTeam.lead?.name ? activeTeam.lead.name.charAt(0) : 'L'}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                        {activeTeam.lead?.name}
                      </h2>
                      {activeTeam.lead?.employeeCode && (
                        <Badge variant="neutral" size="sm">{activeTeam.lead.employeeCode}</Badge>
                      )}
                    </div>

                    {/* Exact Designation Highlight */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Briefcase size={14} color="var(--color-primary)" />
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {activeTeam.lead?.designation || 'Team Leader'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} color="var(--color-text-muted)" />
                        <span>{activeTeam.lead?.email}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Building2 size={13} color="var(--color-text-muted)" />
                        <span>{activeTeam.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Members Working Under This Team Leader */}
              <Card padding="lg">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                      Team Members Under {activeTeam.lead?.name} ({activeTeam.members.length})
                    </h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      Staff members currently assigned to this squad reporting directly to the Team Leader.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setMemberToAssignId('');
                      setIsAssignModalOpen(true);
                    }}
                    iconPrefix={<UserPlus size={15} />}
                  >
                    Assign Member to Squad
                  </Button>
                </div>

                {activeTeam.members.length === 0 ? (
                  <div
                    style={{
                      padding: '40px 20px',
                      textAlign: 'center',
                      backgroundColor: 'var(--color-surface-subtle)',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px dashed var(--color-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <Users size={32} color="var(--color-text-muted)" />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-main)' }}>
                        No members assigned yet
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Add employees to this squad to see them listed under Team Leader {activeTeam.lead?.name}.
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAssignModalOpen(true)}
                      iconPrefix={<UserPlus size={14} />}
                    >
                      Add First Member
                    </Button>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border)', backgroundColor: 'var(--color-surface-subtle)' }}>
                          <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                            MEMBER NAME & CODE
                          </th>
                          <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                            JOB DESIGNATION (পদবী)
                          </th>
                          <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                            DEPARTMENT
                          </th>
                          <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                            STATUS
                          </th>
                          <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                            ACTION
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeTeam.members.map((member) => (
                          <tr
                            key={member.id}
                            style={{
                              borderBottom: '1px solid var(--color-border)',
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            {/* Member Name, Avatar & Email */}
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {member.avatarUrl ? (
                                  <img
                                    src={member.avatarUrl}
                                    alt={member.name}
                                    style={{
                                      width: '38px',
                                      height: '38px',
                                      borderRadius: '50%',
                                      objectFit: 'cover',
                                      border: '1.5px solid var(--color-border)'
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: '38px',
                                      height: '38px',
                                      borderRadius: '50%',
                                      backgroundColor: 'var(--color-primary-light)',
                                      color: 'var(--color-primary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 800,
                                      fontSize: '14px'
                                    }}
                                  >
                                    {member.name.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-text-main)' }}>
                                    {member.name}
                                  </div>
                                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                                    {member.employeeCode} &bull; {member.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Job Designation */}
                            <td style={{ padding: '14px 16px' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(108, 92, 231, 0.08)', padding: '4px 10px', borderRadius: '6px' }}>
                                <Briefcase size={12} color="var(--color-primary)" />
                                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
                                  {member.designation}
                                </span>
                              </div>
                            </td>

                            {/* Department */}
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                                {member.department}
                              </span>
                            </td>

                            {/* Status */}
                            <td style={{ padding: '14px 16px' }}>
                              <Badge variant={member.status === 'active' ? 'success' : 'neutral'} size="sm">
                                {member.status.toUpperCase()}
                              </Badge>
                            </td>

                            {/* Remove action */}
                            <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveMember(member.id, member.name)}
                                style={{ color: '#EF4444' }}
                                title="Remove from Team"
                              >
                                <Trash2 size={15} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card padding="lg" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Users size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No Team Selected</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Please select a team from the list on the left or create a new team.
              </p>
            </Card>
          )}
        </div>
          </div>
        </LoadingOverlay>

        {/* MODAL 1: Create Team */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Operational Team"
          subtitle="Form a new cross-functional team with a Team Leader"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreateTeam}>Save Team</Button>
            </>
          }
        >
          <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Team Name"
              placeholder="e.g. Core Backend Platform"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Department (Live from MongoDB Atlas)
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
                  backgroundColor: 'var(--color-surface)',
                  fontSize: '14px',
                  color: 'var(--color-text-main)'
                }}
                required
              >
                {deptList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Appoint Team Leader (Select from Live Staff)
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  padding: '0 14px',
                  backgroundColor: 'var(--color-surface)',
                  fontSize: '14px',
                  color: 'var(--color-text-main)'
                }}
              >
                <option value="">-- Choose Team Leader (Optional) --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} &mdash; {emp.designationId?.title || emp.role || 'Staff'} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Description (Optional)"
              placeholder="e.g. Focused on distributed microservices and database clustering"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
            />
          </form>
        </Modal>

        {/* MODAL 2: Assign Member to Team */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title={`Assign Member to ${activeTeam?.name}`}
          subtitle={`The selected employee will report to Team Leader ${activeTeam?.lead?.name}`}
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAssignMember} disabled={!memberToAssignId}>
                Assign to Squad
              </Button>
            </>
          }
        >
          <form onSubmit={handleAssignMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              placeholder="Filter by name, designation or code..."
              value={searchMemberQuery}
              onChange={(e) => setSearchMemberQuery(e.target.value)}
              iconPrefix={<Search size={15} />}
            />

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Select Employee to Deploy
              </label>
              <select
                value={memberToAssignId}
                onChange={(e) => setMemberToAssignId(e.target.value)}
                size={6}
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  padding: '8px',
                  backgroundColor: 'var(--color-surface)',
                  fontSize: '13.5px',
                  color: 'var(--color-text-main)'
                }}
                required
              >
                {availableEmployeesToAssign.length === 0 ? (
                  <option disabled>No unassigned employees found matching query</option>
                ) : (
                  availableEmployeesToAssign.map((emp) => (
                    <option key={emp._id} value={emp._id} style={{ padding: '8px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                      {emp.firstName} {emp.lastName} &mdash; {emp.designationId?.title || emp.role || 'Specialist'} ({emp.departmentId?.name || 'No Dept'})
                    </option>
                  ))
                )}
              </select>
            </div>
          </form>
        </Modal>

        {/* MODAL 3: Change Team Leader */}
        <Modal
          isOpen={isChangeLeadModalOpen}
          onClose={() => setIsChangeLeadModalOpen(false)}
          title={`Change Team Leader for ${activeTeam?.name}`}
          subtitle="Select a new Team Leader to lead this squad"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsChangeLeadModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleChangeLead} disabled={!newLeadId}>
                Update Team Leader
              </Button>
            </>
          }
        >
          <form onSubmit={handleChangeLead} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Select New Team Leader
              </label>
              <select
                value={newLeadId}
                onChange={(e) => setNewLeadId(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  padding: '0 14px',
                  backgroundColor: 'var(--color-surface)',
                  fontSize: '14px',
                  color: 'var(--color-text-main)'
                }}
                required
              >
                <option value="">-- Choose New Leader --</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} &mdash; {emp.designationId?.title || emp.role || 'Staff'} ({emp.employeeCode})
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
