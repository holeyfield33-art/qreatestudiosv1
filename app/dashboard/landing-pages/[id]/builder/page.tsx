'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Eye, Save, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';
import './builder.css';

const GrapesJSEditor = dynamic(() => import('@/components/builder/GrapesJSEditor'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      Loading editor...
    </div>
  ),
});

interface BuilderPageProps {
  params: Promise<{ id: string }>;
}

// Helper function to convert Puck template format to GrapesJS HTML
function convertPuckToHtml(puckData: any): string {
  if (!puckData || !puckData.content || !Array.isArray(puckData.content)) {
    return '';
  }

  let html = '';
  
  for (const component of puckData.content) {
    const props = component.props || {};
    
    switch (component.type) {
      case 'HeroSection':
        const bgImage = typeof props.backgroundImage === 'string' 
          ? props.backgroundImage 
          : props.backgroundImage?.url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920';
        
        html += `
          <section style="min-height: ${props.minHeight || '70vh'}; display: flex; align-items: center; justify-content: center; background: ${props.overlay ? 'linear-gradient(rgba(0,0,0,' + (props.overlayOpacity || 50) / 100 + '), rgba(0,0,0,' + (props.overlayOpacity || 50) / 100 + ')), ' : ''}url('${bgImage}') center/cover; color: white; text-align: ${props.textAlign || 'center'}; padding: 40px 20px;">
            <div style="max-width: 800px;">
              <h1 style="font-size: 56px; margin-bottom: 24px; font-weight: bold;">${props.headline || 'Welcome'}</h1>
              ${props.subheadline ? `<p style="font-size: 20px; margin-bottom: 32px; line-height: 1.6;">${props.subheadline}</p>` : ''}
              ${props.ctaText ? `<a href="${props.ctaLink || '/auth/signup'}" style="display: inline-block; padding: 16px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${props.ctaText}</a>` : ''}
            </div>
          </section>
        `;
        break;
        
      case 'FeaturesSection':
        html += `
          <section style="padding: 80px 20px; background: #f9fafb;">
            <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
              ${props.title ? `<h2 style="font-size: 42px; margin-bottom: 16px; font-weight: bold;">${props.title}</h2>` : ''}
              ${props.subtitle ? `<p style="font-size: 18px; color: #6b7280; margin-bottom: 48px;">${props.subtitle}</p>` : ''}
              <div style="display: grid; grid-template-columns: repeat(${props.columns || 3}, 1fr); gap: 32px;">
                ${(props.features || []).map((feature: any) => `
                  <div style="padding: 32px; background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h3 style="font-size: 24px; margin-bottom: 12px; font-weight: 600;">${feature.title}</h3>
                    <p style="color: #6b7280; line-height: 1.6;">${feature.description}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        `;
        break;
        
      case 'GallerySection':
        html += `
          <section style="padding: 80px 20px;">
            <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
              ${props.title ? `<h2 style="font-size: 42px; margin-bottom: 16px; font-weight: bold;">${props.title}</h2>` : ''}
              ${props.subtitle ? `<p style="font-size: 18px; color: #6b7280; margin-bottom: 48px;">${props.subtitle}</p>` : ''}
              <div style="display: grid; grid-template-columns: repeat(${props.columns || 3}, 1fr); gap: 24px;">
                ${(props.images || []).map((img: any) => `
                  <div style="position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden;">
                    <img src="${img.url}" alt="${img.alt || ''}" style="width: 100%; height: 100%; object-fit: cover;" />
                  </div>
                `).join('')}
              </div>
            </div>
          </section>
        `;
        break;
        
      case 'CTASection':
        html += `
          <section style="padding: 100px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center;">
            <div style="max-width: 800px; margin: 0 auto;">
              ${props.title ? `<h2 style="font-size: 48px; margin-bottom: 24px; font-weight: bold;">${props.title}</h2>` : ''}
              ${props.description ? `<p style="font-size: 20px; margin-bottom: 40px; line-height: 1.6;">${props.description}</p>` : ''}
              <div style="display: flex; gap: 16px; justify-content: center;">
                ${props.primaryCta ? `<a href="${props.primaryCta.link || '/auth/signup'}" style="display: inline-block; padding: 16px 32px; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">${props.primaryCta.text}</a>` : ''}
                ${props.secondaryCta ? `<a href="${props.secondaryCta.link || '/pricing'}" style="display: inline-block; padding: 16px 32px; background: transparent; color: white; text-decoration: none; border: 2px solid white; border-radius: 8px; font-weight: 600; font-size: 16px;">${props.secondaryCta.text}</a>` : ''}
              </div>
            </div>
          </section>
        `;
        break;

      case 'MenuSection':
        html += `
          <section style="padding: 80px 20px; background: #ffffff;">
            <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
              <h2 style="font-size: 42px; margin-bottom: 16px; font-weight: bold;">${props.menu?.name || 'Our Menu'}</h2>
              ${props.menu?.description ? `<p style="font-size: 18px; color: #6b7280; margin-bottom: 48px;">${props.menu.description}</p>` : ''}
            </div>
            <div style="max-width: 900px; margin: 0 auto;">
              ${(Array.isArray(props.menu?.categories) && props.menu.categories.length > 0)
                ? props.menu.categories.map((category: any) => `
                  <div style="margin-bottom: 40px;">
                    <h3 style="font-size: 28px; font-weight: 600; margin-bottom: 16px;">${category.name || 'Category'}</h3>
                    <div style="display: grid; gap: 12px;">
                      ${(Array.isArray(category.items) ? category.items : []).map((item: any) => `
                        <div style="display: flex; justify-content: space-between; gap: 12px; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; background: #ffffff;">
                          <div>
                            <div style="font-weight: 600;">${item.name || 'Menu Item'}</div>
                            ${item.description ? `<div style="color: #6b7280; font-size: 14px;">${item.description}</div>` : ''}
                          </div>
                          ${typeof item.price === 'number' ? `<div style="font-weight: 600;">${props.menu?.currencySymbol || '$'}${item.price.toFixed(2)}</div>` : ''}
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `).join('')
                : `
                  <div style="text-align: center; color: #6b7280; padding: 20px;">
                    Menu data will appear here once available.
                  </div>
                `}
            </div>
          </section>
        `;
        break;

      case 'QRCodeSection':
        html += `
          <section style="padding: 80px 20px; background: #f9fafb; text-align: center;">
            <div style="max-width: 800px; margin: 0 auto;">
              ${props.title ? `<h2 style="font-size: 42px; margin-bottom: 16px; font-weight: bold;">${props.title}</h2>` : ''}
              ${props.subtitle ? `<p style="font-size: 18px; color: #6b7280; margin-bottom: 32px;">${props.subtitle}</p>` : ''}
              <div style="display: inline-block; padding: 20px; background: white; border-radius: 16px; box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);">
                ${props.qrCodeUrl ? `<img src="${props.qrCodeUrl}" alt="QR code" style="width: 220px; height: 220px; object-fit: contain;" />` : `
                  <div style="width: 220px; height: 220px; border: 2px dashed #cbd5f5; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #94a3b8;">
                    QR Code Preview
                  </div>
                `}
              </div>
              ${props.destinationUrl ? `<p style="margin-top: 16px; color: #6b7280;">${props.destinationUrl}</p>` : ''}
            </div>
          </section>
        `;
        break;

      case 'ContactSection':
        html += `
          <section style="padding: 80px 20px; background: #f9fafb;">
            <div style="max-width: 1100px; margin: 0 auto;">
              ${props.title ? `<h2 style="text-align: center; font-size: 40px; margin-bottom: 16px; font-weight: bold;">${props.title}</h2>` : ''}
              ${props.subtitle ? `<p style="text-align: center; color: #6b7280; margin-bottom: 48px;">${props.subtitle}</p>` : ''}
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px;">
                ${props.address ? `<div><strong>Address</strong><p style="color: #6b7280; white-space: pre-line;">${props.address}</p></div>` : ''}
                ${props.phone ? `<div><strong>Phone</strong><p style="color: #6b7280;">${props.phone}</p></div>` : ''}
                ${props.email ? `<div><strong>Email</strong><p style="color: #6b7280;">${props.email}</p></div>` : ''}
                ${(Array.isArray(props.hours) && props.hours.length > 0) ? `
                  <div>
                    <strong>Hours</strong>
                    ${(props.hours || []).map((hour: any) => {
                      const text = typeof hour === 'string' ? hour : hour?.text;
                      return text ? `<p style=\"color: #6b7280;\">${text}</p>` : '';
                    }).join('')}
                  </div>
                ` : ''}
              </div>
              ${props.mapEmbed ? `
                <div style="margin-top: 32px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);">
                  <iframe src="${props.mapEmbed}" style="border: 0; width: 100%; height: 360px;" loading="lazy" allowfullscreen></iframe>
                </div>
              ` : ''}
            </div>
          </section>
        `;
        break;

      case 'LegacyHTML':
        html += props.html || '';
        break;

      case 'GrapesJSSection':
        html += props.html || '';
        break;

      default:
        html += `
          <section style="padding: 40px 20px; border: 1px dashed #cbd5f5; margin: 20px 0; text-align: center; color: #64748b;">
            Unsupported section: ${component.type}
          </section>
        `;
        break;
    }
  }
  
  return html;
}

