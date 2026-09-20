'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft, RefreshCw, KeyRound, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '@/lib/auth-context';
import { getRouteAccessRequirement, normalizeRole, SYSTEM_ROLES, UserRole } from '@/lib/permissions';

interface AccessRestrictedViewProps {
  pathname: string;
}

export const AccessRestrictedView: React.FC<AccessRestrictedViewProps> = ({ pathname }) => {
  const router = useRouter();
  const { user, quickLogin } = useAuth();
  const [switching, setSwitching] = useState<string | null>(null);

  const currentRole = normalizeRole(user?.role);
  const currentRoleInfo = SYSTEM_ROLES[currentRole];
  const requirement = getRouteAccessRequirement(pathname);

  const handleQuickSwitch = async (role: UserRole) => {
    try {
      setSwitching(role);
      const res = await quickLogin(role);
      if (res.success) {
        // Refresh page to reload state with new privileges
        router.refresh();
      }
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        padding: '32px 16px',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          width: '100%',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl, 16px)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
          padding: '40px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}
      >
        {/* Animated Icon Ring */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EF4444',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)'
          }}
        >
          <ShieldAlert size={36} />
        </div>

        {/* Security Badge */}
        <Badge variant="danger" dot>
          RBAC Policy Enforced
        </Badge>

        {/* Heading & Target Module */}
        <div>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--color-text-main)',
              marginBottom: '8px'
            }}
          >
            Access Restricted by Role Policy
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: 0 }}>
            Attempted route: <code style={{ backgroundColor: 'var(--color-surface-soft)', padding: '2px 8px', borderRadius: '4px', color: 'var(--color-primary)' }}>{pathname}</code>
          </p>
        </div>

        {/* Notice Card */}
        <div
          style={{
            width: '100%',
            backgroundColor: 'var(--color-surface-soft)',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid var(--color-border-subtle)',
            padding: '18px 20px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Target Module:</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {requirement.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Your Current Role:</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#EF4444' }}>
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'} ({currentRoleInfo.displayName})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Required Clearance:</span>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-primary)' }}>
              {requirement.requiredRoles.join(' or ')}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '13.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
          This section contains sensitive organizational operations. In accordance with enterprise role segregation, your current tier has no clearance to inspect or alter this module.
        </p>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginTop: '6px' }}>
          <Button
            variant="primary"
            onClick={() => router.push('/portal/employee')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} />
            Go to My Cockpit (ESS)
          </Button>

          {currentRole !== 'employee' && (
            <Button
              variant="outline"
              onClick={() => router.push('/')}
            >
              Overview Dashboard
            </Button>
          )}
        </div>

        {/* Demo Role Switcher Simulator */}
        <div
          style={{
            width: '100%',
            marginTop: '12px',
            paddingTop: '20px',
            borderTop: '1px solid var(--color-border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <KeyRound size={14} color="var(--color-primary)" />
            Instant Role Simulation (Developer Switcher)
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickSwitch('owner')}
              disabled={switching !== null}
              style={{ fontSize: '12px' }}
            >
              {switching === 'owner' ? <RefreshCw size={12} className="spin" /> : '👑 Owner (Ataur)'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickSwitch('hr')}
              disabled={switching !== null}
              style={{ fontSize: '12px' }}
            >
              {switching === 'hr' ? <RefreshCw size={12} className="spin" /> : '👥 HR Admin (Alex)'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickSwitch('manager')}
              disabled={switching !== null}
              style={{ fontSize: '12px' }}
            >
              {switching === 'manager' ? <RefreshCw size={12} className="spin" /> : '💼 Manager (Sarah)'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickSwitch('employee')}
              disabled={switching !== null}
              style={{ fontSize: '12px' }}
            >
              {switching === 'employee' ? <RefreshCw size={12} className="spin" /> : '💻 Employee (Karim)'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
