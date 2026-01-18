# 🏗️ Landing Page Builder - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐        ┌──────────────────────┐       │
│  │  Template Selector   │        │   Visual Builder      │       │
│  │  (create/page.tsx)  │───────▶│   (builder/page.tsx)  │       │
│  │                     │        │                      │       │
│  │  • Browse templates │        │  • Drag & drop       │       │
│  │  • See previews     │        │  • Edit sections     │       │
│  │  • Filter categories│        │  • Replace images    │       │
│  │  • Select template  │        │  • Auto-save         │       │
│  └─────────────────────┘        └──────────────────────┘       │
│           │                               │                      │
│           ▼                               ▼                      │
│  ┌────────────────────────────────────────────────────┐        │
│  │            Puck.js Visual Editor                    │        │
│  │  • Component library (left panel)                   │        │
│  │  • Canvas (center)                                  │        │
│  │  • Properties panel (right)                         │        │
│  └────────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐        ┌──────────────────────┐       │
│  │  Template Library    │        │   Puck Config        │       │
│  │  (puck-templates.ts)│───────▶│   (puckConfig.tsx)   │       │
│  │                     │        │                      │       │
│  │  PUCK_TEMPLATES[]   │        │  Section definitions │       │
│  │  • 5 templates      │        │  • HeroSection       │       │
│  │  • Full structure   │        │  • FeaturesSection   │       │
│  │  • Default content  │        │  • GallerySection    │       │
│  │  • Preview images   │        │  • CTASection        │       │
│  └─────────────────────┘        └──────────────────────┘       │
│           │                               │                      │
│           │                               ▼                      │
│           │                  ┌──────────────────────┐          │
│           │                  │  Section Components   │          │
│           │                  │  (components/sections)│          │
│           │                  │                      │          │
│           │                  │  • HeroSection.tsx   │          │
│           │                  │  • FeaturesSection   │          │
│           │                  │  • GallerySection    │          │
│           │                  │  • CTASection        │          │
│           │                  └──────────────────────┘          │
│           ▼                                                      │
│  ┌─────────────────────┐                                       │
│  │   Image Management   │                                       │
│  │  (ImageField.tsx)   │                                       │
│  │                     │                                       │
│  │  • Stock library    │                                       │
│  │  • Unsplash search  │                                       │
│  │  • Image replacement│                                       │
│  └─────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    Database (PostgreSQL)                │    │
│  │                                                          │    │
│  │  ┌──────────────┐           ┌──────────────────┐      │    │
│  │  │   Template   │           │   LandingPage    │      │    │
│  │  ├──────────────┤           ├──────────────────┤      │    │
│  │  │ id           │◀─────────▶│ templateId       │      │    │
│  │  │ name         │           │ draftContent     │      │    │
│  │  │ category     │           │ publishedContent │      │    │
│  │  │ thumbnail    │           │ metadata         │      │    │
│  │  │ defaultSections         │ name             │      │    │
│  │  │ metadata     │           │ slug             │      │    │
│  │  └──────────────┘           └──────────────────┘      │    │
│  │                                                          │    │
│  │  Template.defaultSections = Puck JSON structure        │    │
│  │  LandingPage.draftContent = User's customized version  │    │
│  │  LandingPage.publishedContent = Published version      │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  /api/landing-pages                                     │    │
│  │  ├── POST    Create new landing page with template     │    │
│  │  ├── GET     List user's landing pages                 │    │
│  │  │                                                      │    │
│  │  /api/landing-pages/[id]                               │    │
│  │  ├── GET     Get landing page (returns draftContent)   │    │
│  │  ├── PATCH   Update draftContent (auto-save)           │    │
│  │  ├── DELETE  Delete landing page                       │    │
│  │  │                                                      │    │
│  │  /api/landing-pages/[id]/publish                       │    │
│  │  └── POST    Publish (draftContent → publishedContent) │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Template Selection to Publishing

