'use client';

import React, { useState, useEffect } from 'react';
import {
  Laptop,
  Monitor,
  Smartphone,
  Key,
  Shield,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Wrench,
  Archive,
  DollarSign,
  Layers,
  Filter
} from 'lucide-react';
import api from '@/lib/api';

interface EmployeeOption {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  department: string;
  designation: string;
}

interface Asset {
  _id: string;
  assetTag: string;
  name: string;
  category: string;
  serialNumber: string;
  assignedTo?: {
    employeeId?: string;
    employeeName?: string;
    department?: string;
  };
  assignedDate?: string;
  purchaseDate: string;
  purchaseCost: number;
  currency: string;
  warrantyExpiry?: string;
  condition: 'new' | 'good' | 'fair' | 'damaged';
  status: 'assigned' | 'available' | 'maintenance' | 'retired';
  notes?: string;
}

interface Metrics {
  totalAssets: number;
  assignedCount: number;
  availableCount: number;
  maintenanceCount: number;
  assignedRate: number;
  totalValueUSD: number;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalAssets: 0,
    assignedCount: 0,
    availableCount: 0,
    maintenanceCount: 0,
    assignedRate: 0,
    totalValueUSD: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Form states
  const [newAssetData, setNewAssetData] = useState({
    name: '',
    category: 'laptop',
    serialNumber: '',
    purchaseCost: '',
    condition: 'good',
    employeeId: '',
    assignedEmployeeName: '',
    department: 'Engineering',
    notes: ''
  });

  const [assignData, setAssignData] = useState({
    employeeId: '',
    employeeName: '',
    department: 'Engineering'
  });

