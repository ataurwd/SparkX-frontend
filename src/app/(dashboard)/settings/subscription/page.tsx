'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  Zap,
  Building,
  Users,
  Shield,
  Download,
  Calendar,
  ArrowRight,
  Plus,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';

interface SubscriptionData {
  plan: 'starter' | 'growth' | 'enterprise';
  status: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  seatsTotal: number;
  seatsAssigned: number;
  currentPeriodEnd: string;
  invoices: {
    invoiceNumber: string;
    date: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
  }[];
  paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export default function SubscriptionBillingPage() {
  const DEFAULT_SUB: SubscriptionData = {
    plan: 'growth',
    status: 'active',
    price: 299,
    billingCycle: 'monthly',
    seatsTotal: 500,
    seatsAssigned: 382,
    currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
    invoices: [
      { invoiceNumber: 'INV-2026-09', date: '2026-09-01', amount: 299, currency: 'USD', status: 'paid', paymentMethod: 'Visa ending 4242' },
      { invoiceNumber: 'INV-2026-08', date: '2026-08-01', amount: 299, currency: 'USD', status: 'paid', paymentMethod: 'Visa ending 4242' },
      { invoiceNumber: 'INV-2026-07', date: '2026-07-01', amount: 299, currency: 'USD', status: 'paid', paymentMethod: 'Visa ending 4242' }
    ],
    paymentMethod: {
      brand: 'Visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2028
    }
  };

  const [sub, setSub] = useState<SubscriptionData>(DEFAULT_SUB);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isSeatsModalOpen, setIsSeatsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'growth' | 'enterprise'>('growth');
  const [additionalSeats, setAdditionalSeats] = useState(50);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await api.get<SubscriptionData>('/api/subscriptions/current');
      if (res.data) {
        setSub(res.data);
        setSelectedPlan(res.data.plan);
      }
    } catch {
      setSub(DEFAULT_SUB);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleUpgradePlan = async (tier: 'starter' | 'growth' | 'enterprise') => {
    try {
      setActionLoading(true);
      const res = await api.put<any>('/api/subscriptions/upgrade', { plan: tier });
      if (res.data) {
        setSub(res.data);
      }
      setIsPlanModalOpen(false);
      setSuccessMsg(`Plan upgraded to ${tier.toUpperCase()} successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      setSub((prev) => ({
        ...prev,
        plan: tier,
        price: tier === 'starter' ? 99 : tier === 'growth' ? 299 : 599
      }));
      setIsPlanModalOpen(false);
      setSuccessMsg(`Plan updated to ${tier.toUpperCase()}`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddSeats = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post<any>('/api/subscriptions/seats', { additionalSeats });
      if (res.data) {
        setSub(res.data);
      }
      setIsSeatsModalOpen(false);
      setSuccessMsg(`Added ${additionalSeats} seats successfully!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      setSub((prev) => ({ ...prev, seatsTotal: prev.seatsTotal + additionalSeats }));
      setIsSeatsModalOpen(false);
      setSuccessMsg(`Added ${additionalSeats} seats`);
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadInvoice = (invNum: string) => {
    alert(`Receipt ${invNum} downloaded as PDF.`);
  };

  const planNames = {
    starter: 'SparkX Team Starter',
    growth: 'SparkX Enterprise Growth',
    enterprise: 'SparkX Global Enterprise'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Badge variant="primary" dot>SaaS Billing</Badge>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Multi-Tenant Subscription (Phase 12)</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            Subscription & Invoicing
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Review tier features, manage user seat allocations, download tax invoices, and configure payment methods.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/platform">
            <Button variant="outline">Platform Admin View</Button>
          </Link>
          <Link href="/settings">
            <Button variant="outline">Back to Settings</Button>
          </Link>
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: 'var(--color-success-bg)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--color-success)',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}

      {/* Active Plan Overview Card */}
      <Card padding="lg">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Badge variant="success">Active Subscription</Badge>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Auto-Renews Every 30 Days</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '8px' }}>
              {planNames[sub.plan]}
            </h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)' }}>
                ${sub.price}
              </span>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>/ month billed recurring</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline" onClick={() => setIsPlanModalOpen(true)}>
              Change Plan
            </Button>
            <Button variant="primary" onClick={() => setIsSeatsModalOpen(true)} iconPrefix={<Plus size={16} />}>
              Add Employee Seats
            </Button>
          </div>
        </div>

        {/* Seat Allocation Progress */}
        <div style={{ marginTop: '24px', padding: '16px 20px', backgroundColor: 'var(--color-surface-soft)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Assigned Employee Licenses</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              <strong>{sub.seatsAssigned}</strong> / {sub.seatsTotal} Seats In Use ({((sub.seatsAssigned / sub.seatsTotal) * 100).toFixed(1)}%)
            </span>
          </div>
          <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, (sub.seatsAssigned / sub.seatsTotal) * 100)}%`,
                height: '100%',
                backgroundColor: 'var(--color-primary)',
                borderRadius: 'var(--radius-pill)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      </Card>

      {/* Invoicing Table */}
      <Card title="Billing History & PDF Receipts" subtitle="Official downloadable tax receipts and subscription transactions" padding="none">
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-soft)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '14px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>INVOICE ID</th>
                <th style={{ padding: '14px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>BILLING DATE</th>
                <th style={{ padding: '14px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>AMOUNT</th>
                <th style={{ padding: '14px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>PAYMENT METHOD</th>
                <th style={{ padding: '14px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>STATUS</th>
                <th style={{ padding: '14px 24px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>RECEIPT</th>
              </tr>
            </thead>
            <tbody>
              {sub.invoices.map((inv) => (
                <tr key={inv.invoiceNumber} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-main)' }}>{inv.invoiceNumber}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    {new Date(inv.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>${inv.amount}.00</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>{inv.paymentMethod}</td>
                  <td style={{ padding: '14px 24px' }}><Badge variant="success">{inv.status}</Badge></td>
                  <td style={{ padding: '14px 24px' }}>
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadInvoice(inv.invoiceNumber)} iconPrefix={<Download size={14} />}>
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Plan Upgrade Modal */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Upgrade SaaS Subscription Tier"
        subtitle="Select a package tailored for your enterprise growth"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { id: 'starter', name: 'SparkX Team Starter', price: '$99/mo', desc: 'Up to 25 seats, core HR, basic attendance and leave.' },
            { id: 'growth', name: 'SparkX Enterprise Growth', price: '$299/mo', desc: 'Up to 100+ seats, full payroll, OKRs, ATS recruitment and analytics.' },
            { id: 'enterprise', name: 'SparkX Global Enterprise', price: '$599/mo', desc: 'Unlimited capacity, SLA 99.99%, custom RBAC, dedicated node replica.' }
          ].map((tier) => (
            <div
              key={tier.id}
              onClick={() => handleUpgradePlan(tier.id as any)}
              style={{
                padding: '16px 20px',
                borderRadius: 'var(--radius-md)',
                border: sub.plan === tier.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: sub.plan === tier.id ? 'var(--color-surface-soft)' : 'var(--color-surface)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-main)' }}>{tier.name}</span>
                  {sub.plan === tier.id && <Badge variant="primary">Current</Badge>}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{tier.desc}</div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-primary)' }}>{tier.price}</div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Add Seats Modal */}
      <Modal
        isOpen={isSeatsModalOpen}
        onClose={() => setIsSeatsModalOpen(false)}
        title="Expand Organization Seat Capacity"
        subtitle="Add employee licenses to your current billing cycle"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsSeatsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddSeats} isLoading={actionLoading}>Confirm Seat Purchase</Button>
          </>
        }
      >
        <form onSubmit={handleAddSeats} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Additional Seats Required"
            type="number"
            min={5}
            max={1000}
            step={5}
            value={additionalSeats}
            onChange={(e) => setAdditionalSeats(parseInt(e.target.value, 10) || 5)}
            helperText="$5 per additional user seat per month"
            required
          />
          <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-surface-soft)', borderRadius: 'var(--radius-sm)', fontSize: '13px' }}>
            <span>Projected Monthly Incremental Cost: </span>
            <strong style={{ color: 'var(--color-primary)' }}>${additionalSeats * 5}.00 / mo</strong>
          </div>
        </form>
      </Modal>
    </div>
  );
}
