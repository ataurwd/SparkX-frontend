'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SparkXLogo } from '../../../components/ui/SparkXLogo';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { useAuth } from '../../../lib/auth-context';
import {
  Building,
  Mail,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [orgName, setOrgName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    const result = await register({
      organizationName: orgName,
      firstName,
      lastName,
      email,
      password
    });

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Failed to create organization');
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-base)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px'
      }}
    >
      <div style={{ marginBottom: '28px' }}>
        <SparkXLogo size="lg" />
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          boxShadow: 'var(--shadow-card)',
          border: '1px solid var(--color-border)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Badge variant="primary" dot style={{ marginBottom: '8px' }}>
            14-Day Free Enterprise Trial
          </Badge>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: 'var(--color-text-main)',
              letterSpacing: '-0.02em'
            }}
          >
            Create Your Company Workspace
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Set up your organization tenant and administrator account.
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

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Company / Organization Name"
            placeholder="e.g. SparkX Global Technologies"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            iconPrefix={<Building size={16} />}
            helperText="This provisions your dedicated multi-tenant database workspace"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <Input
              label="First Name"
              placeholder="Rubel"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              iconPrefix={<User size={16} />}
              required
            />
            <Input
              label="Last Name"
              placeholder="Hasan"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <Input
            label="Work Email Address"
            type="email"
            placeholder="admin@sparkx.corp"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            iconPrefix={<Mail size={16} />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            iconPrefix={<Lock size={16} />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '10px' }}
            iconSuffix={<ArrowRight size={16} />}
          >
            Create Workspace & Start
          </Button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13.5px', color: 'var(--color-text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
