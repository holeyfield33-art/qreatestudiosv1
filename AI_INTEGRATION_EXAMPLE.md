# AI Integration Example: QR Code Details Page

This example shows how to add AI features to an existing QR code editing page.

## Before (Without AI)

```tsx
// app/dashboard/qr-codes/[id]/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function QRCodeDetailsPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetUrl, setTargetUrl] = useState('');

  return (
    <div className="space-y-6">
      <h1>Edit QR Code</h1>
      
      <div>
        <label>Name</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter QR code name"
        />
      </div>

      <div>
        <label>Description</label>
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          rows={4}
        />
      </div>

      <div>
        <label>Target URL</label>
        <Input 
          value={targetUrl} 
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <Button>Save Changes</Button>
    </div>
  );
}
```

## After (With AI)

```tsx
// app/dashboard/qr-codes/[id]/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AIFeatureButton } from '@/components/ai/AIFeatureButton'; // ✨ NEW
import { Sparkles } from 'lucide-react'; // ✨ NEW

export default function QRCodeDetailsPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetUrl, setTargetUrl] = useState('');

  return (
    <div className="space-y-6">
      <h1>Edit QR Code</h1>
      
      <div>
        <label>Name</label>
        <div className="flex gap-2">
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter QR code name"
            className="flex-1"
          />
          {/* ✨ NEW: AI name generation button */}
          <AIFeatureButton
            feature="name_qr"
            prompt={`Generate a creative name for a QR code that links to: ${targetUrl}. Description: ${description || 'No description yet'}`}
            context={{ 
              qrType: 'URL', 
              targetUrl,
              description 
            }}
            onComplete={(result) => setName(result)}
            label={<Sparkles className="h-4 w-4" />}
            variant="outline"
          />
        </div>
      </div>

      <div>
        <label>Description</label>
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          rows={4}
        />
        {/* ✨ NEW: AI description optimization button */}
        <div className="mt-2">
          <AIFeatureButton
            feature="optimize_qr"
            prompt={description || 'Create a compelling description for this QR code'}
            context={{ 
              qrType: 'URL', 
              targetUrl,
              currentDescription: description 
            }}
            onComplete={(result) => setDescription(result)}
            label="✨ Optimize with AI"
            variant="outline"
            disabled={!targetUrl}
          />
        </div>
      </div>

      <div>
        <label>Target URL</label>
        <Input 
          value={targetUrl} 
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      {/* ✨ NEW: AI design suggestions section */}
      {targetUrl && (
        <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-blue-50">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Design Suggestions
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Get personalized design recommendations for your QR code
          </p>
          <AIFeatureButton
            feature="suggest_qr_design"
            prompt={`Suggest design improvements for a QR code that links to: ${targetUrl}. Context: ${description || 'General purpose QR code'}`}
            context={{ 
              qrType: 'URL', 
              targetUrl,
              description 
            }}
            onComplete={(suggestions) => {
              // Show suggestions in a modal or alert
              alert(suggestions);
            }}
            label="Get Design Ideas"
            variant="default"
          />
        </div>
      )}

      <Button>Save Changes</Button>
    </div>
  );
}
```

## Key Changes

### 1. Import AI Components
```tsx
import { AIFeatureButton } from '@/components/ai/AIFeatureButton';
import { Sparkles } from 'lucide-react';
```

### 2. Add AI Button Next to Name Input
- Generates creative QR code names
- Uses current URL and description as context
- Sets the name field directly when complete

### 3. Add Optimization Button Below Description
- Enhances existing descriptions
- Disabled until URL is entered (needs context)
- Replaces current description with optimized version

### 4. Add Design Suggestions Section
- Only shows when URL is entered
- Provides AI-powered design recommendations
- Beautiful gradient background matches AI Studio theme

## User Experience Flow

1. **User enters target URL**
   - AI features become available

2. **User clicks "✨ Optimize with AI"**
   - Loading spinner appears
   - AI generates improved description
   - Description field updates automatically

3. **User clicks sparkle icon next to name**
   - AI generates creative name options
   - Name field updates automatically

4. **User clicks "Get Design Ideas"**
   - AI analyzes URL and context
   - Provides specific design recommendations
   - User can implement suggestions manually

## Cost Analysis

Per QR code edit with AI:
- Name generation: ~200 tokens = $0.001
- Description optimization: ~300 tokens = $0.0015
- Design suggestions: ~400 tokens = $0.002

**Total: ~$0.005 per QR code**

With 100 credits/month on Pro plan:
- Can optimize 100 QR codes
- Total cost: ~$0.50/month in AI usage
- Huge value for users!

## A/B Testing Results (Hypothetical)

### Without AI
- Average time per QR: 5 minutes
- Description quality: 6/10
- User satisfaction: 7/10

### With AI
- Average time per QR: 2 minutes ⬇️60%
- Description quality: 8.5/10 ⬆️42%
- User satisfaction: 9/10 ⬆️29%

## Additional Integration Ideas

### 1. Bulk AI Processing
```tsx
<Button onClick={async () => {
  for (const qr of selectedQRCodes) {
    await callAI(userId, 'optimize_qr', qr.description);
  }
}}>
  ✨ Optimize {selectedQRCodes.length} QR Codes
</Button>
```

### 2. AI-Powered QR Templates
```tsx
<AIFeatureButton
  feature="generate_landing_page"
  prompt={`Create a landing page template for: ${businessType}`}
  onComplete={(template) => createQRWithLandingPage(template)}
  label="✨ Create QR + Landing Page"
/>
```

### 3. Smart Suggestions Based on URL
```tsx
useEffect(() => {
  if (targetUrl && !description) {
    // Auto-suggest description based on URL
    const suggestions = await callAI(
      userId,
      'optimize_qr',
      `Suggest a description for: ${targetUrl}`
    );
    setDescriptionPlaceholder(suggestions);
  }
}, [targetUrl]);
```

### 4. Context-Aware Help
```tsx
{errorMessage && (
  <AIFeatureButton
    feature="suggest_improvements"
    prompt={`User is getting this error: ${errorMessage}. Help them fix it.`}
    onComplete={(help) => setHelpMessage(help)}
    label="✨ Get AI Help"
    variant="ghost"
  />
)}
```

## Best Practices

### ✅ Do's
- Provide context (URL, description, type)
- Disable AI buttons until required fields are filled
- Show loading states during AI processing
- Allow users to edit AI-generated content
- Track which AI features are most popular

### ❌ Don'ts
- Don't call AI on every keystroke (expensive!)
- Don't replace user input without confirmation
- Don't hide traditional input methods
- Don't make AI features feel "magic" without explanation
- Don't forget error handling

## Accessibility

Ensure AI features are accessible:

```tsx
<AIFeatureButton
  feature="optimize_qr"
  prompt={description}
  onComplete={(result) => setDescription(result)}
  label="Optimize with AI"
  aria-label="Use artificial intelligence to improve your QR code description"
  className="focus-visible:ring-2 focus-visible:ring-purple-500"
/>
```

## Mobile Optimization

Make AI buttons touch-friendly:

```tsx
<AIFeatureButton
  feature="name_qr"
  // ... other props
  className="min-h-[44px] px-4" // Large enough for touch
/>
```

---

This example demonstrates how easily AI can be integrated into existing pages with minimal code changes and maximum user value!
