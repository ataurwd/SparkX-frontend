'use client';

import React from 'react';
import { useTheme } from '../../lib/theme-context';

export interface SparkXLogoProps {
  size?: 'sm' | 'md' | 'lg';
  /**
   * Override the theme detection and force a specific logo variant.
   * Use 'dark' when the logo sits on a dark background regardless of the
   * current app theme (e.g. the login page left panel).
   * Use 'light' for white/light backgrounds (payslip print doc etc).
   */
  variant?: 'auto' | 'dark' | 'light';
  /** @deprecated No longer used – kept for backward compatibility */
  showSubtitle?: boolean;
}

const sizeMap = {
  sm: { width: 100, height: 36 },
  md: { width: 100, height: 50 },
  lg: { width: 190, height: 68 },
};

export const SparkXLogo: React.FC<SparkXLogoProps> = ({
  size = 'md',
  variant = 'auto',
}) => {
  const { theme } = useTheme();
  const { width, height } = sizeMap[size];

  const resolvedVariant =
    variant !== 'auto' ? variant : theme === 'dark' ? 'dark' : 'light';

  // Both PNGs now have transparent backgrounds:
  // logo-light.png = dark navy text + teal X  (for light mode surfaces)
  // logo-dark.png  = white text + teal X      (for dark mode surfaces)
  const src =
    resolvedVariant === 'dark'
      ? '/images/logo-dark.png'
      : '/images/logo-light.png';

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="SparkX – HR & Company Management"
      width={width}
      height={height}
      style={{ objectFit: 'contain', display: 'block' }}
    />
  );
};
