# 🎨 Professional Landing Page Builder - Complete Implementation

## Overview

You now have a **professional site builder** like Wix, Carrd, and Webflow! Your landing page system has been upgraded with:

✅ **Template Preview System** - Beautiful thumbnails and full previews  
✅ **Puck.js Visual Editor** - Drag-and-drop WYSIWYG interface  
✅ **Default Content Loading** - Templates load with complete designs  
✅ **Image Management** - Replace any image with the ImageField component  
✅ **Real-time Preview** - See changes instantly as you edit  

---

## 🎯 What Changed

### Before (Old System)
- ❌ Templates were HTML strings - blank when loaded
- ❌ No template preview images
- ❌ Users started with empty page
- ❌ Basic contentEditable interface
- ❌ Images replaced via slots (limited)

### After (New System)
- ✅ Templates are Puck JSON - load with full design
- ✅ Professional thumbnail + full preview images
- ✅ Users see complete template immediately
- ✅ Drag-and-drop visual builder (Puck.js)
- ✅ Any image replaceable via ImageField

---

## 📁 File Structure

```
lib/
├── templates/
│   ├── puck-templates.ts          # NEW: Puck.js template definitions
│   └── landing-page-templates.ts  # OLD: HTML templates (deprecated)
├── puckConfig.tsx                  # Puck component configuration
└── resolvePageContent.ts           # Template fallback logic

app/dashboard/landing-pages/
├── create/
│   └── page.tsx                    # UPDATED: New template selection UI
└── [id]/
    └── builder/
        └── page.tsx                # UPDATED: Loads Puck templates properly

prisma/
├── schema.prisma                   # Template model with defaultSections
└── migrations/
    └── add_puck_templates.sql      # NEW: Seed templates to database

components/
├── sections/                       # Puck section components
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   ├── GallerySection.tsx
│   ├── CTASection.tsx
│   └── ...
└── puck/
    ├── ImageField.tsx              # Custom image picker
    └── ImageArrayField.tsx         # Multi-image picker
```

---

## 🎨 Template System Architecture

### Template Structure (Puck JSON Format)

```typescript
interface PuckTemplate {
  id: string;                       // 'restaurant-hero-modern'
  name: string;                     // 'Modern Restaurant Hero'
  category: string;                 // 'Restaurant'
  description: string;              // Brief description
  isPremium: boolean;               // Premium flag
  thumbnail: string;                // Thumbnail URL (400x300)
  previewImage: string;             // Full preview URL (1200px)
  
  // Puck.js structure - this is what loads in the builder!
  defaultSections: {
    content: [                      // Array of sections
      {
        type: 'HeroSection',        // Component name
        props: {                    // Section props
          headline: 'Fine Dining Excellence',
          backgroundImage: 'https://...',
          // ... all section properties
        }
      },
      // ... more sections
    ],
    root: { props: {} }             // Root props
  };
  
  // Metadata
  metadata: {
    colorScheme: {
      primary: '#1F2937',
      secondary: '#F59E0B',
      // ...
    },
    fonts: {
      heading: 'Playfair Display, serif',
      body: 'Inter, sans-serif'
    },
    imageSlots: ['hero-background', 'gallery-1', ...]
  };
}
```

### Database Storage

```prisma
model Template {
  id              String   @id
  name            String
  category        String
  isPremium       Boolean
  thumbnail       String?
  defaultSections Json     // Puck JSON structure
  defaultStyles   Json?    // Color schemes, fonts
  metadata        Json?    // Additional config
  LandingPages    LandingPage[]
}

model LandingPage {
  id               String   @id
  templateId       String?
  draftContent     Json?    // User's working version
  publishedContent Json?    // Published version
  Template         Template?
}
```

---

## 🚀 How It Works

### 1. User Selects Template

```tsx
// app/dashboard/landing-pages/create/page.tsx

const template = PUCK_TEMPLATES.find(t => t.id === selectedTemplate);

// Create landing page with template's default sections
await fetch('/api/landing-pages', {
  method: 'POST',
  body: JSON.stringify({
    title: pageName,
    slug: slug,
    templateId: template.id,
    draftContent: template.defaultSections,  // ← Full Puck structure!
    metadata: template.metadata,
  }),
});
```

