'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Printer,
  ArrowLeft,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  CreditCard,
  Download
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SparkXLogo } from '@/components/ui/SparkXLogo';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { normalizeRole } from '@/lib/permissions';

interface PayslipData {
  _id: string;
  payslipNumber: string;
  month: number;
  year: number;
  status: 'draft' | 'processed' | 'approved' | 'paid';
  paidAt?: string;
  currency: string;
  paymentMethod: string;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
  };
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    email: string;
    phone?: string;
    joiningDate?: string;
    departmentId?: { name: string; code: string };
    designationId?: { title: string };
  };
  organizationId: {
    _id: string;
    name: string;
  };
  payrollBatchId: {
    _id: string;
    title: string;
    status: string;
    paidAt?: string;
  };
  attendanceSummary: {
    daysInMonth: number;
    presentDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
    absentDays: number;
    lateDays: number;
    overtimeMinutes: number;
  };
  earnings: {
    basic: number;
    houseRent: number;
    medical: number;
    transport: number;
    specialAllowance: number;
    bonus: number;
    overtimePay: number;
    totalEarnings: number;
  };
  deductions: {
    providentFund: number;
    tax: number;
    unpaidLeaveDeduction: number;
    lateDeduction: number;
    otherDeduction: number;
    totalDeductions: number;
  };
  netSalary: number;
  createdAt: string;
}

