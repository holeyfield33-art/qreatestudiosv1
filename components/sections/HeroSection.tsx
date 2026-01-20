'use client';

import { SmartImage } from '@/components/ui/SmartImage';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  backgroundImage?: {
    url: string;
    alt: string;
    blurhash?: string;
  } | string; // Support both object and string formats
  ctaText?: string;
  ctaLink?: string;
  ctaStyle?: 'primary' | 'secondary' | 'outline';
  overlay?: boolean;
  overlayOpacity?: number;
  textAlign?: 'left' | 'center' | 'right';
  minHeight?: string;
}

export function HeroSection({
  headline = 'Welcome to Our Restaurant',
  subheadline,
  backgroundImage,
  ctaText,
  ctaLink,
  ctaStyle = 'primary',
  overlay = true,
  overlayOpacity = 50,
  textAlign = 'center',
  minHeight = '70vh',
}: HeroSectionProps) {
  const textAlignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[textAlign];

  const buttonVariantMap = {
    primary: 'default',
    secondary: 'secondary',
    outline: 'outline',
  } as const;

  // Normalize backgroundImage to object format
  const bgImage = typeof backgroundImage === 'string' 
    ? { url: backgroundImage, alt: 'Background' }
    : backgroundImage;
    
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight }}>
      {/* Background Image */}
      {bgImage?.url ? (
        <>
          <div className="absolute inset-0 z-0">
            <SmartImage
              src={bgImage.url}
              alt={bgImage.alt}
              blurhash={bgImage.blurhash}
              category="restaurant"
              fill
              objectFit="cover"
              priority
              sizes="100vw"
            />
          </div>
          {overlay && (
            <div
              className="absolute inset-0 z-10 bg-black"
              style={{ opacity: overlayOpacity / 100 }}
            />
          )}
        </>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 to-primary/5" />
      )}

      {/* Content */}
      <div className={`relative z-20 flex flex-col justify-center ${textAlignClass} px-4 py-20 mx-auto max-w-7xl h-full min-h-[inherit]`}>
        <div className="max-w-4xl space-y-6">
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight ${
              bgImage?.url ? 'text-white' : 'text-gray-900'
            }`}
          >
            {headline}
          </h1>

          {subheadline && (
            <p
              className={`text-lg md:text-xl lg:text-2xl max-w-2xl ${
                bgImage?.url ? 'text-gray-100' : 'text-gray-600'
              } ${textAlign === 'center' ? 'mx-auto' : ''}`}
            >
              {subheadline}
            </p>
          )}

          {ctaText && ctaLink && (
            <div className={`flex gap-4 pt-4 ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
              <Button
                asChild
                size="lg"
                variant={buttonVariantMap[ctaStyle]}
                className="text-lg px-8 py-6"
              >
                <a href={ctaLink} className="inline-flex items-center gap-2">
                  {ctaText}
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Default props for Puck
HeroSection.defaultProps = {
  headline: 'Welcome to Our Restaurant',
  subheadline: 'Fresh ingredients, unforgettable flavors',
  ctaText: 'View Our Menu',
  ctaLink: '/pricing',
  ctaStyle: 'primary',
  overlay: true,
  overlayOpacity: 50,
  textAlign: 'center',
  minHeight: '70vh',
};
