# Template Canvas Rendering - Quick Fix Guide

## 🚨 Problem
Canvas was **BLANK** when users selected templates → Users couldn't see what they were editing

## ✅ Solution
Fixed 4 critical issues:

### 1️⃣ API Not Saving Template Data
**File:** `app/api/landing-pages/route.ts`
```diff
- const { title, slug, content, theme } = body;
+ const { title, slug, content, theme, templateId, draftContent, metadata } = body;

  landingPage.create({
-   templateId: null,
-   draftContent: content || {},
+   templateId: templateId || null,
+   draftContent: draftContent || content || {},
+   metadata: metadata || theme || {},
  })
```

### 2️⃣ Missing Default Images
**File:** `lib/puckConfig.tsx`
```diff
  HeroSection: {
    defaultProps: {
      headline: 'Welcome to Our Restaurant',
+     backgroundImage: {
+       url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920',
+       alt: 'Restaurant interior',
+     },
    }
  }
```

### 3️⃣ No Template Fallback
**File:** `app/dashboard/landing-pages/[id]/builder/page.tsx`
```diff
  let content = page.draftContent || page.publishedContent;
  
+ // Load from template if empty
+ if (!content?.content?.length && page.Template?.defaultSections) {
+   content = page.Template.defaultSections;
+ }
```

### 4️⃣ Image Format Incompatibility
**Files:** `components/sections/HeroSection.tsx`, `CTASection.tsx`
```diff
- backgroundImage?: { url: string; alt: string };
+ backgroundImage?: { url: string; alt: string } | string;

+ // Normalize format
+ const bgImage = typeof backgroundImage === 'string' 
+   ? { url: backgroundImage, alt: 'Background' }
+   : backgroundImage;
```

---

## 🎯 What Users See Now

### Before ❌
```
┌─────────────────────────────┐
│                             │
│                             │
│     BLANK WHITE SCREEN      │
│                             │
│                             │
└─────────────────────────────┘
```

### After ✅
```
┌─────────────────────────────────────────┐
│  🌄 [Restaurant Hero Image Background]  │
│                                         │
│      Welcome to Fine Dining            │
│      Experience culinary excellence     │
│                                         │
│      [View Menu Button]                │
├─────────────────────────────────────────┤
│  ⭐ What Makes Us Special               │
│  🍴 Fresh | 👨‍🍳 Expert | ✨ Amazing      │
├─────────────────────────────────────────┤
│  📸 [Gallery: 3 Food Images]            │
├─────────────────────────────────────────┤
│  🎯 Ready to Experience Amazing Food?   │
│     [Order Now] [View Menu]            │
└─────────────────────────────────────────┘
```

---

## ⚡ Quick Test

1. Navigate to: `/dashboard/landing-pages`
2. Click: **"Create New Landing Page"**
3. Select: **"Restaurant Classic"** template
4. Enter name & slug → **Create**
5. **Result:** Canvas shows fully rendered page with images! ✨

---

## 📊 Changes Summary

| Component | Issue | Fix | Status |
|-----------|-------|-----|--------|
| API Route | Not accepting template data | Added templateId, draftContent params | ✅ |
| Puck Config | No default images | Added Unsplash URLs | ✅ |
| Builder | No fallback loading | Check Template.defaultSections | ✅ |
| Components | Type mismatch | Support string OR object | ✅ |

---

## 🔍 Verify Fix Works

### Check Database
```sql
SELECT id, name, "templateId", "draftContent" 
FROM "LandingPage" 
WHERE "templateId" IS NOT NULL
LIMIT 1;
```
Should show: `draftContent` with `content` array containing sections

### Check Browser Console
When loading builder, should see:
```
Loading template default sections: {
  content: [
    { type: 'HeroSection', props: { ... with images ... } },
    { type: 'FeaturesSection', props: { ... } },
    ...
  ]
}
```

### Check Canvas
- Hero section background image loads
- Gallery shows 3 food images
- CTA section has background
- All text is visible and styled

---

## 🎉 Success!

**The canvas now renders templates immediately with:**
- ✅ Background images from Unsplash
- ✅ Default text and headlines
- ✅ Styled sections and layouts
- ✅ Clickable, editable components
- ✅ Real-time WYSIWYG preview

**No more blank screen!** 🚀
