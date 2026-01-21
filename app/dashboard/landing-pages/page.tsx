'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { type PuckTemplate } from '@/lib/templates/puck-templates';
import { getFeatureAccess, type PlanType } from '@/lib/utils/feature-access';
import { Search, Sparkles, Plus, Eye, Package, Calendar, Home, Palette, FileText, ShoppingBag, Dumbbell, Scissors, Wrench, Building, Scale } from 'lucide-react';
import Image from 'next/image';

export default function LandingPagesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templates, setTemplates] = useState<PuckTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'my-pages' | 'templates'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchLandingPages();
    fetchTemplates();
  }, []);

  async function fetchLandingPages() {
    try {
      const res = await fetch('/api/landing-pages');
      const data = await res.json();
      if (data.success) {
        setLandingPages(data.landingPages);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load landing pages:', error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this landing page?')) return;

    try {
      const res = await fetch(`/api/landing-pages/${id}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Landing page deleted');
        fetchLandingPages();
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  }

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
      } else {
        toast.error('Failed to load templates');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load templates:', error);
      }
    } finally {
      setTemplatesLoading(false);
    }
  }

  // Filter templates by search and category
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const userPlan = (session?.user?.organization?.plan as PlanType) || 'FREE';
  const featureAccess = getFeatureAccess(userPlan);
  const canAccessPremium = featureAccess.canAccessPremiumTemplates;

  function handleTemplateSelect(templateId: string) {
    const template = templates.find(t => t.id === templateId);
    if (template?.isPremium && !canAccessPremium) {
      toast.error('Upgrade to access premium templates');
      return;
    }
    router.push(`/dashboard/landing-pages/create?template=${templateId}`);
  }

  function getTemplateIcon(templateId: string): React.ReactElement {
    if (templateId.includes('restaurant')) return <Package className="w-6 h-6" />;
    if (templateId.includes('retail') || templateId.includes('product')) return <ShoppingBag className="w-6 h-6" />;
    if (templateId.includes('realestate') || templateId.includes('property')) return <Home className="w-6 h-6" />;
    if (templateId.includes('fitness') || templateId.includes('gym')) return <Dumbbell className="w-6 h-6" />;
    if (templateId.includes('salon') || templateId.includes('spa')) return <Scissors className="w-6 h-6" />;
    if (templateId.includes('event')) return <Calendar className="w-6 h-6" />;
    if (templateId.includes('service')) return <Wrench className="w-6 h-6" />;
    if (templateId.includes('portfolio')) return <Palette className="w-6 h-6" />;
    if (templateId.includes('medical') || templateId.includes('clinic')) return <Building className="w-6 h-6" />;
    if (templateId.includes('law') || templateId.includes('legal')) return <Scale className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" role="status" aria-label="Loading"></div>
          <p className="text-muted-foreground">Loading landing pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Landing Pages</h1>
          <p className="text-sm text-muted-foreground">
            Create beautiful landing pages from professional templates
          </p>
        </div>
        <Link href="/dashboard/landing-pages/create" className="w-full sm:w-auto">
          <Button size="lg" className="min-h-[44px] w-full sm:w-auto">
            <Plus className="mr-2 h-5 w-5" />
            Create Landing Page
          </Button>
        </Link>
      </div>

      {/* Tabs for My Pages vs Templates */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'my-pages' | 'templates')}>
        <TabsList className="grid w-full max-w-full sm:max-w-[400px] grid-cols-2">
          <TabsTrigger value="templates" className="text-sm">
            <Sparkles className="mr-1 lg:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
            <span className="sm:hidden">Browse</span>
          </TabsTrigger>
          <TabsTrigger value="my-pages" className="text-sm">
            <Eye className="mr-1 lg:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">My Pages ({landingPages.length})</span>
            <span className="sm:hidden">Mine ({landingPages.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4 lg:space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-4 lg:pt-6">
              <div className="flex flex-col gap-3 lg:gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 min-h-[44px]"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      size="sm"
                      variant={selectedCategory === category ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(category)}
                      className="min-h-[36px] capitalize whitespace-nowrap flex-shrink-0"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Grid */}
          {templatesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6" role="list" aria-label="Template library">
              {filteredTemplates.map((template) => {
                const isPremiumLocked = template.isPremium && !canAccessPremium;

                return (
                  <Card 
                    key={template.id} 
                    className={`overflow-hidden transition-all duration-200 cursor-pointer group ${
                      isPremiumLocked ? 'opacity-60 hover:opacity-80' : 'hover:shadow-lg'
                    }`}
                    onClick={() => handleTemplateSelect(template.id)}
                    role="listitem"
                  >
                    {/* Preview Image */}
                    <div className="relative aspect-video bg-muted overflow-hidden">
                      <Image
                        src={template.previewImage || template.thumbnail}
                        alt={template.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      {template.isPremium && (
                        <Badge className="absolute top-3 right-3 bg-yellow-500 text-yellow-950">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Premium
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{template.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {getTemplateIcon(template.id)} {template.category}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="mt-2">{template.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <Button 
                        className="w-full min-h-[44px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template.id);
                        }}
                        disabled={isPremiumLocked}
                      >
                        {isPremiumLocked ? 'Upgrade to Use' : 'Use Template'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {filteredTemplates.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="min-h-[44px]"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* My Pages Tab */}
        <TabsContent value="my-pages" className="space-y-6">{landingPages.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Your landing pages">
              {landingPages.map((page) => (
                <Card key={page.id} className="p-6 hover:shadow-lg transition-shadow" role="listitem">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{page.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        /{page.slug}
                      </p>
                    </div>
                    <Badge variant={page.isPublished ? 'default' : 'secondary'}>
                      {page.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>

                  {page.QRCode && (
                    <div className="mb-4 text-sm">
                      <span className="text-muted-foreground">Linked QR: </span>
                      <span className="font-medium">{page.QRCode.name}</span>
                    </div>
                  )}

                  <div className="mb-4 text-sm text-muted-foreground">
                    {page.views ?? 0} views • Created {new Date(page.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2" role="group" aria-label="Landing page actions">
                    <Link href={`/dashboard/landing-pages/${page.id}/builder`} className="flex-1">
                      <Button variant="default" className="w-full min-h-[44px]">
                        Visual Editor
                      </Button>
                    </Link>
                    {page.isPublished && (
                      <Link href={`/l/${page.slug}`} target="_blank" className="flex-1">
                        <Button variant="outline" className="w-full min-h-[44px]">
                          View
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(page.id)}
                      aria-label="Delete landing page"
                      className="min-w-[44px] min-h-[44px]"
                    >
                      🗑️
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center">
                <div className="text-6xl mb-4">📄</div>
                <h3 className="text-xl font-semibold mb-2">No landing pages yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first landing page from a template
                </p>
                <Button 
                  size="lg" 
                  onClick={() => setActiveTab('templates')}
                  className="min-h-[44px]"
                >
                  Browse Templates
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
