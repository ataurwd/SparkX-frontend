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
  Laptop
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { user, login, quickLogin, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quickRoleLoading, setQuickRoleLoading] = useState<string | null>(null);

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

  const handleQuickLogin = async (role: string) => {
    setError(null);
    setQuickRoleLoading(role);
    try {
      const result = await quickLogin(role);
      if (result.success) {
        router.replace(redirectUrl);
      } else {
        setError(result.error || 'Quick login failed');
        setQuickRoleLoading(null);
      }
    } catch (err: any) {
      setError(err.message || 'Quick login error');
      setQuickRoleLoading(null);
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

          {/* Google OAuth Option */}
          <div style={{ margin: '24px 0', position: 'relative', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'var(--color-border)' }} />
            <span
              style={{
                position: 'relative',
                backgroundColor: 'var(--color-bg-base)',
                padding: '0 12px',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              Or Continue With
            </span>
          </div>

          <Button
            type="button"
            variant="secondary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => handleQuickLogin('owner')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign In with Google
          </Button>

          {/* 1-Click Quick Login Grid */}
          <div
            style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                ⚡ 1-Click Quick Logins:
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                Instant role access
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                disabled={!!quickRoleLoading}
                onClick={() => handleQuickLogin('owner')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: quickRoleLoading === 'owner' ? '#6C5CE7' : 'var(--color-surface-subtle)',
                  color: quickRoleLoading === 'owner' ? '#FFFFFF' : 'var(--color-text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: quickRoleLoading ? 'not-allowed' : 'pointer',
                  textAlign: 'left'
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
                disabled={!!quickRoleLoading}
                onClick={() => handleQuickLogin('hr')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: quickRoleLoading === 'hr' ? '#6C5CE7' : 'var(--color-surface-subtle)',
                  color: quickRoleLoading === 'hr' ? '#FFFFFF' : 'var(--color-text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: quickRoleLoading ? 'not-allowed' : 'pointer',
                  textAlign: 'left'
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
                disabled={!!quickRoleLoading}
                onClick={() => handleQuickLogin('manager')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: quickRoleLoading === 'manager' ? '#6C5CE7' : 'var(--color-surface-subtle)',
                  color: quickRoleLoading === 'manager' ? '#FFFFFF' : 'var(--color-text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: quickRoleLoading ? 'not-allowed' : 'pointer',
                  textAlign: 'left'
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
                disabled={!!quickRoleLoading}
                onClick={() => handleQuickLogin('employee')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: quickRoleLoading === 'employee' ? '#6C5CE7' : 'var(--color-surface-subtle)',
                  color: quickRoleLoading === 'employee' ? '#FFFFFF' : 'var(--color-text-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: quickRoleLoading ? 'not-allowed' : 'pointer',
                  textAlign: 'left'
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
