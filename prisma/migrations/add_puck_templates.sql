-- Add Puck-based templates to database
-- This migration seeds the Template table with professional Puck.js templates

-- Restaurant Template
INSERT INTO "Template" (
  id,
  name,
  category,
  description,
  "isPremium",
  thumbnail,
  "defaultSections",
  "defaultStyles",
  metadata,
  "schemaVersion",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'restaurant-hero-modern',
  'Modern Restaurant Hero',
  'restaurant',
  'Full-screen hero with stunning food photography and featured dishes',
  false,
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
  '{
    "content": [
      {
        "type": "HeroSection",
        "props": {
          "headline": "Fine Dining Excellence",
          "subheadline": "Experience culinary artistry with fresh, locally-sourced ingredients",
          "backgroundImage": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920",
          "ctaText": "View Our Menu",
          "ctaLink": "#menu",
          "ctaStyle": "primary",
          "overlay": true,
          "overlayOpacity": 50,
          "textAlign": "center",
          "minHeight": "70vh"
        }
      },
      {
        "type": "FeaturesSection",
        "props": {
          "title": "What Makes Us Special",
          "subtitle": "Three pillars of our culinary philosophy",
          "features": [
            {
              "id": "1",
              "icon": "UtensilsCrossed",
              "title": "Fresh Ingredients",
              "description": "Locally sourced, farm-to-table freshness in every dish"
            },
            {
              "id": "2",
              "icon": "ChefHat",
              "title": "Master Chefs",
              "description": "Award-winning culinary team with international experience"
            },
            {
              "id": "3",
              "icon": "Sparkles",
              "title": "Unforgettable Experience",
              "description": "Elegant ambiance paired with exceptional service"
            }
          ],
          "columns": 3,
          "style": "cards"
        }
      },
      {
        "type": "GallerySection",
        "props": {
          "title": "Our Signature Dishes",
          "subtitle": "A taste of what awaits you",
          "images": [
            {
              "id": "1",
              "url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
              "alt": "Gourmet appetizer",
              "title": "Seasonal Appetizer"
            },
            {
              "id": "2",
              "url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
              "alt": "Signature main course",
              "title": "Signature Entrée"
            },
            {
              "id": "3",
              "url": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800",
              "alt": "Artisan dessert",
              "title": "Artisan Dessert"
            }
          ],
          "columns": 3,
          "style": "grid"
        }
      },
      {
        "type": "CTASection",
        "props": {
          "title": "Reserve Your Table",
          "subtitle": "Book your unforgettable dining experience today",
          "ctaText": "Make a Reservation",
          "ctaLink": "#contact",
          "ctaStyle": "primary",
          "secondaryCtaText": "View Menu",
          "secondaryCtaLink": "#menu",
          "backgroundStyle": "gradient"
        }
      }
    ],
    "root": {
      "props": {}
    }
  }',
  '{
    "colorScheme": {
      "primary": "#1F2937",
      "secondary": "#F59E0B",
      "accent": "#EF4444",
      "background": "#FFFFFF",
      "text": "#111827"
    },
    "fonts": {
      "heading": "Playfair Display, serif",
      "body": "Inter, sans-serif"
    }
  }',
  '{
    "imageSlots": ["hero-background", "gallery-1", "gallery-2", "gallery-3"],
    "previewImage": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"
  }',
  '1.0.0',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "defaultSections" = EXCLUDED."defaultSections",
  "updatedAt" = NOW();

