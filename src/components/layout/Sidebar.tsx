'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SparkXLogo } from '../ui/SparkXLogo';
import {
  LayoutDashboard,
  Users,
  Building2,
  Network,
  FolderKanban,
  CheckSquare,
  TrendingUp,
  Clock,
  CalendarDays,
  DollarSign,
  Target,
  Award,
  MessageSquare,
  Bell,
  Calendar,
  FileText,
  ShieldCheck,
  CreditCard,
  Settings,
  Sparkles,
  Server,
  UserCheck,
  ChevronRight,
  Receipt,
  Laptop,
  UserMinus
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = true
}) => {
  const pathname = usePathname() || '/';

  const navGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { name: 'Dashboard', href: '/', icon: <LayoutDashboard size={18} /> },
        { name: 'My Cockpit (ESS)', href: '/portal/employee', icon: <UserCheck size={18} /> },
        { name: 'Manager Hub', href: '/portal/manager', icon: <Users size={18} /> },
        { name: 'Executive Radar', href: '/executive/dashboard', icon: <Sparkles size={18} /> },
        { name: 'Reports & Analytics', href: '/reports', icon: <FileText size={18} /> }
      ]
    },
    {
      group: 'Organization',
      items: [
        { name: 'Employees', href: '/employees', icon: <Users size={18} /> },
        { name: 'Departments', href: '/organization/departments', icon: <Building2 size={18} /> },
        { name: 'Roles & Assignments', href: '/organization/roles', icon: <ShieldCheck size={18} /> },
        { name: 'Org Chart', href: '/organization/org-chart', icon: <Network size={18} /> },
        { name: 'Asset Inventory', href: '/assets', icon: <Laptop size={18} /> }
      ]
    },
    {
      group: 'Work Execution',
      items: [
        { name: 'Projects', href: '/projects', icon: <FolderKanban size={18} /> },
        { name: 'Tasks', href: '/tasks', icon: <CheckSquare size={18} />, badge: 4 },
        { name: 'Work Progress', href: '/work-progress', icon: <TrendingUp size={18} /> }
      ]
    },
    {
      group: 'HR Operations',
      items: [
        { name: 'My Attendance', href: '/attendance', icon: <Clock size={18} /> },
        { name: 'Manage Attendance', href: '/attendance/manage', icon: <CheckSquare size={18} /> },
        { name: 'Leave Self-Service', href: '/leave', icon: <CalendarDays size={18} /> },
        { name: 'Leave Approvals', href: '/leave/approvals', icon: <ShieldCheck size={18} />, badge: 2 },
        { name: 'Recruitment (ATS)', href: '/recruitment/jobs', icon: <FileText size={18} /> },
        { name: 'Onboarding', href: '/onboarding', icon: <UserCheck size={18} /> },
        { name: 'Offboarding', href: '/offboarding', icon: <UserMinus size={18} /> }
      ]
    },
    {
      group: 'Finance & Payroll',
      items: [
        { name: 'Payroll & Batches', href: '/payroll', icon: <DollarSign size={18} /> },
        { name: 'Expense Claims', href: '/expenses', icon: <Receipt size={18} /> },
        { name: 'My Payslips', href: '/payroll/my-payslips', icon: <FileText size={18} /> }
      ]
    },
    {
      group: 'Performance',
      items: [
        { name: 'OKRs & Goals', href: '/performance/goals', icon: <Target size={18} /> },
        { name: 'Performance Reviews', href: '/performance/reviews', icon: <Award size={18} /> }
      ]
    },
    {
      group: 'Communication',
      items: [
        { name: 'Team Chat', href: '/messages', icon: <MessageSquare size={18} />, badge: 3 },
        { name: 'Announcements', href: '/announcements', icon: <Bell size={18} /> },
        { name: 'Company Calendar', href: '/calendar', icon: <Calendar size={18} /> },
        { name: 'Meeting Minutes', href: '/meetings', icon: <CheckSquare size={18} /> },
        { name: 'Notifications', href: '/notifications', icon: <Bell size={18} /> }
      ]
    },
    {
      group: 'System & Platform',
      items: [
        { name: 'Platform Admin', href: '/platform', icon: <Server size={18} /> },
        { name: 'Audit Logs', href: '/audit-logs', icon: <ShieldCheck size={18} /> },
        { name: 'Design System', href: '/design-system', icon: <Sparkles size={18} /> },
        { name: 'SaaS Subscription', href: '/settings/subscription', icon: <CreditCard size={18} /> },
        { name: 'Settings', href: '/settings', icon: <Settings size={18} /> }
      ]
    }
  ];

  return (
    <aside
      className="no-print"
      style={{
        width: 'var(--sidebar-width)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.3s ease'
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          borderBottom: '1px solid var(--color-border-subtle)'
        }}
      >
        <SparkXLogo size="md" />
      </div>

      {/* Navigation Scrollable Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 14px'
        }}
      >
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} style={{ marginBottom: '18px' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '0 12px',
                marginBottom: '6px'
              }}
            >
              {group.group}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13.5px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                      backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                      boxShadow: isActive ? '0 2px 8px rgba(108, 92, 231, 0.25)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--color-surface-soft)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          color: isActive ? '#FFFFFF' : 'inherit'
                        }}
                      >
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        style={{
                          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--color-primary-light)',
                          color: isActive ? '#FFFFFF' : 'var(--color-primary)',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '1px 7px',
                          borderRadius: 'var(--radius-pill)',
                          lineHeight: 1.4
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--color-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'var(--color-surface-soft)'
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '14px',
            flexShrink: 0
          }}
        >
          JD
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            John Doe
          </div>
          <div
            style={{
              fontSize: '11px',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            HR Director
          </div>
        </div>
        <ChevronRight size={16} color="var(--color-text-muted)" />
      </div>
    </aside>
  );
};