export default function BuilderPage({ params }: BuilderPageProps) {
  const [pageId, setPageId] = useState<string>('');
  const [editorData, setEditorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pageName, setPageName] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const editorDataRef = useRef<{ html: string; css: string; json: any } | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setPageId(id);
      loadPageData(id);
    });
  }, [params]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadPageData = async (id: string) => {
    try {
      const res = await fetch(`/api/landing-pages/${id}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load page');
      
      const response = await res.json();
      const page = response.landingPage || response;

      setPageName(page.title || page.name);
      setPageSlug(page.slug);
      
      // Load content - prioritize draft, then published
      let content = page.draftContent || page.publishedContent;
      
      // Convert template data to GrapesJS format if needed
      if (content && content.content && Array.isArray(content.content)) {
        // This is Puck format, convert to GrapesJS HTML
        const html = convertPuckToHtml(content);
        const nextData = { html, css: '', json: null };
        setEditorData(nextData);
        editorDataRef.current = nextData;
      } else if (content && typeof content === 'object' && (content.html || content.json)) {
        // Already in GrapesJS format
        const nextData = {
          html: content.html || '',
          css: content.css || '',
          json: content.json ?? null,
        };
        setEditorData(nextData);
        editorDataRef.current = nextData;
      } else if (page.Template && page.Template.defaultSections) {
        // Load from template
        const html = convertPuckToHtml(page.Template.defaultSections);
        const nextData = { html, css: '', json: null };
        setEditorData(nextData);
        editorDataRef.current = nextData;
      } else {
        // Empty page - load default hero
        const defaultHtml = `
          <section style="min-height: 70vh; display: flex; align-items: center; justify-content: center; background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920') center/cover; color: white; text-align: center; padding: 40px 20px;">
            <div style="max-width: 800px;">
              <h1 style="font-size: 56px; margin-bottom: 24px; font-weight: bold;">Welcome to Your Landing Page</h1>
              <p style="font-size: 20px; margin-bottom: 32px; line-height: 1.6;">Start building your amazing page</p>
              <a href="/auth/signup" style="display: inline-block; padding: 16px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Get Started</a>
            </div>
          </section>
        `;
        const nextData = { html: defaultHtml, css: '', json: null };
        setEditorData(nextData);
        editorDataRef.current = nextData;
      }
      
      setLastSaved(page.updatedAt ? new Date(page.updatedAt) : null);
    } catch (error) {
      console.error('Error loading page:', error);
      toast.error('Failed to load page', {
        description: 'Please refresh the page or contact support if the issue persists.'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveToAPI = async (showToast = true) => {
    try {
      if (!editorDataRef.current) {
        throw new Error('Editor not initialized');
      }

      const { html, css, json } = editorDataRef.current;

      const contentToSave = {
        html,
        css,
        json,
        timestamp: new Date().toISOString(),
      };

      const res = await fetch(`/api/landing-pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftContent: contentToSave }),
        credentials: 'include',
      });

      if (!res.ok) {
        let errorMessage = 'Failed to save';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (_e) {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      if (showToast) {
        toast.success('Draft saved', {
          description: 'Your changes have been saved successfully.',
          duration: 2000
        });
      }

      return true;
    } catch (error) {
      console.error('Error saving:', error);
      if (showToast) {
        toast.error('Failed to save draft', {
          description: error instanceof Error ? error.message : 'Your changes are stored locally. Try again or contact support.',
        });
      }
      return false;
    }
  };

  // Auto-save with debouncing
  const scheduleAutoSave = useCallback(() => {
    setHasUnsavedChanges(true);

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      setAutoSaving(true);
      await saveToAPI(false);
      setAutoSaving(false);
    }, 3000); // Auto-save after 3 seconds of no changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  // Handle editor changes
  const handleEditorChange = useCallback((data?: { html: string; css: string; json: any }) => {
    if (data) {
      editorDataRef.current = data;
    }
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  const handleManualSave = async () => {
    if (!editorDataRef.current || saving) return;

    setSaving(true);
    const _success = await saveToAPI(true);
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!editorDataRef.current) return;

    setSaving(true);
    try {
      // First save current data as draft
      await saveToAPI(false);

      // Use versioned deploy endpoint (with rollback support)
      const res = await fetch(`/api/landing-pages/${pageId}/deploy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deploy' }),
        credentials: 'include',
      });

      if (!res.ok) {
        // Fallback to simple publish if deploy endpoint fails
        const fallbackRes = await fetch(`/api/landing-pages/${pageId}/publish`, {
          method: 'POST',
          credentials: 'include',
        });
        if (!fallbackRes.ok) throw new Error('Failed to publish');
      }

      const data = await res.json().catch(() => ({}));

      toast.success('Page published!', {
        description: data.deployment?.url 
          ? `Live at ${data.deployment.url} (v${data.deployment?.version || 1})`
          : 'Your landing page is now live and visible to visitors.',
        duration: 4000
      });

      setHasUnsavedChanges(false);

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/landing-pages');
      }, 1500);
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Failed to publish', {
        description: 'Please try again or contact support if the issue persists.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(`/l/${pageSlug}?preview=true`, '_blank');
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/dashboard/landing-pages');
      }
    } else {
      router.push('/dashboard/landing-pages');
    }
  };

  const getLastSavedText = () => {
    if (!lastSaved) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Saved just now';
    if (diffMins === 1) return 'Saved 1 minute ago';
    if (diffMins < 60) return `Saved ${diffMins} minutes ago`;
    
    return `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="relative mb-6">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
            <Sparkles className="h-5 w-5 text-primary/60 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Loading your workspace</h2>
          <p className="text-sm text-muted-foreground">Preparing the visual editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 builder-container">
      {/* Premium Custom Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="border-l pl-4 h-8 flex items-center">
            <div>
              <h1 className="font-semibold text-base leading-none mb-1">{pageName}</h1>
              <p className="text-xs text-muted-foreground font-mono">/l/{pageSlug}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Auto-save indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mr-2">
            {autoSaving ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Saving...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <Clock className="w-3 h-3" />
                <span>Unsaved changes</span>
              </>
            ) : lastSaved ? (
              <>
                <Clock className="w-3 h-3" />
                <span>{getLastSavedText()}</span>
              </>
            ) : null}
          </div>

          <div className="h-6 w-px bg-border" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="hover:bg-slate-100 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualSave}
            disabled={saving || autoSaving || !hasUnsavedChanges}
            className="hover:bg-slate-100 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 transition-all shadow-sm hover:shadow"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Publish
              </>
            )}
          </Button>
        </div>
      </div>

      {/* GrapesJS Editor */}
      <div className="flex-1 overflow-hidden">
        {editorData ? (
          <GrapesJSEditor
            initialData={editorData}
            onChange={handleEditorChange}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">Loading editor...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
