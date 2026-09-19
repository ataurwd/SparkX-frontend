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
  Mail
} from 'lucide-react';

interface OrgNode {
  id: string;
  name: string;
  role: string;
  title: string;
  department: string;
  email: string;
  avatarUrl?: string;
  color?: string;
  children?: OrgNode[];
}

const defaultOrgTree: OrgNode = {
  id: 'node-root',
  name: 'Amelia Demane',
  role: 'CEO & Founder',
  title: 'Chief Executive Officer',
  department: 'Executive Leadership',
  email: 'amelia@sparkx.corp',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
  color: '#6C5CE7',
  children: [
    {
      id: 'node-eng',
      name: 'Marcus Sterling',
      role: 'Chief Technology Officer',
      title: 'VP of Engineering',
      department: 'Engineering',
      email: 'marcus@sparkx.corp',
      color: '#6C5CE7',
      children: [
        {
          id: 'node-fe',
          name: 'David Kim',
          role: 'Lead Fullstack Dev',
          title: 'Frontend Squad Lead',
          department: 'Engineering',
          email: 'david@sparkx.corp',
          color: '#6C5CE7'
        },
        {
          id: 'node-be',
          name: 'Alexander Wright',
          role: 'Cloud Architect',
          title: 'Backend Squad Lead',
          department: 'Engineering',
          email: 'alex@sparkx.corp',
          color: '#6C5CE7'
        }
      ]
    },
    {
      id: 'node-prd',
      name: 'Sarah Jenkins',
      role: 'VP of Product',
      title: 'Head of Product & Design',
      department: 'Product',
      email: 'sarah@sparkx.corp',
      color: '#4FD1FF',
      children: [
        {
          id: 'node-ui',
          name: 'Priya Sharma',
          role: 'Staff UI Designer',
          title: 'Design Systems Lead',
          department: 'Product',
          email: 'priya@sparkx.corp',
          color: '#4FD1FF'
        }
      ]
    },
    {
      id: 'node-hr',
      name: 'Elena Rostova',
      role: 'Director of People',
      title: 'Head of Human Resources',
      department: 'HR & People Ops',
      email: 'elena@sparkx.corp',
      color: '#F59E0B',
      children: [
        {
          id: 'node-rec',
          name: 'Jessica Vance',
          role: 'Senior Recruiter',
          title: 'Talent Acquisition Lead',
          department: 'HR & People Ops',
          email: 'jessica@sparkx.corp',
          color: '#F59E0B'
        }
      ]
    },
    {
      id: 'node-fin',
      name: 'Tariq Hassan',
      role: 'VP of Finance',
      title: 'Head of Accounting & Payroll',
      department: 'Finance',
      email: 'tariq@sparkx.corp',
      color: '#0EA5E9',
      children: [
        {
          id: 'node-pay',
          name: 'Carlos Mendez',
          role: 'Senior Accountant',
          title: 'Payroll Specialist',
          department: 'Finance',
          email: 'carlos@sparkx.corp',
          color: '#0EA5E9'
        }
      ]
    }
  ]
};

export default function OrgChartPage() {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [orgTree, setOrgTree] = useState<OrgNode>(defaultOrgTree);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await apiRequest('/org/tree');
        if (res.success && res.data && res.data.children?.length > 0) {
          const liveRoot: OrgNode = {
            id: 'node-root',
            name: res.data.title,
            role: res.data.role,
            title: 'Chief Executive Officer',
            department: 'Executive Leadership',
            email: res.data.email || 'ceo@sparkx.corp',
            avatarUrl: res.data.avatarUrl,
            color: '#6C5CE7',
            children: res.data.children.map((dept: any) => ({
              id: `dept-${dept.id}`,
              name: dept.title,
              role: dept.role,
              title: `Code: ${dept.code || 'GEN'}`,
              department: dept.title,
              email: 'hod@sparkx.corp',
              color: dept.color || '#6C5CE7',
              children: (dept.children || []).map((team: any) => ({
                id: `team-${team.id}`,
                name: team.title,
                role: team.role,
                title: 'Team Lead',
                department: dept.title,
                email: 'lead@sparkx.corp',
                color: dept.color || '#4FD1FF'
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
    const isMatched =
      searchQuery.trim() !== '' &&
      (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.department.toLowerCase().includes(searchQuery.toLowerCase()));

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
        {/* Node Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            boxShadow: isMatched
              ? '0 0 0 3px var(--color-primary), var(--shadow-float)'
              : 'var(--shadow-card)',
            border: `1.5px solid ${isMatched ? 'var(--color-primary)' : 'var(--color-border)'}`,
            minWidth: '220px',
            maxWidth: '250px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
        >
          {/* Top colored accent indicator */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '20px',
              right: '20px',
              height: '3px',
              borderRadius: '0 0 4px 4px',
              backgroundColor: node.color || 'var(--color-primary)'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            {node.avatarUrl ? (
              <img
                src={node.avatarUrl}
                alt={node.name}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-primary-light)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '16px'
                }}
              >
                {node.name.charAt(0)}
              </div>
            )}
          </div>

          <div style={{ fontWeight: 800, fontSize: '14.5px', color: 'var(--color-text-main)' }}>
            {node.name}
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', marginTop: '2px' }}>
            {node.role}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {node.title}
          </div>

          <div
            style={{
              marginTop: '10px',
              paddingTop: '8px',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              fontSize: '10.5px',
              color: 'var(--color-text-secondary)',
              fontWeight: 600
            }}
          >
            <Building size={11} color="var(--color-text-muted)" />
            {node.department}
          </div>
        </div>

        {/* Child branches */}
        {node.children && node.children.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {/* Vertical connector from parent to horizontal line */}
            <div
              style={{
                width: '2px',
                height: '24px',
                backgroundColor: 'var(--color-border)'
              }}
            />

            <div
              style={{
                display: 'flex',
                gap: '24px',
                position: 'relative',
                paddingTop: '16px'
              }}
            >
              {/* Horizontal line across children */}
              {node.children.length > 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '110px',
                    right: '110px',
                    height: '2px',
                    backgroundColor: 'var(--color-border)'
                  }}
                />
              )}

              {node.children.map((child) => (
                <div
                  key={child.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative'
                  }}
                >
                  {/* Vertical connector down to child node */}
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Page Header with Zoom Controls */}
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
              <Badge variant="primary" dot>Visual Hierarchy</Badge>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>C-Suite Overview</span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Interactive Organization Chart
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Real-time structural hierarchy from Senior Authority down to department leads and operational squads.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '220px' }}>
              <Input
                placeholder="Search staff in tree..."
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
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
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

        {/* Tree Container Canvas */}
        <Card padding="lg" style={{ overflowX: 'auto', minHeight: '680px', backgroundColor: '#F8F9FD' }}>
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease',
              display: 'flex',
              justifyContent: 'center',
              padding: '20px 40px',
              minWidth: '1100px'
            }}
          >
            {renderNode(orgTree)}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
