'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Users, Settings, BarChart3, Building2,
  Plus, Trash2, Shield, Crown, Loader2,
  Globe, Palette, QrCode, Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface OrgData {
  organization: {
    id: string;
    name: string;
    plan: string;
    isWhiteLabel: boolean;
    customDomain: string | null;
    branding: any;
    revenueShare: number;
    createdAt: string;
  };
  members: Array<{
    id: string;
    role: string;
    joinedAt: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }>;
  stats: {
    totalMembers: number;
    totalClients: number;
    totalQRCodes: number;
    totalScans: number;
    totalLandingPages: number;
    activeSubscriptions: number;
  };
  currentUserRole: string;
}

export default function OrganizationPage() {
  const [data, setData] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchOrgData();
  }, []);

  const fetchOrgData = async () => {
    try {
      const res = await fetch('/api/organization/tenant-admin');
      if (!res.ok) {
        if (res.status === 404) {
          setData(null);
          return;
        }
        throw new Error('Failed to load organization data');
      }
      const json = await res.json();
      setData(json);
    } catch (_error) {
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await fetch('/api/organization/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: 'member' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Member added successfully');
      setInviteEmail('');
      fetchOrgData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      const res = await fetch(`/api/organization/members?memberId=${memberId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
      toast.success('Member removed');
      fetchOrgData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">No Organization</h2>
        <p className="text-muted-foreground mb-6">
          You are not part of any organization yet. Upgrade to Business or Agency plan to create one.
        </p>
        <Button onClick={() => window.location.href = '/pricing'}>
          View Plans
        </Button>
      </div>
    );
  }

  const { organization: org, members, stats, currentUserRole } = data;
  const isAdmin = ['owner', 'admin'].includes(currentUserRole);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{org.name}</h1>
          <p className="text-muted-foreground mt-1">
            {org.plan} Plan {org.isWhiteLabel && '• White Label Enabled'}
          </p>
        </div>
        <div className="flex gap-2">
          {org.customDomain && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
              <Globe className="w-4 h-4" />
              {org.customDomain}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Members', value: stats.totalMembers, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'QR Codes', value: stats.totalQRCodes, icon: QrCode, color: 'text-purple-600 bg-purple-50' },
          { label: 'Total Scans', value: stats.totalScans.toLocaleString(), icon: Eye, color: 'text-green-600 bg-green-50' },
          { label: 'Landing Pages', value: stats.totalLandingPages, icon: BarChart3, color: 'text-orange-600 bg-orange-50' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl border bg-white">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Members Section */}
      <div className="border rounded-xl bg-white">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Invite Form */}
        {isAdmin && (
          <div className="p-4 border-b bg-gray-50 flex gap-2">
            <input
              type="email"
              placeholder="Enter email to invite..."
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail} size="sm">
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
              Invite
            </Button>
          </div>
        )}

        {/* Member List */}
        <div className="divide-y">
          {members.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                  {(member.user.name || member.user.email)[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{member.user.name || 'Unnamed'}</div>
                  <div className="text-sm text-muted-foreground">{member.user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                  member.role === 'owner' ? 'bg-yellow-100 text-yellow-700' :
                  member.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {member.role === 'owner' && <Crown className="w-3 h-3 inline mr-1" />}
                  {member.role === 'admin' && <Shield className="w-3 h-3 inline mr-1" />}
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
                {isAdmin && member.role !== 'owner' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branding Section (for white-label orgs) */}
      {org.isWhiteLabel && (
        <div className="border rounded-xl bg-white p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5" />
            Branding
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Colors</h3>
              <div className="flex gap-2">
                {org.branding?.colors && Object.entries(org.branding.colors).map(([name, color]: [string, any]) => (
                  <div key={name} className="text-center">
                    <div
                      className="w-10 h-10 rounded-lg border shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-muted-foreground mt-1 block">{name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Settings</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-muted-foreground">Company:</span> {org.branding?.companyName || org.name}</p>
                <p><span className="text-muted-foreground">Domain:</span> {org.customDomain || 'Not configured'}</p>
                <p><span className="text-muted-foreground">Revenue Share:</span> {org.revenueShare}%</p>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/dashboard/settings'}>
              <Settings className="w-4 h-4 mr-2" />
              Edit Branding
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
