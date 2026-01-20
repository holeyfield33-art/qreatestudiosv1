import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const templates = [
  {
    id: 'restaurant-hero-modern',
    name: 'Modern Restaurant Hero',
    category: 'restaurant',
    description: 'Full-screen hero with stunning food photography and featured dishes',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
    defaultSections: {
      content: [
        {
          type: 'HeroSection',
          props: {
            headline: 'Fine Dining Excellence',
            subheadline: 'Experience culinary artistry with fresh, locally-sourced ingredients',
            backgroundImage: {
              url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920',
              alt: 'Restaurant interior with elegant dining'
            },
            ctaText: 'View Our Menu',
            ctaLink: '#menu',
            ctaStyle: 'primary',
            overlay: true,
            overlayOpacity: 50,
            textAlign: 'center',
            minHeight: '70vh'
          }
        }
      ],
      root: {
        props: {
          title: 'Restaurant Landing Page'
        }
      }
    },
    defaultStyles: {
      colors: {
        primary: '#8B4513',
        secondary: '#D2691E',
        accent: '#FFD700'
      }
    },
    metadata: {
      previewImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop'
    },
    schemaVersion: '1.0.0',
    isActive: true
  },
  {
    id: 'business-professional',
    name: 'Professional Business',
    category: 'business',
    description: 'Clean, corporate design perfect for professional services',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
    defaultSections: {
      content: [
        {
          type: 'HeroSection',
          props: {
            headline: 'Welcome to Our Business',
            subheadline: 'Professional solutions for modern challenges',
            backgroundImage: {
              url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920',
              alt: 'Modern office building'
            },
            ctaText: 'Get Started',
            ctaLink: '#contact',
            ctaStyle: 'primary',
            overlay: true,
            overlayOpacity: 40,
            textAlign: 'center',
            minHeight: '60vh'
          }
        }
      ],
      root: {
        props: {
          title: 'Business Landing Page'
        }
      }
    },
    defaultStyles: {
      colors: {
        primary: '#1E3A8A',
        secondary: '#3B82F6',
        accent: '#60A5FA'
      }
    },
    metadata: {
      previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop'
    },
    schemaVersion: '1.0.0',
    isActive: true
  },
  {
    id: 'portfolio-creative',
    name: 'Creative Portfolio',
    category: 'portfolio',
    description: 'Showcase your work with a modern portfolio design',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    defaultSections: {
      content: [
        {
          type: 'HeroSection',
          props: {
            headline: 'Creative Portfolio',
            subheadline: 'Showcasing exceptional design and creativity',
            backgroundImage: {
              url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920',
              alt: 'Creative workspace'
            },
            ctaText: 'View Portfolio',
            ctaLink: '#work',
            ctaStyle: 'primary',
            overlay: true,
            overlayOpacity: 50,
            textAlign: 'center',
            minHeight: '80vh'
          }
        }
      ],
      root: {
        props: {
          title: 'Portfolio Landing Page'
        }
      }
    },
    defaultStyles: {
      colors: {
        primary: '#7C3AED',
        secondary: '#A78BFA',
        accent: '#C4B5FD'
      }
    },
    metadata: {
      previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop'
    },
    schemaVersion: '1.0.0',
    isActive: true
  },
  {
    id: 'event-modern',
    name: 'Modern Event',
    category: 'event',
    description: 'Perfect for concerts, conferences, and special events',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    defaultSections: {
      content: [
        {
          type: 'HeroSection',
          props: {
            headline: 'Join Us for an Unforgettable Event',
            subheadline: 'Experience the magic of live entertainment',
            backgroundImage: {
              url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920',
              alt: 'Concert crowd'
            },
            ctaText: 'Get Tickets',
            ctaLink: '#tickets',
            ctaStyle: 'primary',
            overlay: true,
            overlayOpacity: 60,
            textAlign: 'center',
            minHeight: '75vh'
          }
        }
      ],
      root: {
        props: {
          title: 'Event Landing Page'
        }
      }
    },
    defaultStyles: {
      colors: {
        primary: '#DC2626',
        secondary: '#EF4444',
        accent: '#F87171'
      }
    },
    metadata: {
      previewImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop'
    },
    schemaVersion: '1.0.0',
    isActive: true
  },
  {
    id: 'minimal-elegant',
    name: 'Minimal Elegance',
    category: 'business',
    description: 'Simple, elegant design with maximum impact',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    defaultSections: {
      content: [
        {
          type: 'HeroSection',
          props: {
            headline: 'Less is More',
            subheadline: 'Elegant solutions for the modern world',
            backgroundImage: {
              url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920',
              alt: 'Minimalist workspace'
            },
            ctaText: 'Learn More',
            ctaLink: '#about',
            ctaStyle: 'primary',
            overlay: true,
            overlayOpacity: 30,
            textAlign: 'center',
            minHeight: '65vh'
          }
        }
      ],
      root: {
        props: {
          title: 'Minimal Landing Page'
        }
      }
    },
    defaultStyles: {
      colors: {
        primary: '#000000',
        secondary: '#404040',
        accent: '#808080'
      }
    },
    metadata: {
      previewImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop'
    },
    schemaVersion: '1.0.0',
    isActive: true
  }
]

async function main() {
  console.log('🌱 Seeding templates...')

  for (const template of templates) {
    await prisma.template.upsert({
      where: { id: template.id },
      update: template,
      create: template,
    })
    console.log(`✅ Created/Updated template: ${template.name}`)
  }

  console.log('✨ Template seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding templates:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
