'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  Lock,
  Download,
  AlertTriangle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { DataTable, Column } from '@/components/ui/DataTable';

interface AuditLogEntry {
  id: string;
  actor: string;
  actorEmail: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  timestamp: string;
}

export default function AuditLogsPage() {
  const [logs] = useState<AuditLogEntry[]>([
    {
      id: 'LOG-8841',
      actor: 'Marcus Sterling',
      actorEmail: 'marcus@sparkx.corp',
      action: 'UPDATE_ROLE_PERMISSIONS',
      resource: 'Role: HR Manager',
      ipAddress: '192.168.1.104',
      status: 'SUCCESS',
      timestamp: 'Today, 11:24 AM'
    },
    {
      id: 'LOG-8840',
      actor: 'Elena Rostova',
      actorEmail: 'elena@sparkx.corp',
      action: 'PROCESS_PAYROLL_BATCH',
      resource: 'Batch: Sep 2026 Regular',
      ipAddress: '192.168.1.118',
      status: 'SUCCESS',
      timestamp: 'Today, 10:45 AM'
    },
    {
      id: 'LOG-8839',
      actor: 'System Worker',
      actorEmail: 'system@sparkx.internal',
      action: 'ATTENDANCE_BIOMETRIC_SYNC',
      resource: 'Terminal 04 (Lobby)',
      ipAddress: '10.0.4.12',
      status: 'SUCCESS',
      timestamp: 'Today, 09:00 AM'
    },
    {
      id: 'LOG-8838',
      actor: 'Unknown Client',
      actorEmail: 'david.larson@external.net',
      action: 'AUTH_FAILED_PASSWORD',
      resource: 'Endpoint: /api/auth/login',
      ipAddress: '45.132.89.21',
      status: 'FAILED',
      timestamp: 'Yesterday, 11:58 PM'
    },
    {
      id: 'LOG-8837',
      actor: 'Alex Rivera (CEO)',
      actorEmail: 'alex@sparkx.corp',
      action: 'EXPORT_EXECUTIVE_RADAR',
      resource: 'Reports / Financial Summary',
      ipAddress: '192.168.1.101',
      status: 'SUCCESS',
      timestamp: 'Yesterday, 04:15 PM'
    }
  ]);

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {row.timestamp}
        </span>
      )
    },
    {
      key: 'actor',
      header: 'Actor / User',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{row.actor}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{row.actorEmail}</div>
        </div>
      )
    },
    {
      key: 'action',
      header: 'Action Performed',
      render: (row) => (
        <code
          style={{
            padding: '3px 8px',
            borderRadius: 'var(--radius-xs)',
            backgroundColor: 'var(--color-surface-soft)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-primary)'
          }}
        >
          {row.action}
        </code>
      )
    },
    {
      key: 'resource',
      header: 'Target Resource',
      render: (row) => <span style={{ fontSize: '13px' }}>{row.resource}</span>
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (row) => (
        <span style={{ fontSize: '12.5px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
          {row.ipAddress}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Result',
      render: (row) => (
        <Badge variant={row.status === 'SUCCESS' ? 'success' : row.status === 'WARNING' ? 'warning' : 'danger'}>
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Badge variant="primary" dot>Compliance & Governance</Badge>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Immutable Event Trail</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            System Audit & Security Logs
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Track authenticated user actions, permission escalations, payroll processing, and intrusion attempts.
          </p>
        </div>

        <Button variant="outline" iconPrefix={<Download size={16} />}>
          Export Audit Trail (CSV)
        </Button>
      </div>

      <DataTable
        title="Recent Security & Governance Events"
        subtitle="Chronological audit records across multi-tenant cluster"
        columns={columns}
        data={logs}
        pageSize={10}
        searchPlaceholder="Filter logs by actor, action or IP..."
      />
    </div>
  );
}
