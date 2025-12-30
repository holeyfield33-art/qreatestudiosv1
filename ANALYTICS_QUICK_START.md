# Advanced Analytics Quick Start

## 🚀 Get Started in 3 Steps

### 1. Dependencies Already Installed ✅
```bash
npm install recharts jspdf jspdf-autotable papaparse date-fns @types/papaparse
```

### 2. Access the Dashboard
Navigate to your QR code analytics:
```
/dashboard/analytics/advanced/[qrCodeId]
```

Replace `[qrCodeId]` with your actual QR code ID.

### 3. Use the Features

#### View Analytics
- Summary cards show key metrics
- Interactive charts display trends
- Date range filter customizes view

#### Export Data
- Click "Export PDF" for comprehensive report
- Click "Export CSV" for raw scan data
- Click "Export Time Series" for daily aggregates

## 📊 What You'll See

### Summary Metrics
- **Total Scans**: All scans in date range
- **Unique Users**: Distinct IP addresses
- **Peak Hour**: Busiest hour (0-23)
- **Peak Day**: Busiest day of week

### Charts
1. **Scans Over Time**: Line chart showing daily trends
2. **Scans by Hour**: Bar chart of 24-hour distribution
3. **Scans by Day**: Bar chart of weekly pattern
4. **Device Types**: Pie chart of device breakdown
5. **Browsers**: Pie chart of browser usage
6. **Top Locations**: List of top 10 cities

## 🎯 Common Use Cases

### Compare Performance
1. Note QR code IDs you want to compare
2. Use comparison API:
```bash
POST /api/analytics/compare
{
  "qrCodeIds": ["id1", "id2"],
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Generate Reports
1. Set date range to reporting period
2. Click "Export PDF"
3. Share with stakeholders

### Track Campaign
1. Set start date to campaign launch
2. Monitor time series chart
3. Check device/location stats

## 🔧 API Examples

### Fetch Analytics
```typescript
const response = await fetch(
  `/api/analytics/advanced/${qrCodeId}?startDate=${start}&endDate=${end}`
);
const { analytics } = await response.json();
```

### Export PDF
```typescript
const response = await fetch(
  `/api/analytics/export/${qrCodeId}?format=pdf`
);
const blob = await response.blob();
// Download logic here
```

### Compare QR Codes
```typescript
const response = await fetch('/api/analytics/compare', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    qrCodeIds: ['id1', 'id2'],
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  })
});
const { comparisons } = await response.json();
```

## ♿ Accessibility

All features are fully accessible:
- Keyboard navigation works everywhere
- Screen readers can read all charts via data tables
- High contrast mode supported
- Focus indicators on all interactive elements

## 📱 Responsive Design

Works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## ⚡ Performance Tips

1. **Limit Date Range**: Smaller ranges load faster
2. **Export Off-Peak**: Large exports during low traffic
3. **Cache Results**: Store analytics data if repeatedly viewed
4. **Paginate Locations**: Only top 10 shown by default

## 🐛 Troubleshooting

**Charts not showing?**
- Check browser console for errors
- Ensure QR code has scan data
- Verify date range includes scans

**Export not downloading?**
- Check pop-up blocker
- Verify file permissions
- Try different browser

**No data showing?**
- Confirm QR code ownership
- Check date range settings
- Verify scans exist in database

## 🎨 Customization

### Change Colors
Edit colors in [page.tsx](app/dashboard/analytics/advanced/[qrCodeId]/page.tsx):
```typescript
const COLORS = ['#2563EB', '#7C3AED', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];
```

### Modify Charts
Using recharts library - see [recharts.org](https://recharts.org) for options.

### Add New Metrics
1. Extend `getAdvancedAnalytics()` in [analytics-enhancement.ts](lib/services/analytics-enhancement.ts)
2. Update API response type
3. Display in UI

## 📖 Documentation

Full documentation: [ADVANCED_ANALYTICS_COMPLETE.md](ADVANCED_ANALYTICS_COMPLETE.md)

## ✅ Production Ready

- ✅ Next.js 15.5 compatible (async params)
- ✅ TypeScript strict mode
- ✅ WCAG AA accessible
- ✅ Responsive design
- ✅ Error handling
- ✅ Security (authentication, authorization)
- ✅ Performance optimized
