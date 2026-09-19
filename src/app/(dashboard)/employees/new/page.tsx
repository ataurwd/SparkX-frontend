'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { Card } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { Input } from '../../../../components/ui/Input';
import { ImageUpload } from '../../../../components/ui/ImageUpload';
import { apiRequest } from '../../../../lib/api';
import {
  ArrowLeft,
  User,
  Building,
  DollarSign,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function NewEmployeePage() {
  const router = useRouter();

  const [avatarUrl, setAvatarUrl] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [department, setDepartment] = useState('Engineering & Technology');
  const [designation, setDesignation] = useState('Software Engineer');
  const [employmentType, setEmploymentType] = useState('full_time');
  const [workLocation, setWorkLocation] = useState('office');
  const [joiningDate, setJoiningDate] = useState('2026-09-20');
  const [baseSalary, setBaseSalary] = useState('8500');

  // Emergency contact
  const [emgName, setEmgName] = useState('');
  const [emgRelation, setEmgRelation] = useState('');
  const [emgPhone, setEmgPhone] = useState('');

  // Address
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('United States');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      firstName,
      lastName,
      email,
      phone,
      employeeCode: employeeCode || undefined,
      avatarUrl: avatarUrl || undefined,
      joiningDate: new Date(joiningDate),
      employmentType,
      workLocation,
      salary: {
        base: Number(baseSalary) || 0,
        currency: 'USD'
      },
      emergencyContact: {
        name: emgName,
        relation: emgRelation,
        phone: emgPhone
      },
      address: {
        city,
        country
      }
    };

    try {
      const res = await apiRequest('/employees', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/employees');
        }, 1200);
      } else {
        setError(res.error || 'Failed to create employee');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Back Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/employees" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 600, fontSize: '14px' }}>
            <ArrowLeft size={16} /> Back to Directory
          </Link>
          <Badge variant="primary" dot>New Onboarding</Badge>
        </div>

        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text-main)' }}>
            Add New Employee
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Register employee personal details, corporate placement, compensation, and profile avatar.
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              fontSize: '13px'
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              fontSize: '13px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Employee created successfully! Redirecting to directory...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Personal Details & Avatar */}
          <Card title="1. Personal Information & Photo" subtitle="Identity and contact information">
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '28px', alignItems: 'flex-start' }}>
              <ImageUpload
                label="Profile Photo (ImgBB)"
                value={avatarUrl}
                onChange={setAvatarUrl}
                aspectRatio="square"
                helperText="Upload to ImgBB API"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Input
                    label="First Name"
                    placeholder="Michael"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="Johnson"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Input
                    label="Work Email"
                    type="email"
                    placeholder="michael@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Input
                    label="Phone Number"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Employment & Hierarchy Placement */}
          <Card title="2. Employment & Organization Placement" subtitle="Department, designation, and contract parameters">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Input
                  label="Employee Code (ID)"
                  placeholder="Auto-generated if empty (e.g. SPX-0010)"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  helperText="Leave empty to auto-generate sequence"
                />
                <Input
                  label="Joining Date"
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
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
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Sales & Revenue">Sales & Revenue</option>
                    <option value="Finance & Accounting">Finance & Accounting</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                    Job Designation
                  </label>
                  <select
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
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
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Senior Developer">Senior Developer</option>
                    <option value="Product Designer">Product Designer</option>
                    <option value="HR Specialist">HR Specialist</option>
                    <option value="Financial Analyst">Financial Analyst</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                    Employment Contract Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
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
                    <option value="full_time">Full-Time Regular</option>
                    <option value="part_time">Part-Time</option>
                    <option value="contractor">Contractor</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '6px', display: 'block' }}>
                    Work Location
                  </label>
                  <select
                    value={workLocation}
                    onChange={(e) => setWorkLocation(e.target.value)}
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
                    <option value="office">Headquarters / Office</option>
                    <option value="remote">Fully Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 3: Compensation */}
          <Card title="3. Compensation & Emergency Details" subtitle="Monthly base salary and emergency contacts">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ maxWidth: '300px' }}>
                <Input
                  label="Monthly Base Salary (USD)"
                  type="number"
                  placeholder="8500"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  iconPrefix={<DollarSign size={16} />}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                <Input
                  label="Emergency Contact Name"
                  placeholder="Jane Doe"
                  value={emgName}
                  onChange={(e) => setEmgName(e.target.value)}
                />
                <Input
                  label="Relationship"
                  placeholder="Spouse / Parent"
                  value={emgRelation}
                  onChange={(e) => setEmgRelation(e.target.value)}
                />
                <Input
                  label="Emergency Phone"
                  placeholder="+1 (555) 999-9999"
                  value={emgPhone}
                  onChange={(e) => setEmgPhone(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Link href="/employees">
              <Button variant="ghost">Cancel</Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              iconSuffix={<Sparkles size={16} />}
            >
              Save & Provision Employee
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
