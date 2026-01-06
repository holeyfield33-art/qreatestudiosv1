# AI-Powered QR Code Optimization Feature

## Overview
Intelligent QR code optimization assistant powered by GPT-4 that analyzes performance data and provides actionable improvement suggestions with usage tracking and plan-based limits.

## Features

### 🤖 AI Assistant
- **Goal-driven analysis**: Users describe their objectives
- **Data-driven insights**: Analyzes scan patterns, devices, locations, and timing
- **Actionable recommendations**: Specific, implementable improvements
- **Impact estimation**: Predicts expected performance gains
- **Priority ranking**: Organizes suggestions by importance

### 📊 Analytics Integration
- Fetches real-time QR code performance data
- Analyzes device breakdown (mobile/desktop/tablet)
- Reviews geographic distribution
- Examines temporal patterns
- Calculates key metrics (return rate, avg daily scans, mobile %)

### 💳 Plan-Based Limits
```typescript
const AI_LIMITS = {
  free: 0,           // Not available
  pro: 50,           // 50 optimizations/month
  business: 200,     // 200 optimizations/month
  agency: -1,        // Unlimited
};
```

### 🔒 Usage Tracking
- Real-time credit monitoring
- Monthly reset cycle
- Token usage logging
- Cost tracking for analytics

### ✨ User Experience
- Beautiful gradient design (purple → pink)
- Animated progress steps
- Real-time credit display
- Friendly, encouraging tone
- Upgrade prompts for free users

## Architecture

### Files Created

#### 1. `/lib/ai/qr-optimizer.ts`
Core AI optimization logic:
- `analyzeQRPerformance(qrCodeId)` - Fetch and analyze QR data
- `generateOptimizations(data, goal)` - Call OpenAI for suggestions
- `checkAICredits(userId)` - Verify remaining credits
- `trackOptimizationUsage(userId, qrId)` - Log usage
- `formatSuggestions(response)` - Add icons and formatting

#### 2. `/app/api/ai/optimize-qr/route.ts`
API endpoint:
- **POST**: Generate optimizations
  - Validates ownership
  - Checks credit limits
  - Returns formatted suggestions
  - Tracks usage
- **GET**: Fetch current credits (moved to separate endpoint)

#### 3. `/app/api/ai/credits/route.ts`
Credits management:
- **GET**: Return user's AI credit status
  - Current plan
  - Monthly limit
  - Used count
  - Remaining credits

#### 4. `/components/qr/AIOptimizationDialog.tsx`
Interactive modal component:
- Goal input textarea
- Animated progress steps (3 phases)
- Before/After score comparison
- Improvement cards with impact badges
- Next steps checklist
- Upgrade prompts for free users
- Credits display

#### 5. Updated `/app/dashboard/qr-codes/[id]/page.tsx`
QR details page integration:
- Added AI Optimize button
- Fetches user's AI credits
- Opens optimization dialog
- Refreshes credits after use

## User Flow

### 1. Open AI Dialog
```
User clicks "AI Optimize" button (with sparkles ✨)
→ Modal opens showing credit count and plan badge
```

### 2. Describe Goal
```
User enters: "I want more scans from mobile users at my restaurant"
→ Validates input, checks credits
```

### 3. Analysis Phase (Animated)
```
Step 1: 🔍 Analyzing scan patterns...
Step 2: 📊 Reviewing performance data...
Step 3: 💡 Generating recommendations...
```

### 4. View Results
```
┌─────────────────────────────────────┐
│  Current Score: 65  →  Potential: 85│
│         +25-30% estimated            │
└─────────────────────────────────────┘

✅ Improvements:
• 🔗 Shorten URL from 87 to 23 chars
  Impact: HIGH
  → +15% faster page loads

• 📱 Add mobile landing page
  Impact: HIGH
  → +25% mobile conversion

• ⏰ Optimize posting times
  Impact: MEDIUM
  → Post 11am-2pm for +10% scans

📋 Next Steps:
1. Update QR destination URL
2. Create mobile-friendly page
3. Schedule social posts strategically
```

### 5. Apply or Try Again
```
Options:
- "Done" - Close and apply learnings
- "Try Another Goal" - Reset and analyze again
```

## API Request/Response

### POST /api/ai/optimize-qr