```
┌────────────────────────────────────────────────────────────────┐
│ 1. USER SELECTS TEMPLATE                                        │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  Template Selector UI    │
            │  Shows:                  │
            │  • Thumbnail images      │
            │  • Template names        │
            │  • Categories            │
            │                          │
            │  User clicks template    │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  Load Template Data      │
            │                          │
            │  const template =        │
            │    PUCK_TEMPLATES        │
            │      .find(...)          │
            │                          │
            │  template.defaultSections│
            │  ↳ Complete Puck JSON    │
            └──────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ 2. CREATE LANDING PAGE                                          │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  POST /api/landing-pages │
            │                          │
            │  Body:                   │
            │  {                       │
            │    title: "My Page",     │
            │    templateId: "...",    │
            │    draftContent: {       │
            │      content: [          │
            │        { type: "Hero",   │
            │          props: {...}    │
            │        },                │
            │        ...               │
            │      ],                  │
            │      root: {...}         │
            │    }                     │
            │  }                       │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  Database INSERT         │
            │                          │
            │  LandingPage created     │
            │  with full template      │
            │  structure in            │
            │  draftContent field      │
            └──────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ 3. OPEN VISUAL BUILDER                                          │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  GET /api/landing-       │
            │      pages/[id]          │
            │                          │
            │  Returns:                │
            │  {                       │
            │    draftContent: {       │
            │      content: [...]      │
            │    }                     │
            │  }                       │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  Puck.js Loads           │
            │                          │
            │  <Puck                   │
            │    data={draftContent}   │
            │    config={puckConfig}   │
            │  />                      │
            │                          │
            │  ✅ Full template        │
            │     renders!             │
            └──────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ 4. USER EDITS                                                   │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  onChange handler        │
            │                          │
            │  • User edits text       │
            │  • Replaces images       │
            │  • Adds sections         │
            │  • Reorders sections     │
            │                          │
            │  onChange triggers       │
            │  auto-save (3s delay)    │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  PATCH /api/landing-     │
            │        pages/[id]        │
            │                          │
            │  Body:                   │
            │  {                       │
            │    draftContent: {       │
            │      content: [...]      │
            │    }                     │
            │  }                       │
            │                          │
            │  Updates database        │
            └──────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ 5. USER PUBLISHES                                               │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  POST /api/landing-      │
            │       pages/[id]/publish │
            │                          │
            │  Copies:                 │
            │  draftContent →          │
            │  publishedContent        │
            │                          │
            │  Sets:                   │
            │  isPublished = true      │
            └──────────────────────────┘
                          │
                          ▼
┌────────────────────────────────────────────────────────────────┐
│ 6. PUBLIC VIEW                                                  │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  GET /l/[slug]           │
            │                          │
            │  Loads:                  │
            │  publishedContent        │
            │                          │
            │  Renders:                │
            │  <Render                 │
            │    config={puckConfig}   │
            │    data={published}      │
            │  />                      │
            └──────────────────────────┘
```

---

## Template Structure (Puck JSON)

```
Template Object
├── id: "restaurant-hero-modern"
├── name: "Modern Restaurant Hero"
├── category: "Restaurant"
├── thumbnail: "https://...?w=400&h=300"
├── previewImage: "https://...?w=1200"
│
├── defaultSections: {                  ← This is the key!
│   │
│   ├── content: [                      ← Array of sections
│   │   │
│   │   ├── {                           ← Section 1: Hero
│   │   │    type: "HeroSection"
│   │   │    props: {
│   │   │      headline: "Fine Dining Excellence"
│   │   │      subheadline: "Experience culinary..."
│   │   │      backgroundImage: "https://..."
│   │   │      ctaText: "View Our Menu"
│   │   │      ctaLink: "#menu"
│   │   │      overlay: true
│   │   │      overlayOpacity: 50
│   │   │      textAlign: "center"
│   │   │      minHeight: "70vh"
│   │   │    }
│   │   │   }
│   │   │
│   │   ├── {                           ← Section 2: Features
│   │   │    type: "FeaturesSection"
│   │   │    props: {
│   │   │      title: "What Makes Us Special"
│   │   │      features: [
│   │   │        {
│   │   │          id: "1"
│   │   │          icon: "UtensilsCrossed"
│   │   │          title: "Fresh Ingredients"
│   │   │          description: "..."
│   │   │        },
│   │   │        ...
│   │   │      ]
│   │   │      columns: 3
│   │   │      style: "cards"
│   │   │    }
│   │   │   }
│   │   │
│   │   ├── {                           ← Section 3: Gallery
│   │   │    type: "GallerySection"
│   │   │    props: {
│   │   │      title: "Our Signature Dishes"
│   │   │      images: [
│   │   │        { id: "1", url: "...", title: "..." },
│   │   │        ...
│   │   │      ]
│   │   │      columns: 3
│   │   │      style: "grid"
│   │   │    }
│   │   │   }
│   │   │
│   │   └── {                           ← Section 4: CTA
│   │        type: "CTASection"
│   │        props: {
│   │          title: "Reserve Your Table"
│   │          ctaText: "Make a Reservation"
│   │          ...
│   │        }
│   │       }
│   │   ]
│   │
│   └── root: {                         ← Root properties
│       props: {}
│      }
│   }
│
└── metadata: {                         ← Metadata
    colorScheme: {
      primary: "#1F2937"
      secondary: "#F59E0B"
      accent: "#EF4444"
      background: "#FFFFFF"
      text: "#111827"
    }
    fonts: {
      heading: "Playfair Display, serif"
      body: "Inter, sans-serif"
    }
    imageSlots: [
      "hero-background"
      "gallery-1"
      "gallery-2"
      "gallery-3"
    ]
  }
```

