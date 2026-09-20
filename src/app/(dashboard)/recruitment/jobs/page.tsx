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
  Award,
  GripVertical,
  X,
  User,
  Sparkles,
  Code2,
  FileCheck,
  Inbox,
  Eye,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Building2,
  ArrowUpRight,
  CheckSquare
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

const STAGES: {
  id: CandidateItem['stage'];
  label: string;
  stepNumber: number;
  color: string;
  badgeBg: string;
  description: string;
}[] = [
  { id: 'applied', label: 'Applied', stepNumber: 1, color: '#6C5CE7', badgeBg: 'rgba(108, 92, 231, 0.12)', description: 'New applications' },
  { id: 'screening', label: 'Screening', stepNumber: 2, color: '#0984E3', badgeBg: 'rgba(9, 132, 227, 0.12)', description: 'Recruiter review' },
  { id: 'interview', label: 'Interview', stepNumber: 3, color: '#F59E0B', badgeBg: 'rgba(245, 158, 11, 0.12)', description: 'Hiring manager chat' },
  { id: 'technical', label: 'Technical', stepNumber: 4, color: '#EC4899', badgeBg: 'rgba(236, 72, 153, 0.12)', description: 'Technical assessment' },
  { id: 'final', label: 'Final Round', stepNumber: 5, color: '#8B5CF6', badgeBg: 'rgba(139, 92, 246, 0.12)', description: 'Culture & executive fit' },
  { id: 'offer', label: 'Offer Extended', stepNumber: 6, color: '#06B6D4', badgeBg: 'rgba(6, 182, 212, 0.12)', description: 'Formal offer sent' },
  { id: 'hired', label: 'Hired', stepNumber: 7, color: '#10B981', badgeBg: 'rgba(16, 185, 129, 0.15)', description: 'Offer accepted & onboarded' }
];

