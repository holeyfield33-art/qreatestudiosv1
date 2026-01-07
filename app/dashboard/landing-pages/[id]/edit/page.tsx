'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { LANDING_PAGE_TEMPLATES, LandingPageTemplate } from '@/lib/templates/landing-page-templates';
import { ImageBrowser } from '@/components/ImageBrowser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Image as ImageIcon, ArrowLeft, ExternalLink, Check, Eye, Printer, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  content: any;
  theme: any;
  published: boolean;
  customDomain?: string | null;
}

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const landingPageId = params.id as string;
  const qrId = searchParams.get('qrId');

  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [template, setTemplate] = useState<LandingPageTemplate | null>(null);
  const [html, setHtml] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [published, setPublished] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  useEffect(() => {
    loadLandingPage();
  }, [landingPageId]);

  async function loadLandingPage() {
    try {
      const res = await fetch(`/api/landing-pages/${landingPageId}`);
      const data = await res.json();

      if (!data.success) {
        toast.error('Landing page not found');
        router.push('/dashboard/landing-pages');
        return;
      }

      const page = data.landingPage;
      setLandingPage(page);
      setTitle(page.title);
      setPublished(page.published);

      // Load template if content includes templateId
      const templateId = page.content?.templateId;
      if (templateId) {
        const foundTemplate = LANDING_PAGE_TEMPLATES.find((t) => t.id === templateId);
        if (foundTemplate) {
          setTemplate(foundTemplate);
          setHtml(page.content?.html || foundTemplate.html);

          // Initialize images
          const initialImages: Record<string, string> = {};
          foundTemplate.metadata.imageSlots.forEach((slot) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(page.content?.html || foundTemplate.html, 'text/html');
            const imgElement = doc.querySelector(`[data-slot="${slot.id}"]`) as HTMLImageElement;
            if (imgElement) {
              initialImages[slot.id] = imgElement.src;
            }
          });
          setImages(initialImages);
        }
      } else {
        // Custom landing page without template
        setHtml(page.content?.html || '');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading landing page:', error);
      }
      toast.error('Failed to load landing page');
      router.push('/dashboard/landing-pages');
    } finally {
      setLoading(false);
    }
  }

  const handleSlotClick = (slotId: string) => {
    setSelectedSlot(slotId);
    setIsBrowserOpen(true);
  };

  const replaceImage = (slotId: string, newImageUrl: string) => {
    setImages((prev) => ({ ...prev, [slotId]: newImageUrl }));
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const imgElement = doc.querySelector(`[data-slot="${slotId}"]`) as HTMLImageElement;
    
    if (imgElement) {
      imgElement.setAttribute('src', newImageUrl);
      setHtml(doc.documentElement.outerHTML);
      toast.success('Image updated successfully');
    }
    
    setIsBrowserOpen(false);
    setSelectedSlot(null);
  };

  const handleSave = async () => {
    if (!landingPage) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/landing-pages/${landingPageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          published,
          content: {
            html,
            templateId: template?.id,
            metadata: template?.metadata,
            images,
          },
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Landing page saved successfully!');
        setLandingPage(result.landingPage);
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving landing page:', error);
      }
      toast.error('Failed to save landing page');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!landingPage) return;

    setSaving(true);
    try {
      // Save current changes and publish
      const res = await fetch(`/api/landing-pages/${landingPageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          published: true,
          content: {
            html,
            templateId: template?.id,
            metadata: template?.metadata,
            images,
          },
        }),
      });

      const result = await res.json();

      if (result.success) {
        setPublished(true);
        setLandingPage(result.landingPage);

        // If coming from QR creation, connect them
        if (qrId) {
          try {
            // Update landing page with qrCodeId
            await fetch(`/api/landing-pages/${landingPageId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                qrCodeId: qrId,
              }),
            });
            
            // Update QR code redirectUrl to point to landing page
            await fetch(`/api/qr/${qrId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                redirectUrl: `${window.location.origin}/l/${landingPage.slug}`,
              }),
            });
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error('Failed to connect QR:', error);
            }
          }
        }

        setShowPublishModal(true);
      } else {
        toast.error(result.error || 'Failed to publish');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error publishing landing page:', error);
      }
      toast.error('Failed to publish landing page');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading landing page...</p>
        </div>
      </div>
    );
  }

  if (!landingPage) {
    return null;
  }

  if (!template) {
    return null;
  }

  const currentSlot = selectedSlot 
    ? template.metadata.imageSlots.find((s) => s.id === selectedSlot)
    : null;

  return (
    <div className="flex flex-col h-screen">
      {/* Top Header Bar */}
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/landing-pages')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="font-semibold text-lg">{title || 'Untitled Page'}</h2>
            {landingPage && (
              <p className="text-xs text-muted-foreground">
                {window.location.origin}/l/{landingPage.slug}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={saving}>
            {saving ? 'Publishing...' : 'Publish →'}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Controls */}
        <div className="w-80 bg-white border-r overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Page Settings */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                Page Settings
              </h3>
              
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter page title"
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="published" className="cursor-pointer font-medium">
                    Published
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {published ? 'Live on the web' : 'Draft mode'}
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={published}
                  onCheckedChange={setPublished}
                />
              </div>

              {published && landingPage && (
                <a
                  href={`/l/${landingPage.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  View live page
                </a>
              )}
            </div>

            {/* Image Slots */}
            {template && template.metadata.imageSlots.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                  Page Images
                </h3>
                <div className="space-y-3">
                  {template.metadata.imageSlots.map((slot) => (
                    <Card
                      key={slot.id}
                      className="cursor-pointer hover:shadow-md transition-all hover:border-blue-300"
                      onClick={() => handleSlotClick(slot.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded overflow-hidden border flex-shrink-0">
                            {images[slot.id] ? (
                              <img
                                src={images[slot.id]}
                                alt={slot.label}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{slot.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {slot.aspectRatio} • Click to change
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Preview Area */}
        <div className="flex-1 bg-gray-100 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
              <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-between">
                <span className="text-sm font-medium">Live Preview</span>
                <span className="text-xs text-gray-400">Updates in real-time</span>
              </div>
              <div
                className="w-full min-h-[600px]"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Publish Success Modal */}
      {showPublishModal && landingPage && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <Card className="max-w-lg w-full animate-in fade-in zoom-in duration-300">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Page Published! 🚀</CardTitle>
              <CardDescription>Your landing page is now live on the web</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Live URL */}
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Live at:</p>
                <p className="font-mono text-blue-600 font-semibold break-all">
                  {window.location.origin}/l/{landingPage.slug}
                </p>
              </div>

              {/* QR Connected Banner */}
              {qrId && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800 font-medium text-center">
                    ✅ QR code connected to this page
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => window.open(`/l/${landingPage.slug}`, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Live Page
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/dashboard/print-orders/new?landingPageId=${landingPageId}`)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Order Prints & Flyers
                </Button>

                {!landingPage.customDomain && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push('/pricing')}
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Connect Custom Domain (Pro)
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowPublishModal(false);
                    router.push('/dashboard/landing-pages');
                  }}
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Browser Modal */}
      <Dialog open={isBrowserOpen} onOpenChange={setIsBrowserOpen}>
        <DialogContent className="max-w-full sm:max-w-4xl h-[90vh] sm:h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedSlot && template ? 
                `Select Image for ${template.metadata.imageSlots.find(s => s.id === selectedSlot)?.label}` : 
                'Select Image'
              }
            </DialogTitle>
          </DialogHeader>
          {selectedSlot && template && (
            <ImageBrowser
              category={template.category.toLowerCase()}
              onSelect={(url) => replaceImage(selectedSlot, url)}
              currentImage={images[selectedSlot]}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