---

## Component Registration (Puck Config)

```
puckConfig.tsx
│
├── components: {
│   │
│   ├── HeroSection: {                  ← Register component
│   │   │
│   │   ├── fields: {                   ← Define editable fields
│   │   │    headline: { type: 'text', ... }
│   │   │    subheadline: { type: 'textarea', ... }
│   │   │    backgroundImage: {
│   │   │      type: 'custom',          ← Custom field!
│   │   │      render: ({ value, onChange }) => (
│   │   │        <ImageField           ← Image picker
│   │   │          value={value}
│   │   │          onChange={onChange}
│   │   │          category="restaurant"
│   │   │        />
│   │   │      )
│   │   │    }
│   │   │    ctaText: { type: 'text', ... }
│   │   │    ...
│   │   │   }
│   │   │
│   │   ├── defaultProps: {             ← Default values
│   │   │    headline: "Welcome..."
│   │   │    ...
│   │   │   }
│   │   │
│   │   └── render: (props) =>          ← Render function
│   │       <HeroSection {...props} />
│   │   }
│   │
│   ├── FeaturesSection: { ... }
│   ├── GallerySection: { ... }
│   ├── CTASection: { ... }
│   └── ...
│   }
```

---

## Image Management Flow

```
┌────────────────────────────────────────────────────────────────┐
│ User clicks image field in right panel                          │
└────────────────────────────────────────────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  ImageField Component    │
            │  Opens ImageBrowser      │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  ImageBrowser Tabs       │
            │                          │
            │  ┌──────────────────┐   │
            │  │ Stock Library    │   │
            │  │  • Curated       │   │
            │  │  • By category   │   │
            │  └──────────────────┘   │
            │                          │
            │  ┌──────────────────┐   │
            │  │ Unsplash Search  │   │
            │  │  • Search query  │   │
            │  │  • Millions      │   │
            │  └──────────────────┘   │
            │                          │
            │  ┌──────────────────┐   │
            │  │ Upload (Future)  │   │
            │  │  • Vercel Blob   │   │
            │  │  • User uploads  │   │
            │  └──────────────────┘   │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  User selects image      │
            │  onClick(imageUrl)       │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  onChange(newImageUrl)   │
            │  Updates section props   │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  Puck re-renders         │
            │  Image updates instantly │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  Auto-save triggers      │
            │  Saves to database       │
            └──────────────────────────┘
```

---

## File Organization

