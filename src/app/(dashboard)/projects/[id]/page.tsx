'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Kanban,
  List,
  Milestone,
  Users,
  ChevronRight,
  MoveRight,
  DollarSign,
  GripVertical,
  UserCheck,
  UserPlus,
  CheckSquare,
  Square,
  X,
  User,
  MessageSquare,
  Send,
  Trash2,
  ShieldAlert,
  Save,
  Check,
  FileText
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

export interface Assignee {
  _id?: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  employeeCode?: string;
  role?: string;
  designationId?: { title: string };
  email?: string;
}

export interface SubtaskItem {
  _id?: string;
  title: string;
  completed: boolean;
}

export interface TaskComment {
  _id?: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  content: string;
  createdAt: string;
}

interface TaskItem {
  _id: string;
  taskNumber: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  estimatedHours: number;
  loggedHours: number;
  assignees: Assignee[];
  subtasks?: SubtaskItem[];
  comments?: TaskComment[];
  tags: string[];
}

interface MilestoneItem {
  _id?: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface ProjectDetail {
  _id: string;
  name: string;
  code: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  budget: number;
  currency: string;
  progress: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  blockedTasks: number;
  startDate: string;
  endDate: string;
  milestones: MilestoneItem[];
  departmentId?: { name: string; code: string };
  managerId?: { firstName: string; lastName: string; avatarUrl?: string };
  members: { firstName: string; lastName: string; avatarUrl?: string }[];
}

const FALLBACK_PROJECTS: ProjectDetail[] = [
  {
    _id: 'proj-demo-1',
    name: 'SparkX Cloud Native Infrastructure Modernization',
    code: 'INFRA-2026',
    description: 'Migrating multi-tenant microservices to auto-scaling Kubernetes cluster with 99.99% uptime SLA.',
    status: 'active',
    priority: 'high',
    budget: 85000,
    currency: 'USD',
    progress: 72,
    totalTasks: 28,
    completedTasks: 20,
    inProgressTasks: 5,
    blockedTasks: 1,
    startDate: '2026-08-01',
    endDate: '2026-11-30',
    departmentId: { name: 'Engineering & Technology', code: 'ENG' },
    managerId: { firstName: 'Marcus', lastName: 'Vance' },
    members: [
      { firstName: 'Alex', lastName: 'Rivera' },
      { firstName: 'Sophia', lastName: 'Chen' },
      { firstName: 'Marcus', lastName: 'Vance' }
    ],
    milestones: [
      { title: 'Kubernetes Cluster Provisioning (EKS/GKE)', dueDate: '2026-09-01', completed: true },
      { title: 'Service Mesh & Vault Ingress Setup', dueDate: '2026-10-15', completed: true },
      { title: 'Zero-downtime Blue/Green Production Cutover', dueDate: '2026-11-25', completed: false }
    ]
  },
  {
    _id: 'proj-demo-2',
    name: 'Enterprise Payroll & Tax Automation Engine 2.0',
    code: 'FIN-PAY',
    description: 'Automated 30-day payroll batch calculation, statutory deduction rules, and PDF payslip delivery.',
    status: 'active',
    priority: 'urgent',
    budget: 62000,
    currency: 'USD',
    progress: 58,
    totalTasks: 19,
    completedTasks: 11,
    inProgressTasks: 4,
    blockedTasks: 0,
    startDate: '2026-08-15',
    endDate: '2026-12-15',
    departmentId: { name: 'Finance & Accounting', code: 'FIN' },
    managerId: { firstName: 'Sophia', lastName: 'Chen' },
    members: [
      { firstName: 'Elena', lastName: 'Rostova' },
      { firstName: 'Sarah', lastName: 'Lin' }
    ],
    milestones: [
      { title: 'Tax Formula & Deduction Rules Engine', dueDate: '2026-09-20', completed: true },
      { title: 'Automated Bank Batch Wire Dispatcher', dueDate: '2026-10-30', completed: false },
      { title: 'Employee Self-Service Payslip Vault & PDF Gen', dueDate: '2026-12-05', completed: false }
    ]
  },
  {
    _id: 'proj-demo-3',
    name: 'Unified Design System & Dark/Light Accessibility Suite',
    code: 'DS-ACC',
    description: 'Comprehensive design tokens, high contrast WCAG 2.1 AAA dark mode and responsive layout engine.',
    status: 'completed',
    priority: 'medium',
    budget: 34000,
    currency: 'USD',
    progress: 100,
    totalTasks: 14,
    completedTasks: 14,
    inProgressTasks: 0,
    blockedTasks: 0,
    startDate: '2026-07-01',
    endDate: '2026-09-10',
    departmentId: { name: 'Product & Design', code: 'PRD' },
    managerId: { firstName: 'Alex', lastName: 'Rivera' },
    members: [
      { firstName: 'Sophia', lastName: 'Chen' },
      { firstName: 'Marcus', lastName: 'Vance' }
    ],
    milestones: [
      { title: 'Figma Tokens & CSS Variables Audit', dueDate: '2026-07-20', completed: true },
      { title: 'Component Library WCAG 2.1 AAA Compliance Test', dueDate: '2026-08-15', completed: true },
      { title: 'Dark Mode Switcher & Performance Benchmark', dueDate: '2026-09-05', completed: true }
    ]
  }
];

export const FALLBACK_EMPLOYEES: Assignee[] = [
  {
    _id: '6aaedc413e30239cef20aaa2',
    firstName: 'Ataur Rahman',
    lastName: 'Asif',
    employeeCode: 'SPX-0005',
    role: 'Team Lead',
    avatarUrl: 'https://i.ibb.co/S7MTNJ5k/Rectangle-74-1-jpg.jpg'
  },
  {
    _id: '6aaedb633e30239cef20a8cd',
    firstName: 'Marcus',
    lastName: 'Vance',
    employeeCode: 'SPX-0101',
    role: 'Lead Architect',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  },
  {
    _id: '6aaedb633e30239cef20a8d0',
    firstName: 'Sophia',
    lastName: 'Chen',
    employeeCode: 'SPX-0102',
    role: 'Senior Product Designer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'
  },
  {
    _id: '6aaedb633e30239cef20a8d3',
    firstName: 'Alex',
    lastName: 'Rivera',
    employeeCode: 'SPX-0103',
    role: 'Staff Backend Architect',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
  },
  {
    _id: '6aaedb633e30239cef20a8d6',
    firstName: 'Elena',
    lastName: 'Rostova',
    employeeCode: 'SPX-0104',
    role: 'People Ops Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
  },
  {
    _id: '6aaf76322eea1a4912375b61',
    firstName: 'Hr',
    lastName: 'Leader',
    employeeCode: 'SPX-0006',
    role: 'HR Director',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop'
  }
];

const FALLBACK_TASKS: TaskItem[] = [
  {
    _id: 'tsk-demo-1',
    taskNumber: 'TSK-101',
    title: 'Provision Multi-AZ Terraform Kubernetes Clusters',
    description: 'Set up resilient multi-region infrastructure using infrastructure-as-code.',
    status: 'completed',
    priority: 'high',
    dueDate: '2026-08-20',
    estimatedHours: 16,
    loggedHours: 18,
    assignees: [FALLBACK_EMPLOYEES[1]],
    subtasks: [
      { title: 'VPC Peering & Transit Gateway setup', completed: true },
      { title: 'Helm chart validation on EKS/GKE', completed: true },
      { title: 'Kube-bench CIS benchmark audit', completed: true }
    ],
    comments: [
      {
        _id: 'cmt-demo-1',
        authorName: 'Marcus Vance',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        authorRole: 'Lead Architect',
        content: 'All Terraform manifests validated with tfsec. Multi-AZ ingress cluster is fully operational.',
        createdAt: '2026-08-19T14:32:00.000Z'
      },
      {
        _id: 'cmt-demo-2',
        authorName: 'Ataur Rahman Asif',
        authorAvatar: 'https://i.ibb.co/S7MTNJ5k/Rectangle-74-1-jpg.jpg',
        authorRole: 'Team Lead',
        content: 'Benchmark tests look great! Ready to proceed to service mesh stage.',
        createdAt: '2026-08-20T09:15:00.000Z'
      }
    ],
    tags: ['DevOps', 'Terraform', 'Kubernetes']
  },
  {
    _id: 'tsk-demo-2',
    taskNumber: 'TSK-102',
    title: 'Configure Vault Secret Rotation for Database Endpoints',
    description: 'Eliminate hardcoded secrets and automate dynamic MongoDB credentials.',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: '2026-10-05',
    estimatedHours: 12,
    loggedHours: 6,
    assignees: [FALLBACK_EMPLOYEES[3]],
    subtasks: [
      { title: 'Rotate Atlas API admin credentials', completed: true },
      { title: 'Automated leasing lease expiration cron', completed: false },
      { title: 'Integration testing with staging backend', completed: false }
    ],
    comments: [
      {
        _id: 'cmt-demo-3',
        authorName: 'Alex Rivera',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
        authorRole: 'Staff Backend Architect',
        content: 'Atlas dynamic database secrets engine is configured in Vault. Testing lease renewals now.',
        createdAt: '2026-09-18T11:20:00.000Z'
      }
    ],
    tags: ['Security', 'Vault', 'Backend']
  },
  {
    _id: 'tsk-demo-3',
    taskNumber: 'TSK-103',
    title: 'Design Istio Envoy Canary Routing Rules',
    description: 'Enable 5% canary traffic slicing for staging zero-downtime updates.',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-10-25',
    estimatedHours: 8,
    loggedHours: 0,
    assignees: [FALLBACK_EMPLOYEES[2]],
    subtasks: [
      { title: 'Define VirtualService weights', completed: false },
      { title: 'Validate HTTP headers matching', completed: false }
    ],
    comments: [],
    tags: ['Networking', 'Istio']
  },
  {
    _id: 'tsk-demo-4',
    taskNumber: 'TSK-104',
    title: 'Verify Prometheus & Grafana Dashboard SLA Alerts',
    description: 'Set up alertmanager webhooks for p99 latency regressions > 300ms.',
    status: 'review',
    priority: 'high',
    dueDate: '2026-11-02',
    estimatedHours: 10,
    loggedHours: 8,
    assignees: [FALLBACK_EMPLOYEES[0]],
    subtasks: [
      { title: 'Install NodeExporter and kube-state-metrics', completed: true },
      { title: 'Configure Discord & Slack webhook alert triggers', completed: true },
      { title: 'Stress test burst traffic latency spikes', completed: false }
    ],
    comments: [
      {
        _id: 'cmt-demo-4',
        authorName: 'Elena Rostova',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        authorRole: 'People Ops Lead',
        content: 'Please verify the team alert notification recipients are up to date.',
        createdAt: '2026-09-19T16:45:00.000Z'
      }
    ],
    tags: ['Observability', 'Monitoring']
  }
];

export default function ProjectWorkspacePage() {
  const params = useParams();
  const id = params?.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [employees, setEmployees] = useState<Assignee[]>(FALLBACK_EMPLOYEES);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'milestones'>('kanban');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [taskCreating, setTaskCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drag and drop states
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskItem['status'] | null>(null);

  // Quick assignee picker state
  const [activeAssigneePickerTaskId, setActiveAssigneePickerTaskId] = useState<string | null>(null);

  // New Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskStatus, setTaskStatus] = useState<TaskItem['status']>('todo');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskEstimatedHours, setTaskEstimatedHours] = useState(8);
  const [taskAssigneeIds, setTaskAssigneeIds] = useState<string[]>([FALLBACK_EMPLOYEES[0]._id || '']);
  const [newSubtasks, setNewSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');

  // User Auth & Role Check for Task Permissions (Only HR & Upper Management can delete tasks, anyone can add/comment)
  const { user } = useAuth();
  const userRole = (user?.role || 'Owner').toLowerCase();
  const isHrOrUpperManagement = ['superadmin', 'admin', 'hradmin', 'hr', 'executive', 'owner', 'manager', 'head', 'ceo', 'director', 'lead'].some((r) =>
    userRole.includes(r)
  );

  // Right-Side Task Details & Comments Drawer states
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [taskDetailsText, setTaskDetailsText] = useState('');
  const [detailsSavedNotice, setDetailsSavedNotice] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isDeletingTask, setIsDeletingTask] = useState(false);
  const [drawerNewSubtaskInput, setDrawerNewSubtaskInput] = useState('');
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  // Sync selectedTask whenever tasks list updates
  useEffect(() => {
    if (selectedTaskId) {
      const found = tasks.find((t) => String(t._id) === String(selectedTaskId));
      if (found) {
        setSelectedTask(found);
      }
    }
  }, [tasks, selectedTaskId]);

  const getFallbackProject = () => {
    return (
      FALLBACK_PROJECTS.find(
        (p) => p._id === id || p.code === id || (id && id.startsWith('proj-demo-'))
      ) || FALLBACK_PROJECTS[0]
    );
  };

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Check localStorage first so state is immediately available without delay
      let cachedTasks: TaskItem[] | null = null;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(`sparkx_project_tasks_${id}`);
          if (stored) {
            cachedTasks = JSON.parse(stored);
            if (Array.isArray(cachedTasks) && cachedTasks.length > 0) {
              setTasks(cachedTasks);
            }
          }
        } catch (e) {
          console.warn('Could not read cached tasks:', e);
        }
      }

