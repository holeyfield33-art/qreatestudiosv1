'use client';

import dynamic from 'next/dynamic';
import puckConfig from '@/lib/puckConfig';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Eye, Save, Sparkles, Undo2, Redo2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import '@measured/puck/puck.css';
import './builder.css';

// Lazy load Puck to avoid compilation timeout
const Puck = dynamic(
  () => import('@measured/puck').then((mod) => mod.Puck),
  {
    ssr: false,
  }
);

interface BuilderPageProps {
  params: Promise<{ id: string }>;
}

export default function BuilderPage({ params }: BuilderPageProps) {
  const [pageId, setPageId] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pageName, setPageName] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const router = useRouter();
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const puckRef = useRef<any>(null);

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
      // Handle both direct page object and nested landingPage structure
      const page = response.landingPage || response;
      
      setPageName(page.name);
      setPageSlug(page.slug);
      
      // Use draft content if available, otherwise published, otherwise template defaults
      let content = page.draftContent || page.publishedContent;
      
      // If content is empty or missing sections, try to load from template
      if (!content || !content.content || content.content.length === 0) {
        // Check if there's a template with defaultSections
        if (page.Template && page.Template.defaultSections) {
          content = page.Template.defaultSections;
          console.log('Loading template default sections:', content);
        } else if (!content || typeof content !== 'object') {
          // Last resort: create empty structure
          content = { content: [], root: { props: {} } };
        }
      }
      
      // Ensure content has proper Puck structure
      if (!content.content) {
        content.content = [];
      }
      if (!content.root) {
        content.root = { props: {} };
      }
      
      console.log('📊 Builder data loaded:', {
        hasContent: !!content,
        contentLength: content.content?.length || 0,
        components: content.content?.map((c: any) => c.type) || [],
        hasRoot: !!content.root,
        firstComponent: content.content?.[0],
        fullStructure: JSON.stringify(content, null, 2)
      });
      
      // Ensure proper Puck data structure
      const puckData = {
        content: content.content || [],
        root: content.root || { props: {} }
      };
      
      console.log('🎨 Setting Puck data:', puckData);
      setData(puckData);
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

  const saveToAPI = async (newData: any, showToast = true) => {
    try {
      // Validate data structure before saving
      if (!newData || typeof newData !== 'object') {
        throw new Error('Invalid data structure');
      }
      
      // Ensure required Puck structure
      const validatedData = {
        content: Array.isArray(newData.content) ? newData.content : [],
        root: newData.root || { props: {} },
        zones: newData.zones || {}
      };
      
      const res = await fetch(`/api/landing-pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftContent: validatedData }),
        credentials: 'include',
      });

      if (!res.ok) {
        let errorMessage = 'Failed to save';
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      // Parse successful response
      try {
        await res.json();
      } catch (e) {
        // If response body is empty or not JSON, that's okay for PATCH
        console.log('Response parsed successfully (no body)');
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
  const scheduleAutoSave = useCallback((newData: any) => {
    setHasUnsavedChanges(true);
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      setAutoSaving(true);
      await saveToAPI(newData, false);
      setAutoSaving(false);
    }, 2000); // Auto-save after 2 seconds of no changes
  }, [pageId]);

  // Handle Puck onChange - THIS IS THE CRITICAL FIX
  const handleChange = useCallback((newData: any) => {
    setData(newData);
    scheduleAutoSave(newData);
  }, [scheduleAutoSave]);

  const handleManualSave = async () => {
    if (!data || saving) return;
    
    setSaving(true);
    const success = await saveToAPI(data, true);
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!data) return;
    
    setSaving(true);
    try {
      // First save current data as draft
      await fetch(`/api/landing-pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftContent: data }),
        credentials: 'include',
      });

      // Then publish
      const res = await fetch(`/api/landing-pages/${pageId}/publish`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to publish');
      
      toast.success('Page published!', {
        description: 'Your landing page is now live and visible to visitors.',
        duration: 3000
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

      {/* Puck Editor with onChange handler */}
      <div className="flex-1 overflow-hidden puck-editor-wrapper">
        {data ? (
          <>
            {console.log('🖼️ Rendering Puck with data:', {
              contentCount: data.content?.length,
              components: data.content?.map((c: any) => c.type),
              hasRoot: !!data.root
            })}
            <Puck
              config={puckConfig}
              data={data}
              onChange={handleChange}
              onPublish={handleManualSave}
            />
          </>
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
