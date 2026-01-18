# 🎨 Visual Landing Page Editor - Complete Guide

**Status:** ✅ FULLY ENABLED FOR ALL USERS

---

## 🚀 What's New

The **premium visual editor** is now available to ALL users from initial landing page creation! You can now:

✅ Add unlimited sections to your landing pages  
✅ Drag and drop components anywhere  
✅ Add images, text, galleries, and more  
✅ Customize every element visually  
✅ No code required  

---

## 📋 Complete Workflow

### 1. Sign Up
- Create your account at `/auth/signup`
- Confirm your email
- Sign in at `/auth/signin`

### 2. Create QR Code (Optional)
- Go to **Dashboard → QR Codes → Create QR Code**
- Choose your QR type (URL, vCard, WiFi, etc.)
- Configure your QR code settings
- **Link to Landing Page** → This will create both QR + Landing Page

### 3. Create Landing Page

#### From Dashboard:
- Go to **Dashboard → Landing Pages → Create Landing Page**
- Or click **Create Landing Page** button

#### From QR Creation:
- After creating a QR code
- Click **Create Landing Page** to link it

### 4. Choose Template
- Browse 10+ professional templates
- Filter by category (Restaurant, Real Estate, Events, etc.)
- Click **Use Template** to select
- Templates are starting points - you can modify everything!

### 5. Name Your Page
- Enter a **Page Name** (for your reference)
- Set a **Custom URL** slug (e.g., `my-restaurant`)
- Preview your final URL
- Click **Create & Open Visual Editor**

### 6. Visual Editor Features

#### 🎯 The Premium Editor Opens Automatically

When you create a landing page, you immediately get the full **Puck.js Visual Builder** with:

#### **Left Sidebar - Component Library**
Add any of these sections to your page:

**Headers:**
- 🎭 **HeroSection** - Full-screen hero with background image
  - Headline, subheadline, CTA button
  - Background image with overlay
  - Text alignment options
  - Custom height control

**Content:**
- ⭐ **FeaturesSection** - Feature highlights with icons
  - 2, 3, or 4 column layouts
  - Lucide icon support
  - Card, minimal, or bordered styles
  
- 🍽️ **MenuSection** - Restaurant menu display
  - Tabs, grid, or list layouts
  - Auto-loads from your menu database
  
- 🖼️ **GallerySection** - Image galleries
  - 2, 3, or 4 columns
  - Square, landscape, or portrait ratios
  - Lightbox on click

**Actions:**
- 📱 **QRCodeSection** - QR code display
  - Minimal, framed, or branded styles
  - Scan instructions
  - Device icons
  
- 🎯 **CTASection** - Call-to-action banners
  - Primary and secondary buttons
  - Background images or colors
  - Default, centered, or split layouts
  
- 📍 **ContactSection** - Contact information
  - Address, phone, email, hours
  - Optional map embed

#### **Canvas - Visual Editing**
- Click any section to select it
- Drag sections to reorder them
- Delete sections with the trash icon
- Add new sections by clicking components

#### **Right Sidebar - Properties**
Every section has customizable properties:
- Text fields (headlines, descriptions)
- Color pickers
- Image browsers
- Select dropdowns
- Toggle switches
- Array editors (for lists)

#### **Top Bar - Actions**
- 🔙 **Back** - Return to landing pages list
- 👁️ **Preview** - Open preview in new tab
- 💾 **Save Draft** - Manual save
- ✨ **Publish** - Make page live

#### **Auto-Save**
- Changes save automatically after 2 seconds
- "Unsaved changes" indicator
- "Saving..." indicator when active
- "Saved just now" confirmation

---

## 🎨 Adding & Customizing Sections

### How to Add Sections

1. **Open the Visual Editor**
   - Create a new landing page OR
   - Click **Visual Editor** on an existing page

2. **Browse Components** (Left Sidebar)
   - Expand categories: Headers, Content, Actions
   - Click any component name to see preview

3. **Add to Canvas**
   - Click a component (e.g., "HeroSection")
   - It appears on the canvas immediately
   - Positioned at the bottom by default

4. **Reorder Sections**
   - Click and drag the section handle
   - Drop it in the desired position
   - Sections reorder instantly

5. **Customize Content**
   - Click the section on canvas to select it
   - Right sidebar shows all properties
   - Edit text, colors, images, etc.
   - Changes appear in real-time

### Example: Building a Restaurant Page

```
1. Add HeroSection
   - Upload hero image (restaurant interior)
   - Set headline: "Welcome to Bella's Italian"
   - Set CTA: "View Our Menu"

2. Add FeaturesSection
   - Add 3 features:
     * Fresh Ingredients (Utensils icon)
     * Expert Chefs (ChefHat icon)
     * Family Recipes (Heart icon)
   - Choose 3-column layout

3. Add MenuSection
   - Select "Tabs" display style
   - Menu items load from database

4. Add GallerySection
   - Upload 6 food photos
   - Choose 3-column grid
   - Enable lightbox

5. Add QRCodeSection
   - Upload your QR code image
   - Set title: "Scan to Order"
   - Choose "branded" style

6. Add CTASection
   - Primary button: "Order Now"
   - Secondary button: "Make Reservation"
   - Add background image

7. Add ContactSection
   - Enter address, phone, email
   - Add business hours
   - Embed Google Maps
```

---

## 🖼️ Image Management

### Adding Images

Every section with images has a built-in image browser:

1. **Click Image Field** in properties
2. **Image Browser Opens** with:
   - Upload tab (drag & drop or browse)
   - Unsplash tab (search stock photos)
   - Recent uploads

