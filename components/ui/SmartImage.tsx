'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Blurhash } from 'react-blurhash';

export type ImageCategory = 'food' | 'restaurant' | 'person' | 'default';

interface SmartImageProps {
  src?: string | null;
  alt: string;
  category?: ImageCategory;
  blurhash?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  sizes?: string;
}

/**
 * Maps objectFit prop to Tailwind CSS classes
 * This mapping is required because Tailwind JIT doesn't support dynamic class names
 */
const OBJECT_FIT_CLASSES: Record<string, string> = {
  contain: 'object-contain',
  cover: 'object-cover',
  fill: 'object-fill',
  none: 'object-none',
  'scale-down': 'object-scale-down',
};

/**
 * Category-specific placeholder SVGs
 */
const CATEGORY_PLACEHOLDERS: Record<ImageCategory, string> = {
  food: '/placeholders/food-dish.svg',
  restaurant: '/placeholders/restaurant-interior.svg',
  person: '/placeholders/avatar.svg',
  default: '/placeholders/image-placeholder.svg',
};

/**
 * SmartImage component with three-tier fallback system:
 * 1. User image (with loading state)
 * 2. Blurhash placeholder (during load)
 * 3. Category-specific SVG (on error or no source)
 */
export function SmartImage({
  src,
  alt,
  category = 'default',
  blurhash,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  objectFit = 'cover',
  sizes,
}: SmartImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // No source or error: show category placeholder
  if (!src || hasError) {
    return (
      <div
        className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <Image
          src={CATEGORY_PLACEHOLDERS[category]}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          className={OBJECT_FIT_CLASSES[objectFit]}
          sizes={sizes}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${fill ? 'w-full h-full' : ''} ${className}`}
      style={fill ? undefined : { width, height }}
    >
      {/* Blurhash shows while loading */}
      {isLoading && blurhash && (
        <div className="absolute inset-0 z-10">
          <Blurhash
            hash={blurhash}
            width="100%"
            height="100%"
            resolutionX={32}
            resolutionY={32}
            punch={1}
          />
        </div>
      )}

      {/* Actual image */}
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`${OBJECT_FIT_CLASSES[objectFit]} transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        priority={priority}
        sizes={sizes}
        unoptimized
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}

/**
 * Simpler version without blurhash - just image with fallback
 */
export function SimpleImage({
  src,
  alt,
  category = 'default',
  className = '',
  fill = false,
  width,
  height,
  objectFit = 'cover',
}: SmartImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <Image
        src={CATEGORY_PLACEHOLDERS[category]}
        alt={alt}
        fill={fill}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={`${className} ${OBJECT_FIT_CLASSES[objectFit]}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={`${className} ${OBJECT_FIT_CLASSES[objectFit]}`}
      unoptimized
      onError={() => setHasError(true)}
    />
  );
}
