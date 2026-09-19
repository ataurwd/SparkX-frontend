import React from 'react';

export interface SparkXLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const SparkXLogo: React.FC<SparkXLogoProps> = ({
  size = 'md',
  showSubtitle = true
}) => {
  const sizeMap = {
    sm: { icon: 28, text: '18px', sub: '9px', gap: '8px' },
    md: { icon: 36, text: '22px', sub: '10px', gap: '10px' },
    lg: { icon: 48, text: '28px', sub: '12px', gap: '12px' }
  };

  const { icon, text, sub, gap } = sizeMap[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap, textDecoration: 'none' }}>
      {/* Stylized SparkX S Icon */}
      <div
        style={{
          width: `${icon}px`,
          height: `${icon}px`,
          borderRadius: size === 'sm' ? '8px' : '10px',
          background: 'linear-gradient(135deg, #6C5CE7 0%, #4FD1FF 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <svg
          width={icon * 0.65}
          height={icon * 0.65}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized S with dynamic spark slash */}
          <path
            d="M17 7C17 4.79086 15.2091 3 13 3H8C5.79086 3 4 4.79086 4 7C4 9.20914 5.79086 11 8 11H16C18.2091 11 20 12.7909 20 15C20 17.2091 18.2091 19 16 19H11C8.79086 19 7 17.2091 7 15"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="13.5"
            y1="4.5"
            x2="17.5"
            y2="10.5"
            stroke="#4FD1FF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Brand Text */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              fontSize: text,
              fontWeight: 800,
              color: 'var(--color-text-main)',
              letterSpacing: '-0.03em',
              lineHeight: 1
            }}
          >
            Spark
          </span>
          <span
            style={{
              fontSize: text,
              fontWeight: 800,
              color: 'var(--color-secondary)',
              letterSpacing: '-0.03em',
              lineHeight: 1
            }}
          >
            X
          </span>
        </div>
        {showSubtitle && (
          <span
            style={{
              fontSize: sub,
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: '3px',
              lineHeight: 1
            }}
          >
            HR & Company OS
          </span>
        )}
      </div>
    </div>
  );
};
