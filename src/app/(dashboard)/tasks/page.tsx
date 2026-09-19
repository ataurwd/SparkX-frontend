'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckSquare,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  Kanban,
  List,
  MoveRight,
  User,
  Filter,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
  projectId?: { _id: string; name: string; code: string };
  assignees: { firstName: string; lastName: string; avatarUrl?: string }[];
  tags: string[];
}

export default function UniversalTaskHubPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [scope, setScope] = useState<'all' | 'my'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = scope === 'my' ? '/api/tasks/my-tasks' : '/api/tasks';
      const res = await api.get<TaskItem[]>(endpoint);
      if (res.data) {
        setTasks(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [scope]);

  const handleMoveStatus = async (taskId: string, newStatus: TaskItem['status']) => {
    try {
      await api.put(`/api/tasks/${taskId}/status`, { status: newStatus });
      await fetchTasks();
    } catch (err: any) {
      console.warn('Could not update task status:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.projectId?.name && t.projectId.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

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

  const kanbanColumns: { status: TaskItem['status']; label: string; color: string }[] = [
    { status: 'todo', label: 'To Do', color: '#6C5CE7' },
    { status: 'in_progress', label: 'In Progress', color: '#0EA5E9' },
    { status: 'review', label: 'Under Review', color: '#F59E0B' },
    { status: 'completed', label: 'Completed', color: '#10B981' },
    { status: 'blocked', label: 'Blocked', color: '#EF4444' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Scope Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Task Operations Hub
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Company-wide work execution, assignments, sprint tasks, and status flow.
          </p>
        </div>

        {/* Scope Selector: All Tasks vs My Assigned Tasks */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--color-surface-soft)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setScope('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '13px',
              fontWeight: scope === 'all' ? 700 : 500,
              backgroundColor: scope === 'all' ? 'var(--color-surface)' : 'transparent',
              color: scope === 'all' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              boxShadow: scope === 'all' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            All Company Tasks
          </button>
          <button
            onClick={() => setScope('my')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontSize: '13px',
              fontWeight: scope === 'my' ? 700 : 500,
              backgroundColor: scope === 'my' ? 'var(--color-surface)' : 'transparent',
              color: scope === 'my' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              boxShadow: scope === 'my' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            My Assigned Tasks
          </button>
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

      {/* Filter and View Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-bg-base)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 12px',
              height: '38px',
              width: '100%',
              maxWidth: '320px'
            }}
          >
            <Search size={15} color="var(--color-text-muted)" />
            <input
              placeholder="Search tasks, IDs, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '13px',
                width: '100%',
                color: 'var(--color-text-main)'
              }}
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              height: '38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-main)',
              padding: '0 12px',
              fontSize: '13px'
            }}
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--color-surface-soft)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
          <button
            onClick={() => setViewMode('kanban')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'kanban' ? 'var(--color-surface)' : 'transparent',
              color: viewMode === 'kanban' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: viewMode === 'kanban' ? 'var(--shadow-sm)' : 'none'
            }}
            title="Kanban Board View"
          >
            <Kanban size={16} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: viewMode === 'table' ? 'var(--color-surface)' : 'transparent',
              color: viewMode === 'table' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              boxShadow: viewMode === 'table' ? 'var(--shadow-sm)' : 'none'
            }}
            title="List Table View"
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
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
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
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
                  minHeight: '440px'
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
                    {colTasks.length}
                  </span>
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

                        {t.projectId && (
                          <div style={{ fontSize: '11.5px', color: 'var(--color-primary)', fontWeight: 600 }}>
                            {t.projectId.name}
                          </div>
                        )}

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
                            <span>{t.estimatedHours}h</span>
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
                                  handleMoveStatus(t._id, nextStatus);
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
                              >
                                Move <MoveRight size={12} />
                              </button>
                            )}

                            {col.status !== 'blocked' && col.status !== 'completed' && (
                              <button
                                onClick={() => handleMoveStatus(t._id, 'blocked')}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: 'var(--color-danger)',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                Block
                              </button>
                            )}

                            {col.status === 'blocked' && (
                              <button
                                onClick={() => handleMoveStatus(t._id, 'in_progress')}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: 'var(--color-info)',
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
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

      {/* Table View */}
      {viewMode === 'table' && (
        <Card padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-soft)' }}>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Task</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Project</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Status</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Priority</th>
                  <th style={{ padding: '12px 18px', textAlign: 'left', color: 'var(--color-text-muted)' }}>Estimate</th>
                  <th style={{ padding: '12px 18px', textAlign: 'right', color: 'var(--color-text-muted)' }}>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => (
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
                    <td style={{ padding: '14px 18px', color: 'var(--color-text-secondary)', fontSize: '12.5px' }}>
                      {t.projectId?.name || 'General Task'}
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
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <select
                        value={t.status}
                        onChange={(e) => handleMoveStatus(t._id, e.target.value as any)}
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
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
