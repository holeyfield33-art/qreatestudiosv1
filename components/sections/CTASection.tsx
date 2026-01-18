'use client';

import { Button } from '@/components/ui/button';
import { SmartImage } from '@/components/ui/SmartImage';
import { ArrowRight } from 'lucide-react';

export interface CTASectionProps {
  title?: string;
  description?: string;
  primaryCta?: {
    text: string;
    link: string;
  };
  secondaryCta?: {
    text: string;
    link: string;
  };
  backgroundImage?: {
    url: string;
    alt: string;
    blurhash?: string;
  } | string; // Support both object and string formats
  backgroundColor?: string;
  style?: 'default' | 'centered' | 'split';
}

export function CTASection({
  title = 'Ready to Experience Amazing Food?',
  description,
  primaryCta,
  secondaryCta,
  backgroundImage,
  backgroundColor = '#000000',
  style = 'centered',
}: CTASectionProps) {
  // Normalize backgroundImage to object format
  const bgImage = typeof backgroundImage === 'string' 
    ? { url: backgroundImage, alt: 'Background' }
    : backgroundImage;

  if (style === 'split') {
    return (
      <section className="relative w-full overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Image Side */}
          <div className="relative h-64 md:h-auto min-h-[400px]">
            {bgImage?.url ? (
              <SmartImage
                src={bgImage.url}
                alt={bgImage.alt}
                blurhash={bgImage.blurhash}
                category="restaurant"
                fill
                objectFit="cover"
                sizes="50vw"
              />
            ) : (
              <div
                className="w-full h-full"
                style={{ backgroundColor }}
              />
            )}
          </div>

          {/* Content Side */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-gray-50">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            {description && (
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                {description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              {primaryCta && (
                <Button asChild size="lg">
                  <a href={primaryCta.link}>
                    {primaryCta.text}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              )}
              {secondaryCta && (
                <Button asChild size="lg" variant="outline">
                  <a href={secondaryCta.link}>
                    {secondaryCta.text}
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden">
      {/* Background */}
      {bgImage?.url ? (
        <>
          <SmartImage
            src={bgImage.url}
            alt={bgImage.alt}
            blurhash={bgImage.blurhash}
            category="restaurant"
            fill
            objectFit="cover"
            sizes="100vw"
            className="absolute inset-0 z-0"
          />
          <div className="absolute inset-0 z-10 bg-black/60" />
        </>
      ) : (
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundColor }}
        />
      )}

      {/* Content */}
      <div className="relative z-20 px-4 py-20 md:py-28">
        <div className={`max-w-4xl mx-auto ${style === 'centered' ? 'text-center' : ''}`}>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {title}
          </h2>
          {description && (
            <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
              {description}
            </p>
          )}
          <div className={`flex flex-col sm:flex-row gap-4 ${style === 'centered' ? 'justify-center' : ''}`}>
            {primaryCta && (
              <Button asChild size="lg" className="bg-white text-black hover:bg-gray-100">
                <a href={primaryCta.link}>
                  {primaryCta.text}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            )}
            {secondaryCta && (
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <a href={secondaryCta.link}>
                  {secondaryCta.text}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

CTASection.defaultProps = {
  title: 'Ready to Experience Amazing Food?',
  description: 'Visit us today or order online for pickup and delivery',
  primaryCta: {
    text: 'Order Now',
    link: '#menu',
  },
  secondaryCta: {
    text: 'View Menu',
    link: '#menu',
  },
  backgroundColor: '#000000',
  style: 'centered',
};
