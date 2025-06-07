'use client'

import React, { useEffect, useRef, useState, ReactNode } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export interface BaseMapProps {
  className?: string;
  children?: ReactNode;
  onMapLoad?: (map: mapboxgl.Map) => void;
  bounds?: mapboxgl.LngLatBounds;
  center?: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
  fitBoundsOptions?: {
    padding?: number | mapboxgl.PaddingOptions;
    linear?: boolean;
    easing?: (t: number) => number;
    offset?: mapboxgl.PointLike;
    maxZoom?: number;
  };
}

export default function BaseMap({ 
  className, 
  children, 
  onMapLoad, 
  bounds, 
  center = [2.3, 46.2], 
  zoom = 6,
  pitch = 60,
  bearing = 0,
  fitBoundsOptions = { padding: 50 }
}: BaseMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    // Check if Mapbox token is available
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox access token is required. Please set NEXT_PUBLIC_MAPBOX_TOKEN environment variable.');
      return;
    }

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;

    const mapConfig: mapboxgl.MapboxOptions = {
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      pitch,
      bearing
    };

    // Set either bounds or center/zoom
    if (bounds && !bounds.isEmpty()) {
      mapConfig.bounds = bounds;
      mapConfig.fitBoundsOptions = fitBoundsOptions;
    } else {
      mapConfig.center = center;
      mapConfig.zoom = zoom;
    }

    try {
      map.current = new mapboxgl.Map(mapConfig);
    } catch (error) {
      console.error('Failed to initialize Mapbox map:', error);
      try {
        map.current = new mapboxgl.Map({
          ...mapConfig,
          style: 'mapbox://styles/mapbox/satellite-v9'
        });
      } catch (fallbackError) {
        console.error('Failed to initialize fallback map:', fallbackError);
        return;
      }
    }

    // Add error handling for map style loading
    map.current.on('error', (e) => {
      console.error('Mapbox GL error:', e.error);
    });

    map.current.on('load', () => {
      if (!map.current) return;

      try {
        // Enable 3D terrain (optional)
        map.current.addSource('mapbox-terrain', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.terrain-rgb'
        });

        map.current.setTerrain({
          source: 'mapbox-terrain',
          exaggeration: 1.2
        });
      } catch (error) {
        console.warn('Terrain not available:', error);
      }

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      setIsLoaded(true);

      // Call the onMapLoad callback if provided
      if (onMapLoad) {
        onMapLoad(map.current);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [bounds, center, zoom, pitch, bearing, onMapLoad, fitBoundsOptions]);

  // if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  //   return (
  //     <div className={className} style={{
  //       display: 'flex',
  //       flexDirection: 'column',
  //       alignItems: 'center',
  //       justifyContent: 'center',
  //       backgroundColor: 'var(--color-surface)',
  //       border: '1px solid var(--color-border)',
  //       borderRadius: 'var(--border-radius-lg)',
  //       color: 'var(--color-text-secondary)',
  //       fontSize: 'var(--font-size-sm)',
  //       padding: 'var(--space-6)',
  //       textAlign: 'center',
  //       gap: 'var(--space-2)'
  //     }}>
  //       <div>📍 Map not available</div>
  //       <div style={{fontSize: 'var(--font-size-xs)'}}>
  //         Mapbox access token required. Please set NEXT_PUBLIC_MAPBOX_TOKEN environment variable.
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={className} style={{ position: 'relative' }}>
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: 'var(--border-radius-lg)',
          overflow: 'hidden'
        }} 
      />
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(248, 250, 252, 0.9)',
          borderRadius: 'var(--border-radius-lg)',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)'
        }}>
          Loading map...
        </div>
      )}
      
      {/* Render children (legends, etc.) */}
      {children}
    </div>
  );
}