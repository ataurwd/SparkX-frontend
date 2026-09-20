// SparkX Role-Based Access Control (RBAC) Engine

export type UserRole = 'owner' | 'hr' | 'manager' | 'employee';

export interface RoleInfo {
  id: UserRole;
  displayName: string;
  badgeLabel: string;
  description: string;
}

export const SYSTEM_ROLES: Record<UserRole, RoleInfo> = {
  owner: {
    id: 'owner',
    displayName: 'Owner & Executive',
    badgeLabel: 'Owner / CEO',
    description: 'Full unrestricted platform access, SaaS billing, platform administration, and executive radar'
  },
  hr: {
    id: 'hr',
    displayName: 'HR Administrator',
    badgeLabel: 'HR Admin',
    description: 'Recruitment (ATS), Attendance management, Leave approvals, Payroll batches, and Employee operations'
  },
  manager: {
    id: 'manager',
    displayName: 'Department Manager',
    badgeLabel: 'Manager',
    description: 'Team leadership, project/task allocation, team attendance & leave approvals, and review evaluations'
  },
  employee: {
    id: 'employee',
    displayName: 'Employee (ESS)',
    badgeLabel: 'Employee',
    description: 'Personal Cockpit, my attendance, leave self-service, task execution, personal payslips & expenses'
  }
};

/**
 * Normalizes any role string into a canonical UserRole tier.
 */
export function normalizeRole(roleStr?: string | null): UserRole {
  if (!roleStr) return 'employee';
  const r = roleStr.toLowerCase().trim();

  // 1. Direct key match
  if (r === 'owner') return 'owner';
  if (r === 'hr') return 'hr';
  if (r === 'manager') return 'manager';
  if (r === 'employee') return 'employee';

  // 2. HR Roles (evaluated BEFORE generic 'admin' because 'HR Admin' contains 'admin')
  if (
    ['hradmin', 'hr_admin', 'hr-admin', 'talent', 'people', 'recruiter', 'human resources'].some((k) => r.includes(k)) ||
    /\bhr\b/i.test(r)
  ) {
    return 'hr';
  }

  // 3. Manager Roles
  if (['manager', 'lead', 'team leader', 'supervisor', 'head of'].some((k) => r.includes(k))) {
    return 'manager';
  }

  // 4. Executive & System Admin (Owner)
  if (['owner', 'superadmin', 'admin', 'executive', 'ceo', 'director', 'founder'].some((k) => r.includes(k))) {
    return 'owner';
  }

  return 'employee';
}

/**
 * Route access policies mapped by role tier.
 * Prefix matching is used: e.g. '/recruitment' will cover all '/recruitment/*' routes.
 */
const ROLE_ALLOWED_ROUTES: Record<UserRole, string[]> = {
  owner: ['*'], // Full platform access
  hr: [
    '/',
    '/portal/employee',
    '/portal/manager',
    '/reports',
    '/employees',
    '/organization/teams',
    '/organization/departments',
    '/organization/roles',
    '/organization/org-chart',
    '/assets',
    '/projects',
    '/tasks',
    '/work-progress',
    '/attendance',
    '/attendance/manage',
    '/leave',
    '/leave/approvals',
    '/recruitment',
    '/onboarding',
    '/offboarding',
    '/payroll',
    '/expenses',
    '/performance/goals',
    '/performance/reviews',
    '/messages',
    '/announcements',
    '/calendar',
    '/meetings',
    '/notifications',
    '/settings'
  ],
  manager: [
    '/',
    '/portal/manager',
    '/portal/employee',
    '/reports',
    '/organization/teams',
    '/organization/org-chart',
    '/assets',
    '/projects',
    '/tasks',
    '/work-progress',
    '/attendance',
    '/leave',
    '/leave/approvals',
    '/expenses',
    '/payroll/my-payslips',
    '/payroll/payslips',
    '/performance/goals',
    '/performance/reviews',
    '/messages',
    '/announcements',
    '/calendar',
    '/meetings',
    '/notifications',
    '/settings'
  ],
  employee: [
    '/portal/employee',
    '/',
    '/projects',
    '/tasks',
    '/work-progress',
    '/attendance',
    '/leave',
    '/payroll/my-payslips',
    '/payroll/payslips',
    '/performance/goals',
    '/messages',
    '/announcements',
    '/calendar',
    '/meetings',
    '/notifications',
    '/settings'
  ]
};

/**
 * Explicit route restrictions by role.
 * Used for precise blocking (e.g. employee cannot access /payroll, but can access /payroll/my-payslips).
 */
