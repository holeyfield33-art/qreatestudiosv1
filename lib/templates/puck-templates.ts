/**
 * Puck.js Template Definitions
 * Professional landing page templates with full Puck JSON structure
 * Each template includes:
 * - Preview image/thumbnail
 * - Default Puck sections (content array)
 * - Color schemes and styling
 * - Placeholder images with proper slots
 */

export interface PuckTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  isPremium: boolean;
  thumbnail: string; // Preview image URL
  previewImage: string; // Full preview screenshot
  defaultSections: {
    content: Array<{
      type: string;
      props: Record<string, any>;
    }>;
    root: {
      props?: Record<string, any>;
    };
  };
  metadata: {
    colorScheme: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
    };
    fonts?: {
      heading: string;
      body: string;
    };
    imageSlots?: string[]; // IDs of images that can be replaced
  };
}

export const PUCK_TEMPLATES: PuckTemplate[] = [
  // ============================================
  // RESTAURANT TEMPLATES
  // ============================================
  {
    id: 'restaurant-hero-modern',
    name: 'Modern Restaurant Hero',
    category: 'Restaurant',
    description: 'Full-screen hero with stunning food photography and featured dishes',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    previewImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
    defaultSections: {
      content: [
        {
          type: 'HeroSection',
          props: {
            id: 'HeroSection-1',
            headline: 'Fine Dining Excellence',
            subheadline: 'Experience culinary artistry with fresh, locally-sourced ingredients',
            backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920',
            ctaText: 'View Our Menu',
            ctaLink: '#menu',
            ctaStyle: 'primary',
            overlay: true,
            overlayOpacity: 50,
            textAlign: 'center',
            minHeight: '70vh',
          },
        },
        {
          type: 'FeaturesSection',
          props: {
            id: 'FeaturesSection-1',
            title: 'What Makes Us Special',
            subtitle: 'Three pillars of our culinary philosophy',
            features: [
              {
                id: '1',
                icon: 'UtensilsCrossed',
                title: 'Fresh Ingredients',
                description: 'Locally sourced, farm-to-table freshness in every dish',
              },
              {
                id: '2',
                icon: 'ChefHat',
                title: 'Master Chefs',
                description: 'Award-winning culinary team with international experience',
              },
              {
                id: '3',
                icon: 'Sparkles',
                title: 'Unforgettable Experience',
                description: 'Elegant ambiance paired with exceptional service',
              },
            ],
            columns: 3,
            style: 'cards',
          },
        },
        {
          type: 'GallerySection',
          props: {
            id: 'GallerySection-1',
            title: 'Our Signature Dishes',
            subtitle: 'A taste of what awaits you',
            images: [
              {
                id: '1',
                url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
                alt: 'Gourmet appetizer',
                title: 'Seasonal Appetizer',
              },
              {
                id: '2',
                url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
                alt: 'Signature main course',
                title: 'Signature Entrée',
              },
              {
                id: '3',
                url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
                alt: 'Artisan dessert',
                title: 'Artisan Dessert',
              },
            ],
            columns: 3,
            style: 'grid',
          },
        },
        {
          type: 'CTASection',
          props: {
            id: 'CTASection-1',
            title: 'Reserve Your Table',
            subtitle: 'Book your unforgettable dining experience today',
            ctaText: 'Make a Reservation',
            ctaLink: '#contact',
            ctaStyle: 'primary',
            secondaryCtaText: 'View Menu',
            secondaryCtaLink: '#menu',
            backgroundStyle: 'gradient',
          },
        },
      ],
      root: {
        props: {},
      },
    },
    metadata: {
      colorScheme: {
        primary: '#1F2937',
        secondary: '#F59E0B',
        accent: '#EF4444',
        background: '#FFFFFF',
        text: '#111827',
      },
      fonts: {
        heading: 'Playfair Display, serif',
        body: 'Inter, sans-serif',
      },
      imageSlots: ['hero-background', 'gallery-1', 'gallery-2', 'gallery-3'],
    },
  },

  // ============================================
  // BUSINESS / SAAS TEMPLATES
  // ============================================
  {
    id: 'saas-product-launch',
    name: 'SaaS Product Launch',
    category: 'Business',
    description: 'Modern product showcase with features, pricing, and CTA',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
    defaultSections: {
      content: [
        {
          type: 'HeroSection',
          props: {
            id: 'HeroSection-2',
            headline: 'Revolutionize Your Workflow',
            subheadline: 'The all-in-one platform that helps teams collaborate, automate, and grow faster',
            backgroundImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920',
            ctaText: 'Start Free Trial',
            ctaLink: '#signup',
            ctaStyle: 'primary',
            overlay: true,
            overlayOpacity: 70,
            textAlign: 'center',
            minHeight: '80vh',
          },
        },
        {
          type: 'FeaturesSection',
          props: {
            id: 'FeaturesSection-2',
            title: 'Everything You Need',
            subtitle: 'Powerful features designed for modern teams',
            features: [
              {
                id: '1',
                icon: 'Zap',
                title: 'Lightning Fast',
                description: 'Built for speed with cutting-edge technology',
              },
              {
                id: '2',
                icon: 'Shield',
                title: 'Enterprise Security',
                description: 'Bank-level encryption and compliance',
              },
              {
                id: '3',
                icon: 'Users',
                title: 'Team Collaboration',
                description: 'Work together seamlessly in real-time',
              },
              {
                id: '4',
                icon: 'BarChart',
                title: 'Advanced Analytics',
                description: 'Gain insights with powerful reporting tools',
              },
            ],
            columns: 4,
            style: 'cards',
          },
        },
        {
          type: 'CTASection',
          props: {
            id: 'CTASection-2',
            title: 'Ready to Get Started?',
            subtitle: 'Join thousands of teams already using our platform',
            ctaText: 'Start Free Trial',
            ctaLink: '#signup',
            ctaStyle: 'primary',
            secondaryCtaText: 'Schedule Demo',
            secondaryCtaLink: '#demo',
            backgroundStyle: 'solid',
          },
        },
      ],
      root: {
        props: {},
      },
    },
    metadata: {
      colorScheme: {
        primary: '#2563EB',
        secondary: '#7C3AED',
        accent: '#EC4899',
        background: '#FFFFFF',
        text: '#1F2937',
      },
      fonts: {
        heading: 'Inter, sans-serif',
        body: 'Inter, sans-serif',
      },
      imageSlots: ['hero-background'],
    },
  },

  // ============================================
  // E-COMMERCE / RETAIL TEMPLATES
  // ============================================
  {
    id: 'retail-product-showcase',
    name: 'Product Showcase',
    category: 'Retail',
    description: 'Modern e-commerce product display with gallery and features',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
    previewImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',
    defaultSections: {
      content: [
        {
          type: 'HeroSection',
          props: {            id: 'HeroSection-3',            headline: 'Premium Collection 2026',
            subheadline: 'Discover our latest arrivals crafted with precision and passion',
            backgroundImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920',
            ctaText: 'Shop Now',
            ctaLink: '#products',
            ctaStyle: 'primary',
            overlay: true,
            overlayOpacity: 40,
            textAlign: 'center',
            minHeight: '75vh',
          },
        },
        {
          type: 'GallerySection',
          props: {            id: 'GallerySection-2',            title: 'Featured Products',
            subtitle: 'Handpicked selection from our newest collection',
            images: [
              {
                id: '1',
                url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                alt: 'Premium watch',
                title: 'Luxury Timepiece',
              },
              {
                id: '2',
                url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
                alt: 'Designer sunglasses',
                title: 'Designer Eyewear',
              },
              {
                id: '3',
                url: 'https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=800',
                alt: 'Leather bag',
                title: 'Artisan Leather',
              },
              {
                id: '4',
                url: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800',
                alt: 'Premium sneakers',
                title: 'Limited Edition',
              },
            ],
            columns: 4,
            style: 'grid',
          },
        },
        {
          type: 'FeaturesSection',
          props: {
            id: 'FeaturesSection-3',
            title: 'Why Shop With Us',
            subtitle: 'Premium experience from browsing to delivery',
            features: [
              {
                id: '1',
                icon: 'Truck',
                title: 'Free Shipping',
                description: 'On orders over $100 worldwide',
              },
              {
                id: '2',
                icon: 'RefreshCw',
                title: 'Easy Returns',
                description: '30-day hassle-free return policy',
              },
              {
                id: '3',
                icon: 'Award',
                title: 'Authentic Guarantee',
                description: '100% genuine products certified',
              },
            ],
            columns: 3,
            style: 'minimal',
          },
        },
        {
          type: 'CTASection',
          props: {
            id: 'CTASection-3',
            title: 'Start Shopping',
            subtitle: 'Explore our full collection and find your perfect match',
            ctaText: 'Browse Collection',
            ctaLink: '#shop',
            ctaStyle: 'primary',
            backgroundStyle: 'gradient',
          },
        },
      ],
      root: {
        props: {},
      },
    },
    metadata: {
      colorScheme: {
        primary: '#2563EB',
        secondary: '#7C3AED',
        accent: '#EC4899',
        background: '#FFFFFF',
        text: '#1F2937',
      },
      fonts: {
        heading: 'Montserrat, sans-serif',
        body: 'Open Sans, sans-serif',
      },
      imageSlots: ['hero-background', 'gallery-1', 'gallery-2', 'gallery-3', 'gallery-4'],
    },
  },

  // ============================================
  // REAL ESTATE TEMPLATE
  // ============================================
  {
    id: 'realestate-property',
    name: 'Property Listing',
    category: 'Real Estate',
    description: 'Professional property showcase with gallery and details',
    isPremium: true,
    thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop',
    previewImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200',
    defaultSections: {
      content: [
        {
          type: 'HeroSection',
          props: {
            id: 'HeroSection-4',
            headline: 'Your Dream Home Awaits',
            subheadline: 'Stunning 4-bedroom family home in prime location',
            backgroundImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920',
            ctaText: 'Schedule Viewing',
            ctaLink: '#contact',
            ctaStyle: 'primary',
            overlay: true,
            overlayOpacity: 40,
            textAlign: 'left',
            minHeight: '70vh',
          },
        },
        {
          type: 'FeaturesSection',
          props: {
            id: 'FeaturesSection-4',
            title: 'Property Highlights',
            subtitle: 'Everything you need for comfortable family living',
            features: [
              {
                id: '1',
                icon: 'Home',
                title: '2,500 sq ft',
                description: 'Spacious living area',
              },
              {
                id: '2',
                icon: 'Bed',
                title: '4 Bedrooms',
                description: 'Including master suite',
              },
              {
                id: '3',
                icon: 'Bath',
                title: '3 Bathrooms',
                description: 'Modern fixtures',
              },
              {
                id: '4',
                icon: 'Car',
                title: '2-Car Garage',
                description: 'Plus extra storage',
              },
            ],
            columns: 4,
            style: 'cards',
          },
        },
        {
          type: 'GallerySection',
          props: {            id: 'GallerySection-3',            title: 'Property Photos',
            subtitle: 'Take a virtual tour',
            images: [
              {
                id: '1',
                url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
                alt: 'Living room',
                title: 'Spacious Living Room',
              },
              {
                id: '2',
                url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
                alt: 'Modern kitchen',
                title: 'Gourmet Kitchen',
              },
              {
                id: '3',
                url: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
                alt: 'Master bedroom',
                title: 'Master Bedroom',
              },
            ],
            columns: 3,
            style: 'grid',
          },
        },
        {
          type: 'CTASection',
          props: {
            id: 'CTASection-4',
            title: 'Ready to Make This Home Yours?',
            subtitle: 'Contact us today to schedule a private showing',
            ctaText: 'Schedule Viewing',
            ctaLink: '#contact',
            ctaStyle: 'primary',
            secondaryCtaText: 'Request Info',
            secondaryCtaLink: '#info',
            backgroundStyle: 'solid',
          },
        },
      ],
      root: {
        props: {},
      },
    },
    metadata: {
      colorScheme: {
        primary: '#1E40AF',
        secondary: '#059669',
        accent: '#DC2626',
        background: '#FFFFFF',
        text: '#1E293B',
      },
      fonts: {
        heading: 'Poppins, sans-serif',
        body: 'Roboto, sans-serif',
      },
      imageSlots: ['hero-background', 'gallery-1', 'gallery-2', 'gallery-3'],
    },
  },

  // ============================================
  // EVENT TEMPLATE
  // ============================================
  {
    id: 'event-conference',
    name: 'Event & Conference',
    category: 'Events',
    description: 'Professional event page with registration and details',
    isPremium: true,
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    previewImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
    defaultSections: {
      content: [
        {
          type: 'HeroSection',
          props: {            id: 'HeroSection-5',            headline: 'Tech Summit 2026',
            subheadline: 'Join industry leaders for three days of innovation, networking, and inspiration',
            backgroundImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920',
            ctaText: 'Register Now',
            ctaLink: '#register',
            ctaStyle: 'primary',
            overlay: true,
            overlayOpacity: 60,
            textAlign: 'center',
            minHeight: '75vh',
          },
        },
        {
          type: 'FeaturesSection',
          props: {
            id: 'FeaturesSection-5',
            title: 'Event Highlights',
            subtitle: 'What to expect at Tech Summit 2026',
            features: [
              {
                id: '1',
                icon: 'Users',
                title: '50+ Speakers',
                description: 'Industry experts and thought leaders',
              },
              {
                id: '2',
                icon: 'Calendar',
                title: '3 Days',
                description: 'Packed with sessions and workshops',
              },
              {
                id: '3',
                icon: 'Globe',
                title: 'Global Audience',
                description: 'Connect with attendees worldwide',
              },
            ],
            columns: 3,
            style: 'cards',
          },
        },
        {
          type: 'CTASection',
          props: {
            id: 'CTASection-5',
            title: 'Secure Your Spot',
            subtitle: 'Limited seats available. Early bird pricing ends soon!',
            ctaText: 'Register Now',
            ctaLink: '#register',
            ctaStyle: 'primary',
            secondaryCtaText: 'Learn More',
            secondaryCtaLink: '#about',
            backgroundStyle: 'gradient',
          },
        },
      ],
      root: {
        props: {},
      },
    },
    metadata: {
      colorScheme: {
        primary: '#7C3AED',
        secondary: '#EC4899',
        accent: '#F59E0B',
        background: '#FFFFFF',
        text: '#1F2937',
      },
      fonts: {
        heading: 'Work Sans, sans-serif',
        body: 'Source Sans Pro, sans-serif',
      },
      imageSlots: ['hero-background'],
    },
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): PuckTemplate | undefined {
  return PUCK_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): PuckTemplate[] {
  return PUCK_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Get all template categories
 */
export function getTemplateCategories(): string[] {
  return Array.from(new Set(PUCK_TEMPLATES.map((t) => t.category)));
}
