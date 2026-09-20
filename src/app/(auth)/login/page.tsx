'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SparkXLogo } from '../../../components/ui/SparkXLogo';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { useAuth } from '../../../lib/auth-context';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  TrendingUp,
  AlertCircle,
  Building,
  UserCheck,
  Briefcase,
  Laptop,
  Check
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { user, login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuickRole, setSelectedQuickRole] = useState<string | null>(null);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      router.replace(redirectUrl);
    }
  }, [user, authLoading, router, redirectUrl]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await login({
      email,
      password,
      organizationSlug: orgSlug || undefined
    });

    if (result.success) {
      router.replace(redirectUrl);
    } else {
      setError(result.error || 'Invalid credentials');
      setIsLoading(false);
    }
  };

  const handleSelectQuickRole = (role: 'owner' | 'hr' | 'manager' | 'employee') => {
    const credentialsMap: Record<string, { email: string; pass: string }> = {
      owner: { email: 'owner@sparkx.io', pass: 'Password123!' },
      hr: { email: 'hr@sparkx.io', pass: 'Password123!' },
      manager: { email: 'manager@sparkx.io', pass: 'Password123!' },
      employee: { email: 'employee@sparkx.io', pass: 'Password123!' }
    };

    const cred = credentialsMap[role];
    if (cred) {
      setEmail(cred.email);
      setPassword(cred.pass);
      setOrgSlug('');
      setSelectedQuickRole(role);
      setError(null);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* Left Brand Showcase Section */}
      <div
        style={{
          flex: '1.1',
          background: 'linear-gradient(135deg, #1B1B3A 0%, #2D1B69 50%, #0F172A 100%)',
          padding: '48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative glowing background shapes */}
        <div
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(108, 92, 231, 0.4) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-60px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(79, 209, 255, 0.25) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}
        />

        {/* Top Header Logo – always dark variant since panel has dark background */}
        <div style={{ zIndex: 10 }}>
          <SparkXLogo size="lg" variant="dark" />
        </div>

        {/* Middle Feature Highlights */}
        <div style={{ zIndex: 10, maxWidth: '520px' }}>
          <Badge
            variant="primary"
            style={{
              backgroundColor: 'rgba(108, 92, 231, 0.3)',
              color: '#4FD1FF',
              border: '1px solid rgba(79, 209, 255, 0.3)',
              marginBottom: '16px'
            }}
          >
            Enterprise Multi-Tenant SaaS
          </Badge>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '16px'
            }}
          >
            Better Teams. Smarter Management.
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.85, lineHeight: 1.6, marginBottom: '32px' }}>
            Streamline your core HR, attendance, payroll runs, project execution, and executive intelligence
            in one unified, multi-tenant workspace.
          </p>

          {/* 4 Brand Pillars (from brand guidelines) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(108, 92, 231, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4FD1FF'
                }}
              >
                <Zap size={16} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Efficient Execution</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(108, 92, 231, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4FD1FF'
                }}
              >
                <Users size={16} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>People-Centric HR</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(108, 92, 231, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4FD1FF'
                }}
              >
                <ShieldCheck size={16} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Enterprise Reliable</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(108, 92, 231, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4FD1FF'
                }}
              >
                <TrendingUp size={16} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Scalable Growth</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ zIndex: 10, fontSize: '13px', opacity: 0.7 }}>
          © 2026 SparkX Technologies Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Card Section */}
      <div
        style={{
          flex: '0.9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          backgroundColor: 'var(--color-bg-base)'
        }}
      >
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '28px' }}>
            <h2
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: 'var(--color-text-main)',
                letterSpacing: '-0.02em'
              }}
            >
              Sign In to SparkX
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
              Enter your credentials or select an organization workspace.
            </p>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--color-danger)',
                fontSize: '13px',
                marginBottom: '20px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Work Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              iconPrefix={<Mail size={16} />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              iconPrefix={<Lock size={16} />}
              required
            />

            <Input
              label="Organization Workspace (Optional)"
              placeholder="e.g. sparkx-tech"
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              iconPrefix={<Building size={16} />}
              helperText="Leave empty to search by registered email"
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--color-primary)' }} />
                Keep me signed in
              </label>

              <Link href="/forgot-password" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              style={{ width: '100%', marginTop: '8px' }}
              iconSuffix={<ArrowRight size={16} />}
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Quick-Fill Demo Credentials Grid */}
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                ⚡ Quick-Fill Demo Credentials:
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                Click to auto-fill form
              </span>
            </div>

            {selectedQuickRole && (
              <div
                style={{
                  marginBottom: '10px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(108, 92, 231, 0.08)',
                  border: '1px solid rgba(108, 92, 231, 0.25)',
                  fontSize: '0.75rem',
                  color: 'var(--color-primary)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Check size={14} />
                <span>Credentials filled above. Click <strong>"Sign In to Workspace"</strong> to enter.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleSelectQuickRole('owner')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: selectedQuickRole === 'owner' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: selectedQuickRole === 'owner' ? 'rgba(108, 92, 231, 0.08)' : 'var(--color-surface-subtle)',
                  color: selectedQuickRole === 'owner' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '14px' }}>👑</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700 }}>CEO / Owner</div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>owner@sparkx.io</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickRole('hr')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: selectedQuickRole === 'hr' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: selectedQuickRole === 'hr' ? 'rgba(108, 92, 231, 0.08)' : 'var(--color-surface-subtle)',
                  color: selectedQuickRole === 'hr' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '14px' }}>💼</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700 }}>HR Admin</div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>hr@sparkx.io</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickRole('manager')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: selectedQuickRole === 'manager' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: selectedQuickRole === 'manager' ? 'rgba(108, 92, 231, 0.08)' : 'var(--color-surface-subtle)',
                  color: selectedQuickRole === 'manager' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '14px' }}>👔</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700 }}>Dept Manager</div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>manager@sparkx.io</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectQuickRole('employee')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: selectedQuickRole === 'employee' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: selectedQuickRole === 'employee' ? 'rgba(108, 92, 231, 0.08)' : 'var(--color-surface-subtle)',
                  color: selectedQuickRole === 'employee' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '14px' }}>💻</span>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700 }}>Employee</div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.8 }}>employee@sparkx.io</div>
                </div>
              </button>
            </div>
          </div>

          <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
            Don't have an organization yet?{' '}
            <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
              Create a Workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg-base)',
            color: 'var(--color-text-primary)'
          }}
        >
          Loading SparkX Workspace...
        </div>
      }
    >
      <LoginFormContent />
    </React.Suspense>
  );
}
