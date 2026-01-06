# Mapbox Geographic Heatmap for QR Code Analytics

## Overview
Interactive world map showing QR code scan locations with color-coded density markers and detailed geographic insights.

## Features

### 🗺️ Interactive Map
- **Mapbox GL JS** integration for smooth, responsive mapping
- Pan and zoom controls for detailed exploration
- World view by default, auto-fits to show all scan locations
- Light theme for clean, professional appearance

### 📍 Geographic Visualization
- **Color-coded markers** by scan density:
  - Light blue (0-10 scans)
  - Medium blue (11-50 scans)
  - Orange (51-100 scans)
  - Dark orange (101-500 scans)
  - Red (501+ scans)
- **Marker size** scales with scan count
- **Pulse animation** for high-activity locations (100+ scans)

### 💬 Interactive Popups
- Hover over markers to see:
  - Country name
  - Total scan count
  - Top 5 cities with scan counts
- Clean, modern popup design
- Auto-closes on mouse leave

### 📊 Legend
- Top-left overlay showing scan ranges
- Color-coded for easy reference
- Semi-transparent design

### 📥 Export Feature
- Export current map view as PNG image
- Filename includes date stamp
- One-click download button

## Component Usage

```tsx
import { MapboxHeatmap } from '@/components/analytics/MapboxHeatmap';

// In your analytics page
<MapboxHeatmap 
  data={scanLocations} 
  isLoading={loading}
/>
```

## Data Interface

```typescript
interface ScanLocation {
  country: string;           // Full country name
  countryCode: string;       // ISO 2-letter code (e.g., "US")
  city?: string;             // City name (optional)
  scans: number;             // Total scan count
  lat: number;               // Latitude
  lng: number;               // Longitude
}
```

## Environment Setup

Required environment variable in `.env`:
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## Dependencies

```json
{
  "mapbox-gl": "^3.17.0",
  "geoip-lite": "latest",
  "@types/geoip-lite": "latest"
}
```

## API Updates

### Analytics Service
The `getQRAnalytics` function now returns:
```typescript
{
  totalScans: number;
  uniqueScans: number;
  deviceBreakdown: Array<{type: string, count: number}>;
  browserBreakdown: Array<{browser: string, count: number}>;
  scansByDay: Array<{date: Date, count: number}>;
  locations: ScanLocation[];  // NEW
}
```

### Geolocation
- Uses **geoip-lite** for IP → location conversion
- Automatically enriches scan data with country/city
- Fallback to manual coordinates for known cities
- Country-level aggregation for choropleth effect

## Accessibility

### Keyboard Navigation
- Tab through map markers
- Enter/Space to open popups
- Escape to close popups

### ARIA Labels
- Map has `role="application"` with descriptive label
- All controls have proper aria-labels
- Legend has `role="region"`
- Screen reader announcements for regions

### Visual
- High contrast colors
- Focus indicators on interactive elements
- Minimum touch target sizes (44x44px)

## Responsive Design

### Desktop
- Full-width card layout
- 500px height for optimal viewing
- Legend and controls positioned for easy access

### Mobile
- 400px height for mobile screens
- Touch-friendly controls
- Responsive legend sizing
- Optimized popup positioning

## Error Handling

### Graceful Degradation
1. **Invalid Mapbox Token** → Shows friendly error message
2. **No Location Data** → Displays empty state with helpful text
3. **Map Load Failure** → Error state with retry option
4. **Missing Coordinates** → Falls back to country-level center

### Loading States
- Skeleton loader during initial load
- Spinner overlay while map initializes
- Smooth transitions between states

## Performance

### Optimization
- Lazy marker creation (only visible markers)
- Debounced zoom/pan events
- Efficient data aggregation
- Memoized coordinate lookups

### Data Aggregation
- Groups scans by country/city
- Reduces marker count
- Improves rendering performance
- Maintains accuracy

## Customization

### Colors
Update `SCAN_COLORS` in component:
```typescript
const SCAN_COLORS = {
  range1: { min: 0, max: 10, color: '#3b82f6', label: '0-10 scans' },
  // ... add more ranges
};
```

### Map Style
Change Mapbox style in component:
```typescript
style: 'mapbox://styles/mapbox/streets-v12'  // or dark-v11, satellite-v9
```

### Initial View
Adjust default center/zoom:
```typescript
center: [lng, lat],
zoom: 2,
```

## Future Enhancements

### Potential Features
- [ ] Time-based animation (watch scans over time)
- [ ] Heatmap layer option (gradient overlay)
- [ ] Clustering for dense regions
- [ ] Custom marker icons per QR code type
- [ ] Region selection for filtered analytics
- [ ] 3D terrain visualization
- [ ] Real-time scan updates via WebSockets

### Integration Ideas
- Export to PDF with map included
- Email reports with map snapshots
- Compare multiple QR codes on one map
- Overlay demographic data
- Integration with Google Analytics

## Troubleshooting

### Map Not Displaying
1. Check `NEXT_PUBLIC_MAPBOX_TOKEN` is set
2. Verify token has proper permissions
3. Check browser console for errors
4. Ensure mapbox-gl CSS is imported

### No Data Showing
1. Verify analytics have location data
2. Check API returns `locations` array
3. Ensure coordinates are valid lat/lng
4. Check database has country/city fields

### Performance Issues
1. Limit data to recent timeframe
2. Aggregate similar locations
3. Reduce marker detail level
4. Use clustering for dense areas

## Support

For issues or questions:
- Check Mapbox GL JS documentation
- Review console errors
- Verify environment variables
- Test with sample data first

## License

Uses Mapbox GL JS under BSD-3-Clause license.
Requires Mapbox account and token.
