'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SparkXLogo } from '../../../components/ui/SparkXLogo';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useAuth } from '../../../lib/auth-context';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Users,
  LayoutDashboard,
  Receipt,
  CheckSquare,
  AlertCircle,
  Building,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { user, login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(result.error || 'Invalid email or password');
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
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#EDF2F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px'
      }}
    >
      {/* Centered Dual-Panel Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '1040px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -15px rgba(27, 27, 58, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))'
        }}
      >
        {/* Left Side: Login Form */}
        <div
          style={{
            padding: '48px 44px 36px 44px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF'
          }}
        >
          <div>
            {/* Top Logo */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '20px'
              }}
            >
              <SparkXLogo size="lg" variant="light" />
            </div>

            {/* Header Titles */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2
                style={{
                  fontSize: '26px',
                  fontWeight: 800,
                  color: '#1B1B3A',
                  letterSpacing: '-0.02em',
                  margin: '0 0 6px 0'
                }}
              >
                Sign In
              </h2>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#5F6480',
                  margin: 0
                }}
              >
                Access all enterprise HR & squad management features
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#EF4444',
                  fontSize: '13px',
                  marginBottom: '18px'
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <Input
                  label="Work Email Address *"
                  type="email"
                  placeholder="e.g. name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  iconPrefix={<Mail size={16} />}
                  required
                />
              </div>

              <div>
                <Input
                  label="Password *"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  iconPrefix={<Lock size={16} />}
                  iconSuffix={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: showPassword ? '#6C5CE7' : '#959BB4',
                        transition: 'color 0.15s ease'
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    color: '#5F6480',
                    userSelect: 'none'
                  }}
                >
                  <input type="checkbox" defaultChecked style={{ accentColor: '#6C5CE7' }} />
                  Remember Me
                </label>

                <Link
                  href="/forgot-password"
                  style={{ color: '#6C5CE7', fontWeight: 600, textDecoration: 'none' }}
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                style={{
                  width: '100%',
                  marginTop: '4px',
                  backgroundColor: '#6C5CE7',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '15px'
                }}
                iconSuffix={<ArrowRight size={16} />}
              >
                Sign In
              </Button>
            </form>

            {/* Quick-Fill Demo Credentials */}
            <div
              style={{
                marginTop: '20px',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#F8F9FD',
                border: '1px solid #E4E7F4'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}
              >
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1B1B3A' }}>
                  ⚡ Quick-Fill Demo Credentials:
                </span>
                <span style={{ fontSize: '0.7rem', color: '#959BB4' }}>
                  Click to fill form
                </span>
              </div>

              {selectedQuickRole && (
                <div
                  style={{
                    marginBottom: '8px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(108, 92, 231, 0.08)',
                    border: '1px solid rgba(108, 92, 231, 0.25)',
                    fontSize: '0.72rem',
                    color: '#6C5CE7',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={13} />
                  <span>Credentials filled above. Click <strong>"Sign In"</strong> to enter.</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => handleSelectQuickRole('owner')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: selectedQuickRole === 'owner' ? '2px solid #6C5CE7' : '1px solid #E4E7F4',
                    backgroundColor: selectedQuickRole === 'owner' ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                    color: selectedQuickRole === 'owner' ? '#6C5CE7' : '#1B1B3A',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>👑</span>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700 }}>CEO / Owner</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.75 }}>owner@sparkx.io</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectQuickRole('hr')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: selectedQuickRole === 'hr' ? '2px solid #6C5CE7' : '1px solid #E4E7F4',
                    backgroundColor: selectedQuickRole === 'hr' ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                    color: selectedQuickRole === 'hr' ? '#6C5CE7' : '#1B1B3A',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>💼</span>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700 }}>HR Admin</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.75 }}>hr@sparkx.io</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectQuickRole('manager')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: selectedQuickRole === 'manager' ? '2px solid #6C5CE7' : '1px solid #E4E7F4',
                    backgroundColor: selectedQuickRole === 'manager' ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                    color: selectedQuickRole === 'manager' ? '#6C5CE7' : '#1B1B3A',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>👔</span>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700 }}>Dept Manager</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.75 }}>manager@sparkx.io</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectQuickRole('employee')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    border: selectedQuickRole === 'employee' ? '2px solid #6C5CE7' : '1px solid #E4E7F4',
                    backgroundColor: selectedQuickRole === 'employee' ? 'rgba(108, 92, 231, 0.08)' : '#FFFFFF',
                    color: selectedQuickRole === 'employee' ? '#6C5CE7' : '#1B1B3A',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '14px' }}>💻</span>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontWeight: 700 }}>Employee</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.75 }}>employee@sparkx.io</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Register Link */}
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#5F6480' }}>
              Don&apos;t have an organization yet?{' '}
              <Link href="/register" style={{ color: '#6C5CE7', fontWeight: 700, textDecoration: 'none' }}>
                Create a Workspace
              </Link>
            </div>
          </div>

          {/* Footer Copyright */}
          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: '#959BB4' }}>
            © 2026 SparkX Technologies Inc. All rights reserved.
          </div>
        </div>

        {/* Right Side: Feature Showcase Panel */}
        <div
          style={{
            background: 'linear-gradient(150deg, #111A2E 0%, #191E3B 40%, #1F1545 100%)',
            padding: '48px 42px',
            color: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Ambient Background Orbs */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(108, 92, 231, 0.3) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-50px',
              left: '-50px',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(79, 209, 255, 0.2) 0%, transparent 70%)',
              pointerEvents: 'none'
            }}
          />

          {/* Section Header */}
          <div style={{ position: 'relative', zIndex: 10, marginBottom: '32px' }}>
            <h3
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                margin: '0 0 8px 0'
              }}
            >
              Manage Your Enterprise with Ease
            </h3>
            <p
              style={{
                fontSize: '13.5px',
                color: '#94A3B8',
                margin: 0,
                lineHeight: 1.5
              }}
            >
              All-in-one digital platform for complete workforce and squad management
            </p>
          </div>

          {/* 5 Vertical Feature Cards */}
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Feature 1: Integrated Dashboard */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <LayoutDashboard size={20} color="#4FD1FF" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 3px 0', fontSize: '14.5px', fontWeight: 700, color: '#F8FAFC' }}>
                  Integrated Dashboard
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.45 }}>
                  Monitor attendance, team velocity, and organizational performance in one unified view.
                </p>
              </div>
            </div>

            {/* Feature 2: Squad & Hierarchy Management */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Users size={20} color="#A29BFE" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 3px 0', fontSize: '14.5px', fontWeight: 700, color: '#F8FAFC' }}>
                  Squad & Role Hierarchy
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.45 }}>
                  Structure operational teams, appoint squad leaders, and configure role-based access permissions.
                </p>
              </div>
            </div>

            {/* Feature 3: Automated Payroll */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Receipt size={20} color="#10B981" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 3px 0', fontSize: '14.5px', fontWeight: 700, color: '#F8FAFC' }}>
                  Automated Digital Payroll
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.45 }}>
                  Generate automated salary sheets, compute allowances, and download official payslips with one click.
                </p>
              </div>
            </div>

            {/* Feature 4: Multi-Assignee Project Tracking */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CheckSquare size={20} color="#F59E0B" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 3px 0', fontSize: '14.5px', fontWeight: 700, color: '#F8FAFC' }}>
                  Multi-Assignee Project Tracking
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.45 }}>
                  Track Kanban sprint tasks, assign multiple staff members, and hit project milestones on time.
                </p>
              </div>
            </div>

            {/* Feature 5: Enterprise-Grade Security */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={20} color="#38BDF8" />
              </div>
              <div>
                <h4 style={{ margin: '0 0 3px 0', fontSize: '14.5px', fontWeight: 700, color: '#F8FAFC' }}>
                  Enterprise-Grade Security
                </h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8', lineHeight: 1.45 }}>
                  Your organization data is protected with JWT token encryption and multi-tenant security architecture.
                </p>
              </div>
            </div>
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
            backgroundColor: '#EDF2F7',
            color: '#1B1B3A',
            fontWeight: 600
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