### 2. Builder Loads Template

```tsx
// app/dashboard/landing-pages/[id]/builder/page.tsx

const loadPageData = async (id: string) => {
  const page = await fetch(`/api/landing-pages/${id}`);
  
  // Use draft content if available, otherwise published
  let content = page.draftContent || page.publishedContent;
  
  // If no content, falls back to template defaultSections
  if (!content && page.templateId) {
    const template = await fetch(`/api/templates/${page.templateId}`);
    content = template.defaultSections;
  }
  
  setData(content);  // ← Puck loads with full template!
};
```

### 3. User Edits Visually

```tsx
<Puck
  config={puckConfig}        // Section definitions
  data={data}                // Template content
  onChange={handleChange}    // Auto-save changes
  onPublish={handlePublish}  // Publish button
/>
```

---

## 🖼️ Image Management

### How Images Work

1. **Template comes with default images**
   ```typescript
   {
     type: 'HeroSection',
     props: {
       backgroundImage: 'https://images.unsplash.com/...'  // Default
     }
   }
   ```

2. **User can replace any image**
   - In builder, click the image field
   - ImageField component opens
   - Browse stock library or search Unsplash
   - Select new image - updates instantly

3. **ImageField Component**
   ```tsx
   // components/puck/ImageField.tsx
   
   export function ImageField({ value, onChange, category }) {
     return (
       <ImageBrowser
         category={category}
         currentImage={value}
         onSelect={(newUrl) => onChange(newUrl)}
       />
     );
   }
   ```

### Available Image Sources

- **Stock Library**: Curated images by category
- **Unsplash Search**: Search millions of free images
- **Upload**: Coming soon (needs Vercel Blob setup)

---

## 📦 Available Templates

### 1. Modern Restaurant Hero
- **Category**: Restaurant
- **Sections**: Hero, Features, Gallery, CTA
- **Best For**: Fine dining, cafes, food businesses
- **Images**: Hero background, 3 dish photos

### 2. SaaS Product Launch
- **Category**: Business
- **Sections**: Hero, Features (4-col), CTA
- **Best For**: Software products, apps, platforms
- **Images**: Hero background

### 3. Product Showcase
- **Category**: Retail
- **Sections**: Hero, Gallery (4 products), Features, CTA
- **Best For**: E-commerce, retail, product launches
- **Images**: Hero + 4 product photos

### 4. Property Listing
- **Category**: Real Estate
- **Sections**: Hero, Features, Gallery, CTA
- **Best For**: Real estate listings, property showcases
- **Images**: Hero + 3 property photos

### 5. Event & Conference
- **Category**: Events
- **Sections**: Hero, Features, CTA
- **Best For**: Events, conferences, webinars
- **Images**: Hero background

---

## 🎯 User Workflow

### Creating a Landing Page

1. **Dashboard** → Click "Create Landing Page"

2. **Choose Template**
   - Browse categories (All, Restaurant, Business, Retail, Events)
   - See thumbnail previews
   - Click to select
   - Hit "Next: Customize"

3. **Name & URL**
   - Enter page name
   - Auto-generated URL slug
   - Click "Create & Open Visual Editor"

4. **Visual Builder Opens**
   - Template loads with full design
   - Drag sections to reorder
   - Click any text to edit
   - Click image fields to replace
   - Add new sections from left panel
   - Configure properties in right panel

5. **Save & Publish**
   - Auto-saves as you work
   - Click "Publish" when ready
   - Page goes live immediately

---

## 🛠️ Adding New Templates

### Step 1: Define Template in Code

