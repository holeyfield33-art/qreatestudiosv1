'use client';

import { SmartImage } from '@/components/ui/SmartImage';
import { useState } from 'react';
import { X } from 'lucide-react';

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  blurhash?: string;
  caption?: string;
}

export interface GallerySectionProps {
  title?: string;
  subtitle?: string;
  images?: GalleryImage[];
  columns?: 2 | 3 | 4;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  lightbox?: boolean;
}

export function GallerySection({
  title,
  subtitle,
  images = [],
  columns = 3,
  aspectRatio = 'square',
  lightbox = true,
}: GallerySectionProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  console.log('🎨 GallerySection rendering:', {
    title,
    subtitle,
    imagesCount: images.length,
    images: images.map(img => ({ id: img.id, url: img.url, alt: img.alt })),
    columns,
  });

  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  const aspectClass = {
    square: 'aspect-square',
    landscape: 'aspect-video',
    portrait: 'aspect-[3/4]',
  }[aspectRatio];

  return (
    <>
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center mb-12 max-w-3xl mx-auto">
              {title && (
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-lg text-gray-600">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Gallery Grid */}
          <div className={`grid grid-cols-1 ${gridColsClass} gap-4`}>
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative ${aspectClass} overflow-hidden rounded-lg group cursor-pointer`}
                onClick={() => lightbox && setSelectedImage(image)}
              >
                <SmartImage
                  src={image.url}
                  alt={image.alt}
                  blurhash={image.blurhash}
                  category="food"
                  fill
                  objectFit="cover"
                  sizes={`(max-width: 768px) 100vw, (max-width: 1024px) ${100 / columns}vw, ${100 / columns}vw`}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-medium">
                      {image.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightbox && selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-6xl max-h-[90vh] w-full h-full">
            <SmartImage
              src={selectedImage.url}
              alt={selectedImage.alt}
              blurhash={selectedImage.blurhash}
              category="food"
              fill
              objectFit="contain"
              sizes="90vw"
            />
          </div>
          {selectedImage.caption && (
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white text-lg">
                {selectedImage.caption}
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

GallerySection.defaultProps = {
  title: 'Our Gallery',
  subtitle: 'A glimpse into our culinary creations',
  images: [],
  columns: 3,
  aspectRatio: 'square',
  lightbox: true,
};
