import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg' | string;
  icon?: React.ReactNode;
  dot?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  dot = false,
  style,
  className = '',
  onClick
}) => {
  const getBadgeStyles = (): { badge: React.CSSProperties; dotColor: string } => {
    switch (variant) {
      case 'success':
        return {
          badge: {
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          },
          dotColor: 'var(--color-success)'
        };
      case 'warning':
        return {
          badge: {
            backgroundColor: 'var(--color-warning-bg)',
            color: 'var(--color-warning)',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          },
          dotColor: 'var(--color-warning)'
        };
      case 'danger':
        return {
          badge: {
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          },
          dotColor: 'var(--color-danger)'
        };
      case 'info':
        return {
          badge: {
            backgroundColor: 'var(--color-info-bg)',
            color: 'var(--color-info)',
            border: '1px solid rgba(14, 165, 233, 0.2)'
          },
          dotColor: 'var(--color-info)'
        };
      case 'primary':
        return {
          badge: {
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            border: '1px solid rgba(108, 92, 231, 0.2)'
          },
          dotColor: 'var(--color-primary)'
        };
      case 'neutral':
      default:
        return {
          badge: {
            backgroundColor: 'var(--color-surface-soft)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)'
          },
          dotColor: 'var(--color-text-muted)'
        };
    }
  };

  const { badge, dotColor } = getBadgeStyles();

  return (
    <span
      className={className}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: 'var(--radius-pill)',
        lineHeight: 1.3,
        letterSpacing: '0.01em',
        ...badge,
        ...style
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            flexShrink: 0
          }}
        />
      )}
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </span>
  );
};