  const [departmentsList, setDepartmentsList] = useState<{ id: string; name: string }[]>([]);
  const [employeesList, setEmployeesList] = useState<EmployeeOption[]>([]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/assets', {
        params: {
          category: activeTab,
          status: statusFilter,
          search: searchTerm
        }
      });
      if (res.data) {
        setAssets(res.data);
        if (res.metrics) setMetrics(res.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch assets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDeptsAndEmps = async () => {
      try {
        const [deptsRes, empsRes]: any = await Promise.all([
          api.get('/org/departments'),
          api.get('/employees?limit=100')
        ]);
        if (deptsRes.data && Array.isArray(deptsRes.data)) {
          setDepartmentsList(deptsRes.data.map((d: any) => ({ id: d._id, name: d.name })));
          if (deptsRes.data.length > 0) {
            setNewAssetData((prev) => ({ ...prev, department: deptsRes.data[0].name }));
            setAssignData((prev) => ({ ...prev, department: deptsRes.data[0].name }));
          }
        }
        if (empsRes.data && Array.isArray(empsRes.data)) {
          const mapped: EmployeeOption[] = empsRes.data.map((emp: any) => ({
            id: emp._id,
            employeeCode: emp.employeeCode || '',
            name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
            email: emp.email || '',
            department: emp.departmentId?.name || 'General',
            designation: emp.designationId?.title || emp.role || 'Staff Member'
          }));
          setEmployeesList(mapped);
        }
      } catch (err) {
        console.warn('Could not fetch departments/employees for assets:', err);
      }
    };
    fetchDeptsAndEmps();
  }, []);

  // Compute set of employee IDs and employee names that currently hold an assigned asset
  const assignedEmployeeIds = new Set<string>();
  const assignedEmployeeNames = new Set<string>();

  assets.forEach((a) => {
    if (a.status === 'assigned' && a.assignedTo) {
      if (a.assignedTo.employeeId) {
        assignedEmployeeIds.add(String(a.assignedTo.employeeId));
      }
      if (a.assignedTo.employeeName) {
        assignedEmployeeNames.add(a.assignedTo.employeeName.trim().toLowerCase());
      }
    }
  });

  // Filter for Assign modal:
  // Shows only employees who DO NOT currently have an assigned asset
  // (or allows keeping the current assignee of this specific asset)
  const availableEmployeesForAssign = employeesList.filter((emp) => {
    const isCurrentAssignee =
      (selectedAsset?.assignedTo?.employeeId && selectedAsset.assignedTo.employeeId === emp.id) ||
      (selectedAsset?.assignedTo?.employeeName &&
        selectedAsset.assignedTo.employeeName.trim().toLowerCase() === emp.name.toLowerCase());

    if (isCurrentAssignee) return true;

    return !assignedEmployeeIds.has(emp.id) && !assignedEmployeeNames.has(emp.name.toLowerCase());
  });

  // Filter for Register New Asset modal:
  // Shows only unassigned employees
  const availableEmployeesForNewAsset = employeesList.filter((emp) => {
    return !assignedEmployeeIds.has(emp.id) && !assignedEmployeeNames.has(emp.name.toLowerCase());
  });

  useEffect(() => {
    fetchAssets();
  }, [activeTab, statusFilter, searchTerm]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assets', newAssetData);
      setIsAddModalOpen(false);
      setNewAssetData({
        name: '',
        category: 'laptop',
        serialNumber: '',
        purchaseCost: '',
        condition: 'good',
        employeeId: '',
        assignedEmployeeName: '',
        department: 'Engineering',
        notes: ''
      });
      fetchAssets();
    } catch (err) {
      alert('Failed to register asset');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    try {
      await api.put(`/assets/${selectedAsset._id}/assign`, assignData);
      setIsAssignModalOpen(false);
      setSelectedAsset(null);
      fetchAssets();
    } catch (err) {
      alert('Failed to assign asset');
    }
  };

  const handleUnassign = async (id: string) => {
    if (!confirm('Are you sure you want to mark this device as returned and available?')) return;
    try {
      await api.put(`/assets/${id}/assign`, { unassign: true });
      fetchAssets();
    } catch (err) {
      alert('Failed to unassign asset');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.put(`/assets/${id}/status`, { status: newStatus });
      fetchAssets();
    } catch (err) {
      alert('Failed to update asset status');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'laptop': return <Laptop size={18} style={{ color: '#6C5CE7' }} />;
      case 'monitor': return <Monitor size={18} style={{ color: '#2563EB' }} />;
      case 'mobile': return <Smartphone size={18} style={{ color: '#10B981' }} />;
      case 'license': return <Key size={18} style={{ color: '#F59E0B' }} />;
      default: return <Layers size={18} style={{ color: '#64748B' }} />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#DBEAFE', color: '#1E40AF' }}>
            <UserCheck size={12} /> Assigned
          </span>
        );
      case 'available':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#D1FAE5', color: '#065F46' }}>
            <CheckCircle size={12} /> In Stock
          </span>
        );
      case 'maintenance':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#FEF3C7', color: '#92400E' }}>
            <Wrench size={12} /> Repair / Care
          </span>
        );
      case 'retired':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: '#F3F4F6', color: '#4B5563' }}>
            <Archive size={12} /> Retired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Laptop size={24} style={{ color: '#6C5CE7' }} />
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
              Company Asset & Hardware Inventory
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Track workstation laptops, calibrated monitors, test mobile devices, and organizational software licenses.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#6C5CE7',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 18px',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> Register New Asset
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>TOTAL ASSETS</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{metrics.totalAssets}</div>
          <div style={{ fontSize: '0.78rem', color: '#6C5CE7', marginTop: '4px', fontWeight: 500 }}>Hardware & license units</div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>ALLOCATION RATE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#2563EB' }}>{metrics.assignedRate}%</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>{metrics.assignedCount} in active employee hands</div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>AVAILABLE IN INVENTORY</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#059669' }}>{metrics.availableCount}</div>
          <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '4px', fontWeight: 500 }}>Ready for next onboarding</div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '18px' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '8px' }}>INVENTORY BOOK VALUE</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>${metrics.totalValueUSD.toLocaleString()}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Cumulative purchase cost</div>
        </div>
      </div>

      {/* Filter and Tab Toolbar */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Equipment' },
              { id: 'laptop', label: 'Laptops' },
              { id: 'monitor', label: 'Monitors' },
              { id: 'mobile', label: 'Mobiles' },
              { id: 'license', label: 'Software Licenses' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: activeTab === tab.id ? '#6C5CE7' : 'var(--color-border)',
                  backgroundColor: activeTab === tab.id ? '#6C5CE7' : 'transparent',
                  color: activeTab === tab.id ? '#FFFFFF' : 'var(--color-text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                padding: '7px 12px',
                fontSize: '0.84rem'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="assigned">Assigned</option>
              <option value="available">In Stock (Available)</option>
              <option value="maintenance">Under Maintenance</option>
              <option value="retired">Retired</option>
            </select>

            {/* Search Box */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search tag, model or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '7px 12px 7px 34px',
                  borderRadius: '6px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.84rem',
                  width: '240px'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Asset Inventory Table */}
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '12px 18px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Asset Tag & Model</th>
              <th style={{ padding: '12px 18px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Serial Number</th>
              <th style={{ padding: '12px 18px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Assigned Custodian</th>
              <th style={{ padding: '12px 18px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Book Value</th>
              <th style={{ padding: '12px 18px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Condition & Status</th>
              <th style={{ padding: '12px 18px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  Loading assets...
                </td>
              </tr>
            ) : assets.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  No assets found for this search filter.
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset._id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--color-surface-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid var(--color-border)'
                        }}
                      >
                        {getCategoryIcon(asset.category)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.88rem' }}>{asset.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#6C5CE7', fontWeight: 600 }}>{asset.assetTag}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                    {asset.serialNumber || '—'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {asset.assignedTo?.employeeName ? (
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--color-text-primary)' }}>
                          {asset.assignedTo.employeeName}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>
                          {asset.assignedTo.department}
                        </div>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Unassigned (In Stock)</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--color-text-primary)' }}>
                      ${asset.purchaseCost.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>{asset.currency}</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {getStatusBadge(asset.status)}
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                        Condition: {asset.condition}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      {asset.status === 'assigned' ? (
                        <button
                          onClick={() => handleUnassign(asset._id)}
                          style={{
                            backgroundColor: '#F3F4F6',
                            color: '#374151',
                            border: '1px solid #D1D5DB',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Return Device
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAsset(asset);
                            const currentEmp = employeesList.find(
                              (e) =>
                                (asset.assignedTo?.employeeId && e.id === asset.assignedTo.employeeId) ||
                                (asset.assignedTo?.employeeName &&
                                  e.name.toLowerCase() === asset.assignedTo.employeeName.toLowerCase())
                            );
                            setAssignData({
                              employeeId: currentEmp?.id || asset.assignedTo?.employeeId || '',
                              employeeName: currentEmp?.name || asset.assignedTo?.employeeName || '',
                              department: currentEmp?.department || asset.assignedTo?.department || departmentsList[0]?.name || 'General'
                            });
                            setIsAssignModalOpen(true);
                          }}
                          style={{
                            backgroundColor: '#6C5CE7',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Assign User
                        </button>
                      )}

                      {asset.status !== 'maintenance' ? (
                        <button
                          onClick={() => handleStatusChange(asset._id, 'maintenance')}
                          style={{
                            backgroundColor: 'transparent',
                            color: '#D97706',
                            border: '1px solid #FDE68A',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Service
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(asset._id, 'available')}
                          style={{
                            backgroundColor: '#10B981',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Fixed
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '540px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Register New Asset
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateAsset}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Model / Asset Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MacBook Pro M3 16 (36GB/512GB)"
                  value={newAssetData.name}
                  onChange={(e) => setNewAssetData({ ...newAssetData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.86rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={newAssetData.category}
                    onChange={(e) => setNewAssetData({ ...newAssetData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  >
                    <option value="laptop">Laptop / Workstation</option>
                    <option value="monitor">External Monitor</option>
                    <option value="mobile">Test Mobile / Tablet</option>
                    <option value="license">Software License</option>
                    <option value="peripherals">Peripherals / Audio</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Serial Number / Service Tag
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. C02G41KSMD6T"
                    value={newAssetData.serialNumber}
                    onChange={(e) => setNewAssetData({ ...newAssetData, serialNumber: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Cost (USD)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2499"
                    value={newAssetData.purchaseCost}
                    onChange={(e) => setNewAssetData({ ...newAssetData, purchaseCost: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Physical Condition
                  </label>
                  <select
                    value={newAssetData.condition}
                    onChange={(e) => setNewAssetData({ ...newAssetData, condition: e.target.value as any })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  >
                    <option value="new">Brand New</option>
                    <option value="good">Good Condition</option>
                    <option value="fair">Fair / Used</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                      Assign To Employee (Dropdown)
                    </label>
                    <span style={{ fontSize: '0.72rem', color: '#6C5CE7', fontWeight: 600 }}>
                      {availableEmployeesForNewAsset.length} unassigned staff available
                    </span>
                  </div>
                  <select
                    value={newAssetData.employeeId}
                    onChange={(e) => {
                      const emp = employeesList.find((x) => x.id === e.target.value);
                      if (emp) {
                        setNewAssetData({
                          ...newAssetData,
                          employeeId: emp.id,
                          assignedEmployeeName: emp.name,
                          department: emp.department || newAssetData.department
                        });
                      } else {
                        setNewAssetData({
                          ...newAssetData,
                          employeeId: '',
                          assignedEmployeeName: ''
                        });
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  >
                    <option value="">-- No Custodian (In Stock / Available) --</option>
                    {availableEmployeesForNewAsset.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} &mdash; {emp.designation} ({emp.department}) [{emp.employeeCode}]
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    Department (Live from MongoDB Atlas)
                  </label>
                  <select
                    value={newAssetData.department}
                    onChange={(e) => setNewAssetData({ ...newAssetData, department: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-primary)',
                      fontSize: '0.86rem'
                    }}
                  >
                    {departmentsList.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#6C5CE7',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {isAssignModalOpen && selectedAsset && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '24px',
              width: '100%',
              maxWidth: '440px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Assign Asset: {selectedAsset.assetTag}
              </h3>
              <button onClick={() => setIsAssignModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', marginTop: 0, marginBottom: '16px' }}>
              Select employee custodian for {selectedAsset.name}.
            </p>

            <form onSubmit={handleAssignSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                    Select Employee Custodian (Dropdown) *
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
                    {availableEmployeesForAssign.length} available to assign
                  </span>
                </div>
                <select
                  required
                  value={assignData.employeeId}
                  onChange={(e) => {
                    const emp = employeesList.find((x) => x.id === e.target.value);
                    if (emp) {
                      setAssignData({
                        employeeId: emp.id,
                        employeeName: emp.name,
                        department: emp.department || assignData.department
                      });
                    } else {
                      setAssignData({ employeeId: '', employeeName: '', department: '' });
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.86rem'
                  }}
                >
                  <option value="">-- Choose Employee (Unassigned Only) --</option>
                  {availableEmployeesForAssign.length === 0 ? (
                    <option disabled value="">
                      All employees currently have an assigned asset
                    </option>
                  ) : (
                    availableEmployeesForAssign.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} &mdash; {emp.designation} ({emp.department}) [{emp.employeeCode}]
                      </option>
                    ))
                  )}
                </select>
                {availableEmployeesForAssign.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: '#F59E0B', marginTop: '4px' }}>
                    Note: All registered employees currently hold an active device. To assign this device to an employee, return their existing asset first.
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Department (Auto-filled from Employee profile)
                </label>
                <select
                  value={assignData.department}
                  onChange={(e) => setAssignData({ ...assignData, department: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-primary)',
                    fontSize: '0.86rem'
                  }}
                >
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#6C5CE7',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