-- SaaS Product Launch Template
INSERT INTO "Template" (
  id,
  name,
  category,
  description,
  "isPremium",
  thumbnail,
  "defaultSections",
  "defaultStyles",
  metadata,
  "schemaVersion",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'saas-product-launch',
  'SaaS Product Launch',
  'business',
  'Modern product showcase with features, pricing, and CTA',
  false,
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  '{
    "content": [
      {
        "type": "HeroSection",
        "props": {
          "headline": "Revolutionize Your Workflow",
          "subheadline": "The all-in-one platform that helps teams collaborate, automate, and grow faster",
          "backgroundImage": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920",
          "ctaText": "Start Free Trial",
          "ctaLink": "#signup",
          "ctaStyle": "primary",
          "overlay": true,
          "overlayOpacity": 70,
          "textAlign": "center",
          "minHeight": "80vh"
        }
      },
      {
        "type": "FeaturesSection",
        "props": {
          "title": "Everything You Need",
          "subtitle": "Powerful features designed for modern teams",
          "features": [
            {
              "id": "1",
              "icon": "Zap",
              "title": "Lightning Fast",
              "description": "Built for speed with cutting-edge technology"
            },
            {
              "id": "2",
              "icon": "Shield",
              "title": "Enterprise Security",
              "description": "Bank-level encryption and compliance"
            },
            {
              "id": "3",
              "icon": "Users",
              "title": "Team Collaboration",
              "description": "Work together seamlessly in real-time"
            },
            {
              "id": "4",
              "icon": "BarChart",
              "title": "Advanced Analytics",
              "description": "Gain insights with powerful reporting tools"
            }
          ],
          "columns": 4,
          "style": "cards"
        }
      },
      {
        "type": "CTASection",
        "props": {
          "title": "Ready to Get Started?",
          "subtitle": "Join thousands of teams already using our platform",
          "ctaText": "Start Free Trial",
          "ctaLink": "#signup",
          "ctaStyle": "primary",
          "secondaryCtaText": "Schedule Demo",
          "secondaryCtaLink": "#demo",
          "backgroundStyle": "solid"
        }
      }
    ],
    "root": {
      "props": {}
    }
  }',
  '{
    "colorScheme": {
      "primary": "#2563EB",
      "secondary": "#7C3AED",
      "accent": "#EC4899",
      "background": "#FFFFFF",
      "text": "#1F2937"
    },
    "fonts": {
      "heading": "Inter, sans-serif",
      "body": "Inter, sans-serif"
    }
  }',
  '{
    "imageSlots": ["hero-background"],
    "previewImage": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200"
  }',
  '1.0.0',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "defaultSections" = EXCLUDED."defaultSections",
  "updatedAt" = NOW();

-- Retail Product Showcase Template
INSERT INTO "Template" (
  id,
  name,
  category,
  description,
  "isPremium",
  thumbnail,
  "defaultSections",
  "defaultStyles",
  metadata,
  "schemaVersion",
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'retail-product-showcase',
  'Product Showcase',
  'retail',
  'Modern e-commerce product display with gallery and features',
  false,
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
  '{
    "content": [
      {
        "type": "HeroSection",
        "props": {
          "headline": "Premium Collection 2026",
          "subheadline": "Discover our latest arrivals crafted with precision and passion",
          "backgroundImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920",
          "ctaText": "Shop Now",
          "ctaLink": "#products",
          "ctaStyle": "primary",
          "overlay": true,
          "overlayOpacity": 40,
          "textAlign": "center",
          "minHeight": "75vh"
        }
      },
      {
        "type": "GallerySection",
        "props": {
          "title": "Featured Products",
          "subtitle": "Handpicked selection from our newest collection",
          "images": [
            {
              "id": "1",
              "url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
              "alt": "Premium watch",
              "title": "Luxury Timepiece"
            },
            {
              "id": "2",
              "url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
              "alt": "Designer sunglasses",
              "title": "Designer Eyewear"
            },
            {
              "id": "3",
              "url": "https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=800",
              "alt": "Leather bag",
              "title": "Artisan Leather"
            },
            {
              "id": "4",
              "url": "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=800",
              "alt": "Premium sneakers",
              "title": "Limited Edition"
            }
          ],
          "columns": 4,
          "style": "grid"
        }
      },
      {
        "type": "FeaturesSection",
        "props": {
          "title": "Why Shop With Us",
          "subtitle": "Premium experience from browsing to delivery",
          "features": [
            {
              "id": "1",
              "icon": "Truck",
              "title": "Free Shipping",
              "description": "On orders over $100 worldwide"
            },
            {
              "id": "2",
              "icon": "RefreshCw",
              "title": "Easy Returns",
              "description": "30-day hassle-free return policy"
            },
            {
              "id": "3",
              "icon": "Award",
              "title": "Authentic Guarantee",
              "description": "100% genuine products certified"
            }
          ],
          "columns": 3,
          "style": "minimal"
        }
      },
      {
        "type": "CTASection",
        "props": {
          "title": "Start Shopping",
          "subtitle": "Explore our full collection and find your perfect match",
          "ctaText": "Browse Collection",
          "ctaLink": "#shop",
          "ctaStyle": "primary",
          "backgroundStyle": "gradient"
        }
      }
    ],
    "root": {
      "props": {}
    }
  }',
  '{
    "colorScheme": {
      "primary": "#2563EB",
      "secondary": "#7C3AED",
      "accent": "#EC4899",
      "background": "#FFFFFF",
      "text": "#1F2937"
    },
    "fonts": {
      "heading": "Montserrat, sans-serif",
      "body": "Open Sans, sans-serif"
    }
  }',
  '{
    "imageSlots": ["hero-background", "gallery-1", "gallery-2", "gallery-3", "gallery-4"],
    "previewImage": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200"
  }',
  '1.0.0',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  "defaultSections" = EXCLUDED."defaultSections",
  "updatedAt" = NOW();
