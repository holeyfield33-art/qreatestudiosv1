'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { type PuckTemplate } from '@/lib/templates/puck-templates';
import { getFeatureAccess, type PlanType } from '@/lib/utils/feature-access';
import Image from 'next/image';
import { ArrowLeft, Sparkles, Loader2, Check, Eye, Lock, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function CreateLandingPagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrId = searchParams.get('qrId');
  const { data: session } = useSession();
  
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [pageName, setPageName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templates, setTemplates] = useState<PuckTemplate[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [lockedTemplateId, setLockedTemplateId] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');

  // Get user's plan and feature access
  const userPlan = (session?.user?.organization?.plan as PlanType) || 'FREE';
  const featureAccess = getFeatureAccess(userPlan);
  const canAccessPremium = featureAccess.canAccessPremiumTemplates;
  const templateParam = searchParams.get('template');

  // Fetch templates from database
  useEffect(() => {
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
        console.error('Error fetching templates:', error);
        toast.error('Failed to load templates');
      } finally {
        setTemplatesLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!templatesLoading && templateParam && !selectedTemplate) {
      handleTemplateSelect(templateParam);
    }
  }, [templateParam, templatesLoading, selectedTemplate, canAccessPremium, templates]);

  // Get unique categories from templates
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = categoryFilter === 'all' 
    ? templates 
    : templates.filter(t => t.category.toLowerCase() === categoryFilter.toLowerCase());

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
  }

  function handleTemplateSelect(templateId: string) {
    const template = templates.find(t => t.id === templateId);
    
    // Check if template is premium and user doesn't have access
    if (template?.isPremium && !canAccessPremium) {
      setLockedTemplateId(templateId);
      setShowUpgradeModal(true);
      return;
    }
    
    setSelectedTemplate(templateId);
    setPageName(template?.name || '');
    setSlug(generateSlug(template?.name || ''));
    setStep(2);
  }

  async function createAndEdit() {
    if (!pageName || !selectedTemplate) {
      toast.error('Please fill in all fields');
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) {
      toast.error('Template not found');
      return;
    }

    setLoading(true);
    try {
      const finalSlug = slug || generateSlug(pageName);
      
      // Create landing page with Puck template structure
      const res = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: pageName,
          slug: finalSlug,
          templateId: template.id,
          draftContent: template.defaultSections,
          metadata: template.metadata,
        }),
      });

      const result = await res.json();

      if (result.success) {
        // If coming from QR creation, connect them
        if (qrId) {
          try {
            // Update landing page with qrCodeId
            await fetch(`/api/landing-pages/${result.landingPage.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                qrCodeId: qrId,
              }),
            });
            
            // Update QR code redirectUrl to point to landing page
            await fetch(`/api/qr/${qrId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                redirectUrl: `${window.location.origin}/l/${result.landingPage.slug}`,
              }),
            });
            toast.success('Landing page created and connected to QR code!');
          } catch (error) {
            console.error('Failed to connect QR:', error);
            toast.success('Landing page created!');
          }
        } else {
          toast.success('Landing page created!');
        }
        router.push(`/dashboard/landing-pages/${result.landingPage.id}/builder${qrId ? `?qrId=${qrId}` : ''}`);
      } else {
        toast.error(result.error || 'Failed to create');
      }
    } catch (error) {
      console.error('Template creation error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 lg:py-8">
      <div className="max-w-6xl mx-auto">
        {/* QR Connection Banner */}
        {qrId && (
          <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 lg:gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
            </div>
            <p className="text-xs lg:text-sm text-blue-900 font-medium">
              Creating landing page for your QR code - it will be connected automatically
            </p>
          </div>
        )}

        {/* Step 1: Choose Template */}
        {step === 1 && (
          <div>
            <div className="mb-6 lg:mb-8">
              <h1 className="text-2xl lg:text-4xl font-bold mb-1 lg:mb-2">Choose a Template</h1>
              <p className="text-sm text-muted-foreground">Pick a professional template to get started instantly</p>
            </div>

            {/* Category Filters */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter(cat)}
                    className="capitalize"
                  >
                    {cat === 'all' ? 'All Templates' : cat}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Template Grid with Preview */}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredTemplates.map(template => {
                const isPremiumLocked = template.isPremium && !canAccessPremium;
                
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all overflow-hidden ${
                      selectedTemplate === template.id 
                        ? 'ring-2 ring-blue-500 shadow-xl' 
                        : isPremiumLocked
                        ? 'opacity-60 hover:opacity-80'
                        : 'hover:shadow-xl hover:scale-[1.02]'
                    } ${isPremiumLocked ? 'relative' : ''}`}
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    {/* Premium Lock Overlay */}
                    {isPremiumLocked && (
                      <div className="absolute inset-0 z-10 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="text-center space-y-2">
                          <Lock className="w-12 h-12 text-white mx-auto" />
                          <p className="text-white font-semibold text-sm">Premium Template</p>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLockedTemplateId(template.id);
                              setShowUpgradeModal(true);
                            }}
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Upgrade to Unlock
                          </Button>
                        </div>
                      </div>
                    )}
                  
                    {/* Preview Image */}
                    <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <Image
                      src={template.thumbnail}
                      alt={template.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template.id);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                    </div>
                    
                    {/* Selected Indicator */}
                    {selectedTemplate === template.id && (
                      <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <div className="bg-blue-600 text-white rounded-full p-3">
                          <Check className="w-6 h-6" />
                        </div>
                      </div>
                    )}
                    
                    {/* Premium Badge */}
                    {template.isPremium && (
                      <Badge className="absolute top-3 right-3 bg-yellow-500 text-yellow-950">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  
                  {/* Template Info */}
                  <CardContent className="p-3 lg:p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base lg:text-lg">{template.name}</h3>
                      <Badge variant="secondary" className="text-xs capitalize shrink-0">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
              </div>
            )}

            {/* Empty State */}
            {!templatesLoading && filteredTemplates.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No templates found in this category</p>
              </Card>
            )}

            <div className="mt-6 lg:mt-8 flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="lg"
                disabled={!selectedTemplate}
                onClick={() => setStep(2)}
                className="w-full sm:w-auto sm:min-w-[200px]"
              >
                Next: Customize →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Name & Launch */}
        {step === 2 && (
          <div>
            <div className="mb-6 lg:mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="mb-3 lg:mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Templates
              </Button>
              <h1 className="text-2xl lg:text-4xl font-bold mb-1 lg:mb-2">Name Your Page</h1>
              <p className="text-sm text-muted-foreground">Give your landing page a name and URL</p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl lg:text-2xl">Page Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 lg:space-y-6">
                {/* Selected Template Preview */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Selected Template:</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-20 h-14 rounded overflow-hidden border-2 border-gray-200">
                      <Image
                        src={templates.find(t => t.id === selectedTemplate)?.thumbnail || ''}
                        alt="Template preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {templates.find(t => t.id === selectedTemplate)?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {templates.find(t => t.id === selectedTemplate)?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Page Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="pageName" className="text-sm lg:text-base font-semibold">
                    Page Name *
                  </Label>
                  <Input
                    id="pageName"
                    value={pageName}
                    onChange={(e) => {
                      setPageName(e.target.value);
                      setSlug(generateSlug(e.target.value));
                    }}
                    placeholder="My Restaurant Menu"
                    className="text-base lg:text-lg h-11 lg:h-12 w-full"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    This is for your reference only
                  </p>
                </div>

                {/* URL Slug Input */}
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm lg:text-base font-semibold">
                    Your Custom URL *
                  </Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="text-xs lg:text-sm text-muted-foreground whitespace-nowrap">
                      qreatestudios.com/l/
                    </span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(generateSlug(e.target.value))}
                      placeholder="my-page"
                      className="text-base lg:text-lg h-11 lg:h-12 w-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will be your public landing page URL
                  </p>
                </div>

                {/* Preview URL */}
                {slug && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 mb-2 font-semibold">Your landing page will be:</p>
                    <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                      <span className="text-sm font-mono truncate flex-1 text-blue-900 font-medium">
                        {origin ? origin.replace(/^https?:\/\//, '') : 'qreatestudios.com'}/l/{slug}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    className="w-full sm:flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={createAndEdit}
                    disabled={loading || !pageName || !slug}
                    className="w-full sm:flex-1"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {loading ? 'Creating...' : 'Create & Open Visual Editor →'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Premium Upgrade Modal */}
      <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Sparkles className="w-6 h-6 text-yellow-600" />
              </div>
              <DialogTitle className="text-2xl">Unlock Premium Templates</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              This is a premium template available on Business and Agency plans. Upgrade to access this and other advanced features.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Preview of locked template */}
            {lockedTemplateId && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="relative w-20 h-14 rounded overflow-hidden border-2 border-gray-200">
                    <Image
                      src={templates.find(t => t.id === lockedTemplateId)?.thumbnail || ''}
                      alt="Template preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {templates.find(t => t.id === lockedTemplateId)?.name}
                    </p>
                    <Badge className="mt-1 bg-yellow-500 text-yellow-950">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            
            {/* Benefits list */}
            <div className="space-y-3">
              <p className="font-semibold text-sm text-gray-700">Premium template benefits:</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Access to exclusive, professionally designed templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Advanced layouts optimized for conversions</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Priority support and regular template updates</span>
                </li>
              </ul>
            </div>
            
            {/* Current plan info */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-700 mb-1 font-semibold">Your current plan:</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">{userPlan}</span>
                <Badge variant="outline" className="text-xs">
                  {filteredTemplates.filter(t => !t.isPremium).length} free templates available
                </Badge>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowUpgradeModal(false);
                setLockedTemplateId(null);
              }}
              className="w-full sm:w-auto"
            >
              Browse Free Templates
            </Button>
            <Button
              onClick={() => {
                router.push('/dashboard/settings/billing');
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-yellow-950 font-semibold"
            >
              <Zap className="w-4 h-4 mr-2" />
              Upgrade to Business
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => setPreviewTemplate(open ? previewTemplate : null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Template Preview</DialogTitle>
            <DialogDescription className="text-base">
              Preview the template before selecting it.
            </DialogDescription>
          </DialogHeader>

          {previewTemplate && (() => {
            const template = templates.find(t => t.id === previewTemplate);
            if (!template) return null;

            const isPremiumLocked = template.isPremium && !canAccessPremium;

            return (
              <div className="space-y-4">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={template.previewImage || template.thumbnail}
                    alt={template.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px"
                  />
                  {template.isPremium && (
                    <Badge className="absolute top-3 right-3 bg-yellow-500 text-yellow-950">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">{template.name}</h3>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setPreviewTemplate(null);
                      handleTemplateSelect(template.id);
                    }}
                    disabled={isPremiumLocked}
                  >
                    {isPremiumLocked ? 'Upgrade to Use' : 'Use Template'}
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
