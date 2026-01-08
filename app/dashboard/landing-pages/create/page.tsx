'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LANDING_PAGE_TEMPLATES } from '@/lib/templates/landing-page-templates';
import Image from 'next/image';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function CreateLandingPagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrId = searchParams.get('qrId');
  
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [pageName, setPageName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);

  function generateSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50);
  }

  function handleTemplateSelect(templateId: string) {
    const template = LANDING_PAGE_TEMPLATES.find(t => t.id === templateId);
    setSelectedTemplate(templateId);
    setPageName(template?.name || '');
    setSlug(generateSlug(template?.name || ''));
  }

  async function createAndEdit() {
    if (!pageName || !selectedTemplate) {
      toast.error('Please fill in all fields');
      return;
    }

    const template = LANDING_PAGE_TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template) return;

    setLoading(true);
    try {
      const finalSlug = slug || generateSlug(pageName);
      
      const res = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: pageName,
          slug: finalSlug,
          content: { 
            html: template.html,
            templateId: template.id,
            metadata: template.metadata 
          },
          theme: template.metadata?.colorScheme || {},
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
        router.push(`/dashboard/landing-pages/${result.landingPage.id}/edit${qrId ? `?qrId=${qrId}` : ''}`);
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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* QR Connection Banner */}
        {qrId && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-blue-900 font-medium">
              ✨ Creating landing page for your QR code - it will be connected automatically!
            </p>
          </div>
        )}

        {/* Step 1: Choose Template */}
        {step === 1 && (
          <div>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2">Choose a Template</h1>
              <p className="text-muted-foreground">Pick a starting point for your landing page</p>
            </div>
            
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {LANDING_PAGE_TEMPLATES.map(template => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] ${
                    selectedTemplate === template.id ? 'ring-2 ring-blue-500 shadow-xl' : ''
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <div className="relative aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                    {template.previewImage ? (
                      <Image
                        src={template.previewImage}
                        alt={template.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                        <span className="text-5xl">
                          {getTemplateIcon(template.id)}
                        </span>
                      </div>
                    )}
                    {selectedTemplate === template.id && (
                      <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <div className="bg-blue-600 text-white rounded-full p-3">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{template.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="lg"
                disabled={!selectedTemplate}
                onClick={() => setStep(2)}
                className="min-w-[200px]"
              >
                Next: Customize →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Name & Launch */}
        {step === 2 && (
          <div>
            <div className="mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(1)}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Templates
              </Button>
              <h1 className="text-4xl font-bold mb-2">Name Your Page</h1>
              <p className="text-muted-foreground">Give your landing page a name and URL</p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl">Page Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selected Template Preview */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-2">Selected Template:</p>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {getTemplateIcon(selectedTemplate)}
                    </span>
                    <div>
                      <p className="font-semibold">
                        {LANDING_PAGE_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {LANDING_PAGE_TEMPLATES.find(t => t.id === selectedTemplate)?.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Page Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="pageName" className="text-base font-semibold">
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
                    className="text-lg h-12"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">
                    This is for your reference only
                  </p>
                </div>

                {/* URL Slug Input */}
                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-base font-semibold">
                    Your Custom URL *
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      qreatestudios.com/l/
                    </span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(generateSlug(e.target.value))}
                      placeholder="my-page"
                      className="text-lg h-12"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will be your public landing page URL
                  </p>
                </div>

                {/* Preview URL */}
                {slug && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 mb-1">Your landing page will be:</p>
                    <p className="text-sm font-mono text-blue-900 font-semibold">
                      {window.location.origin}/l/{slug}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    size="lg"
                    onClick={createAndEdit}
                    disabled={loading || !pageName || !slug}
                    className="flex-1"
                  >
                    {loading ? 'Creating...' : 'Create & Edit Page →'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function getTemplateIcon(templateId: string): string {
  const icons: Record<string, string> = {
    'modern-saas': '💼',
    'restaurant-menu': '🍽️',
    'event-registration': '🎟️',
    'product-launch': '🚀',
    'lead-generation': '📥',
    'real-estate': '🏡',
    'portfolio': '🎨',
    'webinar': '🎥',
    'service-business': '💡',
    'coming-soon': '⏰',
  };
  return icons[templateId] || '📄';
}
