'use client';

import { Puck } from '@measured/puck';
import '@measured/puck/puck.css';
import puckConfig from '@/lib/puckConfig';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

interface BuilderPageProps {
  params: Promise<{ id: string }>;
}

export default function BuilderPage({ params }: BuilderPageProps) {
  const [pageId, setPageId] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageName, setPageName] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const router = useRouter();

  useEffect(() => {
    params.then(({ id }) => {
      setPageId(id);
      loadPageData(id);
    });
  }, [params]);

  const loadPageData = async (id: string) => {
    try {
      const res = await fetch(`/api/landing-pages/${id}`);
      if (!res.ok) throw new Error('Failed to load page');
      
      const page = await res.json();
      setPageName(page.name);
      setPageSlug(page.slug);
      
      // Use draft content if available, otherwise published, otherwise empty
      const content = page.draftContent || page.publishedContent || { content: [], root: {} };
      setData(content);
    } catch (error) {
      console.error('Error loading page:', error);
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newData: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/landing-pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draftContent: newData }),
      });

      if (!res.ok) throw new Error('Failed to save');
      
      setData(newData);
      toast.success('Draft saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
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
      });

      // Then publish
      const res = await fetch(`/api/landing-pages/${pageId}/publish`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to publish');
      
      toast.success('Page published successfully!');
      router.push('/dashboard/landing-pages');
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Failed to publish page');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    window.open(`/l/${pageSlug}?preview=true`, '_blank');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Custom Header */}
      <div className="border-b bg-white px-4 py-3 flex items-center justify-between">
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
            <h1 className="font-semibold">{pageName}</h1>
            <p className="text-sm text-muted-foreground">/l/{pageSlug}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(data)}
            disabled={saving}
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
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </Button>
        </div>
      </div>

      {/* Puck Editor */}
      <div className="flex-1 overflow-hidden">
        <Puck
          config={puckConfig}
          data={data}
          onPublish={handleSave}
        />
      </div>
    </div>
  );
}