      const [prjRes, tasksRes, empsRes] = await Promise.all([
        api.get<ProjectDetail>(`/projects/${id}`),
        api.get<TaskItem[]>(`/tasks?projectId=${id}`),
        api.get<any>(`/employees?limit=100`)
      ]);

      if (prjRes?.data) {
        setProject(prjRes.data);
      } else {
        setProject(getFallbackProject());
      }

      if (tasksRes?.data && Array.isArray(tasksRes.data) && tasksRes.data.length > 0) {
        // Merge with local cached tasks to preserve any local status moves or details
        let finalTasks = tasksRes.data;
        if (cachedTasks && cachedTasks.length > 0) {
          finalTasks = tasksRes.data.map((srvTask) => {
            const cached = cachedTasks?.find(
              (c) => c._id === srvTask._id || c.taskNumber === srvTask.taskNumber
            );
            if (cached) {
              return {
                ...srvTask,
                status: cached.status || srvTask.status,
                description: cached.description || srvTask.description,
                assignees: cached.assignees && cached.assignees.length > 0 ? cached.assignees : srvTask.assignees,
                subtasks: cached.subtasks && cached.subtasks.length > 0 ? cached.subtasks : srvTask.subtasks
              };
            }
            return srvTask;
          });
        }
        setTasks(finalTasks);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`sparkx_project_tasks_${id}`, JSON.stringify(finalTasks));
        }
      } else if (cachedTasks && cachedTasks.length > 0) {
        setTasks(cachedTasks);
      } else {
        setTasks(FALLBACK_TASKS);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`sparkx_project_tasks_${id}`, JSON.stringify(FALLBACK_TASKS));
        }
      }

      if (empsRes?.data && Array.isArray(empsRes.data) && empsRes.data.length > 0) {
        setEmployees(empsRes.data);
        if (taskAssigneeIds.length === 0 && empsRes.data[0]._id) {
          setTaskAssigneeIds([empsRes.data[0]._id]);
        }
      } else {
        setEmployees(FALLBACK_EMPLOYEES);
      }
    } catch {
      let cachedTasks: TaskItem[] | null = null;
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(`sparkx_project_tasks_${id}`);
          if (stored) {
            cachedTasks = JSON.parse(stored);
          }
        } catch {}
      }
      setProject(getFallbackProject());
      setTasks(cachedTasks && cachedTasks.length > 0 ? cachedTasks : FALLBACK_TASKS);
      setEmployees(FALLBACK_EMPLOYEES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectAndTasks();
    }
  }, [id]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskItem['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: TaskItem['status']) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverColumn === status) {
        setDragOverColumn(null);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskItem['status']) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = draggedTaskId || e.dataTransfer.getData('text/plain');
    setDragOverColumn(null);
    setDraggedTaskId(null);

    if (!taskId) return;
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === targetStatus) return;

    handleMoveTaskStatus(taskId, targetStatus);
  };

  // Multi-Assignee Toggle Handler — click to add, click again to remove
  const handleAssignMember = async (taskId: string, member: Assignee | null) => {
    if (!member) {
      // Clear all assignees
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, assignees: [] } : t))
      );
      try { await api.put(`/api/tasks/${taskId}`, { assignees: [] }); } catch {}
      return;
    }

    setTasks((prev) =>
      prev.map((t) => {
        if (t._id !== taskId) return t;
        const alreadyAssigned = t.assignees.some((a) => a._id === member._id);
        const updatedAssignees = alreadyAssigned
          ? t.assignees.filter((a) => a._id !== member._id) // remove
          : [...t.assignees, member]; // add
        return { ...t, assignees: updatedAssignees };
      })
    );

    // Sync to server with full updated list
    const task = tasks.find((t) => t._id === taskId);
    if (task) {
      const alreadyAssigned = task.assignees.some((a) => a._id === member._id);
      const newIds = alreadyAssigned
        ? task.assignees.filter((a) => a._id !== member._id).map((a) => a._id).filter(Boolean)
        : [...task.assignees.map((a) => a._id).filter(Boolean), member._id];
      try { await api.put(`/api/tasks/${taskId}`, { assignees: newIds }); } catch {}
    }
  };

  // Inline Subtask Toggle Handler
  const handleToggleSubtask = async (taskId: string, subtaskIndex: number) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || !task.subtasks) return;

    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      completed: !updatedSubtasks[subtaskIndex].completed
    };

    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, subtasks: updatedSubtasks } : t))
    );

    try {
      await api.put(`/api/tasks/${taskId}`, {
        subtasks: updatedSubtasks
      });
    } catch (err) {
      console.warn('Could not sync subtask on server:', err);
    }
  };

  // Drawer Handlers
  const handleOpenTaskDrawer = (task: TaskItem) => {
    setSelectedTask(task);
    setSelectedTaskId(task._id);
    setTaskDetailsText(task.description || '');
    setDetailsSavedNotice(false);
    setPermissionNotice(null);
    setDrawerNewSubtaskInput('');
    setIsDrawerOpen(true);
  };

  const handleCloseTaskDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTask(null);
    setSelectedTaskId(null);
    setPermissionNotice(null);
  };

  const handleSaveTaskDetails = async () => {
    if (!selectedTaskId) return;
    setIsSavingDetails(true);
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === selectedTaskId ? { ...t, description: taskDetailsText } : t))
      );
      await api.put(`/api/tasks/${selectedTaskId}`, {
        description: taskDetailsText
      });
      setDetailsSavedNotice(true);
      setTimeout(() => setDetailsSavedNotice(false), 3000);
    } catch (err) {
      console.warn('Could not sync task description on server:', err);
      setDetailsSavedNotice(true);
      setTimeout(() => setDetailsSavedNotice(false), 3000);
    } finally {
      setIsSavingDetails(false);
    }
  };

  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTaskId || !newCommentText.trim()) return;

    const currentUserName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Current User';
    const currentUserAvatar = user?.avatarUrl || 'https://i.ibb.co/S7MTNJ5k/Rectangle-74-1-jpg.jpg';
    const currentUserRole = user?.role || 'Team Member';
    const content = newCommentText.trim();

    const localComment: TaskComment = {
      _id: `cmt-${Date.now()}`,
      authorName: currentUserName,
      authorAvatar: currentUserAvatar,
      authorRole: currentUserRole,
      content,
      createdAt: new Date().toISOString()
    };

    setTasks((prev) =>
      prev.map((t) =>
        t._id === selectedTaskId
          ? { ...t, comments: [...(t.comments || []), localComment] }
          : t
      )
    );
    setNewCommentText('');
    setIsPostingComment(true);

    try {
      const res = await api.post(`/api/tasks/${selectedTaskId}/comments`, {
        content,
        authorName: currentUserName,
        authorAvatar: currentUserAvatar,
        authorRole: currentUserRole
      });
      if (res?.data && res.data.comments) {
        setTasks((prev) =>
          prev.map((t) =>
            t._id === selectedTaskId ? { ...t, comments: res.data.comments } : t
          )
        );
      }
    } catch (err) {
      console.warn('Failed to post comment to server, kept locally:', err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleAddDrawerSubtask = async () => {
    if (!selectedTaskId || !drawerNewSubtaskInput.trim()) return;
    const task = tasks.find((t) => t._id === selectedTaskId);
    if (!task) return;

    const updatedSubtasks = [
      ...(task.subtasks || []),
      { title: drawerNewSubtaskInput.trim(), completed: false }
    ];

    setTasks((prev) =>
      prev.map((t) => (t._id === selectedTaskId ? { ...t, subtasks: updatedSubtasks } : t))
    );
    setDrawerNewSubtaskInput('');

    try {
      await api.put(`/api/tasks/${selectedTaskId}`, { subtasks: updatedSubtasks });
    } catch (err) {
      console.warn('Could not sync subtasks to server:', err);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskId) return;

    if (!isHrOrUpperManagement) {
      setPermissionNotice(
        'Access Denied: Only HR and Upper Management (SuperAdmin, HR Admin, Manager, Owner) can delete tasks.'
      );
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this task? This action cannot be undone.');
    if (!confirmed) return;

    setIsDeletingTask(true);
    try {
      await api.delete(`/api/tasks/${selectedTaskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== selectedTaskId));
      handleCloseTaskDrawer();
    } catch (err: any) {
      console.error('Delete task error:', err);
      if (err?.response?.status === 403 || err?.message?.includes('403')) {
        setPermissionNotice('Forbidden: Only HR and Upper Management have permission to delete tasks.');
      } else {
        setTasks((prev) => prev.filter((t) => t._id !== selectedTaskId));
        handleCloseTaskDrawer();
      }
    } finally {
      setIsDeletingTask(false);
    }
  };

  // Add Subtask Item into Modal List
  const handleAddSubtaskItem = () => {
    if (!subtaskInput.trim()) return;
    setNewSubtasks((prev) => [...prev, subtaskInput.trim()]);
    setSubtaskInput('');
  };

  const handleRemoveSubtaskItem = (index: number) => {
    setNewSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTaskCreating(true);
      setError(null);

      const assignedEmployees = employees.filter((emp) => emp._id && taskAssigneeIds.includes(emp._id));
      const subtasksPayload = newSubtasks.map((st) => ({ title: st, completed: false }));

      const res = await api.post('/api/tasks', {
        projectId: project?._id || id,
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate || undefined,
        estimatedHours: Number(taskEstimatedHours) || 8,
        assignees: taskAssigneeIds,
        subtasks: subtasksPayload
      });

      if (res?.data) {
        const created = {
          ...res.data,
          assignees:
            res.data.assignees && res.data.assignees.length > 0
              ? res.data.assignees
              : assignedEmployees.length > 0
              ? assignedEmployees
              : [],
          subtasks: subtasksPayload
        };
        setTasks((prev) => [created, ...prev]);
      } else {
        const localTask: TaskItem = {
          _id: `tsk-${Date.now()}`,
          taskNumber: `TSK-${Math.floor(100 + Math.random() * 900)}`,
          title: taskTitle,
          description: taskDescription,
          status: taskStatus,
          priority: taskPriority,
          dueDate: taskDueDate || undefined,
          estimatedHours: Number(taskEstimatedHours) || 8,
          loggedHours: 0,
          assignees: assignedEmployees.length > 0 ? assignedEmployees : [FALLBACK_EMPLOYEES[0]],
          subtasks: subtasksPayload,
          tags: ['General']
        };
        setTasks((prev) => [localTask, ...prev]);
      }

      setIsAddTaskModalOpen(false);
      setTaskTitle('');
      setTaskDescription('');
      setTaskAssigneeIds([]);
      setNewSubtasks([]);
      setSubtaskInput('');
    } catch {
      const assignedEmployees = employees.filter((emp) => emp._id && taskAssigneeIds.includes(emp._id));
      const subtasksPayload = newSubtasks.map((st) => ({ title: st, completed: false }));

      const localTask: TaskItem = {
        _id: `tsk-${Date.now()}`,
        taskNumber: `TSK-${Math.floor(100 + Math.random() * 900)}`,
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        estimatedHours: Number(taskEstimatedHours) || 8,
        loggedHours: 0,
        assignees: assignedEmployees.length > 0 ? assignedEmployees : [FALLBACK_EMPLOYEES[0]],
        subtasks: subtasksPayload,
        tags: ['General']
      };
      setTasks((prev) => [localTask, ...prev]);
      setIsAddTaskModalOpen(false);
      setTaskTitle('');
      setTaskDescription('');
      setTaskAssigneeIds([]);
      setNewSubtasks([]);
      setSubtaskInput('');
    } finally {
      setTaskCreating(false);
    }
  };

  const handleMoveTaskStatus = async (taskId: string, newStatus: TaskItem['status']) => {
    // 1. Immediate optimistic UI update + localStorage persistence
    setTasks((prev) => {
      const updated = prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t));
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`sparkx_project_tasks_${id}`, JSON.stringify(updated));
        } catch (e) {
          console.warn('localStorage caching failed:', e);
        }
      }
      return updated;
    });

    // 2. Persist to backend server
    try {
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
    } catch (err: any) {
      console.warn('Could not move task on server, local state retained:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Loading project workspace...
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Project not found</h3>
        <Link href="/projects">
          <Button variant="primary" style={{ marginTop: '16px' }}>
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const kanbanColumns: { status: TaskItem['status']; label: string; color: string; count: number }[] = [
    { status: 'todo', label: 'To Do', color: '#6C5CE7', count: tasks.filter((t) => t.status === 'todo').length },
    { status: 'in_progress', label: 'In Progress', color: '#0EA5E9', count: tasks.filter((t) => t.status === 'in_progress').length },
    { status: 'review', label: 'Under Review', color: '#F59E0B', count: tasks.filter((t) => t.status === 'review').length },
    { status: 'completed', label: 'Completed', color: '#10B981', count: tasks.filter((t) => t.status === 'completed').length },
    { status: 'blocked', label: 'Blocked', color: '#EF4444', count: tasks.filter((t) => t.status === 'blocked').length }
  ];

  const getPriorityBadge = (priority: TaskItem['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="danger">Urgent</Badge>;
      case 'high':
        return <Badge variant="warning">High</Badge>;
      case 'medium':
        return <Badge variant="info">Medium</Badge>;
      default:
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/projects">
            <Button variant="outline" size="sm" iconPrefix={<ArrowLeft size={16} />}>
              Projects
            </Button>
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                {project.code}
              </span>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                {project.name}
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Target Delivery: {new Date(project.endDate).toLocaleDateString()} • Budget: ${(project.budget || 0).toLocaleString()} {project.currency}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="primary"
            iconPrefix={<Plus size={16} />}
            onClick={() => setIsAddTaskModalOpen(true)}
          >
            Add Task
          </Button>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Project Status Banner (Solid Surfaces, Zero Gradients) */}
      <Card padding="md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Overall Progress: <strong style={{ color: 'var(--color-text-main)', fontSize: '15px' }}>{project.progress}%</strong>
              <span style={{ margin: '0 8px', color: 'var(--color-border)' }}>|</span>
              Tasks: <strong>{project.completedTasks}</strong> completed of <strong>{project.totalTasks}</strong> total
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-surface-soft)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-main)',
                  fontWeight: 600
                }}
              >
                In Progress: {project.inProgressTasks || 0}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--color-surface-soft)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-danger)',
                  fontWeight: 600
                }}
              >
                Blocked: {project.blockedTasks || 0}
              </span>
            </div>
          </div>

          {/* Solid Progress Bar */}
          <div
            style={{
              height: '8px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--color-surface-soft)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${project.progress}%`,
                height: '100%',
                backgroundColor: project.progress === 100 ? 'var(--color-success)' : 'var(--color-primary)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      </Card>

      {/* Tab Navigation (Kanban / List / Milestones) */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--color-border)',
          paddingBottom: '8px'
        }}
      >
        <button
          onClick={() => setActiveTab('kanban')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: activeTab === 'kanban' ? 700 : 500,
            backgroundColor: activeTab === 'kanban' ? 'var(--color-primary-light)' : 'transparent',
            color: activeTab === 'kanban' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Kanban size={16} /> Kanban Board ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('list')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: activeTab === 'list' ? 700 : 500,
            backgroundColor: activeTab === 'list' ? 'var(--color-primary-light)' : 'transparent',
            color: activeTab === 'list' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <List size={16} /> List View
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontSize: '13.5px',
            fontWeight: activeTab === 'milestones' ? 700 : 500,
            backgroundColor: activeTab === 'milestones' ? 'var(--color-primary-light)' : 'transparent',
            color: activeTab === 'milestones' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <Milestone size={16} /> Milestones ({project.milestones?.length || 0})
        </button>
      </div>

      {/* Tab 1: 5-Column Kanban Board with Real-time Drag & Drop */}
      {activeTab === 'kanban' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(280px, 1fr))',
            gap: '16px',
            overflowX: 'auto',
            paddingBottom: '16px'
          }}
        >
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            const isColumnTargeted = dragOverColumn === col.status;

            return (
              <div
                key={col.status}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDragLeave={(e) => handleDragLeave(e, col.status)}
                onDrop={(e) => handleDrop(e, col.status)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: isColumnTargeted ? `${col.color}15` : 'var(--color-surface-soft)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px',
                  border: isColumnTargeted ? `2px dashed ${col.color}` : '1px solid var(--color-border)',
                  minHeight: '450px',
                  transition: 'all 0.2s ease',
                  boxShadow: isColumnTargeted ? `0 0 16px ${col.color}30` : 'none'
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    borderBottom: '2px solid',
                    borderBottomColor: col.color
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                      {col.label}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-secondary)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-pill)',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      {col.count}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setTaskStatus(col.status);
                      setIsAddTaskModalOpen(true);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      display: 'flex'
                    }}
                    title={`Add task to ${col.label}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Drop Indicator when dragged over */}
                {isColumnTargeted && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px dashed ${col.color}`,
                      backgroundColor: 'var(--color-surface)',
                      color: col.color,
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <MoveRight size={14} /> Drop task here to mark {col.label}
                  </div>
                )}

                {/* Tasks Stack */}
                <div
                  onDragOver={(e) => handleDragOver(e, col.status)}
                  onDrop={(e) => handleDrop(e, col.status)}
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: '120px' }}
                >
                  {colTasks.length === 0 ? (
                    <div
                      style={{
                        padding: '24px 12px',
                        textAlign: 'center',
                        color: 'var(--color-text-muted)',
                        fontSize: '12px',
                        border: '1px dashed var(--color-border)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      No tasks in {col.label}
                    </div>
                  ) : (
                    colTasks.map((t) => {
                      const completedSubtasksCount = t.subtasks?.filter((s) => s.completed).length || 0;
                      const totalSubtasksCount = t.subtasks?.length || 0;
                      const hasSubtasks = totalSubtasksCount > 0;

                      return (
                        <Card
                          key={t._id}
                          padding="sm"
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, t._id)}
                          onDragEnd={handleDragEnd}
                          onClick={(e: any) => {
                            e?.stopPropagation?.();
                            handleOpenTaskDrawer(t);
                          }}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            cursor: draggedTaskId === t._id ? 'grabbing' : 'pointer',
                            opacity: draggedTaskId === t._id ? 0.35 : 1,
                            backgroundColor: 'var(--color-surface)',
                            border: selectedTaskId === t._id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            boxShadow: selectedTaskId === t._id ? '0 0 10px rgba(108, 92, 231, 0.2)' : 'none',
                            position: 'relative',
                            userSelect: 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Card Header */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTaskDrawer(t);
                            }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  color: 'var(--color-primary)',
                                  backgroundColor: 'var(--color-primary-light)',
                                  padding: '2px 6px',
                                  borderRadius: 'var(--radius-pill)'
                                }}
                              >
                                {t.taskNumber}
                              </span>
                              {getPriorityBadge(t.priority)}
                            </div>
                            <GripVertical size={14} style={{ color: 'var(--color-text-muted)', cursor: 'grab' }} />
                          </div>

                          {/* Task Title */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTaskDrawer(t);
                            }}
                            style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-main)', lineHeight: 1.3, cursor: 'pointer' }}
                          >
                            {t.title}
                          </div>

                          {/* Task Description */}
                          {t.description && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenTaskDrawer(t);
                              }}
                              style={{
                                fontSize: '12px',
                                color: 'var(--color-text-muted)',
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                cursor: 'pointer'
                              }}
                            >
                              {t.description}
                            </div>
                          )}

                          {/* Subtasks Progress Checklist (if available) */}
                          {hasSubtasks && (
                            <div
                              style={{
                                padding: '6px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'var(--color-surface-soft)',
                                border: '1px solid var(--color-border-subtle)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <CheckSquare size={12} style={{ color: completedSubtasksCount === totalSubtasksCount ? 'var(--color-success)' : 'var(--color-primary)' }} />
                                  <span>Subtasks ({completedSubtasksCount}/{totalSubtasksCount})</span>
                                </div>
                                <span>{Math.round((completedSubtasksCount / totalSubtasksCount) * 100)}%</span>
                              </div>

                              <div style={{ height: '4px', borderRadius: '2px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${(completedSubtasksCount / totalSubtasksCount) * 100}%`,
                                    backgroundColor: completedSubtasksCount === totalSubtasksCount ? 'var(--color-success)' : 'var(--color-primary)',
                                    transition: 'width 0.2s'
                                  }}
                                />
                              </div>

                              {/* Interactive Subtask items list */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                                {t.subtasks?.map((st, sIdx) => (
                                  <div
                                    key={sIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenTaskDrawer(t);
                                    }}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      fontSize: '11px',
                                      color: st.completed ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                                      textDecoration: st.completed ? 'line-through' : 'none',
                                      cursor: 'pointer'
                                    }}
                                    title="Click to view full details in right sidebar"
                                  >
                                    <span
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleSubtask(t._id, sIdx);
                                      }}
                                      style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                      title={st.completed ? 'Mark incomplete' : 'Mark complete'}
                                    >
                                      {st.completed ? (
                                        <CheckSquare size={12} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                                      ) : (
                                        <Square size={12} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                                      )}
                                    </span>
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {st.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                            {/* Stacked Avatars for ALL Assignees + Quick-Assign Toggle */}
                            <div style={{ position: 'relative', marginTop: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                              {t.assignees.length > 0 ? (
                                <>
                                  {/* Stacked avatar row */}
                                  <div
                                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                    onClick={(e) => { e.stopPropagation(); setActiveAssigneePickerTaskId(activeAssigneePickerTaskId === t._id ? null : t._id); }}
                                    title={t.assignees.map(a => `${a.firstName} ${a.lastName}`).join(', ')}
                                  >
                                    {t.assignees.slice(0, 4).map((a, aIdx) => (
                                      a.avatarUrl ? (
                                        <img
                                          key={aIdx}
                                          src={a.avatarUrl}
                                          alt={`${a.firstName} ${a.lastName}`}
                                          style={{
                                            width: '22px', height: '22px', borderRadius: '50%',
                                            objectFit: 'cover', border: '2px solid var(--color-surface)',
                                            marginLeft: aIdx === 0 ? 0 : '-6px', zIndex: 10 - aIdx
                                          }}
                                        />
                                      ) : (
                                        <div
                                          key={aIdx}
                                          style={{
                                            width: '22px', height: '22px', borderRadius: '50%',
                                            backgroundColor: 'var(--color-primary)', color: '#fff',
                                            fontSize: '9px', fontWeight: 700, display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            border: '2px solid var(--color-surface)',
                                            marginLeft: aIdx === 0 ? 0 : '-6px', zIndex: 10 - aIdx
                                          }}
                                        >
                                          {a.firstName?.[0] || 'U'}
                                        </div>
                                      )
                                    ))}
                                    {t.assignees.length > 4 && (
                                      <div style={{
                                        width: '22px', height: '22px', borderRadius: '50%',
                                        backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text-muted)',
                                        fontSize: '9px', fontWeight: 700, display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                        border: '2px solid var(--color-surface)', marginLeft: '-6px'
                                      }}>+{t.assignees.length - 4}</div>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setActiveAssigneePickerTaskId(activeAssigneePickerTaskId === t._id ? null : t._id); }}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', padding: '0 2px' }}
                                    title="Add/remove assignees"
                                  >
                                    <UserPlus size={13} />
                                  </button>
                                </>
                              ) : (
                                <div
                                  onClick={(e) => { e.stopPropagation(); setActiveAssigneePickerTaskId(activeAssigneePickerTaskId === t._id ? null : t._id); }}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    padding: '3px 8px', borderRadius: 'var(--radius-pill)',
                                    backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-border)',
                                    cursor: 'pointer', fontSize: '11.5px', color: 'var(--color-primary)', fontWeight: 600
                                  }}
                                >
                                  <UserPlus size={13} /> + Assign Member
                                </div>
                              )}
                            </div>

                            {/* Floating Multi-Assign Dropdown with checkmarks */}
                            {activeAssigneePickerTaskId === t._id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  position: 'absolute', top: '100%', left: 0, marginTop: '6px',
                                  zIndex: 100, backgroundColor: 'var(--color-surface)',
                                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.18)', padding: '6px',
                                  minWidth: '230px', maxHeight: '260px', overflowY: 'auto'
                                }}
                              >
                                <div style={{ padding: '4px 8px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-subtle)', marginBottom: '4px' }}>
                                  Click to add/remove assignees
                                </div>
                                {employees.map((emp) => {
                                  const isAssigned = t.assignees.some((a) => a._id === emp._id);
                                  return (
                                    <div
                                      key={emp._id || emp.employeeCode}
                                      onClick={() => handleAssignMember(t._id, emp)}
                                      style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '7px 8px', borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer', fontSize: '12px',
                                        backgroundColor: isAssigned ? 'var(--color-primary-light)' : 'transparent',
                                        transition: 'background-color 0.1s'
                                      }}
                                      onMouseEnter={(e) => { if (!isAssigned) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isAssigned ? 'var(--color-primary-light)' : 'transparent'; }}
                                    >
                                      {emp.avatarUrl ? (
                                        <img src={emp.avatarUrl} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                                      ) : (
                                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                          {emp.firstName?.[0] || 'U'}
                                        </div>
                                      )}
                                      <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: 'var(--color-text-main)', fontSize: '12px' }}>{emp.firstName} {emp.lastName}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{emp.role || emp.employeeCode}</div>
                                      </div>
                                      {isAssigned && <Check size={14} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />}
                                    </div>
                                  );
                                })}
                                <div
                                  onClick={() => handleAssignMember(t._id, null)}
                                  style={{ padding: '6px 8px', fontSize: '11px', color: 'var(--color-danger)', cursor: 'pointer', borderTop: '1px solid var(--color-border-subtle)', marginTop: '4px', textAlign: 'center', fontWeight: 600 }}
                                >
                                  Clear All Assignees
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Card Footer */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingTop: '8px',
                              borderTop: '1px solid var(--color-border-subtle)',
                              fontSize: '11px',
                              color: 'var(--color-text-muted)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={12} />
                                <span>{t.estimatedHours}h</span>
                              </div>
                              {t.comments && t.comments.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-primary)' }} title={`${t.comments.length} comments`}>
                                  <MessageSquare size={11} />
                                  <span style={{ fontWeight: 700 }}>{t.comments.length}</span>
                                </div>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: '4px' }}>
                              {col.status !== 'completed' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const nextStatus =
                                      col.status === 'todo'
                                        ? 'in_progress'
                                        : col.status === 'in_progress'
                                        ? 'review'
                                        : 'completed';
                                    handleMoveTaskStatus(t._id, nextStatus);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--color-primary)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer'
                                  }}
                                  title="Advance task to next stage"
                                >
                                  Move <MoveRight size={12} />
                                </button>
                              )}

                              {col.status !== 'blocked' && col.status !== 'completed' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveTaskStatus(t._id, 'blocked');
                                  }}
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--color-danger)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    marginLeft: '4px'
                                  }}
                                  title="Flag task as blocked"
                                >
                                  Block
                                </button>
                              )}

                              {col.status === 'blocked' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveTaskStatus(t._id, 'in_progress');
                                  }}
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--color-info)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer'
                                  }}
                                  title="Unblock task"
                                >
                                  Unblock
                                </button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: List View with Assignee Column */}
      {activeTab === 'list' && (
        <Card padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-soft)' }}>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Task</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Assigned To</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Subtasks</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Priority</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Estimate</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Due Date</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', color: 'var(--color-text-muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No tasks created for this project yet.
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => {
                    const subtaskDone = t.subtasks?.filter((s) => s.completed).length || 0;
                    const subtaskTotal = t.subtasks?.length || 0;

                    return (
                      <tr
                        key={t._id}
                        style={{ borderBottom: '1px solid var(--color-border-subtle)', transition: 'background-color 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '14px 18px', cursor: 'pointer' }} onClick={() => handleOpenTaskDrawer(t)}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>
                              {t.taskNumber}
                            </span>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{t.title}</span>
                            {t.comments && t.comments.length > 0 && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: 'var(--color-primary)', marginLeft: '4px' }}>
                                <MessageSquare size={11} />
                                {t.comments.length}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 'var(--radius-pill)',
                              textTransform: 'capitalize',
                              backgroundColor:
                                t.status === 'completed'
                                  ? 'var(--color-success-bg)'
                                  : t.status === 'in_progress'
                                  ? 'var(--color-info-bg)'
                                  : t.status === 'blocked'
                                  ? 'var(--color-danger-bg)'
                                  : 'var(--color-surface-soft)',
                              color:
                                t.status === 'completed'
                                  ? 'var(--color-success)'
                                  : t.status === 'in_progress'
                                  ? 'var(--color-info)'
                                  : t.status === 'blocked'
                                  ? 'var(--color-danger)'
                                  : 'var(--color-text-main)'
                            }}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {/* Multi-assignee display in list view */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            {t.assignees.length > 0 ? (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  {t.assignees.slice(0, 3).map((a, aIdx) => (
                                    a.avatarUrl ? (
                                      <img
                                        key={aIdx}
                                        src={a.avatarUrl}
                                        alt={`${a.firstName} ${a.lastName}`}
                                        title={`${a.firstName} ${a.lastName}`}
                                        style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-surface)', marginLeft: aIdx === 0 ? 0 : '-6px' }}
                                      />
                                    ) : (
                                      <div key={aIdx} title={`${a.firstName} ${a.lastName}`} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-surface)', marginLeft: aIdx === 0 ? 0 : '-6px' }}>
                                        {a.firstName?.[0]}
                                      </div>
                                    )
                                  ))}
                                  {t.assignees.length > 3 && (
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-surface-soft)', color: 'var(--color-text-muted)', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-surface)', marginLeft: '-6px' }}>+{t.assignees.length - 3}</div>
                                  )}
                                </div>
                                <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                  {t.assignees[0].firstName}{t.assignees.length > 1 ? ` +${t.assignees.length - 1}` : ''}
                                </span>
                              </>
                            ) : (
                              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Unassigned</span>
                            )}
                          </div>
                        </td>
                        <td
                          style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: '12.5px', cursor: 'pointer' }}
                          onClick={() => handleOpenTaskDrawer(t)}
                          title="Click to view subtasks and task details"
                        >
                          {subtaskTotal > 0 ? (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: 'var(--radius-pill)',
                                backgroundColor: 'var(--color-surface-soft)',
                                border: '1px solid var(--color-border)'
                              }}
                            >
                              <CheckSquare size={12} style={{ color: subtaskDone === subtaskTotal ? 'var(--color-success)' : 'var(--color-primary)' }} />
                              {subtaskDone}/{subtaskTotal} items
                            </span>
                          ) : (
                            'None'
                          )}
                        </td>
                        <td style={{ padding: '14px 18px' }}>{getPriorityBadge(t.priority)}</td>
                        <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)' }}>{t.estimatedHours}h</td>
                        <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: '12.5px' }}>
                          {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No date'}
                        </td>
                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <select
                            value={t.status}
                            onChange={(e) => handleMoveTaskStatus(t._id, e.target.value as any)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--color-border)',
                              backgroundColor: 'var(--color-surface)',
                              color: 'var(--color-text-main)',
                              fontSize: '12px'
                            }}
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                            <option value="blocked">Blocked</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Milestones Roadmap */}
      {activeTab === 'milestones' && (
        <Card title="Project Milestones & Deliverables" subtitle="Roadmap key checkpoints and scheduled releases">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(!project.milestones || project.milestones.length === 0) ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                No milestones defined for this project.
              </div>
            ) : (
              project.milestones.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-surface-soft)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: m.completed ? 'var(--color-success-bg)' : 'var(--color-surface)',
                        color: m.completed ? 'var(--color-success)' : 'var(--color-text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--color-border)'
                      }}
                    >
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-main)', textDecoration: m.completed ? 'line-through' : 'none' }}>
                        {m.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        Target: {new Date(m.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: m.completed ? 'var(--color-success)' : 'var(--color-warning)'
                    }}
                  >
                    {m.completed ? 'Achieved' : 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Add Task Modal with Assignee & Subtasks selection */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        title="Create New Task"
        subtitle={`Add a new work item into ${project.name}`}
      >
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
              Task Title
            </label>
            <input
              type="text"
              placeholder="e.g. Implement real-time socket connections"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                padding: '0 12px',
                fontSize: '14px'
              }}
              required
            />
          </div>

          {/* Multi-Assignee Selection — checkbox list */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
              Assign Team Members <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 400 }}>(select one or more)</span>
            </label>
            <div
              style={{
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)', maxHeight: '180px', overflowY: 'auto', padding: '4px'
              }}
            >
              {employees.map((emp) => {
                const isSelected = emp._id ? taskAssigneeIds.includes(emp._id) : false;
                return (
                  <label
                    key={emp._id || emp.employeeCode}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
                      transition: 'background-color 0.1s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        if (!emp._id) return;
                        setTaskAssigneeIds((prev) =>
                          prev.includes(emp._id!)
                            ? prev.filter((id) => id !== emp._id)
                            : [...prev, emp._id!]
                        );
                      }}
                      style={{ accentColor: 'var(--color-primary)', width: '15px', height: '15px', flexShrink: 0 }}
                    />
                    {emp.avatarUrl ? (
                      <img src={emp.avatarUrl} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {emp.firstName?.[0] || 'U'}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-main)' }}>{emp.firstName} {emp.lastName}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{emp.role || emp.employeeCode || 'Member'}</div>
                    </div>
                    {isSelected && <Check size={15} style={{ color: 'var(--color-primary)', marginLeft: 'auto', flexShrink: 0 }} />}
                  </label>
                );
              })}
            </div>
            {taskAssigneeIds.length > 0 && (
              <div style={{ marginTop: '6px', fontSize: '11.5px', color: 'var(--color-primary)', fontWeight: 600 }}>
                {taskAssigneeIds.length} member{taskAssigneeIds.length > 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Initial Status
              </label>
              <select
                value={taskStatus}
                onChange={(e: any) => setTaskStatus(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  padding: '0 12px',
                  fontSize: '14px'
                }}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Under Review</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e: any) => setTaskPriority(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  padding: '0 12px',
                  fontSize: '14px'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Estimated Hours
              </label>
              <input
                type="number"
                value={taskEstimatedHours}
                onChange={(e) => setTaskEstimatedHours(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  padding: '0 12px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  padding: '0 12px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Subtasks Builder (User requirement: sub task gula create korar somoy) */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
              Subtasks / Action Items
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Add a subtask item (e.g. Write unit tests)..."
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtaskItem();
                  }
                }}
                style={{
                  flex: 1,
                  height: '38px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-main)',
                  padding: '0 12px',
                  fontSize: '13.5px'
                }}
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddSubtaskItem}>
                + Add
              </Button>
            </div>

            {newSubtasks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {newSubtasks.map((st, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--color-surface-soft)',
                      border: '1px solid var(--color-border-subtle)',
                      fontSize: '12.5px',
                      color: 'var(--color-text-main)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Square size={13} style={{ color: 'var(--color-text-muted)' }} />
                      <span>{st}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtaskItem(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px' }}>
              Description & Specifications
            </label>
            <textarea
              rows={3}
              placeholder="Technical details, acceptance criteria, or requirements..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              style={{
                width: '100%',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                padding: '10px 12px',
                fontSize: '13.5px',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button variant="outline" type="button" onClick={() => setIsAddTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={taskCreating}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Right-Side Task Details, Notes & Discussion Drawer */}
      {isDrawerOpen && selectedTask && (
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={handleCloseTaskDrawer}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(3px)',
              zIndex: 999,
              transition: 'opacity 0.2s ease'
            }}
          />

          {/* Sliding Drawer Container */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '540px',
              maxWidth: '95vw',
              backgroundColor: 'var(--color-surface)',
              zIndex: 1000,
              boxShadow: '-10px 0 36px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid var(--color-border)',
              overflowY: 'auto'
            }}
          >
            {/* Drawer Sticky Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--color-surface)',
                zIndex: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-pill)'
                  }}
                >
                  {selectedTask.taskNumber}
                </span>
                {getPriorityBadge(selectedTask.priority)}
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleMoveTaskStatus(selectedTask._id, e.target.value as any)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface-soft)',
                    color: 'var(--color-text-main)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Under Review</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Delete Task Action - Restricted to HR & Upper Management */}
                <button
                  onClick={handleDeleteTask}
                  disabled={isDeletingTask}
                  title={
                    isHrOrUpperManagement
                      ? 'Delete Task (HR & Upper Management)'
                      : 'Restricted: Only HR and Upper Management can delete tasks'
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: isHrOrUpperManagement
                      ? '1px solid rgba(239, 68, 68, 0.4)'
                      : '1px solid var(--color-border)',
                    backgroundColor: isHrOrUpperManagement
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'var(--color-surface-soft)',
                    color: isHrOrUpperManagement ? 'var(--color-danger)' : 'var(--color-text-muted)',
                    cursor: isHrOrUpperManagement ? 'pointer' : 'not-allowed',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    opacity: isHrOrUpperManagement ? 1 : 0.6,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Trash2 size={14} />
                  {isDeletingTask ? 'Deleting...' : 'Delete'}
                </button>

                {/* Close Drawer Button */}
                <button
                  onClick={handleCloseTaskDrawer}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                  title="Close sidebar"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Permission Notice Banner (shown if unauthorized user attempts to delete) */}
            {permissionNotice && (
              <div
                style={{
                  margin: '16px 20px 0',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}
              >
                <ShieldAlert size={18} style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1, fontSize: '12.5px', color: 'var(--color-danger)', lineHeight: 1.4 }}>
                  {permissionNotice}
                </div>
                <button
                  onClick={() => setPermissionNotice(null)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Drawer Body Content */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Task Title */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {project.code} • Task Overview
                </div>
                <h2 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-main)', lineHeight: 1.35, margin: 0 }}>
                  {selectedTask.title}
                </h2>
              </div>

              {/* Metadata Summary Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  backgroundColor: 'var(--color-surface-soft)',
                  padding: '14px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)'
                }}
              >
                {/* Assignee Management — full section spanning 2 cols */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={12} />
                    ASSIGNED MEMBERS ({selectedTask.assignees?.length || 0})
                  </div>

                  {/* Current Assignees — chips with remove */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    {selectedTask.assignees && selectedTask.assignees.length > 0 ? (
                      selectedTask.assignees.map((a, aIdx) => (
                        <div
                          key={aIdx}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            padding: '5px 10px 5px 6px',
                            borderRadius: 'var(--radius-pill)',
                            backgroundColor: 'var(--color-primary-light)',
                            border: '1px solid rgba(108,92,231,0.25)',
                            fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-main)'
                          }}
                        >
                          {a.avatarUrl ? (
                            <img src={a.avatarUrl} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {a.firstName?.[0] || 'U'}
                            </div>
                          )}
                          <div>
                            <div style={{ lineHeight: 1.2 }}>{a.firstName} {a.lastName}</div>
                            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 400 }}>{a.role || a.employeeCode || 'Member'}</div>
                          </div>
                          <button
                            onClick={() => handleAssignMember(selectedTask._id, a)}
                            title={`Remove ${a.firstName}`}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', padding: '1px', borderRadius: '50%', marginLeft: '2px' }}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                        No one assigned yet
                      </div>
                    )}
                  </div>

                  {/* Add Member Expandable List */}
                  <div>
                    <button
                      onClick={() => setActiveAssigneePickerTaskId(activeAssigneePickerTaskId === selectedTask._id ? null : selectedTask._id)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: 'var(--radius-pill)',
                        border: '1px dashed var(--color-border)', background: 'transparent',
                        fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)',
                        cursor: 'pointer', transition: 'all 0.15s ease'
                      }}
                    >
                      <UserPlus size={13} />
                      {activeAssigneePickerTaskId === selectedTask._id ? 'Close' : '+ Add / Change Members'}
                    </button>

                    {activeAssigneePickerTaskId === selectedTask._id && (
                      <div
                        style={{
                          marginTop: '10px',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-surface)',
                          overflow: 'hidden',
                          maxHeight: '220px',
                          overflowY: 'auto'
                        }}
                      >
                        <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-subtle)', backgroundColor: 'var(--color-surface-soft)' }}>
                          Click to add or remove members
                        </div>
                        {employees.map((emp) => {
                          const isAssigned = selectedTask.assignees?.some((a) => a._id === emp._id);
                          return (
                            <div
                              key={emp._id || emp.employeeCode}
                              onClick={() => handleAssignMember(selectedTask._id, emp)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 12px', cursor: 'pointer',
                                backgroundColor: isAssigned ? 'var(--color-primary-light)' : 'transparent',
                                borderBottom: '1px solid var(--color-border-subtle)',
                                transition: 'background-color 0.1s'
                              }}
                              onMouseEnter={(e) => { if (!isAssigned) e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isAssigned ? 'var(--color-primary-light)' : 'transparent'; }}
                            >
                              {emp.avatarUrl ? (
                                <img src={emp.avatarUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                              ) : (
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {emp.firstName?.[0] || 'U'}
                                </div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-text-main)' }}>{emp.firstName} {emp.lastName}</div>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{emp.role || emp.employeeCode || 'Member'}</div>
                              </div>
                              {isAssigned ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)', fontSize: '11px', fontWeight: 700 }}>
                                  <Check size={14} /> Assigned
                                </div>
                              ) : (
                                <UserPlus size={14} style={{ color: 'var(--color-text-muted)' }} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Due Date & Estimate */}
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                    Schedule & Hours
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--color-text-main)' }}>
                      <Calendar size={13} style={{ color: 'var(--color-primary)' }} />
                      <span>{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'No due date'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      <Clock size={13} />
                      <span>{selectedTask.estimatedHours}h est • {selectedTask.loggedHours || 0}h logged</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Textarea Field for Detailed Specifications (User Requirement) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    <FileText size={15} style={{ color: 'var(--color-primary)' }} />
                    Task Details & Specifications
                  </label>
                  {detailsSavedNotice && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: 'var(--color-success)', fontWeight: 600 }}>
                      <Check size={13} /> Saved Details
                    </span>
                  )}
                </div>

                <textarea
                  rows={5}
                  value={taskDetailsText}
                  onChange={(e) => setTaskDetailsText(e.target.value)}
                  placeholder="Provide technical requirements, execution details, acceptance criteria, or specific steps for this task..."
                  style={{
                    width: '100%',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-main)',
                    padding: '12px 14px',
                    fontSize: '13.5px',
                    lineHeight: 1.5,
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveTaskDetails}
                    isLoading={isSavingDetails}
                    iconPrefix={<Save size={14} />}
                  >
                    Save Details
                  </Button>
                </div>
              </div>

              {/* Subtasks Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    <CheckSquare size={15} style={{ color: 'var(--color-primary)' }} />
                    Subtasks ({selectedTask.subtasks?.filter((s) => s.completed).length || 0}/{(selectedTask.subtasks?.length || 0)})
                  </span>
                </div>

                {/* Subtasks Progress Bar */}
                {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                  <div style={{ height: '5px', borderRadius: '3px', backgroundColor: 'var(--color-border)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${((selectedTask.subtasks.filter((s) => s.completed).length) / selectedTask.subtasks.length) * 100}%`,
                        backgroundColor: 'var(--color-primary)',
                        transition: 'width 0.2s ease'
                      }}
                    />
                  </div>
                )}

                {/* Subtasks List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(!selectedTask.subtasks || selectedTask.subtasks.length === 0) ? (
                    <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', fontStyle: 'italic', padding: '6px 0' }}>
                      No subtasks created yet. Anyone can add subtasks below.
                    </div>
                  ) : (
                    selectedTask.subtasks.map((st, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleSubtask(selectedTask._id, idx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-surface-soft)',
                          border: '1px solid var(--color-border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-soft)')}
                      >
                        {st.completed ? (
                          <CheckSquare size={16} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                        ) : (
                          <Square size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                        )}
                        <span
                          style={{
                            fontSize: '13px',
                            color: st.completed ? 'var(--color-text-muted)' : 'var(--color-text-main)',
                            textDecoration: st.completed ? 'line-through' : 'none',
                            flex: 1
                          }}
                        >
                          {st.title}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Subtask input directly in drawer */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="text"
                    placeholder="Add a new subtask..."
                    value={drawerNewSubtaskInput}
                    onChange={(e) => setDrawerNewSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDrawerSubtask();
                      }
                    }}
                    style={{
                      flex: 1,
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-main)',
                      padding: '0 12px',
                      fontSize: '13px'
                    }}
                  />
                  <Button size="sm" variant="outline" onClick={handleAddDrawerSubtask}>
                    + Add
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '2px 0' }} />

              {/* Real-Time Comments Section (User Requirement: jekhane ja kau oi task niye comment korte parbe) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={16} style={{ color: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                      Comments & Discussion
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        padding: '1px 7px',
                        borderRadius: 'var(--radius-pill)'
                      }}
                    >
                      {selectedTask.comments?.length || 0}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Anyone can comment
                  </span>
                </div>

                {/* New Comment Input Box */}
                <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea
                    rows={3}
                    placeholder="Write a comment, feedback, or update on this task..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                    style={{
                      width: '100%',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-main)',
                      padding: '10px 12px',
                      fontSize: '13px',
                      lineHeight: 1.4,
                      outline: 'none',
                      resize: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      Press Ctrl+Enter to submit
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      type="submit"
                      disabled={!newCommentText.trim()}
                      isLoading={isPostingComment}
                      iconPrefix={<Send size={13} />}
                    >
                      Post Comment
                    </Button>
                  </div>
                </form>

                {/* Comments Stream */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                  {(!selectedTask.comments || selectedTask.comments.length === 0) ? (
                    <div
                      style={{
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: 'var(--color-surface-soft)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--color-border)',
                        color: 'var(--color-text-muted)',
                        fontSize: '12.5px'
                      }}
                    >
                      No comments yet on this task. Be the first to share an update!
                    </div>
                  ) : (
                    selectedTask.comments.map((cmt, cIdx) => (
                      <div
                        key={cmt._id || cIdx}
                        style={{
                          display: 'flex',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-surface-soft)',
                          border: '1px solid var(--color-border-subtle)'
                        }}
                      >
                        {cmt.authorAvatar ? (
                          <img
                            src={cmt.authorAvatar}
                            alt=""
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--color-primary)',
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {cmt.authorName?.[0] || 'U'}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                                {cmt.authorName}
                              </span>
                              {cmt.authorRole && (
                                <span
                                  style={{
                                    fontSize: '10px',
                                    fontWeight: 600,
                                    backgroundColor: 'var(--color-surface)',
                                    color: 'var(--color-text-secondary)',
                                    padding: '1px 6px',
                                    borderRadius: 'var(--radius-pill)',
                                    border: '1px solid var(--color-border)'
                                  }}
                                >
                                  {cmt.authorRole}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {cmt.createdAt ? new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : ''}
                            </span>
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--color-text-main)', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                            {cmt.content}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
