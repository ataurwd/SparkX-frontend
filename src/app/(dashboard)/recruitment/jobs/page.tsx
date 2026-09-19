'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Users,
  Plus,
  Search,
  Filter,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  CheckCircle2,
  FileText,
  Video,
  Send,
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  Award
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';

interface JobItem {
  _id: string;
  title: string;
  code: string;
  departmentId?: { name: string; color?: string };
  employmentType: 'full_time' | 'part_time' | 'contract' | 'remote';
  location: string;
  openingsCount: number;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  experienceLevel: string;
  status: 'draft' | 'published' | 'closed';
  totalApplicants: number;
  hiredCount: number;
  createdAt: string;
}

interface CandidateItem {
  _id: string;
  jobId: { _id: string; title: string; code: string };
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  stage: 'applied' | 'screening' | 'interview' | 'technical' | 'final' | 'offer' | 'hired' | 'rejected';
  rating: number;
  offerDetails?: { salary?: number; status?: string; joiningDate?: string };
}

interface InterviewItem {
  _id: string;
  candidateId?: { firstName: string; lastName: string; email: string };
  jobId?: { title: string; code: string };
  title: string;
  type: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  meetingLink?: string;
  location?: string;
  status: string;
}

const STAGES: { id: CandidateItem['stage']; label: string; color: string }[] = [
  { id: 'applied', label: 'Applied', color: '#6C5CE7' },
  { id: 'screening', label: 'Screening', color: '#0984E3' },
  { id: 'interview', label: 'Interview', color: '#FDCB6E' },
  { id: 'technical', label: 'Technical', color: '#E17055' },
  { id: 'final', label: 'Final Round', color: '#A29BFE' },
  { id: 'offer', label: 'Offer Extended', color: '#00B894' },
  { id: 'hired', label: 'Hired', color: '#00B894' }
];

