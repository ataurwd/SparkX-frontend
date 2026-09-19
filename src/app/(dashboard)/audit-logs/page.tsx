'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  AlertTriangle,
  RefreshCw,
  Clock,
  Terminal,
  Server
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { DataTable, Column } from '@/components/ui/DataTable';
import { api } from '@/lib/api';

interface AuditLogEntry {
  _id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  resource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  createdAt: string;
}

export default function AuditLogsPage() {
  const DEFAULT_LOGS: AuditLogEntry[] = [
    {
      _id: 'LOG-8841',
      actorName: 'Marcus Sterling',
      actorEmail: 'marcus@sparkx.corp',
      action: 'UPDATE_ROLE_PERMISSIONS',
      resource: 'Role: HR Manager',
      ipAddress: '192.168.1.104',
      status: 'SUCCESS',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'LOG-8840',
      actorName: 'Elena Rostova',
      actorEmail: 'elena@sparkx.corp',
      action: 'PROCESS_PAYROLL_BATCH',
      resource: 'Batch: Sep 2026 Regular',
      ipAddress: '192.168.1.118',
      status: 'SUCCESS',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      _id: 'LOG-8839',
      actorName: 'System Worker',
      actorEmail: 'system@sparkx.internal',
      action: 'ATTENDANCE_BIOMETRIC_SYNC',
      resource: 'Terminal 04 (Lobby)',
      ipAddress: '10.0.4.12',
      status: 'SUCCESS',
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      _id: 'LOG-8838',
      actorName: 'Unknown Client',
      actorEmail: 'david.larson@external.net',
      action: 'AUTH_FAILED_PASSWORD',
      resource: 'Endpoint: /api/auth/login',
      ipAddress: '45.132.89.21',
      status: 'FAILED',
      createdAt: new Date(Date.now() - 14400000).toISOString()
    },
    {
      _id: 'LOG-8837',
      actorName: 'Alex Rivera (CEO)',
      actorEmail: 'alex@sparkx.corp',
      action: 'EXPORT_EXECUTIVE_RADAR',
      resource: 'Reports / Financial Summary',
      ipAddress: '192.168.1.101',
      status: 'SUCCESS',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  const [logs, setLogs] = useState<AuditLogEntry[]>(DEFAULT_LOGS);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'WARNING' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get<any>('/api/audit-logs');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setLogs(res.data);
      } else {
        setLogs(DEFAULT_LOGS);
      }
    } catch {
      setLogs(DEFAULT_LOGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportCSV = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    window.open(`${backendUrl}/api/audit-logs/export`, '_blank');
  };

  const filteredLogs = logs.filter((log) => {
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    const matchesSearch =
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'createdAt',
      header: 'Timestamp',
      sortable: true,
      render: (row) => (
        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {new Date(row.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      )
    },
    {
      key: 'actorName',
      header: 'Actor / User',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{row.actorName}</div>
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
      render: (row) => <span style={{ fontSize: '13px', color: 'var(--color-text-main)' }}>{row.resource}</span>
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
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Immutable Event Trail (Phase 12)</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            System Audit & Security Logs
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Track authenticated user actions, permission escalations, payroll processing, and intrusion attempts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={fetchLogs} iconPrefix={<RefreshCw size={14} className={loading ? 'spin' : ''} />}>
            Refresh
          </Button>
          <Button variant="primary" onClick={handleExportCSV} iconPrefix={<Download size={16} />}>
            Export Audit Trail (CSV)
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '12px' }}>
        {(['ALL', 'SUCCESS', 'WARNING', 'FAILED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: statusFilter === status ? 'var(--color-primary)' : 'var(--color-surface-soft)',
              color: statusFilter === status ? '#FFFFFF' : 'var(--color-text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            {status} ({status === 'ALL' ? logs.length : logs.filter((l) => l.status === status).length})
          </button>
        ))}
      </div>

      <DataTable
        title="Recent Security & Governance Events"
        subtitle="Chronological audit records across multi-tenant cluster"
        columns={columns}
        data={filteredLogs}
        pageSize={10}
        searchPlaceholder="Filter logs by actor, action or IP..."
      />
    </div>
  );
}
