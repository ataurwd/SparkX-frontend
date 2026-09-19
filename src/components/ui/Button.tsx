import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  iconPrefix?: React.ReactNode;
  iconSuffix?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  iconPrefix,
  iconSuffix,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const getBaseStyles = (): React.CSSProperties => {
    const isIconOnly = variant === 'icon';

    const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
      sm: {
        height: '32px',
        padding: isIconOnly ? '0' : '0 12px',
        width: isIconOnly ? '32px' : 'auto',
        fontSize: '13px',
        gap: '6px',
        borderRadius: 'var(--radius-sm)'
      },
      md: {
        height: '42px',
        padding: isIconOnly ? '0' : '0 18px',
        width: isIconOnly ? '42px' : 'auto',
        fontSize: '14px',
        gap: '8px',
        borderRadius: 'var(--radius-md)'
      },
      lg: {
        height: '48px',
        padding: isIconOnly ? '0' : '0 24px',
        width: isIconOnly ? '48px' : 'auto',
        fontSize: '15px',
        gap: '10px',
        borderRadius: 'var(--radius-lg)'
      }
    };

    const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
      primary: {
        backgroundColor: 'var(--color-primary)',
        color: '#FFFFFF',
        border: 'none',
        boxShadow: '0 2px 8px rgba(108, 92, 231, 0.25)',
        fontWeight: 600
      },
      secondary: {
        backgroundColor: 'var(--color-surface-soft)',
        color: 'var(--color-primary)',
        border: '1px solid var(--color-border)',
        fontWeight: 600
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--color-primary)',
        border: '1.5px solid var(--color-primary)',
        fontWeight: 600
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--color-text-secondary)',
        border: 'none',
        fontWeight: 500
      },
      danger: {
        backgroundColor: 'var(--color-danger)',
        color: '#FFFFFF',
        border: 'none',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
        fontWeight: 600
      },
      icon: {
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text-secondary)',
        border: '1px solid var(--color-border)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'var(--radius-md)'
      }
    };

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.65 : 1,
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      outline: 'none',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style
    };
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={getBaseStyles()}
      className={className}
      {...props}
    >
      {isLoading ? (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.75s linear infinite'
          }}
        />
      ) : (
        <>
          {iconPrefix && <span style={{ display: 'flex', alignItems: 'center' }}>{iconPrefix}</span>}
          {children}
          {iconSuffix && <span style={{ display: 'flex', alignItems: 'center' }}>{iconSuffix}</span>}
        </>
      )}
    </button>
  );
};