**Request:**
```json
{
  "qrCodeId": "qr_abc123",
  "userGoal": "I want more scans from mobile users at my restaurant"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "optimizations": {
    "improvements": [
      {
        "issue": "Long URL reduces scan speed",
        "suggestion": "Shorten to 23 characters maximum",
        "impact": "high",
        "icon": "🔗",
        "description": "Shorter URLs load 40% faster on mobile"
      }
    ],
    "estimatedIncrease": "25-30%",
    "priority": ["Shorten URL", "Add mobile page", "Optimize timing"],
    "nextSteps": ["Update destination", "Create landing page", "Test mobile"],
    "beforeScore": 65,
    "afterScore": 85
  },
  "qrCode": {
    "id": "qr_abc123",
    "name": "Restaurant Menu",
    "scans": 147
  },
  "credits": {
    "remaining": 49,
    "limit": 50,
    "plan": "pro"
  }
}
```

**Insufficient Credits (403):**
```json
{
  "error": "No AI optimization credits remaining",
  "plan": "pro",
  "limit": 50,
  "used": 50,
  "upgradeRequired": true
}
```

**Insufficient Data (200):**
```json
{
  "error": "Insufficient data",
  "message": "This QR code needs at least a few scans...",
  "suggestions": [
    {
      "issue": "No scan data yet",
      "suggestion": "Share your QR code to gather data",
      "impact": "high",
      "icon": "📊",
      "description": "AI works best with real usage data"
    }
  ]
}
```

## OpenAI Integration

### Model: GPT-4 Turbo Preview
- More capable reasoning
- JSON mode for structured output
- Cost-effective for analysis tasks

### Prompt Structure
```
System: You are a QR code optimization expert...

User: Analyze this QR code:
- Name: Restaurant Menu
- Type: url
- URL: https://example.com/very-long-url-path...
- Total Scans: 147
- Mobile Users: 78%
- Return Rate: 12%
- Recent Activity: Yes
- Detected Issues: long_url, mobile_unfriendly

Goal: I want more scans from mobile users

Provide JSON with improvements, estimates, priorities, next steps...
```

### Response Format
Enforces JSON structure for reliability:
- Improvements array with issue/suggestion/impact
- Estimated percentage increase
- Priority list (most important first)
- Actionable next steps
- Before/after scores (0-100)

## Plan Limit Enforcement

### Check Credits Before Analysis
```typescript
const credits = await checkAICredits(userId);
if (!credits.hasCredits) {
  return 403 with upgrade prompt
}
```

### Track Usage After Success
```typescript
await trackOptimizationUsage(userId, qrCodeId);
// Increments AIUsage table
// Feature: 'qr_optimization'
// Model: 'gpt-4-turbo-preview'
```

### Monthly Reset
Credits reset automatically on the 1st of each month via:
- Database query filters by `createdAt >= startOfMonth`
- No manual reset needed
- Usage accumulates within billing cycle

## Upgrade Flow

### Free Plan Users
```
Button shows: "AI Optimize" (disabled)
On click: Shows upgrade modal
Message: "Unlock AI Optimization"
Plans shown: Pro (50), Business (200), Agency (∞)
CTA: "Upgrade Now" → /pricing
```

### Exhausted Credits
```
Button shows: "AI Optimize" with "0" badge
On click: Shows upgrade modal
Message: "You've used all your AI credits"
Current plan highlighted
CTA: "Upgrade to Business for 200/month"
```

## Design System

### Colors
- **Primary Gradient**: Purple #7c3aed → Pink #ec4899
- **Impact High**: Red #dc2626
- **Impact Medium**: Orange #ea580c
- **Impact Low**: Blue #2563eb
- **Success**: Green #16a34a

### Icons
- Sparkles ✨ - AI features
- Check ✓ - Completed steps
- Arrow → - Improvements
- Crown 👑 - Upgrade prompt
- Chart 📊, Phone 📱, etc. - Contextual

### Animations
- Progress steps: Stagger 100ms each
- Score transition: Smooth number animation
- Card hover: Subtle shadow increase
- Badge pulse: Attention-grabbing

## Error Handling

### Graceful Degradation
1. **No OpenAI Key** → "AI service configuration error"
2. **Rate Limit** → "AI service temporarily busy"
3. **Invalid QR ID** → "QR code not found"
4. **No Scan Data** → Helpful guidance to gather data
5. **Network Error** → "Please try again"

### User Feedback
- Toast notifications for all actions
- Inline error messages in modal
- Helpful suggestions even on errors
- Clear upgrade paths

## Analytics & Monitoring

### Tracked Metrics
- Total optimizations per user
- Token usage (prompt + completion)
- Cost per optimization
- Feature adoption by plan
- Average credits used per month
- Most common user goals

### Database Schema
```prisma
model AIUsage {
  id               String
  userId           String
  feature          String  // 'qr_optimization'
  model            String  // 'gpt-4-turbo-preview'
  promptTokens     Int
  completionTokens Int
  totalTokens      Int
  cost             Float
  createdAt        DateTime
}
```

