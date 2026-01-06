# 🚀 AI System Quick Start Guide

## For Users

### Accessing AI Features

1. **Check Your Credits**
   - Look at the top-right corner of the dashboard
   - You'll see your AI credits displayed with a sparkle icon (✨)
   - Click on it to go to AI Studio

2. **AI Studio Hub** (`/dashboard/ai-studio`)
   - Central location for all AI features
   - 5 main categories:
     - 🎯 QR Code Tools
     - 📄 Landing Page Tools  
     - 🎨 Branding Tools
     - ✍️ Content Creation
     - 📊 Analytics Insights

3. **Specialized Studios**
   - **Branding Studio** (`/dashboard/branding`)
     - Generate business names
     - Create logo concepts
     - Design color palettes
     - Write taglines
   
   - **Content Studio** (`/dashboard/content`)
     - Write blog posts
     - Create social media captions
     - Generate email marketing copy
     - Brainstorm content ideas

### Using AI in Your Workflow

#### QR Code Creation
When creating a QR code, click "✨ Optimize with AI" to:
- Enhance your description
- Generate creative names
- Get design suggestions

#### Landing Page Building
Use AI to:
- Generate full page structure
- Write compelling copy
- Optimize for SEO
- Suggest images

#### Analytics Review
Get AI-powered insights:
- Performance analysis
- Trend predictions
- Improvement suggestions

### Understanding Your Plan

**Free Plan**
- 0 AI credits/month
- Upgrade to unlock AI features

**Pro Plan - $49/month**
- 100 AI requests/month
- Resets on the 1st of each month
- Perfect for individuals

**Business Plan - $149/month**
- 500 AI requests/month
- Resets on the 1st of each month
- Perfect for teams

**Agency Plan - Custom**
- Unlimited AI requests
- No reset needed
- Perfect for high-volume users

### Tips for Best Results

1. **Be Specific**
   - ✅ Good: "Generate 20 names for a modern coffee shop in Seattle"
   - ❌ Bad: "Generate names"

2. **Provide Context**
   - Include industry, target audience, goals
   - More context = better results

3. **Iterate**
   - Try different variations
   - Combine AI suggestions with your expertise

4. **Save Your Favorites**
   - Copy results you like
   - Use them as inspiration for future requests

---

## For Developers

### Quick Integration

#### 1. Add AI Button to Any Form

```tsx
import { AIFeatureButton } from '@/components/ai/AIFeatureButton';

<AIFeatureButton
  feature="optimize_qr"
  prompt={description}
  context={{ qrType, targetUrl }}
  onComplete={(result) => setDescription(result)}
  label="✨ Optimize with AI"
/>
```

#### 2. Available AI Features

```typescript
'optimize_qr'           // Enhance QR descriptions
'suggest_qr_design'     // QR design recommendations
'name_qr'               // Generate QR names
'generate_landing_page' // Create page structure
'write_copy'            // Marketing copywriting
'suggest_images'        // Stock photo recommendations
'optimize_seo'          // SEO optimization
'generate_names'        // Business name ideas
'generate_logo_concepts'// Logo design concepts
'generate_colors'       // Brand color palettes
'generate_taglines'     // Catchy taglines
'write_blog'            // Blog post generation
'write_social'          // Social media captions
'write_email'           // Email marketing copy
'brainstorm_ideas'      // Content ideation
'analyze_performance'   // Analytics insights
'predict_trends'        // Future predictions
'suggest_improvements'  // Recommendations
```

#### 3. Check Credits Before Feature

```typescript
import { getRemainingCredits } from '@/lib/ai/ai-service';

const credits = await getRemainingCredits(userId);
if (credits.remaining > 0 || credits.unlimited) {
  // Show AI features
} else {
  // Show upgrade prompt
}
```

#### 4. Call AI Service Directly

```typescript
import { callAI } from '@/lib/ai/ai-service';

try {
  const { result, creditsRemaining } = await callAI(
    userId,
    'optimize_qr',
    'Your prompt here',
    { context: 'data' }
  );
  
  console.log('AI Result:', result);
  console.log('Credits left:', creditsRemaining);
} catch (error) {
  if (error.message.includes('No AI credits')) {
    // Show upgrade dialog
  }
}
```

### Testing

#### Local Development

1. **Set OpenAI API Key**
   ```bash
   # .env
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Test with Pro Plan User**
   ```sql
   -- Grant test user Pro plan
   UPDATE "User" 
   SET aiUsageCount = 0
   WHERE email = 'test@example.com';
   
   -- Update subscription
   UPDATE "Subscription" 
   SET plan = 'PRO' 
   WHERE "userId" = 'user-id';
   ```

3. **Make Test Request**
   ```bash
   curl -X POST http://localhost:3000/api/ai/assistant \
     -H "Content-Type: application/json" \
     -d '{
       "feature": "optimize_qr",
       "prompt": "Test prompt"
     }'
   ```

#### Production Monitoring

```sql
-- Check daily AI usage
SELECT 
  feature,
  COUNT(*) as count,
  SUM(cost) as total_cost
FROM "AIUsage"
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY feature;
```

### Adding New AI Features

1. **Add to AI_FEATURES enum**
   ```typescript
   // lib/ai/ai-service.ts
   export enum AI_FEATURES {
     // ... existing
     MY_NEW_FEATURE = 'my_new_feature',
   }
   ```

2. **Add System Prompt**
   ```typescript
   function getSystemPrompt(feature: AI_FEATURES): string {
     const prompts = {
       // ... existing
       [AI_FEATURES.MY_NEW_FEATURE]: 
         'You are an expert at [specific task]. Generate...',
     };
     return prompts[feature] || prompts[AI_FEATURES.OPTIMIZE_QR];
   }
   ```

3. **Create UI Component**
   ```tsx
   <AIFeatureButton
     feature="my_new_feature"
     prompt={userInput}
     onComplete={(result) => handleResult(result)}
   />
   ```

4. **Test & Deploy**
   - Test with Pro plan user
   - Monitor costs and performance
   - Update documentation

### Troubleshooting

**"Module not found: @/components/ai/..."**
- Run: `npx prisma generate`
- Restart TypeScript server

**"No AI credits remaining"**
- Check user's plan in Subscription table
- Verify aiUsageCount and aiUsageResetDate
- Test credit reset logic

**"OpenAI API error"**
- Verify OPENAI_API_KEY in .env
- Check OpenAI account balance
- Review API key permissions

**Slow responses**
- Check prompt length (keep < 2000 chars)
- Use gpt-4o-mini instead of gpt-4o
- Add loading states to UI

---

## Support & Documentation

- **Full Documentation:** [AI_SYSTEM_COMPLETE.md](./AI_SYSTEM_COMPLETE.md)
- **API Reference:** See code comments in [lib/ai/ai-service.ts](./lib/ai/ai-service.ts)
- **Component Examples:** Check [components/ai/](./components/ai/)
- **Page Examples:** See [app/dashboard/branding/](./app/dashboard/branding/) and [app/dashboard/content/](./app/dashboard/content/)

---

**Status:** ✅ Production Ready

All AI features are live and ready to use!
