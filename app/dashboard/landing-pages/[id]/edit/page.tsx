'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function EditLandingPagePage() {
  const params = useParams();
  const router = useRouter();
  const [landingPage, setLandingPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchLandingPage();
    }
  }, [params.id]);

  async function fetchLandingPage() {
    try {
      const res = await fetch(`/api/landing-pages/${params.id}`);
      const data = await res.json();
      
      if (data.success) {
        setLandingPage(data.landingPage);
        setTitle(data.landingPage.title);
        setSlug(data.landingPage.slug);
        setPublished(data.landingPage.published);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('Failed to load landing page:', error);
      }
      toast.error('Failed to load landing page');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/landing-pages/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug,
          published,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success('Landing page saved!');
        fetchLandingPage();
      } else {
        toast.error(result.error || 'Failed to save');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setSaving(true);
    try {
      const res = await fetch(`/api/landing-pages/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          published: !published,
        }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success(published ? 'Landing page unpublished' : 'Landing page published!');
        setPublished(!published);
        fetchLandingPage();
      } else {
        toast.error(result.error || 'Failed to update');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" role="status" aria-label="Loading"></div>
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Edit Landing Page</h1>
          <p className="text-muted-foreground">Customize your landing page</p>
        </div>
        <div className="flex gap-2">
          {published && (
            <Button variant="outline" asChild className="min-h-[44px]">
              <a href={`/l/${slug}`} target="_blank" rel="noopener noreferrer">
                View Live
              </a>
            </Button>
          )}
          <Button
            onClick={handlePublish}
            variant={published ? 'secondary' : 'default'}
            disabled={saving}
            className="min-h-[44px]"
          >
            {published ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Page Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">
                  Page Title <span className="text-red-500" aria-label="required">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Landing Page"
                  aria-required="true"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="slug">
                  URL Slug <span className="text-red-500" aria-label="required">*</span>
                </Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-muted-foreground">/l/</span>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-landing-page"
                    aria-required="true"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Public URL: {typeof window !== 'undefined' && window.location.origin}/l/{slug}
                </p>
              </div>

              <Button onClick={handleSave} disabled={saving} className="min-h-[44px]">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Views</p>
                <p className="text-2xl font-bold">{landingPage?.views || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-bold">{published ? 'Live' : 'Draft'}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Content Editor</h3>
            <p className="text-muted-foreground">
              Visual content editor coming soon. For now, customize content via settings.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Design Customization</h3>
            <p className="text-muted-foreground">
              Theme customization coming soon. For now, pages use template defaults.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
