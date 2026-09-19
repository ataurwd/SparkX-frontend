import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconPrefix?: React.ReactNode;
  iconSuffix?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  iconPrefix,
  iconSuffix,
  required,
  style,
  className = '',
  ...props
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--color-surface)',
          border: `1.5px solid ${error ? 'var(--color-danger)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0 14px',
          height: '42px',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {iconPrefix && (
          <span style={{ marginRight: '10px', color: 'var(--color-text-muted)', display: 'flex' }}>
            {iconPrefix}
          </span>
        )}
        <input
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: '14px',
            color: 'var(--color-text-main)',
            height: '100%',
            ...style
          }}
          required={required}
          className={className}
          {...props}
        />
        {iconSuffix && (
          <span style={{ marginLeft: '10px', color: 'var(--color-text-muted)', display: 'flex' }}>
            {iconSuffix}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: '12px', color: 'var(--color-danger)', fontWeight: 500 }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
};
