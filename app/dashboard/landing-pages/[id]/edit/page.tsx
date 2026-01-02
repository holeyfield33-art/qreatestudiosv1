'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LANDING_PAGE_TEMPLATES, LandingPageTemplate } from '@/lib/templates/landing-page-templates';
import { ImageBrowser } from '@/components/ImageBrowser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Image as ImageIcon, ArrowLeft, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  content: any;
  theme: any;
  published: boolean;
}

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const landingPageId = params.id as string;

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
      console.error('Error loading landing page:', error);
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
      console.error('Error saving landing page:', error);
      toast.error('Failed to save landing page');
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
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Left Sidebar - Mobile: takes full width, Desktop: fixed width */}
      <div className="w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col max-h-screen">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/landing-pages')}
            className="mb-4 min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Landing Pages
          </Button>
          
          {/* Title Input */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title"
                className="min-h-[44px]"
              />
            </div>

            {/* Published Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="published" className="cursor-pointer">
                Published
              </Label>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
            </div>

            {/* View Live Link */}
            {published && landingPage && (
              <a
                href={`/l/${landingPage.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View live page
              </a>
            )}
          </div>
        </div>

        {/* Image Slots */}
        {template && template.metadata.imageSlots.length > 0 && (
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Image Slots</h2>
            <div className="space-y-4">
              {template.metadata.imageSlots.map((slot) => (
                <Card
                  key={slot.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSlotClick(slot.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      {slot.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {images[slot.id] ? (
                      <div className="relative rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={images[slot.id]}
                          alt={slot.label}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="text-white opacity-0 hover:opacity-100 transition-opacity font-medium">
                            Click to change
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Aspect Ratio: {slot.aspectRatio}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="p-4 lg:p-6 border-t border-gray-200">
          <Button 
            onClick={handleSave} 
            className="w-full min-h-[44px]" 
            size="lg"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Center Preview - Hidden on mobile, shown on desktop */}
      <div className="hidden lg:flex flex-1 overflow-auto">
        <div className="p-8 w-full">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-6xl mx-auto">
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