export default function RecruitmentATSPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'pipeline' | 'interviews' | 'offers'>('jobs');
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

  const demoCandidates: CandidateItem[] = [
    {
      _id: 'cand-0',
      jobId: { _id: 'job-1', title: 'Senior Distributed Systems Architect', code: 'SPX-ENG-01' },
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@techmail.io',
      phone: '+1 (555) 412-8821',
      stage: 'applied',
      rating: 4
    },
    {
      _id: 'cand-screening',
      jobId: { _id: 'job-1', title: 'Senior Distributed Systems Architect', code: 'SPX-ENG-01' },
      firstName: 'Marcus',
      lastName: 'Brody',
      email: 'marcus.brody@cloudarch.dev',
      phone: '+1 (555) 672-9901',
      stage: 'screening',
      rating: 4
    },
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
      _id: 'cand-final',
      jobId: { _id: 'job-1', title: 'Senior Distributed Systems Architect', code: 'SPX-ENG-01' },
      firstName: 'Arthur',
      lastName: 'Pendelton',
      email: 'arthur.p@enterprise-sys.org',
      phone: '+1 (555) 831-7744',
      stage: 'final',
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
    },
    {
      _id: 'cand-hired',
      jobId: { _id: 'job-2', title: 'Lead Product Experience Designer', code: 'SPX-DSG-02' },
      firstName: 'Michael',
      lastName: 'Chang',
      email: 'michael.chang@designpro.io',
      phone: '+1 (555) 554-1923',
      stage: 'hired',
      rating: 5
    }
  ];

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

  const [jobs, setJobs] = useState<JobItem[]>(demoJobs);
  const [candidates, setCandidates] = useState<CandidateItem[]>(demoCandidates);
  const [interviews, setInterviews] = useState<InterviewItem[]>(demoInterviews);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);

  // Candidate Drag & Drop and Detail states
  const [draggedCandidateId, setDraggedCandidateId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<CandidateItem['stage'] | null>(null);
  const [selectedCandidateDetail, setSelectedCandidateDetail] = useState<CandidateItem | null>(null);
  const [isCandidateDrawerOpen, setIsCandidateDrawerOpen] = useState(false);

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
  const [candTargetStage, setCandTargetStage] = useState<CandidateItem['stage']>('applied');
  const [intTitle, setIntTitle] = useState('Technical Screening Interview');
  const [intDate, setIntDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [intStart, setIntStart] = useState('11:00');
  const [intEnd, setIntEnd] = useState('12:00');
  const [offerSalary, setOfferSalary] = useState(145000);
  const [offerJoiningDate, setOfferJoiningDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState(false);

  const getStageIcon = (stageId: CandidateItem['stage']) => {
    switch (stageId) {
      case 'applied':
        return <FileText size={14} />;
      case 'screening':
        return <Search size={14} />;
      case 'interview':
        return <Video size={14} />;
      case 'technical':
        return <Clock size={14} />;
      case 'final':
        return <Award size={14} />;
      case 'offer':
        return <DollarSign size={14} />;
      case 'hired':
        return <CheckCircle2 size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  const handleCandidateDragStart = (e: React.DragEvent, candId: string) => {
    setDraggedCandidateId(candId);
    e.dataTransfer.setData('text/plain', candId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCandidateDragEnd = () => {
    setDraggedCandidateId(null);
    setDragOverStage(null);
  };

  const handleCandidateDragOver = (e: React.DragEvent, stageId: CandidateItem['stage']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleCandidateDragLeave = (e: React.DragEvent, stageId: CandidateItem['stage']) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverStage === stageId) {
        setDragOverStage(null);
      }
    }
  };

  const handleCandidateDrop = async (e: React.DragEvent, targetStage: CandidateItem['stage']) => {
    e.preventDefault();
    e.stopPropagation();
    const candId = draggedCandidateId || e.dataTransfer.getData('text/plain');
    setDragOverStage(null);
    setDraggedCandidateId(null);

    if (!candId) return;
    const cand = candidates.find((c) => c._id === candId);
    if (!cand || cand.stage === targetStage) return;

    advanceCandidate(candId, targetStage);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, candRes, intRes] = await Promise.all([
        api.get<JobItem[]>('/api/recruitment/jobs'),
        api.get<CandidateItem[]>('/api/recruitment/candidates'),
        api.get<InterviewItem[]>('/api/recruitment/interviews')
      ]);

      if (jobsRes.data && jobsRes.data.length > 0) setJobs(jobsRes.data);
      else setJobs(demoJobs);

      if (candRes.data && candRes.data.length > 0) setCandidates(candRes.data);
      else setCandidates(demoCandidates);

      if (intRes.data && intRes.data.length > 0) setInterviews(intRes.data);
      else setInterviews(demoInterviews);
    } catch {
      setJobs(demoJobs);
      setCandidates(demoCandidates);
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
      const targetJob = jobs.find((j) => j._id === candJobId);
      const newCandObj: CandidateItem = {
        _id: `cand-${Date.now()}`,
        jobId: targetJob
          ? { _id: targetJob._id, title: targetJob.title, code: targetJob.code }
          : { _id: candJobId, title: 'Open Position', code: 'SPX-JOB' },
        firstName: candFirst,
        lastName: candLast,
        email: candEmail,
        phone: candPhone,
        stage: candTargetStage || 'applied',
        rating: 5
      };

      setCandidates((prev) => [newCandObj, ...prev]);

      await api.post('/api/recruitment/candidates', {
        jobId: candJobId,
        firstName: candFirst,
        lastName: candLast,
        email: candEmail,
        phone: candPhone,
        stage: candTargetStage || 'applied'
      });
      setIsAddCandidateModalOpen(false);
      setCandFirst('');
      setCandLast('');
      setCandEmail('');
      setCandPhone('');
      fetchData();
    } catch {
      setIsAddCandidateModalOpen(false);
      setCandFirst('');
      setCandLast('');
      setCandEmail('');
      setCandPhone('');
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
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.jobId?.title && c.jobId.title.toLowerCase().includes(q)) ||
      (c.jobId?.code && c.jobId.code.toLowerCase().includes(q));
    const matchesJob = selectedJobFilter === 'all' || c.jobId?._id === selectedJobFilter;
    const matchesRating = ratingFilter === 0 || c.rating >= ratingFilter;
    return matchesQuery && matchesJob && matchesRating;
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
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Recruitment & Applicant Tracking (ATS)
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>
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
        <Card padding="md" style={{ borderLeft: '4px solid #6C5CE7', backgroundColor: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Active Openings</span>
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
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {jobs.filter((j) => j.status === 'published').length}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>jobs published</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            {totalOpenings} total seats open across company
          </div>
        </Card>

        {/* Candidates in Pipeline */}
        <Card padding="md" style={{ borderLeft: '4px solid #0984E3', backgroundColor: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Candidates Tracked</span>
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
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {candidates.length}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>in active pipeline</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Across all 7 recruitment pipeline stages
          </div>
        </Card>

        {/* Interviews Scheduled */}
        <Card padding="md" style={{ borderLeft: '4px solid #FDCB6E', backgroundColor: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Interviews Scheduled</span>
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
            <span style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-main)' }}>
              {interviews.length}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>interviews upcoming</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            Virtual Google Meet & panel sessions
          </div>
        </Card>

        {/* Offers Extended / Hired */}
        <Card padding="md" style={{ borderLeft: '4px solid #00B894', backgroundColor: 'var(--color-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Offers & Hires</span>
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
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>offers / hired</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
            High conversion velocity
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '2px' }}>
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
                color: active ? '#6C5CE7' : 'var(--color-text-secondary)',
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
                  backgroundColor: active ? '#6C5CE7' : 'var(--color-surface-soft)',
                  color: active ? '#FFFFFF' : 'var(--color-text-muted)',
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
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                    {job.code}
                  </span>
                  <Badge variant={job.status === 'published' ? 'success' : 'neutral'}>
                    {job.status.toUpperCase()}
                  </Badge>
                </div>

                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--color-text-main)' }}>
                  {job.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
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
                  borderTop: '1px solid var(--color-border)',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Comp Range</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-main)' }}>
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
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface-soft)',
                      color: 'var(--color-text-main)',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Top Pipeline Toolbar & Smart Controls */}
          <Card padding="sm" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              {/* Left Controls: Job Filter + Search + Rating Filter */}
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                {/* Filter Job Select */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: 'var(--color-surface-soft)',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <Briefcase size={15} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                    Role:
                  </span>
                  <select
                    value={selectedJobFilter}
                    onChange={(e) => setSelectedJobFilter(e.target.value)}
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-main)',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Job Openings ({candidates.length} candidates)</option>
                    {jobs.map((j) => {
                      const countForJob = candidates.filter((c) => c.jobId?._id === j._id).length;
                      return (
                        <option key={j._id} value={j._id}>
                          {j.title} ({j.code}) — {countForJob}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Candidate Search Input */}
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--color-surface-soft)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    padding: '0 12px'
                  }}
                >
                  <Search size={14} style={{ color: 'var(--color-text-muted)', marginRight: '6px' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, role..."
                    style={{
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-main)',
                      fontSize: '13px',
                      padding: '7px 0',
                      outline: 'none',
                      width: '210px'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', padding: 0 }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Rating Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Rating:</span>
                  {[
                    { label: 'All', value: 0 },
                    { label: '4★+', value: 4 },
                    { label: '5★', value: 5 }
                  ].map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRatingFilter(r.value)}
                      style={{
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-pill)',
                        border: ratingFilter === r.value ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: ratingFilter === r.value ? 'var(--color-primary-light)' : 'transparent',
                        color: ratingFilter === r.value ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Controls: Drag & Drop Hint + Add Candidate Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-surface-soft)',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--color-border-subtle)'
                  }}
                >
                  <GripVertical size={13} style={{ color: 'var(--color-primary)' }} />
                  <span>Drag cards to advance stage</span>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  iconPrefix={<Plus size={14} />}
                  onClick={() => setIsAddCandidateModalOpen(true)}
                  style={{ backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }}
                >
                  Add Candidate
                </Button>
              </div>
            </div>
          </Card>

          {/* 7-Stage Horizontal Scrolling ATS Kanban Board */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              paddingBottom: '20px',
              minHeight: '580px',
              scrollSnapType: 'x mandatory'
            }}
          >
            {STAGES.map((col, idx) => {
              const stageCandidates = filteredCandidates.filter((c) => c.stage === col.id);
              const nextStage = idx < STAGES.length - 1 ? STAGES[idx + 1].id : null;
              const isColumnTargeted = dragOverStage === col.id;

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleCandidateDragOver(e, col.id)}
                  onDragLeave={(e) => handleCandidateDragLeave(e, col.id)}
                  onDrop={(e) => handleCandidateDrop(e, col.id)}
                  style={{
                    flex: '0 0 310px',
                    width: '310px',
                    backgroundColor: isColumnTargeted ? `${col.color}14` : 'var(--color-surface-soft)',
                    borderRadius: 'var(--radius-lg)',
                    border: isColumnTargeted ? `2px dashed ${col.color}` : '1px solid var(--color-border)',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    minHeight: '560px',
                    boxShadow: isColumnTargeted ? `0 0 16px ${col.color}30` : 'var(--shadow-sm)',
                    transition: 'all 0.2s ease',
                    scrollSnapAlign: 'start'
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      paddingBottom: '10px',
                      borderBottom: `2px solid ${col.color}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: col.badgeBg,
                            color: col.color,
                            fontSize: '11px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {col.stepNumber}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: col.color }}>{getStageIcon(col.id)}</span>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                            {col.label}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            backgroundColor: 'var(--color-surface)',
                            color: col.color,
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-pill)',
                            border: `1px solid ${col.color}40`,
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          {stageCandidates.length}
                        </span>

                        <button
                          onClick={() => {
                            setCandTargetStage(col.id);
                            setIsAddCandidateModalOpen(true);
                          }}
                          title={`Add candidate directly to ${col.label}`}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '3px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {col.description}
                    </div>
                  </div>

                  {/* Drop Indicator if hovered */}
                  {isColumnTargeted && (
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        border: `1.5px dashed ${col.color}`,
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
                      <ChevronRight size={14} /> Drop here to advance to {col.label}
                    </div>
                  )}

                  {/* Candidate Cards Stack */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    {stageCandidates.length === 0 ? (
                      <div
                        style={{
                          padding: '32px 14px',
                          textAlign: 'center',
                          borderRadius: 'var(--radius-md)',
                          border: '1px dashed var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          margin: 'auto 0'
                        }}
                      >
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: col.badgeBg,
                            color: col.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {getStageIcon(col.id)}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                          No candidates
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
                          Drag a card here to set stage as {col.label}
                        </div>
                      </div>
                    ) : (
                      stageCandidates.map((cand) => (
                        <div
                          key={cand._id}
                          draggable={true}
                          onDragStart={(e) => handleCandidateDragStart(e, cand._id)}
                          onDragEnd={handleCandidateDragEnd}
                          onClick={() => {
                            setActiveCandidate(cand);
                            setSelectedCandidateDetail(cand);
                            setIsCandidateDrawerOpen(true);
                          }}
                          style={{
                            padding: '13px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                            cursor: draggedCandidateId === cand._id ? 'grabbing' : 'grab',
                            opacity: draggedCandidateId === cand._id ? 0.4 : 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '9px',
                            transition: 'all 0.18s ease',
                            userSelect: 'none'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(108, 92, 231, 0.12)';
                            e.currentTarget.style.borderColor = 'var(--color-primary)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.03)';
                            e.currentTarget.style.borderColor = 'var(--color-border)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {/* Card Header: Initials Avatar + Candidate Name + Drag Handle */}
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: col.badgeBg,
                                  color: col.color,
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  border: `1px solid ${col.color}30`
                                }}
                              >
                                {cand.firstName?.[0] || ''}{cand.lastName?.[0] || ''}
                              </div>
                              <div>
                                <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--color-text-main)', lineHeight: 1.25 }}>
                                  {cand.firstName} {cand.lastName}
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                                  <Briefcase size={10} />
                                  <span>{cand.jobId?.code || 'SPX-JOB'}</span>
                                </div>
                              </div>
                            </div>

                            <GripVertical size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0, marginTop: '2px' }} />
                          </div>

                          {/* Role Title */}
                          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
                            {cand.jobId?.title || 'Open Position'}
                          </div>

                          {/* Contact Info Snippet */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              <Mail size={11} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cand.email}
                              </span>
                            </div>
                            {cand.phone && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                                <Phone size={11} />
                                <span>{cand.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Star Rating & Score */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={12}
                                  fill={s <= cand.rating ? '#F59E0B' : 'none'}
                                  color={s <= cand.rating ? '#F59E0B' : 'var(--color-border)'}
                                />
                              ))}
                            </div>
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                color: '#D97706',
                                backgroundColor: '#FEF3C7',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-pill)'
                              }}
                            >
                              {cand.rating}.0 ★
                            </span>
                          </div>

                          {/* Offer Details if in offer stage */}
                          {col.id === 'offer' && cand.offerDetails && (
                            <div
                              style={{
                                padding: '6px 8px',
                                borderRadius: 'var(--radius-sm)',
                                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                                border: '1px solid rgba(6, 182, 212, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '11px',
                                color: '#0891B2',
                                fontWeight: 700
                              }}
                            >
                              <span>${cand.offerDetails.salary?.toLocaleString() || '145,000'}/yr</span>
                              <span>Starts {cand.offerDetails.joiningDate || 'Oct 15'}</span>
                            </div>
                          )}

                          {/* Action Footer */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderTop: '1px solid var(--color-border-subtle)',
                              paddingTop: '8px',
                              marginTop: '2px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveCandidate(cand);
                                  setIsScheduleInterviewModalOpen(true);
                                }}
                                title="Schedule Interview"
                                style={{
                                  background: 'transparent',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: 'var(--radius-sm)',
                                  color: 'var(--color-primary)',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  padding: '3px 7px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  transition: 'background-color 0.15s ease'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-light)')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                <Video size={11} />
                                Interview
                              </button>

                              {col.id === 'final' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveCandidate(cand);
                                    setIsExtendOfferModalOpen(true);
                                  }}
                                  title="Extend Offer"
                                  style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(6, 182, 212, 0.4)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: '#0891B2',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    padding: '3px 7px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px'
                                  }}
                                >
                                  <DollarSign size={11} />
                                  Offer
                                </button>
                              )}
                            </div>

                            {nextStage ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  advanceCandidate(cand._id, nextStage);
                                }}
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  border: 'none',
                                  backgroundColor: col.color,
                                  color: '#FFFFFF',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px',
                                  boxShadow: 'var(--shadow-sm)'
                                }}
                              >
                                Advance
                                <ChevronRight size={11} />
                              </button>
                            ) : (
                              <span
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  color: '#10B981',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <CheckCircle2 size={12} /> Hired
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
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
                backgroundColor: 'var(--color-surface)',
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
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                    {int.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    Candidate: <strong>{int.candidateId?.firstName} {int.candidateId?.lastName}</strong> • {int.jobId?.title}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
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
                  backgroundColor: 'var(--color-surface)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                      {cand.firstName} {cand.lastName}
                    </span>
                    <Badge variant={cand.offerDetails?.status === 'accepted' ? 'success' : 'warning'}>
                      {(cand.offerDetails?.status || 'Sent').toUpperCase()}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
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
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-soft)',
                color: 'var(--color-text-main)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                Employment Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-soft)',
                  color: 'var(--color-text-main)',
                  fontSize: '13px'
                }}
              >
                <option value="full_time">Full Time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
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
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-soft)',
                  color: 'var(--color-text-main)',
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
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
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-soft)',
                  color: 'var(--color-text-main)',
                  fontSize: '13px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
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
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-soft)',
                  color: 'var(--color-text-main)',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
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
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-soft)',
                color: 'var(--color-text-main)',
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Applying For Job *
            </label>
            <select
              value={candJobId}
              onChange={(e) => setCandJobId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
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

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              Pipeline Stage
            </label>
            <select
              value={candTargetStage}
              onChange={(e) => setCandTargetStage(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                fontSize: '13px'
              }}
            >
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.stepNumber}. {s.label} ({s.description})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="outline" type="button" onClick={() => setIsAddCandidateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={submitting} style={{ backgroundColor: '#6C5CE7', borderColor: '#6C5CE7' }}>
              Add Candidate
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modals: Schedule Interview */}
      <Modal isOpen={isScheduleInterviewModalOpen} onClose={() => setIsScheduleInterviewModalOpen(false)} title="Schedule Candidate Interview">
        <form onSubmit={handleScheduleInterview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Interviewee</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              {activeCandidate?.firstName} {activeCandidate?.lastName}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
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
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-main)',
                fontSize: '13px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Date</label>
              <input
                type="date"
                required
                value={intDate}
                onChange={(e) => setIntDate(e.target.value)}
                style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Start</label>
              <input
                type="time"
                required
                value={intStart}
                onChange={(e) => setIntStart(e.target.value)}
                style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)', fontSize: '12px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>End</label>
              <input
                type="time"
                required
                value={intEnd}
                onChange={(e) => setIntEnd(e.target.value)}
                style={{ width: '100%', padding: '7px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)', fontSize: '12px' }}
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

      {/* Candidate Profile & Pipeline Detail Modal */}
      {selectedCandidateDetail && (
        <Modal
          isOpen={isCandidateDrawerOpen}
          onClose={() => {
            setIsCandidateDrawerOpen(false);
            setSelectedCandidateDetail(null);
          }}
          title="Candidate Profile & Pipeline Overview"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Candidate Header Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-soft)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#6C5CE7',
                  color: '#FFFFFF',
                  fontSize: '18px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {selectedCandidateDetail.firstName?.[0]}{selectedCandidateDetail.lastName?.[0]}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--color-text-main)' }}>
                    {selectedCandidateDetail.firstName} {selectedCandidateDetail.lastName}
                  </h3>
                  <Badge variant="primary">{selectedCandidateDetail.rating}.0 ★ Match</Badge>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '3px' }}>
                  Applied for: <strong>{selectedCandidateDetail.jobId?.title}</strong> ({selectedCandidateDetail.jobId?.code})
                </div>
              </div>
            </div>

            {/* 7-Step Hiring Pipeline Progress Stepper */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                Hiring Pipeline Progress (Stage {STAGES.findIndex((s) => s.id === selectedCandidateDetail.stage) + 1} of 7)
              </div>
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {STAGES.map((s, sIdx) => {
                  const currentIdx = STAGES.findIndex((st) => st.id === selectedCandidateDetail.stage);
                  const isPastOrCurrent = sIdx <= currentIdx;
                  const isCurrent = s.id === selectedCandidateDetail.stage;

                  return (
                    <button
                      key={s.id}
                      onClick={() => advanceCandidate(selectedCandidateDetail._id, s.id)}
                      style={{
                        flex: 1,
                        padding: '8px 6px',
                        borderRadius: 'var(--radius-sm)',
                        border: isCurrent ? `2px solid ${s.color}` : '1px solid var(--color-border)',
                        backgroundColor: isCurrent ? s.badgeBg : isPastOrCurrent ? 'var(--color-surface-soft)' : 'var(--color-surface)',
                        color: isCurrent ? s.color : isPastOrCurrent ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                        fontSize: '11px',
                        fontWeight: isCurrent ? 800 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        minWidth: '68px',
                        transition: 'all 0.15s ease'
                      }}
                      title={`Move to ${s.label}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {isPastOrCurrent && <Check size={10} style={{ color: s.color }} />}
                        <span>{sIdx + 1}. {s.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Information & Metadata Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-soft)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Email Address</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={13} style={{ color: 'var(--color-primary)' }} />
                  {selectedCandidateDetail.email}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Phone Number</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={13} style={{ color: 'var(--color-primary)' }} />
                  {selectedCandidateDetail.phone || '+1 (555) 000-0000'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Application Source</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-main)', marginTop: '2px' }}>
                  Direct ATS / Inbound Candidate
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Current Stage</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '2px', textTransform: 'capitalize' }}>
                  {selectedCandidateDetail.stage}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsCandidateDrawerOpen(false);
                  setSelectedCandidateDetail(null);
                }}
              >
                Close
              </Button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Button
                  variant="outline"
                  iconPrefix={<Video size={14} />}
                  onClick={() => {
                    setActiveCandidate(selectedCandidateDetail);
                    setIsCandidateDrawerOpen(false);
                    setIsScheduleInterviewModalOpen(true);
                  }}
                >
                  Schedule Interview
                </Button>

                <Button
                  variant="primary"
                  iconPrefix={<DollarSign size={14} />}
                  onClick={() => {
                    setActiveCandidate(selectedCandidateDetail);
                    setIsCandidateDrawerOpen(false);
                    setIsExtendOfferModalOpen(true);
                  }}
                  style={{ backgroundColor: '#00B894', borderColor: '#00B894' }}
                >
                  Extend Offer
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
