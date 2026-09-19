import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  glass?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  glass = false,
  padding = 'md',
  style,
  className = '',
  onClick
}) => {
  const paddingMap = {
    none: '0',
    sm: '14px',
    md: '20px',
    lg: '28px'
  };

  const cardStyle: React.CSSProperties = {
    background: glass ? 'var(--gradient-glass)' : 'var(--color-surface)',
    backdropFilter: glass ? 'var(--glass-blur)' : 'none',
    WebkitBackdropFilter: glass ? 'var(--glass-blur)' : 'none',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ...style
  };

  return (
    <div className={className} style={cardStyle} onClick={onClick}>
      {(title || subtitle || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${paddingMap[padding]} ${paddingMap[padding]} 14px ${paddingMap[padding]}`,
            borderBottom: '1px solid var(--color-border-subtle)'
          }}
        >
          <div>
            {title && (
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--color-text-main)',
                  letterSpacing: '-0.01em'
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  marginTop: '2px'
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div style={{ padding: paddingMap[padding] }}>{children}</div>
    </div>
  );
};
