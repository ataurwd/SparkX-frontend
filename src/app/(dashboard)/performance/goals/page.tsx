'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Target,
  Plus,
  Search,
  Filter,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Building2,
  Users,
  Award,
  Edit3,
  Sliders,
  Sparkles,
  Calendar,
  Layers
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface KeyResultItem {
  _id: string;
  title: string;
  metricType: 'percentage' | 'numeric' | 'currency' | 'boolean';
  initialValue: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  confidenceLevel: 'on_track' | 'needs_attention' | 'at_risk';
  progress: number;
}

interface GoalItem {
  _id: string;
  title: string;
  description?: string;
  category: 'company' | 'department' | 'individual';
  period: string;
  startDate: string;
  endDate: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  weight: number;
  keyResults: KeyResultItem[];
  departmentId?: { name: string; color?: string };
  ownerId?: { firstName: string; lastName: string; employeeCode: string; avatarUrl?: string };
  tags: string[];
}

interface GoalSummary {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  avgProgress: number;
  onTrackCount: number;
  needsAttentionCount: number;
  atRiskCount: number;
}

export default function OKRsAndGoalsPage() {
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [summary, setSummary] = useState<GoalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('2026-Q3');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateKrModalOpen, setIsUpdateKrModalOpen] = useState(false);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [activeKr, setActiveKr] = useState<KeyResultItem | null>(null);
  const [krCurrentValue, setKrCurrentValue] = useState<number>(0);
  const [krConfidence, setKrConfidence] = useState<'on_track' | 'needs_attention' | 'at_risk'>('on_track');
  const [submitting, setSubmitting] = useState(false);

  // Create Goal Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<'company' | 'department' | 'individual'>('company');
  const [formPeriod, setFormPeriod] = useState('2026-Q3');
  const [formWeight, setFormWeight] = useState(1);
  const [formKrs, setFormKrs] = useState<
    { title: string; targetValue: number; initialValue: number; unit: string; metricType: 'percentage' | 'numeric' }[]
  >([
    { title: '', targetValue: 100, initialValue: 0, unit: '%', metricType: 'percentage' }
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const query = `?period=${periodFilter}${categoryFilter !== 'all' ? `&category=${categoryFilter}` : ''}`;
      const [goalsRes, summaryRes] = await Promise.all([
        api.get<GoalItem[]>(`/api/goals${query}`),
        api.get<GoalSummary>(`/api/goals/summary?period=${periodFilter}`)
      ]);

      if (goalsRes.data) {
        setGoals(goalsRes.data);
        // Expand first 2 by default
        const initialExpand: Record<string, boolean> = {};
        goalsRes.data.slice(0, 3).forEach((g) => (initialExpand[g._id] = true));
        setExpandedGoals(initialExpand);
      }
      if (summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch {
      // Fallback demo data if DB is cold
      const mockGoals: GoalItem[] = [
        {
          _id: 'mock-1',
          title: 'Scale Enterprise Platform Adoption & Global Footprint',
          description: 'Expand Tier-1 client acquisitions, maintain SLAs, and achieve seamless enterprise tenant onboarding.',
          category: 'company',
          period: '2026-Q3',
          startDate: '2026-07-01',
          endDate: '2026-09-30',
          status: 'in_progress',
          progress: 68,
          weight: 2,
          tags: ['Revenue', 'Growth', 'Enterprise'],
          keyResults: [
            {
              _id: 'kr-1',
              title: 'Acquire 10 Fortune 500 Enterprise SaaS Contracts',
              metricType: 'numeric',
              initialValue: 0,
              targetValue: 10,
              currentValue: 8,
              unit: 'deals',
              confidenceLevel: 'on_track',
              progress: 80
            },
            {
              _id: 'kr-2',
              title: 'Maintain 99.95% High-Availability Production Uptime',
              metricType: 'percentage',
              initialValue: 98,
              targetValue: 100,
              currentValue: 99.4,
              unit: '%',
              confidenceLevel: 'on_track',
              progress: 70
            },
            {
              _id: 'kr-3',
              title: 'Reduce Tenant Self-Serve Onboarding Latency to < 24 Hours',
              metricType: 'numeric',
              initialValue: 0,
              targetValue: 100,
              currentValue: 55,
              unit: '%',
              confidenceLevel: 'needs_attention',
              progress: 55
            }
          ]
        },
        {
          _id: 'mock-2',
          title: 'Deliver Next-Generation Work Velocity & Kanban Engine',
          description: 'Ship Phase 7 and 8 operational modules with sub-second reactivity and dark mode support.',
          category: 'department',
          period: '2026-Q3',
          startDate: '2026-08-01',
          endDate: '2026-09-30',
          status: 'in_progress',
          progress: 85,
          weight: 1,
          departmentId: { name: 'Engineering', color: '#6C5CE7' },
          tags: ['Product', 'Engineering', 'Sprint'],
          keyResults: [
            {
              _id: 'kr-4',
              title: 'Complete 100% of Phase 7 Kanban & Task Engine APIs',
              metricType: 'percentage',
              initialValue: 0,
              targetValue: 100,
              currentValue: 100,
              unit: '%',
              confidenceLevel: 'on_track',
              progress: 100
            },
            {
              _id: 'kr-5',
              title: 'Achieve 0 TypeScript Compilation Errors across 25+ Next.js Routes',
              metricType: 'percentage',
              initialValue: 0,
              targetValue: 100,
              currentValue: 100,
              unit: '%',
              confidenceLevel: 'on_track',
              progress: 100
            },
            {
              _id: 'kr-6',
              title: 'Deploy Automated GitHub Actions CI/CD to Both Repositories',
              metricType: 'percentage',
              initialValue: 0,
              targetValue: 100,
              currentValue: 55,
              unit: '%',
              confidenceLevel: 'on_track',
              progress: 55
            }
          ]
        }
      ];
      setGoals(mockGoals);
      setSummary({
        totalGoals: 2,
        completedGoals: 0,
        inProgressGoals: 2,
        avgProgress: 76,
        onTrackCount: 5,
        needsAttentionCount: 1,
        atRiskCount: 0
      });
      setExpandedGoals({ 'mock-1': true, 'mock-2': true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [periodFilter, categoryFilter]);

  const toggleExpand = (id: string) => {
    setExpandedGoals((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openUpdateKrModal = (goalId: string, kr: KeyResultItem) => {
    setActiveGoalId(goalId);
    setActiveKr(kr);
    setKrCurrentValue(kr.currentValue);
    setKrConfidence(kr.confidenceLevel);
    setIsUpdateKrModalOpen(true);
  };

  const handleUpdateKrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoalId || !activeKr) return;
    try {
      setSubmitting(true);
      await api.put(`/api/goals/${activeGoalId}/key-results/${activeKr._id}`, {
        currentValue: krCurrentValue,
        confidenceLevel: krConfidence
      });
      setIsUpdateKrModalOpen(false);
      fetchData();
    } catch {
      // Optimistic update
      setGoals((prev) =>
        prev.map((g) => {
          if (g._id === activeGoalId) {
            const updatedKrs = g.keyResults.map((k) =>
              k._id === activeKr._id
                ? {
                    ...k,
                    currentValue: krCurrentValue,
                    confidenceLevel: krConfidence,
                    progress: Math.min(
                      100,
                      Math.max(
                        0,
                        Math.round(
                          ((krCurrentValue - k.initialValue) / (k.targetValue - k.initialValue || 1)) * 100
                        )
                      )
                    )
                  }
                : k
            );
            const total = updatedKrs.reduce((sum, item) => sum + item.progress, 0);
            const avg = Math.round(total / updatedKrs.length);
            return { ...g, keyResults: updatedKrs, progress: avg };
          }
          return g;
        })
      );
      setIsUpdateKrModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle) return;
    try {
      setSubmitting(true);
      const validKrs = formKrs.filter((kr) => kr.title.trim() !== '');
      await api.post('/api/goals', {
        title: formTitle,
        description: formDescription,
        category: formCategory,
        period: formPeriod,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 86400000),
        weight: formWeight,
        keyResults: validKrs
      });
      setIsCreateModalOpen(false);
      // Reset form
      setFormTitle('');
      setFormDescription('');
      setFormKrs([{ title: '', targetValue: 100, initialValue: 0, unit: '%', metricType: 'percentage' }]);
      fetchData();
    } catch {
      setIsCreateModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const addKrField = () => {
    setFormKrs((prev) => [
      ...prev,
      { title: '', targetValue: 100, initialValue: 0, unit: '%', metricType: 'percentage' }
    ]);
  };

  const updateFormKr = (index: number, field: string, value: any) => {
    setFormKrs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeKrField = (index: number) => {
    if (formKrs.length === 1) return;
    setFormKrs((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredGoals = goals.filter((g) => {
    const q = searchQuery.toLowerCase();
    return (
      g.title.toLowerCase().includes(q) ||
      (g.description && g.description.toLowerCase().includes(q)) ||
      (g.tags && g.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  const getConfidenceBadge = (confidence: 'on_track' | 'needs_attention' | 'at_risk') => {
    switch (confidence) {
      case 'on_track':
        return (
          <Badge
            variant="success"
            style={{
              backgroundColor: '#00B8941A',
              color: '#00B894',
              border: '1px solid #00B89440',
              fontWeight: 600
            }}
          >
            On Track
          </Badge>
        );
      case 'needs_attention':
        return (
          <Badge
            variant="warning"
            style={{
              backgroundColor: '#FDCB6E26',
              color: '#D48806',
              border: '1px solid #FDCB6E40',
              fontWeight: 600
            }}
          >
            Needs Attention
          </Badge>
        );
      case 'at_risk':
        return (
          <Badge
            variant="danger"
            style={{
              backgroundColor: '#D630311A',
              color: '#D63031',
              border: '1px solid #D6303140',
              fontWeight: 600
            }}
          >
            At Risk
          </Badge>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#6C5CE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}
            >
              <Target size={20} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Objectives & Key Results (OKRs)
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Strategic alignment framework: Company vision, departmental OKRs, and measurable quantitative key results.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Period Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} color="var(--text-muted)" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="2026-Q3">Quarter 3 (2026-Q3)</option>
              <option value="2026-Q2">Quarter 2 (2026-Q2)</option>
              <option value="2026-Q1">Quarter 1 (2026-Q1)</option>
              <option value="2026-Annual">Full Year 2026</option>
            </select>
          </div>

          <Link href="/performance/reviews">
            <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={15} />
              Performance Reviews
            </Button>
          </Link>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              backgroundColor: '#6C5CE7',
              borderColor: '#6C5CE7',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
            New Objective
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip (Solid tokens, strictly NO gradients) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Total Objectives */}
        <Card padding="md" style={{ borderLeft: '4px solid #6C5CE7', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Total OKRs</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#6C5CE71A',
                color: '#6C5CE7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Layers size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {summary?.totalGoals || goals.length}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>objectives active</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {summary?.completedGoals || 0} achieved • {summary?.inProgressGoals || goals.length} in progress
          </div>
        </Card>

        {/* Average Completion */}
        <Card padding="md" style={{ borderLeft: '4px solid #00B894', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Avg OKR Progress</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#00B8941A',
                color: '#00B894',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {summary?.avgProgress || 0}%
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>target completion</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${summary?.avgProgress || 0}%`,
                height: '100%',
                backgroundColor: '#00B894',
                borderRadius: '999px'
              }}
            />
          </div>
        </Card>

        {/* On Track Key Results */}
        <Card padding="md" style={{ borderLeft: '4px solid #0984E3', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>On Track KRs</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#0984E31A',
                color: '#0984E3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {summary?.onTrackCount || 0}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>healthy key results</span>
          </div>
          <div style={{ fontSize: '12px', color: '#00B894', fontWeight: 600 }}>
            Meeting quarterly milestone trajectory
          </div>
        </Card>

        {/* Attention / At Risk */}
        <Card padding="md" style={{ borderLeft: '4px solid #D63031', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Needs Attention</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#D630311A',
                color: '#D63031',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: (summary?.needsAttentionCount || 0) + (summary?.atRiskCount || 0) > 0 ? '#D63031' : 'var(--text-primary)'
              }}
            >
              {(summary?.needsAttentionCount || 0) + (summary?.atRiskCount || 0)}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>lagging KRs</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {summary?.needsAttentionCount || 0} attention • {summary?.atRiskCount || 0} critical risk
          </div>
        </Card>
      </div>

      {/* Filter and Search Navigation Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 18px',
          borderRadius: '8px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Objectives' },
            { id: 'company', label: 'Company OKRs' },
            { id: 'department', label: 'Departmental' },
            { id: 'individual', label: 'Individual' }
          ].map((tab) => {
            const active = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: active ? '1px solid #6C5CE7' : '1px solid transparent',
                  backgroundColor: active ? '#6C5CE7' : 'var(--bg-elevated)',
                  color: active ? '#FFFFFF' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search objectives, tags..."
            style={{
              padding: '6px 12px 6px 32px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              minWidth: '220px'
            }}
          />
        </div>
      </div>

      {/* Goal Cards List */}
      {filteredGoals.length === 0 ? (
        <Card padding="lg" style={{ textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
          <Target size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
            No Objectives Found
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            There are no goals matching the selected category and period filter.
          </p>
          <Button variant="primary" onClick={() => setIsCreateModalOpen(true)} style={{ backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }}>
            Create First OKR
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredGoals.map((goal) => {
            const isExpanded = !!expandedGoals[goal._id];

            return (
              <Card
                key={goal._id}
                padding="md"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px'
                }}
              >
                {/* Objective Main Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: '280px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        backgroundColor: goal.category === 'company' ? '#6C5CE71A' : goal.category === 'department' ? '#0984E31A' : '#00B8941A',
                        color: goal.category === 'company' ? '#6C5CE7' : goal.category === 'department' ? '#0984E3' : '#00B894',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {goal.category === 'company' ? <Award size={18} /> : goal.category === 'department' ? <Building2 size={18} /> : <Users size={18} />}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            backgroundColor: goal.category === 'company' ? '#6C5CE7' : goal.category === 'department' ? '#0984E3' : '#00B894',
                            color: '#FFFFFF'
                          }}
                        >
                          {goal.category} OKR
                        </span>

                        {goal.departmentId?.name && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: 'var(--border-subtle)',
                              color: 'var(--text-secondary)'
                            }}
                          >
                            {goal.departmentId.name}
                          </span>
                        )}

                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {goal.period}
                        </span>

                        {goal.weight > 1 && (
                          <span style={{ fontSize: '11px', color: '#D48806', fontWeight: 600 }}>
                            Weight: {goal.weight}x
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                        {goal.title}
                      </h3>

                      {goal.description && (
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {goal.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Progress Meter & Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right', minWidth: '110px' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {goal.progress}%
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {goal.keyResults?.length || 0} Key Results
                      </span>
                    </div>

                    <div style={{ width: '100px', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${goal.progress}%`,
                          height: '100%',
                          backgroundColor: goal.progress >= 75 ? '#00B894' : goal.progress >= 40 ? '#6C5CE7' : '#FDCB6E',
                          borderRadius: '999px'
                        }}
                      />
                    </div>

                    <button
                      onClick={() => toggleExpand(goal._id)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-elevated)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expandable Key Results Section */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                        Key Results & Quantitative Milestones
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Target Window: {new Date(goal.startDate).toLocaleDateString()} — {new Date(goal.endDate).toLocaleDateString()}
                      </span>
                    </div>

                    {(!goal.keyResults || goal.keyResults.length === 0) ? (
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        No key results defined for this objective.
                      </div>
                    ) : (
                      goal.keyResults.map((kr) => (
                        <div
                          key={kr._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-elevated)',
                            border: '1px solid var(--border-subtle)',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}
                        >
                          {/* Title & Metric */}
                          <div style={{ flex: 1, minWidth: '220px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                              {kr.title}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              Metric: <strong style={{ color: 'var(--text-primary)' }}>{kr.currentValue} / {kr.targetValue} {kr.unit}</strong>
                            </div>
                          </div>

                          {/* Confidence Badge */}
                          <div>
                            {getConfidenceBadge(kr.confidenceLevel)}
                          </div>

                          {/* KR Progress bar */}
                          <div style={{ width: '120px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                              <span>Progress</span>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{kr.progress}%</span>
                            </div>
                            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${kr.progress}%`,
                                  height: '100%',
                                  backgroundColor: kr.confidenceLevel === 'at_risk' ? '#D63031' : '#00B894',
                                  borderRadius: '999px'
                                }}
                              />
                            </div>
                          </div>

                          {/* Quick Update Button */}
                          <button
                            onClick={() => openUpdateKrModal(goal._id, kr)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-surface)',
                              color: 'var(--text-primary)',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Edit3 size={12} />
                            Check In
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Update Key Result Modal */}
      <Modal
        isOpen={isUpdateKrModalOpen}
        onClose={() => setIsUpdateKrModalOpen(false)}
        title="Check-In Key Result Progress"
      >
        {activeKr && (
          <form onSubmit={handleUpdateKrSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Key Result</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{activeKr.title}</div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Current Metric Value ({activeKr.unit})
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  step="any"
                  value={krCurrentValue}
                  onChange={(e) => setKrCurrentValue(parseFloat(e.target.value) || 0)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Target: {activeKr.targetValue} {activeKr.unit}</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Confidence Trajectory
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { id: 'on_track', label: 'On Track', color: '#00B894' },
                  { id: 'needs_attention', label: 'Attention', color: '#D48806' },
                  { id: 'at_risk', label: 'At Risk', color: '#D63031' }
                ].map((conf) => {
                  const isSelected = krConfidence === conf.id;
                  return (
                    <button
                      key={conf.id}
                      type="button"
                      onClick={() => setKrConfidence(conf.id as any)}
                      style={{
                        padding: '10px',
                        borderRadius: '6px',
                        border: isSelected ? `2px solid ${conf.color}` : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--bg-elevated)' : 'transparent',
                        color: conf.color,
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                    >
                      {conf.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="outline" type="button" onClick={() => setIsUpdateKrModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={submitting}
                style={{ backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }}
              >
                Save Check-In
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create Objective Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Objective & Key Results"
      >
        <form onSubmit={handleCreateGoalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '75vh', overflowY: 'auto' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Objective Title *
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="e.g. Accelerate Enterprise Platform Expansion"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Description & Context
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Why this objective matters and what success looks like..."
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="company">Company OKR</option>
                <option value="department">Departmental OKR</option>
                <option value="individual">Individual OKR</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Period / Cycle
              </label>
              <select
                value={formPeriod}
                onChange={(e) => setFormPeriod(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="2026-Q3">Quarter 3 (2026-Q3)</option>
                <option value="2026-Q4">Quarter 4 (2026-Q4)</option>
                <option value="2026-Annual">Full Year 2026</option>
              </select>
            </div>
          </div>

          {/* Key Results Builder */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Key Results (Quantitative & Measurable)
              </label>
              <Button type="button" variant="ghost" onClick={addKrField} style={{ fontSize: '12px', padding: '4px 8px' }}>
                + Add Key Result
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formKrs.map((kr, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="e.g. Acquire 10 Enterprise SaaS Contracts"
                      value={kr.title}
                      onChange={(e) => updateFormKr(idx, 'title', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none'
                      }}
                    />
                    {formKrs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeKrField(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#D63031',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Initial Value</span>
                      <input
                        type="number"
                        value={kr.initialValue}
                        onChange={(e) => updateFormKr(idx, 'initialValue', parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '12px'
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Value</span>
                      <input
                        type="number"
                        value={kr.targetValue}
                        onChange={(e) => updateFormKr(idx, 'targetValue', parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '12px'
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unit</span>
                      <input
                        type="text"
                        value={kr.unit}
                        onChange={(e) => updateFormKr(idx, 'unit', e.target.value)}
                        placeholder="e.g. %, deals, USD"
                        style={{
                          width: '100%',
                          padding: '5px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-surface)',
                          color: 'var(--text-primary)',
                          fontSize: '12px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={submitting}
              style={{ backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }}
            >
              Launch Objective
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