3. **Select Image**
   - Click to select
   - Image URL auto-fills
   - Preview updates immediately

4. **Image Optimization**
   - Auto-compressed on upload
   - Responsive srcsets
   - Lazy loading
   - BlurHash placeholders

---

## 💾 Saving & Publishing

### Draft vs Published

**Draft Content:**
- Saved automatically every 2 seconds
- Only visible to you
- Can preview with `?preview=true` parameter
- Editable at any time

**Published Content:**
- Visible to everyone at `/l/your-slug`
- Indexed by search engines
- Used by linked QR codes
- Requires explicit "Publish" action

### Publishing Workflow

1. **Edit Your Page**
   - Make all desired changes
   - Wait for auto-save ("Saved just now")

2. **Preview**
   - Click **Preview** button
   - Opens in new tab
   - Check on mobile and desktop

3. **Publish**
   - Click **Publish** button
   - Confirms draft → published
   - Redirects to landing pages list
   - Page is now live!

4. **Update Published Page**
   - Edit your page again
   - Make changes (saved as draft)
   - Click **Publish** to update live version

---

## 🖨️ Print Flow

### Creating Print-Ready Pages

1. **Design Your Page** in visual editor
2. **Publish** the page
3. **Go to Dashboard → Print Orders**
4. **Create Print Order**
   - Select your landing page
   - Choose print specs (size, quantity)
   - Add QR code (optional)
   - Submit order

---

## 🔧 Advanced Features

### Custom Styling

Each section supports:
- Background colors
- Background images with overlays
- Text alignment (left, center, right)
- Column layouts (2, 3, 4 columns)
- Spacing and padding
- Border styles

### Responsive Design

All sections are mobile-responsive:
- Automatic layout adjustments
- Stacked columns on mobile
- Touch-friendly buttons
- Optimized images

### SEO Optimization

- Meta titles and descriptions
- Open Graph images
- Semantic HTML structure
- Fast page loads
- Mobile-first design

---

## 📱 Mobile Editing

The visual editor works on tablets and large phones:
- Touch-friendly interface
- Drag and drop on touch screens
- Responsive preview
- All features available

---

## 🆘 Troubleshooting

### "Changes aren't saving"
- Check auto-save indicator (top right)
- Wait 2 seconds for auto-save
- Click **Save Draft** manually
- Check your internet connection

### "Can't add sections"
- Ensure you're in the builder (`/builder` URL)
- Check left sidebar is open
- Click component name (not just hover)
- Refresh page if needed

### "Images not uploading"
- Check file size (max 10MB)
- Use JPG, PNG, or WebP formats
- Check internet connection
- Try Unsplash search instead

### "Preview shows old content"
- Wait for "Saved just now" indicator
- Hard refresh preview (Ctrl+Shift+R)
- Clear browser cache

### "Published page not updating"
- Edit your page
- Wait for auto-save
- Click **Publish** button (required!)
- Check live URL after publish

---

## 🎓 Tips & Best Practices

### Design Tips

1. **Start with Template**
   - Choose template closest to your vision
   - Customize from there
   - Saves time and ensures good structure

2. **Hero First**
   - HeroSection should be compelling
   - Clear headline (8 words or less)
   - Strong CTA button
   - High-quality background image

3. **Keep It Simple**
   - 5-7 sections is ideal
   - Too many sections = overwhelming
   - Focus on key messages

4. **Visual Hierarchy**
   - Hero → Features → Content → CTA
   - Alternate content types
   - Use whitespace effectively

5. **Mobile First**
   - Check mobile preview often
   - Shorter headlines for mobile
   - Larger touch targets (min 44px)

### Content Tips

1. **Headlines**
   - Clear benefit statements
   - Action-oriented
   - Emotionally resonant

2. **Images**
   - High quality only
   - Consistent style/theme
   - Optimized for web
   - Show real products/people

3. **CTAs**
   - One primary action per section
   - Clear action words (Get, Try, Join)
   - Contrasting colors
   - Always visible

4. **Copy**
   - Scan-friendly (bullets, short paragraphs)
   - Benefit-focused (not feature-focused)
   - Address customer pain points

### Performance Tips

1. **Images**
   - Upload optimized images (already compressed)
   - Use Unsplash for stock photos (pre-optimized)
   - Avoid uploading raw camera files
   - WebP format when possible

2. **Sections**
   - Only add what you need
   - Delete unused sections
   - Avoid duplicate content

3. **Testing**
   - Test on real devices
   - Use different browsers
   - Check page speed
   - Validate on mobile

---

## ✅ Feature Checklist

### What You Can Do Now

- [x] Create unlimited landing pages
- [x] Add unlimited sections to pages
- [x] Drag and drop to reorder
- [x] Add images from upload or Unsplash
- [x] Customize all text and colors
- [x] Preview before publishing
- [x] Auto-save every 2 seconds
- [x] Publish to make live
- [x] Link to QR codes
- [x] Create print orders
- [x] Track views and analytics
- [x] Custom URL slugs
- [x] Responsive mobile design
- [x] SEO optimization built-in

---

## 🎉 You're Ready!

The premium visual editor gives you complete control over your landing pages. No coding required, just creativity!

**Next Steps:**
1. Sign up or sign in
2. Create your first landing page
3. Choose a template
4. Open the visual editor
5. Add sections and customize
6. Preview and publish
7. Share your page!

**Need Help?**
- Check this guide
- Preview templates for inspiration
- Reach out to support

---

**Happy Building! 🚀**
