'use client';

import React from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function SubscriptionBillingPage() {
  const currentPlan = {
    name: 'Enterprise Growth Tier',
    status: 'Active',
    price: '$299',
    billingCycle: 'Monthly',
    nextBillingDate: 'October 1, 2026',
    seatsTotal: 500,
    seatsAssigned: 382
  };

  const invoiceHistory = [
    { id: 'INV-2026-09', date: 'Sep 1, 2026', amount: '$299.00', status: 'Paid', method: 'Visa ending 4242' },
    { id: 'INV-2026-08', date: 'Aug 1, 2026', amount: '$299.00', status: 'Paid', method: 'Visa ending 4242' },
    { id: 'INV-2026-07', date: 'Jul 1, 2026', amount: '$299.00', status: 'Paid', method: 'Visa ending 4242' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Badge variant="primary" dot>SaaS Billing</Badge>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Multi-Tenant Subscription</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            Subscription & Invoicing
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Review tier features, manage user seat allocations, download tax invoices, and configure payment methods.
          </p>
        </div>

        <Link href="/settings">
          <Button variant="outline">Back to Settings</Button>
        </Link>
      </div>

      {/* Active Plan Overview Card */}
      <Card padding="lg">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Badge variant="success">Active Subscription</Badge>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Auto-Renews Every 30 Days</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '8px' }}>
              {currentPlan.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
              <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-primary)' }}>{currentPlan.price}</span>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>/ month billed recurring</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="outline">Change Plan</Button>
            <Button variant="primary">Add Employee Seats</Button>
          </div>
        </div>

        {/* Seat Allocation Progress */}
        <div style={{ marginTop: '24px', padding: '16px 20px', backgroundColor: 'var(--color-surface-soft)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Assigned Employee Licenses</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              <strong>{currentPlan.seatsAssigned}</strong> / {currentPlan.seatsTotal} Seats In Use (76.4%)
            </span>
          </div>
          <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
            <div style={{ width: '76.4%', height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: 'var(--radius-pill)' }} />
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
              {invoiceHistory.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-main)' }}>{inv.id}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>{inv.date}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>{inv.amount}</td>
                  <td style={{ padding: '14px 24px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>{inv.method}</td>
                  <td style={{ padding: '14px 24px' }}><Badge variant="success">Paid</Badge></td>
                  <td style={{ padding: '14px 24px' }}>
                    <Button variant="ghost" size="sm" iconPrefix={<Download size={14} />}>
                      PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
