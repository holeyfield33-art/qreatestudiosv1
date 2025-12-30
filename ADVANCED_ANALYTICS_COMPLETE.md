# Advanced Analytics Dashboard

A comprehensive analytics dashboard for Qreate Studios with interactive charts, data visualization, and export capabilities.

## Features

### 📊 Interactive Charts
- **Time Series Line Chart**: Track scans over time with interactive tooltips
- **Hourly Distribution Bar Chart**: See which hours of the day are most active
- **Day of Week Analysis**: Identify peak days for QR code scans
- **Device Type Pie Chart**: Visualize device distribution (mobile, desktop, tablet)
- **Browser Distribution**: Analyze which browsers users are scanning from

### 🗺️ Geographic Analytics
- Top 10 scanning locations with city and country
- Scan count per location
- Hover effects for better UX

### 📈 Key Metrics
- **Total Scans**: Aggregate scan count
- **Unique Users**: Based on IP address fingerprinting
- **Peak Hour**: Most active hour with scan count
- **Peak Day**: Most active day of the week

### 📅 Date Range Filtering
- Custom date range selection
- Start and end date pickers
- Real-time analytics updates
- Default: Last 30 days

### 💾 Export Features
- **PDF Export**: Comprehensive report with all analytics
- **CSV Export**: Raw scan data with all fields
- **Time Series CSV**: Aggregated daily scan counts
- One-click download with proper file naming

### ♿ Accessibility (WCAG AA)
- All charts have ARIA labels and roles
- Screen reader compatible with text alternatives
- Keyboard navigation support
- Data tables alongside visual charts
- High contrast support
- Focus indicators on interactive elements

## File Structure

```
lib/services/
├── analytics-enhancement.ts    # Advanced analytics calculations
└── export-service.ts           # PDF and CSV export utilities

app/api/analytics/
├── advanced/[qrCodeId]/route.ts  # GET advanced analytics
├── export/[qrCodeId]/route.ts    # GET export data
└── compare/route.ts              # POST compare multiple QR codes

app/dashboard/analytics/
└── advanced/[qrCodeId]/page.tsx  # Main UI dashboard
```

## API Routes

### GET `/api/analytics/advanced/[qrCodeId]`
Fetch advanced analytics for a QR code.

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "qrCode": {
    "id": "qr123",
    "name": "My QR Code"
  },
  "analytics": {
    "totalScans": 1234,
    "uniqueUsers": 456,
    "scansByHour": [...],
    "scansByDayOfWeek": [...],
    "timeSeriesData": [...],
    "deviceStats": {...},
    "browserStats": {...},
    "geoData": [...],
    "peakHour": { "hour": 14, "count": 89 },
    "peakDay": { "day": "Wed", "count": 234 }
  }
}
```

### GET `/api/analytics/export/[qrCodeId]`
Export analytics data in various formats.

**Query Parameters:**
- `format`: `pdf`, `csv`, or `csv-timeseries`
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Response:** Binary file download

### POST `/api/analytics/compare`
Compare analytics across multiple QR codes.

**Request Body:**
```json
{
  "qrCodeIds": ["qr1", "qr2", "qr3"],
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-12-31T23:59:59.999Z"
}
```

## Usage

### View Advanced Analytics
Navigate to `/dashboard/analytics/advanced/[qrCodeId]`

### Change Date Range
1. Select start date
2. Select end date
3. Click "Apply Filter"

### Export Data
1. Choose export format:
   - **Export PDF**: Complete analytics report
   - **Export CSV**: Raw scan data with all fields
   - **Export Time Series**: Daily aggregated data
2. File downloads automatically

## Dependencies

```json
{
  "recharts": "^2.x",
  "jspdf": "^2.x",
  "jspdf-autotable": "^3.x",
  "papaparse": "^5.x",
  "date-fns": "^3.x",
  "@types/papaparse": "^5.x"
}
```

## Analytics Calculations

### Unique Users
Counted using unique IP addresses within the date range.

### Peak Detection
- Peak hour: Hour with maximum scan count (0-23)
- Peak day: Day of week with maximum scans

### Geographic Grouping
Scans are grouped by city and country, sorted by count.

### Device/Browser Stats
Aggregated from user agent parsing in the analytics tracking system.

## Security

- All routes require authentication via NextAuth
- QR code ownership is verified before displaying analytics
- SQL injection protection via Prisma ORM
- Rate limiting recommended for export endpoints

## Performance

- Data is fetched on-demand, not real-time
- Large datasets are paginated (top 10 locations)
- Chart rendering is optimized with ResponsiveContainer
- Export operations run server-side to avoid client memory issues

## Browser Support

- Modern browsers with ES2020+ support
- Responsive design for mobile, tablet, and desktop
- Chart interactivity requires JavaScript enabled

## Next.js 15.5 Compatibility

✅ All route params are properly awaited (async)
✅ Using NextAuth v5 (Auth.js) pattern
✅ Server components where appropriate
✅ Client components marked with 'use client'

## Accessibility Features

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **Screen Readers**: Charts have ARIA labels and text alternatives
3. **Color Contrast**: WCAG AA compliant color schemes
4. **Focus Management**: Clear focus indicators
5. **Semantic HTML**: Proper heading hierarchy and landmarks
6. **Alternative Text**: All visualizations have text equivalents
7. **Data Tables**: Accessible tables alongside charts

## Future Enhancements

- [ ] Real-time updates via WebSocket
- [ ] Heat map visualization of geographic data
- [ ] A/B testing comparison tools
- [ ] Conversion funnel analysis
- [ ] Custom metric tracking
- [ ] Scheduled report emails
- [ ] Dashboard customization
- [ ] Mobile app integration

## Troubleshooting

### Charts not rendering
- Ensure recharts is properly installed
- Check browser console for errors
- Verify data format matches expected structure

### Export failing
- Check file permissions
- Verify jsPDF and papaparse are installed
- Check browser pop-up blocker settings

### Authentication errors
- Verify NextAuth configuration
- Check session middleware
- Ensure user owns the QR code

## Support

For issues or questions, please contact support or file an issue in the repository.
