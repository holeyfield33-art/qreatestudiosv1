'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export interface ScanLocation {
  country: string;
  countryCode: string; // ISO 2-letter
  city?: string;
  scans: number;
  lat: number;
  lng: number;
}

export interface MapboxHeatmapProps {
  data: ScanLocation[];
  isLoading?: boolean;
}

// Color gradient based on scan ranges
const SCAN_COLORS = {
  range1: { min: 0, max: 10, color: '#3b82f6', label: '0-10 scans' },      // Light blue
  range2: { min: 11, max: 50, color: '#2563eb', label: '11-50 scans' },    // Medium blue
  range3: { min: 51, max: 100, color: '#f97316', label: '51-100 scans' },  // Orange
  range4: { min: 101, max: 500, color: '#ea580c', label: '101-500 scans' }, // Dark orange
  range5: { min: 501, max: Infinity, color: '#dc2626', label: '501+ scans' }, // Red
};

function getColorForScans(scans: number): string {
  if (scans <= SCAN_COLORS.range1.max) return SCAN_COLORS.range1.color;
  if (scans <= SCAN_COLORS.range2.max) return SCAN_COLORS.range2.color;
  if (scans <= SCAN_COLORS.range3.max) return SCAN_COLORS.range3.color;
  if (scans <= SCAN_COLORS.range4.max) return SCAN_COLORS.range4.color;
  return SCAN_COLORS.range5.color;
}

function MapLegend() {
  return (
    <div 
      className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-10 border"
      role="region"
      aria-label="Map legend"
    >
      <h4 className="text-xs font-semibold mb-2 text-gray-700">Scan Density</h4>
      <div className="space-y-1">
        {Object.values(SCAN_COLORS).map((range, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div 
              className="w-4 h-4 rounded-sm border border-gray-300"
              style={{ backgroundColor: range.color }}
              aria-hidden="true"
            />
            <span className="text-gray-600">{range.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-64 mb-4" />
      <Skeleton className="h-[500px] w-full rounded-lg" />
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
      <div className="h-[500px] flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
        <div className="text-center space-y-2">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" aria-hidden="true" />
          <p className="text-muted-foreground font-medium">{message}</p>
        </div>
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
      <div className="h-[500px] flex items-center justify-center bg-muted/30 rounded-lg border-2 border-dashed">
        <div className="text-center space-y-2">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" aria-hidden="true" />
          <p className="text-muted-foreground font-medium">No geographic data yet</p>
          <p className="text-sm text-muted-foreground">
            Scans will appear here once location data is available
          </p>
        </div>
      </div>
    </Card>
  );
}

export function MapboxHeatmap({ data, isLoading = false }: MapboxHeatmapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const [mapError, setMapError] = useState<string | null>(
    !mapboxToken ? 'Mapbox token not configured' : null
  );
  const markers = useRef<mapboxgl.Marker[]>([]);

  // Export map as PNG
  const handleExport = () => {
    if (!map.current) return;
    
    try {
      const canvas = map.current.getCanvas();
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to export map');
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-analytics-map-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Map exported successfully');
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export map');
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [0, 20],
        zoom: 2,
        minZoom: 1,
        maxZoom: 18,
      });

      // Add navigation controls
      mapInstance.addControl(
        new mapboxgl.NavigationControl(),
        'bottom-right'
      );

      mapInstance.on('load', () => {
        setMapLoaded(true);
      });

      mapInstance.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError('Failed to load map');
      });

      map.current = mapInstance;
    } catch (error) {
      console.error('Map initialization error:', error);
      queueMicrotask(() => setMapError('Failed to initialize map'));
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Update markers when data changes
  useEffect(() => {
    if (!map.current || !mapLoaded || !data || data.length === 0) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Aggregate scans by country for choropleth effect
    const countryData = data.reduce((acc, location) => {
      const existing = acc.get(location.countryCode);
      if (existing) {
        existing.scans += location.scans;
        if (location.city) {
          existing.cities.push({
            name: location.city,
            scans: location.scans,
          });
        }
      } else {
        acc.set(location.countryCode, {
          country: location.country,
          scans: location.scans,
          lat: location.lat,
          lng: location.lng,
          cities: location.city ? [{ name: location.city, scans: location.scans }] : [],
        });
      }
      return acc;
    }, new Map<string, any>());

    // Create markers for each country
    countryData.forEach((countryInfo, _countryCode) => {
      const color = getColorForScans(countryInfo.scans);
      
      // Create marker element with pulse animation for high-scan locations
      const el = document.createElement('div');
      const size = Math.min(40, Math.max(20, countryInfo.scans / 10));
      el.className = 'cursor-pointer transition-transform hover:scale-110';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.opacity = '0.7';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      
      // Add pulse animation for high-activity locations
      if (countryInfo.scans > 100) {
        el.style.animation = 'pulse 2s ease-in-out infinite';
      }

      // Create popup content
      const topCities = countryInfo.cities
        .sort((a: any, b: any) => b.scans - a.scans)
        .slice(0, 5);
      
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h4 class="font-semibold text-base mb-2">${countryInfo.country}</h4>
          <p class="text-sm mb-2">
            <span class="font-medium">${countryInfo.scans}</span> total scans
          </p>
          ${topCities.length > 0 ? `
            <div class="text-xs text-muted-foreground border-t pt-2 mt-2">
              <p class="font-medium mb-1">Top Cities:</p>
              <ul class="space-y-1">
                ${topCities.map((city: any) => 
                  `<li>${city.name}: ${city.scans} scans</li>`
                ).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        maxWidth: '300px',
      }).setHTML(popupContent);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([countryInfo.lng, countryInfo.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Show popup on hover
      el.addEventListener('mouseenter', () => {
        marker.togglePopup();
      });
      
      el.addEventListener('mouseleave', () => {
        marker.togglePopup();
      });

      // Accessibility
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', 
        `${countryInfo.country}: ${countryInfo.scans} scans. Press Enter for details.`
      );
      
      el.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          marker.togglePopup();
        }
      });

      markers.current.push(marker);
    });

    // Fit map to show all markers if there are any
    if (data.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      data.forEach(location => {
        bounds.extend([location.lng, location.lat]);
      });
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 5,
      });
    }
  }, [data, mapLoaded]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (mapError) {
    return <ErrorState message={mapError} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Geographic Distribution</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleExport}
          className="min-h-[40px]"
          aria-label="Export map as PNG"
        >
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Export PNG
        </Button>
      </div>
      
      <div className="relative w-full h-[500px] md:h-[500px] rounded-lg overflow-hidden border bg-muted">
        <div 
          ref={mapContainer} 
          className="w-full h-full"
          role="application"
          aria-label="Interactive map showing QR code scan locations"
        />
        <MapLegend />
        
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="text-center space-y-2">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-sm text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </div>
      
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { 
            opacity: 0.7;
            transform: scale(1);
          }
          50% { 
            opacity: 1;
            transform: scale(1.1);
          }
        }
        
        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 8px;
        }
        
        .mapboxgl-popup-tip {
          border-top-color: white;
        }
      `}</style>
    </Card>
  );
}
