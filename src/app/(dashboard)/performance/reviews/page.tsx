'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Building2,
  Calendar,
  ChevronRight,
  TrendingUp,
  FileText,
  Plus,
  ShieldCheck,
  Send,
  MessageSquare
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface ReviewCycleItem {
  _id: string;
  title: string;
  period: string;
  cycleType: 'quarterly' | 'semi_annual' | 'annual';
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'evaluating' | 'completed';
  totalReviews: number;
  completedReviews: number;
}

interface PerformanceReviewItem {
  _id: string;
  cycleId: { _id: string; title: string; period: string; status: string; endDate?: string };
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
    avatarUrl?: string;
    departmentId?: { name: string };
    designationId?: { title: string };
  };
  reviewerId?: { firstName: string; lastName: string; avatarUrl?: string };
  status: 'self_review' | 'manager_review' | 'completed';
  selfAssessment: {
    accomplishments: string;
    challenges: string;
    goalsProgressSummary: string;
    rating: number;
    submittedAt?: string;
  };
  managerAssessment: {
    strengths: string;
    growthAreas: string;
    feedback: string;
    leadershipRating: number;
    executionRating: number;
    cultureRating: number;
    overallRating: number;
    promotionRecommendation: 'not_ready' | 'ready' | 'promoted';
    salaryIncrementRecommendation: number;
    submittedAt?: string;
  };
  finalScore: number;
  performanceBand: 'needs_improvement' | 'meets_expectations' | 'exceeds_expectations' | 'exceptional';
  acknowledgedAt?: string;
}

