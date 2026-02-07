'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { LANDING_PAGE_TEMPLATES, LandingPageTemplate } from '@/lib/templates/landing-page-templates';
import { ImageBrowser } from '@/components/ImageBrowser';
import MenuManager from '@/components/landing-pages/MenuManager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Save, Image as ImageIcon, ArrowLeft, ExternalLink, Check, Eye, Printer, Globe, UtensilsCrossed, Copy, Edit3, Info, Undo, Redo, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [editMode, setEditMode] = useState(false);
  const [htmlHistory, setHtmlHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const normalizeHtml = (rawHtml: string) => {
    if (!rawHtml) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, 'text/html');
    const bodyContent = doc.body?.innerHTML?.trim();
    return bodyContent || rawHtml;
  };

  useEffect(() => {
    if (previewRef.current && !editMode) {
      previewRef.current.innerHTML = normalizeHtml(html);
    }
  }, [html, editMode]);

  useEffect(() => {
    loadLandingPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landingPageId]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    if (!editMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y or Cmd+Shift+Z for redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, historyIndex, htmlHistory]);

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
          setHtml(normalizeHtml(page.content?.html || foundTemplate.html));

          // Initialize images
          const initialImages: Record<string, string> = {};
          foundTemplate.metadata.imageSlots.forEach((slot) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(
              normalizeHtml(page.content?.html || foundTemplate.html),
              'text/html'
            );
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
      setHtml(normalizeHtml(doc.body.innerHTML));
      toast.success('Image updated successfully');
    }
    
    setIsBrowserOpen(false);
    setSelectedSlot(null);
  };

  const saveToHistory = (newHtml: string) => {
    const newHistory = htmlHistory.slice(0, historyIndex + 1);
    newHistory.push(newHtml);
    setHtmlHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleContentEdit = (e: React.FormEvent<HTMLDivElement>) => {
    if (editMode) {
      const newHtml = e.currentTarget.innerHTML;
      setHtml(newHtml);
      setHasUnsavedChanges(true);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setHtml(htmlHistory[historyIndex - 1]);
      setHasUnsavedChanges(true);
    }
  };

  const handleRedo = () => {
    if (historyIndex < htmlHistory.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setHtml(htmlHistory[historyIndex + 1]);
      setHasUnsavedChanges(true);
    }
  };

  const toggleEditMode = () => {
    if (!editMode) {
      // Entering edit mode - save current state to history
      saveToHistory(html);
    }
    setEditMode(!editMode);
  };

  const handleSave = async () => {
    if (!landingPage) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/landing-pages/${landingPageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: title,
          isPublished: published,
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
        setHasUnsavedChanges(false);
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
          name: title,
          isPublished: true,
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

  const _currentSlot = selectedSlot 
    ? template.metadata.imageSlots.find((s) => s.id === selectedSlot)
    : null;

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen">
        {/* Top Header Bar */}
        <div className="bg-white border-b px-4 py-3 flex justify-between items-center shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/landing-pages')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div>
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  {title || 'Untitled Page'}
                  {hasUnsavedChanges && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                      Unsaved
                    </span>
                  )}
                </h2>
                {landingPage && (
                  <p className="text-xs text-muted-foreground">
                    {window.location.origin}/l/{landingPage.slug}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {editMode && (
              <div className="flex items-center gap-1 mr-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                    >
                      <Undo className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRedo}
                      disabled={historyIndex >= htmlHistory.length - 1}
                    >
                      <Redo className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
                </Tooltip>
              </div>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editMode ? "default" : "outline"}
                  onClick={toggleEditMode}
                  size="sm"
                  className={editMode ? "bg-gradient-to-r from-purple-600 to-blue-600" : ""}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {editMode ? 'Editing Text' : 'Edit Text'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {editMode ? 'Exit text editing mode' : 'Click to edit text directly on the page'}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save your changes as a draft</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handlePublish}
                  disabled={saving}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {saving ? 'Publishing...' : 'Publish →'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Publish your page to make it live</TooltipContent>
            </Tooltip>
          </div>
        </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Controls */}
        <div className="w-80 bg-gradient-to-b from-white to-gray-50 border-r shadow-lg overflow-y-auto">
          <Tabs defaultValue="design" className="w-full">
            <TabsList className="w-full grid grid-cols-3 p-2 m-3 bg-gray-100">
              <TabsTrigger value="design" className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
                Design
              </TabsTrigger>
              <TabsTrigger value="menu" className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <UtensilsCrossed className="w-3.5 h-3.5 mr-1.5" />
                Menu
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Design Tab */}
            <TabsContent value="design" className="p-4 space-y-6 m-0">
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
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                      Page Images
                    </h3>
                    {!editMode && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {template.metadata.imageSlots.length} images
                      </span>
                    )}
                  </div>
                  {editMode && (
                    <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-lg shadow-sm">
                      <p className="text-xs text-amber-900 flex items-center gap-2">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        <span><strong>Edit Mode Active:</strong> Turn off Edit Mode to change images.</span>
                      </p>
                    </div>
                  )}
                  <div className="space-y-3">
                    {template.metadata.imageSlots.map((slot) => (
                      <Tooltip key={slot.id}>
                        <TooltipTrigger asChild>
                          <Card
                            className={`transition-all duration-200 ${
                              editMode
                                ? 'opacity-50 grayscale cursor-not-allowed'
                                : 'cursor-pointer hover:shadow-lg hover:border-blue-400 hover:scale-[1.02]'
                            }`}
                            onClick={() => !editMode && handleSlotClick(slot.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 flex-shrink-0 shadow-sm">
                                  {images[slot.id] ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={images[slot.id]}
                                      alt={slot.label}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                      <ImageIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-sm truncate text-gray-900">{slot.label}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {slot.aspectRatio}
                                  </p>
                                  {!editMode && (
                                    <p className="text-xs text-blue-600 font-medium mt-1">
                                      Click to change →
                                    </p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                          {editMode ? 'Exit edit mode to change images' : `Click to change ${slot.label}`}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Menu Tab */}
            <TabsContent value="menu" className="p-4 m-0">
              <div className="space-y-4">
                {qrId && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-semibold text-green-800 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Connected to QR Code
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      This landing page is linked to your QR code
                    </p>
                  </div>
                )}
                <MenuManager landingPageId={landingPageId} />
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="p-4 space-y-4 m-0">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">
                  Advanced Settings
                </h3>
                
                {landingPage && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-semibold mb-1 block">Landing Page URL</Label>
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-sm font-mono truncate flex-1 text-gray-700">
                          {window.location.origin.replace(/^https?:\/\//, '')}/l/{landingPage.slug}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/l/${landingPage.slug}`);
                            toast.success('URL copied to clipboard');
                          }}
                          className="flex-shrink-0 h-8 w-8 p-0"
                          aria-label="Copy URL"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(`/l/${landingPage.slug}`, '_blank')}
                          className="flex-shrink-0 h-8 w-8 p-0"
                          aria-label="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {landingPage.customDomain && (
                      <div>
                        <Label className="text-xs font-semibold mb-1 block">Custom Domain</Label>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                          <span className="text-sm font-mono truncate flex-1 text-blue-900">
                            {landingPage.customDomain}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              if (landingPage.customDomain) {
                                navigator.clipboard.writeText(landingPage.customDomain);
                                toast.success('Domain copied to clipboard');
                              }
                            }}
                            className="flex-shrink-0 h-8 w-8 p-0"
                            aria-label="Copy domain"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Center Preview Area */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {editMode && (
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-purple-900 mb-1">
                      Text Editing Mode Active
                    </p>
                    <p className="text-xs text-purple-700">
                      Click any text in the preview below to edit it. Use <kbd className="px-1.5 py-0.5 bg-white border border-purple-300 rounded text-xs font-mono">Ctrl+Z</kbd> to undo and <kbd className="px-1.5 py-0.5 bg-white border border-purple-300 rounded text-xs font-mono">Ctrl+Y</kbd> to redo. Changes are saved automatically to your draft.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className={`bg-white shadow-2xl rounded-lg overflow-hidden transition-all ${editMode ? 'ring-4 ring-purple-300' : ''}`}>
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-semibold">Live Preview</span>
                </div>
                <span className="text-xs text-gray-300 flex items-center gap-1">
                  {editMode ? (
                    <>
                      <Edit3 className="w-3 h-3" />
                      Click text to edit
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Updates in real-time
                    </>
                  )}
                </span>
              </div>
              <div
                ref={previewRef}
                className={`w-full min-h-[600px] transition-all ${
                  editMode
                    ? 'cursor-text outline-none'
                    : ''
                }`}
                contentEditable={editMode}
                onInput={handleContentEdit}
                onBlur={handleContentEdit}
                suppressContentEditableWarning={true}
                style={editMode ? { minHeight: '600px' } : {}}
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
              <CardTitle className="text-2xl">Page Published</CardTitle>
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
                  <p className="text-sm text-green-800 font-medium text-center flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    QR code connected to this page
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
    </TooltipProvider>
  );
}