## Best Practices

### For Users
1. **Be Specific**: Detailed goals = better suggestions
2. **Have Data**: At least 10-20 scans recommended
3. **Review All Suggestions**: Even low-impact items help
4. **Test Changes**: Apply suggestions incrementally
5. **Track Results**: Monitor improvement after changes

### For Developers
1. **Rate Limiting**: Already enforced at plan level
2. **Cost Monitoring**: Track token usage and costs
3. **Error Logging**: Log OpenAI errors separately
4. **Cache Results**: Consider caching for same QR + goal
5. **Feedback Loop**: Collect user ratings on suggestions

## Testing

### Manual Testing Checklist
- [ ] Free user sees upgrade prompt immediately
- [ ] Pro user can analyze with credit deduction
- [ ] Credits display updates after use
- [ ] QR with 0 scans gets helpful guidance
- [ ] QR with data gets AI suggestions
- [ ] Progress animation completes smoothly
- [ ] Upgrade modal shows correct plan details
- [ ] Credits badge shows remaining count
- [ ] Error messages are user-friendly
- [ ] "Try Another Goal" resets form

### Test Scenarios

#### Scenario 1: Happy Path (Pro User)
```
1. User has Pro plan with 50 credits
2. Opens QR details page
3. Clicks "AI Optimize" button
4. Enters goal: "Increase restaurant dinner scans"
5. Watches progress animation
6. Sees 4 suggestions with high/medium impact
7. Reviews +30% estimated increase
8. Credits decrease to 49
9. Clicks "Done"
```

#### Scenario 2: Free User
```
1. User has Free plan
2. Button shows but disabled or with Pro badge
3. Clicks button
4. Sees upgrade modal with plan comparison
5. Clicks "Upgrade Now"
6. Redirects to /pricing
```

#### Scenario 3: Exhausted Credits
```
1. Pro user has used all 50 credits
2. Button shows with "0" badge
3. Clicks button
4. Sees upgrade modal
5. Message: "You've used all your credits"
6. Shows Business plan option (200 credits)
```

#### Scenario 4: Insufficient Data
```
1. User has brand new QR code (0 scans)
2. Enters goal and clicks Analyze
3. Gets message: "Need at least a few scans"
4. Shows suggestion to share QR code first
5. No credits deducted
```

## Future Enhancements

### V2 Features
- [ ] **A/B Testing Integration**: Test suggested changes
- [ ] **Auto-Apply**: One-click implementation of suggestions
- [ ] **Historical Tracking**: Compare before/after metrics
- [ ] **Goal Templates**: Pre-written common goals
- [ ] **Success Stories**: Show real improvement examples
- [ ] **Batch Optimization**: Analyze multiple QR codes
- [ ] **Scheduled Re-analysis**: Monthly check-ins
- [ ] **Custom Rules**: User-defined optimization priorities

### AI Improvements
- [ ] Fine-tune on QR code optimization data
- [ ] Learn from successful implementations
- [ ] Industry-specific recommendations
- [ ] Competitive analysis integration
- [ ] Predictive trend analysis

## Troubleshooting

### "AI service configuration error"
**Problem**: OpenAI API key not set or invalid
**Solution**: Set `OPENAI_API_KEY` in `.env`

### "No AI optimization credits remaining"
**Problem**: User exhausted monthly limit
**Solution**: Wait for month reset or upgrade plan

### "Insufficient data"
**Problem**: QR code has too few scans
**Solution**: Share QR code, gather data, try again

### Credits not updating
**Problem**: Cache or state issue
**Solution**: Refresh page, check `/api/ai/credits` directly

### Slow response times
**Problem**: OpenAI API latency
**Solution**: Progress animation masks wait time (by design)

## Support

### For Users
- In-app tooltips explain each feature
- "?" icon next to credits shows plan details
- Upgrade modals show clear pricing
- Contact support link in error messages

### For Developers
- Comprehensive logging in dev mode
- Error boundaries catch React errors
- API returns structured error messages
- Token usage logged for cost tracking

---

## Summary

This feature provides an **intelligent, user-friendly AI assistant** that helps users improve their QR code performance through data-driven suggestions, while enforcing plan-based usage limits and encouraging upgrades through strategic upgrade prompts.

**Key Benefits:**
- 🎯 **Actionable**: Specific improvements, not generic advice
- 📈 **Measurable**: Estimated impact percentages
- 💰 **Monetizable**: Clear upgrade path from free → pro
- 🎨 **Delightful**: Beautiful UI with smooth animations
- 🔒 **Controlled**: Strict usage limits per plan tier
