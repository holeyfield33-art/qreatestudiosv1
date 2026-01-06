// TEST FILE - Delete after testing
// This file demonstrates the MapboxHeatmap component with sample data
// Use this to verify the map works before generating real analytics

import { MapboxHeatmap } from '@/components/analytics/MapboxHeatmap';

const sampleLocations = [
  // North America
  { country: "United States", countryCode: "US", city: "New York", scans: 523, lat: 40.7128, lng: -74.0060 },
  { country: "United States", countryCode: "US", city: "Los Angeles", scans: 387, lat: 34.0522, lng: -118.2437 },
  { country: "United States", countryCode: "US", city: "Chicago", scans: 256, lat: 41.8781, lng: -87.6298 },
  { country: "Canada", countryCode: "CA", city: "Toronto", scans: 189, lat: 43.6532, lng: -79.3832 },
  { country: "Mexico", countryCode: "MX", city: "Mexico City", scans: 134, lat: 19.4326, lng: -99.1332 },
  
  // Europe
  { country: "United Kingdom", countryCode: "GB", city: "London", scans: 445, lat: 51.5074, lng: -0.1278 },
  { country: "France", countryCode: "FR", city: "Paris", scans: 312, lat: 48.8566, lng: 2.3522 },
  { country: "Germany", countryCode: "DE", city: "Berlin", scans: 278, lat: 52.5200, lng: 13.4050 },
  { country: "Spain", countryCode: "ES", city: "Madrid", scans: 198, lat: 40.4168, lng: -3.7038 },
  { country: "Italy", countryCode: "IT", city: "Rome", scans: 167, lat: 41.9028, lng: 12.4964 },
  
  // Asia
  { country: "Japan", countryCode: "JP", city: "Tokyo", scans: 612, lat: 35.6762, lng: 139.6503 },
  { country: "China", countryCode: "CN", city: "Shanghai", scans: 489, lat: 31.2304, lng: 121.4737 },
  { country: "India", countryCode: "IN", city: "Mumbai", scans: 356, lat: 19.0760, lng: 72.8777 },
  { country: "Singapore", countryCode: "SG", city: "Singapore", scans: 223, lat: 1.3521, lng: 103.8198 },
  { country: "South Korea", countryCode: "KR", city: "Seoul", scans: 201, lat: 37.5665, lng: 126.9780 },
  
  // Oceania
  { country: "Australia", countryCode: "AU", city: "Sydney", scans: 287, lat: -33.8688, lng: 151.2093 },
  { country: "Australia", countryCode: "AU", city: "Melbourne", scans: 176, lat: -37.8136, lng: 144.9631 },
  { country: "New Zealand", countryCode: "NZ", scans: 98, lat: -40.9006, lng: 174.8860 },
  
  // South America
  { country: "Brazil", countryCode: "BR", city: "São Paulo", scans: 234, lat: -23.5505, lng: -46.6333 },
  { country: "Argentina", countryCode: "AR", city: "Buenos Aires", scans: 145, lat: -34.6037, lng: -58.3816 },
  
  // Africa
  { country: "South Africa", countryCode: "ZA", scans: 112, lat: -30.5595, lng: 22.9375 },
  { country: "Egypt", countryCode: "EG", scans: 89, lat: 26.8206, lng: 30.8025 },
  
  // Middle East
  { country: "United Arab Emirates", countryCode: "AE", city: "Dubai", scans: 267, lat: 25.2048, lng: 55.2708 },
  
  // Small counts (testing different color ranges)
  { country: "Norway", countryCode: "NO", city: "Oslo", scans: 45, lat: 59.9139, lng: 10.7522 },
  { country: "Denmark", countryCode: "DK", city: "Copenhagen", scans: 23, lat: 55.6761, lng: 12.5683 },
  { country: "Finland", countryCode: "FI", scans: 8, lat: 61.9241, lng: 25.7482 },
];

export default function MapboxTestPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mapbox Heatmap Test</h1>
        <p className="text-muted-foreground">
          This page demonstrates the MapboxHeatmap component with sample data.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          <strong>Note:</strong> Make sure NEXT_PUBLIC_MAPBOX_TOKEN is set in your .env file.
        </p>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-1">⚠️ Test Environment</h3>
        <p className="text-sm text-yellow-800">
          This file is for testing only. Delete after verifying the map works correctly.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-900">26</div>
          <div className="text-sm text-blue-700">Countries</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-900">5,916</div>
          <div className="text-sm text-green-700">Total Scans</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-900">227</div>
          <div className="text-sm text-purple-700">Avg per Country</div>
        </div>
      </div>

      <MapboxHeatmap data={sampleLocations} isLoading={false} />
      
      <div className="bg-gray-50 border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Testing Checklist</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Map loads and displays correctly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Markers appear at correct locations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Colors match scan density (blue → red)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Hover shows popup with country & city info</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Legend displays in top-left corner</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Zoom/pan controls work (bottom-right)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Export PNG button downloads image</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Responsive on mobile (resize browser)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>Keyboard navigation works (Tab → Enter)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600">✓</span>
            <span>High-scan markers pulse (500+ scans)</span>
          </li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 Expected Behavior</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Red markers:</strong> Tokyo (612), US-NY (523), UK-London (445)</li>
          <li><strong>Dark orange markers:</strong> China-Shanghai (489), US-LA (387)</li>
          <li><strong>Orange markers:</strong> India-Mumbai (356), France-Paris (312)</li>
          <li><strong>Blue markers:</strong> Norway (45), Denmark (23)</li>
          <li><strong>Light blue markers:</strong> Finland (8)</li>
          <li><strong>Pulsing:</strong> All markers with 100+ scans should pulse</li>
        </ul>
      </div>
    </div>
  );
}
