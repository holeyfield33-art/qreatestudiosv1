'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { STOCK_IMAGE_LIBRARY } from '@/lib/services/image-service';
import { Search, Upload as UploadIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImageBrowserProps {
  category: string;
  onSelect: (imageUrl: string) => void;
  currentImage?: string;
}

interface StockImage {
  url: string;
  alt: string;
  photographer: string;
}

interface SearchResult {
  url: string;
  id: string;
  alt: string;
  photographer: string;
}

export function ImageBrowser({ category, onSelect, currentImage }: ImageBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Get stock images for the category
  const stockImages: StockImage[] = STOCK_IMAGE_LIBRARY[category as keyof typeof STOCK_IMAGE_LIBRARY] || [];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/images/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          count: 12,
          orientation: 'landscape',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to search images');
      }

      const data = await response.json();
      setSearchResults(data.images || []);
    } catch (error) {
      console.error('Error searching images:', error);
      toast.error('Failed to search images. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Upload to Vercel Blob via API
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedImage(data.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Upload to Vercel Blob via API
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedImage(data.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  return (
    <div className="w-full h-full">
      <Tabs defaultValue="stock" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stock">Stock Library</TabsTrigger>
          <TabsTrigger value="search">Search Unsplash</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="flex-1 overflow-y-auto mt-4">
          {stockImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {stockImages.map((image, index) => (
                <div
                  key={index}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    currentImage === image.url
                      ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => onSelect(image.url)}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs truncate">{image.alt}</p>
                    <p className="text-white/70 text-xs">By {image.photographer}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">No stock images available for this category</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="search" className="flex-1 flex flex-col mt-4">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search for images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {searchResults.map((image) => (
                  <div
                    key={image.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                      currentImage === image.url
                        ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => onSelect(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="text-white text-xs truncate">{image.alt}</p>
                      <p className="text-white/70 text-xs">By {image.photographer}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">
                  {searchQuery ? 'No results found. Try a different search.' : 'Enter a search query to find images'}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="flex-1 mt-4">
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <UploadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop your image here
              </p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <p className="text-xs text-gray-400">
                Supports: JPG, PNG, GIF (Max 5MB)
              </p>
            </label>
          </div>

          {uploadedImage && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Image:</h3>
              <div
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 max-w-md ${
                  currentImage === uploadedImage
                    ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => onSelect(uploadedImage)}
              >
                <img
                  src={uploadedImage}
                  alt="Uploaded"
                  className="w-full h-60 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs">Click to select this image</p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
