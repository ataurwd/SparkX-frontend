'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Building,
  Calendar
} from 'lucide-react';
import api from '@/lib/api';

interface ExpenseClaim {
  _id: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  title: string;
  category: string;
  amount: number;
  currency: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  expenseDate: string;
  submittedDate: string;
  reviewedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

interface Metrics {
  totalClaims: number;
  pendingCount: number;
  pendingAmount: number;
  approvedAmount: number;
  reimbursedAmount: number;
}

export default function ExpenseClaimsPage() {
  const [claims, setClaims] = useState<ExpenseClaim[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalClaims: 0,
    pendingCount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    reimbursedAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'reimbursed' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'travel',
    amount: '',
    currency: 'BDT',
    receiptUrl: '',
    employeeName: 'Ataur Rahman',
    department: 'Engineering',
    notes: ''
  });

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/expenses', {
        params: {
          status: activeTab,
          category: categoryFilter,
          search: searchTerm
        }
      });
      if (res.data) {
        setClaims(res.data);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch expense claims', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [activeTab, categoryFilter, searchTerm]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    let rejectionReason = '';
    if (newStatus === 'rejected') {
      const reason = prompt('Please enter rejection reason:');
      if (!reason) return;
      rejectionReason = reason;
    }

    try {
      await api.put(`/expenses/${id}/status`, {
        status: newStatus,
        reviewedBy: 'Alex Morgan (HR)',
        rejectionReason
      });
      fetchClaims();
    } catch (err) {
      alert('Failed to update expense status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/expenses', formData);
      setIsModalOpen(false);
      setFormData({
        title: '',
        category: 'travel',
        amount: '',
        currency: 'BDT',
        receiptUrl: '',
        employeeName: 'Ataur Rahman',
        department: 'Engineering',
        notes: ''
      });
      fetchClaims();
    } catch (err) {
      alert('Failed to submit expense claim');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: '#FEF3C7', color: '#92400E' }}>
            <Clock size={13} /> Pending Review
          </span>
        );
      case 'approved':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
            <ShieldCheck size={13} /> Approved (Pending Pay)
          </span>
        );
      case 'reimbursed':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: '#D1FAE5', color: '#065F46' }}>
            <CheckCircle2 size={13} /> Reimbursed
          </span>
        );
      case 'rejected':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: '#FEE2E2', color: '#991B1B' }}>
            <XCircle size={13} /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'travel': return '#3B82F6';
      case 'hardware': return '#6C5CE7';
      case 'software': return '#10B981';
      case 'meals': return '#F59E0B';
      case 'office_supplies': return '#8B5CF6';
      default: return '#64748B';
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Receipt size={24} style={{ color: '#6C5CE7' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              Expense Reimbursement & Claims
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Employee out-of-pocket expense approvals, proof receipts, and financial settlement workflows.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#6C5CE7',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 18px',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Submit Expense Claim
        </button>
      </div>

      {/* KPI Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>
            <span>PENDING APPROVAL</span>
            <Clock size={16} style={{ color: '#D97706' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            ৳{metrics.pendingAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#D97706', marginTop: '4px', fontWeight: 500 }}>
            {metrics.pendingCount} claims awaiting review
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>
            <span>APPROVED QUEUE</span>
            <ShieldCheck size={16} style={{ color: '#2563EB' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            ৳{metrics.approvedAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#2563EB', marginTop: '4px', fontWeight: 500 }}>
            Ready for payroll disbursement
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>
            <span>TOTAL REIMBURSED</span>
            <CheckCircle2 size={16} style={{ color: '#059669' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            ৳{metrics.reimbursedAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>
            Disbursed in active billing cycle
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>
            <span>TOTAL CLAIMS FILED</span>
            <FileSpreadsheet size={16} style={{ color: '#6C5CE7' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {metrics.totalClaims}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
            Across all 12 departments
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['all', 'pending', 'approved', 'reimbursed', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: activeTab === tab ? '#6C5CE7' : 'var(--color-border)',
                  backgroundColor: activeTab === tab ? '#6C5CE7' : 'transparent',
                  color: activeTab === tab ? '#FFFFFF' : 'var(--color-text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'uppercase'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '7px 12px',
                fontSize: '0.84rem'
              }}
            >
              <option value="all">All Categories</option>
              <option value="travel">Travel & Transit</option>
              <option value="hardware">Hardware & Equipment</option>
              <option value="software">Software & Licenses</option>
              <option value="meals">Meals & Entertainment</option>
              <option value="office_supplies">Office Supplies</option>
            </select>

            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search employee or claim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '7px 12px 7px 34px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.84rem',
                  width: '220px'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Claims Ledger Table */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '12px 18px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Employee</th>
              <th style={{ padding: '12px 18px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Claim Item & Category</th>
              <th style={{ padding: '12px 18px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Amount</th>
              <th style={{ padding: '12px 18px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '12px 18px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '12px 18px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Loading expense claims...
                </td>
              </tr>
            ) : claims.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No expense claims found for this filter.
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr key={claim._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>{claim.employeeName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{claim.department}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>{claim.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: `1px solid ${getCategoryColor(claim.category)}`,
                          color: getCategoryColor(claim.category),
                          fontWeight: 600,
                          textTransform: 'capitalize'
                        }}
                      >
                        {claim.category.replace('_', ' ')}
                      </span>
                      {claim.receiptUrl && (
                        <a
                          href={claim.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.75rem', color: '#6C5CE7', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none' }}
                        >
                          <Receipt size={12} /> View Receipt <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--color-text-primary)' }}>
                      ৳{claim.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{claim.currency}</div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                    {new Date(claim.expenseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {getStatusBadge(claim.status)}
                    {claim.rejectionReason && (
                      <div style={{ fontSize: '0.74rem', color: '#EF4444', marginTop: '4px' }}>
                        Reason: {claim.rejectionReason}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {claim.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(claim._id, 'approved')}
                            style={{
                              backgroundColor: '#10B981',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '5px 10px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(claim._id, 'rejected')}
                            style={{
                              backgroundColor: '#EF4444',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '5px 10px',
                              fontSize: '0.78rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {claim.status === 'approved' && (
                        <button
                          onClick={() => handleStatusUpdate(claim._id, 'reimbursed')}
                          style={{
                            backgroundColor: '#6C5CE7',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '5px 10px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Mark Paid
                        </button>
                      )}
                      {claim.status === 'reimbursed' && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Settled</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Claim Submission Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                New Reimbursement Claim
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Claim Description / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flight ticket to Singapore Summit"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.88rem'
                    }}
                  >
                    <option value="travel">Travel & Transit</option>
                    <option value="hardware">Hardware & Device</option>
                    <option value="software">Software & SaaS</option>
                    <option value="meals">Meals & Food</option>
                    <option value="office_supplies">Office Supplies</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                    Amount (BDT) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 4500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Receipt / Invoice URL
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or receipt image link"
                  value={formData.receiptUrl}
                  onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief context for finance / manager..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#6C5CE7',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