export default function PayslipDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const isEmployee = normalizeRole(user?.role) === 'employee';
  const backUrl = isEmployee ? '/payroll/my-payslips' : '/payroll';
  const backText = isEmployee ? 'Back to My Payslips' : 'Back to Payroll';

  const [payslip, setPayslip] = useState<PayslipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    const fetchPayslip = async () => {
      try {
        setLoading(true);
        const res = await api.get<PayslipData>(`/api/payroll/payslips/${id}`);
        if (res.data) {
          setPayslip(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load payslip');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchPayslip();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading official payslip document...
      </div>
    );
  }

  if (!payslip) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Payslip not found</h3>
        <Link href={backUrl}>
          <Button variant="primary" style={{ marginTop: '16px' }}>
            {backText}
          </Button>
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const periodName = `${monthNames[payslip.month - 1]} ${payslip.year}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Action Header (Hidden during Print) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <Link href={backUrl}>
          <Button variant="outline" size="sm" iconPrefix={<ArrowLeft size={16} />}>
            {backText}
          </Button>
        </Link>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="primary" iconPrefix={<Printer size={16} />} onClick={handlePrint}>
            Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Official Printable Payslip Card */}
      <Card padding="none" style={{ backgroundColor: '#FFFFFF', color: '#1B1B3A', border: '1px solid #E4E7F4' }}>
        <div style={{ padding: '36px 40px' }}>
          {/* Header & Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              borderBottom: '2px solid #6C5CE7',
              paddingBottom: '24px'
            }}
          >
            <div>
              <SparkXLogo size="md" variant="light" />
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1B1B3A', marginTop: '10px' }}>
                {payslip.organizationId?.name || 'SparkX Enterprise Ltd.'}
              </div>
              <div style={{ fontSize: '12.5px', color: '#5F6480', marginTop: '2px' }}>
                Global Headquarters • HR & Finance Division
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  color: '#6C5CE7'
                }}
              >
                PAYSLIP
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1B1B3A', marginTop: '4px' }}>
                {payslip.payslipNumber}
              </div>
              <div style={{ fontSize: '12.5px', color: '#5F6480', marginTop: '2px' }}>
                Period: <strong>{periodName}</strong>
              </div>
              <div style={{ marginTop: '6px' }}>
                {payslip.status === 'paid' ? (
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#ECFDF5',
                      color: '#10B981',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '11.5px',
                      fontWeight: 700
                    }}
                  >
                    PAID & DISBURSED
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#FFFBEB',
                      color: '#F59E0B',
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      fontSize: '11.5px',
                      fontWeight: 700
                    }}
                  >
                    PENDING PAYOUT
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Employee & Bank Meta Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
              padding: '24px 0',
              borderBottom: '1px solid #ECEEF8',
              fontSize: '13px'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#959BB4', textTransform: 'uppercase', marginBottom: '8px' }}>
                Employee Information
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px' }}>
                <span style={{ color: '#5F6480' }}>Employee Name:</span>
                <strong style={{ color: '#1B1B3A' }}>
                  {payslip.employeeId?.firstName} {payslip.employeeId?.lastName}
                </strong>

                <span style={{ color: '#5F6480' }}>Employee Code:</span>
                <strong style={{ color: '#1B1B3A' }}>{payslip.employeeId?.employeeCode}</strong>

                <span style={{ color: '#5F6480' }}>Department:</span>
                <span style={{ color: '#1B1B3A' }}>{payslip.employeeId?.departmentId?.name || 'Operations'}</span>

                <span style={{ color: '#5F6480' }}>Designation:</span>
                <span style={{ color: '#1B1B3A' }}>{payslip.employeeId?.designationId?.title || 'Staff'}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#959BB4', textTransform: 'uppercase', marginBottom: '8px' }}>
                Disbursement Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '6px' }}>
                <span style={{ color: '#5F6480' }}>Payment Mode:</span>
                <strong style={{ color: '#1B1B3A', textTransform: 'capitalize' }}>
                  {payslip.paymentMethod.replace('_', ' ')}
                </strong>

                <span style={{ color: '#5F6480' }}>Bank Name:</span>
                <span style={{ color: '#1B1B3A' }}>{payslip.bankDetails?.bankName || 'Silicon City Bank'}</span>

                <span style={{ color: '#5F6480' }}>Account No:</span>
                <span style={{ color: '#1B1B3A' }}>{payslip.bankDetails?.accountNumber || '••••••••4892'}</span>

                <span style={{ color: '#5F6480' }}>Disbursed Date:</span>
                <span style={{ color: '#1B1B3A' }}>
                  {payslip.paidAt ? new Date(payslip.paidAt).toLocaleDateString() : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Attendance Summary Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '14px',
              backgroundColor: '#F8F9FD',
              borderRadius: '8px',
              margin: '20px 0',
              fontSize: '12.5px',
              color: '#5F6480'
            }}
          >
            <div>
              Total Month Days: <strong style={{ color: '#1B1B3A' }}>{payslip.attendanceSummary.daysInMonth}</strong>
            </div>
            <div>
              Days Worked: <strong style={{ color: '#10B981' }}>{payslip.attendanceSummary.presentDays}</strong>
            </div>
            <div>
              Paid Leaves: <strong style={{ color: '#0EA5E9' }}>{payslip.attendanceSummary.paidLeaveDays}</strong>
            </div>
            <div>
              Unpaid Leaves: <strong style={{ color: '#EF4444' }}>{payslip.attendanceSummary.unpaidLeaveDays}</strong>
            </div>
            <div>
              Overtime Mins: <strong style={{ color: '#6C5CE7' }}>{payslip.attendanceSummary.overtimeMinutes}m</strong>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
            {/* Earnings Column */}
            <div>
              <div
                style={{
                  backgroundColor: '#F0EFFF',
                  color: '#6C5CE7',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '10px 14px',
                  borderRadius: '6px 6px 0 0'
                }}
              >
                EARNINGS (USD)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ECEEF8' }}>
                    <td style={{ padding: '9px 12px', color: '#5F6480' }}>Basic Salary</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600 }}>
                      ${payslip.earnings.basic.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ECEEF8' }}>
                    <td style={{ padding: '9px 12px', color: '#5F6480' }}>House Rent Allowance (HRA)</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600 }}>
                      ${payslip.earnings.houseRent.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ECEEF8' }}>
                    <td style={{ padding: '9px 12px', color: '#5F6480' }}>Medical Allowance</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600 }}>
                      ${payslip.earnings.medical.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ECEEF8' }}>
                    <td style={{ padding: '9px 12px', color: '#5F6480' }}>Transport Allowance</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600 }}>
                      ${payslip.earnings.transport.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ECEEF8' }}>
                    <td style={{ padding: '9px 12px', color: '#5F6480' }}>Special Allowance</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600 }}>
                      ${payslip.earnings.specialAllowance.toLocaleString()}
                    </td>
                  </tr>
                  {payslip.earnings.overtimePay > 0 && (
                    <tr style={{ borderBottom: '1px solid #ECEEF8' }}>
                      <td style={{ padding: '9px 12px', color: '#10B981' }}>Overtime Bonus</td>
                      <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: '#10B981' }}>
                        +${payslip.earnings.overtimePay.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  <tr style={{ backgroundColor: '#F8F9FD', fontWeight: 700 }}>
                    <td style={{ padding: '12px', color: '#1B1B3A' }}>Total Gross Earnings</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#1B1B3A', fontSize: '14px' }}>
                      ${payslip.earnings.totalEarnings.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions Column */}
            <div>
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  color: '#EF4444',
                  fontWeight: 700,
                  fontSize: '13px',
                  padding: '10px 14px',
                  borderRadius: '6px 6px 0 0'
                }}
              >
                DEDUCTIONS (USD)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ECEEF8' }}>
                    <td style={{ padding: '9px 12px', color: '#5F6480' }}>Provident Fund (PF)</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600 }}>
                      ${payslip.deductions.providentFund.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ECEEF8' }}>
                    <td style={{ padding: '9px 12px', color: '#5F6480' }}>Professional / Income Tax</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600 }}>
                      ${payslip.deductions.tax.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ECEEF8' }}>
                    <td style={{ padding: '9px 12px', color: '#5F6480' }}>Unpaid Leave Deductions</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: '#EF4444' }}>
                      ${payslip.deductions.unpaidLeaveDeduction.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ECEEF8' }}>
                    <td style={{ padding: '9px 12px', color: '#5F6480' }}>Late Penalties</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600, color: '#EF4444' }}>
                      ${payslip.deductions.lateDeduction.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ECEEF8' }}>
                    <td style={{ padding: '9px 12px', color: '#5F6480' }}>Other Deductions</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontWeight: 600 }}>
                      ${payslip.deductions.otherDeduction.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#F8F9FD', fontWeight: 700 }}>
                    <td style={{ padding: '12px', color: '#1B1B3A' }}>Total Deductions</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#EF4444', fontSize: '14px' }}>
                      -${payslip.deductions.totalDeductions.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Salary Payable Callout (Solid Primary Colors) */}
          <div
            style={{
              backgroundColor: '#6C5CE7',
              borderRadius: '8px',
              padding: '20px 24px',
              marginTop: '28px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, opacity: 0.9 }}>
                NET SALARY PAYABLE
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                (Total Gross Earnings minus Total Statutory Deductions)
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 800 }}>
              ${payslip.netSalary.toLocaleString()} {payslip.currency}
            </div>
          </div>

          {/* Signatures & Footer Note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginTop: '56px',
              paddingTop: '20px',
              fontSize: '12px',
              color: '#959BB4'
            }}
          >
            <div>
              <div>This is a system-generated document and does not require a physical signature.</div>
              <div style={{ marginTop: '4px' }}>SparkX Payroll Engine • Generated on {new Date(payslip.createdAt).toLocaleDateString()}</div>
            </div>

            <div style={{ textAlign: 'center', width: '200px', borderTop: '1px solid #D5DAEC', paddingTop: '8px' }}>
              <strong style={{ color: '#1B1B3A' }}>Authorized Signatory</strong>
              <div style={{ fontSize: '11px', color: '#5F6480' }}>Finance / HR Department</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
