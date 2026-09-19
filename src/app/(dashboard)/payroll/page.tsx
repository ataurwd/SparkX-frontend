'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface PayrollBatchItem {
  _id: string;
  title: string;
  month: number;
  year: number;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  status: 'draft' | 'processed' | 'approved' | 'paid';
  currency: string;
  createdAt: string;
}

export default function PayrollDashboardPage() {
  const [batches, setBatches] = useState<PayrollBatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<PayrollBatchItem[]>('/api/payroll/batches');
      if (res.data) {
        setBatches(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payroll batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setError(null);
      await api.post('/api/payroll/generate', {
        month: selectedMonth,
        year: selectedYear
      });
      setIsGenerateModalOpen(false);
      await fetchBatches();
    } catch (err: any) {
      setError(err.message || 'Failed to generate payroll batch');
    } finally {
      setGenerating(false);
    }
  };

  // KPIs
  const totalDisbursed = batches
    .filter((b) => b.status === 'paid')
    .reduce((acc, b) => acc + (b.totalNet || 0), 0);

  const pendingApprovalCount = batches.filter(
    (b) => b.status === 'processed' || b.status === 'draft'
  ).length;

  const totalEmployeesCount = batches.length > 0 ? batches[0].totalEmployees : 0;

  const getStatusBadge = (status: PayrollBatchItem['status']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid & Disbursed</Badge>;
      case 'approved':
        return <Badge variant="info">Approved</Badge>;
      case 'processed':
        return <Badge variant="warning">Pending Approval</Badge>;
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  const columns: Column<PayrollBatchItem>[] = [
    {
      key: 'title',
      header: 'Payroll Cycle',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}
          >
            <Calendar size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{row.title}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Period: {monthNames[row.month - 1]} {row.year}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'totalEmployees',
      header: 'Headcount',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
          {row.totalEmployees} Employees
        </span>
      )
    },
    {
      key: 'totalGross',
      header: 'Total Gross',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          ${(row.totalGross || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'totalDeductions',
      header: 'Deductions',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>
          -${(row.totalDeductions || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'totalNet',
      header: 'Net Payout',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--color-success)', fontSize: '14.5px' }}>
          ${(row.totalNet || 0).toLocaleString()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <Link href={`/payroll/batches/${row._id}`}>
          <Button variant="outline" size="sm">
            Inspect Batch <ArrowRight size={14} style={{ marginLeft: '4px' }} />
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Primary Action */}
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
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Payroll & Compensation Engine
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Multi-tenant payroll processing, salary structures, tax deductions & payslips.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/payroll/my-payslips">
            <Button variant="outline" iconPrefix={<FileText size={16} />}>
              My Payslips
            </Button>
          </Link>
          <Button
            variant="primary"
            iconPrefix={<Plus size={16} />}
            onClick={() => setIsGenerateModalOpen(true)}
          >
            Run Monthly Payroll
          </Button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards (Solid Surface Tokens) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}
      >
        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-success-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-success)'
              }}
            >
              <DollarSign size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Total Disbursed (Paid)
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                ${totalDisbursed.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-warning-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-warning)'
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Pending Batches
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {pendingApprovalCount}
              </div>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Employees in Active Cycle
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {totalEmployeesCount}
              </div>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-info-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-info)'
              }}
            >
              <TrendingUp size={22} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Total Payroll Runs
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {batches.length}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Batches Data Table */}
      <Card padding="none">
        <DataTable
          columns={columns}
          data={batches}
          title="Monthly Payroll Cycles"
          subtitle="Processed salary batches with attendance integration and disbursement control"
          emptyMessage="No payroll batches found. Click 'Run Monthly Payroll' to generate the first cycle."
        />
      </Card>

      {/* Run Monthly Payroll Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Run Monthly Payroll Engine"
        subtitle="Calculates gross earnings, attendance adjustments, tax, PF, and generates itemized payslips."
      >
        <form onSubmit={handleGeneratePayroll} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
              Payroll Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                padding: '0 12px',
                fontSize: '14px'
              }}
              required
            >
              {monthNames.map((name, idx) => (
                <option key={idx} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
              Payroll Year
            </label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              min={2020}
              max={2035}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                padding: '0 12px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface-soft)',
              border: '1px solid var(--color-border)',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--color-text-main)', marginBottom: '4px' }}>
              Automated Engine Inclusions:
            </div>
            <div>• Fetches each active employee&apos;s base salary &amp; custom allowances.</div>
            <div>• Reads Phase 5 attendance timesheets for overtime bonuses and late deductions.</div>
            <div>• Cross-checks approved unpaid leaves for exact daily rate deductions.</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button variant="outline" type="button" onClick={() => setIsGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={generating}>
              {generating ? 'Calculating...' : 'Generate Batch'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
