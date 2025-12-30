'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Check, Trash2, UserPlus } from 'lucide-react';

interface BrandingConfig {
  companyName: string;
  logo: { url: string };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  supportEmail: string;
  customDomain?: string;
}

interface SubAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface Stats {
  subAccounts: number;
  qrCodes: number;
  totalScans: number;
  revenue: number;
  revenueShare: number;
  yourShare: number;
  platformFee: number;
}

export default function WhiteLabelPage() {
  const [branding, setBranding] = useState<BrandingConfig>({
    companyName: '',
    logo: { url: '' },
    colors: { primary: '#3b82f6', secondary: '#1e40af', accent: '#10b981' },
    supportEmail: '',
    customDomain: '',
  });
  const [domain, setDomain] = useState('');
  const [dnsRecords, setDnsRecords] = useState<any[]>([]);
  const [subAccounts, setSubAccounts] = useState<SubAccount[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchBranding();
    fetchDomain();
    fetchSubAccounts();
    fetchStats();
  }, []);

  const fetchBranding = async () => {
    try {
      const res = await fetch('/api/organization/branding');
      const data = await res.json();
      if (data.success) {
        setBranding(data.branding);
      }
    } catch (error) {
      console.error('Error fetching branding:', error);
    }
  };

  const fetchDomain = async () => {
    try {
      const res = await fetch('/api/organization/domain');
      const data = await res.json();
      if (data.success && data.domain) {
        setDomain(data.domain);
        setDnsRecords(data.dnsRecords || []);
      }
    } catch (error) {
      console.error('Error fetching domain:', error);
    }
  };

  const fetchSubAccounts = async () => {
    try {
      const res = await fetch('/api/organization/sub-accounts');
      const data = await res.json();
      if (data.success) {
        setSubAccounts(data.subAccounts);
      }
    } catch (error) {
      console.error('Error fetching sub-accounts:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/organization/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const saveBranding = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/organization/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Branding updated successfully');
      } else {
        toast.error(data.error || 'Failed to update branding');
      }
    } catch (error) {
      toast.error('Failed to update branding');
    } finally {
      setLoading(false);
    }
  };

  const configureDomain = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/organization/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (data.success) {
        setDnsRecords(data.dnsRecords);
        toast.success('Domain configured successfully');
      } else {
        toast.error(data.error || 'Failed to configure domain');
      }
    } catch (error) {
      toast.error('Failed to configure domain');
    } finally {
      setLoading(false);
    }
  };

  const removeDomain = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/organization/domain', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setDomain('');
        setDnsRecords([]);
        toast.success('Domain removed successfully');
      } else {
        toast.error(data.error || 'Failed to remove domain');
      }
    } catch (error) {
      toast.error('Failed to remove domain');
    } finally {
      setLoading(false);
    }
  };

  const addSubAccount = async () => {
    const name = prompt('Enter client name:');
    if (!name) return;
    const email = prompt('Enter client email:');
    if (!email) return;

    setLoading(true);
    try {
      const res = await fetch('/api/organization/sub-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          `Sub-account created! Temporary password: ${data.tempPassword}`,
          { duration: 10000 }
        );
        fetchSubAccounts();
        fetchStats();
      } else {
        toast.error(data.error || 'Failed to create sub-account');
      }
    } catch (error) {
      toast.error('Failed to create sub-account');
    } finally {
      setLoading(false);
    }
  };

  const deleteSubAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sub-account?')) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/organization/sub-accounts?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Sub-account deleted');
        fetchSubAccounts();
        fetchStats();
      } else {
        toast.error(data.error || 'Failed to delete sub-account');
      }
    } catch (error) {
      toast.error('Failed to delete sub-account');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">White-Label Management</h1>
        <p className="text-muted-foreground">
          Customize your platform branding, configure custom domains, and manage client sub-accounts
        </p>
      </div>

      <Tabs defaultValue="branding" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="domain">Custom Domain</TabsTrigger>
          <TabsTrigger value="accounts">Sub-Accounts</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Customize Your Branding</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={branding.companyName}
                  onChange={(e) =>
                    setBranding({ ...branding, companyName: e.target.value })
                  }
                  placeholder="Your Company Name"
                />
              </div>

              <div>
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={branding.supportEmail}
                  onChange={(e) =>
                    setBranding({ ...branding, supportEmail: e.target.value })
                  }
                  placeholder="support@yourcompany.com"
                />
              </div>

              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={branding.logo.url}
                  onChange={(e) =>
                    setBranding({
                      ...branding,
                      logo: { url: e.target.value },
                    })
                  }
                  placeholder="https://yourcompany.com/logo.png"
                />
                {branding.logo.url && (
                  <div className="mt-4">
                    <Label>Logo Preview</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-muted">
                      <img
                        src={branding.logo.url}
                        alt="Logo preview"
                        className="h-16 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={branding.colors.primary}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          colors: { ...branding.colors, primary: e.target.value },
                        })
                      }
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={branding.colors.primary}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          colors: { ...branding.colors, primary: e.target.value },
                        })
                      }
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={branding.colors.secondary}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          colors: { ...branding.colors, secondary: e.target.value },
                        })
                      }
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={branding.colors.secondary}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          colors: { ...branding.colors, secondary: e.target.value },
                        })
                      }
                      placeholder="#1e40af"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="accentColor"
                      type="color"
                      value={branding.colors.accent}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          colors: { ...branding.colors, accent: e.target.value },
                        })
                      }
                      className="w-20 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={branding.colors.accent}
                      onChange={(e) =>
                        setBranding({
                          ...branding,
                          colors: { ...branding.colors, accent: e.target.value },
                        })
                      }
                      placeholder="#10b981"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={saveBranding} disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Save Branding'}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Custom Domain Tab */}
        <TabsContent value="domain">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Custom Domain Setup</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="domain">Your Custom Domain</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="app.yourcompany.com"
                  />
                  <Button onClick={configureDomain} disabled={loading}>
                    {loading ? 'Configuring...' : 'Configure'}
                  </Button>
                  {domain && (
                    <Button
                      variant="destructive"
                      onClick={removeDomain}
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>

              {dnsRecords.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">DNS Configuration</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Add these DNS records to your domain provider:
                    </p>
                  </div>

                  {dnsRecords.map((record, index) => (
                    <Card key={index} className="p-4 bg-muted">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Badge className="mb-2">{record.type}</Badge>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Name:</span>
                              <code className="text-sm bg-background px-2 py-1 rounded">
                                {record.name}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(record.name, `name-${index}`)}
                              >
                                {copied === `name-${index}` ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Value:</span>
                              <code className="text-sm bg-background px-2 py-1 rounded">
                                {record.value}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(record.value, `value-${index}`)}
                              >
                                {copied === `value-${index}` ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {record.instructions}
                      </p>
                    </Card>
                  ))}

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> DNS changes can take up to 48 hours to propagate.
                      After configuring DNS, verify your domain in Vercel's dashboard.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Sub-Accounts Tab */}
        <TabsContent value="accounts">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Client Sub-Accounts</h2>
              <Button onClick={addSubAccount} disabled={loading}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Sub-Account
              </Button>
            </div>

            {subAccounts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No sub-accounts yet. Create one to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subAccounts.map((account) => (
                  <Card key={account.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{account.name}</h3>
                        <p className="text-sm text-muted-foreground">{account.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{account.role}</Badge>
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(account.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteSubAccount(account.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Revenue Dashboard</h2>
            {stats ? (
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Total Revenue
                  </h3>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    ${stats.revenue.toFixed(2)}
                  </p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                  <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                    Your Share ({stats.revenueShare}%)
                  </h3>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                    ${stats.yourShare.toFixed(2)}
                  </p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                  <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                    Platform Fee ({100 - stats.revenueShare}%)
                  </h3>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    ${stats.platformFee.toFixed(2)}
                  </p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                  <h3 className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-2">
                    Total Scans
                  </h3>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {stats.totalScans.toLocaleString()}
                  </p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Sub-Accounts
                  </h3>
                  <p className="text-3xl font-bold">{stats.subAccounts}</p>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Active QR Codes
                  </h3>
                  <p className="text-3xl font-bold">{stats.qrCodes}</p>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>Loading revenue data...</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
