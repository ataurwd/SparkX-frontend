'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { KpiCard } from '../../components/ui/KpiCard';
import { DataTable, Column } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { SparkXLogo } from '../../components/ui/SparkXLogo';
import {
  Users,
  Briefcase,
  UserCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  CheckCircle2,
  Calendar,
  DollarSign
} from 'lucide-react';

interface SampleEmployee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'Active' | 'Probation' | 'On Leave';
  salary: string;
}

export default function DesignSystemPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [inputText, setInputText] = useState('');

  const sampleEmployees: SampleEmployee[] = [
    { id: 'EMP-001', name: 'Amelia Demane', email: 'amelia@sparkx.corp', role: 'VP Operations', department: 'Executive', status: 'Active', salary: '$12,500' },
    { id: 'EMP-002', name: 'Marcus Sterling', email: 'marcus@sparkx.corp', role: 'Lead Architect', department: 'Engineering', status: 'Active', salary: '$11,200' },
    { id: 'EMP-003', name: 'Sarah Jenkins', email: 'sarah@sparkx.corp', role: 'Product Designer', department: 'Design', status: 'On Leave', salary: '$8,900' },
    { id: 'EMP-004', name: 'David Kim', email: 'david@sparkx.corp', role: 'Senior Fullstack Dev', department: 'Engineering', status: 'Active', salary: '$9,800' },
    { id: 'EMP-005', name: 'Elena Rostova', email: 'elena@sparkx.corp', role: 'HR Specialist', department: 'Human Resources', status: 'Probation', salary: '$6,400' },
    { id: 'EMP-006', name: 'Tariq Hassan', email: 'tariq@sparkx.corp', role: 'Financial Analyst', department: 'Finance', status: 'Active', salary: '$8,200' }
  ];

  const columns: Column<SampleEmployee>[] = [
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px'
            }}
          >
            {row.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{row.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{row.email}</div>
          </div>
        </div>
      )
    },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'role', header: 'Role' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variant =
          row.status === 'Active' ? 'success' : row.status === 'On Leave' ? 'warning' : 'primary';
        return <Badge variant={variant} dot>{row.status}</Badge>;
      }
    },
    { key: 'salary', header: 'Monthly Net' },
    {
      key: 'actions',
      header: 'Action',
      render: () => (
        <Button variant="ghost" size="sm" style={{ color: 'var(--color-primary)' }}>
          Manage
        </Button>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Page Header */}
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
            <Badge variant="primary" dot style={{ marginBottom: '8px' }}>
              Phase 1 Milestone
            </Badge>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                letterSpacing: '-0.02em'
              }}
            >
              SparkX Enterprise Design System
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Design tokens, UI primitives, and guidelines inspired by the official SparkX brand guidelines.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
            >
              Test Modal Dialog
            </Button>
            <Button
              variant="primary"
              iconSuffix={<ArrowRight size={16} />}
            >
              Explore Components
            </Button>
          </div>
        </div>

        {/* Brand Palette Grid */}
        <Card title="SparkX Brand Palette" subtitle="Design tokens derived from official brand specification">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px'
            }}
          >
            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <div style={{ height: '70px', backgroundColor: '#6C5CE7' }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Primary Indigo</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>#6C5CE7</div>
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <div style={{ height: '70px', backgroundColor: '#4FD1FF' }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Secondary Cyan</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>#4FD1FF</div>
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <div style={{ height: '70px', backgroundColor: '#E9E7FF' }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Lavender Canvas</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>#E9E7FF</div>
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <div style={{ height: '70px', backgroundColor: '#1B1B3A' }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Text Dark</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>#1B1B3A</div>
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <div style={{ height: '70px', backgroundColor: '#F5F7FF' }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Surface Soft</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>#F5F7FF</div>
              </div>
            </div>

            <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <div style={{ height: '70px', background: 'linear-gradient(135deg, #6C5CE7 0%, #4FD1FF 100%)' }} />
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>Brand Gradient</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Indigo → Cyan</div>
              </div>
            </div>
          </div>
        </Card>

        {/* KPI Metrics Demonstration */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '14px' }}>
            Enterprise KPI Cards
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px'
            }}
          >
            <KpiCard
              title="Total Employees"
              value="5,625"
              trend={{ value: '+12.4%', isPositive: true }}
              subtitle="vs last month"
              icon={<Users size={22} />}
              progressPercentage={85}
            />
            <KpiCard
              title="Open Positions"
              value="56"
              trend={{ value: '+3 New', isPositive: true }}
              subtitle="across 8 depts"
              icon={<Briefcase size={22} />}
              progressPercentage={45}
            />
            <KpiCard
              title="Onboarding Active"
              value="66"
              trend={{ value: '92% On Track', isPositive: true }}
              subtitle="checklists active"
              icon={<UserCheck size={22} />}
              progressPercentage={92}
            />
            <KpiCard
              title="Attendance Rate"
              value="96.15%"
              trend={{ value: '+1.2%', isPositive: true }}
              subtitle="this pay cycle"
              icon={<Clock size={22} />}
              progressPercentage={96}
            />
          </div>
        </div>

        {/* Buttons & Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          <Card title="Button Variants" subtitle="Gradient, solid, outline, and states">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <Button variant="primary">Primary Gradient</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="primary" isLoading>Loading</Button>
            </div>
          </Card>

          <Card title="Status Badges" subtitle="Pill badges with semantic colors and dot indicators">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <Badge variant="success" dot>Active</Badge>
              <Badge variant="warning" dot>Pending Review</Badge>
              <Badge variant="danger" dot>Blocked</Badge>
              <Badge variant="info" dot>In Progress</Badge>
              <Badge variant="primary" dot>SparkX VIP</Badge>
              <Badge variant="neutral">Draft</Badge>
            </div>
          </Card>
        </div>

        {/* ImgBB Upload & Form Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          <Card
            title="ImgBB Image Upload Integration"
            subtitle="Centralized image uploader for avatars, documents, and logos"
          >
            <ImageUpload
              label="Company Logo or Employee Avatar"
              value={uploadedImageUrl}
              onChange={setUploadedImageUrl}
              aspectRatio="square"
              helperText="Uploads to ImgBB API with automatic cloud hosting"
            />
          </Card>

          <Card title="Form Inputs" subtitle="Clean inputs with icons and states">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Full Name"
                placeholder="e.g. Amelia Demane"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                required
              />
              <Input
                label="Corporate Email"
                placeholder="amelia@company.com"
                type="email"
                helperText="Must match your verified company workspace domain"
              />
            </div>
          </Card>
        </div>

        {/* Data Table */}
        <DataTable
          title="Recent Applications & Employee Directory"
          subtitle="Enterprise data table with live search, sorting, and pagination"
          columns={columns}
          data={sampleEmployees}
          pageSize={4}
        />

        {/* Modal Dialog */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="SparkX Modal Demonstration"
          subtitle="Glassmorphic dialog with smooth blur backdrop"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                Confirm Action
              </Button>
            </>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              This dialog demonstrates the standardized SparkX modal component. It supports customizable headers,
              subtitles, scrolling body content, and action button footers.
            </p>
            <div
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-light)',
                border: '1px solid rgba(108, 92, 231, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <Sparkles size={20} color="var(--color-primary)" />
              <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600 }}>
                Phase 1 is now operational with Next.js, Node.js, and ImgBB!
              </span>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