export default function RecruitmentATSPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'pipeline' | 'interviews' | 'offers'>('jobs');
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');

  // Modals
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false);
  const [isAddCandidateModalOpen, setIsAddCandidateModalOpen] = useState(false);
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] = useState(false);
  const [isExtendOfferModalOpen, setIsExtendOfferModalOpen] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState<CandidateItem | null>(null);

  // Forms
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('full_time');
  const [jobLocation, setJobLocation] = useState('New York / Hybrid');
  const [jobOpenings, setJobOpenings] = useState(1);
  const [jobSalaryMin, setJobSalaryMin] = useState(120000);
  const [jobSalaryMax, setJobSalaryMax] = useState(160000);
  const [candFirst, setCandFirst] = useState('');
  const [candLast, setCandLast] = useState('');
  const [candEmail, setCandEmail] = useState('');
  const [candPhone, setCandPhone] = useState('');
  const [candJobId, setCandJobId] = useState('');
  const [intTitle, setIntTitle] = useState('Technical Screening Interview');
  const [intDate, setIntDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [intStart, setIntStart] = useState('11:00');
  const [intEnd, setIntEnd] = useState('12:00');
  const [offerSalary, setOfferSalary] = useState(145000);
  const [offerJoiningDate, setOfferJoiningDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, candRes, intRes] = await Promise.all([
        api.get<JobItem[]>('/api/recruitment/jobs'),
        api.get<CandidateItem[]>('/api/recruitment/candidates'),
        api.get<InterviewItem[]>('/api/recruitment/interviews')
      ]);

      if (jobsRes.data) setJobs(jobsRes.data);
      if (candRes.data) setCandidates(candRes.data);
      if (intRes.data) setInterviews(intRes.data);
    } catch {
      // Demo fallbacks if unseeded
      const demoJobs: JobItem[] = [
        {
          _id: 'job-1',
          title: 'Senior Distributed Systems Architect',
          code: 'SPX-ENG-01',
          departmentId: { name: 'Engineering', color: '#6C5CE7' },
          employmentType: 'full_time',
          location: 'New York / Hybrid',
          openingsCount: 2,
          salaryMin: 140000,
          salaryMax: 180000,
          currency: 'USD',
          experienceLevel: 'senior',
          status: 'published',
          totalApplicants: 14,
          hiredCount: 1,
          createdAt: '2026-09-01'
        },
        {
          _id: 'job-2',
          title: 'Lead Product Experience Designer',
          code: 'SPX-DSG-02',
          departmentId: { name: 'Design', color: '#0984E3' },
          employmentType: 'full_time',
          location: 'San Francisco / Remote',
          openingsCount: 1,
          salaryMin: 125000,
          salaryMax: 155000,
          currency: 'USD',
          experienceLevel: 'lead',
          status: 'published',
          totalApplicants: 8,
          hiredCount: 0,
          createdAt: '2026-09-05'
        }
      ];
      setJobs(demoJobs);

      const demoCandidates: CandidateItem[] = [
        {
          _id: 'cand-1',
          jobId: { _id: 'job-1', title: 'Senior Distributed Systems Architect', code: 'SPX-ENG-01' },
          firstName: 'Samantha',
          lastName: 'Vance',
          email: 'samantha.vance@example.com',
          phone: '+1 (555) 349-2810',
          stage: 'interview',
          rating: 4
        },
        {
          _id: 'cand-2',
          jobId: { _id: 'job-1', title: 'Senior Distributed Systems Architect', code: 'SPX-ENG-01' },
          firstName: 'David',
          lastName: 'Larson',
          email: 'david.larson@example.com',
          phone: '+1 (555) 928-1123',
          stage: 'technical',
          rating: 5
        },
        {
          _id: 'cand-3',
          jobId: { _id: 'job-2', title: 'Lead Product Experience Designer', code: 'SPX-DSG-02' },
          firstName: 'Chloe',
          lastName: 'Dupont',
          email: 'chloe.dupont@example.com',
          phone: '+1 (555) 781-4402',
          stage: 'offer',
          rating: 5,
          offerDetails: { salary: 150000, status: 'sent', joiningDate: '2026-10-15' }
        }
      ];
      setCandidates(demoCandidates);

      const demoInterviews: InterviewItem[] = [
        {
          _id: 'int-1',
          candidateId: { firstName: 'Samantha', lastName: 'Vance', email: 'samantha.vance@example.com' },
          jobId: { title: 'Senior Distributed Systems Architect', code: 'SPX-ENG-01' },
          title: 'System Architecture & Concurrency Deep Dive',
          type: 'video',
          scheduledDate: '2026-09-22',
          startTime: '14:00',
          endTime: '15:00',
          meetingLink: 'https://meet.sparkx.io/interview-svance',
          status: 'scheduled'
        }
      ];
      setInterviews(demoInterviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const advanceCandidate = async (candidateId: string, nextStage: CandidateItem['stage']) => {
    try {
      await api.put(`/api/recruitment/candidates/${candidateId}/stage`, { stage: nextStage });
      fetchData();
    } catch {
      // Optimistic
      setCandidates((prev) =>
        prev.map((c) => (c._id === candidateId ? { ...c, stage: nextStage } : c))
      );
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle) return;
    try {
      setSubmitting(true);
      await api.post('/api/recruitment/jobs', {
        title: jobTitle,
        employmentType: jobType,
        location: jobLocation,
        openingsCount: jobOpenings,
        salaryMin: jobSalaryMin,
        salaryMax: jobSalaryMax,
        status: 'published'
      });
      setIsCreateJobModalOpen(false);
      setJobTitle('');
      fetchData();
    } catch {
      setIsCreateJobModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candFirst || !candLast || !candEmail || !candJobId) return;
    try {
      setSubmitting(true);
      await api.post('/api/recruitment/candidates', {
        jobId: candJobId,
        firstName: candFirst,
        lastName: candLast,
        email: candEmail,
        phone: candPhone
      });
      setIsAddCandidateModalOpen(false);
      setCandFirst('');
      setCandLast('');
      setCandEmail('');
      fetchData();
    } catch {
      setIsAddCandidateModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCandidate) return;
    try {
      setSubmitting(true);
      await api.post('/api/recruitment/interviews', {
        candidateId: activeCandidate._id,
        jobId: activeCandidate.jobId?._id || jobs[0]?._id,
        title: intTitle,
        scheduledDate: intDate,
        startTime: intStart,
        endTime: intEnd
      });
      setIsScheduleInterviewModalOpen(false);
      setActiveCandidate(null);
      fetchData();
    } catch {
      setIsScheduleInterviewModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExtendOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCandidate) return;
    try {
      setSubmitting(true);
      await api.put(`/api/recruitment/candidates/${activeCandidate._id}/offer`, {
        salary: offerSalary,
        joiningDate: offerJoiningDate,
        status: 'sent'
      });
      setIsExtendOfferModalOpen(false);
      setActiveCandidate(null);
      fetchData();
    } catch {
      setIsExtendOfferModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q);
    const matchesJob = selectedJobFilter === 'all' || c.jobId?._id === selectedJobFilter;
    return matchesQuery && matchesJob;
  });

  const totalOpenings = jobs.reduce((sum, j) => sum + j.openingsCount, 0);
  const totalHired = jobs.reduce((sum, j) => sum + j.hiredCount, 0);
  const pendingOffers = candidates.filter((c) => c.stage === 'offer').length;

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
              <Briefcase size={20} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
              Recruitment & Applicant Tracking (ATS)
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
            Talent acquisition portal: Manage job postings, drag-and-advance candidates through the 7-stage hiring pipeline, and disburse offers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button
            variant="outline"
            onClick={() => {
              if (jobs.length > 0) setCandJobId(jobs[0]._id);
              setIsAddCandidateModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={15} />
            Add Candidate
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsCreateJobModalOpen(true)}
            style={{
              backgroundColor: '#6C5CE7',
              borderColor: '#6C5CE7',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus size={16} />
            Post New Job
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
        {/* Active Openings */}
        <Card padding="md" style={{ borderLeft: '4px solid #6C5CE7', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Openings</span>
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
              <Briefcase size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {jobs.filter((j) => j.status === 'published').length}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>jobs published</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {totalOpenings} total seats open across company
          </div>
        </Card>

        {/* Candidates in Pipeline */}
        <Card padding="md" style={{ borderLeft: '4px solid #0984E3', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Candidates Tracked</span>
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
              <Users size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {candidates.length}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>in active pipeline</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Across all 7 recruitment pipeline stages
          </div>
        </Card>

        {/* Interviews Scheduled */}
        <Card padding="md" style={{ borderLeft: '4px solid #FDCB6E', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Interviews Scheduled</span>
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
              <Video size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {interviews.length}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>interviews upcoming</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Virtual Google Meet & panel sessions
          </div>
        </Card>

        {/* Offers Extended / Hired */}
        <Card padding="md" style={{ borderLeft: '4px solid #00B894', backgroundColor: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Offers & Hires</span>
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
              <Award size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '32px', fontWeight: 800, color: '#00B894' }}>
              {pendingOffers} / {totalHired}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>offers / hired</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            High conversion velocity
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2px' }}>
        {[
          { id: 'jobs', label: 'Job Openings', count: jobs.length },
          { id: 'pipeline', label: 'Candidate Pipeline (Kanban)', count: candidates.length },
          { id: 'interviews', label: 'Interview Schedules', count: interviews.length },
          { id: 'offers', label: 'Offer Letters', count: pendingOffers }
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
                gap: '8px'
              }}
            >
              {tab.label}
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
            </button>
          );
        })}
      </div>

      {/* Tab 1: Job Openings */}
      {activeTab === 'jobs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {jobs.map((job) => (
            <Card
              key={job._id}
              padding="md"
              style={{
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {job.code}
                  </span>
                  <Badge variant={job.status === 'published' ? 'success' : 'neutral'}>
                    {job.status.toUpperCase()}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>
                  {job.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span style={{ textTransform: 'capitalize' }}>{job.employmentType.replace('_', ' ')}</span>
                  <span>•</span>
                  <span>{job.openingsCount} Openings</span>
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Comp Range</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ${(job.salaryMin / 1000).toFixed(0)}k – ${(job.salaryMax / 1000).toFixed(0)}k
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge variant="info" style={{ backgroundColor: '#0984E31A', color: '#0984E3' }}>
                    {job.totalApplicants} Applicants
                  </Badge>
                  <button
                    onClick={() => {
                      setSelectedJobFilter(job._id);
                      setActiveTab('pipeline');
                    }}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    View Pipeline
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Candidate Pipeline (ATS Kanban Board) */}
      {activeTab === 'pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Job:</span>
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              >
                <option value="all">All Job Openings ({candidates.length})</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.code})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search candidates..."
                style={{
                  padding: '6px 12px 6px 30px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Kanban Columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px',
              overflowX: 'auto'
            }}
          >
            {STAGES.map((col, idx) => {
              const stageCandidates = filteredCandidates.filter((c) => c.stage === col.id);
              const nextStage = idx < STAGES.length - 1 ? STAGES[idx + 1].id : null;

              return (
                <div
                  key={col.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    minWidth: '240px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }} />
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {col.label}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '999px',
                        backgroundColor: 'var(--bg-elevated)',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--text-muted)'
                      }}
                    >
                      {stageCandidates.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '180px' }}>
                    {stageCandidates.map((cand) => (
                      <div
                        key={cand._id}
                        style={{
                          padding: '12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-elevated)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {cand.firstName} {cand.lastName}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {cand.jobId?.title || 'Open Role'}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={13} fill={s <= cand.rating ? '#FDCB6E' : 'none'} color={s <= cand.rating ? '#FDCB6E' : 'var(--text-muted)'} />
                          ))}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                          <button
                            onClick={() => {
                              setActiveCandidate(cand);
                              setIsScheduleInterviewModalOpen(true);
                            }}
                            title="Schedule Interview"
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#6C5CE7',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Video size={12} />
                            Interview
                          </button>

                          {nextStage && (
                            <button
                              onClick={() => advanceCandidate(cand._id, nextStage)}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                border: '1px solid var(--border-subtle)',
                                backgroundColor: 'var(--bg-surface)',
                                color: 'var(--text-primary)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              Advance
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Interview Schedules */}
      {activeTab === 'interviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {interviews.map((int) => (
            <Card
              key={int._id}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#6C5CE71A',
                    color: '#6C5CE7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Video size={18} />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {int.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Candidate: <strong>{int.candidateId?.firstName} {int.candidateId?.lastName}</strong> • {int.jobId?.title}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <Clock size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {new Date(int.scheduledDate).toLocaleDateString()} at {int.startTime} – {int.endTime}
                </div>

                {int.meetingLink && (
                  <a
                    href={int.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#6C5CE7',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    Join Video Call
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 4: Offer Letters Desk */}
      {activeTab === 'offers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {candidates
            .filter((c) => c.stage === 'offer' || c.offerDetails)
            .map((cand) => (
              <Card
                key={cand._id}
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
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cand.firstName} {cand.lastName}
                    </span>
                    <Badge variant={cand.offerDetails?.status === 'accepted' ? 'success' : 'warning'}>
                      {(cand.offerDetails?.status || 'Sent').toUpperCase()}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Role: {cand.jobId?.title} • Offsetting Salary: <strong>${cand.offerDetails?.salary?.toLocaleString() || '145,000'} / year</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => advanceCandidate(cand._id, 'hired')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#00B894',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Mark as Hired
                  </button>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Modals: Post Job */}
      <Modal isOpen={isCreateJobModalOpen} onClose={() => setIsCreateJobModalOpen(false)} title="Post New Job Opening">
        <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Job Title *
            </label>
            <input
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Staff Distributed Systems Architect"
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
                Employment Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              >
                <option value="full_time">Full Time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Openings Count
              </label>
              <input
                type="number"
                value={jobOpenings}
                onChange={(e) => setJobOpenings(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsCreateJobModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting} style={{ backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }}>
              Publish Opening
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modals: Add Candidate */}
      <Modal isOpen={isAddCandidateModalOpen} onClose={() => setIsAddCandidateModalOpen(false)} title="Add Candidate to Pipeline">
        <form onSubmit={handleAddCandidate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                First Name *
              </label>
              <input
                type="text"
                required
                value={candFirst}
                onChange={(e) => setCandFirst(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Last Name *
              </label>
              <input
                type="text"
                required
                value={candLast}
                onChange={(e) => setCandLast(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Email Address *
            </label>
            <input
              type="email"
              required
              value={candEmail}
              onChange={(e) => setCandEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Applying For Job *
            </label>
            <select
              value={candJobId}
              onChange={(e) => setCandJobId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            >
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} ({j.code})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsAddCandidateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting} style={{ backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }}>
              Add to Applied Stage
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modals: Schedule Interview */}
      <Modal isOpen={isScheduleInterviewModalOpen} onClose={() => setIsScheduleInterviewModalOpen(false)} title="Schedule Candidate Interview">
        <form onSubmit={handleScheduleInterview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Interviewee</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {activeCandidate?.firstName} {activeCandidate?.lastName}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Interview Title
            </label>
            <input
              type="text"
              required
              value={intTitle}
              onChange={(e) => setIntTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '13px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Date</label>
              <input
                type="date"
                required
                value={intDate}
                onChange={(e) => setIntDate(e.target.value)}
                style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Start</label>
              <input
                type="time"
                required
                value={intStart}
                onChange={(e) => setIntStart(e.target.value)}
                style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>End</label>
              <input
                type="time"
                required
                value={intEnd}
                onChange={(e) => setIntEnd(e.target.value)}
                style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '12px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsScheduleInterviewModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting} style={{ backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }}>
              Confirm & Generate Meeting Link
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