```typescript
// lib/templates/puck-templates.ts

export const PUCK_TEMPLATES: PuckTemplate[] = [
  // ... existing templates
  {
    id: 'my-new-template',
    name: 'My New Template',
    category: 'Business',
    description: 'A great template for businesses',
    isPremium: false,
    thumbnail: 'https://images.unsplash.com/...?w=400&h=300',
    previewImage: 'https://images.unsplash.com/...?w=1200',
    defaultSections: {
      content: [
        {
          type: 'HeroSection',
          props: {
            headline: 'Welcome',
            subheadline: 'Get started today',
            backgroundImage: 'https://...',
            ctaText: 'Learn More',
            ctaLink: '#contact',
            // ... full hero props
          },
        },
        // Add more sections
      ],
      root: { props: {} },
    },
    metadata: {
      colorScheme: {
        primary: '#2563EB',
        secondary: '#7C3AED',
        accent: '#EC4899',
        background: '#FFFFFF',
        text: '#1F2937',
      },
      imageSlots: ['hero-background'],
    },
  },
];
```

### Step 2: Add to Database (Optional)

```sql
-- prisma/migrations/add_my_template.sql

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
  'my-new-template',
  'My New Template',
  'business',
  'A great template for businesses',
  false,
  'https://images.unsplash.com/...?w=400&h=300',
  '{ "content": [...], "root": {...} }',
  '{ "colorScheme": {...} }',
  '{ "imageSlots": [...] }',
  '1.0.0',
  true,
  NOW(),
  NOW()
);
```

### Step 3: Test

```bash
npm run dev
# Visit http://localhost:3000/dashboard/landing-pages/create
# Your new template appears in the grid!
```

---

## 🎨 Adding New Sections

### Step 1: Create Section Component

```tsx
// components/sections/TestimonialSection.tsx

export function TestimonialSection({
  name,
  quote,
  avatar,
  role,
}: {
  name: string;
  quote: string;
  avatar: string;
  role: string;
}) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <img src={avatar} className="w-20 h-20 rounded-full mx-auto mb-4" />
        <p className="text-xl italic mb-4">"{quote}"</p>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-600">{role}</p>
      </div>
    </section>
  );
}
```

### Step 2: Register in Puck Config

```tsx
// lib/puckConfig.tsx

import { TestimonialSection } from '@/components/sections/TestimonialSection';

export const puckConfig: Config = {
  components: {
    // ... existing sections
    
    TestimonialSection: {
      fields: {
        name: { type: 'text', label: 'Name' },
        quote: { type: 'textarea', label: 'Quote' },
        avatar: {
          type: 'custom',
          label: 'Avatar Image',
          render: ({ value, onChange }) => (
            <ImageField value={value} onChange={onChange} category="people" />
          ),
        },
        role: { type: 'text', label: 'Role/Title' },
      },
      defaultProps: {
        name: 'John Doe',
        quote: 'This product changed my life!',
        avatar: 'https://i.pravatar.cc/200',
        role: 'CEO, Company Inc.',
      },
      render: (props) => <TestimonialSection {...props} />,
    },
  },
};
```

### Step 3: Use in Templates

```typescript
// lib/templates/puck-templates.ts

defaultSections: {
  content: [
    // ... other sections
    {
      type: 'TestimonialSection',
      props: {
        name: 'Sarah Johnson',
        quote: 'The best service I\'ve ever experienced!',
        avatar: 'https://i.pravatar.cc/200?img=5',
        role: 'Marketing Director',
      },
    },
  ],
  root: { props: {} },
}
```

---

## 🔧 Configuration

### Puck Config Options

```tsx
// lib/puckConfig.tsx

export const puckConfig: Config = {
  components: {
    // Your section definitions
  },
  
  // Optional: Customize UI
  categories: {
    layout: {
      title: "Layout",
      components: ["HeroSection", "CTASection"],
    },
    content: {
      title: "Content",
      components: ["FeaturesSection", "GallerySection"],
    },
  },
  
  // Optional: Root props (global settings)
  root: {
    fields: {
      title: { type: 'text', label: 'Page Title' },
    },
  },
};
```

---

## 🐛 Troubleshooting

### Template Loads Blank

**Cause**: Template not loading defaultSections  
**Fix**: Check that `draftContent` is set when creating landing page

```tsx
// ✅ Correct
body: JSON.stringify({
  templateId: template.id,
  draftContent: template.defaultSections,  // ← Include this!
})

// ❌ Wrong
body: JSON.stringify({
  templateId: template.id,
  // Missing draftContent
})
```

