'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Building,
  ShieldCheck,
  CreditCard,
  Bell,
  Lock,
  Globe,
  Save,
  CheckCircle2,
  Sliders,
  Mail,
  Smartphone
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/auth-context';

export default function SettingsOverviewPage() {
  const { organization, user } = useAuth();
  const [saved, setSaved] = useState(false);

  // Form states
  const [orgName, setOrgName] = useState(organization?.name || 'SparkX Global Tech');
  const [supportEmail, setSupportEmail] = useState('support@sparkx.corp');
  const [timezone, setTimezone] = useState('America/New_York (UTC-05:00)');
  const [currency, setCurrency] = useState('USD ($)');
  const [twoFactorRequired, setTwoFactorRequired] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Badge variant="primary" dot>Platform Core</Badge>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Enterprise SaaS Settings</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', letterSpacing: '-0.02em' }}>
            Organization & System Settings
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Manage company profile, enterprise security policies, tenant locale, and global notification triggers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/settings/roles-permissions">
            <Button variant="outline" iconPrefix={<ShieldCheck size={16} />}>
              Roles & Permissions
            </Button>
          </Link>
          <Link href="/settings/subscription">
            <Button variant="outline" iconPrefix={<CreditCard size={16} />}>
              SaaS Billing
            </Button>
          </Link>
        </div>
      </div>

      {saved && (
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
          Organization configuration updated successfully across all cluster nodes.
        </div>
      )}

      {/* Settings Sections Grid */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Company Identity */}
        <Card title="Organization Identity & Branding" subtitle="Primary company details and global contact coordinates" padding="lg">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <Input
              label="Organization Legal Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
            <Input
              label="Primary Admin / Support Email"
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              required
            />
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', display: 'block', marginBottom: '8px' }}>
                Default Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="America/New_York (UTC-05:00)">America/New_York (UTC-05:00)</option>
                <option value="Europe/London (UTC+00:00)">Europe/London (UTC+00:00)</option>
                <option value="Asia/Dhaka (UTC+06:00)">Asia/Dhaka (UTC+06:00)</option>
                <option value="Asia/Singapore (UTC+08:00)">Asia/Singapore (UTC+08:00)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', display: 'block', marginBottom: '8px' }}>
                Operational Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="USD ($)">USD — United States Dollar ($)</option>
                <option value="EUR (€)">EUR — Euro (€)</option>
                <option value="GBP (£)">GBP — British Pound (£)</option>
                <option value="BDT (৳)">BDT — Bangladeshi Taka (৳)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Security & Authentication */}
        <Card title="Security & Multi-Factor Enforcement" subtitle="Strict access rules, session lifetimes, and 2FA compliance" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-soft)',
                border: '1px solid var(--color-border-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Enforce Two-Factor Authentication (2FA) for All Admins
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Require TOTP authenticator code on all administrator, HR manager, and executive logins.
                </div>
              </div>
              <input
                type="checkbox"
                checked={twoFactorRequired}
                onChange={(e) => setTwoFactorRequired(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-soft)',
                border: '1px solid var(--color-border-subtle)'
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Automated Inactivity Session Lockout
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Automatically terminate active JWT sessions after 60 minutes of idle browser time.
                </div>
              </div>
              <Badge variant="success">Enforced</Badge>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card title="Notification Dispatch Channels" subtitle="Configure email digests, sprint updates, and emergency broadcasts" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  Email Notifications for Leave Approvals & Payroll Batches
                </span>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                  Immediate email alerts sent to managers whenever leave or expense requests are submitted.
                </p>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={slackAlerts}
                onChange={(e) => setSlackAlerts(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)' }}
              />
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-main)' }}>
                  Slack / Webhook Alerts for High-Priority Announcements
                </span>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0 }}>
                  Stream company-wide broadcast announcements directly into connected team channels.
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Button variant="primary" type="submit" iconPrefix={<Save size={16} />}>
            Save System Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
