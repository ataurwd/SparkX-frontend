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
  DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

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
  assignees: { firstName: string; lastName: string; avatarUrl?: string }[];
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

export default function ProjectWorkspacePage() {
  const params = useParams();
  const id = params?.id as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kanban' | 'list' | 'milestones'>('kanban');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [taskCreating, setTaskCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [taskStatus, setTaskStatus] = useState<TaskItem['status']>('todo');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskEstimatedHours, setTaskEstimatedHours] = useState(8);

  const fetchProjectAndTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prjRes, tasksRes] = await Promise.all([
        api.get<ProjectDetail>(`/api/projects/${id}`),
        api.get<TaskItem[]>(`/api/tasks?projectId=${id}`)
      ]);

      if (prjRes.data) {
        setProject(prjRes.data);
      }
      if (tasksRes.data) {
        setTasks(tasksRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectAndTasks();
    }
  }, [id]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setTaskCreating(true);
      setError(null);
      await api.post('/api/tasks', {
        projectId: id,
        title: taskTitle,
        description: taskDescription,
        priority: taskPriority,
        status: taskStatus,
        dueDate: taskDueDate || undefined,
        estimatedHours: Number(taskEstimatedHours)
      });
      setIsAddTaskModalOpen(false);
      setTaskTitle('');
      setTaskDescription('');
      await fetchProjectAndTasks();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setTaskCreating(false);
    }
  };

  const handleMoveTaskStatus = async (taskId: string, newStatus: TaskItem['status']) => {
    try {
      await api.put(`/api/tasks/${taskId}/status`, { status: newStatus });
      await fetchProjectAndTasks();
    } catch (err: any) {
      console.warn('Could not move task:', err);
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

      {/* Tab 1: 5-Column Kanban Board */}
      {activeTab === 'kanban' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(260px, 1fr))',
            gap: '16px',
            overflowX: 'auto',
            paddingBottom: '16px'
          }}
        >
          {kanbanColumns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: 'var(--color-surface-soft)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px',
                  border: '1px solid var(--color-border)',
                  minHeight: '400px'
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

                {/* Tasks Stack */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
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
                    colTasks.map((t) => (
                      <Card
                        key={t._id}
                        padding="sm"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          cursor: 'pointer',
                          backgroundColor: 'var(--color-surface)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

                        <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-text-main)', lineHeight: 1.3 }}>
                          {t.title}
                        </div>

                        {t.description && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--color-text-muted)',
                              lineHeight: 1.3,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {t.description}
                          </div>
                        )}

                        {/* Card Footer with 1-click status transitions */}
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            <span>{t.estimatedHours}h est</span>
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            {col.status !== 'completed' && (
                              <button
                                onClick={() => {
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
                                onClick={() => handleMoveTaskStatus(t._id, 'blocked')}
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
                                onClick={() => handleMoveTaskStatus(t._id, 'in_progress')}
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
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: List View */}
      {activeTab === 'list' && (
        <Card padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-soft)' }}>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Task</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Priority</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Estimate</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Due Date</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', color: 'var(--color-text-muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      No tasks created for this project yet.
                    </td>
                  </tr>
                ) : (
                  tasks.map((t) => (
                    <tr
                      key={t._id}
                      style={{ borderBottom: '1px solid var(--color-border-subtle)', transition: 'background-color 0.15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)' }}>
                            {t.taskNumber}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{t.title}</span>
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
                  ))
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

      {/* Add Task Modal */}
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
    </div>
  );
}
