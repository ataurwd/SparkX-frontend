'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';
import { ImageUpload } from '../../../../components/ui/ImageUpload';
import { apiRequest } from '../../../../lib/api';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  Shield,
  FileText,
  DollarSign,
  Clock,
  UploadCloud,
  Download,
  Trash2,
  CheckCircle2,
  Briefcase,
  User,
  Sparkles,
  Edit3,
  Loader2
} from 'lucide-react';

interface EmployeeDocument {
  id: string;
  title: string;
  category: 'nid' | 'passport' | 'contract' | 'certificate' | 'resume' | 'tax';
  fileUrl: string;
  size: string;
  uploadedAt: string;
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const employeeId = params.id as string;

  const [activeTab, setActiveTab] = useState<'overview' | 'employment' | 'documents' | 'attendance' | 'payroll'>('overview');

  // Document Vault State
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'nid' | 'passport' | 'contract' | 'certificate' | 'resume' | 'tax'>('contract');
  const [docFileUrl, setDocFileUrl] = useState('');

  // Salary Structure State
  const [salaryStructure, setSalaryStructure] = useState<any>(null);
  const [isEditSalaryModalOpen, setIsEditSalaryModalOpen] = useState(false);
  const [savingSalary, setSavingSalary] = useState(false);
  const [salaryForm, setSalaryForm] = useState({
    basic: 4500,
    houseRent: 1500,
    medical: 600,
    transport: 400,
    specialAllowance: 500,
    providentFund: 360,
    tax: 450,
    otherDeduction: 0,
    currency: 'USD'
  });

