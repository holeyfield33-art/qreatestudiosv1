# AI Optimization Quick Start Guide

Get started with AI-powered QR code optimization in 5 minutes.

## Prerequisites
- ✅ Qreate Studios platform installed
- ✅ OpenAI API account
- ✅ Active QR codes in database

## 1. Setup OpenAI API Key (2 minutes)

### Get Your API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Add to Environment
```bash
# Edit .env file
echo "OPENAI_API_KEY=sk-your-api-key-here" >> .env
```

### Restart Server
```bash
npm run dev
```

## 2. Optimize Your First QR Code (1 minute)

### Navigate to QR Code
1. Open dashboard: `http://localhost:3000/dashboard`
2. Click "QR Codes" in sidebar
3. Select any QR code from list
4. Click **"🤖 AI Optimize"** button (yellow gradient)

### View Results
You'll see 4 tabs with instant insights:
- **Recommendations**: Design improvements + score
- **Link Health**: URL status + alternatives
- **Predictions**: Scan forecasts + trends
- **A/B Testing**: Test ideas + variants

## 3. Common Use Cases (2 minutes)

### 📱 Smart App Redirect
**Scenario**: QR code downloads your app

**Setup**:
```typescript
// In QR code settings
Type: APP_DOWNLOAD
Metadata: {
  "appStoreUrl": "https://apps.apple.com/app/your-app",
  "playStoreUrl": "https://play.google.com/store/apps/your-app",
  "websiteUrl": "https://yoursite.com"
}
```

**Result**: 
- iOS users → App Store
- Android users → Play Store  
- Desktop → Website

### 🌍 Auto-Translate Content
**API Call**:
```bash
curl -X POST http://localhost:3000/api/ai/translate \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Welcome to our restaurant!",
    "targetLanguage": "es",
    "autoDetect": true
  }'
```

**Response**:
```json
{
  "translated": "¡Bienvenido a nuestro restaurante!",
  "sourceLanguage": "en",
  "targetLanguage": "es"
}
```

### 🔧 Check Link Health
**API Call**:
```bash
curl -X POST http://localhost:3000/api/ai/check-link \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-qr-target.com"
  }'
```

**Response**:
```json
{
  "isHealthy": true,
  "statusCode": 200,
  "suggestions": ["✅ Link is working perfectly"]
}
```

### 📈 Predict Scan Rates
**Navigate to**: Dashboard → QR Code → AI Optimize → Predictions

**See**:
- Predicted daily scans: 125
- Confidence: 85%
- Trend: ↗️ Increasing
- Factors: Location, design, content type

### 🎨 Optimize Design
**Navigate to**: Dashboard → QR Code → AI Optimize → Recommendations

**Get**:
- Performance score: 78/100
- Color contrast suggestions
- Size recommendations
- Error correction tips
- AI-powered insights

## 4. Test All Features

### Run Quick Tests
```bash
# Test 1: QR Optimization
curl -X POST http://localhost:3000/api/ai/optimize-qr \
  -H "Content-Type: application/json" \
  -d '{
    "foregroundColor": "#000000",
    "backgroundColor": "#FFFFFF",
    "size": 200,
    "errorCorrectionLevel": "M",
    "redirectUrl": "https://example.com",
    "type": "URL"
  }'

# Test 2: SEO Optimization
curl -X POST http://localhost:3000/api/ai/optimize-seo \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Check out our new product!",
    "title": "New Product Launch"
  }'

# Test 3: Scan Prediction
curl -X POST http://localhost:3000/api/ai/predict \
  -H "Content-Type: application/json" \
  -d '{
    "qrCodeId": "your-qr-code-id",
    "qrCodeData": {
      "placement": "high-traffic",
      "hasCustomDesign": true,
      "size": 300,
      "type": "LANDING_PAGE"
    }
  }'
```

## 5. Dashboard Features

### Performance Score
- **Green (85-100)**: Excellent - no changes needed
- **Yellow (70-84)**: Good - minor improvements
- **Red (0-69)**: Needs optimization

### Quick Fixes
Click recommendations to see:
- Exact color codes to use
- Optimal size settings
- Error correction levels
- AI improvement ideas

### Refresh Data
Click refresh button (circular arrow) to re-analyze with latest data.

## API Endpoints Reference

| Feature | Endpoint | Method |
|---------|----------|--------|
| Design Optimization | `/api/ai/optimize-qr` | POST |
| Link Health Check | `/api/ai/check-link` | POST |
| Content Translation | `/api/ai/translate` | POST |
| SEO Optimization | `/api/ai/optimize-seo` | POST |
| Scan Prediction | `/api/ai/predict` | POST |
| A/B Test Ideas | `/api/ai/ab-test` | POST |

## Language Codes

Supported languages for translation:
- `en` - English
- `es` - Spanish
- `fr` - French
- `de` - German
- `zh` - Chinese
- `ja` - Japanese
- `pt` - Portuguese
- `it` - Italian
- `ru` - Russian
- `ar` - Arabic

## Tips for Best Results

### Design Optimization
- Use high contrast colors (black on white is best)
- Minimum 200x200px size
- Error correction level H for logos
- Keep URLs short and simple

### Link Health
- Test links before printing QR codes
- Use HTTPS (more secure)
- Avoid redirect chains
- Check alternative URLs if main fails

### Predictions
- Need 7+ days of data for accuracy
- Update placement metadata
- Mark high-traffic locations
- Track scan analytics

### Translations
- Keep content under 2000 characters
- Use simple language
- Check formatting after translation
- Test with native speakers

## Troubleshooting

### "OpenAI API Error"
→ Check `.env` file has valid `OPENAI_API_KEY`

### "Link Health Check Failed"
→ Verify URL works in browser first

### "No Prediction Data"
→ QR code needs scan history (7+ days)

### "Translation Not Working"
→ Check language code is valid (e.g., 'es' not 'spanish')

## Cost Estimates

Based on OpenAI gpt-4o-mini pricing:

| Action | Tokens | Cost |
|--------|--------|------|
| Optimize design | ~500 | $0.000075 |
| Translate (200 words) | ~300 | $0.000045 |
| SEO optimization | ~600 | $0.000090 |
| 1,000 optimizations | - | ~$0.08 |

**Monthly estimate**: $5-20 for typical usage

## Next Steps

1. **Read Full Docs**: See `AI_OPTIMIZATION_SYSTEM_COMPLETE.md`
2. **Explore Dashboard**: Try all 4 tabs
3. **Test with Real QR Codes**: Monitor improvements
4. **Review Analytics**: Track scan rate changes
5. **Set Up Alerts**: Monitor link health automatically

## Quick Command Reference

```bash
# Start server
npm run dev

# Check OpenAI key
echo $OPENAI_API_KEY

# Test translation API
curl -X POST http://localhost:3000/api/ai/translate \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello", "targetLanguage": "es"}'

# Test link health
curl -X POST http://localhost:3000/api/ai/check-link \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## Support

- Full Documentation: `AI_OPTIMIZATION_SYSTEM_COMPLETE.md`
- API Reference: See docs above
- GitHub Issues: Report bugs
- OpenAI Status: [status.openai.com](https://status.openai.com)

---

**Ready to optimize!** 🚀  
Start by clicking the **"🤖 AI Optimize"** button on any QR code.
