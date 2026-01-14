'use client';

import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

export interface Feature {
  id: string;
  icon: string; // Lucide icon name
  title: string;
  description: string;
}

export interface FeaturesSectionProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
  columns?: 2 | 3 | 4;
  style?: 'cards' | 'minimal' | 'bordered';
}

export function FeaturesSection({
  title,
  subtitle,
  features = [],
  columns = 3,
  style = 'cards',
}: FeaturesSectionProps) {
  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  const cardStyleClass = {
    cards: 'bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow',
    minimal: 'p-6',
    bordered: 'p-6 border-2 border-gray-200 rounded-xl hover:border-primary transition-colors',
  }[style];

  return (
    <section className="py-16 px-4 bg-gray-50">
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

        {/* Features Grid */}
        <div className={`grid grid-cols-1 ${gridColsClass} gap-6`}>
          {features.map((feature) => {
            // Dynamically get the icon component
            const IconComponent = (Icons as any)[feature.icon] as LucideIcon;
            
            return (
              <div key={feature.id} className={cardStyleClass}>
                <div className="flex flex-col items-center text-center space-y-4">
                  {IconComponent && (
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
                      <IconComponent className="w-8 h-8" />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

FeaturesSection.defaultProps = {
  title: 'Why Choose Us',
  subtitle: 'Discover what makes us special',
  features: [
    {
      id: '1',
      icon: 'Utensils',
      title: 'Fresh Ingredients',
      description: 'We source the finest ingredients daily from local farmers',
    },
    {
      id: '2',
      icon: 'ChefHat',
      title: 'Expert Chefs',
      description: 'Our culinary team has decades of combined experience',
    },
    {
      id: '3',
      icon: 'Heart',
      title: 'Made with Love',
      description: 'Every dish is prepared with passion and attention to detail',
    },
  ],
  columns: 3,
  style: 'cards',
};
