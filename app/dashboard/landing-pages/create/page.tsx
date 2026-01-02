'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LANDING_PAGE_TEMPLATES } from '@/lib/templates/landing-page-templates';
import Image from 'next/image';

export default function CreateLandingPagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const templateParam = searchParams.get('template');
    if (templateParam) {
      setSelectedTemplate(templateParam);
    }
  }, [searchParams]);

  async function handleTemplateSelect(templateId: string) {
    setSelectedTemplate(templateId);
  }

  async function generateWithAI() {
    setGenerating(true);
    toast.info('AI generation feature coming soon! Use templates for now.');
    setGenerating(false);
  }

  async function createFromTemplate() {
    if (!selectedTemplate) return;

    const template = LANDING_PAGE_TEMPLATES.find((t) => t.id === selectedTemplate);
    if (!template) return;

    setLoading(true);
    try {
      const slug = `landing-${Date.now()}`;
      
      const res = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: template.name,
          slug,
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
        toast.success('Landing page created!');
        router.push(`/dashboard/landing-pages/${result.landingPage.id}/edit`);
      } else {
        toast.error(result.error || 'Failed to create');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Template creation error:', error);
      }
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create Landing Page</h1>
        <p className="text-muted-foreground">
          Choose a professional template or generate with AI
        </p>
      </div>

      <div className="flex gap-4">
        <Button onClick={generateWithAI} size="lg" disabled={generating} className="min-h-[44px]">
          {generating ? 'Generating...' : '✨ Generate with AI'}
        </Button>
        <Button variant="outline" size="lg" className="min-h-[44px]">
          Start from Scratch
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Choose a Template</h2>
        
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" role="list" aria-label="Landing page templates">
          {LANDING_PAGE_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className={`overflow-hidden cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${
                selectedTemplate === template.id
                  ? 'border-2 border-blue-600 shadow-lg'
                  : 'hover:border-gray-400 hover:shadow-md'
              }`}
              onClick={() => handleTemplateSelect(template.id)}
              role="radio"
              aria-checked={selectedTemplate === template.id}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTemplateSelect(template.id);
                }
              }}
            >
              <div className="relative aspect-video bg-gray-200">
                {template.previewImage ? (
                  <Image
                    src={template.previewImage}
                    alt={template.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl" role="img" aria-label={template.name}>
                      {getTemplateIcon(template.id)}
                    </span>
                  </div>
                )}
                {selectedTemplate === template.id && (
                  <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                    <div className="bg-blue-600 text-white rounded-full p-2">
                      ✓
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1">{template.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {template.description}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {template.category}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedTemplate && (
        <div className="flex justify-end">
          <Button 
            onClick={createFromTemplate} 
            size="lg" 
            disabled={loading}
            className="min-h-[44px]"
          >
            {loading ? 'Creating...' : 'Create from Template'}
          </Button>
        </div>
      )}
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