```
qreatestudiosv1/
│
├── lib/
│   ├── templates/
│   │   ├── puck-templates.ts           ← Template definitions
│   │   └── landing-page-templates.ts   ← Old HTML (deprecated)
│   │
│   ├── puckConfig.tsx                  ← Component registration
│   └── resolvePageContent.ts           ← Template fallback logic
│
├── app/
│   ├── dashboard/
│   │   └── landing-pages/
│   │       ├── create/
│   │       │   └── page.tsx            ← Template selector
│   │       │
│   │       └── [id]/
│   │           └── builder/
│   │               ├── page.tsx        ← Visual builder
│   │               ├── builder.css     ← Custom Puck styles
│   │               ├── error.tsx       ← Error page
│   │               └── loading.tsx     ← Loading state
│   │
│   ├── l/
│   │   └── [slug]/
│   │       └── page.tsx                ← Public page renderer
│   │
│   └── api/
│       └── landing-pages/
│           ├── route.ts                ← List/create
│           │
│           └── [id]/
│               ├── route.ts            ← Get/update/delete
│               └── publish/
│                   └── route.ts        ← Publish
│
├── components/
│   ├── sections/                       ← Puck section components
│   │   ├── HeroSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── GallerySection.tsx
│   │   ├── CTASection.tsx
│   │   ├── ContactSection.tsx
│   │   └── MenuSection.tsx
│   │
│   ├── puck/                           ← Custom Puck fields
│   │   ├── ImageField.tsx              ← Image picker
│   │   └── ImageArrayField.tsx         ← Multi-image picker
│   │
│   └── ImageBrowser.tsx                ← Image selection UI
│
├── prisma/
│   ├── schema.prisma                   ← Database schema
│   └── migrations/
│       └── add_puck_templates.sql      ← Template seed
│
├── scripts/
│   └── migrate-html-to-puck.ts         ← Migration tool
│
└── docs/
    ├── PROFESSIONAL_BUILDER_COMPLETE.md
    ├── BUILDER_QUICK_START_GUIDE.md
    ├── BUILDER_UPGRADE_SUMMARY.md
    └── BUILDER_ARCHITECTURE.md         ← This file
```

---

## Key Design Decisions

### 1. Puck JSON over HTML

**Why:**
- Structured, editable sections
- Full visual builder support
- Easy to extend
- Type-safe

**Trade-off:**
- More complex structure
- Migration needed for old pages

---

### 2. Templates in Code + Database

**Why:**
- Code: Version control, easy to add
- Database: Dynamic loading, user access

**Implementation:**
- Define in `puck-templates.ts`
- Seed to database via SQL
- Fetch from database in app

---

### 3. Draft vs Published Content

**Why:**
- Users can edit without affecting live page
- Preview before publishing
- Rollback capability

**Implementation:**
- `draftContent`: Working version
- `publishedContent`: Live version
- Publish button copies draft → published

---

### 4. ImageField as Custom Component

**Why:**
- Rich image browsing experience
- Stock library + Unsplash search
- Consistent across all sections

**Implementation:**
- Custom Puck field type
- Renders ImageBrowser component
- Updates via onChange callback

---

### 5. Template Fallback System

**Why:**
- Never show blank page
- Graceful degradation
- Support migration period

**Implementation:**
```typescript
// resolvePageContent.ts
content = 
  page.draftContent ||
  page.publishedContent ||
  template?.defaultSections ||
  { content: [], root: {} }
```

---

## Performance Optimizations

### 1. Image Loading
- Use Next.js Image component
- Lazy load images
- Responsive sizes

### 2. Auto-save Debouncing
- 3-second delay
- Prevents excessive API calls
- Cancels pending on new change

### 3. Puck Lazy Loading
```typescript
const Puck = dynamic(
  () => import('@measured/puck'),
  { ssr: false }
);
```

### 4. Template Caching
- Templates loaded once
- Stored in module scope
- No repeated parsing

---

## Security Considerations

### 1. User Authentication
- All API routes check session
- User can only edit their pages

### 2. Data Validation
- Validate Puck structure
- Sanitize user input
- Check template exists

### 3. Published Content
- Public pages read-only
- No edit capabilities
- Safe to cache

---

## Testing Strategy

### 1. Unit Tests
- Template structure validation
- Section component rendering
- ImageField functionality

### 2. Integration Tests
- Template selection flow
- Page creation
- Builder loading
- Auto-save

### 3. E2E Tests
- Complete user flow
- Template → Edit → Publish
- Public page rendering

---

## Future Architecture

### Phase 1: Enhanced Image Management
```
ImageField
├── Stock Library (✅ Done)
├── Unsplash Search (✅ Done)
├── Upload (Vercel Blob)
└── User Library (Save favorites)
```

### Phase 2: Template Marketplace
```
Templates
├── Built-in (Free)
├── Premium (Paid)
├── Community (User-created)
└── AI-generated
```

### Phase 3: Collaboration
```
LandingPage
├── Owner
├── Collaborators []
├── Comments []
└── Version History []
```

---

**This architecture delivers a production-ready, professional landing page builder!** 🎉
