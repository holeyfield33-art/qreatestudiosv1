'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageBrowser } from '@/components/ImageBrowser';
import { Image as ImageIcon, X, Plus } from 'lucide-react';

interface ImageArrayFieldProps {
  value?: Array<{
    id: string;
    url: string;
    alt?: string;
    blurhash?: string;
    caption?: string;
  }>;
  onChange: (value: Array<{
    id: string;
    url: string;
    alt?: string;
    blurhash?: string;
    caption?: string;
  }>) => void;
  category?: string;
}

export function ImageArrayField({ value = [], onChange, category = 'restaurant' }: ImageArrayFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleImageSelect = (imageUrl: string) => {
    if (editingIndex !== null) {
      // Update existing image
      const newValue = [...value];
      newValue[editingIndex] = {
        ...newValue[editingIndex],
        url: imageUrl,
      };
      onChange(newValue);
    } else {
      // Add new image
      onChange([
        ...value,
        {
          id: `img-${Date.now()}`,
          url: imageUrl,
          alt: 'Gallery image',
          caption: '',
        },
      ]);
    }
    setIsOpen(false);
    setEditingIndex(null);
  };

  const handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleUpdate = (index: number, field: string, fieldValue: string) => {
    const newValue = [...value];
    newValue[index] = {
      ...newValue[index],
      [field]: fieldValue,
    };
    onChange(newValue);
  };

  const handleAddClick = () => {
    setEditingIndex(null);
    setIsOpen(true);
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {value.map((image, index) => (
          <div key={image.id} className="space-y-2">
            <div className="relative group">
              <img
                src={image.url}
                alt={image.alt || `Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleEditClick(index)}
                >
                  <ImageIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemove(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <input
              type="text"
              value={image.alt || ''}
              onChange={(e) => handleUpdate(index, 'alt', e.target.value)}
              placeholder="Alt text"
              className="w-full px-2 py-1 text-xs border rounded"
            />
            <input
              type="text"
              value={image.caption || ''}
              onChange={(e) => handleUpdate(index, 'caption', e.target.value)}
              placeholder="Caption"
              className="w-full px-2 py-1 text-xs border rounded"
            />
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full border-dashed"
        onClick={handleAddClick}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Image
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? 'Change Image' : 'Select Image'}
            </DialogTitle>
          </DialogHeader>
          <ImageBrowser
            category={category}
            onSelect={handleImageSelect}
            currentImage={editingIndex !== null ? value[editingIndex]?.url : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
