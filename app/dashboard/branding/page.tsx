'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Palette,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Download,
  Heart,
} from 'lucide-react';
import { AI_FEATURES } from '@/lib/ai/ai-service';
import { AIFeatureButton } from '@/components/ai/AIFeatureButton';

export default function BrandingPage() {
  const [namesInput, setNamesInput] = useState({ industry: '', description: '' });
  const [namesResults, setNamesResults] = useState<any[]>([]);
  const [namesLoading, setNamesLoading] = useState(false);

  const [logoInput, setLogoInput] = useState({ businessName: '', industry: '', style: '' });
  const [logoResults, setLogoResults] = useState<any[]>([]);

  const [colorInput, setColorInput] = useState({ industry: '', mood: '' });
  const [colorResults, setColorResults] = useState<any>(null);

  const [taglinesInput, setTaglinesInput] = useState({ businessName: '', description: '' });
  const [taglinesResults, setTaglinesResults] = useState<string[]>([]);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleFavorite = (index: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(index)) {
      newFavorites.delete(index);
    } else {
      newFavorites.add(index);
    }
    setFavorites(newFavorites);
  };

  async function generateNames() {
    if (!namesInput.industry || !namesInput.description) {
      toast.error('Please fill in all fields');
      return;
    }

    setNamesLoading(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: AI_FEATURES.generateBusinessNames,
          prompt: `Generate 20 creative business name ideas for a ${namesInput.industry} business. Description: ${namesInput.description}`,
          context: {
            industry: namesInput.industry,
            description: namesInput.description,
            count: 20,
          },
        }),
      });

      const data = await res.json();
      if (res.ok) {
        const parsed = JSON.parse(data.data);
        setNamesResults(parsed);
        toast.success('Names generated!');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate names');
    } finally {
      setNamesLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
            <Palette className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Branding Studio</h1>
          <Badge variant="secondary">AI Powered</Badge>
        </div>
        <p className="text-muted-foreground">
          Build your brand identity with AI-powered tools
        </p>
      </div>

      <Tabs defaultValue="names" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="names">Business Names</TabsTrigger>
          <TabsTrigger value="logos">Logo Concepts</TabsTrigger>
          <TabsTrigger value="colors">Color Palettes</TabsTrigger>
          <TabsTrigger value="taglines">Taglines</TabsTrigger>
        </TabsList>

        {/* Business Names Tab */}
        <TabsContent value="names" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generate Business Names</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g., Tech, Restaurant, Consulting"
                  value={namesInput.industry}
                  onChange={(e) => setNamesInput({ ...namesInput, industry: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your business does, your target audience, and your unique value proposition..."
                  rows={3}
                  value={namesInput.description}
                  onChange={(e) => setNamesInput({ ...namesInput, description: e.target.value })}
                />
              </div>
              <Button
                onClick={generateNames}
                disabled={namesLoading}
                className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {namesLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate 20 Name Ideas
                  </>
                )}
              </Button>
            </div>
          </Card>

          {namesResults.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Generated Names</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {namesResults.map((name, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="font-semibold text-lg mb-1">
                          {name.name || name}
                        </div>
                        {name.explanation && (
                          <p className="text-sm text-muted-foreground">
                            {name.explanation}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFavorite(index)}
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              favorites.has(index)
                                ? 'fill-red-500 text-red-500'
                                : ''
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(name.name || name, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Logo Concepts Tab */}
        <TabsContent value="logos" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generate Logo Concepts</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo-business">Business Name</Label>
                <Input
                  id="logo-business"
                  placeholder="Your business name"
                  value={logoInput.businessName}
                  onChange={(e) => setLogoInput({ ...logoInput, businessName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="logo-industry">Industry</Label>
                <Input
                  id="logo-industry"
                  placeholder="e.g., Tech, Restaurant, Consulting"
                  value={logoInput.industry}
                  onChange={(e) => setLogoInput({ ...logoInput, industry: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="logo-style">Style Preferences (optional)</Label>
                <Input
                  id="logo-style"
                  placeholder="e.g., Modern, Classic, Minimalist, Bold"
                  value={logoInput.style}
                  onChange={(e) => setLogoInput({ ...logoInput, style: e.target.value })}
                />
              </div>
              <AIFeatureButton
                feature={AI_FEATURES.generateLogoConcepts}
                prompt={`Generate 5 logo concept descriptions for ${logoInput.businessName}, a ${logoInput.industry} business. Style: ${logoInput.style || 'versatile'}`}
                context={logoInput}
                onComplete={(result) => {
                  setLogoResults(result);
                }}
                label="Generate Logo Concepts"
                className="w-full"
                disabled={!logoInput.businessName || !logoInput.industry}
              />
            </div>
          </Card>

          {logoResults.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              {logoResults.map((concept: any, index: number) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="secondary">Concept {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(JSON.stringify(concept, null, 2), index + 100)}
                    >
                      {copiedIndex === index + 100 ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Style:</span>{' '}
                      <span className="text-muted-foreground">{concept.style}</span>
                    </div>
                    <div>
                      <span className="font-medium">Imagery:</span>{' '}
                      <span className="text-muted-foreground">{concept.imagery}</span>
                    </div>
                    <div>
                      <span className="font-medium">Colors:</span>{' '}
                      <span className="text-muted-foreground">{concept.colors}</span>
                    </div>
                    <div>
                      <span className="font-medium">Mood:</span>{' '}
                      <span className="text-muted-foreground">{concept.mood}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Color Palettes Tab */}
        <TabsContent value="colors" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generate Color Palette</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="color-industry">Industry</Label>
                <Input
                  id="color-industry"
                  placeholder="e.g., Tech, Restaurant, Healthcare"
                  value={colorInput.industry}
                  onChange={(e) => setColorInput({ ...colorInput, industry: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="color-mood">Desired Mood</Label>
                <Input
                  id="color-mood"
                  placeholder="e.g., Professional, Energetic, Calm, Bold"
                  value={colorInput.mood}
                  onChange={(e) => setColorInput({ ...colorInput, mood: e.target.value })}
                />
              </div>
              <AIFeatureButton
                feature={AI_FEATURES.generateColorPalette}
                prompt={`Generate a professional 5-color brand palette for a ${colorInput.industry} business with a ${colorInput.mood} mood`}
                context={colorInput}
                onComplete={(result) => {
                  setColorResults(result);
                }}
                label="Generate Color Palette"
                className="w-full"
                disabled={!colorInput.industry || !colorInput.mood}
              />
            </div>
          </Card>

          {colorResults && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Your Color Palette</h3>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-4 mb-6">
                {[colorResults.primary, colorResults.secondary, colorResults.accent, colorResults.background, colorResults.text].map((color, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className="w-full h-24 rounded-lg border shadow-sm cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => handleCopy(color, index + 200)}
                    />
                    <div className="text-center">
                      <div className="text-xs font-mono">{color}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {['Primary', 'Secondary', 'Accent', 'Background', 'Text'][index]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Primary:</span> {colorResults.primaryUse}
                </div>
                <div>
                  <span className="font-medium">Secondary:</span> {colorResults.secondaryUse}
                </div>
                <div>
                  <span className="font-medium">Accent:</span> {colorResults.accentUse}
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Taglines Tab */}
        <TabsContent value="taglines" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Generate Taglines</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tagline-business">Business Name</Label>
                <Input
                  id="tagline-business"
                  placeholder="Your business name"
                  value={taglinesInput.businessName}
                  onChange={(e) => setTaglinesInput({ ...taglinesInput, businessName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="tagline-description">What You Do</Label>
                <Textarea
                  id="tagline-description"
                  placeholder="Briefly describe your business and what makes you unique..."
                  rows={3}
                  value={taglinesInput.description}
                  onChange={(e) => setTaglinesInput({ ...taglinesInput, description: e.target.value })}
                />
              </div>
              <AIFeatureButton
                feature={AI_FEATURES.generateTaglines}
                prompt={`Generate 15 memorable taglines for ${taglinesInput.businessName}. ${taglinesInput.description}`}
                context={{ ...taglinesInput, count: 15 }}
                onComplete={(result) => {
                  setTaglinesResults(result);
                }}
                label="Generate 15 Taglines"
                className="w-full"
                disabled={!taglinesInput.businessName || !taglinesInput.description}
              />
            </div>
          </Card>

          {taglinesResults.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Generated Taglines</h3>
              <div className="space-y-2">
                {taglinesResults.map((tagline: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:border-orange-300 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium">
                      {typeof tagline === 'string' ? tagline : tagline.tagline}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(index + 300)}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favorites.has(index + 300)
                              ? 'fill-red-500 text-red-500'
                              : ''
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(typeof tagline === 'string' ? tagline : tagline.tagline, index + 300)}
                      >
                        {copiedIndex === index + 300 ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