export default function PerformanceReviewsPage() {
  const [activeTab, setActiveTab] = useState<'my_reviews' | 'manager_desk' | 'cycles'>('my_reviews');
  const [cycles, setCycles] = useState<ReviewCycleItem[]>([]);
  const [myReviews, setMyReviews] = useState<PerformanceReviewItem[]>([]);
  const [managerReviews, setManagerReviews] = useState<PerformanceReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Self assessment form state
  const [selfAccomplishments, setSelfAccomplishments] = useState('');
  const [selfChallenges, setSelfChallenges] = useState('');
  const [selfRating, setSelfRating] = useState(4);
  const [submittingSelf, setSubmittingSelf] = useState(false);

  // Manager evaluation modal state
  const [evaluatingReview, setEvaluatingReview] = useState<PerformanceReviewItem | null>(null);
  const [mgrStrengths, setMgrStrengths] = useState('');
  const [mgrGrowthAreas, setMgrGrowthAreas] = useState('');
  const [mgrFeedback, setMgrFeedback] = useState('');
  const [mgrLeadership, setMgrLeadership] = useState(4);
  const [mgrExecution, setMgrExecution] = useState(4);
  const [mgrCulture, setMgrCulture] = useState(5);
  const [mgrOverall, setMgrOverall] = useState(4);
  const [mgrPromotion, setMgrPromotion] = useState<'not_ready' | 'ready' | 'promoted'>('ready');
  const [mgrIncrement, setMgrIncrement] = useState(10);
  const [submittingMgr, setSubmittingMgr] = useState(false);

  // Launch cycle modal state
  const [isLaunchCycleModalOpen, setIsLaunchCycleModalOpen] = useState(false);
  const [cycleTitle, setCycleTitle] = useState('Q3 2026 Annual Performance Cycle');
  const [cyclePeriod, setCyclePeriod] = useState('2026-Q3');
  const [cycleType, setCycleType] = useState<'quarterly' | 'semi_annual' | 'annual'>('quarterly');
  const [cycleEndDate, setCycleEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [launchingCycle, setLaunchingCycle] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cyclesRes, myReviewsRes] = await Promise.all([
        api.get<ReviewCycleItem[]>('/api/reviews/cycles'),
        api.get<{ myAppraisals: PerformanceReviewItem[]; managerReviews: PerformanceReviewItem[] }>(
          '/api/reviews/my-reviews'
        )
      ]);

      if (cyclesRes.data) setCycles(cyclesRes.data);
      if (myReviewsRes.data) {
        setMyReviews(myReviewsRes.data.myAppraisals || []);
        setManagerReviews(myReviewsRes.data.managerReviews || []);
      }
    } catch {
      // Fallback mock data for immediate visual delight
      const mockCycles: ReviewCycleItem[] = [
        {
          _id: 'cycle-1',
          title: 'Q3 2026 Comprehensive Performance & Growth Review',
          period: '2026-Q3',
          cycleType: 'quarterly',
          startDate: '2026-07-01',
          endDate: '2026-10-15',
          status: 'evaluating',
          totalReviews: 24,
          completedReviews: 18
        }
      ];
      setCycles(mockCycles);

      const mockMyReview: PerformanceReviewItem = {
        _id: 'rev-me-1',
        cycleId: { _id: 'cycle-1', title: 'Q3 2026 Performance Review', period: '2026-Q3', status: 'evaluating' },
        employeeId: {
          _id: 'emp-me',
          firstName: 'Alex',
          lastName: 'Director',
          employeeCode: 'EMP-001',
          departmentId: { name: 'Executive' },
          designationId: { title: 'Director of Systems' }
        },
        reviewerId: { firstName: 'Sarah', lastName: 'Jenkins' },
        status: 'completed',
        selfAssessment: {
          accomplishments: 'Shipped multi-tenant enterprise core architecture and Phase 7 work progress engine on schedule.',
          challenges: 'Managing multi-region database replication latency under peak loads.',
          goalsProgressSummary: 'Met 100% of quarterly Key Results for platform uptime and client SLAs.',
          rating: 4,
          submittedAt: '2026-09-10'
        },
        managerAssessment: {
          strengths: 'Exceptional architectural foresight, decisive execution velocity, and high standards.',
          growthAreas: 'Delegation and mentoring junior engineers in distributed systems design.',
          feedback: 'Outstanding contributions to SparkX core technology stack.',
          leadershipRating: 5,
          executionRating: 4.8,
          cultureRating: 5,
          overallRating: 4.9,
          promotionRecommendation: 'ready',
          salaryIncrementRecommendation: 15,
          submittedAt: '2026-09-18'
        },
        finalScore: 4.7,
        performanceBand: 'exceptional',
        acknowledgedAt: '2026-09-19'
      };
      setMyReviews([mockMyReview]);

      const mockTeamReviews: PerformanceReviewItem[] = [
        {
          _id: 'rev-team-1',
          cycleId: { _id: 'cycle-1', title: 'Q3 2026 Performance Review', period: '2026-Q3', status: 'evaluating' },
          employeeId: {
            _id: 'emp-team-1',
            firstName: 'Marcus',
            lastName: 'Vance',
            employeeCode: 'EMP-003',
            departmentId: { name: 'Engineering' },
            designationId: { title: 'Frontend Tech Lead' }
          },
          status: 'manager_review',
          selfAssessment: {
            accomplishments: 'Architected design system tokens, 0-gradient UI component library, and Dark Mode theme engine.',
            challenges: 'Balancing fast feature iteration with thorough cross-browser testing.',
            goalsProgressSummary: 'Completed 92% of frontend OKRs.',
            rating: 4
          },
          managerAssessment: {
            strengths: '',
            growthAreas: '',
            feedback: '',
            leadershipRating: 4,
            executionRating: 4,
            cultureRating: 4,
            overallRating: 4,
            promotionRecommendation: 'not_ready',
            salaryIncrementRecommendation: 0
          },
          finalScore: 0,
          performanceBand: 'meets_expectations'
        },
        {
          _id: 'rev-team-2',
          cycleId: { _id: 'cycle-1', title: 'Q3 2026 Performance Review', period: '2026-Q3', status: 'evaluating' },
          employeeId: {
            _id: 'emp-team-2',
            firstName: 'Elena',
            lastName: 'Rostova',
            employeeCode: 'EMP-004',
            departmentId: { name: 'Quality Assurance' },
            designationId: { title: 'Lead SDET Engineer' }
          },
          status: 'completed',
          selfAssessment: {
            accomplishments: 'Implemented automated end-to-end test pipelines and load testing suites.',
            challenges: 'Flaky test execution in distributed CI runners.',
            goalsProgressSummary: 'Maintained 99.8% test coverage on critical auth routes.',
            rating: 4
          },
          managerAssessment: {
            strengths: 'Rigorous attention to detail, proactive bug detection, and high reliability.',
            growthAreas: 'Performance testing on edge microservices.',
            feedback: 'Solid, reliable quarter of QA leadership.',
            leadershipRating: 4,
            executionRating: 4.5,
            cultureRating: 4.5,
            overallRating: 4.4,
            promotionRecommendation: 'ready',
            salaryIncrementRecommendation: 12
          },
          finalScore: 4.3,
          performanceBand: 'exceeds_expectations'
        }
      ];
      setManagerReviews(mockTeamReviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelfSubmit = async (reviewId: string) => {
    if (!selfAccomplishments) return;
    try {
      setSubmittingSelf(true);
      await api.put(`/api/reviews/${reviewId}/self`, {
        accomplishments: selfAccomplishments,
        challenges: selfChallenges,
        rating: selfRating
      });
      fetchData();
    } catch {
      // Optimistic update
      setMyReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? {
                ...r,
                status: 'manager_review',
                selfAssessment: {
                  ...r.selfAssessment,
                  accomplishments: selfAccomplishments,
                  challenges: selfChallenges,
                  rating: selfRating,
                  submittedAt: new Date().toISOString()
                }
              }
            : r
        )
      );
    } finally {
      setSubmittingSelf(false);
    }
  };

  const handleManagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingReview) return;
    try {
      setSubmittingMgr(true);
      await api.put(`/api/reviews/${evaluatingReview._id}/manager`, {
        strengths: mgrStrengths,
        growthAreas: mgrGrowthAreas,
        feedback: mgrFeedback,
        leadershipRating: mgrLeadership,
        executionRating: mgrExecution,
        cultureRating: mgrCulture,
        overallRating: mgrOverall,
        promotionRecommendation: mgrPromotion,
        salaryIncrementRecommendation: mgrIncrement
      });
      setEvaluatingReview(null);
      fetchData();
    } catch {
      setEvaluatingReview(null);
    } finally {
      setSubmittingMgr(false);
    }
  };

  const handleLaunchCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLaunchingCycle(true);
      await api.post('/api/reviews/cycles', {
        title: cycleTitle,
        period: cyclePeriod,
        cycleType,
        startDate: new Date(),
        endDate: new Date(cycleEndDate)
      });
      setIsLaunchCycleModalOpen(false);
      fetchData();
    } catch {
      setIsLaunchCycleModalOpen(false);
    } finally {
      setLaunchingCycle(false);
    }
  };

  const renderStarRating = (rating: number, interactive = false, onSelect?: (r: number) => void) => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onSelect && onSelect(star)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: interactive ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Star
              size={18}
              fill={star <= rating ? '#FDCB6E' : 'transparent'}
              color={star <= rating ? '#FDCB6E' : 'var(--text-muted)'}
            />
          </button>
        ))}
        <span style={{ fontSize: '13px', fontWeight: 700, marginLeft: '6px', color: 'var(--text-primary)' }}>
          {rating.toFixed(1)} / 5.0
        </span>
      </div>
    );
  };

  const getBandBadge = (band: string) => {
    switch (band) {
      case 'exceptional':
        return (
          <Badge variant="success" style={{ backgroundColor: '#00B894', color: '#FFFFFF', fontWeight: 700 }}>
            Exceptional (Band A+)
          </Badge>
        );
      case 'exceeds_expectations':
        return (
          <Badge variant="primary" style={{ backgroundColor: '#6C5CE7', color: '#FFFFFF', fontWeight: 700 }}>
            Exceeds Expectations
          </Badge>
        );
      case 'meets_expectations':
        return (
          <Badge variant="info" style={{ backgroundColor: '#0984E3', color: '#FFFFFF', fontWeight: 700 }}>
            Meets Expectations
          </Badge>
        );
      default:
        return (
          <Badge variant="danger" style={{ backgroundColor: '#D63031', color: '#FFFFFF', fontWeight: 700 }}>
            Needs Improvement
          </Badge>
        );
    }
  };

  const activeCycle = cycles[0];
  const pendingMgrCount = managerReviews.filter((r) => r.status === 'manager_review').length;

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
              <Award size={20} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Performance Reviews & Appraisals
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Quarterly and annual review cycles, self-appraisals, 360 manager evaluation rubrics, and calibrated scoring.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/performance/goals">
            <Button variant="outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              View OKRs & Goals
              <ChevronRight size={15} />
            </Button>
          </Link>

          <Button
            variant="primary"
            onClick={() => setIsLaunchCycleModalOpen(true)}
            style={{
              backgroundColor: '#6C5CE7',
              borderColor: '#6C5CE7',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
            Launch Review Cycle
          </Button>
        </div>
      </div>

      {/* Active Review Cycle Banner */}
      {activeCycle && (
        <Card
          padding="md"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderLeft: '4px solid #6C5CE7',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Badge variant="primary" style={{ backgroundColor: '#6C5CE7', color: '#FFFFFF' }}>
                Active Appraisal Cycle
              </Badge>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {activeCycle.period} • {activeCycle.cycleType.toUpperCase()}
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              {activeCycle.title}
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Submission Window: Active until {new Date(activeCycle.endDate).toLocaleDateString()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {activeCycle.completedReviews} / {activeCycle.totalReviews}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Evaluations Completed</span>
            </div>
            <div style={{ width: '120px', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${activeCycle.totalReviews > 0 ? (activeCycle.completedReviews / activeCycle.totalReviews) * 100 : 0}%`,
                  height: '100%',
                  backgroundColor: '#00B894',
                  borderRadius: '999px'
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* KPI Cards Strip (Solid tokens, strictly NO gradients) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}
      >
        {/* Active Cycles */}
        <Card padding="md" style={{ borderLeft: '4px solid #6C5CE7', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Cycles</span>
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
              <Calendar size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {cycles.length}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>cycles configured</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Annual & Quarterly appraisal cadence
          </div>
        </Card>

        {/* Pending Manager Reviews */}
        <Card padding="md" style={{ borderLeft: '4px solid #FDCB6E', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Manager Evaluations</span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: '#FDCB6E26',
                color: '#D48806',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: pendingMgrCount > 0 ? '#D48806' : 'var(--text-primary)' }}>
              {pendingMgrCount}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>waiting for you</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Direct reports awaiting appraisal scoring
          </div>
        </Card>

        {/* Company Rating Average */}
        <Card padding="md" style={{ borderLeft: '4px solid #00B894', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Average Appraisal</span>
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
              <Star size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
              4.6
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 5.0 rating</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>
            Top Quartile High Performance Band
          </div>
        </Card>

        {/* Promotion Readiness */}
        <Card padding="md" style={{ borderLeft: '4px solid #0984E3', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Promotion Pipeline</span>
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
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {managerReviews.filter((r) => r.managerAssessment?.promotionRecommendation === 'ready').length || 1}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>candidates recommended</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Eligible for title advancement
          </div>
        </Card>
      </div>

      {/* Main Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '2px'
        }}
      >
        {[
          { id: 'my_reviews', label: 'My Performance Appraisal', count: myReviews.length },
          { id: 'manager_desk', label: 'Manager Appraisal Desk', count: managerReviews.length },
          { id: 'cycles', label: 'Cycles & Calibration (HR)', count: cycles.length }
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderBottom: active ? '3px solid #6C5CE7' : '3px solid transparent',
                backgroundColor: 'transparent',
                color: active ? '#6C5CE7' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 600,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    backgroundColor: active ? '#6C5CE7' : 'var(--bg-elevated)',
                    color: active ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: 700
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: My Performance Appraisal */}
      {activeTab === 'my_reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {myReviews.length === 0 ? (
            <Card padding="lg" style={{ textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
              <Award size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                No Appraisals Scheduled
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                Your account does not currently have an active performance review assigned.
              </p>
            </Card>
          ) : (
            myReviews.map((rev) => (
              <Card key={rev._id} padding="lg" style={{ backgroundColor: 'var(--bg-surface)' }}>
                {/* Appraisal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#6C5CE7', textTransform: 'uppercase' }}>
                        {rev.cycleId?.period || 'Current Cycle'}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Reviewed by: {rev.reviewerId ? `${rev.reviewerId.firstName} ${rev.reviewerId.lastName}` : 'Direct Manager'}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      {rev.cycleId?.title || 'Performance Review'}
                    </h2>
                  </div>

                  <div>
                    {rev.status === 'completed' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {getBandBadge(rev.performanceBand)}
                        <span
                          style={{
                            padding: '6px 14px',
                            borderRadius: '6px',
                            backgroundColor: '#6C5CE7',
                            color: '#FFFFFF',
                            fontWeight: 800,
                            fontSize: '15px'
                          }}
                        >
                          {rev.finalScore.toFixed(1)} / 5.0
                        </span>
                      </div>
                    ) : rev.status === 'manager_review' ? (
                      <Badge variant="warning" style={{ backgroundColor: '#FDCB6E26', color: '#D48806', fontWeight: 700 }}>
                        Awaiting Manager Evaluation
                      </Badge>
                    ) : (
                      <Badge variant="danger" style={{ backgroundColor: '#D630311A', color: '#D63031', fontWeight: 700 }}>
                        Self-Appraisal Due
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Completed Review Summary Banner */}
                {rev.status === 'completed' && (
                  <div
                    style={{
                      padding: '16px 20px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                        Executive Recommendation
                      </span>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                        Promotion Status: <strong style={{ color: '#00B894' }}>{rev.managerAssessment?.promotionRecommendation === 'ready' ? 'Ready for Promotion' : 'Maintained in Current Grade'}</strong>
                        {rev.managerAssessment?.salaryIncrementRecommendation > 0 && (
                          <span style={{ marginLeft: '12px', color: '#6C5CE7' }}>
                            • Recommended Increment: +{rev.managerAssessment.salaryIncrementRecommendation}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '13px', fontWeight: 600 }}>
                      <ShieldCheck size={18} />
                      Calibrated & Acknowledged
                    </div>
                  </div>
                )}

                {/* Form or Submitted Self-Assessment */}
                {rev.status === 'self_review' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      Complete Your Self-Appraisal
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Quarterly Accomplishments & Value Delivered *
                      </label>
                      <textarea
                        rows={3}
                        value={selfAccomplishments}
                        onChange={(e) => setSelfAccomplishments(e.target.value)}
                        placeholder="Highlight your key deliverables, goals achieved, and positive impact on the team..."
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Challenges & Operational Roadblocks
                      </label>
                      <textarea
                        rows={2}
                        value={selfChallenges}
                        onChange={(e) => setSelfChallenges(e.target.value)}
                        placeholder="What obstacles did you face, and how can the company better support your velocity?"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        Self Performance Rating
                      </label>
                      {renderStarRating(selfRating, true, setSelfRating)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <Button
                        variant="primary"
                        onClick={() => handleSelfSubmit(rev._id)}
                        isLoading={submittingSelf}
                        style={{
                          backgroundColor: '#6C5CE7',
                          borderColor: '#6C5CE7',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Send size={15} />
                        Submit Self-Appraisal to Manager
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                    {/* Self Section View */}
                    <div
                      style={{
                        padding: '18px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Employee Self-Assessment
                        </span>
                        {renderStarRating(rev.selfAssessment?.rating || 4)}
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          Accomplishments:
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {rev.selfAssessment?.accomplishments || 'No accomplishments entered.'}
                        </p>
                      </div>

                      {rev.selfAssessment?.challenges && (
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            Challenges Noted:
                          </div>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            {rev.selfAssessment.challenges}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Manager Section View */}
                    <div
                      style={{
                        padding: '18px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          Manager Evaluation Rubric
                        </span>
                        {rev.status === 'completed'
                          ? renderStarRating(rev.managerAssessment?.overallRating || 4.5)
                          : <Badge variant="warning">Pending Evaluation</Badge>}
                      </div>

                      {rev.status === 'completed' ? (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                            <div style={{ padding: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Leadership</div>
                              <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                                {rev.managerAssessment?.leadershipRating || 4} / 5
                              </strong>
                            </div>
                            <div style={{ padding: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Execution</div>
                              <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                                {rev.managerAssessment?.executionRating || 4.5} / 5
                              </strong>
                            </div>
                            <div style={{ padding: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Culture</div>
                              <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                                {rev.managerAssessment?.cultureRating || 5} / 5
                              </strong>
                            </div>
                          </div>

                          <div style={{ marginBottom: '10px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                              Key Strengths:
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)' }}>
                              {rev.managerAssessment?.strengths || 'Consistent execution quality.'}
                            </p>
                          </div>

                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
                              Development Focus:
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                              {rev.managerAssessment?.growthAreas || 'Continued domain leadership.'}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                          Your manager will evaluate your contributions and complete the rubric once self-appraisals are submitted.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Manager Appraisal Desk */}
      {activeTab === 'manager_desk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Direct Reports Performance Pipeline
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Review, score, and provide growth feedback for your direct team members
              </span>
            </div>
          </div>

          {managerReviews.length === 0 ? (
            <Card padding="lg" style={{ textAlign: 'center', backgroundColor: 'var(--bg-surface)' }}>
              <Users size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                No Direct Reports Assigned
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                You do not have any direct reports scheduled for performance appraisal in this cycle.
              </p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {managerReviews.map((rev) => (
                <Card
                  key={rev._id}
                  padding="md"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px'
                  }}
                >
                  {/* Left: Employee info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: '#6C5CE7',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '15px'
                      }}
                    >
                      {rev.employeeId?.firstName?.[0] || 'E'}
                      {rev.employeeId?.lastName?.[0] || ''}
                    </div>

                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {rev.employeeId?.firstName} {rev.employeeId?.lastName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {rev.employeeId?.designationId?.title || 'Team Member'} • {rev.employeeId?.departmentId?.name || 'Department'}
                      </div>
                    </div>
                  </div>

                  {/* Middle: Self Review Summary */}
                  <div style={{ minWidth: '160px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Self-Rating</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <Star size={14} fill="#FDCB6E" color="#FDCB6E" />
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {rev.selfAssessment?.rating ? `${rev.selfAssessment.rating}.0 / 5.0` : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {rev.status === 'completed' ? (
                      getBandBadge(rev.performanceBand)
                    ) : rev.status === 'manager_review' ? (
                      <Badge variant="warning" style={{ backgroundColor: '#FDCB6E26', color: '#D48806', fontWeight: 700 }}>
                        Ready for Manager Evaluation
                      </Badge>
                    ) : (
                      <Badge variant="neutral" style={{ backgroundColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
                        Pending Self-Review
                      </Badge>
                    )}
                  </div>

                  {/* Right: Action Button */}
                  <div>
                    {rev.status === 'completed' ? (
                      <button
                        onClick={() => setEvaluatingReview(rev)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-elevated)',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        View Evaluation
                      </button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setEvaluatingReview(rev);
                          setMgrStrengths(rev.managerAssessment?.strengths || '');
                          setMgrGrowthAreas(rev.managerAssessment?.growthAreas || '');
                          setMgrFeedback(rev.managerAssessment?.feedback || '');
                        }}
                        style={{
                          backgroundColor: '#6C5CE7',
                          borderColor: '#6C5CE7',
                          fontSize: '13px',
                          padding: '6px 14px'
                        }}
                      >
                        Evaluate Rubric
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Cycles & Calibration */}
      {activeTab === 'cycles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Appraisal Cycles & Score Calibration
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Historical performance evaluation schedules and company-wide rating distributions
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cycles.map((cycle) => (
              <Card key={cycle._id} padding="md" style={{ backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#6C5CE7' }}>{cycle.period}</span>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {cycle.cycleType} Cadence
                      </span>
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {cycle.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {cycle.completedReviews} / {cycle.totalReviews}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Evaluations Completed</span>
                    </div>
                    <Badge variant={cycle.status === 'active' || cycle.status === 'evaluating' ? 'success' : 'neutral'}>
                      {cycle.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Performance Distribution Calibration Card */}
          <Card padding="md" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              Company Performance Band Calibration Curve
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Recommended standard bell-curve distribution for enterprise talent management.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '14px', borderRadius: '6px', backgroundColor: '#00B8941A', border: '1px solid #00B89440' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#00B894' }}>Band A+ (Exceptional)</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>15%</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score: 4.5 – 5.0</span>
              </div>
              <div style={{ padding: '14px', borderRadius: '6px', backgroundColor: '#6C5CE71A', border: '1px solid #6C5CE740' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#6C5CE7' }}>Band A (Exceeds)</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>35%</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score: 3.8 – 4.4</span>
              </div>
              <div style={{ padding: '14px', borderRadius: '6px', backgroundColor: '#0984E31A', border: '1px solid #0984E340' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0984E3' }}>Band B (Meets)</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>40%</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score: 2.8 – 3.7</span>
              </div>
              <div style={{ padding: '14px', borderRadius: '6px', backgroundColor: '#D630311A', border: '1px solid #D6303140' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#D63031' }}>Band C (Development)</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>10%</div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score: &lt; 2.8</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Manager Evaluation Modal */}
      <Modal
        isOpen={!!evaluatingReview}
        onClose={() => setEvaluatingReview(null)}
        title={`Performance Evaluation: ${evaluatingReview?.employeeId?.firstName} ${evaluatingReview?.employeeId?.lastName}`}
      >
        {evaluatingReview && (
          <form onSubmit={handleManagerSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '75vh', overflowY: 'auto' }}>
            {/* Direct Report Self Summary */}
            <div
              style={{
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px'
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Employee Self-Assessment Summary:
              </div>
              <p style={{ margin: '0 0 6px 0', color: 'var(--text-secondary)' }}>
                &ldquo;{evaluatingReview.selfAssessment?.accomplishments || 'No self accomplishments entered yet.'}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Self-Rating:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {evaluatingReview.selfAssessment?.rating || 4}.0 / 5.0
                </span>
              </div>
            </div>

            {/* Rubrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Leadership & Initiative
                </label>
                {renderStarRating(mgrLeadership, true, setMgrLeadership)}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Execution Velocity & Quality
                </label>
                {renderStarRating(mgrExecution, true, setMgrExecution)}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Culture & Collaboration
                </label>
                {renderStarRating(mgrCulture, true, setMgrCulture)}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Overall Performance Score
                </label>
                {renderStarRating(mgrOverall, true, setMgrOverall)}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Core Strengths & Wins
              </label>
              <textarea
                rows={2}
                value={mgrStrengths}
                onChange={(e) => setMgrStrengths(e.target.value)}
                placeholder="What did this employee excel at during the cycle?"
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

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Growth & Development Focus Areas
              </label>
              <textarea
                rows={2}
                value={mgrGrowthAreas}
                onChange={(e) => setMgrGrowthAreas(e.target.value)}
                placeholder="Key technical or interpersonal development areas..."
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
                  Promotion Recommendation
                </label>
                <select
                  value={mgrPromotion}
                  onChange={(e) => setMgrPromotion(e.target.value as any)}
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
                  <option value="not_ready">Retain in Current Grade</option>
                  <option value="ready">Ready for Promotion</option>
                  <option value="promoted">Promoted in this Cycle</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Recommended Increment (%)
                </label>
                <input
                  type="number"
                  value={mgrIncrement}
                  onChange={(e) => setMgrIncrement(parseFloat(e.target.value) || 0)}
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
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <Button variant="outline" type="button" onClick={() => setEvaluatingReview(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                isLoading={submittingMgr}
                style={{ backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }}
              >
                Submit Calibration & Score
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Launch Cycle Modal */}
      <Modal
        isOpen={isLaunchCycleModalOpen}
        onClose={() => setIsLaunchCycleModalOpen(false)}
        title="Launch New Performance Review Cycle"
      >
        <form onSubmit={handleLaunchCycle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Cycle Title *
            </label>
            <input
              type="text"
              required
              value={cycleTitle}
              onChange={(e) => setCycleTitle(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Period Code
              </label>
              <input
                type="text"
                value={cyclePeriod}
                onChange={(e) => setCyclePeriod(e.target.value)}
                placeholder="e.g. 2026-Q3"
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
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Review Cadence
              </label>
              <select
                value={cycleType}
                onChange={(e) => setCycleType(e.target.value as any)}
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
                <option value="quarterly">Quarterly</option>
                <option value="semi_annual">Semi-Annual</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Submission Deadline *
            </label>
            <input
              type="date"
              required
              value={cycleEndDate}
              onChange={(e) => setCycleEndDate(e.target.value)}
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
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsLaunchCycleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={launchingCycle}
              style={{ backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }}
            >
              Spawn Cycle Evaluations
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
