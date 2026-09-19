'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  CreditCard,
  ArrowLeft,
  FileText,
  AlertCircle,
  Clock,
  Printer
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { api } from '@/lib/api';

interface BatchData {
  _id: string;
  title: string;
  month: number;
  year: number;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalOvertime: number;
  totalNet: number;
  currency: string;
  status: 'draft' | 'processed' | 'approved' | 'paid';
  paidAt?: string;
  processedBy?: { firstName: string; lastName: string };
  approvedBy?: { firstName: string; lastName: string };
}

interface PayslipItem {
  _id: string;
  payslipNumber: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    avatarUrl?: string;
    departmentId?: { name: string };
    designationId?: { title: string };
  };
  attendanceSummary: {
    daysInMonth: number;
    presentDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
    lateDays: number;
    overtimeMinutes: number;
  };
  earnings: {
    basic: number;
    houseRent: number;
    totalEarnings: number;
    overtimePay: number;
  };
  deductions: {
    providentFund: number;
    tax: number;
    totalDeductions: number;
    unpaidLeaveDeduction: number;
  };
  netSalary: number;
  currency: string;
  status: 'draft' | 'processed' | 'approved' | 'paid';
}

export default function PayrollBatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const batchId = params?.id as string;

  const [batch, setBatch] = useState<BatchData | null>(null);
  const [payslips, setPayslips] = useState<PayslipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatchDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ batch: BatchData; payslips: PayslipItem[] }>(
        `/api/payroll/batches/${batchId}`
      );
      if (res.data) {
        setBatch(res.data.batch);
        setPayslips(res.data.payslips);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch batch details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchBatchDetail();
    }
  }, [batchId]);

  const handleApproveBatch = async () => {
    try {
      setActionLoading(true);
      setError(null);
      await api.put(`/api/payroll/batches/${batchId}/approve`, {});
      await fetchBatchDetail();
    } catch (err: any) {
      setError(err.message || 'Failed to approve batch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisburseBatch = async () => {
    if (!confirm('Are you sure you want to disburse this batch and mark all payslips as Paid?')) {
      return;
    }
    try {
      setActionLoading(true);
      setError(null);
      await api.put(`/api/payroll/batches/${batchId}/pay`, {});
      await fetchBatchDetail();
    } catch (err: any) {
      setError(err.message || 'Failed to disburse batch');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: BatchData['status']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid & Disbursed</Badge>;
      case 'approved':
        return <Badge variant="info">Approved for Payout</Badge>;
      case 'processed':
        return <Badge variant="warning">Awaiting Approval</Badge>;
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  const columns: Column<PayslipItem>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img
            src={
              row.employeeId?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
            }
            alt="Avatar"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
              {row.employeeId?.firstName} {row.employeeId?.lastName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {row.employeeId?.employeeCode} • {row.employeeId?.designationId?.title || 'Staff'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'attendance',
      header: 'Attendance & Leaves',
      render: (row) => (
        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          <div>
            Present: <strong>{row.attendanceSummary.presentDays}</strong> / {row.attendanceSummary.daysInMonth}d
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Paid Leave: {row.attendanceSummary.paidLeaveDays}d | Unpaid: {row.attendanceSummary.unpaidLeaveDays}d
          </div>
        </div>
      )
    },
    {
      key: 'gross',
      header: 'Gross Earnings',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>
            ${row.earnings.totalEarnings.toLocaleString()}
          </div>
          {row.earnings.overtimePay > 0 && (
            <div style={{ fontSize: '11px', color: 'var(--color-success)' }}>
              +${row.earnings.overtimePay} Overtime
            </div>
          )}
        </div>
      )
    },
    {
      key: 'deductions',
      header: 'Deductions',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--color-danger)' }}>
            -${row.deductions.totalDeductions.toLocaleString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            PF: ${row.deductions.providentFund} | Tax: ${row.deductions.tax}
          </div>
        </div>
      )
    },
    {
      key: 'net',
      header: 'Net Salary',
      render: (row) => (
        <span style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: '15px' }}>
          ${row.netSalary.toLocaleString()}
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
      header: 'Payslip',
      render: (row) => (
        <Link href={`/payroll/payslips/${row._id}`}>
          <Button variant="outline" size="sm" iconPrefix={<Printer size={14} />}>
            View Slip
          </Button>
        </Link>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading payroll batch details...
      </div>
    );
  }

  if (!batch) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Payroll batch not found</h3>
        <Link href="/payroll">
          <Button variant="primary" style={{ marginTop: '16px' }}>
            Back to Payroll
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back link & Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/payroll">
            <Button variant="outline" size="sm" iconPrefix={<ArrowLeft size={16} />}>
              All Batches
            </Button>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {batch.title}
              </h1>
              {getStatusBadge(batch.status)}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Batch ID: {batch._id} • {batch.totalEmployees} Employees included
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {batch.status === 'processed' && (
            <Button
              variant="primary"
              iconPrefix={<CheckCircle size={16} />}
              onClick={handleApproveBatch}
              isLoading={actionLoading}
            >
              Approve Payroll Batch
            </Button>
          )}

          {batch.status === 'approved' && (
            <Button
              variant="primary"
              style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}
              iconPrefix={<CreditCard size={16} />}
              onClick={handleDisburseBatch}
              isLoading={actionLoading}
            >
              Disburse & Mark Paid
            </Button>
          )}

          {batch.status === 'paid' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                fontWeight: 700,
                fontSize: '13px'
              }}
            >
              <CheckCircle size={16} />
              <span>Disbursed on {new Date(batch.paidAt!).toLocaleDateString()}</span>
            </div>
          )}
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

      {/* Financial Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        <Card padding="md">
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Total Gross Payroll
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '4px' }}>
            ${batch.totalGross.toLocaleString()}
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Total Overtime Paid
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)', marginTop: '4px' }}>
            +${(batch.totalOvertime || 0).toLocaleString()}
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Total Deductions (PF & Tax)
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-danger)', marginTop: '4px' }}>
            -${batch.totalDeductions.toLocaleString()}
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Total Net Salary Disbursable
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-success)', marginTop: '4px' }}>
            ${batch.totalNet.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Itemized Payslips Table */}
      <Card padding="none">
        <DataTable
          columns={columns}
          data={payslips}
          title="Itemized Employee Payroll Breakdown"
          subtitle="Attendance, earnings breakdown, deductions, and payment status for this period"
          pageSize={10}
        />
      </Card>
    </div>
  );
}