### Images Don't Replace

**Cause**: ImageField not configured properly  
**Fix**: Check field is using custom render with ImageField

```tsx
// ✅ Correct
backgroundImage: {
  type: 'custom',
  label: 'Background Image',
  render: ({ value, onChange }) => (
    <ImageField value={value} onChange={onChange} category="restaurant" />
  ),
}

// ❌ Wrong
backgroundImage: {
  type: 'text',  // ← Should be 'custom'
  label: 'Background Image',
}
```

### Preview Images Don't Show

**Cause**: Thumbnail URLs broken or missing  
**Fix**: Verify image URLs are accessible

```typescript
thumbnail: 'https://images.unsplash.com/photo-123?w=400&h=300&fit=crop',
//         ↑ Must be valid, publicly accessible URL
```

---

## 📊 Database Migration

### Seed Templates to Database

```bash
# Run the SQL migration
psql $DATABASE_URL -f prisma/migrations/add_puck_templates.sql

# Or use Prisma
npx prisma db seed
```

### Create Seed Script (Optional)

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { PUCK_TEMPLATES } from '../lib/templates/puck-templates';

const prisma = new PrismaClient();

async function main() {
  for (const template of PUCK_TEMPLATES) {
    await prisma.template.upsert({
      where: { id: template.id },
      update: {
        name: template.name,
        defaultSections: template.defaultSections,
        updatedAt: new Date(),
      },
      create: {
        id: template.id,
        name: template.name,
        category: template.category,
        description: template.description,
        isPremium: template.isPremium,
        thumbnail: template.thumbnail,
        defaultSections: template.defaultSections as any,
        defaultStyles: template.metadata as any,
        metadata: template.metadata as any,
        schemaVersion: '1.0.0',
        isActive: true,
      },
    });
  }
}

main();
```

---

## 🚀 Next Steps

### Enhance Image Management

1. **Add Image Upload**
   - Install `@vercel/blob` package
   - Create upload endpoint
   - Add "Upload" tab to ImageBrowser

2. **Add Image Library**
   - Create custom image library
   - Store in database
   - Allow users to save favorites

3. **Optimize Images**
   - Use Next.js Image component
   - Add image optimization
   - Lazy load images

### Add More Templates

1. **Portfolio Template**
   - Hero + Project Gallery + Contact
   - For freelancers, agencies

2. **Coming Soon Template**
   - Countdown + Email Capture
   - For pre-launches

3. **Webinar Template**
   - Event Details + Registration Form
   - For online events

### Premium Features

1. **Custom Domains**
   - Allow users to connect domains
   - SSL certificates

2. **Template Marketplace**
   - Let users buy/sell templates
   - Revenue sharing

3. **AI Template Generator**
   - Generate templates from text
   - Customize with AI

---

## ✅ Summary

You now have a **professional landing page builder** with:

✅ **5 Professional Templates** (Restaurant, SaaS, Retail, Real Estate, Events)  
✅ **Template Preview System** (Thumbnails + full previews)  
✅ **Puck.js Visual Builder** (Drag-and-drop WYSIWYG)  
✅ **Default Content Loading** (Templates load fully designed)  
✅ **Image Management** (Replace any image easily)  
✅ **Real-time Auto-save** (Never lose work)  
✅ **Publish System** (Draft → Published workflow)  

### Key Files

- `lib/templates/puck-templates.ts` - Template definitions
- `app/dashboard/landing-pages/create/page.tsx` - Template selection
- `app/dashboard/landing-pages/[id]/builder/page.tsx` - Visual builder
- `lib/puckConfig.tsx` - Section components
- `components/sections/` - All section components
- `components/puck/ImageField.tsx` - Image picker

### Documentation

- This file: Complete implementation guide
- `BUILDER_COMPLETE_CHECKLIST.md` - Builder features
- `LANDING_PAGES_SYSTEM_COMPLETE.md` - System overview
- `VISUAL_EDITOR_COMPLETE_GUIDE.md` - User guide

---

**You're all set! Your landing page builder is production-ready and competitive with Wix, Carrd, and Webflow.** 🎉
