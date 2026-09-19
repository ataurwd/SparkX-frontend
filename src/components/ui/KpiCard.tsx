import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  iconBg?: string;
  progressPercentage?: number;
  glass?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBg = 'var(--color-primary-light)',
  progressPercentage,
  glass = false
}) => {
  return (
    <Card glass={glass} padding="md" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em'
            }}
          >
            {title}
          </span>
          <div
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--color-text-main)',
              marginTop: '6px',
              letterSpacing: '-0.02em',
              lineHeight: 1.1
            }}
          >
            {value}
          </div>
        </div>

        {icon && (
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
        {trend && (
          <Badge
            variant={trend.isPositive ? 'success' : 'danger'}
            dot
          >
            {trend.value}
          </Badge>
        )}
        {subtitle && (
          <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {subtitle}
          </span>
        )}
      </div>

      {typeof progressPercentage === 'number' && (
        <div
          style={{
            marginTop: '14px',
            width: '100%',
            height: '6px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--color-surface-soft)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, progressPercentage))}%`,
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-pill)',
              transition: 'width 0.5s ease'
            }}
          />
        </div>
      )}
    </Card>
  );
};
