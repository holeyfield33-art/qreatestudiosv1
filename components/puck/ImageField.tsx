'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageBrowser } from '@/components/ImageBrowser';
import { Image as ImageIcon, X } from 'lucide-react';

interface ImageFieldProps {
  value?: {
    url: string;
    alt?: string;
    blurhash?: string;
  };
  onChange: (value: { url: string; alt?: string; blurhash?: string }) => void;
  category?: string;
}

export function ImageField({ value, onChange, category = 'restaurant' }: ImageFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleImageSelect = (imageUrl: string) => {
    onChange({
      url: imageUrl,
      alt: value?.alt || 'Image',
      blurhash: value?.blurhash,
    });
    setIsOpen(false);
  };

  const handleRemove = () => {
    onChange({
      url: '',
      alt: '',
      blurhash: '',
    });
  };

  return (
    <div className="space-y-2">
      {value?.url ? (
        <div className="relative group">
          <img
            src={value.url}
            alt={value.alt || 'Selected image'}
            className="w-full h-48 object-cover rounded-lg border"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Change Image
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Select Image</DialogTitle>
                </DialogHeader>
                <ImageBrowser
                  category={category}
                  onSelect={handleImageSelect}
                  currentImage={value.url}
                />
              </DialogContent>
            </Dialog>
            <Button size="sm" variant="destructive" onClick={handleRemove}>
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-48 border-dashed">
              <ImageIcon className="w-8 h-8 mr-2" />
              Select Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Select Image</DialogTitle>
            </DialogHeader>
            <ImageBrowser
              category={category}
              onSelect={handleImageSelect}
              currentImage={value?.url}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {value?.url && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-700">Alt Text</label>
          <input
            type="text"
            value={value.alt || ''}
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
            placeholder="Describe this image..."
            className="w-full px-3 py-2 text-sm border rounded-md"
          />
        </div>
      )}
    </div>
  );
}
