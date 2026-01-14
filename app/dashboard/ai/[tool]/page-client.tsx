'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { use } from 'react';
import { Palette, Globe, FileText, Megaphone, Share2, Mail, UtensilsCrossed, FileCheck } from 'lucide-react';

const TOOL_CONFIGS: Record<string, any> = {
  'design-assistant': {
    name: 'Design Assistant',
    icon: Palette,
    description: 'Get professional design concepts with color palettes, typography, and logo ideas',
    fields: [
      { name: 'businessType', label: 'Business Type', type: 'text', placeholder: 'e.g., Coffee Shop, Tech Startup', required: true },
      { name: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g., Food & Beverage, Technology', required: true },
      { name: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'e.g., Young professionals, Families', required: true },
    ],
  },
  'webpage-designer': {
    name: 'Webpage Designer',
    icon: Globe,
    description: 'Create complete landing page layouts with compelling copy',
    fields: [
      { name: 'businessName', label: 'Business Name', type: 'text', placeholder: 'Your business name', required: true },
      { name: 'industry', label: 'Industry', type: 'text', placeholder: 'e.g., SaaS, E-commerce', required: true },
      { name: 'targetAudience', label: 'Target Audience', type: 'text', placeholder: 'Who are you targeting?', required: true },
      { name: 'keyMessage', label: 'Key Message', type: 'textarea', placeholder: 'What do you want to communicate?', required: true },
    ],
  },
  'blog-writer': {
    name: 'Blog Writer',
    icon: FileText,
    description: 'Write SEO-optimized blog posts on any topic',
    fields: [
      { name: 'topic', label: 'Blog Topic', type: 'text', placeholder: 'What do you want to write about?', required: true },
      { name: 'keywords', label: 'Target Keywords', type: 'text', placeholder: 'Comma-separated keywords', required: true },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Casual', 'Technical', 'Friendly'], required: false },
      { name: 'wordCount', label: 'Word Count', type: 'number', placeholder: '1000', required: false },
    ],
  },
  'ad-copy': {
    name: 'Ad Copy Generator',
    icon: Megaphone,
    description: 'Write high-converting ads for any platform',
    fields: [
      { name: 'platform', label: 'Platform', type: 'select', options: ['Facebook/Instagram', 'Google', 'LinkedIn', 'Twitter'], required: true },
      { name: 'product', label: 'Product/Service', type: 'text', placeholder: 'What are you advertising?', required: true },
      { name: 'audience', label: 'Target Audience', type: 'text', placeholder: 'Who is this for?', required: true },
      { name: 'benefit', label: 'Key Benefit', type: 'text', placeholder: 'Main value proposition', required: true },
      { name: 'cta', label: 'Call-to-Action', type: 'text', placeholder: 'Learn More', required: false },
      { name: 'variations', label: 'Number of Variations', type: 'number', placeholder: '3', required: false },
    ],
  },
  'social-media': {
    name: 'Social Media Captions',
    icon: Share2,
    description: 'Generate engaging posts for all platforms',
    fields: [
      { name: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok'], required: true },
      { name: 'topic', label: 'Topic', type: 'text', placeholder: 'What do you want to post about?', required: true },
      { name: 'voice', label: 'Brand Voice', type: 'text', placeholder: 'e.g., Professional, Fun, Inspirational', required: false },
      { name: 'count', label: 'Number of Posts', type: 'number', placeholder: '5', required: false },
      { name: 'includeHashtags', label: 'Include Hashtags', type: 'checkbox', required: false },
    ],
  },
  'email-template': {
    name: 'Email Templates',
    icon: Mail,
    description: 'Create professional email campaigns',
    fields: [
      { name: 'purpose', label: 'Email Purpose', type: 'text', placeholder: 'e.g., Welcome email, Newsletter, Sales', required: true },
      { name: 'audience', label: 'Audience', type: 'text', placeholder: 'Who are you emailing?', required: true },
      { name: 'tone', label: 'Tone', type: 'select', options: ['Professional', 'Friendly', 'Formal', 'Casual'], required: false },
    ],
  },
  'menu-description': {
    name: 'Menu Descriptions',
    icon: UtensilsCrossed,
    description: 'Write appetizing food descriptions',
    fields: [
      { name: 'items', label: 'Menu Items', type: 'menu-items', placeholder: 'Add menu items', required: true },
      { name: 'style', label: 'Restaurant Style', type: 'text', placeholder: 'e.g., Upscale casual, Fine dining', required: false },
      { name: 'cuisine', label: 'Cuisine Type', type: 'text', placeholder: 'e.g., Italian, Contemporary', required: false },
    ],
  },
  'business-proposal': {
    name: 'Business Proposals',
    icon: FileCheck,
    description: 'Generate professional service proposals',
    fields: [
      { name: 'clientName', label: 'Client Name', type: 'text', placeholder: 'Client or company name', required: true },
      { name: 'services', label: 'Services Offered', type: 'textarea', placeholder: 'List the services you\'re proposing', required: true },
      { name: 'timeline', label: 'Project Timeline', type: 'text', placeholder: 'e.g., 4-6 weeks', required: true },
      { name: 'budget', label: 'Budget Range', type: 'text', placeholder: 'e.g., $5,000-$10,000', required: true },
    ],
  },
};

interface AIToolPageProps {
  params: Promise<{ tool: string }>;
}

export default function AIToolPageClient({ params }: AIToolPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [menuItems, setMenuItems] = useState<Array<{ name: string; ingredients: string }>>([{ name: '', ingredients: '' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const config = TOOL_CONFIGS[resolvedParams.tool];

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-6">
          <p>Tool not found</p>
          <Button onClick={() => router.push('/dashboard/ai')} className="mt-4">
            Back to AI Tools
          </Button>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const context = { ...formData };
      
      // Special handling for menu items
      if (resolvedParams.tool === 'menu-description') {
        context.items = menuItems.filter(item => item.name.trim());
      }

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: resolvedParams.tool,
          context,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data);
        toast.success('Content generated successfully!');
      } else {
        toast.error(data.error || 'Failed to generate content');
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') console.error('Generation error:', error);
      }
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const addMenuItem = () => {
    setMenuItems([...menuItems, { name: '', ingredients: '' }]);
  };

  const removeMenuItem = (index: number) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const updateMenuItem = (index: number, field: 'name' | 'ingredients', value: string) => {
    const updated = [...menuItems];
    updated[index][field] = value;
    setMenuItems(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/ai')}
          aria-label="Back to AI Tools"
        >
          ← Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center" aria-hidden="true">
              <config.icon className="h-5 w-5 text-blue-600" />
            </div>
            {config.name}
          </h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields.map((field: any) => (
            <div key={field.name}>
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </Label>
              
              {field.type === 'text' && (
                <Input
                  id={field.name}
                  type="text"
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  className="mt-1.5"
                />
              )}
              
              {field.type === 'textarea' && (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  className="mt-1.5"
                  rows={4}
                />
              )}
              
              {field.type === 'number' && (
                <Input
                  id={field.name}
                  type="number"
                  placeholder={field.placeholder}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  className="mt-1.5"
                />
              )}
              
              {field.type === 'select' && (
                <select
                  id={field.name}
                  value={formData[field.name] || field.options[0]}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  className="mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {field.options.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
              
              {field.type === 'checkbox' && (
                <div className="flex items-center mt-1.5">
                  <input
                    id={field.name}
                    type="checkbox"
                    checked={formData[field.name] !== false}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                    className="mr-2"
                  />
                  <Label htmlFor={field.name} className="font-normal">
                    {field.label}
                  </Label>
                </div>
              )}
              
              {field.type === 'menu-items' && (
                <div className="mt-1.5 space-y-3">
                  {menuItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Item name"
                        value={item.name}
                        onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Ingredients (optional)"
                        value={item.ingredients}
                        onChange={(e) => updateMenuItem(index, 'ingredients', e.target.value)}
                        className="flex-1"
                      />
                      {menuItems.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => removeMenuItem(index)}
                          aria-label="Remove menu item"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMenuItem}
                    className="w-full"
                  >
                    + Add Another Item
                  </Button>
                </div>
              )}
            </div>
          ))}

          <Button
            type="submit"
            disabled={loading}
            className="w-full min-h-[44px]"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Generating...
              </>
            ) : (
              'Generate Content'
            )}
          </Button>
        </form>
      </Card>

      {/* Results */}
      {result && (
        <Card className="p-6" role="region" aria-live="polite" aria-label="Generated content">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Generated Content</h2>
            <div className="text-right text-sm">
              <Badge variant="outline">
                {result.usage.tokens.total.toLocaleString()} tokens
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                ${result.usage.cost.toFixed(4)} cost
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Design Assistant Results */}
            {resolvedParams.tool === 'design-assistant' && result.content.concepts && (
              <div className="space-y-6">
                {result.content.concepts.map((concept: any, index: number) => (
                  <Card key={index} className="p-4">
                    <h3 className="font-semibold mb-3">{concept.name}</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm font-medium mb-2">Color Palette:</p>
                        <div className="flex gap-2">
                          {concept.colors.map((color: string, i: number) => (
                            <div
                              key={i}
                              className="w-12 h-12 rounded border"
                              style={{ backgroundColor: color }}
                              title={color}
                              role="img"
                              aria-label={`Color ${color}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm"><strong>Typography:</strong> {concept.typography}</p>
                      <p className="text-sm"><strong>Logo Style:</strong> {concept.logoStyle}</p>
                      <p className="text-sm"><strong>Mood:</strong> {concept.mood}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Webpage Designer Results */}
            {resolvedParams.tool === 'webpage-designer' && result.content.hero && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Hero Section</h3>
                  <p className="text-2xl font-bold mb-2">{result.content.hero.headline}</p>
                  <p className="text-muted-foreground mb-2">{result.content.hero.subheadline}</p>
                  <Badge>{result.content.hero.cta}</Badge>
                  <Button
                    onClick={() => handleCopy(`${result.content.hero.headline}\n\n${result.content.hero.subheadline}\n\nCTA: ${result.content.hero.cta}`)}
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    aria-label="Copy hero section"
                  >
                    Copy
                  </Button>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Value Propositions</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {result.content.valueProps.map((prop: string, i: number) => (
                      <li key={i}>{prop}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Features</h3>
                  {result.content.features.map((feature: any, i: number) => (
                    <div key={i} className="mb-2">
                      <p className="font-medium">{feature.title || feature.name}</p>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ad Copy Results */}
            {resolvedParams.tool === 'ad-copy' && result.content.ads && (
              <div className="space-y-4">
                {result.content.ads.map((ad: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">Variation {index + 1}</Badge>
                      <Button
                        onClick={() => handleCopy(`${ad.headline}\n\n${ad.body}\n\n${ad.cta}`)}
                        variant="ghost"
                        size="sm"
                        aria-label={`Copy ad variation ${index + 1}`}
                      >
                        Copy
                      </Button>
                    </div>
                    <h3 className="font-semibold mb-2">{ad.headline}</h3>
                    <p className="text-sm mb-2">{ad.body}</p>
                    <Badge className="mt-2">{ad.cta}</Badge>
                  </Card>
                ))}
              </div>
            )}

            {/* Social Media Results */}
            {resolvedParams.tool === 'social-media' && result.content.posts && (
              <div className="space-y-3">
                {result.content.posts.map((post: string, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start">
                      <p className="text-sm flex-1 whitespace-pre-wrap">{post}</p>
                      <Button
                        onClick={() => handleCopy(post)}
                        variant="ghost"
                        size="sm"
                        className="ml-2 shrink-0"
                        aria-label={`Copy post ${index + 1}`}
                      >
                        Copy
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Email Template Results */}
            {resolvedParams.tool === 'email-template' && result.content.subject && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Subject Line:</p>
                  <div className="flex gap-2">
                    <p className="font-semibold flex-1">{result.content.subject}</p>
                    <Button
                      onClick={() => handleCopy(result.content.subject)}
                      variant="ghost"
                      size="sm"
                      aria-label="Copy subject line"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
                {result.content.preview && (
                  <div>
                    <p className="text-sm font-medium mb-1">Preview Text:</p>
                    <p className="text-sm text-muted-foreground">{result.content.preview}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium mb-1">Email Body:</p>
                  <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-sm">
                    {result.content.body}
                  </div>
                </div>
                {result.content.cta && (
                  <div>
                    <p className="text-sm font-medium mb-1">CTA:</p>
                    <Badge>{result.content.cta}</Badge>
                  </div>
                )}
              </div>
            )}

            {/* Menu Description Results */}
            {resolvedParams.tool === 'menu-description' && result.content.descriptions && (
              <div className="space-y-3">
                {result.content.descriptions.map((desc: string, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-semibold mb-1">{menuItems[index]?.name}</p>
                        <p className="text-sm">{desc}</p>
                      </div>
                      <Button
                        onClick={() => handleCopy(desc)}
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        aria-label={`Copy description for ${menuItems[index]?.name}`}
                      >
                        Copy
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Text-based results (Blog, Proposal) */}
            {typeof result.content === 'string' && (
              <div>
                <div className="flex justify-end mb-2">
                  <Button
                    onClick={() => handleCopy(result.content)}
                    variant="outline"
                    size="sm"
                    aria-label="Copy all content"
                  >
                    Copy All
                  </Button>
                </div>
                <div className="bg-gray-50 p-6 rounded whitespace-pre-wrap prose max-w-none">
                  {result.content}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
