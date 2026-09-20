'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { apiRequest } from '../../../../lib/api';
import {
  Network,
  Users,
  Search,
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Building,
  Mail,
  Crown,
  Briefcase,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

interface OrgNode {
  id: string;
  name: string;
  role: string;
  title: string;
  designation?: string;
  department: string;
  email: string;
  avatarUrl?: string;
  color?: string;
  type?: 'root' | 'department' | 'team' | 'member';
  employeeCode?: string;
  leadName?: string;
  leadDesignation?: string;
  membersCount?: number;
  children?: OrgNode[];
}

const defaultOrgTree: OrgNode = {
  id: 'node-root',
  name: 'Amelia Demane',
  role: 'CEO & Founder',
  title: 'Chief Executive Officer',
  designation: 'Chief Executive Officer',
  department: 'Executive Leadership',
  email: 'amelia@sparkx.corp',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
  color: '#6C5CE7',
  type: 'root',
  children: [
    {
      id: 'node-dept-backend',
      name: 'Backend Department',
      role: 'HOD: David Kim',
      title: 'Head of Department',
      designation: 'Department Head',
      department: 'Backend Department',
      email: 'backend@sparkx.corp',
      color: '#6C5CE7',
      type: 'department',
      children: [
        {
          id: 'team-backend-core',
          name: 'Core Platform Squad',
          role: 'Team Lead: Ataur Rahman Asif',
          title: 'Core Backend Platform',
          leadName: 'Ataur Rahman Asif',
          leadDesignation: 'Team Lead (Staff Backend Specialist)',
          designation: 'Team Lead (Staff Backend Specialist)',
          department: 'Backend Department',
          email: 'asif@sparkx.corp',
          color: '#6C5CE7',
          type: 'team',
          membersCount: 2,
          children: [
            {
              id: 'mem-101',
              name: 'Marcus Vance',
              title: 'Marcus Vance',
              role: 'Team Member',
              designation: 'Frontend Tech Lead',
              department: 'Backend Department',
              employeeCode: 'SPX-0101',
              email: 'marcus@sparkx.corp',
              type: 'member',
              color: '#6C5CE7'
            },
            {
              id: 'mem-103',
              name: 'Alex Rivera',
              title: 'Alex Rivera',
              role: 'Team Member',
              designation: 'Staff Backend Architect',
              department: 'Backend Department',
              employeeCode: 'SPX-0103',
              email: 'alex@sparkx.corp',
              type: 'member',
              color: '#6C5CE7'
            }
          ]
        }
      ]
    },
    {
      id: 'node-dept-design',
      name: 'Product Design & UX',
      role: 'HOD: Sarah Jenkins',
      title: 'Head of Department',
      designation: 'Department Head',
      department: 'Product Design & UX',
      email: 'design@sparkx.corp',
      color: '#00B894',
      type: 'department',
      children: [
        {
          id: 'team-design-core',
          name: 'UI/UX Experience Squad',
          role: 'Team Lead: Sophia Chen',
          title: 'Design Systems & UX',
          leadName: 'Sophia Chen',
          leadDesignation: 'Senior Product Designer',
          designation: 'Senior Product Designer',
          department: 'Product Design & UX',
          email: 'sophia@sparkx.corp',
          color: '#00B894',
          type: 'team',
          membersCount: 1,
          children: [
            {
              id: 'mem-104',
              name: 'Elena Rostova',
              title: 'Elena Rostova',
              role: 'Team Member',
              designation: 'People Ops Lead',
              department: 'Product Design & UX',
              employeeCode: 'SPX-0104',
              email: 'elena@sparkx.corp',
              type: 'member',
              color: '#00B894'
            }
          ]
        }
      ]
    }
  ]
};

export default function OrgChartPage() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [orgTree, setOrgTree] = useState<OrgNode>(defaultOrgTree);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await apiRequest('/org/tree');
        if (res.success && res.data) {
          const apiData = res.data;
          const liveRoot: OrgNode = {
            id: 'node-root',
            name: apiData.title || 'Executive Leadership',
            role: apiData.role || 'CEO / Board',
            title: 'Chief Executive Officer',
            designation: 'Chief Executive Officer',
            department: 'Executive Leadership',
            email: apiData.email || 'ceo@sparkx.corp',
            avatarUrl: apiData.avatarUrl,
            color: '#6C5CE7',
            type: 'root',
            children: (apiData.children || []).map((dept: any) => ({
              id: `dept-${dept.id}`,
              name: dept.title,
              role: dept.role || 'Head of Department',
              title: `Code: ${dept.code || 'GEN'}`,
              designation: dept.role || 'Head of Department',
              department: dept.title,
              email: 'hod@sparkx.corp',
              color: dept.color || '#6C5CE7',
              type: 'department',
              children: (dept.children || []).map((team: any) => ({
                id: `team-${team.id}`,
                name: team.title,
                role: team.role || 'Team Lead',
                title: team.title,
                leadName: team.leadName || 'Team Lead',
                leadDesignation: team.designation || 'Team Leader',
                designation: team.designation || 'Team Leader',
                department: dept.title,
                email: team.leadEmail || 'lead@sparkx.corp',
                avatarUrl: team.leadAvatar,
                color: dept.color || '#6C5CE7',
                type: 'team',
                membersCount: team.membersCount || (team.children ? team.children.length : 0),
                children: (team.children || []).map((member: any) => ({
                  id: `member-${member.id}`,
                  name: member.name,
                  title: member.title,
                  role: member.role || 'Team Member',
                  designation: member.designation || 'Staff Specialist',
                  employeeCode: member.employeeCode || '',
                  department: dept.title,
                  email: member.email,
                  avatarUrl: member.avatarUrl,
                  color: dept.color || '#6C5CE7',
                  type: 'member'
                }))
              }))
            }))
          };
          setOrgTree(liveRoot);
        }
      } catch (err) {
        console.warn('Could not fetch live org tree:', err);
      }
    };
    fetchTree();
  }, []);

  const renderNode = (node: OrgNode) => {
    const isCollapsed = !!collapsedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;

    const isMatched =
      searchQuery.trim() !== '' &&
      (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (node.designation && node.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (node.role && node.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (node.department && node.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (node.employeeCode && node.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())));

    // Styling variants depending on hierarchy level
    const isRoot = node.type === 'root';
    const isDept = node.type === 'department';
    const isTeam = node.type === 'team';
    const isMember = node.type === 'member';

    return (
      <div
        key={node.id}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        {/* Node Card Box */}
        <div
          style={{
            backgroundColor: isMember ? '#FDFDFF' : '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: isMember ? '12px 16px' : '16px 20px',
            boxShadow: isMatched
              ? '0 0 0 3px var(--color-primary), 0 8px 24px rgba(108, 92, 231, 0.25)'
              : isTeam
              ? '0 6px 18px rgba(0, 0, 0, 0.06)'
              : 'var(--shadow-card)',
            border: isMatched
              ? '2px solid var(--color-primary)'
              : isTeam
              ? '2px solid #E2E8F0'
              : '1.5px solid var(--color-border)',
            minWidth: isMember ? '200px' : isTeam ? '240px' : '230px',
            maxWidth: isMember ? '230px' : '270px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
            transition: 'all 0.2s ease'
          }}
        >
          {/* Top accent line */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '16px',
              right: '16px',
              height: isRoot ? '4px' : '3px',
              borderRadius: '0 0 4px 4px',
              backgroundColor: node.color || 'var(--color-primary)'
            }}
          />

          {/* Level Type Badge */}
          <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
            {isRoot && (
              <span style={{ fontSize: '10.5px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#EDE9FE', color: '#6D28D9' }}>
                EXECUTIVE LEADERSHIP
              </span>
            )}
            {isDept && (
              <span style={{ fontSize: '10.5px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#E0F2FE', color: '#0369A1' }}>
                DEPARTMENT
              </span>
            )}
            {isTeam && (
              <span style={{ fontSize: '10.5px', fontWeight: 800, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Crown size={11} color="#D97706" /> TEAM LEADER & SQUAD
              </span>
            )}
            {isMember && (
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '10px', backgroundColor: '#F1F5F9', color: '#475569' }}>
                SQUAD MEMBER {node.employeeCode ? `(${node.employeeCode})` : ''}
              </span>
            )}
          </div>

          {/* Avatar or Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            {node.avatarUrl ? (
              <img
                src={node.avatarUrl}
                alt={node.name}
                style={{
                  width: isMember ? '38px' : '48px',
                  height: isMember ? '38px' : '48px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: isTeam ? '2.5px solid #F59E0B' : '2px solid var(--color-primary-light)'
                }}
              />
            ) : (
              <div
                style={{
                  width: isMember ? '38px' : '48px',
                  height: isMember ? '38px' : '48px',
                  borderRadius: '50%',
                  background: isTeam
                    ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                    : isDept
                    ? 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)'
                    : 'var(--gradient-primary)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: isMember ? '13px' : '16px'
                }}
              >
                {node.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Primary Name / Title */}
          <div style={{ fontWeight: 800, fontSize: isMember ? '13.5px' : '15px', color: 'var(--color-text-main)' }}>
            {isTeam && node.leadName ? node.leadName : node.name}
          </div>

          {/* SQUAD TEAM NAME (if Team level) */}
          {isTeam && (
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Squad: {node.name}
            </div>
          )}

          {/* JOB DESIGNATION BADGE (kaj designation ki) - Core Highlight */}
          <div style={{ marginTop: '6px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: isTeam ? 'rgba(245, 158, 11, 0.12)' : 'rgba(108, 92, 231, 0.09)',
                color: isTeam ? '#B45309' : 'var(--color-primary)',
                fontSize: '11.5px',
                fontWeight: 700
              }}
            >
              <Briefcase size={11} />
              <span>{node.designation || node.role || 'Staff Member'}</span>
            </div>
          </div>

          {/* Subtitle / Department Info */}
          <div
            style={{
              marginTop: '8px',
              paddingTop: '6px',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '10.5px',
              color: 'var(--color-text-secondary)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Building size={11} color="var(--color-text-muted)" />
              <span style={{ fontWeight: 600 }}>{node.department}</span>
            </div>

            {isTeam && (
              <span style={{ fontWeight: 700, color: '#D97706' }}>
                {node.membersCount || 0} under lead
              </span>
            )}
          </div>

          {/* Expand / Collapse Button if has children */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCollapse(node.id);
              }}
              style={{
                position: 'absolute',
                bottom: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                border: '1.5px solid var(--color-border)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 4,
                color: 'var(--color-text-main)',
                transition: 'all 0.15s ease'
              }}
              title={isCollapsed ? 'Expand Squad Members' : 'Collapse'}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {/* Child branches under this node */}
        {hasChildren && !isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {/* Vertical connector from parent to horizontal line */}
            <div
              style={{
                width: '2px',
                height: '28px',
                backgroundColor: 'var(--color-border)'
              }}
            />

            <div
              style={{
                display: 'flex',
                gap: isTeam ? '16px' : '28px',
                position: 'relative',
                paddingTop: '16px'
              }}
            >
              {/* Horizontal line across children */}
              {node.children!.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: isTeam ? '100px' : '115px',
                    right: isTeam ? '100px' : '115px',
                    height: '2px',
                    backgroundColor: 'var(--color-border)'
                  }}
                />
              )}

              {node.children!.map((child) => (
                <div
                  key={child.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  {/* Vertical connector down to child */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '-16px',
                      width: '2px',
                      height: '16px',
                      backgroundColor: 'var(--color-border)'
                    }}
                  />
                  {renderNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header with Search & Controls */}
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
              <Badge variant="primary" dot>Full Hierarchy</Badge>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                CEO &rarr; Department &rarr; Team Leader &rarr; Squad Members
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
              Interactive Organization Chart
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Shows company leadership, each Team Leader, and every squad member with their exact designation.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '260px' }}>
              <Input
                placeholder="Search staff, designation or squad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                iconPrefix={<Search size={15} />}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '2px'
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.1))}
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </Button>
              <span style={{ fontSize: '12px', fontWeight: 700, padding: '0 8px' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', padding: '10px 16px', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: '12.5px' }}>
          <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>Chart Legend:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#6D28D9' }} />
            <span>Executive / CEO</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#0284C7' }} />
            <span>Department (HOD)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Crown size={14} color="#D97706" />
            <span style={{ fontWeight: 600 }}>Team Leader (Squad Lead)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Briefcase size={14} color="var(--color-primary)" />
            <span style={{ fontWeight: 600 }}>Member & Job Designation (পদবী)</span>
          </div>
        </div>

        {/* Canvas Tree Container */}
        <Card padding="lg" style={{ overflowX: 'auto', minHeight: '680px', backgroundColor: '#F8F9FD' }}>
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              display: 'flex',
              justifyContent: 'center',
              padding: '24px 40px',
              minWidth: '1200px'
            }}
          >
            {renderNode(orgTree)}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