  const [documents, setDocuments] = useState<EmployeeDocument[]>([
    { id: 'doc-1', title: 'Employment Contract Agreement', category: 'contract', fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600', size: '2.4 MB', uploadedAt: 'Jan 15, 2024' },
    { id: 'doc-2', title: 'National Identity / Passport Scan', category: 'nid', fileUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600', size: '1.8 MB', uploadedAt: 'Jan 15, 2024' },
    { id: 'doc-3', title: 'Master of Science Degree Certificate', category: 'certificate', fileUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600', size: '3.1 MB', uploadedAt: 'Feb 02, 2024' }
  ]);

  const [employee, setEmployee] = useState({
    id: employeeId || 'emp-1',
    code: 'SPX-001',
    firstName: 'Amelia',
    lastName: 'Demane',
    email: 'amelia.admin@sparkx.corp',
    phone: '+1 (555) 234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
    department: 'Executive Leadership',
    departmentId: '',
    designation: 'CEO & Founder',
    role: 'Owner / CEO',
    team: 'Core Strategy Group',
    manager: 'Board of Directors',
    status: 'Active' as const,
    employmentType: 'Full-Time Regular',
    workLocation: 'Headquarters Office',
    joiningDate: 'Jan 15, 2024',
    salary: {
      base: 14500,
      allowance: 2500,
      deductions: 1200,
      net: 15800,
      currency: 'USD'
    },
    emergencyContact: {
      name: 'Robert Demane',
      relation: 'Spouse',
      phone: '+1 (555) 987-6543'
    },
    address: '450 Mission St, Suite 1200, San Francisco, CA 94105'
  });

  // Edit Profile / Department / Role State
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [departmentsList, setDepartmentsList] = useState<any[]>([]);
  const [rolesList, setRolesList] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    departmentId: '',
    role: 'Employee',
    roleId: '',
    designation: '',
    employmentStatus: 'active',
    workLocation: 'office'
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId || employeeId.startsWith('emp-')) return;
    const fetchEmployeeData = async () => {
      try {
        const [empRes, docRes] = await Promise.all([
          apiRequest(`/employees/${employeeId}`),
          apiRequest(`/employees/${employeeId}/documents`)
        ]);

        if (empRes.success && empRes.data) {
          const d = empRes.data;
          setEmployee({
            id: d._id,
            code: d.employeeCode,
            firstName: d.firstName,
            lastName: d.lastName,
            email: d.email,
            phone: d.phone || '+1 (555) 234-5678',
            avatarUrl: d.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
            department: d.departmentId?.name || 'Engineering & Technology',
            departmentId: d.departmentId?._id || '',
            role: d.role || 'Employee',
            designation: d.designationId?.title || 'Engineer',
            team: d.teamId?.name || 'Core Product',
            manager: d.managerId ? `${d.managerId.firstName} ${d.managerId.lastName}` : 'Executive Leadership',
            status: (d.employmentStatus ? (d.employmentStatus.charAt(0).toUpperCase() + d.employmentStatus.slice(1)) : 'Active') as any,
            employmentType: d.employmentType || 'Full-Time Regular',
            workLocation: d.workLocation || 'Office',
            joiningDate: new Date(d.joiningDate || d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            salary: {
              base: d.salary?.base || 8500,
              allowance: 1500,
              deductions: 600,
              net: (d.salary?.base || 8500) + 1500 - 600,
              currency: d.salary?.currency || 'USD'
            },
            emergencyContact: {
              name: d.emergencyContact?.name || 'Farhana Hasan',
              relation: d.emergencyContact?.relation || 'Spouse',
              phone: d.emergencyContact?.phone || '+880 1711 001122'
            },
            address: d.address ? `${d.address.street || ''} ${d.address.city || ''} ${d.address.country || ''}` : 'Dhaka, Bangladesh'
          });
        }

        if (docRes.success && docRes.data && docRes.data.length > 0) {
          setDocuments(docRes.data.map((doc: any) => ({
            id: doc._id,
            title: doc.title,
            category: doc.category,
            fileUrl: doc.fileUrl,
            size: `${(doc.fileSizeBytes / 1024 / 1024).toFixed(1)} MB`,
            uploadedAt: new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          })));
        }

        // Fetch salary structure
        const salaryRes = await apiRequest(`/payroll/salary-structure/${employeeId}`);
        if (salaryRes.success && salaryRes.data) {
          const s = salaryRes.data;
          setSalaryStructure(s);
          setSalaryForm({
            basic: s.basic || 0,
            houseRent: s.houseRent || 0,
            medical: s.medical || 0,
            transport: s.transport || 0,
            specialAllowance: s.specialAllowance || 0,
            providentFund: s.providentFund || 0,
            tax: s.tax || 0,
            otherDeduction: s.otherDeduction || 0,
            currency: s.currency || 'USD'
          });
        }
      } catch (err) {
        console.warn('Could not fetch employee details:', err);
      }
    };
    fetchEmployeeData();
  }, [employeeId]);

  const handleOpenEditProfileModal = async () => {
    try {
      const [deptRes, rolesRes] = await Promise.all([
        apiRequest('/org/departments'),
        apiRequest('/org/roles')
      ]);
      if (deptRes.success && Array.isArray(deptRes.data)) {
        setDepartmentsList(deptRes.data);
      }
      if (rolesRes.success && Array.isArray(rolesRes.data)) {
        setRolesList(rolesRes.data);
      }
    } catch (e) {
      console.warn('Could not load departments or roles for editing:', e);
    }

    setEditForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      phone: employee.phone,
      departmentId: employee.departmentId || '',
      role: employee.role || 'Employee',
      roleId: '',
      designation: employee.designation,
      employmentStatus: employee.status.toLowerCase(),
      workLocation: employee.workLocation.toLowerCase()
    });
    setIsEditProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccessMsg(null);

