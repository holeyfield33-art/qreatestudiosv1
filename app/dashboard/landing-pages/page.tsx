'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function LandingPagesPage() {
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLandingPages();
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
      if (process.env.NODE_ENV === 'development') console.error('Failed to load landing pages:', error);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Landing Pages</h1>
          <p className="text-muted-foreground">
            Create beautiful landing pages with QR codes
          </p>
        </div>
        <Link href="/dashboard/landing-pages/create">
          <Button size="lg" className="min-h-[44px]">
            Create Landing Page
          </Button>
        </Link>
      </div>

      {landingPages.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Your landing pages">
          {landingPages.map((page) => (
            <Card key={page.id} className="p-6" role="listitem">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg mb-1">{page.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    /{page.slug}
                  </p>
                </div>
                <Badge variant={page.published ? 'default' : 'secondary'}>
                  {page.published ? 'Published' : 'Draft'}
                </Badge>
              </div>

              {page.qrCode && (
                <div className="mb-4 text-sm">
                  <span className="text-muted-foreground">Linked QR: </span>
                  <span className="font-medium">{page.qrCode.name}</span>
                </div>
              )}

              <div className="mb-4 text-sm text-muted-foreground">
                {page.views} views • Created {new Date(page.createdAt).toLocaleDateString()}
              </div>

              <div className="flex gap-2" role="group" aria-label="Landing page actions">
                <Link href={`/dashboard/landing-pages/${page.id}/edit`} className="flex-1">
                  <Button variant="outline" className="w-full min-h-[44px]">
                    Edit
                  </Button>
                </Link>
                {page.published && (
                  <Link href={`/l/${page.slug}`} target="_blank" className="flex-1">
                    <Button variant="default" className="w-full min-h-[44px]">
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
              Create your first landing page to get started
            </p>
            <Link href="/dashboard/landing-pages/create">
              <Button size="lg" className="min-h-[44px]">
                Create Landing Page
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