const ROLE_BLOCKED_ROUTES: Record<UserRole, string[]> = {
  owner: [],
  hr: [
    '/platform',
    '/audit-logs',
    '/settings/subscription',
    '/executive/dashboard'
  ],
  manager: [
    '/recruitment',
    '/attendance/manage',
    '/onboarding',
    '/offboarding',
    '/payroll',
    '/organization/roles',
    '/organization/departments',
    '/employees',
    '/platform',
    '/audit-logs',
    '/settings/subscription',
    '/executive/dashboard'
  ],
  employee: [
    '/',
    '/recruitment',
    '/attendance/manage',
    '/leave/approvals',
    '/onboarding',
    '/offboarding',
    '/payroll',
    '/expenses',
    '/employees',
    '/organization',
    '/assets',
    '/portal/manager',
    '/executive',
    '/reports',
    '/performance/reviews',
    '/platform',
    '/audit-logs',
    '/settings/subscription'
  ]
};

/**
 * Checks whether a given path is permitted for the user's role.
 */
export function isRouteAllowedForRole(pathname: string, rawRole?: string | null): boolean {
  const role = normalizeRole(rawRole);
  if (role === 'owner') return true;

  const normalizedPath = pathname.replace(/\/$/, '') || '/';

  // Special allowance: individual payslips and my-payslips are inside /payroll path but allowed for employees & managers
  if (
    normalizedPath === '/payroll/my-payslips' ||
    normalizedPath.startsWith('/payroll/my-payslips/') ||
    normalizedPath === '/payroll/payslips' ||
    normalizedPath.startsWith('/payroll/payslips/')
  ) {
    return true;
  }

  // Check specific blocked patterns first
  const blockedList = ROLE_BLOCKED_ROUTES[role] || [];
  for (const blocked of blockedList) {
    if (blocked === '/') {
      if (normalizedPath === '/') return false;
    } else if (normalizedPath === blocked || normalizedPath.startsWith(`${blocked}/`)) {
      return false;
    }
  }

  // Check allowed list
  const allowedList = ROLE_ALLOWED_ROUTES[role] || [];
  for (const allowed of allowedList) {
    if (allowed === '*') return true;
    if (normalizedPath === allowed || normalizedPath.startsWith(`${allowed}/`)) {
      return true;
    }
  }

  return false;
}

/**
 * Returns human-friendly reason and required role for a blocked route.
 */
export function getRouteAccessRequirement(pathname: string): { title: string; requiredRoles: string[] } {
  const p = pathname.toLowerCase();

  if (p.includes('/recruitment')) {
    return { title: 'Recruitment & Applicant Tracking (ATS)', requiredRoles: ['HR Administrator', 'Owner'] };
  }
  if (p.includes('/payroll') && !p.includes('/my-payslips') && !p.includes('/payslips')) {
    return { title: 'Company Payroll & Batches', requiredRoles: ['HR Administrator', 'Finance Officer', 'Owner'] };
  }
  if (p.includes('/expenses')) {
    return { title: 'Corporate Expense Claims & Reconciliations', requiredRoles: ['Department Manager', 'Finance Manager', 'Owner'] };
  }
  if (p.includes('/attendance/manage')) {
    return { title: 'Manage Company Attendance', requiredRoles: ['HR Administrator', 'Department Manager', 'Owner'] };
  }
  if (p.includes('/leave/approvals')) {
    return { title: 'Leave Approvals Desk', requiredRoles: ['Department Manager', 'HR Administrator', 'Owner'] };
  }
  if (p.includes('/onboarding') || p.includes('/offboarding')) {
    return { title: 'Employee Lifecycle Operations', requiredRoles: ['HR Administrator', 'Owner'] };
  }
  if (p.includes('/organization/roles') || p.includes('/organization/departments')) {
    return { title: 'Enterprise Structure & Roles', requiredRoles: ['HR Administrator', 'Owner'] };
  }
  if (p.includes('/employees')) {
    return { title: 'Employee Records & Compensation Roster', requiredRoles: ['HR Administrator', 'Owner'] };
  }
  if (p.includes('/portal/manager')) {
    return { title: 'Department Manager Hub', requiredRoles: ['Department Manager', 'HR Administrator', 'Owner'] };
  }
  if (p.includes('/executive') || p.includes('/platform') || p.includes('/audit-logs')) {
    return { title: 'Executive Radar & System Administration', requiredRoles: ['Owner / Executive'] };
  }

  return { title: 'Management & Administrative Module', requiredRoles: ['HR Administrator', 'Manager', 'Owner'] };
}
