# Qreate Studios Design System

## Overview
This document outlines the consistent design system used across the entire Qreate Studios application, from the landing page to the dashboard and all internal pages.

---

## Color Palette

### Primary Colors
- **Dark Backgrounds**:
  - `slate-950` - Primary dark background
  - `slate-900` - Secondary dark background
  - `slate-800` - Tertiary backgrounds

### Accent Gradients
- **Blue → Purple**: `from-blue-500 to-purple-500` (QR Codes, Primary CTA)
- **Purple → Pink**: `from-purple-500 to-pink-500` (Landing Pages)
- **Pink → Orange**: `from-pink-500 to-orange-500` (Analytics)
- **Orange → Red**: `from-orange-500 to-red-500` (Orders)

### Text Colors
- **Primary**: `text-white` - Main headings
- **Secondary**: `text-slate-200` - Subheadings
- **Muted**: `text-slate-300` - Body text
- **Subtle**: `text-slate-400` - Helper text

### Gradient Text
```tsx
className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
```

---

## Typography

### Headings
- **H1 (Hero)**: `text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold`
- **H1 (Page)**: `text-2xl lg:text-4xl font-bold`
- **H2**: `text-xl lg:text-2xl font-bold`
- **H3**: `text-lg lg:text-xl font-semibold`

### Body Text
- **Large**: `text-lg sm:text-xl md:text-2xl`
- **Regular**: `text-base`
- **Small**: `text-sm`
- **Extra Small**: `text-xs`

---

## Components

### Cards

#### Standard Card (Dashboard)
```tsx
<Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all">
  {/* Content */}
</Card>
```

#### Stat Card with Gradient Icon
```tsx
<Card className="relative overflow-hidden bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/10 transition-all">
  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-0 hover:opacity-5 transition-opacity" />
  <CardHeader className="relative z-10">
    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
      <Icon className="h-4 w-4 text-white" />
    </div>
  </CardHeader>
</Card>
```

### Buttons

#### Primary (Gradient)
```tsx
<Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30">
  {/* Content */}
</Button>
```

#### Secondary (Outline)
```tsx
<Button
  variant="outline"
  className="border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200 hover:text-white hover:border-purple-500"
>
  {/* Content */}
</Button>
```

---

## Animations

### Framer Motion Patterns

#### Fade In from Bottom
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Content */}
</motion.div>
```

#### Staggered Animation
```tsx
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    {/* Content */}
  </motion.div>
))}
```

#### Hover Scale
```tsx
<motion.div
  whileHover={{ scale: 1.02, y: -2 }}
  whileTap={{ scale: 0.98 }}
>
  {/* Content */}
</motion.div>
```

#### Slide In from Side
```tsx
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5, delay: 0.4 }}
>
  {/* Content */}
</motion.div>
```

---

## Backgrounds

### Main Layout Background
```tsx
<div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
  {/* Content */}
</div>
```

### Animated Gradient Overlay
```tsx
<div className="fixed inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 animate-gradient pointer-events-none" />
```

### Section Background
```tsx
<section className="relative py-20 px-4 overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-gradient" />
  <div className="relative z-10">
    {/* Content */}
  </div>
</section>
```

---

## Shadows

### Card Shadows
- **Default Hover**: `hover:shadow-lg hover:shadow-blue-500/10`
- **Purple Variant**: `hover:shadow-lg hover:shadow-purple-500/10`
- **Pink Variant**: `hover:shadow-lg hover:shadow-pink-500/10`

### Button Shadows
- **Primary**: `shadow-lg shadow-blue-500/30`
- **Success**: `shadow-lg shadow-green-500/30`
- **Danger**: `shadow-lg shadow-red-500/30`

---

## Layout Patterns

### Container
```tsx
<div className="container max-w-7xl mx-auto py-4 px-4 lg:py-8">
  {/* Content */}
</div>
```

### Grid Layouts

#### Stats Grid (Responsive)
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
  {/* Cards */}
</div>
```

#### Two Column
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
  {/* Cards */}
</div>
```

---

## Badges & Pills

### Gradient Badge
```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
  <Sparkles className="h-4 w-4 text-blue-400" />
  <span className="text-sm text-blue-300 font-medium">Powered by GPT-4o</span>
</div>
```

### Number Badge
```tsx
<span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-xs">
  1
</span>
```

---

## Icons

### Standard Icon Sizes
- **Small**: `h-4 w-4`
- **Medium**: `h-5 w-5`
- **Large**: `h-6 w-6`

### Icon in Gradient Container
```tsx
<div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
  <Icon className="h-4 w-4 text-white" />
</div>
```

---

## States

### Hover Effects
- **Cards**: Scale up slightly (`scale: 1.02`) and lift (`y: -2`)
- **Buttons**: Darken gradient colors
- **Links**: Change color to accent

### Active States
- **Buttons**: Scale down (`scale: 0.98`)
- **Cards**: Apply gradient overlay with low opacity

### Loading States
- Use skeleton screens with shimmer animation
- Disable interaction during loading

---

## Accessibility

### Focus Indicators
```css
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### Skip Links
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
>
  Skip to main content
</a>
```

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Use `<main>`, `<nav>`, `<section>` appropriately
- Include ARIA labels where needed

---

## Responsive Design

### Breakpoints (Tailwind)
- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `md:` (≥ 768px)
- **Large**: `lg:` (≥ 1024px)
- **XL**: `xl:` (≥ 1280px)

### Mobile-First Approach
```tsx
className="text-sm lg:text-base"  // Mobile first, then larger
className="grid-cols-2 lg:grid-cols-4"  // 2 cols mobile, 4 desktop
className="px-4 lg:px-8"  // Smaller padding mobile
```

---

## Custom Animations (CSS)

### Gradient Animation
```css
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  animation: gradient-shift 8s ease infinite;
  background-size: 200% 200%;
}
```

### Float Animation
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
```

---

## Implementation Checklist

When creating a new page or component:

- [ ] Use dark slate backgrounds (`bg-slate-950`, `bg-slate-900`)
- [ ] Add animated gradient overlay for visual interest
- [ ] Apply consistent card styling with glass-morphism
- [ ] Use gradient accents for important elements
- [ ] Implement Framer Motion animations for entrance
- [ ] Add hover states with scale and shadow effects
- [ ] Ensure text uses appropriate slate colors
- [ ] Test on mobile, tablet, and desktop breakpoints
- [ ] Add proper accessibility features (focus, ARIA, semantic HTML)
- [ ] Use consistent spacing (padding, gaps)

---

## Examples

### Landing Page
✅ Full implementation with all design system elements

### Dashboard
✅ Consistent dark theme with gradient overlays
✅ Animated stat cards with gradient icons
✅ Smooth entrance animations
✅ Hover effects on all interactive elements

### Future Pages
Apply the same patterns from landing and dashboard to:
- Pricing page
- Auth pages (signin/signup)
- Settings pages
- Analytics pages
- All other dashboard pages

---

**Last Updated**: January 19, 2026
**Version**: 1.0.0
**Status**: ✅ Core pages implemented
