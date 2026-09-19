'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  DollarSign,
  Calendar,
  Download,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Printer
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DataTable, Column } from '@/components/ui/DataTable';
import { api } from '@/lib/api';

interface MyPayslipItem {
  _id: string;
  payslipNumber: string;
  month: number;
  year: number;
  status: 'draft' | 'processed' | 'approved' | 'paid';
  currency: string;
  earnings: {
    totalEarnings: number;
  };
  deductions: {
    totalDeductions: number;
  };
  netSalary: number;
  paidAt?: string;
  createdAt: string;
  payrollBatchId?: {
    title: string;
    status: string;
  };
}

export default function MyPayslipsPage() {
  const [payslips, setPayslips] = useState<MyPayslipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchMyPayslips = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<MyPayslipItem[]>('/api/payroll/my-payslips');
      if (res.data) {
        setPayslips(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your payslips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPayslips();
  }, []);

  const latestSlip = payslips.length > 0 ? payslips[0] : null;
  const totalYtdEarned = payslips.reduce((acc, p) => acc + (p.netSalary || 0), 0);

  const columns: Column<MyPayslipItem>[] = [
    {
      key: 'period',
      header: 'Pay Period',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)'
            }}
          >
            <Calendar size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
              {monthNames[row.month - 1]} {row.year}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {row.payslipNumber}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'gross',
      header: 'Gross Earnings',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          ${row.earnings.totalEarnings.toLocaleString()}
        </span>
      )
    },
    {
      key: 'deductions',
      header: 'Deductions',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>
          -${row.deductions.totalDeductions.toLocaleString()}
        </span>
      )
    },
    {
      key: 'netSalary',
      header: 'Net Pay',
      render: (row) => (
        <span style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: '15px' }}>
          ${row.netSalary.toLocaleString()} {row.currency}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) =>
        row.status === 'paid' ? (
          <Badge variant="success">Paid & Disbursed</Badge>
        ) : (
          <Badge variant="warning">Processing</Badge>
        )
    },
    {
      key: 'actions',
      header: 'Document',
      render: (row) => (
        <Link href={`/payroll/payslips/${row._id}`}>
          <Button variant="outline" size="sm" iconPrefix={<Printer size={14} />}>
            View &amp; Print
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)' }}>
          My Monthly Payslips
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          View, verify and download your monthly salary slips with earnings and statutory deduction details.
        </p>
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

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}
      >
        <Card padding="md">
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Latest Disbursed Salary
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-success)', marginTop: '6px' }}>
            ${latestSlip ? latestSlip.netSalary.toLocaleString() : '0.00'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            {latestSlip ? `${monthNames[latestSlip.month - 1]} ${latestSlip.year}` : 'No payouts yet'}
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            YTD Net Earnings
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '6px' }}>
            ${totalYtdEarned.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Cumulative disbursed salary
          </div>
        </Card>

        <Card padding="md">
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Total Payslips on Record
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary)', marginTop: '6px' }}>
            {payslips.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            All cycles available for download
          </div>
        </Card>
      </div>

      {/* Payslips DataTable */}
      <Card padding="none">
        <DataTable
          columns={columns}
          data={payslips}
          title="Disbursement History"
          subtitle="All verified and processed salary statements"
          emptyMessage="No payslips generated for your profile yet."
        />
      </Card>
    </div>
  );
}