    try {
      const res = await apiRequest(`/employees/${employeeId}`, {
        method: 'PUT',
        body: JSON.stringify({
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          phone: editForm.phone,
          departmentId: editForm.departmentId || undefined,
          role: editForm.role,
          roleId: editForm.roleId || undefined,
          workLocation: editForm.workLocation,
          employmentStatus: editForm.employmentStatus
        })
      });

      if (res.success && res.data) {
        const updated = res.data;
        setEmployee((prev) => ({
          ...prev,
          firstName: updated.firstName,
          lastName: updated.lastName,
          phone: updated.phone || prev.phone,
          department: updated.departmentId?.name || prev.department,
          departmentId: updated.departmentId?._id || prev.departmentId,
          role: updated.role || editForm.role || prev.role,
          status: updated.employmentStatus ? (updated.employmentStatus.charAt(0).toUpperCase() + updated.employmentStatus.slice(1)) : prev.status,
          workLocation: updated.workLocation ? (updated.workLocation.charAt(0).toUpperCase() + updated.workLocation.slice(1)) : prev.workLocation
        }));
        setProfileSuccessMsg(`Employee profile, department, and role successfully updated in MongoDB Atlas!`);
        setIsEditProfileModalOpen(false);
      }
    } catch (err: any) {
      console.warn('Update error:', err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docFileUrl) return;

    const newDoc: EmployeeDocument = {
      id: `doc-${Date.now()}`,
      title: docTitle.trim(),
      category: docCategory,
      fileUrl: docFileUrl,
      size: '1.2 MB',
      uploadedAt: 'Today'
    };

    if (employeeId && !employeeId.startsWith('emp-')) {
      try {
        const res = await apiRequest(`/employees/${employeeId}/documents`, {
          method: 'POST',
          body: JSON.stringify({
            title: docTitle.trim(),
            category: docCategory,
            fileUrl: docFileUrl,
            fileSizeBytes: 1250000,
            mimeType: 'image/png',
            isConfidential: true
          })
        });
        if (res.success && res.data) {
          newDoc.id = res.data._id;
        }
      } catch (err) {
        console.warn('Failed to upload document to backend:', err);
      }
    }

    setDocuments([newDoc, ...documents]);
    setDocTitle('');
    setDocFileUrl('');
    setIsUploadDocModalOpen(false);
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Back Link */}
        <div>
          <Link
            href="/employees"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-primary)',
              fontWeight: 600,
              fontSize: '13.5px'
            }}
          >
            <ArrowLeft size={16} /> Back to Employee Directory
          </Link>
        </div>

        {/* Success Alert Banner */}
        {profileSuccessMsg && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              backgroundColor: '#00B89415',
              border: '1px solid #00B894',
              color: '#00B894',
              fontSize: '13.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} />
              <span>{profileSuccessMsg}</span>
            </div>
            <button
              onClick={() => setProfileSuccessMsg(null)}
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Hero Profile Header Card */}
        <Card padding="lg" style={{ position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img
                src={employee.avatarUrl}
                alt={employee.firstName}
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid var(--color-primary-light)',
                  boxShadow: 'var(--shadow-card)'
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h1
                    style={{
                      fontSize: '24px',
                      fontWeight: 800,
                      color: 'var(--color-text-main)',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {employee.firstName} {employee.lastName}
                  </h1>
                  <Badge variant="success" dot>{employee.status}</Badge>
                  <Badge variant="primary" style={{ fontWeight: 600 }}>{employee.role || 'Employee'}</Badge>
                  <span
                    style={{
                      backgroundColor: 'var(--color-surface-soft)',
                      border: '1px solid var(--color-border)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--color-text-muted)'
                    }}
                  >
                    {employee.code}
                  </span>
                </div>

                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)', marginTop: '4px' }}>
                  {employee.designation} • {employee.department} • Role: {employee.role || 'Employee'}
                </p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '12.5px',
                    color: 'var(--color-text-secondary)',
                    marginTop: '8px',
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Mail size={13} color="var(--color-text-muted)" /> {employee.email}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} color="var(--color-text-muted)" /> {employee.phone}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} color="var(--color-text-muted)" /> Joined {employee.joiningDate}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Button
                variant="outline"
                onClick={handleOpenEditProfileModal}
                iconPrefix={<Edit3 size={16} />}
              >
                Edit Profile & Department
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsUploadDocModalOpen(true)}
                iconPrefix={<UploadCloud size={16} />}
              >
                Upload Document
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              borderTop: '1px solid var(--color-border-subtle)',
              marginTop: '24px',
              paddingTop: '16px'
            }}
          >
            {[
              { id: 'overview', label: 'Overview & Contacts' },
              { id: 'employment', label: 'Employment Details' },
              { id: 'documents', label: `Document Vault (${documents.length})` },
              { id: 'attendance', label: 'Attendance & Time' },
              { id: 'payroll', label: 'Compensation & Payroll' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    fontSize: '13.5px',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'var(--color-primary-light)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Tab 1: Overview & Contacts */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <Card title="Personal Information" subtitle="Basic identity and residential contact">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Full Name:</span>
                  <span style={{ fontWeight: 600 }}>{employee.firstName} {employee.lastName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Corporate Email:</span>
                  <span style={{ fontWeight: 600 }}>{employee.email}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Direct Phone:</span>
                  <span style={{ fontWeight: 600 }}>{employee.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Residential Address:</span>
                  <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '280px' }}>{employee.address}</span>
                </div>
              </div>
            </Card>

            <Card title="Emergency Contacts" subtitle="Next of kin for operational emergencies">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Contact Name:</span>
                  <span style={{ fontWeight: 600 }}>{employee.emergencyContact.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Relationship:</span>
                  <span style={{ fontWeight: 600 }}>{employee.emergencyContact.relation}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Emergency Phone:</span>
                  <span style={{ fontWeight: 600 }}>{employee.emergencyContact.phone}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2: Employment Details */}
        {activeTab === 'employment' && (
          <Card title="Organizational Placement" subtitle="Corporate branch, reporting line, and work arrangements">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', fontSize: '13.5px' }}>
              <div style={{ backgroundColor: 'var(--color-surface-soft)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Department</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '4px' }}>{employee.department}</div>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface-soft)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Job Title / Designation</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '4px' }}>{employee.designation}</div>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface-soft)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Operational Squad</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '4px' }}>{employee.team}</div>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface-soft)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Reporting Manager</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '4px' }}>{employee.manager}</div>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface-soft)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Contract Arrangement</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '4px' }}>{employee.employmentType}</div>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface-soft)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Work Location</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '4px' }}>{employee.workLocation}</div>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 3: Document Vault */}
        {activeTab === 'documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Confidential Document Vault
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Secure employee contracts, identity files, and certificates powered by ImgBB cloud storage.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => setIsUploadDocModalOpen(true)}
                iconPrefix={<UploadCloud size={16} />}
              >
                Upload File
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {documents.map((doc) => (
                <Card key={doc.id} padding="md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <FileText size={20} />
                      </div>
                      <Badge variant="primary" style={{ textTransform: 'uppercase', fontSize: '11px' }}>
                        {doc.category}
                      </Badge>
                    </div>

                    <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--color-text-main)', lineHeight: 1.3 }}>
                      {doc.title}
                    </h4>

                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                      Uploaded: {doc.uploadedAt} • Size: {doc.size}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '12px' }}>
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ flex: 1 }}>
                      <Button variant="secondary" size="sm" style={{ width: '100%' }} iconPrefix={<Download size={14} />}>
                        View / Download
                      </Button>
                    </a>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDocuments(documents.filter((d) => d.id !== doc.id))}
                      style={{ padding: '0 10px' }}
                      title="Delete document"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Attendance & Time */}
        {activeTab === 'attendance' && (
          <Card title="Attendance & Work Records" subtitle="Overview of daily clock in/out metrics for current cycle">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', textAlign: 'center' }}>
              <div style={{ backgroundColor: 'var(--color-surface-soft)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-success)' }}>22</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Days Present</div>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface-soft)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-warning)' }}>1</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Late Arrivals</div>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface-soft)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-info)' }}>176.5h</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Logged Working Hours</div>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface-soft)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)' }}>6.5h</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Overtime Hours</div>
              </div>
            </div>
          </Card>
        )}

        {/* Tab 5: Compensation & Payroll */}
        {activeTab === 'payroll' && (
          <Card
            title="Compensation & Salary Breakdown"
            subtitle="Current salary structure, statutory deductions, and disbursement breakdown"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditSalaryModalOpen(true)}
                iconPrefix={<Sparkles size={14} />}
              >
                Configure Structure
              </Button>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Basic Pay:</span>
                  <span style={{ fontWeight: 700 }}>${(salaryStructure?.basic || 3000).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>House Rent Allowance (HRA):</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>+${(salaryStructure?.houseRent || 1000).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Medical & Health Allowance:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>+${(salaryStructure?.medical || 400).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Conveyance / Transport:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>+${(salaryStructure?.transport || 200).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Special Allowance:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-success)' }}>+${(salaryStructure?.specialAllowance || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Provident Fund (PF):</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-danger)' }}>-${(salaryStructure?.providentFund || 240).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Tax Deductions:</span>
                  <span style={{ fontWeight: 700, color: 'var(--color-danger)' }}>-${(salaryStructure?.tax || 350).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--color-surface-soft)', borderRadius: 'var(--radius-md)', marginTop: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '15px' }}>Net Monthly Compensation:</span>
                  <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-primary)' }}>
                    ${(salaryStructure?.netSalary || 4360).toLocaleString()} {salaryStructure?.currency || 'USD'}
                  </span>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-surface-soft)', padding: '24px', borderRadius: 'var(--radius-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                <DollarSign size={36} color="var(--color-primary)" style={{ margin: '0 auto' }} />
                <h4 style={{ fontWeight: 700, fontSize: '16px', color: 'var(--color-text-main)' }}>Payroll Portal Integration</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  This employee is connected to our automated monthly payroll batch engine.
                </p>
                <Link href="/payroll">
                  <Button variant="primary" size="sm" style={{ width: '100%' }}>
                    Open Payroll Console
                  </Button>
                </Link>
                <Link href="/payroll/my-payslips">
                  <Button variant="outline" size="sm" style={{ width: '100%' }}>
                    View Payslip History
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Edit Salary Structure Modal */}
        <Modal
          isOpen={isEditSalaryModalOpen}
          onClose={() => setIsEditSalaryModalOpen(false)}
          title="Configure Salary Structure"
          subtitle="Define base earnings, allowances, and statutory deductions for this employee"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                setSavingSalary(true);
                const res = await apiRequest(`/payroll/salary-structure/${employeeId}`, {
                  method: 'PUT',
                  body: JSON.stringify(salaryForm)
                });
                if (res.success && res.data) {
                  setSalaryStructure(res.data);
                  setIsEditSalaryModalOpen(false);
                }
              } catch (err) {
                console.warn('Could not save structure:', err);
              } finally {
                setSavingSalary(false);
              }
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Basic Salary ($)"
                type="number"
                value={salaryForm.basic}
                onChange={(e) => setSalaryForm({ ...salaryForm, basic: Number(e.target.value) })}
                required
              />
              <Input
                label="House Rent Allowance ($)"
                type="number"
                value={salaryForm.houseRent}
                onChange={(e) => setSalaryForm({ ...salaryForm, houseRent: Number(e.target.value) })}
              />
              <Input
                label="Medical Allowance ($)"
                type="number"
                value={salaryForm.medical}
                onChange={(e) => setSalaryForm({ ...salaryForm, medical: Number(e.target.value) })}
              />
              <Input
                label="Transport Allowance ($)"
                type="number"
                value={salaryForm.transport}
                onChange={(e) => setSalaryForm({ ...salaryForm, transport: Number(e.target.value) })}
              />
              <Input
                label="Special Allowance ($)"
                type="number"
                value={salaryForm.specialAllowance}
                onChange={(e) => setSalaryForm({ ...salaryForm, specialAllowance: Number(e.target.value) })}
              />
              <Input
                label="Provident Fund (PF) ($)"
                type="number"
                value={salaryForm.providentFund}
                onChange={(e) => setSalaryForm({ ...salaryForm, providentFund: Number(e.target.value) })}
              />
              <Input
                label="Tax Deduction ($)"
                type="number"
                value={salaryForm.tax}
                onChange={(e) => setSalaryForm({ ...salaryForm, tax: Number(e.target.value) })}
              />
              <Input
                label="Other Deductions ($)"
                type="number"
                value={salaryForm.otherDeduction}
                onChange={(e) => setSalaryForm({ ...salaryForm, otherDeduction: Number(e.target.value) })}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <Button variant="outline" type="button" onClick={() => setIsEditSalaryModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={savingSalary}>
                Save Salary Structure
              </Button>
            </div>
          </form>
        </Modal>

        {/* Upload Document Modal */}
        <Modal
          isOpen={isUploadDocModalOpen}
          onClose={() => setIsUploadDocModalOpen(false)}
          title="Upload to Document Vault"
          subtitle="Upload confidential employee records to ImgBB cloud storage"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsUploadDocModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleUploadDocument}>Save Document</Button>
            </>
          }
        >
          <form onSubmit={handleUploadDocument} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Document Title"
              placeholder="e.g. Master Employment Contract"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              required
            />

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                Document Category
              </label>
              <select
                value={docCategory}
                onChange={(e: any) => setDocCategory(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  padding: '0 14px',
                  backgroundColor: '#FFFFFF',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="contract">Employment Contract</option>
                <option value="nid">National ID / Passport</option>
                <option value="certificate">Educational Certificate</option>
                <option value="resume">Resume / CV</option>
                <option value="tax">Tax / W-4 Document</option>
              </select>
            </div>

            <ImageUpload
              label="Attach Document Image / Scan (ImgBB)"
              value={docFileUrl}
              onChange={setDocFileUrl}
              aspectRatio="wide"
              helperText="Upload PDF/PNG scan to ImgBB cloud storage"
            />
          </form>
        </Modal>

        {/* Edit Profile, Role & Department Modal */}
        <Modal
          isOpen={isEditProfileModalOpen}
          onClose={() => setIsEditProfileModalOpen(false)}
          title="Edit Employee, Role & Department"
          subtitle="Update personal profile and assign live role and department in MongoDB Atlas"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsEditProfileModalOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                disabled={isUpdatingProfile}
                iconPrefix={isUpdatingProfile ? <Loader2 size={15} className="animate-spin" /> : undefined}
              >
                {isUpdatingProfile ? 'Saving...' : 'Save Profile, Role & Dept'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <Input
                label="First Name"
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                  Department (Live from MongoDB Atlas)
                </label>
                <select
                  value={editForm.departmentId}
                  onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    padding: '0 12px',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: '14px',
                    outline: 'none',
                    color: 'var(--color-text-main)'
                  }}
                >
                  <option value="">-- Choose Department --</option>
                  {departmentsList.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code || 'DEPT'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                  Assigned Role (Live from MongoDB Atlas)
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => {
                    const roleName = e.target.value;
                    const rObj = rolesList.find((r) => r.name === roleName);
                    setEditForm({
                      ...editForm,
                      role: roleName,
                      roleId: rObj?._id || ''
                    });
                  }}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    padding: '0 12px',
                    backgroundColor: 'var(--color-surface)',
                    fontSize: '14px',
                    outline: 'none',
                    color: 'var(--color-text-main)'
                  }}
                >
                  {rolesList.map((r) => (
                    <option key={r._id || r.id} value={r.name}>
                      {r.name} {r.isSystemRole ? '(System)' : '(Custom)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                  Employment Status
                </label>
                <select
                  value={editForm.employmentStatus}
                  onChange={(e) => setEditForm({ ...editForm, employmentStatus: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    padding: '0 12px',
                    backgroundColor: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    color: 'var(--color-text-main)'
                  }}
                >
                  <option value="active">Active</option>
                  <option value="probation">Probation</option>
                  <option value="notice">Notice Period</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                  Work Location
                </label>
                <select
                  value={editForm.workLocation}
                  onChange={(e) => setEditForm({ ...editForm, workLocation: e.target.value })}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--color-border)',
                    padding: '0 12px',
                    backgroundColor: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                    color: 'var(--color-text-main)'
                  }}
                >
                  <option value="office">Office</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <Input
              label="Contact Phone"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
