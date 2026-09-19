'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from './api';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: string;
  permissions: string[];
}

export interface OrganizationInfo {
  id: string;
  name: string;
  slug: string;
  currency?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  organization: OrganizationInfo | null;
  isLoading: boolean;
  login: (data: any) => Promise<{ success: boolean; error?: string }>;
  register: (data: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('sparkx_access_token') : null;
    if (!token) {
      // Default demo mock user for standalone frontend preview
      setUser({
        id: 'demo_user_1',
        email: 'amelia.demane@sparkx.corp',
        firstName: 'Amelia',
        lastName: 'Demane',
        role: 'Owner',
        permissions: ['*'],
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
      });
      setOrganization({
        id: 'demo_org_1',
        name: 'SparkX Global Tech',
        slug: 'sparkx-global',
        currency: 'USD'
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await apiRequest('/auth/me');
      if (res.success && res.data) {
        setUser(res.data.user);
        setOrganization(res.data.organization);
      }
    } catch (err) {
      console.warn('[AuthContext] Failed to fetch current user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: any) => {
    setIsLoading(true);
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (res.success && res.data) {
      localStorage.setItem('sparkx_access_token', res.data.tokens.accessToken);
      localStorage.setItem('sparkx_refresh_token', res.data.tokens.refreshToken);
      setUser(res.data.user);
      setOrganization(res.data.organization);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: res.error || 'Invalid credentials' };
  };

  const register = async (formData: any) => {
    setIsLoading(true);
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData)
    });

    if (res.success && res.data) {
      localStorage.setItem('sparkx_access_token', res.data.tokens.accessToken);
      localStorage.setItem('sparkx_refresh_token', res.data.tokens.refreshToken);
      setUser(res.data.user);
      setOrganization(res.data.organization);
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: res.error || 'Registration failed' };
  };

  const logout = async () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('sparkx_refresh_token') : null;
    if (refreshToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      });
    }
    localStorage.removeItem('sparkx_access_token');
    localStorage.removeItem('sparkx_refresh_token');
    setUser(null);
    setOrganization(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'Owner' || user.role === 'Super Admin') return true;
    return user.permissions.includes(permission) || user.permissions.includes('*');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        isLoading,
        login,
        register,
        logout,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
