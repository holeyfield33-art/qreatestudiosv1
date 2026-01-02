'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QR_TEMPLATES, TEMPLATE_CATEGORIES, type QRTemplate } from '@/lib/templates/qr-templates';
import dynamic from 'next/dynamic';
import { ArrowLeft } from 'lucide-react';

// Dynamically import QRPreview for better performance
const QRPreview = dynamic(() => import('@/components/qr-preview'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 animate-pulse">
      <span className="text-4xl">⏳</span>
    </div>
  ),
});

export default function TemplatesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const filteredTemplates = QR_TEMPLATES.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPremium = !showPremiumOnly || template.isPremium;

    return matchesCategory && matchesSearch && matchesPremium;
  });

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleTemplateSelect = (template: QRTemplate) => {
    router.push(`/dashboard/qr-codes/create?template=${template.id}`);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard')}
          className="min-h-[44px] min-w-[44px]"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">QR Code Templates</h1>
          <p className="text-muted-foreground mt-1">
            Choose from {QR_TEMPLATES.length}+ professional templates
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="flex-1 min-w-[300px] max-w-md">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search templates by name or category"
            className="w-full"
          />
        </div>

        <Button
          variant={showPremiumOnly ? 'default' : 'outline'}
          onClick={() => setShowPremiumOnly(!showPremiumOnly)}
          size="sm"
          aria-pressed={showPremiumOnly}
          aria-label="Filter premium templates only"
        >
          ⭐ Premium Only
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            setSelectedCategory('all');
            setSearchQuery('');
            setShowPremiumOnly(false);
          }}
          size="sm"
          aria-label="Clear all filters"
        >
          Clear Filters
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap" role="tablist" aria-label="Template categories">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat.id)}
            size="sm"
            role="tab"
            aria-selected={selectedCategory === cat.id}
            aria-controls={`templates-panel-${cat.id}`}
            tabIndex={selectedCategory === cat.id ? 0 : -1}
          >
            {cat.icon} {cat.name}
            {cat.id !== 'all' && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {cat.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Template Grid */}
      <div 
        className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        role="tabpanel"
        id={`templates-panel-${selectedCategory}`}
        aria-labelledby={`tab-${selectedCategory}`}
      >
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="group relative p-4 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] focus-within:ring-2 focus-within:ring-blue-500 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950"
            tabIndex={0}
            role="button"
            aria-label={`Use ${template.name} template. ${template.description}. ${template.isPremium ? 'Premium template' : 'Free template'}`}
            onClick={() => handleTemplateSelect(template)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTemplateSelect(template);
              }
            }}
          >
            {/* Favorite Button */}
            <button
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(template.id);
              }}
              aria-label={favorites.includes(template.id) ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={favorites.includes(template.id)}
            >
              {favorites.includes(template.id) ? '❤️' : '🤍'}
            </button>

            {/* Template Preview with Hover Effect */}
            <div 
              className="aspect-square rounded-lg mb-3 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 group-hover:shadow-inner transition-all duration-300"
              style={{
                backgroundColor: template.style.backgroundColor,
              }}
            >
              {/* Actual QR Code Preview */}
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-4xl animate-pulse">📱</span>
                </div>
              }>
                <QRPreview 
                  template={template} 
                  size={200}
                  value={`https://qreatestudios.com/template/${template.id}`}
                />
              </Suspense>

              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/10 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
            </div>

            {/* Template Info */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm line-clamp-1">{template.name}</h3>
              {template.isPremium && (
                <Badge variant="secondary" className="text-xs shrink-0 ml-2">
                  ⭐ Pro
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {template.description}
            </p>

            <div className="flex gap-2 flex-wrap">
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {template.category}
              </span>
              <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                {template.style.dotStyle}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12" role="status">
          <p className="text-muted-foreground text-lg">No templates found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Results Count */}
      <div className="text-center py-6 text-sm text-muted-foreground" role="status" aria-live="polite">
        Showing {filteredTemplates.length} of {QR_TEMPLATES.length} templates
        {selectedCategory !== 'all' && ` in ${selectedCategory}`}
        {showPremiumOnly && ' (Premium only)'}
      </div>

      {/* Quick Stats */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Template Library Stats</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold">{QR_TEMPLATES.length}</p>
            <p className="text-xs text-muted-foreground">Total Templates</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{QR_TEMPLATES.filter(t => t.isPremium).length}</p>
            <p className="text-xs text-muted-foreground">Premium Templates</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{QR_TEMPLATES.filter(t => !t.isPremium).length}</p>
            <p className="text-xs text-muted-foreground">Free Templates</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{TEMPLATE_CATEGORIES.length - 1}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </div>
        </div>
      </Card>

      {/* Help Text */}
      <div className="text-center text-sm text-muted-foreground">
        <p>💡 Tip: Click any template to start creating your QR code with pre-configured styles</p>
      </div>
    </div>
  );
}
