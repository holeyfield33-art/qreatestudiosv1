export interface LandingPageTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  sections: Array<{
    type: string;
    config: any;
  }>;
}

export const LANDING_PAGE_TEMPLATES: LandingPageTemplate[] = [
  {
    id: 'modern-saas',
    name: 'Modern SaaS',
    description: 'Clean, professional design for software products',
    category: 'Business',
    thumbnail: '/templates/modern-saas.png',
    sections: [
      {
        type: 'hero',
        config: {
          layout: 'center',
          headline: 'Transform Your Business with [Product]',
          subheadline: 'The all-in-one solution that helps you work smarter, not harder',
          ctaText: 'Start Free Trial',
          ctaUrl: '#signup',
          backgroundImage: null,
          backgroundColor: '#0F172A',
          textColor: '#FFFFFF',
        },
      },
      {
        type: 'features',
        config: {
          headline: 'Everything You Need',
          features: [
            { icon: '⚡', title: 'Lightning Fast', description: 'Blazing performance' },
            { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security' },
            { icon: '📊', title: 'Analytics', description: 'Real-time insights' },
          ],
        },
      },
      {
        type: 'cta',
        config: {
          headline: 'Ready to Get Started?',
          buttonText: 'Start Free Trial',
          buttonUrl: '#signup',
        },
      },
    ],
  },
  {
    id: 'restaurant-menu',
    name: 'Restaurant Menu',
    description: 'Showcase your menu and take orders',
    category: 'Food & Beverage',
    thumbnail: '/templates/restaurant.png',
    sections: [
      {
        type: 'hero',
        config: {
          layout: 'split',
          headline: 'Authentic Italian Cuisine',
          subheadline: 'Fresh ingredients, traditional recipes, unforgettable flavors',
          ctaText: 'View Menu',
          ctaUrl: '#menu',
          backgroundImage: null,
          backgroundColor: '#7C2D12',
          textColor: '#FFFFFF',
        },
      },
      {
        type: 'menu-display',
        config: {
          headline: 'Our Menu',
          menuId: null, // User selects their menu
        },
      },
      {
        type: 'contact',
        config: {
          headline: 'Visit Us',
          showMap: true,
          showHours: true,
        },
      },
    ],
  },
  {
    id: 'event-registration',
    name: 'Event Registration',
    description: 'Promote events and collect RSVPs',
    category: 'Events',
    thumbnail: '/templates/event.png',
    sections: [
      {
        type: 'hero',
        config: {
          layout: 'center',
          headline: 'Annual Tech Conference 2025',
          subheadline: 'Join industry leaders for 3 days of innovation',
          ctaText: 'Register Now',
          ctaUrl: '#register',
          backgroundColor: '#1E40AF',
          textColor: '#FFFFFF',
        },
      },
      {
        type: 'event-details',
        config: {
          date: '2025-03-15',
          time: '9:00 AM - 5:00 PM',
          location: 'Convention Center, Phoenix AZ',
          agenda: [],
        },
      },
      {
        type: 'registration-form',
        config: {
          fields: ['name', 'email', 'company', 'title'],
        },
      },
    ],
  },
  {
    id: 'product-launch',
    name: 'Product Launch',
    description: 'Announce and showcase new products',
    category: 'Marketing',
    thumbnail: '/templates/product.png',
    sections: [
      {
        type: 'hero',
        config: {
          layout: 'split',
          headline: 'Introducing the Future',
          subheadline: 'Revolutionary technology that changes everything',
          ctaText: 'Pre-Order Now',
          ctaUrl: '#preorder',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
        },
      },
      {
        type: 'product-showcase',
        config: {
          images: [],
          features: [],
        },
      },
      {
        type: 'pricing',
        config: {
          plans: [],
        },
      },
    ],
  },
  {
    id: 'lead-generation',
    name: 'Lead Magnet',
    description: 'Capture leads with downloadable content',
    category: 'Marketing',
    thumbnail: '/templates/lead-gen.png',
    sections: [
      {
        type: 'hero',
        config: {
          layout: 'center',
          headline: 'Free Guide: 10 Marketing Strategies That Work',
          subheadline: 'Download our comprehensive guide and transform your marketing',
          ctaText: 'Download Free Guide',
          ctaUrl: '#download',
          backgroundColor: '#059669',
          textColor: '#FFFFFF',
        },
      },
      {
        type: 'benefits',
        config: {
          headline: "What You'll Learn",
          benefits: [
            'Proven strategies used by top companies',
            'Step-by-step implementation guide',
            'Real-world case studies',
          ],
        },
      },
      {
        type: 'lead-form',
        config: {
          headline: 'Get Instant Access',
          fields: ['name', 'email', 'company'],
          submitText: 'Download Now',
        },
      },
    ],
  },
  {
    id: 'real-estate',
    name: 'Property Listing',
    description: 'Showcase properties with photos and details',
    category: 'Real Estate',
    thumbnail: '/templates/real-estate.png',
    sections: [
      {
        type: 'hero',
        config: {
          layout: 'full-image',
          headline: 'Your Dream Home Awaits',
          subheadline: '4 bed, 3 bath | 2,500 sq ft | $599,000',
          ctaText: 'Schedule Tour',
          ctaUrl: '#contact',
          backgroundImage: null,
        },
      },
      {
        type: 'property-details',
        config: {
          details: {},
          gallery: [],
        },
      },
      {
        type: 'contact-agent',
        config: {
          agentName: '',
          agentPhone: '',
          agentEmail: '',
        },
      },
    ],
  },
  {
    id: 'portfolio',
    name: 'Creative Portfolio',
    description: 'Showcase your work beautifully',
    category: 'Creative',
    thumbnail: '/templates/portfolio.png',
    sections: [
      {
        type: 'hero',
        config: {
          layout: 'minimal',
          headline: 'John Doe',
          subheadline: 'Creative Designer & Developer',
          ctaText: 'View Work',
          ctaUrl: '#portfolio',
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        },
      },
      {
        type: 'portfolio-grid',
        config: {
          projects: [],
        },
      },
      {
        type: 'contact',
        config: {
          headline: "Let's Work Together",
          showContactForm: true,
        },
      },
    ],
  },
  {
    id: 'webinar',
    name: 'Webinar Registration',
    description: 'Promote and register attendees for webinars',
    category: 'Events',
    thumbnail: '/templates/webinar.png',
    sections: [
      {
        type: 'hero',
        config: {
          layout: 'center',
          headline: 'Free Live Webinar: Mastering AI for Business',
          subheadline: 'Learn from industry experts | Thursday, Feb 15 at 2pm EST',
          ctaText: 'Reserve Your Spot',
          ctaUrl: '#register',
          backgroundColor: '#7C3AED',
          textColor: '#FFFFFF',
        },
      },
      {
        type: 'webinar-details',
        config: {
          speakers: [],
          topics: [],
          duration: '60 minutes',
        },
      },
      {
        type: 'registration-form',
        config: {
          fields: ['name', 'email', 'company'],
        },
      },
    ],
  },
  {
    id: 'service-business',
    name: 'Service Business',
    description: 'For consultants, agencies, and service providers',
    category: 'Business',
    thumbnail: '/templates/services.png',
    sections: [
      {
        type: 'hero',
        config: {
          layout: 'split',
          headline: 'Professional Marketing Services',
          subheadline: 'We help businesses grow through strategic marketing',
          ctaText: 'Get Free Consultation',
          ctaUrl: '#contact',
          backgroundColor: '#1F2937',
          textColor: '#FFFFFF',
        },
      },
      {
        type: 'services-list',
        config: {
          services: [
            { name: 'SEO Optimization', description: 'Rank higher on Google' },
            { name: 'Social Media', description: 'Build your brand presence' },
            { name: 'Content Marketing', description: 'Engage your audience' },
          ],
        },
      },
      {
        type: 'testimonials',
        config: {
          testimonials: [],
        },
      },
    ],
  },
  {
    id: 'coming-soon',
    name: 'Coming Soon',
    description: 'Build anticipation for upcoming launches',
    category: 'Marketing',
    thumbnail: '/templates/coming-soon.png',
    sections: [
      {
        type: 'hero',
        config: {
          layout: 'center',
          headline: 'Something Amazing is Coming',
          subheadline: 'Be the first to know when we launch',
          ctaText: 'Notify Me',
          ctaUrl: '#notify',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
        },
      },
      {
        type: 'countdown',
        config: {
          launchDate: '2025-03-01',
        },
      },
      {
        type: 'email-capture',
        config: {
          headline: 'Get Early Access',
          placeholder: 'Enter your email',
          submitText: 'Join Waitlist',
        },
      },
    ],
  },
];
